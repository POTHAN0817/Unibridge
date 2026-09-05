"""
Automated Test Suite for Phase 3A: Real University Intelligence + University Matching
Tests:
1. Term & Skill Normalization
2. Semantic University Matcher (6 Factors + Levels + Explanations)
3. University Profile Lifecycle (Create, Read, Update)
4. Role-based Access Control (Citizens cannot manage university profiles)
5. Cross-University Isolation (University A cannot overwrite University B's profile)
6. End-to-End Challenge Matching (Calculation, Persistence, Challenge/University Match Endpoints)
"""

import sys
import os
import requests
import uuid

BASE_URL = os.environ.get("TEST_BASE_URL", "http://127.0.0.1:8000")

def run_normalization_tests():
    print("\n--- 1. Testing Term & Skill Normalization ---")
    from app.ai.university_matcher import normalize_term

    tests = [
        ("AI", "artificial intelligence"),
        ("ML", "machine learning"),
        ("IoT", "internet of things"),
        ("GIS", "geographic information systems"),
        ("Renewable Energies", "renewable energy"),
        ("Hydrological Models", "hydrological model"),
        ("Water Purification Systems", "water purification system"),
        ("Computer Science & Engineering", "computer science and engineering"),
    ]
    for raw, expected in tests:
        res = normalize_term(raw)
        assert res == expected, f"Expected normalize_term('{raw}') to be '{expected}', got '{res}'"
        print(f"  [PASS] normalize_term('{raw}') -> '{res}'")
    print("All normalization tests passed!")

def run_matcher_unit_tests():
    print("\n--- 2. Testing UniversityMatcher AI Engine ---")
    from app.ai.university_matcher import get_university_matcher

    matcher = get_university_matcher()

    water_challenge = {
        "id": "chal-water-01",
        "title": "Severe Groundwater Arsenic Contamination and Safe Filtration",
        "description": "Rural communities in Nadia district face severe arsenic poisoning in tubewell drinking water. Need solar-powered nanofiltration units, water quality monitoring sensors, and decentralized purification plants.",
        "category": "Water & Sanitation",
        "required_expertise": ["Water Purification", "Environmental Engineering", "Nanotechnology"],
        "keywords": ["arsenic", "nanofiltration", "drinking water", "water quality"],
        "location": {
            "address": "Nadia District",
            "district": "Nadia",
            "state": "West Bengal",
        },
    }

    water_uni = {
        "id": "uni-water-tech",
        "name": "State University of Water & Environmental Sciences",
        "location": {
            "state": "West Bengal",
            "city": "Kalyani",
            "district": "Nadia",
        },
        "availability_status": "Actively Seeking",
        "departments": [
            {
                "name": "Department of Environmental Engineering & Hydrology",
                "research_areas": ["Groundwater Contamination", "Arsenic Removal", "Water Quality Monitoring"],
                "faculty": [
                    {
                        "name": "Dr. S. Mukherjee",
                        "designation": "Professor",
                        "expertise": ["Arsenic filtration", "Nanotechnology for water purification", "Hydrochemistry"],
                    }
                ],
                "student_skills": ["Water Quality Testing", "Nanofiltration", "IoT Water Sensors"],
                "infrastructure": ["Water Quality Testing Laboratory", "Environmental Nanotech Cleanroom"],
            }
        ],
        "previous_projects": [
            {
                "title": "Community Arsenic Removal Filter Deployment",
                "domain": "Water Treatment",
                "outcome": "Deployed 50 community gravity-feed arsenic filters across Nadia villages",
            }
        ],
    }

    robotics_uni = {
        "id": "uni-robotics",
        "name": "Autonomous Robotics & Aerospace Institute",
        "location": {
            "state": "Karnataka",
            "city": "Bengaluru",
            "district": "Bengaluru Urban",
        },
        "availability_status": "Actively Seeking",
        "departments": [
            {
                "name": "Department of Aerospace & Flight Controls",
                "research_areas": ["Quadcopter Dynamics", "Avionics", "Space Robotics"],
                "faculty": [
                    {
                        "name": "Dr. R. Sharma",
                        "designation": "Professor",
                        "expertise": ["Drone flight controllers", "SLAM algorithms", "Aerodynamics"],
                    }
                ],
                "student_skills": ["ROS", "C++", "Drone Assembly"],
                "infrastructure": ["Subsonic Wind Tunnel", "Flight Simulation Rig"],
            }
        ],
        "previous_projects": [
            {
                "title": "Autonomous Indoor Warehouse Drone",
                "domain": "Robotics",
                "outcome": "Automated pallet scanning with 99.8% precision",
            }
        ],
    }

    # Match single universities
    res_water = matcher.calculate_match(water_challenge, water_uni)
    res_robotics = matcher.calculate_match(water_challenge, robotics_uni)

    print(f"  Water University Match Score: {res_water['overall_score']} ({res_water['match_level']})")
    print(f"    Factors: {res_water['factors']}")
    print(f"    Explanation: {res_water['explanation']}")
    print(f"  Robotics University Match Score: {res_robotics['overall_score']} ({res_robotics['match_level']})")
    print(f"    Factors: {res_robotics['factors']}")

    assert res_water["overall_score"] > res_robotics["overall_score"] + 30, (
        f"Expected Water University score ({res_water['overall_score']}) to be substantially higher than Robotics ({res_robotics['overall_score']})"
    )
    assert res_water["match_level"] in ["High Match", "Good Match"]
    assert "Arsenic" in res_water["explanation"] or "Water" in res_water["explanation"]
    assert res_water["factors"]["location_proximity_score"] == 100.0  # same district & state

    # Match all candidates ranking
    ranked = matcher.match_all_universities(water_challenge, [robotics_uni, water_uni])
    assert len(ranked["matches"]) == 2
    assert ranked["matches"][0]["university_id"] == "uni-water-tech"
    print("  [PASS] University ranking correctly puts Water University as top match!")

    # Empty candidate test
    empty_result = matcher.match_all_universities(water_challenge, [])
    assert empty_result["status"] == "no_candidates"
    assert len(empty_result["matches"]) == 0
    print("  [PASS] Empty candidate pool gracefully returns status='no_candidates'")

