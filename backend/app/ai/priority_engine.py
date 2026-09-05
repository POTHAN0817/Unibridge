from datetime import datetime, timezone
from typing import Any, Dict, Optional


# Domain baseline severity levels
DOMAIN_SEVERITY_MAP: Dict[str, int] = {
    "Water": 85,
    "Healthcare": 88,
    "Public Safety": 82,
    "Sanitation": 75,
    "Infrastructure": 72,
    "Energy": 70,
    "Environment": 68,
    "Agriculture": 65,
    "Education": 64,
    "Waste Management": 62,
    "Social Welfare": 60,
    "Transportation": 58,
    "Employment": 52,
    "Digital Connectivity": 48,
    "Governance": 45,
    "Other": 40,
}


class PriorityEngine:
    """
    Production Explainable Priority Scoring Engine for UniBridge (Phase 2B).
    Calculates a transparent 0-100 score based exclusively on real user input and AI diagnostics:
    - Severity (25%): Category criticality baseline
    - Urgency (20%): Actual citizen-selected urgency level
    - Population Impact (20%): Actual citizen-entered affected people count
    - Frequency / Duplication (15%): Multi-citizen report clustering from duplicate detector
    - Feasibility (20%): Academic & engineering capability match
    """

    def __init__(self):
        self.model_version = "unibridge-priority-v1"

    def normalize_urgency(self, urgency: Optional[str]) -> float:
        """Map urgency level string to normalized 0-100 score."""
        urg_lower = (urgency or "").strip().lower()
        if urg_lower == "critical":
            return 100.0
        elif urg_lower == "high":
            return 85.0
        elif urg_lower == "medium":
            return 50.0
        elif urg_lower == "low":
            return 20.0
        return 40.0

    def normalize_population(self, affected_people: Optional[int]) -> float:
        """Map affected population count to normalized 0-100 score."""
        if affected_people is None:
            return 20.0
        if affected_people <= 0:
            return 10.0
        if affected_people >= 10000:
            return 100.0
        # Smooth logarithmic scaling from 1 to 10,000
        import math
        val = 20.0 + (math.log10(max(1, affected_people)) / 4.0) * 80.0
        return round(min(100.0, max(10.0, val)), 1)

    def calculate(
        self,
        category: Optional[str] = None,
        affected_people: Optional[int] = None,
        urgency: Optional[str] = None,
        duplicate_count: int = 0,
        highest_similarity: float = 0.0,
        ai_analysis: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Convenience method matching test suite signature."""
        dup_dict = {
            "candidates": [{} for _ in range(duplicate_count)],
            "duplicate_count": duplicate_count,
            "highest_similarity": highest_similarity,
            "is_duplicate": highest_similarity >= 0.80,
        }
        return self.compute_priority(
            category=category,
            affected_people=affected_people,
            urgency=urgency,
            duplicate_analysis=dup_dict,
            ai_analysis=ai_analysis,
        )

    def compute_priority(
        self,
        category: Optional[str] = None,
        affected_people: Optional[int] = None,
        urgency: Optional[str] = None,
        duplicate_analysis: Optional[Dict[str, Any]] = None,
        ai_analysis: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:

        """
        Compute an explainable, multi-factor priority score.
        Grounded strictly in actual available data.
        """
        # 1. Severity Factor (25%)
        sev_score = DOMAIN_SEVERITY_MAP.get(category or "Other", 40)

        # 2. Urgency Factor (20%)
        urg_lower = (urgency or "").strip().lower()
        urg_score = self.normalize_urgency(urgency)


        # 3. Population Impact Factor (20%)
        pop_score = self.normalize_population(affected_people)

        # 4. Frequency / Duplication Factor (15%)
        freq_score = 15.0
        similar_count = 0
        if duplicate_analysis:
            candidates = duplicate_analysis.get("candidates", [])
            similar_count = len(candidates)
            highest_sim = duplicate_analysis.get("highest_similarity", 0.0)
            if duplicate_analysis.get("is_duplicate") or highest_sim >= 0.85:
                freq_score = 90.0
            elif highest_sim >= 0.70:
                freq_score = 65.0
            elif highest_sim >= 0.50:
                freq_score = 40.0

        # 5. Feasibility / Engineering Capability Factor (20%)
        conf = 0.50
        if ai_analysis and ("confidence" in ai_analysis or "confidence_score" in ai_analysis):
            conf = float(ai_analysis.get("confidence") or ai_analysis.get("confidence_score") or 0.50)
        feas_score = round(40.0 + (conf * 40.0), 1)  # ranges 40 to 80


        # Weighted composite score
        raw_score = (
            0.25 * sev_score
            + 0.20 * urg_score
            + 0.20 * pop_score
            + 0.15 * freq_score
            + 0.20 * feas_score
        )
        final_score = int(round(max(0, min(100, raw_score))))

        # Priority Level
        if final_score >= 70:
            level = "high"
        elif final_score >= 40:
            level = "medium"
        else:
            level = "low"

        # Generate transparent, factual textual explanation referencing only real inputs
        explanation_parts = []
        if affected_people and affected_people > 0:
            explanation_parts.append(f"affects approximately {affected_people:,} citizens")
        if urg_lower in ["high", "medium", "low"]:
            explanation_parts.append(f"was marked as {urg_lower} urgency")
        if category and category != "Other":
            explanation_parts.append(f"belongs to critical {category} infrastructure")
        if similar_count > 0:
            sim_pct = int(round(duplicate_analysis.get("highest_similarity", 0.0) * 100))
            explanation_parts.append(f"corresponds with {similar_count} related community report{'s' if similar_count > 1 else ''} (up to {sim_pct}% semantic similarity)")

        if explanation_parts:
            explanation = f"Priority is scored at {final_score}/100 ({level}) because the issue " + ", ".join(explanation_parts) + "."

        else:
            explanation = f"Priority is evaluated at {final_score}/100 ({level}) based on baseline domain criticality and academic feasibility."

        now_iso = datetime.now(timezone.utc).isoformat()

        return {
            "score": final_score,
            "level": level,
            "factors": {
                "severity": sev_score,
                "urgency": urg_score,
                "population_impact": pop_score,
                "frequency": freq_score,
                "feasibility": feas_score,
            },
            "explanation": explanation,
            "model_version": self.model_version,
            "calculated_at": now_iso,
        }


_priority_engine_instance: Optional[PriorityEngine] = None


def get_priority_engine() -> PriorityEngine:
    """Singleton getter for the PriorityEngine."""
    global _priority_engine_instance
    if _priority_engine_instance is None:
        _priority_engine_instance = PriorityEngine()
    return _priority_engine_instance


def calculate_priority(
    category: Optional[str] = None,
    affected_people: Optional[int] = None,
    urgency: Optional[str] = None,
    duplicate_analysis: Optional[Dict[str, Any]] = None,
    ai_analysis: Optional[Dict[str, Any]] = None,
    duplicate_info: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Convenience helper to calculate priority via singleton."""
    dup = duplicate_analysis if duplicate_analysis is not None else duplicate_info
    return get_priority_engine().compute_priority(
        category=category,
        affected_people=affected_people,
        urgency=urgency,
        duplicate_analysis=dup,
        ai_analysis=ai_analysis,
    )

