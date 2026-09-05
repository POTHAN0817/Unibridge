import base64
import struct
import sys
import zlib
from pathlib import Path
from bson import ObjectId

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from app.main import app
from app.database.mongodb import get_users_collection, get_challenges_collection
from app.services.cloudinary_service import delete_challenge_image

client = TestClient(app)

def create_valid_png_bytes(width=10, height=10) -> bytes:
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    header = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    raw_data = b"".join(b"\x00" + b"\x00\xff\x00" * width for _ in range(height))
    idat = chunk(b"IDAT", zlib.compress(raw_data))
    iend = chunk(b"IEND", b"")
    return header + ihdr + idat + iend

def create_valid_jpeg_bytes() -> bytes:
    jpg_b64 = (
        "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQ"
        "ERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU"
        "FBQUFBQUFBQUFBQUFBT/wAARCAAKAAoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAA"
        "AgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6"
        "Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXG"
        "x8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREA"
        "AgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5"
        "OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPE"
        "xcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8qqKKKAP/2Q=="
    )
    return base64.b64decode(jpg_b64)

def create_valid_webp_bytes() -> bytes:
    # 1x1 WEBP lossy image
    webp_b64 = "UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAD8D+JaQAA3AA/ua1AAA="
    return base64.b64decode(webp_b64)


