import math
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set
from bson import ObjectId
from fastapi import HTTPException, status

from app.database.mongodb import (
    get_challenges_collection,
    get_government_actions_collection,
    get_government_activity_collection,
    get_government_challenge_reviews_collection,
    get_government_profiles_collection,
    get_industry_experts_collection,
    get_industry_partnerships_collection,
    get_industry_profiles_collection,
    get_project_activity_collection,
    get_project_deployment_readiness_collection,
    get_project_industry_funding_collection,
    get_project_industry_resources_collection,
    get_project_mentorships_collection,
    get_project_milestones_collection,
    get_project_pilots_collection,
    get_project_prototypes_collection,
    get_project_research_collection,
    get_project_solutions_collection,
    get_universities_collection,
    get_university_faculty_collection,
    get_university_projects_collection,
    get_university_students_collection,
    get_university_teams_collection,
)
from app.schemas.government import (
    GovernmentActionCreate,
    GovernmentActionResponse,
    GovernmentActionsPage,
    GovernmentActionsSummaryCounts,
    GovernmentActionUpdate,
    GovernmentAnalyticsItem,
    GovernmentAnalyticsResponse,
    GovernmentChallengeDetail,
    GovernmentChallengeReviewCreate,
    GovernmentChallengeReviewResponse,
    GovernmentChallengeReviewUpdate,
    GovernmentChallengesPage,
    GovernmentChallengesSummaryCounts,
    GovernmentChallengeSummary,
    GovernmentCollaborationDetail,
    GovernmentCollaborationsPage,
    GovernmentCollaborationSummary,
    GovernmentDeploymentItem,
    GovernmentDeploymentsPage,
    GovernmentLifecycleMonitoringSummary,
    GovernmentPilotItem,
    GovernmentPilotsPage,
    GovernmentProfileCreate,
    GovernmentProfileResponse,
    GovernmentProfileUpdate,
    GovernmentProjectDossier,
    GovernmentProjectRelationship,
    GovernmentProjectsPage,
    GovernmentProjectSummary,
)


def _serialize_profile(doc: dict, open_actions: int = 0, reviews_completed: int = 0) -> dict:
    """Helper to convert MongoDB document to response dict with real activity counts."""
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
        "open_actions_count": open_actions,
        "reviews_completed_count": reviews_completed,
    }


def get_government_profile(user_id: str) -> Optional[dict]:
    """Retrieve government profile for the authenticated government user with real counts."""
    col = get_government_profiles_collection()
    doc = col.find_one({"user_id": user_id})
    if not doc:
        return None

    # Count real open actions for this government official
    actions_col = get_government_actions_collection()
    open_actions = actions_col.count_documents({
        "government_user_id": user_id,
        "status": {"$in": ["open", "in_progress"]},
    })

    # Count real challenge reviews completed by this official
    reviews_col = get_government_challenge_reviews_collection()
    reviews_completed = reviews_col.count_documents({
        "government_user_id": user_id,
        "decision": {"$in": ["validated", "rejected", "clarification_required"]},
    })

    return _serialize_profile(doc, open_actions=open_actions, reviews_completed=reviews_completed)


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


# ============================================================================
# Step 8C: Government University Project Monitoring Service
# ============================================================================

def _batch_resolve_universities(uni_ids: Set[str]) -> Dict[str, dict]:
    """Batch fetch universities by ID or created_by string."""
    res = {}
    if not uni_ids:
        return res
    uni_col = get_universities_collection()
    oids = [ObjectId(u) for u in uni_ids if ObjectId.is_valid(u)]
    docs = list(uni_col.find({"$or": [{"_id": {"$in": oids}}, {"created_by": {"$in": list(uni_ids)}}]}))
    for d in docs:
        name = d.get("name") or d.get("institution_name") or "Unknown University"
        res[str(d["_id"])] = {"name": name, "doc": d}
        if d.get("created_by"):
            res[str(d["created_by"])] = {"name": name, "doc": d}
    return res


def _batch_resolve_challenges(c_ids: Set[str]) -> Dict[str, dict]:
    """Batch fetch challenges by ID."""
    res = {}
    if not c_ids:
        return res
    ch_col = get_challenges_collection()
    oids = [ObjectId(c) for c in c_ids if ObjectId.is_valid(c)]
    docs = list(ch_col.find({"_id": {"$in": oids}}))
    for d in docs:
        res[str(d["_id"])] = d
    return res


def _batch_resolve_teams(t_ids: Set[str]) -> Dict[str, dict]:
    """Batch fetch university teams."""
    res = {}
    if not t_ids:
        return res
    t_col = get_university_teams_collection()
    oids = [ObjectId(t) for t in t_ids if ObjectId.is_valid(t)]
    docs = list(t_col.find({"$or": [{"_id": {"$in": oids}}, {"_id": {"$in": list(t_ids)}}]}))
    for d in docs:
        res[str(d["_id"])] = d
    return res