def run_api_integration_tests():
    print("\n--- 3. Testing Real University API & Database Endpoints ---")
    
    # 1. Register a new University user
    uni_email = f"test_uni_{uuid.uuid4().hex[:6]}@unibridge.edu"
    password = "Password123!"
    reg_res = requests.post(f"{BASE_URL}/api/auth/register/university", json={
        "university_name": "Dr. B. R. Ambedkar Institute of Technology",
        "university_email": uni_email,
        "contact_person": "Dr. Pradip Roy",
        "designation": "Dean of R&D",
        "password": password,
        "confirm_password": password,
        "state": "West Bengal",
        "district": "Paschim Bardhaman",
        "expertise": ["Environmental Engineering", "Water Purification"],
    })
    assert reg_res.status_code == 201, f"University registration failed: {reg_res.text}"
    uni_token = reg_res.json()["access_token"]
    uni_headers = {"Authorization": f"Bearer {uni_token}"}
    print(f"  [PASS] Registered university user: {uni_email}")

    # 2. Register a Citizen user for role boundary testing
    citizen_email = f"test_cit_{uuid.uuid4().hex[:6]}@citizen.org"
    cit_reg = requests.post(f"{BASE_URL}/api/auth/register/citizen", json={
        "full_name": "Sunil Citizen",
        "email": citizen_email,
        "phone": "+919876543210",
        "password": password,
        "confirm_password": password,
        "state": "West Bengal",
        "district": "Paschim Bardhaman",
        "terms_accepted": True,
    })
    assert cit_reg.status_code == 201, f"Citizen registration failed: {cit_reg.text}"
    cit_token = cit_reg.json()["access_token"]
    cit_headers = {"Authorization": f"Bearer {cit_token}"}
    print(f"  [PASS] Registered citizen user: {citizen_email}")

    # 3. Citizen attempts to create university profile -> MUST BE 403 FORBIDDEN
    cit_profile_res = requests.post(
        f"{BASE_URL}/api/universities/profile",
        headers=cit_headers,
        json={"name": "Fake University", "location": {"state": "Delhi"}}
    )
    assert cit_profile_res.status_code == 403, f"Expected 403 for Citizen, got {cit_profile_res.status_code}"
    print("  [PASS] Citizen correctly blocked with 403 from university profile management")

    # 4. University creates institutional profile
    profile_payload = {
        "name": "Ambedkar Institute of Technology & Environmental Studies",
        "short_name": "AITES",
        "description": "Leading state institute dedicated to sustainable environmental engineering, rural energy, and water management.",
        "location": {
            "address": "Grand Trunk Road",
            "city": "Asansol",
            "district": "Paschim Bardhaman",
            "state": "West Bengal",
            "pincode": "713301"
        },
        "availability_status": "Actively Seeking",
        "departments": [
            {
                "name": "Department of Environmental & Chemical Engineering",
                "research_areas": ["Drinking Water Purification", "Heavy Metal Adsorption", "Community Filtration"],
                "faculty": [
                    {
                        "name": "Dr. Pradip Roy",
                        "designation": "Professor & Head",
                        "expertise": ["Arsenic removal", "Membrane filtration", "Industrial effluent treatment"]
                    }
                ],
                "student_skills": ["Water Quality Testing", "Pilot Plant Operation", "Sensor Calibration"],
                "infrastructure": ["Environmental Analytics Lab", "Spectrophotometer Facility"]
            }
        ],
        "previous_projects": [
            {
                "title": "Low-Cost Arsenic Filter for Rural Bengal",
                "domain": "Water Treatment",
                "outcome": "Installed across 35 village panchayats with 98% arsenic reduction"
            }
        ]
    }

    create_res = requests.post(
        f"{BASE_URL}/api/universities/profile",
        headers=uni_headers,
        json=profile_payload
    )
    assert create_res.status_code == 200, f"Failed to create profile: {create_res.text}"
    uni_data = create_res.json()
    assert uni_data["short_name"] == "AITES"
    assert len(uni_data["departments"]) == 1
    uni_id = uni_data["id"]
    print(f"  [PASS] University profile created successfully with ID: {uni_id}")

    # 5. University retrieves own profile
    get_profile_res = requests.get(f"{BASE_URL}/api/universities/profile", headers=uni_headers)
    assert get_profile_res.status_code == 200
    assert get_profile_res.json()["id"] == uni_id
    print("  [PASS] University retrieved own profile from MongoDB")

    # 6. University B registration and isolation test
    uni_b_email = f"test_uni_b_{uuid.uuid4().hex[:6]}@uni-b.edu"
    reg_b = requests.post(f"{BASE_URL}/api/auth/register/university", json={
        "university_name": "Second University",
        "university_email": uni_b_email,
        "contact_person": "Prof. S. Das",
        "designation": "Registrar",
        "password": password,
        "confirm_password": password,
        "state": "Karnataka",
        "district": "Bengaluru",
        "expertise": ["Aerospace"],
    })
    uni_b_token = reg_b.json()["access_token"]
    uni_b_headers = {"Authorization": f"Bearer {uni_b_token}"}

    # University B profile is initially empty
    b_profile_res = requests.get(f"{BASE_URL}/api/universities/profile", headers=uni_b_headers)
    assert b_profile_res.status_code == 404 or b_profile_res.json() is None, "University B should not see University A's profile"
    print("  [PASS] Cross-university profile isolation verified (University B profile is empty)")

    # 7. Citizen submits a challenge relevant to water filtration
    challenge_payload = {
        "title": "Dangerous Arsenic Contamination in Village Tubewells",
        "description": "High concentration of arsenic detected in groundwater across rural schools in Paschim Bardhaman. Schoolchildren and villagers are suffering from dermatitis and toxicity. Urgently require community water purification plant and continuous heavy metal sensing.",
        "category": "Water & Sanitation",
        "urgency": "High",
        "state": "West Bengal",
        "district": "Paschim Bardhaman",
        "address": "Raniganj Block",
        "affected_count": "5,000+ villagers",
    }
    submit_res = requests.post(f"{BASE_URL}/api/challenges", headers=cit_headers, json=challenge_payload)
    assert submit_res.status_code == 201, f"Failed to submit challenge: {submit_res.text}"
    challenge_data = submit_res.json()
    chal_id = challenge_data["id"]
    print(f"  [PASS] Citizen submitted challenge ID: {chal_id}")

    # 8. Verify university matches were automatically computed on challenge
    uni_matches = challenge_data.get("university_matches")
    print(f"  DEBUG uni_matches: {uni_matches}")
    assert uni_matches is not None, "university_matches field should be present on challenge response"
    assert len(uni_matches["matches"]) > 0, f"Should have matched at least the registered university, got {uni_matches}"
    top_match = uni_matches["matches"][0]
    print(f"  Top Match on Challenge Creation: {top_match['university_name']} -> Score {top_match['overall_score']} ({top_match['match_level']})")
    assert top_match["overall_score"] >= 60, f"Expected high match score for relevant water challenge, got {top_match['overall_score']}"
    assert "Arsenic" in top_match["explanation"] or "Water" in top_match["explanation"]

    # 9. Verify GET /api/challenges/{challenge_id}/university-matches endpoint
    get_matches_res = requests.get(f"{BASE_URL}/api/challenges/{chal_id}/university-matches")
    assert get_matches_res.status_code == 200
    m_body = get_matches_res.json()
    assert len(m_body["matches"]) > 0
    assert m_body["matches"][0]["university_id"] == uni_id
    print("  [PASS] GET /api/challenges/{id}/university-matches returned correct rankings")

    # 10. Verify GET /api/universities/challenges/matches endpoint for authenticated university
    uni_chal_matches_res = requests.get(f"{BASE_URL}/api/universities/challenges/matches", headers=uni_headers)
    assert uni_chal_matches_res.status_code == 200
    matched_challenges = uni_chal_matches_res.json()
    assert len(matched_challenges) > 0
    assert any(item["challenge_id"] == chal_id for item in matched_challenges)
    print(f"  [PASS] GET /api/universities/challenges/matches returned challenge for university (total {len(matched_challenges)} matched)")

    print("\n=======================================================")
    print("ALL PHASE 3A UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    try:
        run_normalization_tests()
        run_matcher_unit_tests()
        run_api_integration_tests()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n[FAIL] Test suite encountered an error: {e}")
        sys.exit(1)
