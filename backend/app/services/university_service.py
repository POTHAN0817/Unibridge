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
    get_university_teams_collection,
    get_university_projects_collection,
    get_project_milestones_collection,
    get_project_research_collection,
    get_project_solutions_collection,
    get_project_prototypes_collection,
    get_project_pilots_collection,
    get_project_deployment_readiness_collection,
    get_project_activity_collection,
)
from app.schemas.university import (
    UniversityProfileCreate,
    UniversityProfileUpdate,
    FacultyCreate,
    FacultyUpdate,
    StudentCreate,
    StudentUpdate,
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamMemberBrief,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    VALID_PROJECT_STATUSES,
    MilestoneCreate,
    MilestoneUpdate,
    MilestoneResponse,
    VALID_MILESTONE_STATUSES,
    ResearchCreate,
    ResearchUpdate,
    ResearchResponse,
    SolutionProposalCreate,
    SolutionProposalUpdate,
    SolutionProposalResponse,
    VALID_SOLUTION_STATUSES,
    PrototypeCreate,
    PrototypeUpdate,
    PrototypeResponse,
    VALID_PROTOTYPE_STATUSES,
    PilotCreate,
    PilotUpdate,
    PilotResponse,
    VALID_PILOT_STATUSES,
    DeploymentReadinessUpdate,
    DeploymentReadinessResponse,
    VALID_READINESS_STATUSES,
    ProjectActivityResponse,
)
from app.services.cloudinary_service import (
    upload_prototype_artifact,
    delete_prototype_artifact,
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


# =============================================================================
# TEAM MANAGEMENT (Step 5C)
# =============================================================================

def _hydrate_team(doc: Dict[str, Any], uni_id: str) -> Dict[str, Any]:
    """
    Hydrate a team document by resolving real names, departments, and competencies
    of faculty and student members strictly from the university's owned records.
    The team collection in MongoDB only stores IDs.
    """
    team_id = str(doc["_id"])
    cid = str(doc.get("challenge_id", "")).strip()

    # Resolve challenge title and category
    ch_title = "Unknown Challenge"
    ch_category = "Civic"
    if cid:
        challenges_coll = get_challenges_collection()
        try:
            ch = challenges_coll.find_one({"_id": ObjectId(cid)})
        except Exception:
            ch = challenges_coll.find_one({"_id": cid})
        if ch:
            ch_title = ch.get("title", "Untitled Challenge")
            ch_category = ch.get("category", "Civic")

    # Resolve faculty members
    faculty_ids = [str(f).strip() for f in doc.get("faculty_member_ids", []) if str(f).strip()]
    faculty_members = []
    if faculty_ids:
        f_objs = []
        for fid in faculty_ids:
            try:
                f_objs.append(ObjectId(fid))
            except Exception:
                pass
        faculty_coll = get_university_faculty_collection()
        f_docs = list(faculty_coll.find({
            "_id": {"$in": f_objs},
            "university_id": str(uni_id),
        }))
        for f in f_docs:
            faculty_members.append({
                "id": str(f["_id"]),
                "name": f.get("name", "Faculty Member"),
                "email": f.get("email"),
                "department": f.get("department"),
                "designation": f.get("designation", "Faculty Mentor"),
                "skills": f.get("skills", []),
            })

    # Resolve student members
    student_ids = [str(s).strip() for s in doc.get("student_member_ids", []) if str(s).strip()]
    student_members = []
    if student_ids:
        s_objs = []
        for sid in student_ids:
            try:
                s_objs.append(ObjectId(sid))
            except Exception:
                pass
        students_coll = get_university_students_collection()
        s_docs = list(students_coll.find({
            "_id": {"$in": s_objs},
            "university_id": str(uni_id),
        }))
        for s in s_docs:
            student_members.append({
                "id": str(s["_id"]),
                "name": s.get("name", "Student Researcher"),
                "email": s.get("email"),
                "department": s.get("department"),
                "degree": s.get("degree"),
                "skills": s.get("skills", []),
            })

    return {
        "id": team_id,
        "_id": team_id,
        "university_id": str(uni_id),
        "name": doc.get("name", "Innovation Team"),
        "challenge_id": cid,
        "challenge_title": ch_title,
        "challenge_category": ch_category,
        "faculty_member_ids": faculty_ids,
        "student_member_ids": student_ids,
        "faculty_members": faculty_members,
        "student_members": student_members,
        "description": doc.get("description"),
        "status": doc.get("status", "active"),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


def create_team(user_id: str, data: TeamCreate) -> Dict[str, Any]:
    """
    Form a multidisciplinary university team for an adopted challenge.
    Validates challenge existence, university interest, faculty membership, and student membership.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    clean_cid = str(data.challenge_id).strip()

    # 1. Validate Challenge existence
    challenges_coll = get_challenges_collection()
    try:
        ch = challenges_coll.find_one({"_id": ObjectId(clean_cid)})
    except Exception:
        ch = challenges_coll.find_one({"_id": clean_cid})

    if not ch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The specified civic challenge was not found.",
        )

    # 2. Validate University has expressed genuine interest in this challenge
    interests_coll = get_university_interests_collection()
    interest = interests_coll.find_one({
        "university_id": str(uni_id),
        "challenge_id": clean_cid,
    })
    if not interest:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your institution must express interest in this challenge before forming an innovation team for it.",
        )

    # 3. Validate Faculty Members (>= 1, strictly belonging to this university)
    clean_fids = list(dict.fromkeys([str(fid).strip() for fid in data.faculty_member_ids if str(fid).strip()]))
    if not clean_fids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one faculty mentor is required to form an innovation team.",
        )

    faculty_obj_ids = []
    for fid in clean_fids:
        try:
            faculty_obj_ids.append(ObjectId(fid))
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid faculty ID '{fid}'.")

    faculty_coll = get_university_faculty_collection()
    valid_faculty = list(faculty_coll.find({
        "_id": {"$in": faculty_obj_ids},
        "university_id": str(uni_id),
    }))
    if len(valid_faculty) != len(clean_fids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more faculty members do not belong to your university roster.",
        )

    # 4. Validate Student Members (>= 1, strictly belonging to this university)
    clean_sids = list(dict.fromkeys([str(sid).strip() for sid in data.student_member_ids if str(sid).strip()]))
    if not clean_sids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one student researcher is required to form an innovation team.",
        )

    student_obj_ids = []
    for sid in clean_sids:
        try:
            student_obj_ids.append(ObjectId(sid))
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid student ID '{sid}'.")

    students_coll = get_university_students_collection()
    valid_students = list(students_coll.find({
        "_id": {"$in": student_obj_ids},
        "university_id": str(uni_id),
    }))
    if len(valid_students) != len(clean_sids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more student researchers do not belong to your university roster.",
        )

    # 5. Persist Team document (storing only IDs, no duplicate profile data)
    now_iso = datetime.now(timezone.utc).isoformat()
    status_val = (data.status or "active").strip().lower()
    if status_val not in ["forming", "active", "completed", "archived"]:
        status_val = "active"

    team_doc = {
        "university_id": str(uni_id),
        "name": data.name.strip(),
        "challenge_id": clean_cid,
        "faculty_member_ids": clean_fids,
        "student_member_ids": clean_sids,
        "description": data.description.strip() if data.description else None,
        "status": status_val,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    teams_coll = get_university_teams_collection()
    res = teams_coll.insert_one(team_doc)
    team_doc["_id"] = res.inserted_id

    return _hydrate_team(team_doc, uni_id)


def get_team_list(
    user_id: str,
    search: Optional[str] = None,
    status: Optional[str] = None,
    challenge_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    List teams strictly belonging to the authenticated university.
    Supports filtering by search query, status, and challenge.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    teams_coll = get_university_teams_collection()

    query: Dict[str, Any] = {"university_id": str(uni_id)}
    if status and status.strip() and status.lower() != "all":
        query["status"] = status.strip().lower()
    if challenge_id and challenge_id.strip() and challenge_id.lower() != "all":
        query["challenge_id"] = challenge_id.strip()

    docs = list(teams_coll.find(query).sort("created_at", -1))
    hydrated_teams = [_hydrate_team(d, uni_id) for d in docs]

    if search and search.strip():
        q = search.strip().lower()
        filtered = []
        for t in hydrated_teams:
            in_name = q in t.get("name", "").lower()
            in_desc = q in (t.get("description") or "").lower()
            in_challenge = q in t.get("challenge_title", "").lower()
            in_faculty = any(q in f.get("name", "").lower() for f in t.get("faculty_members", []))
            in_students = any(q in s.get("name", "").lower() for s in t.get("student_members", []))
            if in_name or in_desc or in_challenge or in_faculty or in_students:
                filtered.append(t)
        return filtered

    return hydrated_teams


def get_team_by_id(user_id: str, team_id: str) -> Dict[str, Any]:
    """
    Retrieve a single team by ID.
    Enforces strict university ownership.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    teams_coll = get_university_teams_collection()

    try:
        obj_id = ObjectId(team_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )

    doc = teams_coll.find_one({"_id": obj_id, "university_id": str(uni_id)})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )

    return _hydrate_team(doc, uni_id)


def update_team(user_id: str, team_id: str, data: TeamUpdate) -> Dict[str, Any]:
    """
    Update team details, roster, or status.
    Enforces ownership and validates any modified challenge or member references.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    teams_coll = get_university_teams_collection()

    try:
        obj_id = ObjectId(team_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )

    existing = teams_coll.find_one({"_id": obj_id, "university_id": str(uni_id)})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )

    update_fields: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if data.name is not None:
        clean_name = data.name.strip()
        if not clean_name:
            raise HTTPException(status_code=400, detail="Team name cannot be empty.")
        update_fields["name"] = clean_name

    if data.description is not None:
        update_fields["description"] = data.description.strip() if data.description else None

    if data.status is not None:
        status_val = data.status.strip().lower()
        if status_val in ["forming", "active", "completed", "archived"]:
            update_fields["status"] = status_val

    if data.challenge_id is not None:
        clean_cid = data.challenge_id.strip()
        interests_coll = get_university_interests_collection()
        interest = interests_coll.find_one({
            "university_id": str(uni_id),
            "challenge_id": clean_cid,
        })
        if not interest:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your institution must express interest in this challenge before assigning a team to it.",
            )
        update_fields["challenge_id"] = clean_cid

    if data.faculty_member_ids is not None:
        clean_fids = list(dict.fromkeys([str(fid).strip() for fid in data.faculty_member_ids if str(fid).strip()]))
        if not clean_fids:
            raise HTTPException(status_code=400, detail="At least one faculty mentor is required.")
        f_objs = [ObjectId(fid) for fid in clean_fids]
        valid_f = list(get_university_faculty_collection().find({
            "_id": {"$in": f_objs},
            "university_id": str(uni_id),
        }))
        if len(valid_f) != len(clean_fids):
            raise HTTPException(status_code=400, detail="One or more faculty members do not belong to your university.")
        update_fields["faculty_member_ids"] = clean_fids

    if data.student_member_ids is not None:
        clean_sids = list(dict.fromkeys([str(sid).strip() for sid in data.student_member_ids if str(sid).strip()]))
        if not clean_sids:
            raise HTTPException(status_code=400, detail="At least one student researcher is required.")
        s_objs = [ObjectId(sid) for sid in clean_sids]
        valid_s = list(get_university_students_collection().find({
            "_id": {"$in": s_objs},
            "university_id": str(uni_id),
        }))
        if len(valid_s) != len(clean_sids):
            raise HTTPException(status_code=400, detail="One or more student researchers do not belong to your university.")
        update_fields["student_member_ids"] = clean_sids

    teams_coll.update_one({"_id": obj_id}, {"$set": update_fields})
    updated_doc = teams_coll.find_one({"_id": obj_id})
    if not updated_doc:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated team record.")

    return _hydrate_team(updated_doc, uni_id)


def delete_team(user_id: str, team_id: str) -> Dict[str, Any]:
    """
    Delete a team.
    Enforces strict ownership isolation — universities can only delete their own teams.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    teams_coll = get_university_teams_collection()

    try:
        obj_id = ObjectId(team_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )

    res = teams_coll.delete_one({"_id": obj_id, "university_id": str(uni_id)})
    if res.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )

    return {"message": "Team deleted successfully.", "id": team_id}


