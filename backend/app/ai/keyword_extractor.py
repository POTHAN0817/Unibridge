import re
from typing import List, Optional
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer

_nlp = None


def get_spacy_nlp():
    """Lazy load the spaCy language model."""
    global _nlp
    if _nlp is None:
        try:
            _nlp = spacy.load("en_core_web_sm")
        except Exception:
            _nlp = spacy.blank("en")
    return _nlp


def extract_keywords(title: str, description: str, max_keywords: int = 6) -> List[str]:
    """
    Dynamically extract key noun phrases, entities, and significant n-grams
    using spaCy linguistic parsing and scikit-learn TF-IDF ranking.
    No hardcoded domain keyword lists.
    """
    full_text = f"{title}. {description}".strip()
    if not full_text:
        return []

    nlp = get_spacy_nlp()
    doc = nlp(full_text)

    # 1. Collect candidate phrases: noun chunks and named entities from spaCy
    candidates = []
    for chunk in doc.noun_chunks:
        # Strip leading determiners/pronouns and clean
        chunk_tokens = [
            t.lemma_.lower()
            for t in chunk
            if not t.is_stop and not t.is_punct and not t.is_space and len(t.text) > 1 and not t.like_num
        ]
        if chunk_tokens:
            phrase = " ".join(chunk_tokens)
            if len(phrase) > 2 and phrase not in candidates:
                candidates.append(phrase)

    for ent in doc.ents:
        ent_text = ent.text.strip().lower()
        if len(ent_text) > 2 and ent_text not in candidates:
            candidates.append(ent_text)

    # 2. If candidates extracted via spaCy, score them with TF-IDF or frequency
    if candidates:
        # Clean candidates
        clean_candidates = []
        for c in candidates:
            c_clean = re.sub(r"[^\w\s-]", "", c).strip()
            if len(c_clean) > 2 and c_clean not in clean_candidates:
                clean_candidates.append(c_clean)

        # Sort prioritizing multi-word informative phrases first, then frequency
        clean_candidates.sort(key=lambda x: (len(x.split()) > 1, len(x)), reverse=True)
        return clean_candidates[:max_keywords]

    # 3. Fallback: scikit-learn TF-IDF over n-grams
    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=max_keywords * 2,
        )
        tfidf_matrix = vectorizer.fit_transform([full_text])
        feature_names = vectorizer.get_feature_names_out()
        scores = tfidf_matrix.toarray()[0]
        scored_pairs = list(zip(feature_names, scores))
        scored_pairs.sort(key=lambda x: x[1], reverse=True)
        return [word for word, score in scored_pairs[:max_keywords]]
    except Exception:
        # Graceful fallback to simple non-stop tokens
        tokens = [t.text.lower() for t in doc if not t.is_stop and not t.is_punct and len(t.text) > 2]
        return list(dict.fromkeys(tokens))[:max_keywords]