def get_projects(
    search: Optional[str] = None,
    category: Optional[str] = None,
    project_status: Optional[str] = None,
    lifecycle_stage: Optional[str] = None,
    university: Optional[str] = None,
    challenge: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
) -> GovernmentProjectsPage:
    """
    Paginated search and filter for University Projects with real MongoDB counts.
    Zero fabricated metrics.
    """
    proj_col = get_university_projects_collection()
    query: Dict[str, Any] = {}

    if search and search.strip():
        term = re.escape(search.strip())
        query["$or"] = [
            {"name": {"$regex": term, "$options": "i"}},
            {"description": {"$regex": term, "$options": "i"}},
        ]

    if project_status and project_status.strip() and project_status.lower() != "all":
        query["status"] = project_status.strip().lower()

    if lifecycle_stage and lifecycle_stage.strip() and lifecycle_stage.lower() != "all":
        query["$or"] = [
            {"lifecycle_stage": lifecycle_stage.strip().lower()},
            {"status": lifecycle_stage.strip().lower()},
        ]

    if challenge and challenge.strip():
        query["challenge_id"] = challenge.strip()

    if university and university.strip():
        u_val = university.strip()
        # Find matching university ids if searching by name
        matched_unis = list(get_universities_collection().find(
            {"$or": [
                {"name": {"$regex": re.escape(u_val), "$options": "i"}},
                {"institution_name": {"$regex": re.escape(u_val), "$options": "i"}},
                {"created_by": u_val},
            ]},
            {"created_by": 1, "_id": 1}
        ))
        u_ids = [str(u["_id"]) for u in matched_unis] + [str(u.get("created_by")) for u in matched_unis if u.get("created_by")]
        u_ids.append(u_val)
        query["university_id"] = {"$in": u_ids}

    # Filter by category or regional location via challenges
    ch_query: Dict[str, Any] = {}
    if category and category.strip() and category.lower() != "all":
        ch_query["category"] = {"$regex": f"^{re.escape(category.strip())}$", "$options": "i"}
    if state and state.strip() and state.lower() != "all":
        ch_query["location.state"] = {"$regex": f"^{re.escape(state.strip())}$", "$options": "i"}
    if district and district.strip() and district.lower() != "all":
        ch_query["location.district"] = {"$regex": f"^{re.escape(district.strip())}$", "$options": "i"}

    if ch_query:
        matched_challenges = list(get_challenges_collection().find(ch_query, {"_id": 1}))
        ch_ids = [str(c["_id"]) for c in matched_challenges]
        if "challenge_id" in query:
            # Intersection
            if query["challenge_id"] not in ch_ids:
                return GovernmentProjectsPage(items=[], total=0, page=page, limit=limit, total_pages=1, status_counts={})
        else:
            query["challenge_id"] = {"$in": ch_ids}

    total = proj_col.count_documents(query)
    total_pages = max(1, math.ceil(total / limit)) if total > 0 else 1
    safe_page = max(1, min(page, total_pages))
    skip = (safe_page - 1) * limit

    docs = list(proj_col.find(query).sort("created_at", -1).skip(skip).limit(limit))

    # Collect IDs for batch lookups
    p_ids = [str(d["_id"]) for d in docs]
    u_ids = {str(d.get("university_id")) for d in docs if d.get("university_id")}
    c_ids = {str(d.get("challenge_id")) for d in docs if d.get("challenge_id")}
    t_ids = {str(d.get("team_id")) for d in docs if d.get("team_id")}

    unis_map = _batch_resolve_universities(u_ids)
    ch_map = _batch_resolve_challenges(c_ids)
    teams_map = _batch_resolve_teams(t_ids)

    # Batch counts
    m_col = get_project_milestones_collection()
    proto_col = get_project_prototypes_collection()
    pilot_col = get_project_pilots_collection()
    ready_col = get_project_deployment_readiness_collection()
    parts_col = get_industry_partnerships_collection()
    mentors_col = get_project_mentorships_collection()
    res_col = get_project_industry_resources_collection()
    fund_col = get_project_industry_funding_collection()

    milestones_by_proj: Dict[str, List[dict]] = {}
    if p_ids:
        for m in m_col.find({"project_id": {"$in": p_ids}}):
            milestones_by_proj.setdefault(str(m["project_id"]), []).append(m)

    protos_by_proj: Dict[str, int] = {}
    if p_ids:
        for p in proto_col.find({"project_id": {"$in": p_ids}}, {"project_id": 1}):
            pid = str(p["project_id"])
            protos_by_proj[pid] = protos_by_proj.get(pid, 0) + 1

    pilots_by_proj: Dict[str, int] = {}
    if p_ids:
        for p in pilot_col.find({"project_id": {"$in": p_ids}}, {"project_id": 1}):
            pid = str(p["project_id"])
            pilots_by_proj[pid] = pilots_by_proj.get(pid, 0) + 1

    readiness_by_proj: Dict[str, str] = {}
    if p_ids:
        for r in ready_col.find({"project_id": {"$in": p_ids}}):
            readiness_by_proj[str(r["project_id"])] = str(r.get("readiness_status", "not_ready"))

    parts_by_proj: Dict[str, int] = {}
    if p_ids:
        for p in parts_col.find({"project_id": {"$in": p_ids}}, {"project_id": 1}):
            pid = str(p["project_id"])
            parts_by_proj[pid] = parts_by_proj.get(pid, 0) + 1

    mentors_by_proj: Dict[str, int] = {}
    if p_ids:
        for m in mentors_col.find({"project_id": {"$in": p_ids}, "status": "active"}, {"project_id": 1}):
            pid = str(m["project_id"])
            mentors_by_proj[pid] = mentors_by_proj.get(pid, 0) + 1

    resources_by_proj: Dict[str, int] = {}
    if p_ids:
        for r in res_col.find({"project_id": {"$in": p_ids}}, {"project_id": 1}):
            pid = str(r["project_id"])
            resources_by_proj[pid] = resources_by_proj.get(pid, 0) + 1

    funding_by_proj: Dict[str, int] = {}
    if p_ids:
        for f in fund_col.find({"project_id": {"$in": p_ids}}, {"project_id": 1}):
            pid = str(f["project_id"])
            funding_by_proj[pid] = funding_by_proj.get(pid, 0) + 1

    # Status breakdown across all projects
    status_counts: Dict[str, int] = {}
    all_statuses = ["planning", "research", "solution_proposed", "prototype", "pilot", "deployment", "completed", "archived"]
    for s in all_statuses:
        status_counts[s] = proj_col.count_documents({"status": s})

    items: List[GovernmentProjectSummary] = []
    for d in docs:
        pid = str(d["_id"])
        uid = str(d.get("university_id", ""))
        cid = str(d.get("challenge_id", ""))
        tid = str(d.get("team_id", ""))

        uni_info = unis_map.get(uid, {})
        ch_info = ch_map.get(cid, {})
        team_info = teams_map.get(tid, {})

        ms = milestones_by_proj.get(pid, [])
        completed_ms = [m for m in ms if m.get("status") == "completed"]

        faculty_count = len(team_info.get("faculty_leads", [])) if team_info else 0
        student_count = len(team_info.get("student_members", [])) if team_info else 0

        st = d.get("status", "planning")
        lc = d.get("lifecycle_stage") or st

        items.append(
            GovernmentProjectSummary(
                project_id=pid,
                name=d.get("name", "Untitled Project"),
                title=d.get("name", "Untitled Project"),
                description=d.get("description"),
                university_id=uid,
                university_name=uni_info.get("name"),
                challenge_id=cid if cid else None,
                challenge_title=ch_info.get("title"),
                category=ch_info.get("category"),
                project_status=st,
                lifecycle_stage=lc,
                created_at=str(d.get("created_at", "")),
                updated_at=str(d.get("updated_at", "")),
                start_date=d.get("start_date"),
                target_date=d.get("target_date"),
                team_id=tid if tid else None,
                team_name=team_info.get("name") if team_info else None,
                team_size=faculty_count + student_count,
                faculty_count=faculty_count,
                student_count=student_count,
                milestone_count=len(ms),
                completed_milestone_count=len(completed_ms),
                prototype_count=protos_by_proj.get(pid, 0),
                pilot_count=pilots_by_proj.get(pid, 0),
                deployment_readiness_state=readiness_by_proj.get(pid, "not_ready"),
                industry_partnership_count=parts_by_proj.get(pid, 0),
                active_mentorship_count=mentors_by_proj.get(pid, 0),
                resource_contribution_count=resources_by_proj.get(pid, 0),
                funding_proposal_count=funding_by_proj.get(pid, 0),
            )
        )

    return GovernmentProjectsPage(
        items=items,
        total=total,
        page=safe_page,
        limit=limit,
        total_pages=total_pages,
        status_counts=status_counts,
    )


