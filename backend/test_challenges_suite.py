import sys
from pathlib import Path
from bson import ObjectId

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from app.main import app
from app.database.mongodb import get_users_collection, get_challenges_collection

client = TestClient(app)

def run_tests():
    print("========================================")
    print("UniBridge Challenges Module Test Suite")
    print("========================================")

    users = get_users_collection()
    challenges = get_challenges_collection()

    test_emails = [
        "citizen1.challenges@test.com",
        "citizen2.challenges@test.com",
        "university.challenges@test.ac.in",
    ]

    # Cleanup any leftovers
    users.delete_many({"email": {"$in": test_emails}})
    challenges.delete_many({"title": {"$regex": "^[TEST_CHALLENGE]"}})
    print("[Setup] Cleaned up previous test users and test challenges from MongoDB.")

    # 1. Register Citizen 1
    c1_res = client.post(
        "/api/auth/register/citizen",
        json={
            "full_name": "Citizen One",
            "email": "citizen1.challenges@test.com",
            "phone": "9876543211",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "state": "Tamil Nadu",
            "district": "Virudhunagar",
            "terms_accepted": True,
        },
    )
    assert c1_res.status_code == 201, f"Failed to register Citizen 1: {c1_res.text}"
    token_c1 = c1_res.json()["access_token"]
    user_c1_id = c1_res.json()["user"]["id"]
    headers_c1 = {"Authorization": f"Bearer {token_c1}"}
    print("[PASS] Setup: Citizen 1 registered successfully.")

    # 2. Register Citizen 2
    c2_res = client.post(
        "/api/auth/register/citizen",
        json={
            "full_name": "Citizen Two",
            "email": "citizen2.challenges@test.com",
            "phone": "9876543212",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "state": "Kerala",
            "district": "Wayanad",
            "terms_accepted": True,
        },
    )
    assert c2_res.status_code == 201, f"Failed to register Citizen 2: {c2_res.text}"
    token_c2 = c2_res.json()["access_token"]
    user_c2_id = c2_res.json()["user"]["id"]
    headers_c2 = {"Authorization": f"Bearer {token_c2}"}
    print("[PASS] Setup: Citizen 2 registered successfully.")

    # 3. Register University user
    uni_res = client.post(
        "/api/auth/register/university",
        json={
            "university_name": "Anna University",
            "university_email": "university.challenges@test.ac.in",
            "contact_person": "Dr. Ramanathan",
            "designation": "Dean of Research",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "state": "Tamil Nadu",
            "district": "Chennai",
            "expertise": ["Water Management"],
        },
    )
    assert uni_res.status_code == 201, f"Failed to register University user: {uni_res.text}"
    token_uni = uni_res.json()["access_token"]
    headers_uni = {"Authorization": f"Bearer {token_uni}"}
    print("[PASS] Setup: University user registered successfully.")

    # Test 1: Unauthenticated user cannot create a challenge
    res = client.post(
        "/api/challenges",
        json={
            "title": "[TEST_CHALLENGE] Unauthorized submission",
            "description": "This should fail because no token is provided.",
        },
    )
    assert res.status_code == 401, f"Expected 401, got {res.status_code}: {res.text}"
    print("[PASS] 1. Unauthenticated user rejected with 401 Unauthorized.")

    # Test 2: University user cannot create a challenge
    res = client.post(
        "/api/challenges",
        headers=headers_uni,
        json={
            "title": "[TEST_CHALLENGE] University role submission",
            "description": "University users should not be allowed to report civic challenges directly.",
        },
    )
    assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
    print("[PASS] 2. University user rejected with 403 Forbidden.")

    # Test 3: Invalid title/description is rejected
    res = client.post(
        "/api/challenges",
        headers=headers_c1,
        json={
            "title": "AB",  # Too short (min 3)
            "description": "Too short",  # Too short (min 10)
        },
    )
    assert res.status_code == 422, f"Expected 422 for invalid length, got {res.status_code}: {res.text}"
    print("[PASS] 3. Invalid challenge payload rejected with 422 Unprocessable Entity.")

    # Test 4: Citizen 1 can create a challenge
    challenge_payload = {
        "title": "[TEST_CHALLENGE] Irregular drinking water supply in rural area",
        "description": "Residents experience irregular drinking water supply and often need to travel long distances to collect water.",
        "category": "Water & Sanitation",
        "subcategory": "Rural Water Supply",
        "location": {
            "district": "Virudhunagar",
            "state": "Tamil Nadu",
            "latitude": 9.5872,
            "longitude": 77.9575,
            "address": "Srivilliputhur Village Ward 4",
        },
    }
    res = client.post("/api/challenges", headers=headers_c1, json=challenge_payload)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    c1_challenge = res.json()
    challenge_1_id = c1_challenge["id"]

    # Verify response schema
    assert c1_challenge["title"] == challenge_payload["title"]
    assert c1_challenge["description"] == challenge_payload["description"]
    assert c1_challenge["category"] == challenge_payload["category"]
    assert c1_challenge["status"] == "submitted"
    assert c1_challenge["reported_by"] == user_c1_id
    assert "created_at" in c1_challenge
    assert "updated_at" in c1_challenge
    print("[PASS] 4. Citizen 1 created challenge successfully (201 Created).")

    # Test 5: Verify challenge is stored in MongoDB Atlas and verified
    db_doc = challenges.find_one({"_id": ObjectId(challenge_1_id)})
    assert db_doc is not None, "Challenge document not found in MongoDB."
    assert db_doc["title"] == challenge_payload["title"]
    assert db_doc["reported_by"] == user_c1_id
    assert db_doc["status"] == "submitted"
    print("[PASS] 5. Challenge document confirmed directly in MongoDB Atlas collection.")

    # Test 6: Citizen 2 creates their own challenge
    res = client.post(
        "/api/challenges",
        headers=headers_c2,
        json={
            "title": "[TEST_CHALLENGE] Landslide risk monitoring along mountain roads",
            "description": "Frequent mudslides disrupt road connectivity during monsoon season.",
            "category": "Infrastructure",
            "location": {
                "district": "Wayanad",
                "state": "Kerala",
            },
        },
    )
    assert res.status_code == 201
    challenge_2_id = res.json()["id"]
    print("[PASS] 6. Citizen 2 created their own separate challenge.")

    # Test 7: GET /api/challenges/my returns only the logged-in citizen's challenges
    res_my_c1 = client.get("/api/challenges/my", headers=headers_c1)
    assert res_my_c1.status_code == 200, f"Expected 200, got {res_my_c1.status_code}: {res_my_c1.text}"
    c1_list = res_my_c1.json()
    assert len(c1_list) >= 1
    assert all(c["reported_by"] == user_c1_id for c in c1_list)
    assert any(c["id"] == challenge_1_id for c in c1_list)
    assert not any(c["id"] == challenge_2_id for c in c1_list)
    print("[PASS] 7. GET /api/challenges/my returns strictly Citizen 1's challenges.")

    res_my_c2 = client.get("/api/challenges/my", headers=headers_c2)
    assert res_my_c2.status_code == 200
    c2_list = res_my_c2.json()
    assert len(c2_list) >= 1
    assert all(c["reported_by"] == user_c2_id for c in c2_list)
    assert any(c["id"] == challenge_2_id for c in c2_list)
    assert not any(c["id"] == challenge_1_id for c in c2_list)
    print("[PASS] 8. GET /api/challenges/my returns strictly Citizen 2's challenges.")

    # Test 8: Citizen 1 can retrieve their own challenge by ID
    res = client.get(f"/api/challenges/{challenge_1_id}", headers=headers_c1)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    assert res.json()["id"] == challenge_1_id
    print("[PASS] 9. Citizen 1 can retrieve their own challenge by ID.")

    # Test 9: Citizen 2 cannot retrieve Citizen 1's challenge by ID (ownership protection)
    res = client.get(f"/api/challenges/{challenge_1_id}", headers=headers_c2)
    assert res.status_code == 403, f"Expected 403 Forbidden for cross-citizen access, got {res.status_code}: {res.text}"
    print("[PASS] 10. Citizen 2 blocked with 403 Forbidden when accessing Citizen 1's challenge.")

    # Test 10: Non-existent challenge returns 404
    fake_id = str(ObjectId())
    res = client.get(f"/api/challenges/{fake_id}", headers=headers_c1)
    assert res.status_code == 404, f"Expected 404, got {res.status_code}: {res.text}"
    print("[PASS] 11. Non-existent challenge ID returns 404 Not Found.")

    # Test 11: Invalid ObjectId format returns 404
    res = client.get("/api/challenges/invalid-id-format", headers=headers_c1)
    assert res.status_code == 404, f"Expected 404, got {res.status_code}: {res.text}"
    print("[PASS] 12. Malformed challenge ID returns 404 Not Found.")

    # Cleanup test records
    users.delete_many({"email": {"$in": test_emails}})
    challenges.delete_many({"_id": {"$in": [ObjectId(challenge_1_id), ObjectId(challenge_2_id)]}})
    print("[Cleanup] Cleaned up all test users and test challenges.")

    print("========================================")
    print("ALL 12 BACKEND CHALLENGE TESTS PASSED!")
    print("========================================")

if __name__ == "__main__":
    run_tests()