# =============================================================================
# PROJECT MANAGEMENT (Step 6A)
# =============================================================================

def _hydrate_project(doc: Dict[str, Any], uni_id: str) -> Dict[str, Any]:
    """
    Hydrate a university project with resolved challenge metadata,
    team information, and faculty/student rosters dynamically.
    Stores only IDs in the collection; hydrates live at query time.
    """
    challenge_id = str(doc.get("challenge_id", ""))
    team_id = str(doc.get("team_id", ""))

    challenges_coll = get_challenges_collection()
    teams_coll = get_university_teams_collection()
    faculty_coll = get_university_faculty_collection()
    students_coll = get_university_students_collection()

    challenge_title = None
    challenge_category = None
    if challenge_id:
        try:
            ch_doc = challenges_coll.find_one({"_id": ObjectId(challenge_id)})
            if ch_doc:
                challenge_title = ch_doc.get("title")
                challenge_category = ch_doc.get("category", "Civic")
        except Exception:
            pass

    team_name = None
    faculty_briefs: List[Dict[str, Any]] = []
    student_briefs: List[Dict[str, Any]] = []

    if team_id:
        try:
            tm_doc = teams_coll.find_one({"_id": ObjectId(team_id), "university_id": str(uni_id)})
            if tm_doc:
                team_name = tm_doc.get("name")
                f_ids = tm_doc.get("faculty_member_ids", [])
                s_ids = tm_doc.get("student_member_ids", [])

                if f_ids:
                    f_objs = []
                    for fid in f_ids:
                        try:
                            f_objs.append(ObjectId(fid))
                        except Exception:
                            continue
                    if f_objs:
                        f_records = list(faculty_coll.find({
                            "_id": {"$in": f_objs},
                            "university_id": str(uni_id),
                        }))
                        for f in f_records:
                            faculty_briefs.append({
                                "id": str(f["_id"]),
                                "_id": str(f["_id"]),
                                "name": f.get("name", "Faculty Mentor"),
                                "email": f.get("email"),
                                "department": f.get("department"),
                                "designation": f.get("designation", "Faculty Lead"),
                                "skills": f.get("skills", []),
                            })

                if s_ids:
                    s_objs = []
                    for sid in s_ids:
                        try:
                            s_objs.append(ObjectId(sid))
                        except Exception:
                            continue
                    if s_objs:
                        s_records = list(students_coll.find({
                            "_id": {"$in": s_objs},
                            "university_id": str(uni_id),
                        }))
                        for s in s_records:
                            student_briefs.append({
                                "id": str(s["_id"]),
                                "_id": str(s["_id"]),
                                "name": s.get("name", "Student Researcher"),
                                "email": s.get("email"),
                                "department": s.get("department"),
                                "degree": s.get("degree"),
                                "skills": s.get("skills", []),
                            })
        except Exception:
            pass

    # Real dynamic milestone progress calculation
    milestones_coll = get_project_milestones_collection()
    milestones_list = list(milestones_coll.find({
        "project_id": str(doc["_id"]),
        "university_id": str(uni_id),
    }))
    m_total = len(milestones_list)
    m_done = sum(1 for m in milestones_list if m.get("status") == "completed")
    milestone_progress = round((m_done / m_total) * 100) if m_total > 0 else 0

    return {
        "id": str(doc["_id"]),
        "_id": str(doc["_id"]),
        "university_id": str(uni_id),
        "name": doc.get("name", ""),
        "challenge_id": challenge_id,
        "team_id": team_id,
        "description": doc.get("description"),
        "status": doc.get("status", "planning"),
        "start_date": doc.get("start_date"),
        "target_date": doc.get("target_date"),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
        "challenge_title": challenge_title or "Untitled Challenge",
        "challenge_category": challenge_category or "Civic",
        "team_name": team_name or "Assigned Team",
        "faculty_members": faculty_briefs,
        "student_members": student_briefs,
        "milestone_progress": milestone_progress,
        "milestones_count": m_total,
        "completed_milestones_count": m_done,
    }