def get_project_dossier(project_id: str) -> GovernmentProjectDossier:
    """
    Build complete 12-section administrative project dossier.
    Strictly read-only and backed by real MongoDB collections.
    """
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid project ID format.")

    proj_col = get_university_projects_collection()
    proj = proj_col.find_one({"_id": ObjectId(project_id)})
    if not proj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="University project not found.")

    pid_str = str(proj["_id"])
    uid_str = str(proj.get("university_id", ""))
    cid_str = str(proj.get("challenge_id", ""))
    tid_str = str(proj.get("team_id", ""))

    # 1. Project Overview
    overview = {
        "project_id": pid_str,
        "name": proj.get("name", ""),
        "description": proj.get("description", ""),
        "status": proj.get("status", "planning"),
        "lifecycle_stage": proj.get("lifecycle_stage") or proj.get("status", "planning"),
        "start_date": proj.get("start_date"),
        "target_date": proj.get("target_date"),
        "created_at": str(proj.get("created_at", "")),
        "updated_at": str(proj.get("updated_at", "")),
    }

    # 2. University Information
    uni_doc = None
    if ObjectId.is_valid(uid_str):
        uni_doc = get_universities_collection().find_one({"_id": ObjectId(uid_str)})
    if not uni_doc:
        uni_doc = get_universities_collection().find_one({"created_by": uid_str})
    
    university_info = {
        "university_id": uid_str,
        "name": uni_doc.get("name") or uni_doc.get("institution_name") or "Unknown Institution" if uni_doc else "Unknown Institution",
        "short_name": uni_doc.get("short_name") if uni_doc else None,
        "location": uni_doc.get("location") if uni_doc else None,
        "website": uni_doc.get("website") if uni_doc else None,
    }

    # 3. Linked Challenge (Sanitized, no citizen email/passwords)
    linked_challenge = None
    if ObjectId.is_valid(cid_str):
        ch_doc = get_challenges_collection().find_one({"_id": ObjectId(cid_str)})
        if ch_doc:
            pri = ch_doc.get("priority_analysis") or {}
            linked_challenge = {
                "challenge_id": cid_str,
                "title": ch_doc.get("title", ""),
                "description": ch_doc.get("description", ""),
                "category": ch_doc.get("category"),
                "subcategory": ch_doc.get("subcategory"),
                "urgency": ch_doc.get("urgency"),
                "affected_people": ch_doc.get("affected_people"),
                "location": ch_doc.get("location"),
                "priority_level": pri.get("level"),
                "priority_score": ch_doc.get("priority_score") if ch_doc.get("priority_score") is not None else pri.get("score"),
                "priority_explanation": pri.get("explanation"),
                "submitted_at": str(ch_doc.get("created_at", "")),
            }

    # 4. Team Overview
    team_info = None
    if tid_str:
        t_col = get_university_teams_collection()
        team_doc = None
        if ObjectId.is_valid(tid_str):
            team_doc = t_col.find_one({"_id": ObjectId(tid_str)})
        if not team_doc:
            team_doc = t_col.find_one({"_id": tid_str})
        if team_doc:
            faculty_members = team_doc.get("faculty_leads", [])
            student_members = team_doc.get("student_members", [])
            team_info = {
                "team_id": tid_str,
                "name": team_doc.get("name", "Research Team"),
                "faculty_count": len(faculty_members),
                "student_count": len(student_members),
                "faculty_members": faculty_members,
                "student_members": student_members,
            }

    # 5. Milestones
    m_docs = list(get_project_milestones_collection().find({"project_id": pid_str}).sort("due_date", 1))
    milestones = [
        {
            "id": str(m["_id"]),
            "title": m.get("title", ""),
            "description": m.get("description"),
            "status": m.get("status", "pending"),
            "due_date": m.get("due_date"),
            "completed_at": m.get("completed_at"),
            "created_at": str(m.get("created_at", "")),
        }
        for m in m_docs
    ]

    # 6. Research
    res_docs = list(get_project_research_collection().find({"project_id": pid_str}).sort("created_at", -1))
    research = [
        {
            "id": str(r["_id"]),
            "title": r.get("title", ""),
            "description": r.get("description"),
            "findings": r.get("findings"),
            "methodology": r.get("methodology"),
            "references": r.get("references", []),
            "created_at": str(r.get("created_at", "")),
        }
        for r in res_docs
    ]

    # 7. Solution Proposal
    sol_doc = get_project_solutions_collection().find_one({"project_id": pid_str})
    solution = None
    if sol_doc:
        solution = {
            "id": str(sol_doc["_id"]),
            "title": sol_doc.get("title", ""),
            "problem_statement": sol_doc.get("problem_statement", ""),
            "proposed_solution": sol_doc.get("proposed_solution", ""),
            "technical_approach": sol_doc.get("technical_approach"),
            "expected_outcomes": sol_doc.get("expected_outcomes"),
            "required_resources": sol_doc.get("required_resources"),
            "risks": sol_doc.get("risks"),
            "constraints": sol_doc.get("constraints"),
            "status": sol_doc.get("status", "draft"),
            "created_at": str(sol_doc.get("created_at", "")),
            "updated_at": str(sol_doc.get("updated_at", "")),
        }

    # 8. Prototypes
    proto_docs = list(get_project_prototypes_collection().find({"project_id": pid_str}).sort("created_at", -1))
    prototypes = [
        {
            "id": str(p["_id"]),
            "version": p.get("version", "v1.0"),
            "title": p.get("title", ""),
            "description": p.get("description"),
            "status": p.get("status", "planned"),
            "artifact_url": p.get("artifact_url"),
            "artifact_type": p.get("artifact_type"),
            "created_at": str(p.get("created_at", "")),
        }
        for p in proto_docs
    ]

    # 9. Pilots
    pilot_docs = list(get_project_pilots_collection().find({"project_id": pid_str}).sort("created_at", -1))
    pilots = [
        {
            "id": str(p["_id"]),
            "title": p.get("title", ""),
            "location": p.get("location", ""),
            "objectives": p.get("objectives", ""),
            "status": p.get("status", "planned"),
            "start_date": p.get("start_date"),
            "end_date": p.get("end_date"),
            "observations": p.get("observations"),
            "results": p.get("results"),
            "issues": p.get("issues"),
            "created_at": str(p.get("created_at", "")),
        }
        for p in pilot_docs
    ]

    # 10. Deployment Readiness
    readiness_doc = get_project_deployment_readiness_collection().find_one({"project_id": pid_str})
    deployment_readiness = None
    if readiness_doc:
        deployment_readiness = {
            "id": str(readiness_doc["_id"]),
            "readiness_status": readiness_doc.get("readiness_status", "not_ready"),
            "technical_readiness": readiness_doc.get("technical_readiness"),
            "infrastructure_requirements": readiness_doc.get("infrastructure_requirements"),
            "estimated_cost": readiness_doc.get("estimated_cost"),
            "maintenance_requirements": readiness_doc.get("maintenance_requirements"),
            "deployment_requirements": readiness_doc.get("deployment_requirements"),
            "blockers": readiness_doc.get("blockers"),
            "notes": readiness_doc.get("notes"),
            "updated_at": str(readiness_doc.get("updated_at", "")),
        }

    # 11. Industry Collaboration
    parts = list(get_industry_partnerships_collection().find({"project_id": pid_str}))
    p_ids_arr = [str(pt["_id"]) for pt in parts]

    # Fetch industry profiles
    i_user_ids = {str(pt["industry_user_id"]) for pt in parts}
    ind_profiles = {}
    if i_user_ids:
        for ip in get_industry_profiles_collection().find({"user_id": {"$in": list(i_user_ids)}}):
            ind_profiles[ip["user_id"]] = ip.get("company_name", "Corporate Partner")

    enriched_parts = []
    for pt in parts:
        enriched_parts.append({
            "partnership_id": str(pt["_id"]),
            "company_name": ind_profiles.get(pt.get("industry_user_id"), "Corporate Partner"),
            "status": pt.get("status", "pending"),
            "message": pt.get("message"),
            "created_at": str(pt.get("created_at", "")),
        })

    # Mentorships
    m_list = list(get_project_mentorships_collection().find({"project_id": pid_str}))
    mentors = [
        {
            "id": str(m["_id"]),
            "objectives": m.get("objectives", ""),
            "focus_areas": m.get("focus_areas", []),
            "status": m.get("status", "proposed"),
            "created_at": str(m.get("created_at", "")),
        }
        for m in m_list
    ]

    # Resources
    r_list = list(get_project_industry_resources_collection().find({"project_id": pid_str}))
    resources = [
        {
            "id": str(r["_id"]),
            "title": r.get("title", ""),
            "resource_type": r.get("resource_type", "technology"),
            "description": r.get("description", ""),
            "quantity_or_scope": r.get("quantity_or_scope"),
            "status": r.get("status", "proposed"),
            "provided_at": r.get("provided_at"),
            "created_at": str(r.get("created_at", "")),
        }
        for r in r_list
    ]

    # Funding
    f_list = list(get_project_industry_funding_collection().find({"project_id": pid_str}))
    funding = [
        {
            "id": str(f["_id"]),
            "title": f.get("title", ""),
            "description": f.get("description", ""),
            "amount": f.get("amount", 0.0),
            "currency": f.get("currency", "INR"),
            "funding_type": f.get("funding_type", "sponsorship"),
            "status": f.get("status", "proposed"),
            "proposed_at": str(f.get("proposed_at", "")),
        }
        for f in f_list
    ]

    industry_collaboration = {
        "partnerships": enriched_parts,
        "partnerships_count": len(enriched_parts),
        "mentors": mentors,
        "mentorships_count": len(mentors),
        "resources": resources,
        "resources_count": len(resources),
        "funding": funding,
        "funding_count": len(funding),
    }

    # 12. Recent Activity
    act_docs = list(get_project_activity_collection().find({"project_id": pid_str}).sort("created_at", -1).limit(15))
    recent_activity = [
        {
            "id": str(a["_id"]),
            "action": a.get("action", "activity"),
            "description": a.get("description", ""),
            "created_at": str(a.get("created_at", "")),
        }
        for a in act_docs
    ]

    return GovernmentProjectDossier(
        overview=overview,
        university=university_info,
        linked_challenge=linked_challenge,
        team=team_info,
        milestones=milestones,
        research=research,
        solution=solution,
        prototypes=prototypes,
        pilots=pilots,
        deployment_readiness=deployment_readiness,
        industry_collaboration=industry_collaboration,
        recent_activity=recent_activity,
    )


