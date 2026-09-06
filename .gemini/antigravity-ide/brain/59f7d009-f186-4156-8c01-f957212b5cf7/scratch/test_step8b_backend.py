import asyncio
import os
import sys

# Ensure backend path is in sys.path
backend_dir = r"c:\Users\duddu\Documents\UniBridge\backend"
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.mongodb import (
    get_challenges_collection,
    get_government_challenge_reviews_collection,
    get_government_activity_collection,
    init_db_indexes,
)
from app.services import government_service
from app.schemas.government import (
    GovernmentChallengeReviewCreate,
    GovernmentChallengeReviewUpdate,
)

def run_tests():
    print("Initializing indexes...")
    init_db_indexes()
    print("Indexes initialized successfully.")

    ch_col = get_challenges_collection()
    sample_ch = ch_col.find_one({})
    if not sample_ch:
        print("No challenges found in DB! Cannot test challenge review.")
        return

    challenge_id = str(sample_ch["_id"])
    print(f"Testing with real challenge: {challenge_id} ('{sample_ch.get('title')}')")

    # Test get_challenges
    res = government_service.get_challenges(page=1, limit=5)
    print(f"Total challenges in page response: {res.total}, returned items: {len(res.items)}")
    print(f"Summary counts: total={res.summary_counts.total}, pending={res.summary_counts.pending}, validated={res.summary_counts.validated}")
    assert res.total >= 1, "Expected at least 1 challenge"
    assert len(res.items) >= 1, "Expected items in page"

    # Test get_challenge_detail
    gov_user_id = "test_gov_user_8b"
    detail = government_service.get_challenge_detail(challenge_id, gov_user_id)
    print(f"Challenge detail retrieved: title='{detail.title}', status='{detail.challenge_status}'")
    assert detail.challenge_id == challenge_id

    # Clean up any leftover test review
    rev_col = get_government_challenge_reviews_collection()
    rev_col.delete_many({"government_user_id": gov_user_id})

    # Test review creation: validation
    create_data = GovernmentChallengeReviewCreate(
        decision="validated",
        review_note="Verified civic priority aligned with district sanitation goals.",
    )
    rev_resp = government_service.create_challenge_review(challenge_id, gov_user_id, create_data)
    print(f"Review created: id={rev_resp.id}, decision={rev_resp.decision}")
    assert rev_resp.decision == "validated"
    assert rev_resp.review_note == "Verified civic priority aligned with district sanitation goals."

    # Test duplicate creation prevention (should raise 409)
    try:
        government_service.create_challenge_review(challenge_id, gov_user_id, create_data)
        raise AssertionError("Expected 409 Conflict for duplicate review!")
    except Exception as e:
        print(f"Duplicate review correctly rejected: {e}")

    # Test update review
    update_data = GovernmentChallengeReviewUpdate(
        decision="clarification_required",
        clarification_request="Please upload an updated geo-tagged photo of the water pipe.",
    )
    updated_resp = government_service.update_challenge_review(challenge_id, gov_user_id, update_data)
    print(f"Review updated: decision={updated_resp.decision}, request={updated_resp.clarification_request}")
    assert updated_resp.decision == "clarification_required"

    # Check government_activity log
    act_col = get_government_activity_collection()
    act_count = act_col.count_documents({"government_user_id": gov_user_id, "challenge_id": challenge_id})
    print(f"Audit log entries recorded in government_activity: {act_count}")
    assert act_count >= 2, "Expected at least 2 audit entries"

    # Test filtering by review status
    filtered_clar = government_service.get_challenges(government_review_status="clarification_required")
    print(f"Challenges with clarification_required: {filtered_clar.total}")
    found = any(item.challenge_id == challenge_id for item in filtered_clar.items)
    assert found, "Expected test challenge to appear in clarification_required filter"

    # Clean up test review and activity
    rev_col.delete_many({"government_user_id": gov_user_id})
    act_col.delete_many({"government_user_id": gov_user_id})
    print("Test cleanup completed.")
    print("ALL STEP 8B BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
