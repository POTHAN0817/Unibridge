import math
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set
from bson import ObjectId
from fastapi import HTTPException, status

from app.database.mongodb import (
    get_challenges_collection,
    get_government_activity_collection,
    get_government_challenge_reviews_collection,
    get_government_profiles_collection,
    get_industry_partnerships_collection,
    get_project_activity_collection,
    get_project_industry_funding_collection,
    get_project_industry_resources_collection,
    get_project_mentorships_collection,
    get_universities_collection,
    get_university_projects_collection,
    get_university_teams_collection,
)
from app.schemas.government import (
    GovernmentChallengeDetail,
    GovernmentChallengeReviewCreate,
    GovernmentChallengeReviewResponse,
    GovernmentChallengeReviewUpdate,
    GovernmentChallengesPage,
    GovernmentChallengesSummaryCounts,
    GovernmentChallengeSummary,
    GovernmentProfileCreate,
    GovernmentProfileUpdate,
    GovernmentProjectRelationship,
)


def _serialize_profile(doc: dict) -> dict:
    """Helper to convert MongoDB document to response dict."""
    return {
        "id": str(doc["_id"]),
        "user_id": str(doc.get("user_id", "")),
        "department_name": doc.get("department_name", ""),
        "department_type": doc.get("department_type", ""),
        "designation": doc.get("designation", ""),
        "jurisdiction": doc.get("jurisdiction", ""),
        "jurisdiction_level": doc.get("jurisdiction_level", "district"),
        "state": doc.get("state"),
        "district": doc.get("district"),
        "city": doc.get("city"),
        "official_email": doc.get("official_email", ""),
        "phone": doc.get("phone"),
        "description": doc.get("description"),
        "areas_of_focus": doc.get("areas_of_focus", []),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


def get_government_profile(user_id: str) -> Optional[dict]:
    """Retrieve government profile for the authenticated government user."""
    col = get_government_profiles_collection()
    doc = col.find_one({"user_id": user_id})
    if not doc:
        return None
    return _serialize_profile(doc)


def create_government_profile(user_id: str, data: GovernmentProfileCreate) -> dict:
    """Create a new government profile. One profile per user_id."""
    col = get_government_profiles_collection()
    existing = col.find_one({"user_id": user_id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A government profile already exists for this account.",
        )

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "user_id": user_id,
        "department_name": data.department_name.strip(),
        "department_type": data.department_type.strip(),
        "designation": data.designation.strip(),
        "jurisdiction": data.jurisdiction.strip(),
        "jurisdiction_level": data.jurisdiction_level,
        "state": data.state.strip() if data.state else None,
        "district": data.district.strip() if data.district else None,
        "city": data.city.strip() if data.city else None,
        "official_email": str(data.official_email).strip().lower(),
        "phone": data.phone.strip() if data.phone else None,
        "description": data.description.strip() if data.description else None,
        "areas_of_focus": [a.strip() for a in data.areas_of_focus if a and a.strip()],
        "created_at": now,
        "updated_at": now,
    }

    result = col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize_profile(doc)


def update_government_profile(user_id: str, data: GovernmentProfileUpdate) -> dict:
    """Update existing government profile for authenticated government user."""
    col = get_government_profiles_collection()
    existing = col.find_one({"user_id": user_id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government profile not found. Please create your profile first.",
        )

    update_fields: Dict[str, Any] = {}
    for field, val in data.model_dump(exclude_unset=True).items():
        if val is not None:
            if isinstance(val, str):
                update_fields[field] = val.strip()
            elif isinstance(val, list):
                update_fields[field] = [item.strip() for item in val if isinstance(item, str) and item.strip()]
            else:
                update_fields[field] = val

    if not update_fields:
        return _serialize_profile(existing)

    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    col.update_one({"user_id": user_id}, {"$set": update_fields})

    updated_doc = col.find_one({"user_id": user_id})
    return _serialize_profile(updated_doc)  # type: ignore


def get_dashboard_metrics() -> dict:
    """
    Aggregate real high-level platform oversight metrics from MongoDB collections.
    Does not invent, estimate, or synthesize any numbers.
    """
    ch_col = get_challenges_collection()
    proj_col = get_university_projects_collection()
    parts_col = get_industry_partnerships_collection()
    mntrs_col = get_project_mentorships_collection()
    res_col = get_project_industry_resources_collection()
    fund_col = get_project_industry_funding_collection()

    total_challenges = ch_col.count_documents({})
    submitted_challenges = ch_col.count_documents({"status": "submitted"})
    ai_processed_challenges = ch_col.count_documents({
        "$or": [
            {"ai_status": "completed"},
            {"ai_analysis": {"$ne": None}},
        ]
    })
    govt_rev_col = get_government_challenge_reviews_collection()
    govt_validated_cids = {r["challenge_id"] for r in govt_rev_col.find({"decision": "validated"}, {"challenge_id": 1}) if r.get("challenge_id")}
    validated_challenges = len(govt_validated_cids) if govt_validated_cids else ch_col.count_documents({
        "status": {"$in": ["validated", "verified", "accepted", "resolved"]}
    })


    total_university_projects = proj_col.count_documents({})
    active_university_projects = proj_col.count_documents({
        "status": {"$nin": ["completed", "archived"]}
    })
    pilot_projects = proj_col.count_documents({"status": "pilot"})
    deployed_projects = proj_col.count_documents({
        "status": {"$in": ["deployment", "completed"]}
    })

    total_industry_partnerships = parts_col.count_documents({})
    accepted_industry_partnerships = parts_col.count_documents({"status": "accepted"})

    active_mentorships = mntrs_col.count_documents({"status": "active"})
    resource_contributions = res_col.count_documents({})
    funding_proposals = fund_col.count_documents({})

    return {
        "total_challenges": total_challenges,
        "submitted_challenges": submitted_challenges,
        "ai_processed_challenges": ai_processed_challenges,
        "validated_challenges": validated_challenges,
        "total_university_projects": total_university_projects,
        "active_university_projects": active_university_projects,
        "pilot_projects": pilot_projects,
        "deployed_projects": deployed_projects,
        "total_industry_partnerships": total_industry_partnerships,
        "accepted_industry_partnerships": accepted_industry_partnerships,
        "active_mentorships": active_mentorships,
        "resource_contributions": resource_contributions,
        "funding_proposals": funding_proposals,
    }


def get_recent_platform_activity(limit: int = 10) -> List[dict]:
    """
    Retrieve real platform activity records from the project_activity collection.
    """
    col = get_project_activity_collection()
    cursor = col.find({}).sort("created_at", -1).limit(limit)

    items = []
    for d in cursor:
        items.append({
            "id": str(d["_id"]),
            "project_id": str(d.get("project_id", "")),
            "action": d.get("action", "activity"),
            "description": d.get("description", ""),
            "created_at": d.get("created_at", ""),
        })
    return items


# ============================================================================
# Step 8B: Government Challenge Monitoring & Validation Service
# ============================================================================

def _serialize_review(doc: dict, officer_name: Optional[str] = None, department_name: Optional[str] = None) -> dict:
    """Helper to convert review MongoDB document into clean response dict."""
    return {
        "id": str(doc["_id"]),
        "challenge_id": str(doc["challenge_id"]),
        "government_user_id": str(doc["government_user_id"]),
        "decision": str(doc.get("decision", "pending")),
        "review_note": doc.get("review_note"),
        "clarification_request": doc.get("clarification_request"),
        "reviewed_at": str(doc.get("reviewed_at", "")),
        "created_at": str(doc.get("created_at", "")),
        "updated_at": str(doc.get("updated_at", "")),
        "officer_name": officer_name,
        "department_name": department_name,
    }


def _resolve_university_name(university_id: Optional[str]) -> Optional[str]:
    """Resolve university name by ID from universities collection without erroring."""
    if not university_id:
        return None
    try:
        uni_col = get_universities_collection()
        doc = uni_col.find_one({"created_by": str(university_id)})
        if not doc and ObjectId.is_valid(university_id):
            doc = uni_col.find_one({"_id": ObjectId(university_id)})
        if doc:
            return doc.get("name") or doc.get("institution_name")
    except Exception:
        pass
    return None


def _resolve_team_name(team_id: Optional[str]) -> Optional[str]:
    """Resolve team name from university_teams collection."""
    if not team_id:
        return None
    try:
        teams_col = get_university_teams_collection()
        doc = None
        if ObjectId.is_valid(team_id):
            doc = teams_col.find_one({"_id": ObjectId(team_id)})
        if not doc:
            doc = teams_col.find_one({"_id": str(team_id)})
        if doc:
            return doc.get("name")
    except Exception:
        pass
    return None


def get_challenges(
    search: Optional[str] = None,
    category: Optional[str] = None,
    priority_level: Optional[str] = None,
    government_review_status: Optional[str] = None,
    ai_status: Optional[str] = None,
    duplicate_status: Optional[str] = None,
    challenge_status: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    government_user_id: Optional[str] = None,
) -> GovernmentChallengesPage:
    """
    Search, filter, and paginate societal challenges for Government oversight.
    All data is directly loaded from MongoDB without fake or synthetic records.
    """
    ch_col = get_challenges_collection()
    rev_col = get_government_challenge_reviews_collection()
    proj_col = get_university_projects_collection()

    # Base MongoDB filter query
    query: Dict[str, Any] = {}

    if search and search.strip():
        term = re.escape(search.strip())
        query["$or"] = [
            {"title": {"$regex": term, "$options": "i"}},
            {"description": {"$regex": term, "$options": "i"}},
        ]

    if category and category.strip() and category.lower() != "all":
        query["category"] = {"$regex": f"^{re.escape(category.strip())}$", "$options": "i"}

    if priority_level and priority_level.strip() and priority_level.lower() != "all":
        query["priority_analysis.level"] = {"$regex": f"^{re.escape(priority_level.strip())}$", "$options": "i"}

    if ai_status and ai_status.strip() and ai_status.lower() != "all":
        query["ai_status"] = ai_status.strip().lower()

    if duplicate_status and duplicate_status.strip() and duplicate_status.lower() != "all":
        query["duplicate_analysis.status"] = duplicate_status.strip().lower()

    if challenge_status and challenge_status.strip() and challenge_status.lower() != "all":
        query["status"] = challenge_status.strip().lower()

    if state and state.strip() and state.lower() != "all":
        query["location.state"] = {"$regex": f"^{re.escape(state.strip())}$", "$options": "i"}

    if district and district.strip() and district.lower() != "all":
        query["location.district"] = {"$regex": f"^{re.escape(district.strip())}$", "$options": "i"}

    # Handle Government review status filter
    if government_review_status and government_review_status.strip() and government_review_status.lower() != "all":
        st = government_review_status.strip().lower()
        if st in ["validated", "rejected", "clarification_required"]:
            matched_docs = rev_col.find({"decision": st}, {"challenge_id": 1})
            matched_cids = {r["challenge_id"] for r in matched_docs if r.get("challenge_id")}
            valid_oids = [ObjectId(cid) for cid in matched_cids if ObjectId.is_valid(cid)]
            query["_id"] = {"$in": valid_oids}
        elif st == "pending":
            resolved_docs = rev_col.find(
                {"decision": {"$in": ["validated", "rejected", "clarification_required"]}},
                {"challenge_id": 1},
            )
            resolved_cids = {r["challenge_id"] for r in resolved_docs if r.get("challenge_id")}
            resolved_oids = [ObjectId(cid) for cid in resolved_cids if ObjectId.is_valid(cid)]
            query["_id"] = {"$nin": resolved_oids}

    # Summary metrics across all challenges
    total_challenges_in_db = ch_col.count_documents({})
    validated_cids = {r["challenge_id"] for r in rev_col.find({"decision": "validated"}, {"challenge_id": 1}) if r.get("challenge_id")}
    rejected_cids = {r["challenge_id"] for r in rev_col.find({"decision": "rejected"}, {"challenge_id": 1}) if r.get("challenge_id")}
    clarification_cids = {r["challenge_id"] for r in rev_col.find({"decision": "clarification_required"}, {"challenge_id": 1}) if r.get("challenge_id")}

    val_count = len(validated_cids)
    rej_count = len(rejected_cids)
    clar_count = len(clarification_cids)
    pending_count = max(0, total_challenges_in_db - (val_count + rej_count + clar_count))

    summary_counts = GovernmentChallengesSummaryCounts(
        total=total_challenges_in_db,
        pending=pending_count,
        validated=val_count,
        clarification_required=clar_count,
        rejected=rej_count,
    )

    # Calculate pagination
    total_matched = ch_col.count_documents(query)
    total_pages = max(1, math.ceil(total_matched / limit)) if total_matched > 0 else 1
    safe_page = max(1, min(page, total_pages))
    skip = (safe_page - 1) * limit

    cursor = ch_col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = list(cursor)

    # Batch gather reviews and projects to avoid N+1 queries
    c_ids_str = [str(d["_id"]) for d in docs]
    reviews_by_cid: Dict[str, dict] = {}
    if c_ids_str:
        for r in rev_col.find({"challenge_id": {"$in": c_ids_str}}):
            reviews_by_cid[r["challenge_id"]] = r

    projects_by_cid: Dict[str, dict] = {}
    if c_ids_str:
        for p in proj_col.find({"challenge_id": {"$in": c_ids_str}}):
            projects_by_cid[str(p.get("challenge_id"))] = p

    items: List[GovernmentChallengeSummary] = []
    for d in docs:
        cid = str(d["_id"])
        ai = d.get("ai_analysis") or {}
        dup = d.get("duplicate_analysis") or {}
        pri = d.get("priority_analysis") or {}

        # Check for review
        rev = reviews_by_cid.get(cid)
        gov_review_resp = None
        gov_decision = "pending"
        gov_review_date = None

        if rev:
            gov_review_resp = GovernmentChallengeReviewResponse(**_serialize_review(rev))
            gov_decision = rev.get("decision", "pending")
            gov_review_date = rev.get("reviewed_at")

        # Check for linked project
        proj = projects_by_cid.get(cid)
        has_project = bool(proj)
        proj_name = proj.get("name") if proj else None
        proj_status = proj.get("status") if proj else None
        uni_name = _resolve_university_name(proj.get("university_id")) if proj else None

        items.append(
            GovernmentChallengeSummary(
                challenge_id=cid,
                title=d.get("title", "Untitled Challenge"),
                description=d.get("description", ""),
                category=d.get("category"),
                subcategory=d.get("subcategory"),
                location=d.get("location"),
                submitted_at=str(d.get("created_at", "")),
                status=d.get("status", "submitted"),
                ai_status=d.get("ai_status", "pending"),
                affected_people=d.get("affected_people"),
                urgency=d.get("urgency"),
                citizen_tags=d.get("citizen_tags") or [],
                ai_category=ai.get("category"),
                ai_confidence=ai.get("confidence"),
                keywords=ai.get("keywords") or [],
                required_skills=ai.get("required_skills") or d.get("required_skills") or [],
                priority_score=d.get("priority_score") if d.get("priority_score") is not None else pri.get("score"),
                priority_level=pri.get("level"),
                priority_explanation=pri.get("explanation"),
                duplicate_status=dup.get("status"),
                highest_similarity=dup.get("highest_similarity"),
                matched_challenge_id=dup.get("matched_challenge_id"),
                government_review=gov_review_resp,
                government_review_decision=gov_decision,
                government_review_date=gov_review_date,
                has_project=has_project,
                project_name=proj_name,
                project_status=proj_status,
                university_name=uni_name,
            )
        )

    return GovernmentChallengesPage(
        items=items,
        total=total_matched,
        page=safe_page,
        limit=limit,
        total_pages=total_pages,
        summary_counts=summary_counts,
    )


def get_challenge_detail(challenge_id: str, government_user_id: str) -> GovernmentChallengeDetail:
    """
    Fetch comprehensive challenge dossier for Government inspection.
    Includes AI categorization, duplicate detection, priority factor breakdown,
    linked University project, and active Government review status.
    Strictly safeguards Citizen privacy (no password/credentials exposed).
    """
    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid challenge ID format.")

    ch_col = get_challenges_collection()
    doc = ch_col.find_one({"_id": ObjectId(challenge_id)})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    rev_col = get_government_challenge_reviews_collection()
    # Find review by this user or general review for this challenge
    rev = rev_col.find_one({"challenge_id": challenge_id, "government_user_id": government_user_id})
    if not rev:
        rev = rev_col.find_one({"challenge_id": challenge_id})

    gov_review_resp = None
    if rev:
        officer_name = None
        dept_name = None
        prof = get_government_profiles_collection().find_one({"user_id": rev.get("government_user_id")})
        if prof:
            officer_name = f"{prof.get('designation', '')} ({prof.get('department_name', '')})".strip()
            dept_name = prof.get("department_name")
        gov_review_resp = GovernmentChallengeReviewResponse(**_serialize_review(rev, officer_name=officer_name, department_name=dept_name))

    # Check project relationship
    proj_col = get_university_projects_collection()
    proj_doc = proj_col.find_one({"challenge_id": challenge_id})
    proj_rel = None
    if proj_doc:
        uni_name = _resolve_university_name(proj_doc.get("university_id"))
        team_name = _resolve_team_name(proj_doc.get("team_id"))
        proj_rel = GovernmentProjectRelationship(
            project_id=str(proj_doc["_id"]),
            project_name=proj_doc.get("name", ""),
            status=proj_doc.get("status", "planning"),
            university_id=str(proj_doc.get("university_id", "")),
            university_name=uni_name,
            team_id=str(proj_doc.get("team_id")) if proj_doc.get("team_id") else None,
            team_name=team_name,
            lifecycle_stage=proj_doc.get("lifecycle_stage") or proj_doc.get("status"),
            start_date=proj_doc.get("start_date"),
            target_date=proj_doc.get("target_date"),
        )

    img_data = doc.get("image")
    img_url = img_data.get("url") if isinstance(img_data, dict) else None

    return GovernmentChallengeDetail(
        challenge_id=str(doc["_id"]),
        title=doc.get("title", ""),
        description=doc.get("description", ""),
        category=doc.get("category"),
        subcategory=doc.get("subcategory"),
        location=doc.get("location"),
        affected_people=doc.get("affected_people"),
        urgency=doc.get("urgency"),
        citizen_tags=doc.get("citizen_tags") or [],
        created_at=str(doc.get("created_at", "")),
        updated_at=str(doc.get("updated_at", "")),
        challenge_status=doc.get("status", "submitted"),
        image_url=img_url,
        ai_analysis=doc.get("ai_analysis"),
        duplicate_analysis=doc.get("duplicate_analysis"),
        priority_analysis=doc.get("priority_analysis"),
        project_relationship=proj_rel,
        government_review=gov_review_resp,
    )


def get_challenge_review(challenge_id: str, government_user_id: str) -> Optional[GovernmentChallengeReviewResponse]:
    """Retrieve the authenticated government official's review for a given challenge."""
    if not ObjectId.is_valid(challenge_id):
        return None
    rev_col = get_government_challenge_reviews_collection()
    rev = rev_col.find_one({"challenge_id": challenge_id, "government_user_id": government_user_id})
    if not rev:
        return None
    return GovernmentChallengeReviewResponse(**_serialize_review(rev))


def create_challenge_review(
    challenge_id: str,
    government_user_id: str,
    data: GovernmentChallengeReviewCreate,
) -> GovernmentChallengeReviewResponse:
    """
    Record an official Government validation decision for a challenge.
    Does NOT mutate the original Citizen challenge document.
    Enforces uniqueness per (challenge_id, government_user_id) and writes real audit log.
    """
    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid challenge ID.")

    ch_col = get_challenges_collection()
    ch_doc = ch_col.find_one({"_id": ObjectId(challenge_id)})
    if not ch_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge does not exist.")

    rev_col = get_government_challenge_reviews_collection()
    existing = rev_col.find_one({"challenge_id": challenge_id, "government_user_id": government_user_id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A government review already exists for this challenge. Please update your existing review.",
        )

    now = datetime.now(timezone.utc).isoformat()
    review_doc = {
        "challenge_id": challenge_id,
        "government_user_id": government_user_id,
        "decision": data.decision,
        "review_note": data.review_note.strip() if data.review_note else None,
        "clarification_request": data.clarification_request.strip() if data.clarification_request else None,
        "reviewed_at": now,
        "created_at": now,
        "updated_at": now,
    }

    result = rev_col.insert_one(review_doc)
    review_doc["_id"] = result.inserted_id

    # Create immutable Government Audit Trail
    action_map = {
        "validated": "challenge_validated",
        "rejected": "challenge_rejected",
        "clarification_required": "clarification_requested",
        "pending": "challenge_review_created",
    }
    action_name = action_map.get(data.decision, "challenge_review_created")

    gov_act_col = get_government_activity_collection()
    gov_act_col.insert_one({
        "government_user_id": government_user_id,
        "challenge_id": challenge_id,
        "action": action_name,
        "decision": data.decision,
        "review_note": review_doc["review_note"],
        "clarification_request": review_doc["clarification_request"],
        "created_at": now,
        "metadata": {
            "challenge_title": ch_doc.get("title", ""),
            "category": ch_doc.get("category"),
        },
    })

    # If linked to a university project, record project activity log
    proj_col = get_university_projects_collection()
    proj = proj_col.find_one({"challenge_id": challenge_id})
    if proj:
        proj_act_col = get_project_activity_collection()
        proj_act_col.insert_one({
            "project_id": str(proj["_id"]),
            "university_id": str(proj.get("university_id", "")),
            "action": f"government_{data.decision}",
            "description": f"Government oversight decision: {data.decision.replace('_', ' ').title()}",
            "created_at": now,
        })

    # Resolve official details for response
    prof = get_government_profiles_collection().find_one({"user_id": government_user_id})
    officer_name = f"{prof.get('designation', '')} ({prof.get('department_name', '')})".strip() if prof else None
    dept_name = prof.get("department_name") if prof else None

    return GovernmentChallengeReviewResponse(**_serialize_review(review_doc, officer_name=officer_name, department_name=dept_name))


def update_challenge_review(
    challenge_id: str,
    government_user_id: str,
    data: GovernmentChallengeReviewUpdate,
) -> GovernmentChallengeReviewResponse:
    """
    Update the authenticated government user's existing review for a challenge.
    Cross-user editing is strictly forbidden.
    Writes real audit log into government_activity.
    """
    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid challenge ID.")

    rev_col = get_government_challenge_reviews_collection()
    existing = rev_col.find_one({"challenge_id": challenge_id, "government_user_id": government_user_id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No existing review found for this challenge. Please create a review first.",
        )

    now = datetime.now(timezone.utc).isoformat()
    update_fields: Dict[str, Any] = {
        "updated_at": now,
        "reviewed_at": now,
    }

    if data.decision is not None:
        update_fields["decision"] = data.decision
    if data.review_note is not None:
        update_fields["review_note"] = data.review_note.strip() if data.review_note else None
    if data.clarification_request is not None:
        update_fields["clarification_request"] = data.clarification_request.strip() if data.clarification_request else None

    rev_col.update_one(
        {"challenge_id": challenge_id, "government_user_id": government_user_id},
        {"$set": update_fields},
    )

    updated_doc = rev_col.find_one({"challenge_id": challenge_id, "government_user_id": government_user_id})

    # Create audit record
    decision_val = update_fields.get("decision", existing.get("decision"))
    gov_act_col = get_government_activity_collection()
    gov_act_col.insert_one({
        "government_user_id": government_user_id,
        "challenge_id": challenge_id,
        "action": "challenge_review_updated",
        "decision": decision_val,
        "review_note": update_fields.get("review_note", existing.get("review_note")),
        "clarification_request": update_fields.get("clarification_request", existing.get("clarification_request")),
        "created_at": now,
    })

    prof = get_government_profiles_collection().find_one({"user_id": government_user_id})
    officer_name = f"{prof.get('designation', '')} ({prof.get('department_name', '')})".strip() if prof else None
    dept_name = prof.get("department_name") if prof else None

    return GovernmentChallengeReviewResponse(**_serialize_review(updated_doc, officer_name=officer_name, department_name=dept_name))  # type: ignore

