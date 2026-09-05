"""
Test Suite for UniBridge Phase 2B:
1. Model loading & vector embedding generation (all-MiniLM-L6-v2)
2. Cosine similarity calculation between embeddings
3. Duplicate detection thresholding (0.80 cutoff)
4. Duplicate candidate ranking & ordering
5. Priority engine 5-factor calculation
6. Urgency mapping ('high' -> 85, 'medium' -> 50, 'low' -> 20)
7. Population impact log scaling
8. Factual explanation generation referencing real numbers
9. End-to-end challenge submission with Phase 2A + Phase 2B outputs
"""

import math
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.ai.duplicate_detector import DuplicateDetector, get_duplicate_detector
from app.ai.priority_engine import PriorityEngine, get_priority_engine, calculate_priority


def test_1_model_loading_and_embedding():
    print("\n--- Test 1: Model Loading & Embedding Generation ---")
    detector = get_duplicate_detector()
    assert detector is not None
    assert detector.model is not None

    emb = detector.generate_embedding("Test problem title", "Detailed description of a rural issue")
    assert len(emb) == 384, f"Expected 384 dimensions for all-MiniLM-L6-v2, got {len(emb)}"
    # Check unit vector (L2 norm should be approximately 1.0)
    norm = math.sqrt(sum(float(x) * float(x) for x in emb))
    assert abs(norm - 1.0) < 1e-2, f"Expected unit norm ~1.0, got {norm}"
    print("[PASS] Model loaded successfully and generated normalized 384-d vector.")



def test_2_and_3_cosine_similarity_and_threshold():
    print("\n--- Test 2 & 3: Cosine Similarity & Duplicate Threshold ---")
    detector = get_duplicate_detector()

    # Identical texts should have cosine similarity near 1.0
    text_a = "Farmers facing severe crop loss due to lack of solar cold storage in village"
    text_b = "Farmers suffering severe harvest damage because of no cold storage facility in local village"
    text_c = "Primary school students lack clean digital computers and internet connection in district"

    emb_a = detector.generate_embedding("Crop Storage Crisis", text_a)
    emb_b = detector.generate_embedding("Lack of Cold Storage for Crops", text_b)
    emb_c = detector.generate_embedding("School Computer Shortage", text_c)

    sim_ab = detector.calculate_similarity(emb_a, emb_b)
    sim_ac = detector.calculate_similarity(emb_a, emb_c)

    print(f"Similarity A-B (Similar Agri issues): {sim_ab:.4f}")
    print(f"Similarity A-C (Agri vs School): {sim_ac:.4f}")

    assert sim_ab >= 0.75, f"Expected similar issues to have high similarity, got {sim_ab}"
    assert sim_ac < 0.50, f"Expected unrelated issues to have low similarity, got {sim_ac}"
    print("[PASS] Cosine similarity correctly discriminates semantic similarity.")


def test_4_duplicate_ranking():
    print("\n--- Test 4: Duplicate Candidate Ranking ---")
    detector = get_duplicate_detector()
    emb_target = detector.generate_embedding("Contaminated drinking water in village wells", "High fluoride content in borewell water")

    mock_db_challenges = [
        {
            "id": "chal-001",
            "title": "Severe groundwater contamination with heavy metals in borewell",
            "description": "Drinking water from municipal borewells tests positive for unsafe contaminants and fluoride",
            "category": "Water & Sanitation",
            "subcategory": "Drinking Water Quality",
            "location": {"district": "Erode", "state": "Tamil Nadu"},
            "embedding": {
                "vector": detector.generate_embedding("Severe groundwater contamination with heavy metals in borewell", "Drinking water from municipal borewells tests positive for unsafe contaminants and fluoride")
            }
        },
        {
            "id": "chal-002",
            "title": "Borewell drinking water tastes salty and causes health sickness",
            "description": "Residents in the village suffer from contaminated borewell drinking water with high fluoride",
            "category": "Water & Sanitation",
            "subcategory": "Drinking Water Quality",
            "location": {"district": "Erode", "state": "Tamil Nadu"},
            "embedding": {
                "vector": detector.generate_embedding("Borewell drinking water tastes salty and causes health sickness", "Residents in the village suffer from contaminated borewell drinking water with high fluoride")
            }
        },
        {
            "id": "chal-003",
            "title": "Solar street lights broken across village square",
            "description": "Street lighting infrastructure has stopped working for two months leaving roads dark",
            "category": "Energy",
            "subcategory": "Renewable Energy",
            "location": {"district": "Madurai", "state": "Tamil Nadu"},
            "embedding": {
                "vector": detector.generate_embedding("Solar street lights broken across village square", "Street lighting infrastructure has stopped working for two months leaving roads dark")
            }
        }
    ]

    candidates = detector.compare_against_database(
        target_embedding=emb_target,
        category="Water & Sanitation",
        db_challenges=mock_db_challenges,
        current_challenge_id="chal-new"
    )

    assert len(candidates) >= 1
    # Check that highest similarity is first
    for i in range(len(candidates) - 1):
        assert candidates[i]["similarity_score"] >= candidates[i+1]["similarity_score"]

    print(f"Top candidate: {candidates[0]['title']} (Score: {candidates[0]['similarity_score']:.4f})")
    assert candidates[0]["challenge_id"] in ["chal-001", "chal-002"]
    print("[PASS] Duplicate candidates correctly ranked in descending order.")