# ============================================================================
# Step 8D: Industry Collaboration Monitoring Service
# ============================================================================

def get_collaborations(
    search: Optional[str] = None,
    status: Optional[str] = None,
    university: Optional[str] = None,
    industry: Optional[str] = None,
    project: Optional[str] = None,
    category: Optional[str] = None,
    collaboration_type: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
) -> GovernmentCollaborationsPage:
    """
    Paginated read-only query for Industry Partnerships and collaborations.
    Zero fake statistics.
    """
    parts_col = get_industry_partnerships_collection()
    query: Dict[str, Any] = {}

    if status and status.strip() and status.lower() != "all":
        query["status"] = status.strip().lower()

    if university and university.strip():
        query["university_id"] = university.strip()

    if industry and industry.strip():
        query["industry_user_id"] = industry.strip()

    if project and project.strip():
        query["project_id"] = project.strip()

    # Search in company names
    if search and search.strip():
        term = re.escape(search.strip())
        matched_profiles = list(get_industry_profiles_collection().find(
            {"$or": [
                {"company_name": {"$regex": term, "$options": "i"}},
                {"industry_sector": {"$regex": term, "$options": "i"}},
            ]},
            {"user_id": 1}
        ))
        matched_user_ids = [p["user_id"] for p in matched_profiles if p.get("user_id")]

        # Also search in project names
        matched_projects = list(get_university_projects_collection().find(
            {"name": {"$regex": term, "$options": "i"}},
            {"_id": 1}
        ))
        matched_proj_ids = [str(p["_id"]) for p in matched_projects]

        query["$or"] = [
            {"industry_user_id": {"$in": matched_user_ids}},
            {"project_id": {"$in": matched_proj_ids}},
        ]

    total = parts_col.count_documents(query)
    total_pages = max(1, math.ceil(total / limit)) if total > 0 else 1
    safe_page = max(1, min(page, total_pages))
    skip = (safe_page - 1) * limit

    docs = list(parts_col.find(query).sort("created_at", -1).skip(skip).limit(limit))

    # Collect IDs for batch resolution
    p_ids = {str(d.get("project_id")) for d in docs if d.get("project_id")}
    u_ids = {str(d.get("university_id")) for d in docs if d.get("university_id")}
    i_user_ids = {str(d.get("industry_user_id")) for d in docs if d.get("industry_user_id")}
    pt_ids = [str(d["_id"]) for d in docs]

    # Resolve Projects
    proj_map = {}
    if p_ids:
        oids = [ObjectId(p) for p in p_ids if ObjectId.is_valid(p)]
        for p in get_university_projects_collection().find({"_id": {"$in": oids}}):
            proj_map[str(p["_id"])] = p

    # Resolve Universities
    uni_map = _batch_resolve_universities(u_ids)

    # Resolve Industry Profiles (sanitized, zero secret tokens)
    ind_map = {}
    if i_user_ids:
        for ip in get_industry_profiles_collection().find({"user_id": {"$in": list(i_user_ids)}}):
            ind_map[ip["user_id"]] = ip

    # Batch counts for mentorships, resources, funding
    mentors_col = get_project_mentorships_collection()
    res_col = get_project_industry_resources_collection()
    fund_col = get_project_industry_funding_collection()

    mentors_by_part: Dict[str, List[dict]] = {}
    if pt_ids:
        for m in mentors_col.find({"partnership_id": {"$in": pt_ids}}):
            mentors_by_part.setdefault(str(m["partnership_id"]), []).append(m)

    res_by_part: Dict[str, List[dict]] = {}
    if pt_ids:
        for r in res_col.find({"partnership_id": {"$in": pt_ids}}):
            res_by_part.setdefault(str(r["partnership_id"]), []).append(r)

    fund_by_part: Dict[str, List[dict]] = {}
    if pt_ids:
        for f in fund_col.find({"partnership_id": {"$in": pt_ids}}):
            fund_by_part.setdefault(str(f["partnership_id"]), []).append(f)

    # Summary counts
    summary_counts = {
        "total": parts_col.count_documents({}),
        "pending": parts_col.count_documents({"status": "pending"}),
        "accepted": parts_col.count_documents({"status": "accepted"}),
        "rejected": parts_col.count_documents({"status": "rejected"}),
        "withdrawn": parts_col.count_documents({"status": "withdrawn"}),
    }

    items: List[GovernmentCollaborationSummary] = []
    for d in docs:
        ptid = str(d["_id"])
        pid = str(d.get("project_id", ""))
        uid = str(d.get("university_id", ""))
        iuid = str(d.get("industry_user_id", ""))

        proj = proj_map.get(pid, {})
        uni = uni_map.get(uid, {})
        ind = ind_map.get(iuid, {})

        m_list = mentors_by_part.get(ptid, [])
        active_m = [m for m in m_list if m.get("status") == "active"]

        r_list = res_by_part.get(ptid, [])
        accepted_r = [r for r in r_list if r.get("status") in ["approved", "provided"]]

        f_list = fund_by_part.get(ptid, [])
        approved_f = [f for f in f_list if f.get("status") in ["approved", "disbursed"]]
        total_fund = sum(float(f.get("amount", 0.0)) for f in f_list)

        items.append(
            GovernmentCollaborationSummary(
                partnership_id=ptid,
                project_id=pid,
                project_name=proj.get("name"),
                university_id=uid,
                university_name=uni.get("name"),
                industry_user_id=iuid,
                company_name=ind.get("company_name", "Corporate Partner"),
                industry_sector=ind.get("industry_sector"),
                partnership_status=d.get("status", "pending"),
                mentor_count=len(m_list),
                active_mentorship_count=len(active_m),
                resource_contribution_count=len(r_list),
                accepted_resource_count=len(accepted_r),
                funding_proposal_count=len(f_list),
                approved_funding_count=len(approved_f),
                total_funding_amount=total_fund,
                created_at=str(d.get("created_at", "")),
                updated_at=str(d.get("updated_at", "")),
            )
        )

    return GovernmentCollaborationsPage(
        items=items,
        total=total,
        page=safe_page,
        limit=limit,
        total_pages=total_pages,
        summary_counts=summary_counts,
    )


