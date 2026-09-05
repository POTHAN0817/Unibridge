import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from bson import ObjectId

from app.database.mongodb import get_universities_collection, get_challenges_collection
from app.schemas.university import UniversityProfileCreate, UniversityProfileUpdate
from app.ai.university_matcher import get_university_matcher

logger = logging.getLogger("unibridge.university_service")


def serialize_university(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Serialize a MongoDB university document into a JSON-safe response."""
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "short_name": doc.get("short_name"),
        "description": doc.get("description"),
        "website": doc.get("website"),
        "location": doc.get("location"),
        "departments": doc.get("departments", []),
        "research_areas": doc.get("research_areas", []),
        "skills": doc.get("skills", []),
        "infrastructure": doc.get("infrastructure", []),
        "previous_projects": doc.get("previous_projects", []),
        "faculty": doc.get("faculty", []),
        "student_skills": doc.get("student_skills", []),
        "availability": doc.get("availability", "available"),
        "created_by": str(doc.get("created_by", "")),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


def create_or_update_profile(user_id: str, profile_in: UniversityProfileCreate) -> Dict[str, Any]:
    """
    Create or update the university profile strictly for the authenticated user.
    Enforces that each university account owns exactly one profile document.
    """
    collection = get_universities_collection()
    now_iso = datetime.now(timezone.utc).isoformat()

    existing = collection.find_one({"created_by": user_id})
    profile_dict = profile_in.model_dump()
    profile_dict["updated_at"] = now_iso

    if existing:
        collection.update_one(
            {"_id": existing["_id"]},
            {"$set": profile_dict},
        )
        updated = collection.find_one({"_id": existing["_id"]})
        logger.info(f"Updated university profile {existing['_id']} for user {user_id}")
        return serialize_university(updated)
    else:
        profile_dict["created_by"] = user_id
        profile_dict["created_at"] = now_iso
        result = collection.insert_one(profile_dict)
        created = collection.find_one({"_id": result.inserted_id})
        logger.info(f"Created university profile {result.inserted_id} for user {user_id}")
        return serialize_university(created)


def get_profile_by_user_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve the university profile belonging to an authenticated user."""
    collection = get_universities_collection()
    doc = collection.find_one({"created_by": user_id})
    if not doc:
        return None
    return serialize_university(doc)


def get_profile_by_id(university_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a public/safe university profile by ID."""
    collection = get_universities_collection()
    try:
        query = {"_id": ObjectId(university_id)} if ObjectId.is_valid(university_id) else {"_id": university_id}
        doc = collection.find_one(query)
    except Exception:
        return None

    if not doc:
        return None
    return serialize_university(doc)


def get_all_universities() -> List[Dict[str, Any]]:
    """Retrieve all real university profiles currently registered in MongoDB."""
    collection = get_universities_collection()
    cursor = collection.find({})
    return [serialize_university(d) for d in cursor]


def match_universities_for_challenge(challenge_id: str) -> Dict[str, Any]:
    """
    Calculate and persist real university matches for a specific challenge.
    Uses sentence-transformers semantic matching against all real registered universities.
    """
    challenges_coll = get_challenges_collection()
    try:
        c_query = {"_id": ObjectId(challenge_id)} if ObjectId.is_valid(challenge_id) else {"_id": challenge_id}
        challenge = challenges_coll.find_one(c_query)
    except Exception:
        challenge = None

    if not challenge:
        now_iso = datetime.now(timezone.utc).isoformat()
        return {
            "status": "failed",
            "matches": [],
            "model_version": "unibridge-university-match-v1",
            "calculated_at": now_iso,
        }

    universities = get_all_universities()
    matcher = get_university_matcher()
    match_result = matcher.match_all_universities(challenge, universities)

    # Persist matches into challenge document
    try:
        challenges_coll.update_one(
            c_query,
            {"$set": {"university_matches": match_result, "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
    except Exception as exc:
        logger.error(f"Failed to persist university_matches for challenge {challenge_id}: {exc}")

    return match_result


def get_matched_challenges_for_university(user_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve challenges that match the authenticated university's profile.
    Only returns challenges where the university achieves a meaningful match score (>= 40).
    """
    uni_profile = get_profile_by_user_id(user_id)
    if not uni_profile:
        return []

    challenges_coll = get_challenges_collection()
    # Fetch recent challenges
    challenges = list(challenges_coll.find({}).sort("created_at", -1).limit(50))
    matcher = get_university_matcher()

    matched_list = []
    for ch in challenges:
        c_id = str(ch["_id"])
        match_candidate = matcher.calculate_match(ch, uni_profile)
        if match_candidate["score"] >= 40:
            matched_list.append({
                "challenge_id": c_id,
                "title": ch.get("title", ""),
                "description": ch.get("description", ""),
                "category": ch.get("category", "General"),
                "location": ch.get("location"),
                "status": ch.get("status", "submitted"),
                "priority_score": ch.get("priority_score"),
                "match_evaluation": match_candidate,
            })

    matched_list.sort(key=lambda x: x["match_evaluation"]["score"], reverse=True)
    return matched_list