def create_project(user_id: str, data: ProjectCreate) -> Dict[str, Any]:
    """
    Create a university project for an adopted challenge and eligible university team.
    Enforces that:
    - authenticated university owns the team
    - team belongs to the selected challenge
    - team exists and is not archived
    - university has expressed interest in the challenge
    - challenge exists
    - no duplicate active projects for the same (university_id, team_id, challenge_id)
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    projects_coll = get_university_projects_collection()
    teams_coll = get_university_teams_collection()
    challenges_coll = get_challenges_collection()
    interests_coll = get_university_interests_collection()

    clean_name = data.name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Project name cannot be empty.")

    clean_cid = data.challenge_id.strip()
    clean_tid = data.team_id.strip()

    # 1. Validate challenge exists
    try:
        ch_obj = ObjectId(clean_cid)
        ch_doc = challenges_coll.find_one({"_id": ch_obj})
        if not ch_doc:
            raise HTTPException(status_code=404, detail="Challenge not found.")
    except Exception:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    # 2. Validate university has expressed interest in the challenge
    interest = interests_coll.find_one({
        "university_id": str(uni_id),
        "challenge_id": clean_cid,
    })
    if not interest:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your institution must express interest in this challenge before initiating a project.",
        )

    # 3. Validate team exists, belongs to authenticated university, and is not archived
    try:
        tm_obj = ObjectId(clean_tid)
        tm_doc = teams_coll.find_one({"_id": tm_obj, "university_id": str(uni_id)})
        if not tm_doc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected team does not belong to your university or does not exist.",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected team does not belong to your university or does not exist.",
        )

    if tm_doc.get("status") == "archived":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot assign an archived team to a new project.",
        )

    # 4. Validate team belongs to the selected challenge
    if str(tm_doc.get("challenge_id")) != clean_cid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The selected team is not assigned to this challenge.",
        )

    # 5. Prevent duplicate active projects for the same team and challenge
    duplicate = projects_coll.find_one({
        "university_id": str(uni_id),
        "team_id": clean_tid,
        "challenge_id": clean_cid,
        "status": {"$ne": "archived"},
    })
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An active project '{duplicate.get('name')}' is already underway for this team and challenge.",
        )

    # 6. Status validation
    status_val = data.status.strip().lower() if data.status else "planning"
    if status_val not in VALID_PROJECT_STATUSES:
        status_val = "planning"

    now_iso = datetime.now(timezone.utc).isoformat()
    project_doc = {
        "name": clean_name,
        "challenge_id": clean_cid,
        "university_id": str(uni_id),
        "team_id": clean_tid,
        "description": data.description.strip() if data.description else None,
        "status": status_val,
        "start_date": data.start_date.strip() if data.start_date else None,
        "target_date": data.target_date.strip() if data.target_date else None,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    res = projects_coll.insert_one(project_doc)
    project_doc["_id"] = res.inserted_id

    return _hydrate_project(project_doc, uni_id)


def get_project_list(
    user_id: str,
    status_filter: Optional[str] = None,
    team_id: Optional[str] = None,
    challenge_id: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    List projects belonging exclusively to the authenticated university.
    Supports status filter, team filter, challenge filter, and keyword search.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    projects_coll = get_university_projects_collection()

    query: Dict[str, Any] = {"university_id": str(uni_id)}

    if status_filter and status_filter.strip().lower() != "all":
        query["status"] = status_filter.strip().lower()

    if team_id and team_id.strip():
        query["team_id"] = team_id.strip()

    if challenge_id and challenge_id.strip():
        query["challenge_id"] = challenge_id.strip()

    if search and search.strip():
        term = search.strip()
        query["$or"] = [
            {"name": {"$regex": term, "$options": "i"}},
            {"description": {"$regex": term, "$options": "i"}},
        ]

    docs = list(projects_coll.find(query).sort("created_at", -1))
    return [_hydrate_project(doc, uni_id) for doc in docs]


def get_project_by_id(user_id: str, project_id: str) -> Dict[str, Any]:
    """
    Retrieve single project with fully hydrated rosters and challenge info.
    Enforces strict ownership isolation.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    projects_coll = get_university_projects_collection()

    try:
        obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    doc = projects_coll.find_one({"_id": obj_id, "university_id": str(uni_id)})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    return _hydrate_project(doc, uni_id)