def get_collaboration_detail(partnership_id: str) -> GovernmentCollaborationDetail:
    """
    Detailed read-only collaboration view for Government oversight.
    Strictly safeguards private authentication secrets and tokens.
    """
    if not ObjectId.is_valid(partnership_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid partnership ID.")

    parts_col = get_industry_partnerships_collection()
    part = parts_col.find_one({"_id": ObjectId(partnership_id)})
    if not part:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collaboration partnership not found.")

    pid_str = str(part.get("project_id", ""))
    uid_str = str(part.get("university_id", ""))
    iuid_str = str(part.get("industry_user_id", ""))
    ptid_str = str(part["_id"])

    # Industry Profile (sanitized)
    ind_prof = get_industry_profiles_collection().find_one({"user_id": iuid_str})
    industry_partner = {
        "industry_user_id": iuid_str,
        "company_name": ind_prof.get("company_name", "Corporate Partner") if ind_prof else "Corporate Partner",
        "short_name": ind_prof.get("short_name") if ind_prof else None,
        "industry_sector": ind_prof.get("industry_sector") if ind_prof else None,
        "sub_sectors": ind_prof.get("sub_sectors", []) if ind_prof else [],
        "headquarters_location": ind_prof.get("headquarters_location") if ind_prof else None,
        "operating_locations": ind_prof.get("operating_locations", []) if ind_prof else [],
        "website": ind_prof.get("website") if ind_prof else None,
        "expertise": ind_prof.get("expertise", []) if ind_prof else [],
        "technologies": ind_prof.get("technologies", []) if ind_prof else [],
    }

    # University
    uni_doc = None
    if ObjectId.is_valid(uid_str):
        uni_doc = get_universities_collection().find_one({"_id": ObjectId(uid_str)})
    if not uni_doc:
        uni_doc = get_universities_collection().find_one({"created_by": uid_str})
    university = {
        "university_id": uid_str,
        "name": uni_doc.get("name") or uni_doc.get("institution_name") or "University" if uni_doc else "University",
        "location": uni_doc.get("location") if uni_doc else None,
    }

    # Project
    proj_doc = None
    if ObjectId.is_valid(pid_str):
        proj_doc = get_university_projects_collection().find_one({"_id": ObjectId(pid_str)})
    ch_title = None
    ch_cat = None
    if proj_doc and proj_doc.get("challenge_id") and ObjectId.is_valid(proj_doc["challenge_id"]):
        c_doc = get_challenges_collection().find_one({"_id": ObjectId(proj_doc["challenge_id"])})
        if c_doc:
            ch_title = c_doc.get("title")
            ch_cat = c_doc.get("category")

    project = {
        "project_id": pid_str,
        "name": proj_doc.get("name", "") if proj_doc else "",
        "description": proj_doc.get("description") if proj_doc else None,
        "status": proj_doc.get("status", "planning") if proj_doc else "planning",
        "lifecycle_stage": proj_doc.get("lifecycle_stage") or proj_doc.get("status") if proj_doc else "planning",
        "challenge_title": ch_title,
        "challenge_category": ch_cat,
    }

    # Mentors
    mentors_col = get_project_mentorships_collection()
    m_docs = list(mentors_col.find({"partnership_id": ptid_str}))
    mentors = []
    for m in m_docs:
        exp_name = None
        exp_desig = None
        if m.get("expert_id") and ObjectId.is_valid(m["expert_id"]):
            exp = get_industry_experts_collection().find_one({"_id": ObjectId(m["expert_id"])})
            if exp:
                exp_name = exp.get("name")
                exp_desig = exp.get("designation")
        mentors.append({
            "id": str(m["_id"]),
            "expert_name": exp_name or "Industry Expert",
            "expert_designation": exp_desig,
            "focus_areas": m.get("focus_areas", []),
            "objectives": m.get("objectives", ""),
            "status": m.get("status", "proposed"),
            "created_at": str(m.get("created_at", "")),
        })

    # Resources
    r_docs = list(get_project_industry_resources_collection().find({"partnership_id": ptid_str}))
    resources = [
        {
            "id": str(r["_id"]),
            "title": r.get("title", ""),
            "resource_type": r.get("resource_type", "technology"),
            "description": r.get("description", ""),
            "quantity_or_scope": r.get("quantity_or_scope"),
            "status": r.get("status", "proposed"),
            "provided_at": r.get("provided_at"),
            "created_at": str(r.get("created_at", "")),
        }
        for r in r_docs
    ]

    # Funding
    f_docs = list(get_project_industry_funding_collection().find({"partnership_id": ptid_str}))
    funding_proposals = [
        {
            "id": str(f["_id"]),
            "title": f.get("title", ""),
            "description": f.get("description", ""),
            "amount": f.get("amount", 0.0),
            "currency": f.get("currency", "INR"),
            "funding_type": f.get("funding_type", "sponsorship"),
            "status": f.get("status", "proposed"),
            "proposed_at": str(f.get("proposed_at", "")),
        }
        for f in f_docs
    ]

    # Activity from project_activity
    act_docs = list(get_project_activity_collection().find({"project_id": pid_str}).sort("created_at", -1).limit(10))
    activity = [
        {
            "id": str(a["_id"]),
            "action": a.get("action", "activity"),
            "description": a.get("description", ""),
            "created_at": str(a.get("created_at", "")),
        }
        for a in act_docs
    ]

    return GovernmentCollaborationDetail(
        partnership_id=ptid_str,
        status=part.get("status", "pending"),
        message=part.get("message"),
        created_at=str(part.get("created_at", "")),
        updated_at=str(part.get("updated_at", "")),
        industry_partner=industry_partner,
        university=university,
        project=project,
        mentors=mentors,
        resources=resources,
        funding_proposals=funding_proposals,
        activity=activity,
    )


# ============================================================================
# Step 8E: Pilot & Deployment Oversight Service
# ============================================================================

def get_monitoring_summary() -> GovernmentLifecycleMonitoringSummary:
    """
    Lifecycle breakdown aggregated strictly from real MongoDB project records.
    """
    proj_col = get_university_projects_collection()
    ready_col = get_project_deployment_readiness_collection()

    total_projects = proj_col.count_documents({})
    planning = proj_col.count_documents({"status": "planning"})
    research = proj_col.count_documents({"status": "research"})
    solution_proposed = proj_col.count_documents({"status": "solution_proposed"})
    prototype = proj_col.count_documents({"status": "prototype"})
    pilot = proj_col.count_documents({"status": "pilot"})

    # Deployment ready from readiness assessment or ready_for_deployment status
    ready_proj_ids = [r["project_id"] for r in ready_col.find({"readiness_status": {"$in": ["ready_for_deployment", "assessment", "deployment_in_progress"]}})]
    deployment_ready = len(set(ready_proj_ids))

    deployed = proj_col.count_documents({"status": "deployment"})
    completed = proj_col.count_documents({"status": "completed"})

    return GovernmentLifecycleMonitoringSummary(
        total_projects=total_projects,
        planning=planning,
        research=research,
        solution_proposed=solution_proposed,
        prototype=prototype,
        pilot=pilot,
        deployment_ready=deployment_ready,
        deployed=deployed,
        completed=completed,
    )


def get_pilots(
    project: Optional[str] = None,
    university: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
) -> GovernmentPilotsPage:
    """
    Paginated pilot monitoring from real project_pilots collection.
    """
    pilot_col = get_project_pilots_collection()
    query: Dict[str, Any] = {}

    if status and status.strip() and status.lower() != "all":
        query["status"] = status.strip().lower()

    if project and project.strip():
        query["project_id"] = project.strip()

    if university and university.strip():
        query["university_id"] = university.strip()

    total = pilot_col.count_documents(query)
    total_pages = max(1, math.ceil(total / limit)) if total > 0 else 1
    safe_page = max(1, min(page, total_pages))
    skip = (safe_page - 1) * limit

    docs = list(pilot_col.find(query).sort("created_at", -1).skip(skip).limit(limit))

    # Batch resolve projects
    p_ids = {str(d.get("project_id")) for d in docs if d.get("project_id")}
    u_ids = {str(d.get("university_id")) for d in docs if d.get("university_id")}

    proj_map = {}
    ch_ids = set()
    if p_ids:
        oids = [ObjectId(p) for p in p_ids if ObjectId.is_valid(p)]
        for p in get_university_projects_collection().find({"_id": {"$in": oids}}):
            proj_map[str(p["_id"])] = p
            if p.get("challenge_id"):
                ch_ids.add(str(p["challenge_id"]))

    uni_map = _batch_resolve_universities(u_ids)
    ch_map = _batch_resolve_challenges(ch_ids)

    # Status counts across all pilots
    status_counts = {}
    for st in ["planned", "preparation", "active", "completed", "paused", "cancelled"]:
        status_counts[st] = pilot_col.count_documents({"status": st})

    items = []
    for d in docs:
        pid = str(d.get("project_id", ""))
        uid = str(d.get("university_id", ""))
        proj = proj_map.get(pid, {})
        cid = str(proj.get("challenge_id", ""))
        ch = ch_map.get(cid, {})

        items.append(
            GovernmentPilotItem(
                pilot_id=str(d["_id"]),
                project_id=pid,
                project_name=proj.get("name"),
                university_id=uid,
                university_name=uni_map.get(uid, {}).get("name"),
                category=ch.get("category"),
                title=d.get("title", ""),
                location=d.get("location", ""),
                objectives=d.get("objectives", ""),
                status=d.get("status", "planned"),
                start_date=d.get("start_date"),
                end_date=d.get("end_date"),
                observations=d.get("observations"),
                results=d.get("results"),
                issues=d.get("issues"),
                created_at=str(d.get("created_at", "")),
            )
        )

    return GovernmentPilotsPage(
        items=items,
        total=total,
        page=safe_page,
        limit=limit,
        total_pages=total_pages,
        status_counts=status_counts,
    )


def get_deployments(
    status: Optional[str] = None,
    university: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
) -> GovernmentDeploymentsPage:
    """
    Paginated deployment oversight from real project_deployment_readiness collection.
    """
    ready_col = get_project_deployment_readiness_collection()
    query: Dict[str, Any] = {}

    if status and status.strip() and status.lower() != "all":
        query["readiness_status"] = status.strip().lower()

    if university and university.strip():
        query["university_id"] = university.strip()

    total = ready_col.count_documents(query)
    total_pages = max(1, math.ceil(total / limit)) if total > 0 else 1
    safe_page = max(1, min(page, total_pages))
    skip = (safe_page - 1) * limit

    docs = list(ready_col.find(query).sort("updated_at", -1).skip(skip).limit(limit))

    p_ids = {str(d.get("project_id")) for d in docs if d.get("project_id")}
    u_ids = {str(d.get("university_id")) for d in docs if d.get("university_id")}

    proj_map = {}
    ch_ids = set()
    if p_ids:
        oids = [ObjectId(p) for p in p_ids if ObjectId.is_valid(p)]
        for p in get_university_projects_collection().find({"_id": {"$in": oids}}):
            proj_map[str(p["_id"])] = p
            if p.get("challenge_id"):
                ch_ids.add(str(p["challenge_id"]))

    uni_map = _batch_resolve_universities(u_ids)
    ch_map = _batch_resolve_challenges(ch_ids)

    # Batch milestone counts
    m_counts = {}
    comp_m_counts = {}
    if p_ids:
        for m in get_project_milestones_collection().find({"project_id": {"$in": list(p_ids)}}):
            pid = str(m["project_id"])
            m_counts[pid] = m_counts.get(pid, 0) + 1
            if m.get("status") == "completed":
                comp_m_counts[pid] = comp_m_counts.get(pid, 0) + 1

    status_counts = {}
    for st in ["not_ready", "assessment", "ready_for_deployment", "deployment_in_progress", "deployed"]:
        status_counts[st] = ready_col.count_documents({"readiness_status": st})

    items = []
    for d in docs:
        pid = str(d.get("project_id", ""))
        uid = str(d.get("university_id", ""))
        proj = proj_map.get(pid, {})
        cid = str(proj.get("challenge_id", ""))
        ch = ch_map.get(cid, {})

        items.append(
            GovernmentDeploymentItem(
                project_id=pid,
                project_name=proj.get("name", "Project"),
                university_id=uid,
                university_name=uni_map.get(uid, {}).get("name"),
                category=ch.get("category"),
                lifecycle_stage=proj.get("lifecycle_stage") or proj.get("status", "planning"),
                project_status=proj.get("status", "planning"),
                readiness_status=d.get("readiness_status", "not_ready"),
                technical_readiness=d.get("technical_readiness"),
                infrastructure_requirements=d.get("infrastructure_requirements"),
                estimated_cost=d.get("estimated_cost"),
                maintenance_requirements=d.get("maintenance_requirements"),
                deployment_requirements=d.get("deployment_requirements"),
                blockers=d.get("blockers"),
                milestones_count=m_counts.get(pid, 0),
                completed_milestones_count=comp_m_counts.get(pid, 0),
                updated_at=str(d.get("updated_at", "")),
            )
        )

    return GovernmentDeploymentsPage(
        items=items,
        total=total,
        page=safe_page,
        limit=limit,
        total_pages=total_pages,
        status_counts=status_counts,
    )


# ============================================================================
# Step 8F: Regional & Category Analytics Service
# ============================================================================

def get_analytics() -> GovernmentAnalyticsResponse:
    """
    Administrative analytics derived purely from MongoDB aggregation pipelines.
    Zero synthetic statistics or fabricated percentages.
    """
    ch_col = get_challenges_collection()
    proj_col = get_university_projects_collection()
    parts_col = get_industry_partnerships_collection()
    pilot_col = get_project_pilots_collection()
    rev_col = get_government_challenge_reviews_collection()

    total_challenges = ch_col.count_documents({})
    total_projects = proj_col.count_documents({})
    total_partnerships = parts_col.count_documents({})
    total_pilots = pilot_col.count_documents({})

    def _aggregate_field(collection, field: str, total_count: int) -> List[GovernmentAnalyticsItem]:
        pipeline = [
            {"$match": {field: {"$exists": True, "$ne": None, "$ne": ""}}},
            {"$group": {"_id": f"${field}", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
        items = []
        for r in collection.aggregate(pipeline):
            k = str(r["_id"])
            cnt = int(r["count"])
            pct = round((cnt / total_count) * 100, 1) if total_count > 0 else 0.0
            items.append(GovernmentAnalyticsItem(
                key=k,
                label=k.replace("_", " ").title(),
                count=cnt,
                percentage=pct,
            ))
        return items

    challenges_by_category = _aggregate_field(ch_col, "category", total_challenges)
    challenges_by_priority = _aggregate_field(ch_col, "priority_analysis.level", total_challenges)
    challenges_by_status = _aggregate_field(ch_col, "status", total_challenges)
    challenges_by_ai_status = _aggregate_field(ch_col, "ai_status", total_challenges)

    # Review distribution
    val_c = rev_col.count_documents({"decision": "validated"})
    rej_c = rev_col.count_documents({"decision": "rejected"})
    clar_c = rev_col.count_documents({"decision": "clarification_required"})
    reviewed_total = val_c + rej_c + clar_c
    pending_c = max(0, total_challenges - reviewed_total)

    challenges_by_government_review = [
        GovernmentAnalyticsItem(key="pending", label="Pending Review", count=pending_c, percentage=round(pending_c / total_challenges * 100, 1) if total_challenges else 0.0),
        GovernmentAnalyticsItem(key="validated", label="Validated", count=val_c, percentage=round(val_c / total_challenges * 100, 1) if total_challenges else 0.0),
        GovernmentAnalyticsItem(key="clarification_required", label="Clarification Required", count=clar_c, percentage=round(clar_c / total_challenges * 100, 1) if total_challenges else 0.0),
        GovernmentAnalyticsItem(key="rejected", label="Rejected", count=rej_c, percentage=round(rej_c / total_challenges * 100, 1) if total_challenges else 0.0),
    ]

    # Projects
    projects_by_status = _aggregate_field(proj_col, "status", total_projects)
    projects_by_lifecycle_stage = _aggregate_field(proj_col, "lifecycle_stage", total_projects)

    # Projects by challenge category
    proj_cat_pipeline = [
        {"$lookup": {
            "from": "challenges",
            "let": {"cid": {"$toObjectId": "$challenge_id"}},
            "pipeline": [{"$match": {"$expr": {"$eq": ["$_id", "$$cid"]}}}],
            "as": "ch",
        }},
        {"$unwind": {"path": "$ch", "preserveNullAndEmptyArrays": True}},
        {"$group": {"_id": {"$ifNull": ["$ch.category", "Uncategorized"]}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    projects_by_category = []
    for r in proj_col.aggregate(proj_cat_pipeline):
        k = str(r["_id"])
        cnt = int(r["count"])
        pct = round((cnt / total_projects) * 100, 1) if total_projects > 0 else 0.0
        projects_by_category.append(GovernmentAnalyticsItem(
            key=k,
            label=k.replace("_", " ").title(),
            count=cnt,
            percentage=pct,
        ))

    # Regional analytics: challenge & project geographic distribution
    challenges_by_state = _aggregate_field(ch_col, "location.state", total_challenges)
    challenges_by_district = _aggregate_field(ch_col, "location.district", total_challenges)

    partnerships_by_status = _aggregate_field(parts_col, "status", total_partnerships)
    pilots_by_status = _aggregate_field(pilot_col, "status", total_pilots)

    return GovernmentAnalyticsResponse(
        challenges_by_category=challenges_by_category,
        challenges_by_priority=challenges_by_priority,
        challenges_by_status=challenges_by_status,
        challenges_by_ai_status=challenges_by_ai_status,
        challenges_by_government_review=challenges_by_government_review,
        projects_by_category=projects_by_category,
        projects_by_status=projects_by_status,
        projects_by_lifecycle_stage=projects_by_lifecycle_stage,
        projects_by_state=challenges_by_state,
        projects_by_district=challenges_by_district,
        partnerships_by_status=partnerships_by_status,
        pilots_by_status=pilots_by_status,
        total_challenges=total_challenges,
        total_projects=total_projects,
        total_partnerships=total_partnerships,
        total_pilots=total_pilots,
    )


# ============================================================================
# Step 8G: Government Actions & Decisions Service
# ============================================================================

def _resolve_target_title(target_type: str, target_id: str) -> Optional[str]:
    """Helper to look up title of the target object."""
    try:
        if target_type == "challenge":
            doc = get_challenges_collection().find_one({"_id": ObjectId(target_id)} if ObjectId.is_valid(target_id) else {"_id": target_id})
            if doc:
                return doc.get("title")
        elif target_type in ["project", "deployment"]:
            doc = get_university_projects_collection().find_one({"_id": ObjectId(target_id)} if ObjectId.is_valid(target_id) else {"_id": target_id})
            if doc:
                return doc.get("name")
        elif target_type == "partnership":
            doc = get_industry_partnerships_collection().find_one({"_id": ObjectId(target_id)} if ObjectId.is_valid(target_id) else {"_id": target_id})
            if doc:
                return f"Partnership {str(doc['_id'])[:8]}"
        elif target_type == "pilot":
            doc = get_project_pilots_collection().find_one({"_id": ObjectId(target_id)} if ObjectId.is_valid(target_id) else {"_id": target_id})
            if doc:
                return doc.get("title")
    except Exception:
        pass
    return None


def create_government_action(government_user_id: str, data: GovernmentActionCreate) -> GovernmentActionResponse:
    """
    Create a new Government Action.
    Validates target existence before creating.
    Enforces user ownership and writes audit log to government_activity.
    """
    # Target existence check
    target_found = False
    target_title = None

    if data.target_type == "challenge":
        ch_doc = get_challenges_collection().find_one({"_id": ObjectId(data.target_id)} if ObjectId.is_valid(data.target_id) else {"_id": data.target_id})
        if ch_doc:
            target_found = True
            target_title = ch_doc.get("title")
    elif data.target_type in ["project", "deployment"]:
        p_doc = get_university_projects_collection().find_one({"_id": ObjectId(data.target_id)} if ObjectId.is_valid(data.target_id) else {"_id": data.target_id})
        if p_doc:
            target_found = True
            target_title = p_doc.get("name")
    elif data.target_type == "partnership":
        pt_doc = get_industry_partnerships_collection().find_one({"_id": ObjectId(data.target_id)} if ObjectId.is_valid(data.target_id) else {"_id": data.target_id})
        if pt_doc:
            target_found = True
            target_title = f"Partnership {str(pt_doc['_id'])[:8]}"
    elif data.target_type == "pilot":
        pl_doc = get_project_pilots_collection().find_one({"_id": ObjectId(data.target_id)} if ObjectId.is_valid(data.target_id) else {"_id": data.target_id})
        if pl_doc:
            target_found = True
            target_title = pl_doc.get("title")

    if not target_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target {data.target_type} with ID '{data.target_id}' does not exist.",
        )

    now = datetime.now(timezone.utc).isoformat()
    action_doc = {
        "government_user_id": government_user_id,
        "action_type": data.action_type,
        "target_type": data.target_type,
        "target_id": data.target_id,
        "title": data.title.strip(),
        "description": data.description.strip() if data.description else None,
        "status": "open",
        "priority": data.priority,
        "due_date": data.due_date,
        "created_at": now,
        "updated_at": now,
        "completed_at": None,
    }

    col = get_government_actions_collection()
    result = col.insert_one(action_doc)
    action_doc["_id"] = result.inserted_id

    # Record audit log in government_activity
    gov_act_col = get_government_activity_collection()
    gov_act_col.insert_one({
        "government_user_id": government_user_id,
        "action": "government_action_created",
        "target_type": data.target_type,
        "target_id": data.target_id,
        "action_id": str(action_doc["_id"]),
        "description": f"Created action: {action_doc['title']}",
        "created_at": now,
    })

    return GovernmentActionResponse(
        id=str(action_doc["_id"]),
        government_user_id=government_user_id,
        action_type=action_doc["action_type"],
        target_type=action_doc["target_type"],
        target_id=action_doc["target_id"],
        target_title=target_title,
        title=action_doc["title"],
        description=action_doc["description"],
        status=action_doc["status"],
        priority=action_doc["priority"],
        due_date=action_doc["due_date"],
        created_at=action_doc["created_at"],
        updated_at=action_doc["updated_at"],
        completed_at=action_doc["completed_at"],
    )


def get_government_actions(
    government_user_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    action_type: Optional[str] = None,
    target_type: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
) -> GovernmentActionsPage:
    """
    List, filter, and paginate Government actions owned strictly by the authenticated official.
    Cross-user action visibility is not allowed.
    """
    col = get_government_actions_collection()
    query: Dict[str, Any] = {"government_user_id": government_user_id}

    if status and status.strip() and status.lower() != "all":
        query["status"] = status.strip().lower()

    if priority and priority.strip() and priority.lower() != "all":
        query["priority"] = priority.strip().lower()

    if action_type and action_type.strip() and action_type.lower() != "all":
        query["action_type"] = action_type.strip().lower()

    if target_type and target_type.strip() and target_type.lower() != "all":
        query["target_type"] = target_type.strip().lower()

    total = col.count_documents(query)
    total_pages = max(1, math.ceil(total / limit)) if total > 0 else 1
    safe_page = max(1, min(page, total_pages))
    skip = (safe_page - 1) * limit

    docs = list(col.find(query).sort("created_at", -1).skip(skip).limit(limit))

    # Summary counts for this user
    base_user_query = {"government_user_id": government_user_id}
    summary_counts = GovernmentActionsSummaryCounts(
        total=col.count_documents(base_user_query),
        open=col.count_documents({**base_user_query, "status": "open"}),
        in_progress=col.count_documents({**base_user_query, "status": "in_progress"}),
        completed=col.count_documents({**base_user_query, "status": "completed"}),
        cancelled=col.count_documents({**base_user_query, "status": "cancelled"}),
        critical_priority=col.count_documents({**base_user_query, "priority": "critical"}),
    )

    items = []
    for d in docs:
        tt = _resolve_target_title(d.get("target_type", ""), d.get("target_id", ""))
        items.append(
            GovernmentActionResponse(
                id=str(d["_id"]),
                government_user_id=str(d["government_user_id"]),
                action_type=d.get("action_type", "other"),
                target_type=d.get("target_type", "challenge"),
                target_id=str(d.get("target_id", "")),
                target_title=tt,
                title=d.get("title", ""),
                description=d.get("description"),
                status=d.get("status", "open"),
                priority=d.get("priority", "medium"),
                due_date=d.get("due_date"),
                created_at=str(d.get("created_at", "")),
                updated_at=str(d.get("updated_at", "")),
                completed_at=d.get("completed_at"),
            )
        )

    return GovernmentActionsPage(
        items=items,
        total=total,
        page=safe_page,
        limit=limit,
        total_pages=total_pages,
        summary_counts=summary_counts,
    )


def get_government_action_detail(action_id: str, government_user_id: str) -> GovernmentActionResponse:
    """
    Retrieve details of a specific Government Action.
    Enforces that only the creator has access.
    """
    if not ObjectId.is_valid(action_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid action ID.")

    col = get_government_actions_collection()
    doc = col.find_one({"_id": ObjectId(action_id)})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Government action not found.")

    if doc.get("government_user_id") != government_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this government action.",
        )

    tt = _resolve_target_title(doc.get("target_type", ""), doc.get("target_id", ""))
    return GovernmentActionResponse(
        id=str(doc["_id"]),
        government_user_id=str(doc["government_user_id"]),
        action_type=doc.get("action_type", "other"),
        target_type=doc.get("target_type", "challenge"),
        target_id=str(doc.get("target_id", "")),
        target_title=tt,
        title=doc.get("title", ""),
        description=doc.get("description"),
        status=doc.get("status", "open"),
        priority=doc.get("priority", "medium"),
        due_date=doc.get("due_date"),
        created_at=str(doc.get("created_at", "")),
        updated_at=str(doc.get("updated_at", "")),
        completed_at=doc.get("completed_at"),
    )


def update_government_action(
    action_id: str,
    government_user_id: str,
    data: GovernmentActionUpdate,
) -> GovernmentActionResponse:
    """
    Update an existing Government Action.
    Strictly isolated: Government User A cannot edit Government User B's action.
    Logs an audit event in government_activity.
    """
    if not ObjectId.is_valid(action_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid action ID.")

    col = get_government_actions_collection()
    doc = col.find_one({"_id": ObjectId(action_id)})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Government action not found.")

    if doc.get("government_user_id") != government_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this government action.",
        )

    now = datetime.now(timezone.utc).isoformat()
    updates: Dict[str, Any] = {"updated_at": now}

    if data.action_type is not None:
        updates["action_type"] = data.action_type
    if data.title is not None:
        updates["title"] = data.title.strip()
    if data.description is not None:
        updates["description"] = data.description.strip() if data.description else None
    if data.status is not None:
        updates["status"] = data.status
        if data.status == "completed":
            updates["completed_at"] = now
        elif data.status in ["open", "in_progress"]:
            updates["completed_at"] = None
    if data.priority is not None:
        updates["priority"] = data.priority
    if data.due_date is not None:
        updates["due_date"] = data.due_date

    col.update_one({"_id": ObjectId(action_id)}, {"$set": updates})
    updated = col.find_one({"_id": ObjectId(action_id)})

    # Log audit event
    gov_act_col = get_government_activity_collection()
    gov_act_col.insert_one({
        "government_user_id": government_user_id,
        "action": "government_action_updated",
        "action_id": action_id,
        "new_status": updates.get("status", doc.get("status")),
        "description": f"Updated action '{updated.get('title')}' status to {updates.get('status', doc.get('status'))}",
        "created_at": now,
    })

    tt = _resolve_target_title(updated.get("target_type", ""), updated.get("target_id", ""))
    return GovernmentActionResponse(
        id=str(updated["_id"]),
        government_user_id=str(updated["government_user_id"]),
        action_type=updated.get("action_type", "other"),
        target_type=updated.get("target_type", "challenge"),
        target_id=str(updated.get("target_id", "")),
        target_title=tt,
        title=updated.get("title", ""),
        description=updated.get("description"),
        status=updated.get("status", "open"),
        priority=updated.get("priority", "medium"),
        due_date=updated.get("due_date"),
        created_at=str(updated.get("created_at", "")),
        updated_at=str(updated.get("updated_at", "")),
        completed_at=updated.get("completed_at"),
    )


def delete_government_action(action_id: str, government_user_id: str) -> dict:
    """
    Delete a Government action.
    Strictly isolated to owner. Logs audit event.
    """
    if not ObjectId.is_valid(action_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid action ID.")

    col = get_government_actions_collection()
    doc = col.find_one({"_id": ObjectId(action_id)})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Government action not found.")

    if doc.get("government_user_id") != government_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this government action.",
        )

    col.delete_one({"_id": ObjectId(action_id)})

    now = datetime.now(timezone.utc).isoformat()
    gov_act_col = get_government_activity_collection()
    gov_act_col.insert_one({
        "government_user_id": government_user_id,
        "action": "government_action_deleted",
        "action_id": action_id,
        "description": f"Deleted action: {doc.get('title')}",
        "created_at": now,
    })

    return {"detail": "Government action deleted successfully."}


def get_government_priorities(government_user_id: str) -> dict:
    """
    Fetch prioritized items requiring Government attention across challenges, actions, and pilots.
    Backed strictly by real database records.
    """
    ch_col = get_challenges_collection()
    rev_col = get_government_challenge_reviews_collection()
    act_col = get_government_actions_collection()
    pilot_col = get_project_pilots_collection()

    # 1. Pending reviews
    reviewed_cids = {r["challenge_id"] for r in rev_col.find({}, {"challenge_id": 1}) if r.get("challenge_id")}
    pending_oids = [ObjectId(cid) for cid in reviewed_cids if ObjectId.is_valid(cid)]
    pending_challenges = list(
        ch_col.find({"_id": {"$nin": pending_oids}}).sort("created_at", -1).limit(5)
    )
    pending_items = [
        {
            "id": str(c["_id"]),
            "title": c.get("title", "Untitled"),
            "category": c.get("category"),
            "urgency": c.get("urgency"),
            "created_at": str(c.get("created_at", "")),
        }
        for c in pending_challenges
    ]

    # 2. Clarification required challenges
    clar_cids = {r["challenge_id"] for r in rev_col.find({"decision": "clarification_required"}, {"challenge_id": 1}) if r.get("challenge_id")}
    clar_oids = [ObjectId(cid) for cid in clar_cids if ObjectId.is_valid(cid)]
    clar_challenges = list(
        ch_col.find({"_id": {"$in": clar_oids}}).sort("created_at", -1).limit(5)
    )
    clar_items = [
        {
            "id": str(c["_id"]),
            "title": c.get("title", "Untitled"),
            "category": c.get("category"),
            "created_at": str(c.get("created_at", "")),
        }
        for c in clar_challenges
    ]

    # 3. High/Critical priority challenges
    high_pri = list(
        ch_col.find({"priority_analysis.level": {"$in": ["critical", "high", "Critical", "High"]}})
        .sort("created_at", -1)
        .limit(5)
    )
    high_pri_items = [
        {
            "id": str(c["_id"]),
            "title": c.get("title", "Untitled"),
            "category": c.get("category"),
            "priority_level": (c.get("priority_analysis") or {}).get("level", "high"),
            "created_at": str(c.get("created_at", "")),
        }
        for c in high_pri
    ]

    # 4. User's open actions
    user_actions = list(
        act_col.find({"government_user_id": government_user_id, "status": {"$in": ["open", "in_progress"]}})
        .sort("created_at", -1)
        .limit(5)
    )
    action_items = [
        {
            "id": str(a["_id"]),
            "title": a.get("title", ""),
            "action_type": a.get("action_type", ""),
            "target_type": a.get("target_type", ""),
            "target_id": str(a.get("target_id", "")),
            "priority": a.get("priority", "medium"),
            "due_date": a.get("due_date"),
        }
        for a in user_actions
    ]

    # 5. Active pilots requiring oversight
    active_pilots = list(
        pilot_col.find({"status": {"$in": ["active", "preparation"]}})
        .sort("created_at", -1)
        .limit(5)
    )
    pilot_items = [
        {
            "id": str(p["_id"]),
            "title": p.get("title", "Pilot"),
            "project_id": str(p.get("project_id", "")),
            "status": p.get("status", "active"),
            "location": p.get("location", ""),
        }
        for p in active_pilots
    ]

    return {
        "pending_reviews": pending_items,
        "clarification_challenges": clar_items,
        "high_priority_challenges": high_pri_items,
        "open_actions": action_items,
        "active_pilots": pilot_items,
    }



