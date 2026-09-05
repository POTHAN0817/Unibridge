import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from bson import ObjectId
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

from app.database.mongodb import get_challenges_collection

_duplicate_detector_instance: Optional["DuplicateDetector"] = None

# Default similarity threshold for identifying strong duplicate candidates
DEFAULT_DUPLICATE_THRESHOLD = 0.80


def get_duplicate_threshold() -> float:
    """Retrieve configurable duplicate threshold from environment or default."""
    try:
        return float(os.getenv("DUPLICATE_SIMILARITY_THRESHOLD", DEFAULT_DUPLICATE_THRESHOLD))
    except ValueError:
        return DEFAULT_DUPLICATE_THRESHOLD


class DuplicateDetector:
    """
    Semantic Duplicate Detector for UniBridge (Phase 2B).
    - Encodes normalized challenge text using sentence-transformers ('all-MiniLM-L6-v2').
    - Compares incoming challenge vector against existing challenges in MongoDB Atlas.
    - Calculates cosine similarities using scikit-learn.
    - Identifies duplicate candidates without fabricating matches.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model_version = "all-MiniLM-L6-v2"
        self._embedder: Optional[SentenceTransformer] = None

    @property
    def embedder(self) -> SentenceTransformer:
        if self._embedder is None:
            self._embedder = SentenceTransformer(self.model_name)
        return self._embedder

    @property
    def model(self) -> SentenceTransformer:
        return self.embedder


    def build_normalized_text(
        self,
        title: str,
        description: str,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        location: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Create rich normalized text representing the core societal problem.
        Uses real challenge content only.
        """
        parts = [title.strip(), description.strip()]
        if category:
            parts.append(f"Domain: {category.strip()}")
        if subcategory:
            parts.append(f"Subcategory: {subcategory.strip()}")
        if location:
            loc_items = [
                location.get("district"),
                location.get("state"),
                location.get("address"),
            ]
            valid_loc = [str(x) for x in loc_items if x]
            if valid_loc:
                parts.append(f"Location: {', '.join(valid_loc)}")

        return ". ".join(parts)

    def generate_embedding(self, text: str, description: Optional[str] = None) -> np.ndarray:
        """Encode text (or title + description) into a normalized 384-dimensional dense vector."""
        if description is not None:
            full_text = f"{text.strip()}. {description.strip()}"
        else:
            full_text = text.strip()
        return self.embedder.encode([full_text], convert_to_numpy=True)[0]

    def calculate_similarity(self, vec_a: Any, vec_b: Any) -> float:
        """Compute cosine similarity between two vector embeddings."""
        a = np.array(vec_a).reshape(1, -1)
        b = np.array(vec_b).reshape(1, -1)
        return float(cosine_similarity(a, b)[0][0])

    def compare_against_database(
        self,
        target_embedding: Any,
        category: Optional[str],
        db_challenges: List[Dict[str, Any]],
        current_challenge_id: str,
        threshold: float = 0.65,
    ) -> List[Dict[str, Any]]:
        """Compare target embedding against a collection of existing challenges."""
        query_vector = np.array(target_embedding).reshape(1, -1)
        candidates = []

        for item in db_challenges:
            item_id = str(item.get("id") or item.get("_id") or "")
            if item_id == current_challenge_id:
                continue

            stored_emb = item.get("embedding")
            if stored_emb and isinstance(stored_emb.get("vector"), list):
                doc_vec = np.array(stored_emb["vector"]).reshape(1, -1)
            else:
                doc_text = self.build_normalized_text(
                    item.get("title", ""),
                    item.get("description", ""),
                    item.get("category"),
                    item.get("subcategory"),
                    item.get("location"),
                )
                doc_vec = self.embedder.encode([doc_text], convert_to_numpy=True)

            score_val = round(float(cosine_similarity(query_vector, doc_vec)[0][0]), 3)
            if score_val >= threshold:
                candidates.append({
                    "challenge_id": item_id,
                    "title": item.get("title", ""),
                    "similarity_score": score_val,
                    "category": item.get("category"),
                })

        candidates.sort(key=lambda x: x["similarity_score"], reverse=True)
        return candidates



    def detect_duplicates(
        self,
        current_challenge_id: str,
        title: str,
        description: str,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        location: Optional[Dict[str, Any]] = None,
        limit: int = 100,
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Execute semantic duplicate detection:
        1. Generate embedding for the current challenge.
        2. Query existing challenges from MongoDB (excluding self).
        3. Compare embeddings using cosine similarity.
        4. Return (duplicate_analysis, embedding_dict).
        """
        norm_text = self.build_normalized_text(title, description, category, subcategory, location)
        query_vector = self.generate_embedding(norm_text)
        embedding_dict = {
            "model": self.model_version,
            "vector": query_vector.tolist(),
        }

        now_iso = datetime.now(timezone.utc).isoformat()
        threshold = get_duplicate_threshold()

        challenges_col = get_challenges_collection()

        # Query existing challenges in MongoDB, excluding current challenge ID
        query_filter: Dict[str, Any] = {}
        if ObjectId.is_valid(current_challenge_id):
            query_filter["_id"] = {"$ne": ObjectId(current_challenge_id)}

        cursor = challenges_col.find(
            query_filter,
            {
                "_id": 1,
                "title": 1,
                "description": 1,
                "category": 1,
                "subcategory": 1,
                "location": 1,
                "embedding": 1,
            },
        ).limit(limit)

        existing_challenges = list(cursor)

        # If no existing challenges exist in DB to compare against
        if not existing_challenges:
            return (
                {
                    "status": "completed",
                    "is_duplicate": False,
                    "highest_similarity": 0.0,
                    "matched_challenge_id": None,
                    "candidates": [],
                    "model_version": self.model_version,
                    "processed_at": now_iso,
                },
                embedding_dict,
            )

        # Collect existing vectors (using stored embedding if available, otherwise encode dynamically)
        existing_vectors = []
        valid_items = []
        texts_to_encode = []
        indices_to_encode = []

        for idx, doc in enumerate(existing_challenges):
            stored_emb = doc.get("embedding")
            if stored_emb and isinstance(stored_emb.get("vector"), list) and len(stored_emb["vector"]) == len(query_vector):
                existing_vectors.append(stored_emb["vector"])
                valid_items.append(doc)
            else:
                doc_text = self.build_normalized_text(
                    doc.get("title", ""),
                    doc.get("description", ""),
                    doc.get("category"),
                    doc.get("subcategory"),
                    doc.get("location"),
                )
                texts_to_encode.append(doc_text)
                indices_to_encode.append(doc)

        if texts_to_encode:
            encoded_batch = self.embedder.encode(texts_to_encode, convert_to_numpy=True)
            for doc, vec in zip(indices_to_encode, encoded_batch):
                existing_vectors.append(vec.tolist())
                valid_items.append(doc)

        if not existing_vectors:
            return (
                {
                    "status": "completed",
                    "is_duplicate": False,
                    "highest_similarity": 0.0,
                    "matched_challenge_id": None,
                    "candidates": [],
                    "model_version": self.model_version,
                    "processed_at": now_iso,
                },
                embedding_dict,
            )

        # Compute cosine similarity
        matrix = np.array(existing_vectors)
        sims = cosine_similarity([query_vector], matrix)[0]  # shape: (num_existing,)

        candidates = []
        for i, score in enumerate(sims):
            score_val = round(float(score), 3)
            # Only keep matches with meaningful similarity (>= 0.65)
            if score_val >= 0.65:
                item = valid_items[i]
                candidates.append(
                    {
                        "challenge_id": str(item["_id"]),
                        "title": item.get("title", ""),
                        "similarity": score_val,
                    }
                )

        candidates.sort(key=lambda x: x["similarity"], reverse=True)

        highest_sim = candidates[0]["similarity"] if candidates else 0.0
        best_match_id = candidates[0]["challenge_id"] if (candidates and highest_sim >= threshold) else None
        is_dup = highest_sim >= threshold

        duplicate_analysis = {
            "status": "completed",
            "is_duplicate": is_dup,
            "highest_similarity": highest_sim,
            "matched_challenge_id": best_match_id,
            "candidates": candidates[:5],
            "model_version": self.model_version,
            "processed_at": now_iso,
        }

        return duplicate_analysis, embedding_dict


def get_duplicate_detector() -> DuplicateDetector:
    """Singleton getter for the DuplicateDetector."""
    global _duplicate_detector_instance
    if _duplicate_detector_instance is None:
        _duplicate_detector_instance = DuplicateDetector()
    return _duplicate_detector_instance


def detect_duplicates(
    current_challenge_id: Optional[str] = None,
    title: str = "",
    description: str = "",
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    location: Optional[Dict[str, Any]] = None,
    challenge_id: Optional[str] = None,
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Convenience helper to run duplicate detection via singleton."""
    cid = current_challenge_id or challenge_id or ""
    return get_duplicate_detector().detect_duplicates(
        current_challenge_id=cid,
        title=title,
        description=description,
        category=category,
        subcategory=subcategory,
        location=location,
    )

