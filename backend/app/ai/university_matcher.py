import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set, Tuple

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

from app.ai.duplicate_detector import get_duplicate_detector

_university_matcher_instance: Optional["UniversityMatcher"] = None


# Common normalization dictionaries for engineering and academic variations
TERM_VARIATIONS: Dict[str, str] = {
    "engg": "engineering",
    "eng": "engineering",
    "tech": "technology",
    "cse": "computer science and engineering",
    "it": "information technology",
    "ece": "electronics and communication engineering",
    "eee": "electrical and electronics engineering",
    "mech": "mechanical engineering",
    "civil": "civil engineering",
    "ai": "artificial intelligence",
    "ml": "machine learning",
    "dl": "deep learning",
    "iot": "internet of things",
    "gis": "geographic information systems",
}


def normalize_term(term: str) -> str:
    """
    Normalize technical, academic, and engineering terms:
    - Lowercase
    - Strip punctuation and redundant whitespace
    - Singularize basic plurals where safe
    - Map common acronyms/abbreviations
    """
    if not term:
        return ""
    t = term.lower().strip()
    t = t.replace("&", " and ")
    t = re.sub(r"[^\w\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()

    if t in TERM_VARIATIONS:
        return TERM_VARIATIONS[t]

    words = t.split()
    normalized_words = []
    for w in words:
        if w in TERM_VARIATIONS:
            normalized_words.append(TERM_VARIATIONS[w])
        else:
            # Handle regular English plurals: -ies -> -y, and -s removal
            if len(w) > 4:
                if w.endswith("ies"):
                    w = w[:-3] + "y"
                elif (
                    w.endswith("s")
                    and not w.endswith("ss")
                    and w not in {"status", "basis", "crisis", "thesis", "species", "physics", "optics"}
                ):
                    w = w[:-1]
            normalized_words.append(w)

    return " ".join(normalized_words)



class UniversityMatcher:
    """
    Explainable University Matching Engine for UniBridge (Phase 3A).
    Connects real citizen challenges with real universities registered in MongoDB Atlas.

    Model version: unibridge-university-match-v1

    Explainable Weighted Baseline Formula:
    University Match Score =
        0.40 × expertise_similarity
      + 0.20 × skill_match
      + 0.15 × previous_project_match
      + 0.10 × infrastructure_match
      + 0.10 × location_relevance
      + 0.05 × availability
    Clamped strictly between 0 and 100.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model_version = "unibridge-university-match-v1"
        self._embedder: Optional[SentenceTransformer] = None

    @property
    def embedder(self) -> SentenceTransformer:
        """Reuse singleton sentence-transformers model from duplicate_detector to save RAM."""
        if self._embedder is None:
            # Re-use duplicate detector's loaded instance if available
            detector = get_duplicate_detector()
            self._embedder = detector.embedder
        return self._embedder

    def build_university_corpus(self, uni_doc: Dict[str, Any]) -> str:
        """
        Build rich text representation of university capabilities, research, and expertise
        using exclusively real university profile inputs.
        """
        parts = []

        # Name and description
        name = uni_doc.get("name", "").strip()
        if name:
            parts.append(f"University: {name}")
        desc = uni_doc.get("description", "").strip()
        if desc:
            parts.append(desc)

        # University-level skills and research areas
        skills = [s.strip() for s in uni_doc.get("skills", []) if str(s).strip()]
        if skills:
            parts.append("Institutional Skills: " + ", ".join(skills))
        research = [r.strip() for r in uni_doc.get("research_areas", []) if str(r).strip()]
        if research:
            parts.append("Research Areas: " + ", ".join(research))

        # Departments
        depts = uni_doc.get("departments", [])
        for d in depts:
            d_name = d.get("name", "").strip()
            d_exp = d.get("expertise", [])
            d_skills = d.get("skills", [])
            d_research = d.get("research_areas", [])
            d_student_skills = d.get("student_skills", [])
            d_items = [str(s).strip() for s in (d_exp + d_skills + d_research + d_student_skills) if str(s).strip()]
            if d_name:
                dept_desc = f"Department of {d_name}"
                if d_items:
                    dept_desc += f" with capabilities in {', '.join(d_items)}"
                parts.append(dept_desc)

            # Department faculty
            for f in d.get("faculty", []):
                f_name = f.get("name", "").strip()
                f_items = [str(x).strip() for x in (f.get("expertise", []) + f.get("research_areas", []) + f.get("skills", [])) if str(x).strip()]
                if f_name and f_items:
                    parts.append(f"Faculty {f_name}: {', '.join(f_items)}")

            # Department infrastructure
            d_infra = [str(x).strip() for x in d.get("infrastructure", []) if str(x).strip()]
            if d_infra:
                parts.append(f"Department Facilities: {', '.join(d_infra)}")

        # Faculty expertise (top-level)
        faculty = uni_doc.get("faculty", [])
        for f in faculty:
            f_name = f.get("name", "").strip()
            f_exp = f.get("expertise", [])
            f_research = f.get("research_areas", [])
            f_items = [str(x).strip() for x in (f_exp + f_research) if str(x).strip()]
            if f_name and f_items:
                parts.append(f"Faculty {f_name}: {', '.join(f_items)}")

        # Infrastructure (top-level)
        infra = [str(i).strip() for i in uni_doc.get("infrastructure", []) if str(i).strip()]
        if infra:
            parts.append("Laboratories & Infrastructure: " + ", ".join(infra))

        # Previous projects
        projects = uni_doc.get("previous_projects", [])
        for p in projects:
            p_title = p.get("title", "").strip()
            p_desc = p.get("description", "").strip()
            p_domain = p.get("domain", "").strip()
            proj_str = " ".join([x for x in [p_title, p_desc, p_domain] if x])
            if proj_str:
                parts.append(f"Project Experience: {proj_str}")

        return ". ".join(parts)

    def extract_all_university_skills(self, uni_doc: Dict[str, Any]) -> Set[str]:
        """Extract all unique normalized skills from across all university profile sections."""
        all_skills: Set[str] = set()

        for s in uni_doc.get("skills", []):
            if s and str(s).strip():
                all_skills.add(normalize_term(str(s)))

        for s in uni_doc.get("student_skills", []):
            if s and str(s).strip():
                all_skills.add(normalize_term(str(s)))

        for s in uni_doc.get("research_areas", []):
            if s and str(s).strip():
                all_skills.add(normalize_term(str(s)))

        for d in uni_doc.get("departments", []):
            for s in (
                d.get("skills", [])
                + d.get("student_skills", [])
                + d.get("expertise", [])
                + d.get("research_areas", [])
            ):
                if s and str(s).strip():
                    all_skills.add(normalize_term(str(s)))

            for f in d.get("faculty", []):
                for s in (
                    f.get("skills", [])
                    + f.get("expertise", [])
                    + f.get("research_areas", [])
                ):
                    if s and str(s).strip():
                        all_skills.add(normalize_term(str(s)))

        for f in uni_doc.get("faculty", []):
            for s in (
                f.get("skills", [])
                + f.get("expertise", [])
                + f.get("research_areas", [])
            ):
                if s and str(s).strip():
                    all_skills.add(normalize_term(str(s)))

        return all_skills

    def calculate_match(
        self,
        challenge: Dict[str, Any],
        university: Dict[str, Any],
        challenge_vector: Optional[np.ndarray] = None,
    ) -> Dict[str, Any]:
        """
        Calculate an explainable match between a Challenge and a real University profile.
        Returns match candidate dictionary with exact factor breakdowns and factual text explanation.
        """
        ai_analysis = challenge.get("ai_analysis") or {}
        ch_title = challenge.get("title", "").strip()
        ai_analysis = challenge.get("ai_analysis") or {}
        ch_title = challenge.get("title", "").strip()
        ch_desc = challenge.get("description", "").strip()
        ch_cat = ai_analysis.get("category") or challenge.get("category") or ""
        ch_subcat = ai_analysis.get("subcategory") or challenge.get("subcategory") or ""
        required_skills = (
            ai_analysis.get("required_skills")
            or challenge.get("required_expertise")
            or challenge.get("required_skills")
            or []
        )
        ch_keywords = ai_analysis.get("keywords") or challenge.get("keywords") or []

        # ----------------------------------------------------
        # Factor 1: Expertise Similarity (40%)
        # ----------------------------------------------------
        uni_corpus = self.build_university_corpus(university)
        if not uni_corpus.strip():
            expertise_sim = 0.0
        else:
            # Build challenge query representation
            ch_query_text = f"{ch_title}. {ch_desc}"
            if ch_cat:
                ch_query_text += f" Domain: {ch_cat}"
            if ch_subcat:
                ch_query_text += f", {ch_subcat}"
            if required_skills:
                ch_query_text += f". Required: {', '.join(required_skills)}"

            if challenge_vector is None:
                challenge_vector = self.embedder.encode([ch_query_text], convert_to_numpy=True)[0]

            uni_vector = self.embedder.encode([uni_corpus], convert_to_numpy=True)[0]
            sim = float(cosine_similarity([challenge_vector], [uni_vector])[0][0])
            # Scale cosine similarity [0.0 to 1.0] -> [0 to 100]
            expertise_sim = round(max(0.0, min(100.0, sim * 100.0)), 1)

        # ----------------------------------------------------
        # Factor 2: Skill Match (20%)
        # ----------------------------------------------------
        uni_skills_set = self.extract_all_university_skills(university)
        matched_skills: List[str] = []
        missing_skills: List[str] = []

        if not required_skills:
            # Fallback to challenge keywords if required_skills empty
            check_skills = ch_keywords[:6]
        else:
            check_skills = required_skills

        if check_skills:
            for req in check_skills:
                norm_req = normalize_term(req)
                # Check for exact match or substring overlap in normalized skills
                matched = False
                for u_skill in uni_skills_set:
                    if norm_req == u_skill or norm_req in u_skill or u_skill in norm_req:
                        matched = True
                        break
                    # Also check word overlap for compound skill names (e.g. "Water Quality Testing")
                    req_words = [w for w in norm_req.split() if len(w) > 4]
                    if req_words and all(w in u_skill for w in req_words):
                        matched = True
                        break
                if matched:
                    matched_skills.append(req)
                else:
                    missing_skills.append(req)

            skill_score = round((len(matched_skills) / len(check_skills)) * 100.0, 1)
        else:
            skill_score = 40.0  # Neutral baseline if no skills demanded

        # ----------------------------------------------------
        # Factor 3: Previous Project Match (15%)
        # ----------------------------------------------------
        previous_projects = university.get("previous_projects", [])
        relevant_projects: List[str] = []
        project_score = 0.0

        if previous_projects:
            proj_sims = []
            for p in previous_projects:
                p_title = p.get("title", "")
                p_desc = p.get("description", "")
                p_domain = p.get("domain", "")
                p_text = f"{p_title} {p_desc} {p_domain}".strip()
                if not p_text:
                    continue

                # Check domain overlap
                domain_overlap = False
                if ch_cat and normalize_term(ch_cat) in normalize_term(p_domain or p_title):
                    domain_overlap = True

                # Compute semantic similarity to challenge
                p_vec = self.embedder.encode([p_text], convert_to_numpy=True)[0]
                p_sim = float(cosine_similarity([challenge_vector], [p_vec])[0][0])
                if p_sim >= 0.50 or domain_overlap:
                    relevant_projects.append(p_title or p_text[:60])
                proj_sims.append(p_sim)

            if proj_sims:
                best_sim = max(proj_sims)
                project_score = round(max(0.0, min(100.0, best_sim * 100.0)), 1)
                if relevant_projects:
                    project_score = max(project_score, 70.0)
        else:
            # 0 contribution if university has no previous project experience entered
            project_score = 0.0

        # ----------------------------------------------------
        # Factor 4: Infrastructure Match (10%)
        # ----------------------------------------------------
        infra_list = list(university.get("infrastructure", []))
        for d in university.get("departments", []):
            infra_list.extend(d.get("infrastructure", []))

        relevant_infra: List[str] = []
        infra_score = 0.0

        if infra_list:
            domain_terms = [normalize_term(ch_cat), normalize_term(ch_subcat)] + [normalize_term(s) for s in (matched_skills or check_skills)]
            domain_terms = [t for t in domain_terms if t]

            for item in infra_list:
                norm_item = normalize_term(item)
                matched_infra = False
                for term in domain_terms:
                    if term in norm_item or any(word in norm_item for word in term.split() if len(word) > 4):
                        matched_infra = True
                        break
                if matched_infra:
                    relevant_infra.append(item)

            if relevant_infra:
                infra_score = min(100.0, 60.0 + len(relevant_infra) * 20.0)
            else:
                infra_score = 20.0  # Has infrastructure, but not directly domain-specific
        else:
            infra_score = 0.0  # No infrastructure registered

        # ----------------------------------------------------
        # Factor 5: Location Relevance (10%)
        # ----------------------------------------------------
        # Same District/City > Same State > Same Country > Unknown
        ch_loc = challenge.get("location") or {}
        ch_state = normalize_term(challenge.get("state") or ch_loc.get("state") or "")
        ch_dist = normalize_term(challenge.get("district") or ch_loc.get("district") or "")
        ch_city = normalize_term(challenge.get("city") or ch_loc.get("city") or "")

        uni_loc = university.get("location") or {}
        uni_state = normalize_term(uni_loc.get("state") or "")
        uni_dist = normalize_term(uni_loc.get("district") or "")
        uni_city = normalize_term(uni_loc.get("city") or "")

        if (ch_dist and uni_dist and ch_dist == uni_dist) or (ch_city and uni_city and ch_city == uni_city):
            loc_score = 100.0
        elif ch_state and uni_state and ch_state == uni_state:
            loc_score = 75.0
        elif uni_state or ch_state:
            loc_score = 40.0
        else:
            loc_score = 30.0  # Neutral if location unknown

        # ----------------------------------------------------
        # Factor 6: Availability / Capacity (5%)
        # ----------------------------------------------------
        avail_str = (university.get("availability") or university.get("availability_status") or "unknown").strip().lower()
        if any(w in avail_str for w in ["available", "active", "seeking", "open"]):
            avail_score = 100.0
        elif "limited" in avail_str:
            avail_score = 50.0
        elif any(w in avail_str for w in ["unavailable", "busy", "full"]):
            avail_score = 10.0
        else:
            avail_score = 50.0

        # ----------------------------------------------------
        # Composite Weighted Match Score (0–100)
        # ----------------------------------------------------
        weighted_score = (
            0.40 * expertise_sim
            + 0.20 * skill_score
            + 0.15 * project_score
            + 0.10 * infra_score
            + 0.10 * loc_score
            + 0.05 * avail_score
        )
        final_score = int(round(max(0, min(100, weighted_score))))

        # Determine Match Level
        if final_score >= 80:
            level = "High Match"
        elif final_score >= 60:
            level = "Good Match"
        elif final_score >= 40:
            level = "Moderate Match"
        else:
            level = "Low Match"

        # Identify matched departments and faculty
        matched_depts: List[str] = []
        for d in university.get("departments", []):
            d_name = d.get("name", "")
            d_skills = [normalize_term(x) for x in (d.get("skills", []) + d.get("expertise", []))]
            if any(ms in d_skills for ms in [normalize_term(x) for x in matched_skills]) or (ch_cat and normalize_term(ch_cat) in normalize_term(d_name)):
                matched_depts.append(d_name)

        matched_fac: List[str] = []
        for f in university.get("faculty", []):
            f_name = f.get("name", "")
            f_skills = [normalize_term(x) for x in (f.get("skills", []) + f.get("expertise", []) + f.get("research_areas", []))]
            if any(ms in f_skills for ms in [normalize_term(x) for x in matched_skills]):
                matched_fac.append(f_name)

        # ----------------------------------------------------
        # Generate Factual Explanation referencing real data only
        # ----------------------------------------------------
        uni_name = university.get("name", "University")
        explanation_clauses = []
        if matched_skills:
            explanation_clauses.append(f"offers accredited expertise in {', '.join(matched_skills[:3])}")
        if matched_depts:
            explanation_clauses.append(f"active {matched_depts[0]} department")
        if relevant_projects:
            explanation_clauses.append(f"proven previous project '{relevant_projects[0]}'")
        if relevant_infra:
            explanation_clauses.append(f"lab infrastructure '{relevant_infra[0]}'")
        if loc_score >= 75.0 and uni_loc.get("state"):
            explanation_clauses.append(f"regional presence in {uni_loc.get('state')}")

        if explanation_clauses:
            explanation = f"{uni_name} is evaluated as a {level} ({final_score}/100) because it " + ", ".join(explanation_clauses) + "."
        else:
            explanation = f"{uni_name} is evaluated as a {level} ({final_score}/100) based on baseline institutional research scope."

        now_iso = datetime.now(timezone.utc).isoformat()

        return {
            "university_id": str(university.get("id") or university.get("_id") or ""),
            "university_name": uni_name,
            "short_name": university.get("short_name"),
            "location": university.get("location"),
            "score": final_score,
            "overall_score": final_score,
            "level": level,
            "match_level": level,
            "factors": {
                "expertise_similarity": expertise_sim,
                "faculty_expertise_score": expertise_sim,
                "skill_match": skill_score,
                "student_skills_score": skill_score,
                "previous_project_match": project_score,
                "previous_projects_score": project_score,
                "infrastructure_match": infra_score,
                "infrastructure_score": infra_score,
                "location_relevance": loc_score,
                "location_proximity_score": loc_score,
                "availability": avail_score,
                "availability_score": avail_score,
            },
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "matched_departments": matched_depts,
            "matched_faculty": matched_fac,
            "relevant_projects": relevant_projects,
            "relevant_infrastructure": relevant_infra,
            "explanation": explanation,
            "model_version": self.model_version,
            "calculated_at": now_iso,
        }

    def match_all_universities(
        self,
        challenge: Dict[str, Any],
        universities: List[Dict[str, Any]],
        min_score: int = 20,
    ) -> Dict[str, Any]:
        """
        Rank all available universities against a challenge.
        Returns empty matches if no universities exist or none meet the minimum score.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        if not universities:
            return {
                "status": "no_candidates",
                "matches": [],
                "model_version": self.model_version,
                "calculated_at": now_iso,
            }

        # Pre-compute challenge vector once
        ch_title = challenge.get("title", "")
        ch_desc = challenge.get("description", "")
        ai_res = challenge.get("ai_analysis") or {}
        ch_cat = ai_res.get("category") or challenge.get("category") or ""
        ch_query_text = f"{ch_title}. {ch_desc}. Domain: {ch_cat}"
        ch_vector = self.embedder.encode([ch_query_text], convert_to_numpy=True)[0]

        candidates = []
        for uni in universities:
            candidate = self.calculate_match(challenge, uni, challenge_vector=ch_vector)
            if candidate["score"] >= min_score:
                candidates.append(candidate)

        candidates.sort(key=lambda x: x["score"], reverse=True)

        status = "completed" if candidates else "no_candidates"
        return {
            "status": status,
            "matches": candidates[:10],
            "model_version": self.model_version,
            "calculated_at": now_iso,
        }


def get_university_matcher() -> UniversityMatcher:
    """Singleton getter for UniversityMatcher."""
    global _university_matcher_instance
    if _university_matcher_instance is None:
        _university_matcher_instance = UniversityMatcher()
    return _university_matcher_instance
