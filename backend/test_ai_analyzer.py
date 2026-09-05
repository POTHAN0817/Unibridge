import sys
from pathlib import Path
from bson import ObjectId
from unittest.mock import patch

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from app.main import app
from app.database.mongodb import get_users_collection, get_challenges_collection
from app.database.taxonomy_db import get_all_taxonomy_records, seed_default_taxonomy_if_empty
from app.ai.problem_analyzer import analyze_problem, get_problem_analyzer
from app.ai.keyword_extractor import extract_keywords

client = TestClient(app)


def test_ai_analyzer_suite():
    print("==================================================")
    print("UniBridge ML & Database-Driven AI Analyzer Test Suite")
    print("==================================================")

    # -------------------------------------------------------------
    # Test 0: Verify Taxonomy is loaded from MongoDB Atlas
    # -------------------------------------------------------------
    seed_default_taxonomy_if_empty()
    db_taxonomy = get_all_taxonomy_records()
    assert len(db_taxonomy) >= 16, f"Expected at least 16 categories in DB, got {len(db_taxonomy)}"
    cat_names = [d["category"] for d in db_taxonomy]
    assert "Water" in cat_names
    assert "Agriculture" in cat_names
    assert "Healthcare" in cat_names
    assert "Education" in cat_names
    assert "Infrastructure" in cat_names
    print(f"[PASS] Test 0: Successfully loaded {len(db_taxonomy)} domain categories directly from MongoDB Atlas.")

    # -------------------------------------------------------------
    # Test 1: Water & Sanitation Challenge
    # -------------------------------------------------------------
    water_title = "Contaminated drinking water with fluoride and salinity"
    water_desc = (
        "Groundwater borehole in village tests positive for excessive fluoride and salinity, "
        "causing severe dental fluorosis and joint pain among children. "
        "Need water purification plant and filtration system."
    )
    res_water = analyze_problem(water_title, water_desc)
    print(f"\n[Case 1: Water]")
    print(f"  Category: {res_water['category']} | Subcategory: {res_water['subcategory']}")
    print(f"  Confidence: {res_water['confidence_score']}")
    print(f"  Keywords (spaCy): {res_water['keywords']}")
    print(f"  Skills (from DB): {res_water['required_skills']}")
    print(f"  Summary (spaCy + ML): {res_water['summary']}")
    assert res_water["category"] == "Water", f"Expected Water, got {res_water['category']}"
    assert res_water["confidence_score"] >= 0.70
    assert any("Water" in s or "Environmental" in s or "Chemical" in s or "Civil" in s for s in res_water["required_skills"])
    assert len(res_water["keywords"]) > 0
    assert res_water["model_version"] == "unibridge-ml-v1"
    print("[PASS] Case 1: Water challenge classified correctly via ML embeddings.")

    # -------------------------------------------------------------
    # Test 2: Agriculture & Cold Chain Challenge
    # -------------------------------------------------------------
    agri_title = "Tomato harvest rot due to lack of cold storage"
    agri_desc = (
        "Tomato farmers in Kolar district suffer heavy post-harvest crop loss because "
        "there is no cold storage facility or solar refrigeration near the local market, "
        "leading to ruined harvest and farmer debt."
    )
    res_agri = analyze_problem(agri_title, agri_desc)
    print(f"\n[Case 2: Agriculture]")
    print(f"  Category: {res_agri['category']} | Subcategory: {res_agri['subcategory']}")
    print(f"  Confidence: {res_agri['confidence_score']}")
    print(f"  Skills (from DB): {res_agri['required_skills']}")
    assert res_agri["category"] == "Agriculture", f"Expected Agriculture, got {res_agri['category']}"
    assert res_agri["subcategory"] in ["Cold Storage", "Storage", "Post-Harvest Loss", "Crop Storage"]
    assert res_agri["confidence_score"] >= 0.70
    assert any("Agricultural" in s or "Refrigeration" in s or "Mechanical" in s or "Storage" in s for s in res_agri["required_skills"])
    print("[PASS] Case 2: Agriculture challenge classified correctly.")

    # -------------------------------------------------------------
    # Test 3: Infrastructure & Road Challenge
    # -------------------------------------------------------------
    infra_title = "Severely damaged bridge and deep potholes on connecting road"
    infra_desc = (
        "Heavy monsoon rains washed away culvert bridge and created dangerous potholes on rural highway, "
        "disconnecting three villages and causing frequent road accidents and ambulance delays."
    )
    res_infra = analyze_problem(infra_title, infra_desc)
    print(f"\n[Case 3: Infrastructure]")
    print(f"  Category: {res_infra['category']} | Subcategory: {res_infra['subcategory']}")
    print(f"  Confidence: {res_infra['confidence_score']}")
    print(f"  Skills (from DB): {res_infra['required_skills']}")
    assert res_infra["category"] == "Infrastructure", f"Expected Infrastructure, got {res_infra['category']}"
    assert res_infra["subcategory"] in ["Roads", "Bridges", "Street Infrastructure"]
    assert res_infra["confidence_score"] >= 0.70
    assert any("Civil" in s or "Structural" in s or "Transportation" in s for s in res_infra["required_skills"])
    print("[PASS] Case 3: Infrastructure challenge classified correctly.")

    # -------------------------------------------------------------
    # Test 4: Healthcare Challenge
    # -------------------------------------------------------------
    health_title = "Lack of maternal diagnostic equipment in rural PHC"
    health_desc = (
        "Primary health centre has no ultrasound machine or diagnostic equipment for pregnant women, "
        "forcing patients to travel 50 km to district hospital for maternal checkups and emergency medicine."
    )
    res_health = analyze_problem(health_title, health_desc)
    print(f"\n[Case 4: Healthcare]")
    print(f"  Category: {res_health['category']} | Subcategory: {res_health['subcategory']}")
    print(f"  Confidence: {res_health['confidence_score']}")
    print(f"  Skills (from DB): {res_health['required_skills']}")
    assert res_health["category"] == "Healthcare", f"Expected Healthcare, got {res_health['category']}"
    assert res_health["confidence_score"] >= 0.70
    assert any("Public Health" in s or "Biomedical" in s or "Healthcare" in s or "Obstetrics" in s for s in res_health["required_skills"])
    print("[PASS] Case 4: Healthcare challenge classified correctly.")

    # -------------------------------------------------------------
    # Test 5: Education Challenge
    # -------------------------------------------------------------
    edu_title = "Dilapidated government school classrooms and computer shortage"
    edu_desc = (
        "Rural high school building roof leaks during rains, computer lab has non-functioning desktops, "
        "and teachers lack digital learning tools and textbooks for students."
    )
    res_edu = analyze_problem(edu_title, edu_desc)
    print(f"\n[Case 5: Education]")
    print(f"  Category: {res_edu['category']} | Subcategory: {res_edu['subcategory']}")
    print(f"  Confidence: {res_edu['confidence_score']}")
    print(f"  Skills (from DB): {res_edu['required_skills']}")
    assert res_edu["category"] == "Education", f"Expected Education, got {res_edu['category']}"
    assert res_edu["confidence_score"] >= 0.70
    assert any("Computer" in s or "Educational" in s or "Civil" in s for s in res_edu["required_skills"])
    print("[PASS] Case 5: Education challenge classified correctly.")

    # -------------------------------------------------------------
    # Test 6: Vague / Ambiguous Challenge
    # -------------------------------------------------------------
    vague_title = "Need help here urgently"
    vague_desc = "Something bad happened and people are unhappy, please send someone to check."
    res_vague = analyze_problem(vague_title, vague_desc)
    print(f"\n[Case 6: Vague / Ambiguous]")
    print(f"  Category: {res_vague['category']} | Subcategory: {res_vague['subcategory']}")
    print(f"  Confidence: {res_vague['confidence_score']}")
    assert res_vague["confidence_score"] < 0.65
    assert isinstance(res_vague["summary"], str) and len(res_vague["summary"]) > 0
    print("[PASS] Case 6: Vague input handled gracefully with lower confidence score.")

    # -------------------------------------------------------------
    # Test 7: spaCy Noun Chunk & Linguistic Keyword Extractor
    # -------------------------------------------------------------
    kws = extract_keywords("Solar powered cold storage unit for vegetables and fruits", "Installed near rural APMC market", max_keywords=4)
    assert len(kws) <= 4
    assert len(kws) > 0
    print(f"\n[PASS] Test 7: Dynamic spaCy keyword extraction: {kws}")

    # -------------------------------------------------------------
    # Test 8: End-to-End API Integration with Citizen & MongoDB
    # -------------------------------------------------------------
    users = get_users_collection()
    challenges = get_challenges_collection()

    test_email = "ml.ai.citizen@test.com"
    users.delete_many({"email": test_email})
    challenges.delete_many({"title": {"$regex": r"^\[ML_TEST\]"}})

    reg_res = client.post(
        "/api/auth/register/citizen",
        json={
            "full_name": "ML Test Citizen",
            "email": test_email,
            "phone": "9998887779",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "state": "Karnataka",
            "district": "Kolar",
            "terms_accepted": True,
        },
    )
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    create_res = client.post(
        "/api/challenges",
        headers=headers,
        data={
            "title": "[ML_TEST] Borewell drinking water contamination in village",
            "description": "Groundwater tested with hazardous arsenic and fluoride levels. Villagers have no clean drinking water.",
            "district": "Kolar",
            "state": "Karnataka",
        },
    )
    assert create_res.status_code == 201, f"Create challenge failed: {create_res.text}"
    c_data = create_res.json()
    assert c_data["status"] == "submitted"  # Lifecycle status remains 'submitted'
    assert c_data["ai_status"] == "completed"  # AI pipeline state is completed
    assert c_data["ai_analysis"] is not None
    assert c_data["ai_analysis"]["category"] == "Water"
    assert c_data["ai_analysis"]["confidence_score"] >= 0.70
    assert len(c_data["ai_analysis"]["required_skills"]) > 0
    assert c_data["ai_analysis"]["model_version"] == "unibridge-ml-v1"
    print(f"\n[PASS] Test 8: POST /api/challenges auto-analyzed and persisted ai_status='completed' with ML results.")

    # Verify MongoDB document
    db_item = challenges.find_one({"_id": ObjectId(c_data["id"])})
    assert db_item is not None
    assert db_item.get("ai_status") == "completed"
    assert db_item.get("ai_analysis") is not None
    assert db_item["ai_analysis"]["category"] == "Water"
    print("[PASS] Test 9: MongoDB document verified with full ML ai_analysis structure.")

    # Verify GET /api/challenges/{id}
    get_res = client.get(f"/api/challenges/{c_data['id']}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["ai_status"] == "completed"
    assert get_res.json()["ai_analysis"]["category"] == "Water"
    print("[PASS] Test 10: GET /api/challenges/{id} returns ML AI analysis.")

    # Verify GET /api/challenges/my
    my_res = client.get("/api/challenges/my", headers=headers)
    assert my_res.status_code == 200
    assert any(c["id"] == c_data["id"] and c.get("ai_status") == "completed" for c in my_res.json())
    print("[PASS] Test 11: GET /api/challenges/my includes ML AI analysis.")

    # -------------------------------------------------------------
    # Test 12: Resilience & Fault Tolerance Test
    # If the AI analyzer encounters an unexpected error, the challenge
    # MUST still be saved, the request MUST succeed (201), and ai_status
    # should be marked as 'failed' without losing the citizen's report.
    # -------------------------------------------------------------
    with patch("app.routers.challenges.analyze_problem", side_effect=RuntimeError("Simulated ML worker failure")):
        fail_res = client.post(
            "/api/challenges",
            headers=headers,
            data={
                "title": "[ML_TEST] Challenge during simulated ML worker outage",
                "description": "Testing that a failure in the ML analyzer does NOT abort challenge creation.",
                "district": "Kolar",
                "state": "Karnataka",
            },
        )
        assert fail_res.status_code == 201, f"Expected 201 despite AI failure, got {fail_res.status_code}: {fail_res.text}"
        fail_data = fail_res.json()
        assert fail_data["status"] == "submitted"
        assert fail_data["ai_status"] == "failed"
        assert fail_data["ai_analysis"] is None

        # Verify DB still has this challenge
        fail_db = challenges.find_one({"_id": ObjectId(fail_data["id"])})
        assert fail_db is not None
        assert fail_db.get("ai_status") == "failed"
        print("\n[PASS] Test 12: Resilience test passed — challenge created and saved to MongoDB even when ML worker raises an error.")

    # Cleanup test records
    users.delete_many({"email": test_email})
    challenges.delete_many({"title": {"$regex": r"^\[ML_TEST\]"}})
    print("\n[Teardown] ML AI Test records cleaned up.")
    print("==================================================")
    print("ALL 13 ML & DATABASE-DRIVEN AI TESTS PASSED!")
    print("==================================================")


if __name__ == "__main__":
    test_ai_analyzer_suite()
