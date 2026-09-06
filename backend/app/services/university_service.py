import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from bson import ObjectId

from app.database.mongodb import (
    get_universities_collection,
    get_challenges_collection,
    get_university_interests_collection,
    get_university_faculty_collection,
    get_university_students_collection,
)
from app.schemas.university import (
    UniversityProfileCreate,
    UniversityProfileUpdate,
    FacultyCreate,
    FacultyUpdate,
    StudentCreate,
    StudentUpdate,
)
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
    Only returns challenges where the university achieves a valid match score.
    Returns rich, unredacted challenge analysis while excluding private citizen information.
    Ranks challenges by match score from highest to lowest.
    """
    uni_profile = get_profile_by_user_id(user_id)
    if not uni_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complete your university profile to receive relevant challenge matches.",
        )

    # Check if profile has departments, skills, research_areas, or faculty
    has_capabilities = bool(
        uni_profile.get("departments")
        or uni_profile.get("skills")
        or uni_profile.get("research_areas")
        or uni_profile.get("faculty")
    )
    if not has_capabilities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete your university profile to receive relevant challenge matches.",
        )

    challenges_coll = get_challenges_collection()
    # Query non-rejected, non-duplicate active challenges
    query = {
        "$or": [
            {"duplicate_of": None},
            {"duplicate_of": {"$exists": False}},
            {"duplicate_of": ""},
        ],
        "status": {"$nin": ["rejected", "spam", "closed"]},
    }
    challenges = list(challenges_coll.find(query).sort("created_at", -1).limit(100))
    if not challenges:
        return []

    matcher = get_university_matcher()

    matched_list = []
    for ch in challenges:
        c_id = str(ch["_id"])
        match_candidate = matcher.calculate_match(ch, uni_profile)

        # Extract fields safely without exposing private citizen data (email, phone, account)
        ai_analysis = ch.get("ai_analysis") or {}
        prio_analysis = ch.get("priority_analysis") or {}
        dup_analysis = ch.get("duplicate_analysis") or {}

        # Category and Subcategory from AI analysis or citizen report
        cat = ch.get("category") or ai_analysis.get("category") or "General"
        subcat = ch.get("subcategory") or ai_analysis.get("subcategory") or ""

        # Priority score
        prio_score = ch.get("priority_score") or prio_analysis.get("score") or 0.0

        # Urgency
        urgency = (
            ch.get("urgency")
            or prio_analysis.get("factors", {}).get("urgency_level")
            or "medium"
        )

        # Format location to string
        raw_loc = ch.get("location")
        if isinstance(raw_loc, dict):
            loc_parts = [raw_loc.get("address"), raw_loc.get("district"), raw_loc.get("state")]
            loc_str = ", ".join([p for p in loc_parts if p]) or "Location not specified"
        elif isinstance(raw_loc, str):
            loc_str = raw_loc
        else:
            loc_str = "Location not specified"

        matched_list.append({
            "challenge_id": c_id,
            "title": ch.get("title", ""),
            "description": ch.get("description", ""),
            "category": cat,
            "subcategory": subcat,
            "location": loc_str,
            "location_details": raw_loc if isinstance(raw_loc, dict) else None,
            "status": ch.get("status", "submitted"),
            "affected_people": ch.get("affected_people"),
            "urgency": urgency,
            "ai_status": ch.get("ai_status", "completed"),
            "ai_analysis": ai_analysis,
            "priority_analysis": prio_analysis,
            "duplicate_analysis": dup_analysis,
            "priority_score": prio_score,
            "match_score": match_candidate["score"],
            "match_level": match_candidate["level"],
            "matched_skills": match_candidate["matched_skills"],
            "missing_skills": match_candidate["missing_skills"],
            "matched_departments": match_candidate["matched_departments"],
            "matched_faculty": match_candidate["matched_faculty"],
            "explanation": match_candidate["explanation"],
            "match_evaluation": match_candidate,
            "created_at": ch.get("created_at", ""),
        })

    # Rank challenges by match score from highest to lowest
    matched_list.sort(key=lambda x: x["match_score"], reverse=True)
    return matched_list


def get_challenge_details_for_university(user_id: str, challenge_id: str) -> Dict[str, Any]:
    """
    Load complete citizen challenge details for the authenticated university.
    Includes Phase 2A AI problem analysis, Phase 2B priority & duplicate data,
    and dynamically calculated university match scores for this specific institution.
    Excludes all private citizen contact details and credentials.
    """
    challenges_coll = get_challenges_collection()
    try:
        c_query = {"_id": ObjectId(challenge_id)}
    except Exception:
        c_query = {"_id": challenge_id}

    ch = challenges_coll.find_one(c_query)
    if not ch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found.",
        )

    # Format location string safely
    raw_loc = ch.get("location")
    if isinstance(raw_loc, dict):
        loc_parts = [raw_loc.get("address"), raw_loc.get("district"), raw_loc.get("state")]
        loc_str = ", ".join([p for p in loc_parts if p]) or "Location not specified"
    elif isinstance(raw_loc, str):
        loc_str = raw_loc
    else:
        loc_str = "Location not specified"

    # Extract Phase 2A data
    ai_status = ch.get("ai_status", "completed")
    ai_analysis = ch.get("ai_analysis") or {}

    # Extract Phase 2B priority data
    prio_analysis = ch.get("priority_analysis") or {}
    prio_score = ch.get("priority_score")
    if prio_score is None:
        prio_score = prio_analysis.get("score", 0.0)

    # Extract Phase 2B duplicate data without private information
    dup_analysis = ch.get("duplicate_analysis") or {}

    # Auto-heal and evaluate if AI problem analysis or Priority was missing or previously marked failed
    if ai_status != "completed" or not ai_analysis or not prio_analysis or prio_score == 0:
        try:
            from app.ai.problem_analyzer import analyze_problem
            from app.ai.duplicate_detector import detect_duplicates
            from app.ai.priority_engine import calculate_priority

            title = ch.get("title", "")
            desc = ch.get("description", "")
            if not ai_analysis or ai_status != "completed":
                ai_analysis = analyze_problem(title, desc)
                ai_status = "completed"

            cat = ai_analysis.get("category") or ch.get("category") or "Civic"
            subcat = ai_analysis.get("subcategory") or ch.get("subcategory")

            if not dup_analysis or not dup_analysis.get("status"):
                dup_analysis, _ = detect_duplicates(
                    challenge_id=str(ch["_id"]),
                    title=title,
                    description=desc,
                    category=cat,
                    subcategory=subcat,
                    location=raw_loc if isinstance(raw_loc, dict) else None,
                )

            if not prio_analysis or prio_score == 0:
                prio_analysis = calculate_priority(
                    category=cat,
                    affected_people=ch.get("affected_people"),
                    urgency=ch.get("urgency"),
                    duplicate_info=dup_analysis,
                    ai_analysis=ai_analysis,
                )
                prio_score = prio_analysis.get("score", 0.0)

            # Persist the evaluated analyses in MongoDB so subsequent requests load instantly
            challenges_coll.update_one(
                {"_id": ch["_id"]},
                {
                    "$set": {
                        "ai_status": "completed",
                        "ai_analysis": ai_analysis,
                        "priority_analysis": prio_analysis,
                        "duplicate_analysis": dup_analysis,
                        "priority_score": prio_score,
                        "category": cat,
                        "subcategory": subcat,
                    }
                },
            )
            ch["ai_status"] = "completed"
            ch["ai_analysis"] = ai_analysis
            ch["priority_analysis"] = prio_analysis
            ch["duplicate_analysis"] = dup_analysis
            ch["priority_score"] = prio_score
        except Exception as eval_err:
            logger.warning(f"Could not auto-evaluate challenge {challenge_id}: {eval_err}")

    prio_level = prio_analysis.get("level") or (
        "high" if prio_score >= 70 else "medium" if prio_score >= 40 else "low"
    )
    raw_candidates = dup_analysis.get("candidates") or []
    sanitized_candidates = []
    for cand in raw_candidates:
        if isinstance(cand, dict):
            sanitized_candidates.append({
                "challenge_id": cand.get("challenge_id"),
                "title": cand.get("title", "Related Challenge"),
                "similarity": cand.get("similarity", 0.0),
                "confidence": cand.get("confidence"),
            })

    # Fetch authenticated university profile from MongoDB
    uni_profile = get_profile_by_user_id(user_id)
    university_match = None
    match_status = "profile_not_found"

    if uni_profile:
        has_capabilities = bool(
            uni_profile.get("departments")
            or uni_profile.get("skills")
            or uni_profile.get("research_areas")
            or uni_profile.get("faculty")
        )
        if has_capabilities:
            matcher = get_university_matcher()
            match_candidate = matcher.calculate_match(ch, uni_profile)
            university_match = {
                "score": match_candidate["score"],
                "level": match_candidate["level"],
                "factors": match_candidate["factors"],
                "matched_skills": match_candidate["matched_skills"],
                "missing_skills": match_candidate["missing_skills"],
                "matched_departments": match_candidate["matched_departments"],
                "matched_faculty": match_candidate["matched_faculty"],
                "explanation": match_candidate["explanation"],
                "university_id": uni_profile.get("id") or str(uni_profile.get("_id", "")),
                "university_name": uni_profile.get("name", "Your Institution"),
            }
            match_status = "evaluated"
        else:
            match_status = "profile_incomplete"

    # Category and subcategory fallbacks
    category = ch.get("category") or ai_analysis.get("category") or "Civic"
    subcategory = ch.get("subcategory") or ai_analysis.get("subcategory")

    # Urgency
    urgency = ch.get("urgency") or prio_analysis.get("factors", {}).get("urgency_level") or "medium"

    # Cloudinary Image
    image = ch.get("image")

    return {
        "challenge_id": str(ch["_id"]),
        "title": ch.get("title", ""),
        "description": ch.get("description", ""),
        "category": category,
        "subcategory": subcategory,
        "location": loc_str,
        "location_details": raw_loc if isinstance(raw_loc, dict) else None,
        "affected_people": ch.get("affected_people"),
        "urgency": urgency,
        "status": ch.get("status", "submitted"),
        "submission_date": ch.get("created_at", ""),
        "created_at": ch.get("created_at", ""),
        "image": image,
        "ai_status": ai_status,
        "ai_analysis": {
            "category": category,
            "subcategory": subcategory,
            "confidence": ai_analysis.get("confidence"),
            "keywords": ai_analysis.get("keywords") or [],
            "required_skills": ai_analysis.get("required_skills") or ch.get("required_skills") or [],
            "summary": ai_analysis.get("summary") or ch.get("description", ""),
            "status": ai_status,
            "error": ai_analysis.get("error"),
        },
        "priority_analysis": {
            "score": prio_score,
            "level": prio_level,
            "factors": prio_analysis.get("factors") or {
                "severity": 0,
                "urgency": 0,
                "population_impact": 0,
                "frequency": 0,
                "feasibility": 0,
            },
            "explanation": prio_analysis.get("explanation") or "",
        },
        "duplicate_analysis": {
            "status": dup_analysis.get("status", "none"),
            "is_duplicate": dup_analysis.get("is_duplicate", False),
            "highest_similarity": dup_analysis.get("highest_similarity", 0.0),
            "matched_challenge_id": dup_analysis.get("matched_challenge_id"),
            "candidates": sanitized_candidates,
        },
        "university_match": university_match,
        "match_status": match_status,
        "interest": get_challenge_interest(user_id, str(ch["_id"])),
    }


def express_challenge_interest(
    user_id: str,
    challenge_id: str,
    message: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Record an authenticated university's genuine interest in adopting a civic challenge.
    Validates challenge existence and eligibility, ensures profile exists,
    and prevents duplicate interest submissions.
    """
    # 1. Verify university profile exists
    uni_profile = get_profile_by_user_id(user_id)
    if not uni_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complete your university profile before expressing interest in challenges.",
        )

    uni_id = uni_profile.get("id") or str(uni_profile.get("_id", ""))
    uni_name = uni_profile.get("name", "Your Institution")

    # 2. Verify challenge exists and is eligible
    challenges_coll = get_challenges_collection()
    try:
        c_query = {"_id": ObjectId(challenge_id)}
    except Exception:
        c_query = {"_id": challenge_id}

    ch = challenges_coll.find_one(c_query)
    if not ch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found.",
        )

    c_status = (ch.get("status") or "").lower()
    if c_status in ["rejected", "spam", "closed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This challenge is not eligible for university adoption.",
        )

    clean_cid = str(ch["_id"])
    interests_coll = get_university_interests_collection()

    # 3. Check for existing interest record (prevent duplicates)
    existing = interests_coll.find_one({
        "university_id": str(uni_id),
        "challenge_id": clean_cid,
    })
    if existing:
        return {
            "id": str(existing["_id"]),
            "challenge_id": clean_cid,
            "university_id": str(uni_id),
            "status": existing.get("status", "pending"),
            "message": existing.get("message"),
            "created_at": existing.get("created_at", ""),
            "updated_at": existing.get("updated_at", ""),
            "university_name": uni_name,
            "challenge": {
                "id": clean_cid,
                "title": ch.get("title", ""),
                "category": ch.get("category", "Civic"),
                "location": ch.get("location"),
                "status": ch.get("status", "submitted"),
            },
        }

    # 4. Create new interest document
    now_iso = datetime.now(timezone.utc).isoformat()
    clean_msg = message.strip() if message and message.strip() else None

    doc = {
        "challenge_id": clean_cid,
        "university_id": str(uni_id),
        "status": "pending",
        "message": clean_msg,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    try:
        insert_res = interests_coll.insert_one(doc)
        doc["_id"] = insert_res.inserted_id
    except Exception as exc:
        # Catch duplicate key race conditions gracefully
        logger.warning(f"Duplicate key or write conflict for interest: {exc}")
        existing_again = interests_coll.find_one({
            "university_id": str(uni_id),
            "challenge_id": clean_cid,
        })
        if existing_again:
            doc = existing_again
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record challenge interest.",
            )

    return {
        "id": str(doc["_id"]),
        "challenge_id": clean_cid,
        "university_id": str(uni_id),
        "status": doc.get("status", "pending"),
        "message": doc.get("message"),
        "created_at": doc.get("created_at", now_iso),
        "updated_at": doc.get("updated_at", now_iso),
        "university_name": uni_name,
        "challenge": {
            "id": clean_cid,
            "title": ch.get("title", ""),
            "category": ch.get("category", "Civic"),
            "location": ch.get("location"),
            "status": ch.get("status", "submitted"),
        },
    }