def update_project(user_id: str, project_id: str, data: ProjectUpdate) -> Dict[str, Any]:
    """
    Update project details (name, description, status, start_date, target_date).
    Enforces strict university ownership.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    projects_coll = get_university_projects_collection()

    try:
        obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    existing = projects_coll.find_one({"_id": obj_id, "university_id": str(uni_id)})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    update_fields: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if data.name is not None:
        clean_name = data.name.strip()
        if not clean_name:
            raise HTTPException(status_code=400, detail="Project name cannot be empty.")
        update_fields["name"] = clean_name

    if data.description is not None:
        update_fields["description"] = data.description.strip() if data.description else None

    if data.status is not None:
        status_val = data.status.strip().lower()
        if status_val in VALID_PROJECT_STATUSES:
            update_fields["status"] = status_val
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(VALID_PROJECT_STATUSES)}",
            )

    if data.start_date is not None:
        update_fields["start_date"] = data.start_date.strip() if data.start_date else None

    if data.target_date is not None:
        update_fields["target_date"] = data.target_date.strip() if data.target_date else None

    projects_coll.update_one({"_id": obj_id}, {"$set": update_fields})
    updated_doc = projects_coll.find_one({"_id": obj_id})
    if not updated_doc:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated project record.")

    return _hydrate_project(updated_doc, uni_id)


def delete_project(user_id: str, project_id: str) -> Dict[str, Any]:
    """
    Delete a project.
    Enforces strict ownership isolation — universities can only delete their own projects.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    projects_coll = get_university_projects_collection()

    try:
        obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    res = projects_coll.delete_one({"_id": obj_id, "university_id": str(uni_id)})
    if res.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    return {"message": "Project deleted successfully.", "id": project_id}


# =============================================================================
# PROJECT WORKSPACE MODULES (Parts 2 - 9)
# =============================================================================

