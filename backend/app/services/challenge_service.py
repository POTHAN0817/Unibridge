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
        "ai_status": doc.get("ai_status", "pending"),
        "affected_people": doc.get("affected_people"),
        "urgency": doc.get("urgency"),
        "citizen_tags": doc.get("citizen_tags"),
        "created_at": str(created_at),
        "updated_at": str(updated_at),
        "ai_analysis": doc.get("ai_analysis"),
        "duplicate_analysis": doc.get("duplicate_analysis"),
        "priority_analysis": doc.get("priority_analysis"),
        "priority_score": doc.get("priority_score"),
        "duplicate_of": doc.get("duplicate_of"),
        "matched_universities": doc.get("matched_universities"),
        "required_skills": doc.get("required_skills"),
        "validation": doc.get("validation"),
        "project": doc.get("project"),
        "impact": doc.get("impact"),
        "image": doc.get("image"),
    }


def create_challenge(
    challenge_in: ChallengeCreate,
    user_id: str,
    image_data: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """
    Persist a newly submitted challenge into MongoDB.
    Automatically assigns status='submitted', timestamps, and sets reported_by
    exclusively from the authenticated user.
    Stores Cloudinary image metadata if provided.
    Stores real user-provided affected_people and urgency.
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

    image_dict = None
    if image_data:
        image_dict = {
            "url": str(image_data.get("url", "")),
            "public_id": str(image_data.get("public_id", "")),
            "format": image_data.get("format"),
            "width": image_data.get("width"),
            "height": image_data.get("height"),
        }
    elif challenge_in.image:
        image_dict = {
            "url": challenge_in.image.url,
            "public_id": challenge_in.image.public_id,
            "format": challenge_in.image.format,
            "width": challenge_in.image.width,
            "height": challenge_in.image.height,
        }

    challenge_doc = {
        "title": challenge_in.title.strip(),
        "description": challenge_in.description.strip(),
        "category": challenge_in.category.strip() if challenge_in.category else None,
        "subcategory": challenge_in.subcategory.strip() if challenge_in.subcategory else None,
        "location": location_data,
        "reported_by": str(user_id),
        "status": "submitted",
        "ai_status": "pending",
        "affected_people": challenge_in.affected_people,
        "urgency": challenge_in.urgency,
        "citizen_tags": challenge_in.citizen_tags,
        "created_at": now,
        "updated_at": now,
        "image": image_dict,
        # AI & Phase 2B fields
        "ai_analysis": None,
        "duplicate_analysis": None,
        "priority_analysis": None,
        "priority_score": None,
        "embedding": None,
        # Future pipeline placeholders
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


def update_challenge_full_ai(
    challenge_id: str,
    ai_analysis: Optional[dict[str, Any]] = None,
    duplicate_analysis: Optional[dict[str, Any]] = None,
    priority_analysis: Optional[dict[str, Any]] = None,
    embedding: Optional[dict[str, Any]] = None,
    ai_status: str = "completed",
) -> Optional[dict[str, Any]]:
    """
    Atomically update a challenge document in MongoDB with full Phase 2A and Phase 2B outputs:
    - Phase 2A problem analysis (category, subcategory, skills, summary, keywords)
    - Phase 2B duplicate detection (is_duplicate, similarity, candidates)
    - Phase 2B explainable priority analysis (score, level, factors, explanation)
    - Challenge embedding vector for efficient subsequent duplicate lookups
    """
    if not ObjectId.is_valid(challenge_id):
        return None

    now = datetime.now(timezone.utc).isoformat()
    challenges = get_challenges_collection()

    update_fields: dict[str, Any] = {
        "ai_status": ai_status,
        "updated_at": now,
    }

    if ai_analysis:
        update_fields["ai_analysis"] = ai_analysis
        if ai_analysis.get("category"):
            update_fields["category"] = ai_analysis["category"]
        if ai_analysis.get("subcategory"):
            update_fields["subcategory"] = ai_analysis["subcategory"]
        if ai_analysis.get("required_skills"):
            update_fields["required_skills"] = ai_analysis["required_skills"]

    if duplicate_analysis:
        update_fields["duplicate_analysis"] = duplicate_analysis
        if duplicate_analysis.get("matched_challenge_id"):
            update_fields["duplicate_of"] = duplicate_analysis["matched_challenge_id"]

    if priority_analysis:
        update_fields["priority_analysis"] = priority_analysis
        if "score" in priority_analysis:
            update_fields["priority_score"] = priority_analysis["score"]

    if embedding:
        update_fields["embedding"] = embedding

    challenges.update_one(
        {"_id": ObjectId(challenge_id)},
        {"$set": update_fields},
    )

    doc = challenges.find_one({"_id": ObjectId(challenge_id)})
    return serialize_challenge(doc) if doc else None


def update_challenge_ai_analysis(
    challenge_id: str,
    ai_analysis: Optional[dict[str, Any]],
    ai_status: str = "completed",
) -> Optional[dict[str, Any]]:
    """Legacy helper maintained for backward compatibility."""
    return update_challenge_full_ai(
        challenge_id=challenge_id,
        ai_analysis=ai_analysis,
        ai_status=ai_status,
    )


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