def get_challenge_interest(user_id: str, challenge_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve the authenticated university's interest record for a specific challenge.
    Returns None if no interest has been submitted.
    """
    uni_profile = get_profile_by_user_id(user_id)
    if not uni_profile:
        return None

    uni_id = uni_profile.get("id") or str(uni_profile.get("_id", ""))
    interests_coll = get_university_interests_collection()

    doc = interests_coll.find_one({
        "university_id": str(uni_id),
        "challenge_id": str(challenge_id),
    })
    if not doc:
        return None

    return {
        "id": str(doc["_id"]),
        "challenge_id": str(doc["challenge_id"]),
        "university_id": str(doc["university_id"]),
        "status": doc.get("status", "pending"),
        "message": doc.get("message"),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


def get_university_interests(user_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve all challenge interest records submitted by the authenticated university.
    Hydrates challenge summary metadata for dashboard display without exposing private citizen data.
    """
    uni_profile = get_profile_by_user_id(user_id)
    if not uni_profile:
        return []

    uni_id = uni_profile.get("id") or str(uni_profile.get("_id", ""))
    interests_coll = get_university_interests_collection()
    challenges_coll = get_challenges_collection()

    docs = list(interests_coll.find({"university_id": str(uni_id)}).sort("created_at", -1))
    if not docs:
        return []

    # Map challenge metadata for display
    results = []
    for doc in docs:
        c_id = doc.get("challenge_id")
        ch_meta = None
        if c_id:
            try:
                ch = challenges_coll.find_one({"_id": ObjectId(c_id)})
            except Exception:
                ch = challenges_coll.find_one({"_id": c_id})

            if ch:
                raw_loc = ch.get("location")
                if isinstance(raw_loc, dict):
                    loc_parts = [raw_loc.get("address"), raw_loc.get("district"), raw_loc.get("state")]
                    loc_str = ", ".join([p for p in loc_parts if p]) or "Location not specified"
                elif isinstance(raw_loc, str):
                    loc_str = raw_loc
                else:
                    loc_str = "Location not specified"

                ch_meta = {
                    "id": str(ch["_id"]),
                    "title": ch.get("title", ""),
                    "category": ch.get("category", "Civic"),
                    "location": loc_str,
                    "status": ch.get("status", "submitted"),
                    "urgency": ch.get("urgency", "medium"),
                }

        results.append({
            "id": str(doc["_id"]),
            "_id": str(doc["_id"]),
            "challenge_id": c_id,
            "university_id": str(uni_id),
            "status": doc.get("status", "pending"),
            "message": doc.get("message"),
            "created_at": doc.get("created_at", ""),
            "updated_at": doc.get("updated_at", ""),
            "challenge_title": ch_meta["title"] if ch_meta else "Untitled Challenge",
            "challenge_category": ch_meta["category"] if ch_meta else "Civic",
            "challenge_location": ch_meta["location"] if ch_meta else "Location not specified",
            "challenge": ch_meta,
        })

    return results


# =============================================================================
# FACULTY MANAGEMENT (Step 5A)
# =============================================================================

def _resolve_university_id_for_faculty(user_id: str) -> str:
    """
    Resolve the institutional university_id for the authenticated university user.
    Creates a baseline profile if one has not yet been initialized.
    """
    universities = get_universities_collection()
    uni = universities.find_one({"created_by": user_id})
    if uni:
        return str(uni["_id"])

    now_iso = datetime.now(timezone.utc).isoformat()
    new_uni = {
        "name": "Institutional Innovation Center",
        "created_by": user_id,
        "created_at": now_iso,
        "updated_at": now_iso,
        "departments": [],
        "research_areas": [],
        "skills": [],
        "infrastructure": [],
        "previous_projects": [],
        "faculty": [],
        "student_skills": [],
        "availability": "available",
    }
    res = universities.insert_one(new_uni)
    return str(res.inserted_id)


def _sync_faculty_to_profile(uni_id: str) -> None:
    """
    Synchronizes standalone faculty documents into the embedded university profile
    to ensure full backward compatibility with university profile queries and AI matching.
    """
    try:
        faculty_coll = get_university_faculty_collection()
        docs = list(faculty_coll.find({"university_id": str(uni_id)}).sort("created_at", -1))
        embedded_list = []
        for d in docs:
            embedded_list.append({
                "name": d.get("name", ""),
                "department": d.get("department"),
                "designation": d.get("designation", "Faculty Lead"),
                "email": d.get("email"),
                "expertise": d.get("expertise", []),
                "skills": d.get("skills", []),
                "research_areas": d.get("research_areas", []),
            })
        get_universities_collection().update_one(
            {"_id": ObjectId(uni_id)},
            {
                "$set": {
                    "faculty": embedded_list,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            },
        )
    except Exception as exc:
        logger.warning(f"Could not sync faculty roster to university profile: {exc}")


def serialize_faculty(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Serialize a MongoDB faculty document into a clean API response."""
    return {
        "id": str(doc["_id"]),
        "_id": str(doc["_id"]),
        "university_id": str(doc.get("university_id", "")),
        "name": doc.get("name", ""),
        "email": doc.get("email", ""),
        "designation": doc.get("designation", "Faculty Lead"),
        "department": doc.get("department"),
        "expertise": doc.get("expertise", []),
        "skills": doc.get("skills", []),
        "research_areas": doc.get("research_areas", []),
        "availability": bool(doc.get("availability", True)),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


def create_faculty(user_id: str, data: FacultyCreate) -> Dict[str, Any]:
    """
    Create a real faculty record belonging to the authenticated university.
    Enforces that email is unique within the university.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    faculty_coll = get_university_faculty_collection()

    clean_email = data.email.strip().lower()
    clean_name = data.name.strip()

    # Check for duplicate email within the same university
    existing = faculty_coll.find_one({
        "university_id": uni_id,
        "email": clean_email,
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A faculty member with email '{clean_email}' is already registered in your institution.",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "university_id": uni_id,
        "name": clean_name,
        "email": clean_email,
        "designation": data.designation.strip() if data.designation else "Faculty Lead",
        "department": data.department.strip() if data.department else None,
        "expertise": [x.strip() for x in data.expertise if x.strip()],
        "skills": [x.strip() for x in data.skills if x.strip()],
        "research_areas": [x.strip() for x in data.research_areas if x.strip()],
        "availability": bool(data.availability),
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    res = faculty_coll.insert_one(doc)
    doc["_id"] = res.inserted_id

    _sync_faculty_to_profile(uni_id)
    return serialize_faculty(doc)


def get_faculty_list(
    user_id: str,
    search: Optional[str] = None,
    department: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    List faculty members strictly belonging to the authenticated university.
    Supports search and department filtering.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    faculty_coll = get_university_faculty_collection()

    query: Dict[str, Any] = {"university_id": uni_id}

    if department and department.strip():
        query["department"] = department.strip()

    if search and search.strip():
        search_term = search.strip()
        regex_pattern = {"$regex": search_term, "$options": "i"}
        query["$or"] = [
            {"name": regex_pattern},
            {"email": regex_pattern},
            {"department": regex_pattern},
            {"designation": regex_pattern},
            {"expertise": regex_pattern},
            {"skills": regex_pattern},
            {"research_areas": regex_pattern},
        ]

    docs = list(faculty_coll.find(query).sort("created_at", -1))
    return [serialize_faculty(d) for d in docs]


def get_faculty_by_id(user_id: str, faculty_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific faculty member by ID.
    Enforces ownership isolation — returns 404 if not found or belongs to another university.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    faculty_coll = get_university_faculty_collection()

    try:
        obj_id = ObjectId(faculty_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty member not found.",
        )

    doc = faculty_coll.find_one({"_id": obj_id, "university_id": uni_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty member not found.",
        )

    return serialize_faculty(doc)


def update_faculty(user_id: str, faculty_id: str, data: FacultyUpdate) -> Dict[str, Any]:
    """
    Update an existing faculty member.
    Enforces ownership isolation and unique email protection within the university.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    faculty_coll = get_university_faculty_collection()

    try:
        obj_id = ObjectId(faculty_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty member not found.",
        )

    existing = faculty_coll.find_one({"_id": obj_id, "university_id": uni_id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty member not found.",
        )

    # Check if updating email to one that is already in use by another faculty in this university
    if data.email is not None:
        clean_email = data.email.strip().lower()
        duplicate = faculty_coll.find_one({
            "university_id": uni_id,
            "email": clean_email,
            "_id": {"$ne": obj_id},
        })
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A faculty member with email '{clean_email}' already exists in your institution.",
            )

    update_fields: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if data.name is not None:
        update_fields["name"] = data.name.strip()
    if data.email is not None:
        update_fields["email"] = data.email.strip().lower()
    if data.designation is not None:
        update_fields["designation"] = data.designation.strip()
    if data.department is not None:
        update_fields["department"] = data.department.strip()
    if data.expertise is not None:
        update_fields["expertise"] = [x.strip() for x in data.expertise if x.strip()]
    if data.skills is not None:
        update_fields["skills"] = [x.strip() for x in data.skills if x.strip()]
    if data.research_areas is not None:
        update_fields["research_areas"] = [x.strip() for x in data.research_areas if x.strip()]
    if data.availability is not None:
        update_fields["availability"] = bool(data.availability)

    faculty_coll.update_one({"_id": obj_id}, {"$set": update_fields})
    updated_doc = faculty_coll.find_one({"_id": obj_id})
    if not updated_doc:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated faculty record.")

    _sync_faculty_to_profile(uni_id)
    return serialize_faculty(updated_doc)


def delete_faculty(user_id: str, faculty_id: str) -> Dict[str, Any]:
    """
    Delete a faculty member.
    Enforces ownership isolation — universities can only delete their own faculty.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    faculty_coll = get_university_faculty_collection()

    try:
        obj_id = ObjectId(faculty_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty member not found.",
        )

    res = faculty_coll.delete_one({"_id": obj_id, "university_id": uni_id})
    if res.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty member not found.",
        )

    _sync_faculty_to_profile(uni_id)
    return {"message": "Faculty member deleted successfully.", "id": faculty_id}


# =============================================================================
# STUDENT MANAGEMENT (Step 5B)
# =============================================================================

def _sync_student_skills_to_profile(uni_id: str) -> None:
    """
    Collect all registered student skills across institutional student records
    and sync with university profile's student_skills field for AI matching.
    """
    try:
        students_coll = get_university_students_collection()
        docs = students_coll.find({"university_id": str(uni_id)}, {"skills": 1})
        unique_skills = set()
        for d in docs:
            for s in d.get("skills", []):
                if s and str(s).strip():
                    unique_skills.add(str(s).strip())

        if unique_skills:
            get_universities_collection().update_one(
                {"_id": ObjectId(uni_id)},
                {
                    "$addToSet": {"student_skills": {"$each": sorted(list(unique_skills))}},
                    "$set": {"updated_at": datetime.now(timezone.utc).isoformat()},
                },
            )
    except Exception as exc:
        logger.warning(f"Could not sync student skills to university profile: {exc}")


def serialize_student(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Serialize a MongoDB student document into a clean API response."""
    return {
        "id": str(doc["_id"]),
        "_id": str(doc["_id"]),
        "university_id": str(doc.get("university_id", "")),
        "name": doc.get("name", ""),
        "email": doc.get("email", ""),
        "department": doc.get("department"),
        "degree": doc.get("degree"),
        "program": doc.get("degree"),
        "skills": doc.get("skills", []),
        "interests": doc.get("interests", []),
        "availability": bool(doc.get("availability", True)),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


def create_student(user_id: str, data: StudentCreate) -> Dict[str, Any]:
    """
    Register a student to the authenticated university institution.
    Enforces that email is unique within the university.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    students_coll = get_university_students_collection()

    clean_email = data.email.strip().lower()
    clean_name = data.name.strip()

    # Check for duplicate email within the same university
    existing = students_coll.find_one({
        "university_id": uni_id,
        "email": clean_email,
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A student with email '{clean_email}' is already enrolled in your institution.",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "university_id": uni_id,
        "name": clean_name,
        "email": clean_email,
        "department": data.department.strip() if data.department else None,
        "degree": data.degree.strip() if data.degree else None,
        "skills": [x.strip() for x in data.skills if x.strip()],
        "interests": [x.strip() for x in data.interests if x.strip()],
        "availability": bool(data.availability),
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    res = students_coll.insert_one(doc)
    doc["_id"] = res.inserted_id

    _sync_student_skills_to_profile(uni_id)
    return serialize_student(doc)


def get_student_list(
    user_id: str,
    search: Optional[str] = None,
    department: Optional[str] = None,
    skill: Optional[str] = None,
    availability: Optional[bool] = None,
) -> List[Dict[str, Any]]:
    """
    List students strictly belonging to the authenticated university.
    Supports filtering by search query, department, technical skill, and availability.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    students_coll = get_university_students_collection()

    query: Dict[str, Any] = {"university_id": uni_id}

    if department and department.strip() and department.lower() != "all":
        query["department"] = department.strip()

    if skill and skill.strip():
        query["skills"] = {"$regex": skill.strip(), "$options": "i"}

    if availability is not None:
        query["availability"] = bool(availability)

    if search and search.strip():
        search_term = search.strip()
        regex_pattern = {"$regex": search_term, "$options": "i"}
        query["$or"] = [
            {"name": regex_pattern},
            {"email": regex_pattern},
            {"department": regex_pattern},
            {"degree": regex_pattern},
            {"skills": regex_pattern},
            {"interests": regex_pattern},
        ]

    docs = list(students_coll.find(query).sort("created_at", -1))
    return [serialize_student(d) for d in docs]


def get_student_by_id(user_id: str, student_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific student record by ID.
    Enforces strict ownership isolation — returns 404 if not found or belongs to another university.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    students_coll = get_university_students_collection()

    try:
        obj_id = ObjectId(student_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student record not found.",
        )

    doc = students_coll.find_one({"_id": obj_id, "university_id": uni_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student record not found.",
        )

    return serialize_student(doc)


def update_student(user_id: str, student_id: str, data: StudentUpdate) -> Dict[str, Any]:
    """
    Update an existing student's institutional information and competencies.
    Enforces strict ownership isolation and preserves student identity/email.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    students_coll = get_university_students_collection()

    try:
        obj_id = ObjectId(student_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student record not found.",
        )

    existing = students_coll.find_one({"_id": obj_id, "university_id": uni_id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student record not found.",
        )

    update_fields: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if data.name is not None:
        update_fields["name"] = data.name.strip()
    if data.department is not None:
        update_fields["department"] = data.department.strip()
    if data.degree is not None:
        update_fields["degree"] = data.degree.strip()
    if data.skills is not None:
        update_fields["skills"] = [x.strip() for x in data.skills if x.strip()]
    if data.interests is not None:
        update_fields["interests"] = [x.strip() for x in data.interests if x.strip()]
    if data.availability is not None:
        update_fields["availability"] = bool(data.availability)

    students_coll.update_one({"_id": obj_id}, {"$set": update_fields})
    updated_doc = students_coll.find_one({"_id": obj_id})
    if not updated_doc:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated student record.")

    _sync_student_skills_to_profile(uni_id)
    return serialize_student(updated_doc)