def _log_project_activity(
    project_id: str,
    university_id: str,
    actor_id: Optional[str],
    action: str,
    description: str,
) -> None:
    try:
        activity_coll = get_project_activity_collection()
        activity_coll.insert_one({
            "project_id": str(project_id),
            "university_id": str(university_id),
            "actor_id": str(actor_id) if actor_id else None,
            "action": action,
            "description": description,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as exc:
        logger.warning(f"Failed to log project activity: {exc}")


def _verify_project_ownership(user_id: str, project_id: str) -> tuple[str, Dict[str, Any]]:
    """
    Enforce that the project exists and belongs strictly to the authenticated university.
    """
    uni_id = _resolve_university_id_for_faculty(user_id)
    projects_coll = get_university_projects_collection()
    try:
        obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    proj = projects_coll.find_one({"_id": obj_id, "university_id": str(uni_id)})
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not owned by your university.",
        )
    return str(uni_id), proj


# -----------------------------------------------------------------------------
# Part 2: Milestones
# -----------------------------------------------------------------------------

def create_milestone(user_id: str, project_id: str, data: MilestoneCreate) -> Dict[str, Any]:
    uni_id, proj = _verify_project_ownership(user_id, project_id)
    clean_title = data.title.strip()
    if not clean_title:
        raise HTTPException(status_code=400, detail="Milestone title cannot be empty.")

    status_val = data.status.strip().lower() if data.status else "pending"
    if status_val not in VALID_MILESTONE_STATUSES:
        status_val = "pending"

    now_iso = datetime.now(timezone.utc).isoformat()
    completed_at = now_iso if status_val == "completed" else None

    doc = {
        "project_id": str(project_id),
        "university_id": str(uni_id),
        "title": clean_title,
        "description": data.description.strip() if data.description else None,
        "status": status_val,
        "due_date": data.due_date.strip() if data.due_date else None,
        "completed_at": completed_at,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    res = get_project_milestones_collection().insert_one(doc)
    doc["_id"] = res.inserted_id
    doc["id"] = str(res.inserted_id)

    _log_project_activity(
        project_id,
        uni_id,
        user_id,
        "milestone_created",
        f"Milestone '{clean_title}' added with status '{status_val}'.",
    )

    return doc


def get_milestones(user_id: str, project_id: str) -> List[Dict[str, Any]]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    docs = list(get_project_milestones_collection().find({
        "project_id": str(project_id),
        "university_id": str(uni_id),
    }).sort("created_at", 1))

    return [
        {
            "id": str(d["_id"]),
            "_id": str(d["_id"]),
            "project_id": str(d["project_id"]),
            "university_id": str(d["university_id"]),
            "title": d.get("title", ""),
            "description": d.get("description"),
            "status": d.get("status", "pending"),
            "due_date": d.get("due_date"),
            "completed_at": d.get("completed_at"),
            "created_at": d.get("created_at", ""),
            "updated_at": d.get("updated_at", ""),
        }
        for d in docs
    ]


def update_milestone(
    user_id: str,
    project_id: str,
    milestone_id: str,
    data: MilestoneUpdate,
) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    milestones_coll = get_project_milestones_collection()

    try:
        m_obj = ObjectId(milestone_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    existing = milestones_coll.find_one({
        "_id": m_obj,
        "project_id": str(project_id),
        "university_id": str(uni_id),
    })
    if not existing:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    now_iso = datetime.now(timezone.utc).isoformat()
    update_fields: Dict[str, Any] = {"updated_at": now_iso}

    if data.title is not None:
        clean_title = data.title.strip()
        if not clean_title:
            raise HTTPException(status_code=400, detail="Milestone title cannot be empty.")
        update_fields["title"] = clean_title

    if data.description is not None:
        update_fields["description"] = data.description.strip() if data.description else None

    if data.due_date is not None:
        update_fields["due_date"] = data.due_date.strip() if data.due_date else None

    if data.status is not None:
        status_val = data.status.strip().lower()
        if status_val in VALID_MILESTONE_STATUSES:
            update_fields["status"] = status_val
            if status_val == "completed":
                update_fields["completed_at"] = now_iso
            elif existing.get("status") == "completed" and status_val != "completed":
                update_fields["completed_at"] = None

    milestones_coll.update_one({"_id": m_obj}, {"$set": update_fields})
    updated_doc = milestones_coll.find_one({"_id": m_obj})
    if not updated_doc:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated milestone.")

    action_label = "milestone_completed" if update_fields.get("status") == "completed" else "milestone_updated"
    desc_label = f"Milestone '{updated_doc.get('title')}' status updated to '{updated_doc.get('status')}'."
    _log_project_activity(project_id, uni_id, user_id, action_label, desc_label)

    return {
        "id": str(updated_doc["_id"]),
        "_id": str(updated_doc["_id"]),
        "project_id": str(updated_doc["project_id"]),
        "university_id": str(updated_doc["university_id"]),
        "title": updated_doc.get("title", ""),
        "description": updated_doc.get("description"),
        "status": updated_doc.get("status", "pending"),
        "due_date": updated_doc.get("due_date"),
        "completed_at": updated_doc.get("completed_at"),
        "created_at": updated_doc.get("created_at", ""),
        "updated_at": updated_doc.get("updated_at", ""),
    }


def delete_milestone(user_id: str, project_id: str, milestone_id: str) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    milestones_coll = get_project_milestones_collection()

    try:
        m_obj = ObjectId(milestone_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    res = milestones_coll.delete_one({
        "_id": m_obj,
        "project_id": str(project_id),
        "university_id": str(uni_id),
    })
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    _log_project_activity(project_id, uni_id, user_id, "milestone_deleted", f"Milestone {milestone_id} removed.")
    return {"message": "Milestone deleted successfully.", "id": milestone_id}


# -----------------------------------------------------------------------------
# Part 3: Research
# -----------------------------------------------------------------------------

def create_research(user_id: str, project_id: str, data: ResearchCreate) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    clean_title = data.title.strip()
    if not clean_title:
        raise HTTPException(status_code=400, detail="Research title cannot be empty.")

    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "project_id": str(project_id),
        "university_id": str(uni_id),
        "title": clean_title,
        "description": data.description.strip() if data.description else None,
        "findings": data.findings.strip() if data.findings else None,
        "methodology": data.methodology.strip() if data.methodology else None,
        "references": [r.strip() for r in data.references if r and r.strip()],
        "created_by": str(user_id),
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    res = get_project_research_collection().insert_one(doc)
    doc["_id"] = res.inserted_id
    doc["id"] = str(res.inserted_id)

    _log_project_activity(project_id, uni_id, user_id, "research_added", f"Research note '{clean_title}' added.")
    return doc


def get_research_list(user_id: str, project_id: str) -> List[Dict[str, Any]]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    docs = list(get_project_research_collection().find({
        "project_id": str(project_id),
        "university_id": str(uni_id),
    }).sort("created_at", -1))

    return [
        {
            "id": str(d["_id"]),
            "_id": str(d["_id"]),
            "project_id": str(d["project_id"]),
            "university_id": str(d["university_id"]),
            "title": d.get("title", ""),
            "description": d.get("description"),
            "findings": d.get("findings"),
            "methodology": d.get("methodology"),
            "references": d.get("references", []),
            "created_by": d.get("created_by"),
            "created_at": d.get("created_at", ""),
            "updated_at": d.get("updated_at", ""),
        }
        for d in docs
    ]


def update_research(
    user_id: str,
    project_id: str,
    research_id: str,
    data: ResearchUpdate,
) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_research_collection()

    try:
        r_obj = ObjectId(research_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Research entry not found.")

    existing = coll.find_one({"_id": r_obj, "project_id": str(project_id), "university_id": str(uni_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Research entry not found.")

    now_iso = datetime.now(timezone.utc).isoformat()
    update_fields: Dict[str, Any] = {"updated_at": now_iso}

    if data.title is not None:
        clean_title = data.title.strip()
        if not clean_title:
            raise HTTPException(status_code=400, detail="Research title cannot be empty.")
        update_fields["title"] = clean_title

    if data.description is not None:
        update_fields["description"] = data.description.strip() if data.description else None

    if data.findings is not None:
        update_fields["findings"] = data.findings.strip() if data.findings else None

    if data.methodology is not None:
        update_fields["methodology"] = data.methodology.strip() if data.methodology else None

    if data.references is not None:
        update_fields["references"] = [r.strip() for r in data.references if r and r.strip()]

    coll.update_one({"_id": r_obj}, {"$set": update_fields})
    updated = coll.find_one({"_id": r_obj})
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated research.")

    _log_project_activity(project_id, uni_id, user_id, "research_updated", f"Research '{updated.get('title')}' updated.")

    return {
        "id": str(updated["_id"]),
        "_id": str(updated["_id"]),
        "project_id": str(updated["project_id"]),
        "university_id": str(updated["university_id"]),
        "title": updated.get("title", ""),
        "description": updated.get("description"),
        "findings": updated.get("findings"),
        "methodology": updated.get("methodology"),
        "references": updated.get("references", []),
        "created_by": updated.get("created_by"),
        "created_at": updated.get("created_at", ""),
        "updated_at": updated.get("updated_at", ""),
    }


def delete_research(user_id: str, project_id: str, research_id: str) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_research_collection()

    try:
        r_obj = ObjectId(research_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Research entry not found.")

    res = coll.delete_one({"_id": r_obj, "project_id": str(project_id), "university_id": str(uni_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Research entry not found.")

    _log_project_activity(project_id, uni_id, user_id, "research_deleted", f"Research {research_id} deleted.")
    return {"message": "Research entry deleted successfully.", "id": research_id}


# -----------------------------------------------------------------------------
# Part 4: Solution Proposal
# -----------------------------------------------------------------------------

def get_solution(user_id: str, project_id: str) -> Optional[Dict[str, Any]]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_solutions_collection()
    doc = coll.find_one({"project_id": str(project_id), "university_id": str(uni_id)})
    if not doc:
        return None

    return {
        "id": str(doc["_id"]),
        "_id": str(doc["_id"]),
        "project_id": str(doc["project_id"]),
        "university_id": str(doc["university_id"]),
        "title": doc.get("title", ""),
        "problem_statement": doc.get("problem_statement", ""),
        "proposed_solution": doc.get("proposed_solution", ""),
        "technical_approach": doc.get("technical_approach"),
        "expected_outcomes": doc.get("expected_outcomes"),
        "required_resources": doc.get("required_resources"),
        "risks": doc.get("risks"),
        "constraints": doc.get("constraints"),
        "status": doc.get("status", "draft"),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


def save_solution(
    user_id: str,
    project_id: str,
    data: SolutionProposalCreate | SolutionProposalUpdate,
) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_solutions_collection()

    existing = coll.find_one({"project_id": str(project_id), "university_id": str(uni_id)})
    now_iso = datetime.now(timezone.utc).isoformat()

    status_val = getattr(data, "status", None)
    if status_val:
        status_val = status_val.strip().lower()
        if status_val not in VALID_SOLUTION_STATUSES:
            status_val = "draft"

    if existing:
        update_fields: Dict[str, Any] = {"updated_at": now_iso}
        for field in [
            "title", "problem_statement", "proposed_solution",
            "technical_approach", "expected_outcomes",
            "required_resources", "risks", "constraints"
        ]:
            val = getattr(data, field, None)
            if val is not None:
                update_fields[field] = val.strip() if isinstance(val, str) else val

        if status_val:
            update_fields["status"] = status_val

        coll.update_one({"_id": existing["_id"]}, {"$set": update_fields})
        updated = coll.find_one({"_id": existing["_id"]})
        _log_project_activity(
            project_id,
            uni_id,
            user_id,
            "solution_updated",
            f"Solution proposal '{updated.get('title')}' updated ({updated.get('status')}).",
        )
        doc = updated
    else:
        new_doc = {
            "project_id": str(project_id),
            "university_id": str(uni_id),
            "title": getattr(data, "title", "Solution Proposal").strip(),
            "problem_statement": getattr(data, "problem_statement", "").strip(),
            "proposed_solution": getattr(data, "proposed_solution", "").strip(),
            "technical_approach": (getattr(data, "technical_approach", None) or "").strip() if getattr(data, "technical_approach", None) else None,
            "expected_outcomes": (getattr(data, "expected_outcomes", None) or "").strip() if getattr(data, "expected_outcomes", None) else None,
            "required_resources": (getattr(data, "required_resources", None) or "").strip() if getattr(data, "required_resources", None) else None,
            "risks": (getattr(data, "risks", None) or "").strip() if getattr(data, "risks", None) else None,
            "constraints": (getattr(data, "constraints", None) or "").strip() if getattr(data, "constraints", None) else None,
            "status": status_val or "draft",
            "created_at": now_iso,
            "updated_at": now_iso,
        }
        res = coll.insert_one(new_doc)
        new_doc["_id"] = res.inserted_id
        _log_project_activity(
            project_id,
            uni_id,
            user_id,
            "solution_created",
            f"Solution proposal '{new_doc['title']}' created.",
        )
        doc = new_doc

    return {
        "id": str(doc["_id"]),
        "_id": str(doc["_id"]),
        "project_id": str(doc["project_id"]),
        "university_id": str(doc["university_id"]),
        "title": doc.get("title", ""),
        "problem_statement": doc.get("problem_statement", ""),
        "proposed_solution": doc.get("proposed_solution", ""),
        "technical_approach": doc.get("technical_approach"),
        "expected_outcomes": doc.get("expected_outcomes"),
        "required_resources": doc.get("required_resources"),
        "risks": doc.get("risks"),
        "constraints": doc.get("constraints"),
        "status": doc.get("status", "draft"),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


# -----------------------------------------------------------------------------
# Part 5: Prototypes
# -----------------------------------------------------------------------------

def create_prototype(user_id: str, project_id: str, data: PrototypeCreate) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    clean_title = data.title.strip()
    if not clean_title:
        raise HTTPException(status_code=400, detail="Prototype title cannot be empty.")

    status_val = data.status.strip().lower() if data.status else "planned"
    if status_val not in VALID_PROTOTYPE_STATUSES:
        status_val = "planned"

    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "project_id": str(project_id),
        "university_id": str(uni_id),
        "version": data.version.strip() if data.version else "v1.0",
        "title": clean_title,
        "description": data.description.strip() if data.description else None,
        "status": status_val,
        "artifact_url": data.artifact_url.strip() if data.artifact_url else None,
        "artifact_public_id": data.artifact_public_id.strip() if data.artifact_public_id else None,
        "artifact_type": data.artifact_type.strip() if data.artifact_type else None,
        "created_by": str(user_id),
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    res = get_project_prototypes_collection().insert_one(doc)
    doc["_id"] = res.inserted_id
    doc["id"] = str(res.inserted_id)

    _log_project_activity(
        project_id,
        uni_id,
        user_id,
        "prototype_added",
        f"Prototype {doc['version']} '{clean_title}' added with status '{status_val}'.",
    )
    return doc


def get_prototype_list(user_id: str, project_id: str) -> List[Dict[str, Any]]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    docs = list(get_project_prototypes_collection().find({
        "project_id": str(project_id),
        "university_id": str(uni_id),
    }).sort("created_at", -1))

    return [
        {
            "id": str(d["_id"]),
            "_id": str(d["_id"]),
            "project_id": str(d["project_id"]),
            "university_id": str(d["university_id"]),
            "version": d.get("version", "v1.0"),
            "title": d.get("title", ""),
            "description": d.get("description"),
            "status": d.get("status", "planned"),
            "artifact_url": d.get("artifact_url"),
            "artifact_public_id": d.get("artifact_public_id"),
            "artifact_type": d.get("artifact_type"),
            "created_by": d.get("created_by"),
            "created_at": d.get("created_at", ""),
            "updated_at": d.get("updated_at", ""),
        }
        for d in docs
    ]


def get_prototype_by_id(user_id: str, project_id: str, prototype_id: str) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_prototypes_collection()

    try:
        p_obj = ObjectId(prototype_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Prototype not found.")

    doc = coll.find_one({"_id": p_obj, "project_id": str(project_id), "university_id": str(uni_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Prototype not found.")

    return {
        "id": str(doc["_id"]),
        "_id": str(doc["_id"]),
        "project_id": str(doc["project_id"]),
        "university_id": str(doc["university_id"]),
        "version": doc.get("version", "v1.0"),
        "title": doc.get("title", ""),
        "description": doc.get("description"),
        "status": doc.get("status", "planned"),
        "artifact_url": doc.get("artifact_url"),
        "artifact_public_id": doc.get("artifact_public_id"),
        "artifact_type": doc.get("artifact_type"),
        "created_by": doc.get("created_by"),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


def update_prototype(
    user_id: str,
    project_id: str,
    prototype_id: str,
    data: PrototypeUpdate,
) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_prototypes_collection()

    try:
        p_obj = ObjectId(prototype_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Prototype not found.")

    existing = coll.find_one({"_id": p_obj, "project_id": str(project_id), "university_id": str(uni_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Prototype not found.")

    now_iso = datetime.now(timezone.utc).isoformat()
    update_fields: Dict[str, Any] = {"updated_at": now_iso}

    if data.title is not None:
        clean_title = data.title.strip()
        if not clean_title:
            raise HTTPException(status_code=400, detail="Prototype title cannot be empty.")
        update_fields["title"] = clean_title

    if data.version is not None:
        update_fields["version"] = data.version.strip()

    if data.description is not None:
        update_fields["description"] = data.description.strip() if data.description else None

    if data.status is not None:
        status_val = data.status.strip().lower()
        if status_val in VALID_PROTOTYPE_STATUSES:
            update_fields["status"] = status_val

    if data.artifact_url is not None:
        update_fields["artifact_url"] = data.artifact_url.strip() if data.artifact_url else None

    if data.artifact_public_id is not None:
        update_fields["artifact_public_id"] = data.artifact_public_id.strip() if data.artifact_public_id else None

    if data.artifact_type is not None:
        update_fields["artifact_type"] = data.artifact_type.strip() if data.artifact_type else None

    coll.update_one({"_id": p_obj}, {"$set": update_fields})
    updated = coll.find_one({"_id": p_obj})
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated prototype.")

    _log_project_activity(
        project_id,
        uni_id,
        user_id,
        "prototype_updated",
        f"Prototype '{updated.get('title')}' updated ({updated.get('status')}).",
    )

    return {
        "id": str(updated["_id"]),
        "_id": str(updated["_id"]),
        "project_id": str(updated["project_id"]),
        "university_id": str(updated["university_id"]),
        "version": updated.get("version", "v1.0"),
        "title": updated.get("title", ""),
        "description": updated.get("description"),
        "status": updated.get("status", "planned"),
        "artifact_url": updated.get("artifact_url"),
        "artifact_public_id": updated.get("artifact_public_id"),
        "artifact_type": updated.get("artifact_type"),
        "created_by": updated.get("created_by"),
        "created_at": updated.get("created_at", ""),
        "updated_at": updated.get("updated_at", ""),
    }


def delete_prototype(user_id: str, project_id: str, prototype_id: str) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_prototypes_collection()

    try:
        p_obj = ObjectId(prototype_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Prototype not found.")

    doc = coll.find_one({"_id": p_obj, "project_id": str(project_id), "university_id": str(uni_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Prototype not found.")

    pub_id = doc.get("artifact_public_id")
    if pub_id:
        try:
            delete_prototype_artifact(pub_id)
        except Exception as exc:
            logger.warning(f"Could not delete artifact asset from Cloudinary: {exc}")

    coll.delete_one({"_id": p_obj})
    _log_project_activity(project_id, uni_id, user_id, "prototype_deleted", f"Prototype {prototype_id} removed.")
    return {"message": "Prototype deleted successfully.", "id": prototype_id}


# -----------------------------------------------------------------------------
# Part 6: Pilots
# -----------------------------------------------------------------------------

def create_pilot(user_id: str, project_id: str, data: PilotCreate) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    clean_title = data.title.strip()
    if not clean_title:
        raise HTTPException(status_code=400, detail="Pilot title cannot be empty.")

    status_val = data.status.strip().lower() if data.status else "planned"
    if status_val not in VALID_PILOT_STATUSES:
        status_val = "planned"

    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "project_id": str(project_id),
        "university_id": str(uni_id),
        "title": clean_title,
        "location": data.location.strip(),
        "objectives": data.objectives.strip(),
        "start_date": data.start_date.strip() if data.start_date else None,
        "end_date": data.end_date.strip() if data.end_date else None,
        "status": status_val,
        "observations": data.observations.strip() if data.observations else None,
        "results": data.results.strip() if data.results else None,
        "issues": data.issues.strip() if data.issues else None,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    res = get_project_pilots_collection().insert_one(doc)
    doc["_id"] = res.inserted_id
    doc["id"] = str(res.inserted_id)

    _log_project_activity(
        project_id,
        uni_id,
        user_id,
        "pilot_created",
        f"Pilot deployment '{clean_title}' registered at '{data.location}'.",
    )
    return doc


def get_pilot_list(user_id: str, project_id: str) -> List[Dict[str, Any]]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    docs = list(get_project_pilots_collection().find({
        "project_id": str(project_id),
        "university_id": str(uni_id),
    }).sort("created_at", -1))

    return [
        {
            "id": str(d["_id"]),
            "_id": str(d["_id"]),
            "project_id": str(d["project_id"]),
            "university_id": str(d["university_id"]),
            "title": d.get("title", ""),
            "location": d.get("location", ""),
            "objectives": d.get("objectives", ""),
            "start_date": d.get("start_date"),
            "end_date": d.get("end_date"),
            "status": d.get("status", "planned"),
            "observations": d.get("observations"),
            "results": d.get("results"),
            "issues": d.get("issues"),
            "created_at": d.get("created_at", ""),
            "updated_at": d.get("updated_at", ""),
        }
        for d in docs
    ]


def get_pilot_by_id(user_id: str, project_id: str, pilot_id: str) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_pilots_collection()

    try:
        p_obj = ObjectId(pilot_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Pilot not found.")

    doc = coll.find_one({"_id": p_obj, "project_id": str(project_id), "university_id": str(uni_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Pilot not found.")

    return {
        "id": str(doc["_id"]),
        "_id": str(doc["_id"]),
        "project_id": str(doc["project_id"]),
        "university_id": str(doc["university_id"]),
        "title": doc.get("title", ""),
        "location": doc.get("location", ""),
        "objectives": doc.get("objectives", ""),
        "start_date": doc.get("start_date"),
        "end_date": doc.get("end_date"),
        "status": doc.get("status", "planned"),
        "observations": doc.get("observations"),
        "results": doc.get("results"),
        "issues": doc.get("issues"),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


def update_pilot(
    user_id: str,
    project_id: str,
    pilot_id: str,
    data: PilotUpdate,
) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_pilots_collection()

    try:
        p_obj = ObjectId(pilot_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Pilot not found.")

    existing = coll.find_one({"_id": p_obj, "project_id": str(project_id), "university_id": str(uni_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Pilot not found.")

    now_iso = datetime.now(timezone.utc).isoformat()
    update_fields: Dict[str, Any] = {"updated_at": now_iso}

    if data.title is not None:
        clean_title = data.title.strip()
        if not clean_title:
            raise HTTPException(status_code=400, detail="Pilot title cannot be empty.")
        update_fields["title"] = clean_title

    if data.location is not None:
        update_fields["location"] = data.location.strip()

    if data.objectives is not None:
        update_fields["objectives"] = data.objectives.strip()

    if data.start_date is not None:
        update_fields["start_date"] = data.start_date.strip() if data.start_date else None

    if data.end_date is not None:
        update_fields["end_date"] = data.end_date.strip() if data.end_date else None

    if data.status is not None:
        status_val = data.status.strip().lower()
        if status_val in VALID_PILOT_STATUSES:
            update_fields["status"] = status_val

    if data.observations is not None:
        update_fields["observations"] = data.observations.strip() if data.observations else None

    if data.results is not None:
        update_fields["results"] = data.results.strip() if data.results else None

    if data.issues is not None:
        update_fields["issues"] = data.issues.strip() if data.issues else None

    coll.update_one({"_id": p_obj}, {"$set": update_fields})
    updated = coll.find_one({"_id": p_obj})
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated pilot.")

    _log_project_activity(
        project_id,
        uni_id,
        user_id,
        "pilot_updated",
        f"Pilot '{updated.get('title')}' status updated to '{updated.get('status')}'.",
    )

    return {
        "id": str(updated["_id"]),
        "_id": str(updated["_id"]),
        "project_id": str(updated["project_id"]),
        "university_id": str(updated["university_id"]),
        "title": updated.get("title", ""),
        "location": updated.get("location", ""),
        "objectives": updated.get("objectives", ""),
        "start_date": updated.get("start_date"),
        "end_date": updated.get("end_date"),
        "status": updated.get("status", "planned"),
        "observations": updated.get("observations"),
        "results": updated.get("results"),
        "issues": updated.get("issues"),
        "created_at": updated.get("created_at", ""),
        "updated_at": updated.get("updated_at", ""),
    }


def delete_pilot(user_id: str, project_id: str, pilot_id: str) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_pilots_collection()

    try:
        p_obj = ObjectId(pilot_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Pilot not found.")

    res = coll.delete_one({"_id": p_obj, "project_id": str(project_id), "university_id": str(uni_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pilot not found.")

    _log_project_activity(project_id, uni_id, user_id, "pilot_deleted", f"Pilot {pilot_id} deleted.")
    return {"message": "Pilot deleted successfully.", "id": pilot_id}


# -----------------------------------------------------------------------------
# Part 7: Deployment Readiness
# -----------------------------------------------------------------------------

def get_deployment_readiness(user_id: str, project_id: str) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_deployment_readiness_collection()
    doc = coll.find_one({"project_id": str(project_id), "university_id": str(uni_id)})
    if not doc:
        return {
            "project_id": str(project_id),
            "university_id": str(uni_id),
            "readiness_status": "not_ready",
            "technical_readiness": None,
            "infrastructure_requirements": None,
            "estimated_cost": None,
            "maintenance_requirements": None,
            "deployment_requirements": None,
            "blockers": None,
            "notes": None,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

    return {
        "id": str(doc["_id"]),
        "_id": str(doc["_id"]),
        "project_id": str(doc["project_id"]),
        "university_id": str(doc["university_id"]),
        "readiness_status": doc.get("readiness_status", "not_ready"),
        "technical_readiness": doc.get("technical_readiness"),
        "infrastructure_requirements": doc.get("infrastructure_requirements"),
        "estimated_cost": doc.get("estimated_cost"),
        "maintenance_requirements": doc.get("maintenance_requirements"),
        "deployment_requirements": doc.get("deployment_requirements"),
        "blockers": doc.get("blockers"),
        "notes": doc.get("notes"),
        "updated_at": doc.get("updated_at", ""),
    }


def update_deployment_readiness(
    user_id: str,
    project_id: str,
    data: DeploymentReadinessUpdate,
) -> Dict[str, Any]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_deployment_readiness_collection()
    now_iso = datetime.now(timezone.utc).isoformat()

    status_val = data.readiness_status.strip().lower() if data.readiness_status else "not_ready"
    if status_val not in VALID_READINESS_STATUSES:
        status_val = "not_ready"

    update_fields = {
        "project_id": str(project_id),
        "university_id": str(uni_id),
        "readiness_status": status_val,
        "technical_readiness": data.technical_readiness.strip() if data.technical_readiness else None,
        "infrastructure_requirements": data.infrastructure_requirements.strip() if data.infrastructure_requirements else None,
        "estimated_cost": data.estimated_cost.strip() if data.estimated_cost else None,
        "maintenance_requirements": data.maintenance_requirements.strip() if data.maintenance_requirements else None,
        "deployment_requirements": data.deployment_requirements.strip() if data.deployment_requirements else None,
        "blockers": data.blockers.strip() if data.blockers else None,
        "notes": data.notes.strip() if data.notes else None,
        "updated_at": now_iso,
    }

    coll.update_one(
        {"project_id": str(project_id), "university_id": str(uni_id)},
        {"$set": update_fields},
        upsert=True,
    )

    _log_project_activity(
        project_id,
        uni_id,
        user_id,
        "readiness_updated",
        f"Deployment readiness assessment updated to '{status_val}'.",
    )

    return update_fields


# -----------------------------------------------------------------------------
# Part 9: Project Activity
# -----------------------------------------------------------------------------

def get_project_activity(user_id: str, project_id: str) -> List[Dict[str, Any]]:
    uni_id, _ = _verify_project_ownership(user_id, project_id)
    coll = get_project_activity_collection()
    docs = list(coll.find({
        "project_id": str(project_id),
        "university_id": str(uni_id),
    }).sort("created_at", -1).limit(60))

    return [
        {
            "id": str(d["_id"]),
            "_id": str(d["_id"]),
            "project_id": str(d["project_id"]),
            "university_id": str(d["university_id"]),
            "actor_id": d.get("actor_id"),
            "action": d.get("action", ""),
            "description": d.get("description", ""),
            "created_at": d.get("created_at", ""),
        }
        for d in docs
    ]