def run_tests():
    print("==================================================")
    print("UniBridge Challenges & Cloudinary Test Suite (15 Tests)")
    print("==================================================")

    users = get_users_collection()
    challenges = get_challenges_collection()

    test_emails = [
        "citizen1.challenges@test.com",
        "citizen2.challenges@test.com",
        "university.challenges@test.ac.in",
        "industry.challenges@test.com",
        "government.challenges@gov.in",
    ]

    # Cleanup any leftovers
    users.delete_many({"email": {"$in": test_emails}})
    challenges.delete_many({"title": {"$regex": "^[TEST_CHALLENGE]"}})
    print("[Setup] Cleaned up previous test records from MongoDB.")

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
    print("[Setup] Citizen 1 registered successfully.")

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
    headers_c2 = {"Authorization": f"Bearer {token_c2}"}
    print("[Setup] Citizen 2 registered successfully.")

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
    print("[Setup] University user registered successfully.")

    # 4. Register Industry user
    ind_res = client.post(
        "/api/auth/register/industry",
        json={
            "company_name": "AgroTech Solutions Pvt Ltd",
            "official_email": "industry.challenges@test.com",
            "contact_person": "Rajesh Kumar",
            "designation": "CSR Director",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "industry_sector": "Agriculture & Cold Chain",
            "location": "Chennai, Tamil Nadu",
            "expertise": ["IoT", "Cold Chain"],
        },
    )
    assert ind_res.status_code == 201, f"Failed to register Industry user: {ind_res.text}"
    token_ind = ind_res.json()["access_token"]
    headers_ind = {"Authorization": f"Bearer {token_ind}"}
    print("[Setup] Industry user registered successfully.")

    # 5. Register Government user
    gov_res = client.post(
        "/api/auth/register/government",
        json={
            "department_name": "Ministry of Agriculture",
            "official_email": "government.challenges@gov.in",
            "officer_name": "S. Murugan",
            "designation": "District Officer",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "state": "Tamil Nadu",
            "district": "Virudhunagar",
            "department_type": "Agriculture",
        },
    )
    assert gov_res.status_code == 201, f"Failed to register Government user: {gov_res.text}"
    token_gov = gov_res.json()["access_token"]
    headers_gov = {"Authorization": f"Bearer {token_gov}"}
    print("[Setup] Government user registered successfully.\n")

    uploaded_public_ids = []

    # -------------------------------------------------------------
    # Test 1: Citizen creates challenge without image -> success
    # -------------------------------------------------------------
    res1 = client.post(
        "/api/challenges",
        headers=headers_c1,
        data={
            "title": "[TEST_CHALLENGE] Rural water supply issue without photo",
            "description": "Residents experience irregular drinking water supply and travel long distances.",
            "category": "Water & Sanitation",
            "district": "Virudhunagar",
            "state": "Tamil Nadu",
        },
    )
    assert res1.status_code == 201, f"Test 1 failed: {res1.text}"
    c1_doc = res1.json()
    assert c1_doc["image"] is None
    assert c1_doc["status"] == "submitted"
    print("[PASS] 1. Citizen creates challenge without image -> success (image=null).")

    # -------------------------------------------------------------
    # Test 2: Citizen creates challenge with valid JPG -> success
    # -------------------------------------------------------------
    jpg_bytes = create_valid_jpeg_bytes()
    res2 = client.post(
        "/api/challenges",
        headers=headers_c1,
        data={
            "title": "[TEST_CHALLENGE] Irregular drinking water supply with JPG",
            "description": "Residents experience irregular drinking water supply and travel long distances.",
            "category": "Water & Sanitation",
            "district": "Virudhunagar",
            "state": "Tamil Nadu",
        },
        files={"photo": ("evidence.jpg", jpg_bytes, "image/jpeg")},
    )
    assert res2.status_code == 201, f"Test 2 failed: {res2.text}"
    c2_doc = res2.json()
    assert c2_doc["image"] is not None
    assert "url" in c2_doc["image"] and c2_doc["image"]["url"].startswith("http")
    assert "public_id" in c2_doc["image"] and "unibridge/challenges/" in c2_doc["image"]["public_id"]
    uploaded_public_ids.append(c2_doc["image"]["public_id"])
    print(f"[PASS] 2. Citizen creates challenge with valid JPG -> success ({c2_doc['image']['public_id']}).")

    # -------------------------------------------------------------
    # Test 3: Citizen creates challenge with valid PNG -> success
    # -------------------------------------------------------------
    png_bytes = create_valid_png_bytes(20, 20)
    res3 = client.post(
        "/api/challenges",
        headers=headers_c1,
        data={
            "title": "[TEST_CHALLENGE] Drainage overflow issue with PNG",
            "description": "Monsoon drainage overflow causing flooding in street lanes.",
            "category": "Infrastructure",
            "district": "Virudhunagar",
            "state": "Tamil Nadu",
        },
        files={"photo": ("drainage.png", png_bytes, "image/png")},
    )
    assert res3.status_code == 201, f"Test 3 failed: {res3.text}"
    c3_doc = res3.json()
    assert c3_doc["image"] is not None
    assert c3_doc["image"]["public_id"].startswith("unibridge/challenges/")
    uploaded_public_ids.append(c3_doc["image"]["public_id"])
    print(f"[PASS] 3. Citizen creates challenge with valid PNG -> success ({c3_doc['image']['public_id']}).")

    # -------------------------------------------------------------
    # Test 4: Citizen creates challenge with valid WEBP -> success
    # -------------------------------------------------------------
    webp_bytes = create_valid_webp_bytes()
    res4 = client.post(
        "/api/challenges",
        headers=headers_c1,
        data={
            "title": "[TEST_CHALLENGE] Waste disposal issue with WEBP",
            "description": "Lack of community waste segregation bins near the local marketplace.",
            "category": "Environment",
            "district": "Virudhunagar",
            "state": "Tamil Nadu",
        },
        files={"photo": ("bins.webp", webp_bytes, "image/webp")},
    )
    assert res4.status_code == 201, f"Test 4 failed: {res4.text}"
    c4_doc = res4.json()
    assert c4_doc["image"] is not None
    assert c4_doc["image"]["public_id"].startswith("unibridge/challenges/")
    uploaded_public_ids.append(c4_doc["image"]["public_id"])
    print(f"[PASS] 4. Citizen creates challenge with valid WEBP -> success ({c4_doc['image']['public_id']}).")

    # -------------------------------------------------------------
    # Test 5: Image is uploaded to Cloudinary
    # -------------------------------------------------------------
    assert c2_doc["image"]["url"].startswith("https://res.cloudinary.com/")
    print(f"[PASS] 5. Image is uploaded to Cloudinary: {c2_doc['image']['url']}")

    # -------------------------------------------------------------
    # Test 6: MongoDB stores Cloudinary image metadata
    # -------------------------------------------------------------
    db_record = challenges.find_one({"_id": ObjectId(c2_doc["id"])})
    assert db_record is not None
    assert "image" in db_record and db_record["image"] is not None
    assert db_record["image"]["public_id"] == c2_doc["image"]["public_id"]
    assert db_record["image"]["url"] == c2_doc["image"]["url"]
    print("[PASS] 6. MongoDB stores Cloudinary image metadata (url, public_id, format).")

    # -------------------------------------------------------------
    # Test 7: MongoDB does NOT store image binary
    # -------------------------------------------------------------
    assert "data" not in db_record["image"]
    assert "bytes" not in db_record["image"]
    assert not isinstance(db_record["image"].get("url"), (bytes, bytearray))
    print("[PASS] 7. MongoDB does NOT store image binary (metadata only).")

    # -------------------------------------------------------------
    # Test 8: File larger than 5 MB -> rejected
    # -------------------------------------------------------------
    large_file_bytes = b"\xff\xd8\xff" + b"0" * (5 * 1024 * 1024 + 100)
    res8 = client.post(
        "/api/challenges",
        headers=headers_c1,
        data={
            "title": "[TEST_CHALLENGE] File exceeding 5 MB limit",
            "description": "Testing rejection of images larger than 5MB.",
            "category": "Water",
        },
        files={"photo": ("large.jpg", large_file_bytes, "image/jpeg")},
    )
    assert res8.status_code == 400, f"Expected 400, got {res8.status_code}: {res8.text}"
    print("[PASS] 8. File larger than 5 MB -> rejected (400 Bad Request).")

    # -------------------------------------------------------------
    # Test 9: Unsupported file type -> rejected
    # -------------------------------------------------------------
    pdf_bytes = b"%PDF-1.4 Fake PDF content for testing"
    res9 = client.post(
        "/api/challenges",
        headers=headers_c1,
        data={
            "title": "[TEST_CHALLENGE] PDF file upload rejection",
            "description": "Testing rejection of non-image file uploads.",
            "category": "Water",
        },
        files={"photo": ("report.pdf", pdf_bytes, "application/pdf")},
    )
    assert res9.status_code == 400, f"Expected 400, got {res9.status_code}: {res9.text}"
    print("[PASS] 9. Unsupported file type (PDF) -> rejected (400 Bad Request).")

    # -------------------------------------------------------------
    # Test 10: Unauthenticated user -> rejected
    # -------------------------------------------------------------
    res10 = client.post(
        "/api/challenges",
        data={
            "title": "[TEST_CHALLENGE] Unauthenticated submission",
            "description": "Should fail with 401 unauthorized.",
        },
    )
    assert res10.status_code == 401, f"Expected 401, got {res10.status_code}: {res10.text}"
    print("[PASS] 10. Unauthenticated user -> rejected (401 Unauthorized).")

    # -------------------------------------------------------------
    # Test 11: University user -> rejected
    # -------------------------------------------------------------
    res11 = client.post(
        "/api/challenges",
        headers=headers_uni,
        data={
            "title": "[TEST_CHALLENGE] University attempting to report challenge",
            "description": "University user should not be authorized to create citizen challenges.",
        },
    )
    assert res11.status_code == 403, f"Expected 403, got {res11.status_code}: {res11.text}"
    print("[PASS] 11. University user -> rejected (403 Forbidden).")

    # -------------------------------------------------------------
    # Test 12: Industry user -> rejected
    # -------------------------------------------------------------
    res12 = client.post(
        "/api/challenges",
        headers=headers_ind,
        data={
            "title": "[TEST_CHALLENGE] Industry attempting to report challenge",
            "description": "Industry user should not be authorized to create citizen challenges.",
        },
    )
    assert res12.status_code == 403, f"Expected 403, got {res12.status_code}: {res12.text}"
    print("[PASS] 12. Industry user -> rejected (403 Forbidden).")

    # -------------------------------------------------------------
    # Test 13: Government user -> rejected
    # -------------------------------------------------------------
    res13 = client.post(
        "/api/challenges",
        headers=headers_gov,
        data={
            "title": "[TEST_CHALLENGE] Government attempting to report challenge",
            "description": "Government user should not be authorized to create citizen challenges.",
        },
    )
    assert res13.status_code == 403, f"Expected 403, got {res13.status_code}: {res13.text}"
    print("[PASS] 13. Government user -> rejected (403 Forbidden).")

    # -------------------------------------------------------------
    # Test 14: Challenge without image remains compatible with existing data
    # -------------------------------------------------------------
    legacy_res = client.post(
        "/api/challenges",
        headers=headers_c2,
        json={
            "title": "[TEST_CHALLENGE] Legacy JSON challenge without image field",
            "description": "Tests backward compatibility with raw JSON requests.",
            "category": "Education",
        },
    )
    assert legacy_res.status_code == 201, f"Test 14 failed: {legacy_res.text}"
    legacy_doc = legacy_res.json()
    assert legacy_doc["image"] is None
    print("[PASS] 14. Challenge without image remains 100% compatible with existing data.")

    # -------------------------------------------------------------
    # Test 15: GET /api/challenges/my returns image metadata when present
    # -------------------------------------------------------------
    my_res = client.get("/api/challenges/my", headers=headers_c1)
    assert my_res.status_code == 200
    my_challenges = my_res.json()
    assert len(my_challenges) >= 3
    found_with_image = [c for c in my_challenges if c.get("image") is not None]
    assert len(found_with_image) >= 1
    sample_img = found_with_image[0]["image"]
    assert "url" in sample_img and "public_id" in sample_img
    print(f"[PASS] 15. GET /api/challenges/my returns image metadata when present ({sample_img['url']}).")

    # -------------------------------------------------------------
    # Teardown & Cloudinary Cleanup
    # -------------------------------------------------------------
    print("\n[Teardown] Cleaning up test Cloudinary assets...")
    for pid in uploaded_public_ids:
        deleted = delete_challenge_image(pid)
        print(f"  - Deleted asset '{pid}': {deleted}")

    users.delete_many({"email": {"$in": test_emails}})
    challenges.delete_many({"title": {"$regex": "^[TEST_CHALLENGE]"}})
    print("[Teardown] MongoDB test records cleaned up.")

    print("==================================================")
    print("ALL 15 TESTS PASSED SUCCESSFULLY!")
    print("==================================================")


if __name__ == "__main__":
    run_tests()