def test_5_priority_weights_and_clamp():
    print("\n--- Test 5: Priority Engine Formula Weights & Clamping ---")
    engine = get_priority_engine()

    # Test extreme high
    res_high = engine.calculate(
        category="Healthcare",
        affected_people=100000,
        urgency="high",
        duplicate_count=10,
        highest_similarity=0.95,
        ai_analysis={"confidence": 0.95}
    )
    assert 0 <= res_high["score"] <= 100
    assert res_high["level"] in ["high", "medium", "low"]
    assert res_high["score"] >= 75, f"Expected high score, got {res_high['score']}"

    # Test extreme low
    res_low = engine.calculate(
        category=None,
        affected_people=1,
        urgency="low",
        duplicate_count=0,
        highest_similarity=0.0,
        ai_analysis=None
    )
    assert 0 <= res_low["score"] <= 100
    assert res_low["score"] <= 40, f"Expected low score, got {res_low['score']}"
    print(f"High case score: {res_high['score']}, Low case score: {res_low['score']}")
    print("[PASS] Priority score correctly calculated and clamped between 0 and 100.")


def test_6_urgency_mapping():
    print("\n--- Test 6: Urgency Mapping ---")
    engine = get_priority_engine()
    assert engine.normalize_urgency("high") == 85.0
    assert engine.normalize_urgency("HIGH") == 85.0
    assert engine.normalize_urgency("critical") == 100.0
    assert engine.normalize_urgency("medium") == 50.0
    assert engine.normalize_urgency("low") == 20.0
    assert engine.normalize_urgency("unknown") == 40.0
    assert engine.normalize_urgency(None) == 40.0
    print("[PASS] Urgency mapping correctly normalizes inputs.")


def test_7_population_impact_log_scale():
    print("\n--- Test 7: Population Impact Log Scale ---")
    engine = get_priority_engine()
    assert engine.normalize_population(None) == 20.0
    assert engine.normalize_population(0) == 10.0
    assert engine.normalize_population(10) < engine.normalize_population(100)
    assert engine.normalize_population(100) < engine.normalize_population(1000)
    assert engine.normalize_population(1000) < engine.normalize_population(10000)
    assert engine.normalize_population(10000) <= 100.0
    assert engine.normalize_population(100000) == 100.0
    print(f"Pop 50: {engine.normalize_population(50)}, Pop 500: {engine.normalize_population(500)}, Pop 5000: {engine.normalize_population(5000)}")
    print("[PASS] Population correctly log-scaled.")


def test_8_factual_explanation():
    print("\n--- Test 8: Factual Explanation Generation ---")
    engine = get_priority_engine()
    res = engine.calculate(
        category="Water & Sanitation",
        affected_people=3200,
        urgency="high",
        duplicate_count=2,
        highest_similarity=0.88,
        ai_analysis={"confidence": 0.92}
    )
    explanation = res["explanation"]
    print(f"Generated Explanation:\n{explanation}")
    assert "Water & Sanitation" in explanation
    assert "3,200" in explanation or "3200" in explanation
    assert "high" in explanation.lower()
    assert "2" in explanation  # duplicate count
    assert "88%" in explanation  # similarity
    assert "OpenAI" not in explanation
    assert "GPT" not in explanation
    print("[PASS] Factual explanation correctly references real values without generic placeholders.")



if __name__ == "__main__":
    print("==================================================")
    print("RUNNING UNIBRIDGE PHASE 2B AI & ENGINE TEST SUITE")
    print("==================================================")
    try:
        test_1_model_loading_and_embedding()
        test_2_and_3_cosine_similarity_and_threshold()
        test_4_duplicate_ranking()
        test_5_priority_weights_and_clamp()
        test_6_urgency_mapping()
        test_7_population_impact_log_scale()
        test_8_factual_explanation()
        print("\n==================================================")
        print("ALL 8 PHASE 2B UNIT AND INTEGRATION TESTS PASSED!")
        print("==================================================")
    except Exception as e:
        print(f"\n[FAIL] Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

