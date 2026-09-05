import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
import spacy
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

from app.database.taxonomy_db import get_all_taxonomy_records
from app.ai.keyword_extractor import extract_keywords, get_spacy_nlp

_analyzer_instance: Optional["ProblemAnalyzer"] = None


class ProblemAnalyzer:
    """
    Production ML Problem Analyzer for UniBridge.
    - Zero hardcoded domain knowledge: loaded dynamically from MongoDB Atlas (ai_taxonomy).
    - Uses sentence-transformers ('all-MiniLM-L6-v2') for dense semantic embeddings.
    - Uses scikit-learn for cosine similarity calculation and vector ranking.
    - Uses numpy and pandas for vectorized tabular embedding indexing.
    - Uses spaCy for linguistic sentence boundary detection and semantic extractive summarization.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model_version = "unibridge-ml-v1"
        self._embedder: Optional[SentenceTransformer] = None
        self._taxonomy_df: Optional[pd.DataFrame] = None
        self._cat_embeddings: Optional[np.ndarray] = None
        self._subcat_embeddings: Optional[np.ndarray] = None
        self._subcat_metadata: List[Dict[str, Any]] = []

    @property
    def embedder(self) -> SentenceTransformer:
        if self._embedder is None:
            self._embedder = SentenceTransformer(self.model_name)
        return self._embedder

    def load_taxonomy_from_db(self, force_refresh: bool = False) -> None:
        """
        Dynamically query MongoDB Atlas for taxonomy categories, subcategories,
        descriptions, and skills, then compute and cache semantic embeddings.
        """
        if self._taxonomy_df is not None and not force_refresh:
            return

        records = get_all_taxonomy_records()
        if not records:
            return

        self._taxonomy_df = pd.DataFrame(records)

        # Build category embedding corpus from database descriptions
        cat_texts = []
        for _, row in self._taxonomy_df.iterrows():
            cat = row["category"]
            desc = row.get("description", "")
            cat_texts.append(f"{cat}: {desc}")

        self._cat_embeddings = self.embedder.encode(cat_texts, convert_to_numpy=True)

        # Build subcategory embedding corpus from database subcategories
        subcat_texts = []
        self._subcat_metadata = []
        for _, row in self._taxonomy_df.iterrows():
            cat = row["category"]
            for sub in row.get("subcategories", []):
                sub_name = sub.get("name", "")
                sub_desc = sub.get("description", "")
                sub_skills = sub.get("skills", row.get("default_skills", []))
                subcat_texts.append(f"{cat} - {sub_name}: {sub_desc}")
                self._subcat_metadata.append(
                    {
                        "category": cat,
                        "subcategory": sub_name,
                        "skills": sub_skills,
                    }
                )

        if subcat_texts:
            self._subcat_embeddings = self.embedder.encode(subcat_texts, convert_to_numpy=True)

    def classify(self, title: str, description: str) -> Tuple[str, str, float]:
        """
        Classify problem text using dense semantic embeddings, scikit-learn cosine similarity,
        and pandas taxonomy indexing.
        """
        self.load_taxonomy_from_db()
        if self._taxonomy_df is None or self._cat_embeddings is None:
            return "Other", "General Issue", 0.50

        query_text = f"{title}. {description}".strip()
        query_emb = self.embedder.encode([query_text], convert_to_numpy=True)

        # 1. Category Classification via scikit-learn cosine_similarity
        cat_sims = cosine_similarity(query_emb, self._cat_embeddings)[0]  # shape: (num_categories,)
        best_cat_idx = int(np.argmax(cat_sims))
        best_cat_sim = float(cat_sims[best_cat_idx])
        best_category = str(self._taxonomy_df.iloc[best_cat_idx]["category"])

        # 2. Subcategory Matching within the predicted category or global top subcategories
        best_subcategory = "General Issue"
        subcat_sim = best_cat_sim

        if self._subcat_embeddings is not None and len(self._subcat_metadata) > 0:
            # Filter subcategories belonging to best_category
            matching_indices = [
                i for i, m in enumerate(self._subcat_metadata) if m["category"] == best_category
            ]
            if matching_indices:
                sub_embeddings_subset = self._subcat_embeddings[matching_indices]
                sub_sims = cosine_similarity(query_emb, sub_embeddings_subset)[0]
                best_sub_local_idx = int(np.argmax(sub_sims))
                global_idx = matching_indices[best_sub_local_idx]
                best_subcategory = self._subcat_metadata[global_idx]["subcategory"]
                subcat_sim = float(sub_sims[best_sub_local_idx])
            else:
                # Fallback to global top subcategory
                all_sub_sims = cosine_similarity(query_emb, self._subcat_embeddings)[0]
                best_global_idx = int(np.argmax(all_sub_sims))
                best_subcategory = self._subcat_metadata[best_global_idx]["subcategory"]
                subcat_sim = float(all_sub_sims[best_global_idx])

        # 3. Calculate continuous confidence score
        # Cosine similarity on all-MiniLM-L6-v2 typically ranges from 0.20 (unrelated) to 0.75+ (identical context)
        raw_score = max(best_cat_sim, subcat_sim)
        if raw_score < 0.22:
            confidence = float(np.clip(raw_score * 1.8, 0.20, 0.49))
        else:
            # Map [0.22, 0.70] -> [0.60, 0.98]
            norm = (raw_score - 0.22) / (0.70 - 0.22)
            confidence = float(np.clip(0.60 + norm * 0.38, 0.50, 0.98))

        return best_category, best_subcategory, round(confidence, 3)

    def extract_skills_from_db(self, category: str, subcategory: str) -> List[str]:
        """
        Dynamically retrieve required skills from the taxonomy records in MongoDB Atlas.
        No static mapping in Python code.
        """
        self.load_taxonomy_from_db()
        if self._taxonomy_df is None:
            return ["Interdisciplinary Problem Solving", "Data Analytics", "Community Planning"]

        # 1. Check if subcategory has specific skills in metadata
        for meta in self._subcat_metadata:
            if meta["category"] == category and meta["subcategory"] == subcategory:
                if meta.get("skills"):
                    return list(meta["skills"])

        # 2. Fallback to category default skills in DataFrame
        cat_rows = self._taxonomy_df[self._taxonomy_df["category"] == category]
        if not cat_rows.empty:
            defaults = cat_rows.iloc[0].get("default_skills")
            if defaults:
                return list(defaults)

        return ["Interdisciplinary Problem Solving", "Data Analytics", "Community Planning"]

    def generate_extractive_summary(self, title: str, description: str) -> str:
        """
        Use spaCy for sentence boundary segmentation and sentence-transformers + scikit-learn
        to score each sentence against the overall problem context. The highest-scoring
        sentence is returned as a 100% extractive, non-hallucinatory summary.
        """
        full_text = f"{title}. {description}".strip()
        nlp = get_spacy_nlp()
        doc = nlp(description.strip() if len(description.strip()) > 30 else full_text)

        sentences = [s.text.strip() for s in doc.sents if len(s.text.strip()) > 15]
        if not sentences:
            return title

        if len(sentences) == 1:
            return sentences[0]

        # Embed all candidate sentences and the global text
        doc_emb = self.embedder.encode([full_text], convert_to_numpy=True)
        sent_embs = self.embedder.encode(sentences, convert_to_numpy=True)

        sims = cosine_similarity(doc_emb, sent_embs)[0]
        best_sent_idx = int(np.argmax(sims))
        return sentences[best_sent_idx]

    def analyze(self, title: str, description: str) -> Dict[str, Any]:
        """
        Execute full ML pipeline:
        - Load dynamic taxonomy from MongoDB
        - Dense embedding semantic classification via sentence-transformers & scikit-learn
        - Dynamic noun-chunk & TF-IDF keyword extraction via spaCy
        - Database skill retrieval
        - Extractive summarization via semantic sentence ranking
        """
        category, subcategory, confidence = self.classify(title, description)
        keywords = extract_keywords(title, description, max_keywords=5)
        required_skills = self.extract_skills_from_db(category, subcategory)
        summary = self.generate_extractive_summary(title, description)
        now_iso = datetime.now(timezone.utc).isoformat()

        return {
            "category": category,
            "subcategory": subcategory,
            "confidence_score": confidence,
            "confidence": confidence,
            "keywords": keywords,
            "required_skills": required_skills,
            "summary": summary,
            "model_version": self.model_version,
            "analyzed_at": now_iso,
            "processed_at": now_iso,
        }


def get_problem_analyzer() -> ProblemAnalyzer:
    """Singleton getter for the ML ProblemAnalyzer."""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = ProblemAnalyzer()
    return _analyzer_instance


def analyze_problem(title: str, description: str) -> Dict[str, Any]:
    """Convenience helper to analyze a problem using the singleton analyzer."""
    return get_problem_analyzer().analyze(title, description)
