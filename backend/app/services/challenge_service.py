from datetime import datetime, timezone
from typing import Any, Optional
from bson import ObjectId

from app.database.mongodb import get_challenges_collection
from app.schemas.challenge import ChallengeCreate


def serialize_challenge(doc: dict[str, Any]) -> dict[str, Any]:
    """
    Format a MongoDB challenge document into a clean dictionary suitable for Pydantic response.
    Never exposes internal database-specific constructs.
    """
    raw_id = doc.get("_id")
    challenge_id = str(raw_id) if raw_id is not None else str(doc.get("id", ""))

    created_at = doc.get("created_at")
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()
    elif created_at is None:
        created_at = datetime.now(timezone.utc).isoformat()

    updated_at = doc.get("updated_at")
    if isinstance(updated_at, datetime):
        updated_at = updated_at.isoformat()
    elif updated_at is None:
        updated_at = created_at

    return {
        "id": challenge_id,
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "category": doc.get("category"),
        "subcategory": doc.get("subcategory"),
        "location": doc.get("location"),
        "reported_by": str(doc.get("reported_by", "")),
        "status": doc.get("status", "submitted"),
        "created_at": str(created_at),
        "updated_at": str(updated_at),
        "ai_analysis": doc.get("ai_analysis"),
        "priority_score": doc.get("priority_score"),
        "duplicate_of": doc.get("duplicate_of"),
        "matched_universities": doc.get("matched_universities"),
        "required_skills": doc.get("required_skills"),
        "validation": doc.get("validation"),
        "project": doc.get("project"),
        "impact": doc.get("impact"),
    }


def create_challenge(challenge_in: ChallengeCreate, user_id: str) -> dict[str, Any]:
    """
    Persist a newly submitted challenge into MongoDB.
    Automatically assigns status='submitted', timestamps, and sets reported_by
    exclusively from the authenticated user.
    """
    now = datetime.now(timezone.utc).isoformat()
    challenges = get_challenges_collection()

    location_data = None
    if challenge_in.location:
        location_data = {
            "district": challenge_in.location.district,
            "state": challenge_in.location.state,
            "latitude": challenge_in.location.latitude,
            "longitude": challenge_in.location.longitude,
            "address": challenge_in.location.address,
        }

    challenge_doc = {
        "title": challenge_in.title.strip(),
        "description": challenge_in.description.strip(),
        "category": challenge_in.category.strip() if challenge_in.category else None,
        "subcategory": challenge_in.subcategory.strip() if challenge_in.subcategory else None,
        "location": location_data,
        "reported_by": str(user_id),
        "status": "submitted",
        "created_at": now,
        "updated_at": now,
        # Future pipeline placeholders (no mock data, initialized empty)
        "ai_analysis": None,
        "priority_score": None,
        "duplicate_of": None,
        "matched_universities": None,
        "required_skills": None,
        "validation": None,
        "project": None,
        "impact": None,
    }

    result = challenges.insert_one(challenge_doc)
    challenge_doc["_id"] = result.inserted_id

    return serialize_challenge(challenge_doc)


def get_challenge_by_id(challenge_id: str) -> Optional[dict[str, Any]]:
    """
    Fetch a single challenge by its string ObjectId.
    """
    if not ObjectId.is_valid(challenge_id):
        return None

    challenges = get_challenges_collection()
    doc = challenges.find_one({"_id": ObjectId(challenge_id)})
    if not doc:
        return None

    return serialize_challenge(doc)


def get_challenges_by_reporter(user_id: str) -> list[dict[str, Any]]:
    """
    Retrieve all challenges reported by a specific user, sorted newest first.
    """
    challenges = get_challenges_collection()
    cursor = challenges.find({"reported_by": str(user_id)}).sort("created_at", -1)
    return [serialize_challenge(doc) for doc in cursor]


def get_all_challenges(limit: int = 100) -> list[dict[str, Any]]:
    """
    Fetch challenges across the system (reserved for future admin / authorized views).
    """
    challenges = get_challenges_collection()
    cursor = challenges.find().sort("created_at", -1).limit(limit)
    return [serialize_challenge(doc) for doc in cursor]
