from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from bson import ObjectId
from fastapi import HTTPException, status

from app.database.mongodb import (
    get_industry_profiles_collection,
    get_industry_partnerships_collection,
    get_industry_experts_collection,
    get_project_mentorships_collection,
    get_project_industry_resources_collection,
    get_project_industry_funding_collection,
    get_project_activity_collection,
    get_university_projects_collection,
    get_challenges_collection,
    get_university_teams_collection,
)
from app.schemas.industry import (
    IndustryProfileCreate,
    IndustryProfileUpdate,
    IndustryProfileResponse,
    IndustryExpertCreate,
    IndustryExpertUpdate,
    ProjectMentorshipCreate,
    ProjectMentorshipUpdate,
    IndustryResourceCreate,
    IndustryResourceUpdate,
    IndustryFundingCreate,
    IndustryFundingUpdate,
)

logger = logging.getLogger("unibridge.industry_service")


def _serialize_profile(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "user_id": str(doc.get("user_id", "")),
        "company_name": doc.get("company_name", ""),
        "short_name": doc.get("short_name"),
        "description": doc.get("description"),
        "website": doc.get("website"),
        "industry_sector": doc.get("industry_sector", ""),
        "sub_sectors": doc.get("sub_sectors", []),
        "headquarters_location": doc.get("headquarters_location"),
        "operating_locations": doc.get("operating_locations", []),
        "expertise": doc.get("expertise", []),
        "technologies": doc.get("technologies", []),
        "capabilities": doc.get("capabilities", []),
        "infrastructure": doc.get("infrastructure", []),
        "resources_available": doc.get("resources_available", []),
        "research_interests": doc.get("research_interests", []),
        "collaboration_interests": doc.get("collaboration_interests", []),
        "funding_capacity": doc.get("funding_capacity"),
        "mentorship_capacity": doc.get("mentorship_capacity"),
        "availability": doc.get("availability", "available"),
        "created_at": doc.get("created_at", datetime.now(timezone.utc).isoformat()),
        "updated_at": doc.get("updated_at", datetime.now(timezone.utc).isoformat()),
    }


def get_industry_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve the industry profile belonging strictly to the authenticated user ID.
    Never accepts arbitrary industry or user IDs from untrusted callers.
    """
    if not user_id:
        return None

    coll = get_industry_profiles_collection()
    doc = coll.find_one({"user_id": str(user_id)})
    if not doc:
        return None
    return _serialize_profile(doc)


def create_industry_profile(user_id: str, profile_in: IndustryProfileCreate) -> Dict[str, Any]:
    """
    Create or initialize an industry profile for the authenticated industry user.
    If a profile already exists for this user, updates it while preserving creation timestamp.
    """
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Valid authenticated identity is required.",
        )

    coll = get_industry_profiles_collection()
    now_iso = datetime.now(timezone.utc).isoformat()
    existing = coll.find_one({"user_id": str(user_id)})

    data = profile_in.model_dump()
    data["user_id"] = str(user_id)
    data["updated_at"] = now_iso

    if existing:
        # Preserve original creation timestamp
        data["created_at"] = existing.get("created_at", now_iso)
        coll.update_one({"_id": existing["_id"]}, {"$set": data})
        updated = coll.find_one({"_id": existing["_id"]})
        logger.info(f"Updated existing industry profile for user {user_id}")
        return _serialize_profile(updated)
    else:
        data["created_at"] = now_iso
        result = coll.insert_one(data)
        created = coll.find_one({"_id": result.inserted_id})
        logger.info(f"Created new industry profile for user {user_id}")
        return _serialize_profile(created)


def update_industry_profile(user_id: str, profile_in: IndustryProfileUpdate) -> Dict[str, Any]:
    """
    Surgically update an existing industry profile for the authenticated industry user.
    Enforces strict ownership: only the user who owns this profile can update it.
    """
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Valid authenticated identity is required.",
        )

    coll = get_industry_profiles_collection()
    existing = coll.find_one({"user_id": str(user_id)})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry profile not found. Please create your profile first.",
        )

    updates = profile_in.model_dump(exclude_unset=True)
    if not updates:
        return _serialize_profile(existing)

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    coll.update_one({"_id": existing["_id"]}, {"$set": updates})

    updated = coll.find_one({"_id": existing["_id"]})
    logger.info(f"Surgically updated industry profile for user {user_id}")
    return _serialize_profile(updated)


# =============================================================================
# INDUSTRY PROJECT DISCOVERY (STEP 7B)
# =============================================================================

def _resolve_university_name(uni_id: str) -> str:
    """
    Resolve institutional name from universities or users collection.
    """
    from app.database.mongodb import get_universities_collection, get_users_collection

    uni_coll = get_universities_collection()
    users_coll = get_users_collection()

    # 1. Try universities collection by created_by or _id
    uni_doc = uni_coll.find_one({"created_by": str(uni_id)})
    if not uni_doc:
        try:
            uni_doc = uni_coll.find_one({"_id": ObjectId(uni_id)})
        except Exception:
            pass
    if uni_doc and uni_doc.get("name"):
        return uni_doc["name"]

    # 2. Try users collection
    try:
        u_doc = users_coll.find_one({"_id": ObjectId(uni_id)})
        if u_doc:
            return (
                u_doc.get("organization")
                or u_doc.get("profile", {}).get("university_name")
                or u_doc.get("profile", {}).get("name")
                or "University Partner"
            )
    except Exception:
        pass

    return "University Partner"


def _format_location(raw_loc: Any) -> Optional[str]:
    if not raw_loc:
        return None
    if isinstance(raw_loc, str):
        return raw_loc
    if isinstance(raw_loc, dict):
        parts = [raw_loc.get("address"), raw_loc.get("district"), raw_loc.get("state")]
        res = ", ".join(p for p in parts if p)
        return res or None
    return None


def get_discovered_projects(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status_filter: Optional[str] = None,
    university_filter: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
) -> Dict[str, Any]:
    """
    Query real university projects eligible for industry discovery.
    Strictly filters out archived projects, and shields private citizen/university contact info.
    """
    import math
    from app.database.mongodb import (
        get_university_projects_collection,
        get_challenges_collection,
        get_university_teams_collection,
    )

    projects_coll = get_university_projects_collection()
    challenges_coll = get_challenges_collection()
    teams_coll = get_university_teams_collection()

    # Step 1: Base query: exclude archived projects
    query: Dict[str, Any] = {"status": {"$ne": "archived"}}
    if status_filter and status_filter.lower() != "all":
        query["status"] = status_filter

    raw_projects = list(projects_coll.find(query).sort("created_at", -1))
    discovered_list: List[Dict[str, Any]] = []

    for doc in raw_projects:
        cid = str(doc.get("challenge_id", ""))
        tid = str(doc.get("team_id", ""))
        uid = str(doc.get("university_id", ""))

        if not cid or not tid or not uid:
            continue

        # Requirement 2: Must have a linked valid challenge
        try:
            ch_doc = challenges_coll.find_one({"_id": ObjectId(cid)})
            if not ch_doc:
                continue
        except Exception:
            continue

        # Requirement 2: Must have a real team
        try:
            tm_doc = teams_coll.find_one({"_id": ObjectId(tid)})
            if not tm_doc or tm_doc.get("status") == "archived":
                continue
        except Exception:
            continue

        # Requirement 2: Must belong to a real university
        uni_name = _resolve_university_name(uid)

        f_count = len(tm_doc.get("faculty_member_ids", []))
        s_count = len(tm_doc.get("student_member_ids", []))

        ch_cat = ch_doc.get("category", "Civic")
        ch_subcat = ch_doc.get("subcategory")
        ch_loc = _format_location(ch_doc.get("location"))

        item = {
            "project_id": str(doc["_id"]),
            "project_name": doc.get("name", "University Project"),
            "description": doc.get("description"),
            "project_status": doc.get("status", "planning"),
            "challenge_id": str(ch_doc["_id"]),
            "challenge_title": ch_doc.get("title", ""),
            "challenge_category": ch_cat,
            "challenge_subcategory": ch_subcat,
            "challenge_location": ch_loc,
            "university_id": uid,
            "university_name": uni_name,
            "team_name": tm_doc.get("name", "Innovation Team"),
            "faculty_count": f_count,
            "student_count": s_count,
            "project_start_date": doc.get("start_date"),
            "target_date": doc.get("target_date"),
        }

        # Apply Category Filter
        if category and category.lower() != "all":
            if ch_cat.lower() != category.lower():
                continue

        # Apply University Filter
        if university_filter and university_filter.lower() != "all":
            u_query = university_filter.lower()
            if u_query not in uni_name.lower() and u_query != uid.lower():
                continue

        # Apply Search query
        if search:
            s_term = search.lower().strip()
            match_search = (
                s_term in item["project_name"].lower()
                or (item["description"] and s_term in item["description"].lower())
                or s_term in item["challenge_title"].lower()
                or s_term in item["university_name"].lower()
                or s_term in item["team_name"].lower()
            )
            if not match_search:
                continue

        discovered_list.append(item)

    # Step 3: Pagination
    total = len(discovered_list)
    limit = max(1, min(50, limit))
    total_pages = max(1, math.ceil(total / limit)) if total > 0 else 1
    page = max(1, min(page, total_pages)) if total > 0 else 1

    offset = (page - 1) * limit
    paged_items = discovered_list[offset : offset + limit]

    return {
        "items": paged_items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


def get_discovered_project_detail(project_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve sanitized project details for external industry discovery.
    Provides verified milestone progress, solution summary, prototypes, and field pilots.
    Shields all citizen personal information and university private rosters.
    """
    from app.database.mongodb import (
        get_university_projects_collection,
        get_challenges_collection,
        get_university_teams_collection,
        get_project_milestones_collection,
        get_project_solutions_collection,
        get_project_prototypes_collection,
        get_project_pilots_collection,
    )

    if not project_id:
        return None

    try:
        p_obj = ObjectId(project_id)
    except Exception:
        return None

    projects_coll = get_university_projects_collection()
    doc = projects_coll.find_one({"_id": p_obj})
    if not doc or doc.get("status") == "archived":
        return None

    cid = str(doc.get("challenge_id", ""))
    tid = str(doc.get("team_id", ""))
    uid = str(doc.get("university_id", ""))

    challenges_coll = get_challenges_collection()
    teams_coll = get_university_teams_collection()
    milestones_coll = get_project_milestones_collection()
    solutions_coll = get_project_solutions_collection()
    prototypes_coll = get_project_prototypes_collection()
    pilots_coll = get_project_pilots_collection()

    try:
        ch_doc = challenges_coll.find_one({"_id": ObjectId(cid)})
        if not ch_doc:
            return None
    except Exception:
        return None

    try:
        tm_doc = teams_coll.find_one({"_id": ObjectId(tid)})
        if not tm_doc or tm_doc.get("status") == "archived":
            return None
    except Exception:
        return None

    uni_name = _resolve_university_name(uid)

    # Milestones & Progress
    milestones_raw = list(milestones_coll.find({"project_id": str(doc["_id"])}).sort("due_date", 1))
    m_total = len(milestones_raw)
    m_done = sum(1 for m in milestones_raw if m.get("status") == "completed")
    m_progress = round((m_done / m_total) * 100) if m_total > 0 else 0

    sanitized_milestones = [
        {
            "id": str(m["_id"]),
            "title": m.get("title", ""),
            "description": m.get("description"),
            "status": m.get("status", "pending"),
            "due_date": m.get("due_date"),
            "completed_at": m.get("completed_at"),
        }
        for m in milestones_raw
    ]

    # Solution Proposal
    sol_doc = solutions_coll.find_one({"project_id": str(doc["_id"])})
    sanitized_solution = None
    if sol_doc:
        sanitized_solution = {
            "title": sol_doc.get("title", ""),
            "problem_statement": sol_doc.get("problem_statement", ""),
            "proposed_solution": sol_doc.get("proposed_solution", ""),
            "technical_approach": sol_doc.get("technical_approach"),
            "expected_outcomes": sol_doc.get("expected_outcomes"),
            "status": sol_doc.get("status", "draft"),
        }

    # Prototypes
    protos_raw = list(prototypes_coll.find({"project_id": str(doc["_id"])}).sort("created_at", 1))
    sanitized_prototypes = [
        {
            "id": str(p["_id"]),
            "version": p.get("version", "v1.0"),
            "title": p.get("title", ""),
            "description": p.get("description"),
            "status": p.get("status", "planned"),
            "artifact_url": p.get("artifact_url"),
            "artifact_type": p.get("artifact_type"),
        }
        for p in protos_raw
    ]

    # Pilots
    pilots_raw = list(pilots_coll.find({"project_id": str(doc["_id"])}).sort("start_date", 1))
    sanitized_pilots = [
        {
            "id": str(pi["_id"]),
            "title": pi.get("title", ""),
            "location": pi.get("location", ""),
            "objectives": pi.get("objectives", ""),
            "status": pi.get("status", "planned"),
            "start_date": pi.get("start_date"),
            "end_date": pi.get("end_date"),
            "observations": pi.get("observations"),
            "results": pi.get("results"),
        }
        for pi in pilots_raw
    ]

    return {
        "project_id": str(doc["_id"]),
        "project_name": doc.get("name", ""),
        "description": doc.get("description"),
        "project_status": doc.get("status", "planning"),
        "start_date": doc.get("start_date"),
        "target_date": doc.get("target_date"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
        # Linked Challenge (sanitized: no citizen personal details)
        "challenge_id": str(ch_doc["_id"]),
        "challenge_title": ch_doc.get("title", ""),
        "challenge_description": ch_doc.get("description"),
        "challenge_category": ch_doc.get("category", "Civic"),
        "challenge_subcategory": ch_doc.get("subcategory"),
        "challenge_location": _format_location(ch_doc.get("location")),
        "challenge_urgency": ch_doc.get("urgency"),
        # University & Team (sanitized: no private emails/phones)
        "university_id": uid,
        "university_name": uni_name,
        "team_name": tm_doc.get("name", "Innovation Team"),
        "faculty_count": len(tm_doc.get("faculty_member_ids", [])),
        "student_count": len(tm_doc.get("student_member_ids", [])),
        # Progress & Milestones
        "milestone_progress": m_progress,
        "milestones_count": m_total,
        "completed_milestones_count": m_done,
        "milestones": sanitized_milestones,
        # Solution, Prototypes, Pilots
        "solution": sanitized_solution,
        "prototypes": sanitized_prototypes,
        "pilots": sanitized_pilots,
    }


# =============================================================================
# 7C: INDUSTRY PARTNERSHIP INTEREST
# =============================================================================

def _log_project_activity(
    project_id: str,
    university_id: str,
    actor_id: Optional[str],
    action: str,
    description: str,
) -> None:
    """
    Record an authentic project lifecycle activity event in project_activity collection.
    """
    try:
        coll = get_project_activity_collection()
        coll.insert_one({
            "project_id": str(project_id),
            "university_id": str(university_id),
            "actor_id": str(actor_id) if actor_id else None,
            "action": action,
            "description": description,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        logger.warning(f"Failed to log project activity ({action}): {e}")


def _serialize_partnership(doc: Dict[str, Any]) -> Dict[str, Any]:
    res = {
        "id": str(doc["_id"]),
        "industry_user_id": str(doc.get("industry_user_id", "")),
        "project_id": str(doc.get("project_id", "")),
        "university_id": str(doc.get("university_id", "")),
        "status": doc.get("status", "pending"),
        "message": doc.get("message"),
        "created_at": doc.get("created_at", datetime.now(timezone.utc).isoformat()),
        "updated_at": doc.get("updated_at", datetime.now(timezone.utc).isoformat()),
    }
    for f in ["project_name", "university_name", "challenge_title", "challenge_category"]:
        if f in doc:
            res[f] = doc[f]
    return res


def express_partnership_interest(
    industry_user_id: str,
    project_id: str,
    message: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Express industry partnership interest for a university project.
    Validates industry profile existence, project status, and server-side resolved university ownership.
    Prevents duplicate submissions and logs real project activity.
    """
    if not industry_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated industry user identity is required.",
        )

    # 1. Verify industry user has an Industry Profile
    profile = get_industry_profile(industry_user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must complete your Industry Profile before expressing partnership interest.",
        )

    # 2. Verify target project exists and is eligible
    projects_coll = get_university_projects_collection()
    try:
        p_doc = projects_coll.find_one({"_id": ObjectId(project_id)})
    except Exception:
        p_doc = None

    if not p_doc or p_doc.get("status") == "archived":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not eligible for industry collaboration.",
        )

    # 3. Resolve university_id strictly from the project document
    uni_id = str(p_doc.get("university_id", ""))
    if not uni_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target project is missing valid university affiliation.",
        )

    # 4. Check for existing partnership
    part_coll = get_industry_partnerships_collection()
    existing = part_coll.find_one({
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
    })

    if existing:
        return _serialize_partnership(existing)

    # 5. Insert new partnership interest
    now = datetime.now(timezone.utc).isoformat()
    clean_msg = message.strip() if message and message.strip() else None
    doc = {
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
        "university_id": uni_id,
        "status": "pending",
        "message": clean_msg,
        "created_at": now,
        "updated_at": now,
    }
    res = part_coll.insert_one(doc)
    doc["_id"] = res.inserted_id

    # 6. Log authentic project activity
    company_name = profile.get("company_name", "Industry Partner")
    _log_project_activity(
        project_id=str(project_id),
        university_id=uni_id,
        actor_id=str(industry_user_id),
        action="partnership_interest_received",
        description=f"Industry partner '{company_name}' submitted a partnership interest request.",
    )

    return _serialize_partnership(doc)


def get_project_interest(industry_user_id: str, project_id: str) -> Optional[Dict[str, Any]]:
    """
    Get existing partnership interest for the authenticated industry user and project.
    """
    if not industry_user_id or not project_id:
        return None

    part_coll = get_industry_partnerships_collection()
    existing = part_coll.find_one({
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
    })
    if not existing:
        return None
    return _serialize_partnership(existing)


def get_industry_partnerships(
    industry_user_id: str,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Retrieve all partnerships submitted by the authenticated industry partner.
    Supports status filtering and contextual search.
    """
    if not industry_user_id:
        return []

    part_coll = get_industry_partnerships_collection()
    projects_coll = get_university_projects_collection()
    challenges_coll = get_challenges_collection()

    query: Dict[str, Any] = {"industry_user_id": str(industry_user_id)}
    if status_filter and status_filter.lower() != "all":
        query["status"] = status_filter.lower()

    records = list(part_coll.find(query).sort("created_at", -1))
    enriched_list: List[Dict[str, Any]] = []

    for rec in records:
        pid = rec.get("project_id", "")
        p_name = "University Project"
        u_name = "University Partner"
        ch_title = "Civic Challenge"
        ch_cat = "General"

        try:
            p_doc = projects_coll.find_one({"_id": ObjectId(pid)})
            if p_doc:
                p_name = p_doc.get("name", p_name)
                uid = str(p_doc.get("university_id", ""))
                u_name = _resolve_university_name(uid)
                cid = str(p_doc.get("challenge_id", ""))
                if cid:
                    ch_doc = challenges_coll.find_one({"_id": ObjectId(cid)})
                    if ch_doc:
                        ch_title = ch_doc.get("title", ch_title)
                        ch_cat = ch_doc.get("category", ch_cat)
        except Exception:
            pass

        item = _serialize_partnership(rec)
        item["project_name"] = p_name
        item["university_name"] = u_name
        item["challenge_title"] = ch_title
        item["challenge_category"] = ch_cat

        if search:
            s_term = search.lower().strip()
            match = (
                s_term in p_name.lower()
                or s_term in u_name.lower()
                or s_term in ch_title.lower()
                or (item.get("message") and s_term in item["message"].lower())
            )
            if not match:
                continue

        enriched_list.append(item)

    return enriched_list


def withdraw_partnership(industry_user_id: str, partnership_id: str) -> Dict[str, Any]:
    """
    Withdraw a pending partnership request submitted by the authenticated industry partner.
    """
    if not industry_user_id or not partnership_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Partnership ID and authenticated user required.",
        )

    part_coll = get_industry_partnerships_collection()
    try:
        p_obj = ObjectId(partnership_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid partnership ID.")

    doc = part_coll.find_one({"_id": p_obj, "industry_user_id": str(industry_user_id)})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partnership record not found or unauthorized.",
        )

    if doc.get("status") == "withdrawn":
        return _serialize_partnership(doc)

    now = datetime.now(timezone.utc).isoformat()
    part_coll.update_one({"_id": p_obj}, {"$set": {"status": "withdrawn", "updated_at": now}})
    updated = part_coll.find_one({"_id": p_obj})

    profile = get_industry_profile(industry_user_id)
    company_name = profile.get("company_name", "Industry Partner") if profile else "Industry Partner"
    _log_project_activity(
        project_id=str(doc.get("project_id")),
        university_id=str(doc.get("university_id")),
        actor_id=str(industry_user_id),
        action="partnership_interest_withdrawn",
        description=f"Industry partner '{company_name}' withdrew its partnership interest.",
    )

    return _serialize_partnership(updated)


# =============================================================================
# 7D: INDUSTRY EXPERTS MANAGEMENT
# =============================================================================

def _serialize_expert(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "industry_user_id": str(doc.get("industry_user_id", "")),
        "name": doc.get("name", ""),
        "designation": doc.get("designation", ""),
        "email": doc.get("email", ""),
        "expertise": doc.get("expertise", []),
        "skills": doc.get("skills", []),
        "domain_areas": doc.get("domain_areas", []),
        "availability": doc.get("availability", "available"),
        "created_at": doc.get("created_at", datetime.now(timezone.utc).isoformat()),
        "updated_at": doc.get("updated_at", datetime.now(timezone.utc).isoformat()),
    }


def create_expert(industry_user_id: str, data: IndustryExpertCreate) -> Dict[str, Any]:
    """
    Register a real corporate technical expert / advisor under the authenticated industry account.
    """
    if not industry_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")

    coll = get_industry_experts_collection()
    clean_email = str(data.email).strip().lower()

    existing = coll.find_one({"industry_user_id": str(industry_user_id), "email": clean_email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An expert with this email is already registered in your corporate roster.",
        )

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "industry_user_id": str(industry_user_id),
        "name": data.name.strip(),
        "designation": data.designation.strip(),
        "email": clean_email,
        "expertise": [x.strip() for x in data.expertise if x.strip()],
        "skills": [x.strip() for x in data.skills if x.strip()],
        "domain_areas": [x.strip() for x in data.domain_areas if x.strip()],
        "availability": data.availability,
        "created_at": now,
        "updated_at": now,
    }
    res = coll.insert_one(doc)
    doc["_id"] = res.inserted_id
    logger.info(f"Registered industry expert {clean_email} for user {industry_user_id}")
    return _serialize_expert(doc)


def get_experts(
    industry_user_id: str,
    search: Optional[str] = None,
    expertise: Optional[str] = None,
    skills: Optional[str] = None,
    availability: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Query experts belonging strictly to the authenticated industry user.
    """
    if not industry_user_id:
        return []

    coll = get_industry_experts_collection()
    query: Dict[str, Any] = {"industry_user_id": str(industry_user_id)}

    if availability and availability.lower() != "all":
        query["availability"] = availability.lower()

    raw_list = list(coll.find(query).sort("created_at", -1))
    filtered: List[Dict[str, Any]] = []

    for item in raw_list:
        serialized = _serialize_expert(item)

        if expertise and expertise.lower() != "all":
            exp_match = any(expertise.lower() in x.lower() for x in serialized["expertise"])
            if not exp_match:
                continue

        if skills and skills.lower() != "all":
            skill_match = any(skills.lower() in x.lower() for x in serialized["skills"])
            if not skill_match:
                continue

        if search:
            s_term = search.lower().strip()
            name_match = (
                s_term in serialized["name"].lower()
                or s_term in serialized["designation"].lower()
                or s_term in serialized["email"].lower()
                or any(s_term in x.lower() for x in serialized["expertise"])
                or any(s_term in x.lower() for x in serialized["skills"])
            )
            if not name_match:
                continue

        filtered.append(serialized)

    return filtered


def get_expert_by_id(industry_user_id: str, expert_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a specific expert ensuring strict institutional ownership.
    """
    if not industry_user_id or not expert_id:
        return None

    try:
        e_obj = ObjectId(expert_id)
    except Exception:
        return None

    coll = get_industry_experts_collection()
    doc = coll.find_one({"_id": e_obj, "industry_user_id": str(industry_user_id)})
    if not doc:
        return None
    return _serialize_expert(doc)


def update_expert(
    industry_user_id: str,
    expert_id: str,
    data: IndustryExpertUpdate,
) -> Dict[str, Any]:
    """
    Update an expert belonging to the authenticated industry user.
    """
    if not industry_user_id or not expert_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing parameters.")

    try:
        e_obj = ObjectId(expert_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid expert ID.")

    coll = get_industry_experts_collection()
    doc = coll.find_one({"_id": e_obj, "industry_user_id": str(industry_user_id)})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert not found.")

    updates: Dict[str, Any] = {}
    if data.name is not None:
        updates["name"] = data.name.strip()
    if data.designation is not None:
        updates["designation"] = data.designation.strip()
    if data.email is not None:
        clean_email = str(data.email).strip().lower()
        if clean_email != doc.get("email"):
            conflict = coll.find_one({
                "industry_user_id": str(industry_user_id),
                "email": clean_email,
                "_id": {"$ne": e_obj},
            })
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An expert with this email already exists in your roster.",
                )
            updates["email"] = clean_email
    if data.expertise is not None:
        updates["expertise"] = [x.strip() for x in data.expertise if x.strip()]
    if data.skills is not None:
        updates["skills"] = [x.strip() for x in data.skills if x.strip()]
    if data.domain_areas is not None:
        updates["domain_areas"] = [x.strip() for x in data.domain_areas if x.strip()]
    if data.availability is not None:
        updates["availability"] = data.availability

    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        coll.update_one({"_id": e_obj}, {"$set": updates})

    updated = coll.find_one({"_id": e_obj})
    return _serialize_expert(updated)


def delete_expert(industry_user_id: str, expert_id: str) -> bool:
    """
    Delete an expert belonging to the authenticated industry user.
    """
    if not industry_user_id or not expert_id:
        return False

    try:
        e_obj = ObjectId(expert_id)
    except Exception:
        return False

    coll = get_industry_experts_collection()
    res = coll.delete_one({"_id": e_obj, "industry_user_id": str(industry_user_id)})
    return res.deleted_count > 0


# =============================================================================
# 7D: PROJECT MENTORSHIP
# =============================================================================

def _serialize_mentorship(doc: Dict[str, Any]) -> Dict[str, Any]:
    res = {
        "id": str(doc["_id"]),
        "project_id": str(doc.get("project_id", "")),
        "university_id": str(doc.get("university_id", "")),
        "industry_user_id": str(doc.get("industry_user_id", "")),
        "expert_id": str(doc.get("expert_id", "")),
        "partnership_id": str(doc.get("partnership_id", "")),
        "status": doc.get("status", "proposed"),
        "focus_areas": doc.get("focus_areas", []),
        "objectives": doc.get("objectives", ""),
        "created_at": doc.get("created_at", datetime.now(timezone.utc).isoformat()),
        "updated_at": doc.get("updated_at", datetime.now(timezone.utc).isoformat()),
    }
    for f in [
        "expert_name",
        "expert_designation",
        "expert_expertise",
        "expert_skills",
        "company_name",
        "project_name",
        "university_name",
    ]:
        if f in doc:
            res[f] = doc[f]
    return res


def propose_mentorship(
    industry_user_id: str,
    project_id: str,
    data: ProjectMentorshipCreate,
) -> Dict[str, Any]:
    """
    Propose a technical mentorship for a university project.
    Strictly requires that an accepted industry partnership exists for this project.
    """
    if not industry_user_id or not project_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing parameters.")

    # 1. Verify project exists
    projects_coll = get_university_projects_collection()
    try:
        p_doc = projects_coll.find_one({"_id": ObjectId(project_id)})
    except Exception:
        p_doc = None

    if not p_doc or p_doc.get("status") == "archived":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or archived.")

    uni_id = str(p_doc.get("university_id", ""))

    # 2. Verify accepted partnership exists
    part_coll = get_industry_partnerships_collection()
    partnership = part_coll.find_one({
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
        "status": "accepted",
    })
    if not partnership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentorship can only be proposed after the university has accepted your industry partnership.",
        )

    # 3. Verify expert belongs to this industry account
    exp_coll = get_industry_experts_collection()
    try:
        e_obj = ObjectId(data.expert_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid expert ID.")

    expert = exp_coll.find_one({"_id": e_obj, "industry_user_id": str(industry_user_id)})
    if not expert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert not found in your roster.")

    # 4. Insert mentorship record
    m_coll = get_project_mentorships_collection()
    now = datetime.now(timezone.utc).isoformat()
    m_doc = {
        "project_id": str(project_id),
        "university_id": uni_id,
        "industry_user_id": str(industry_user_id),
        "expert_id": str(expert["_id"]),
        "partnership_id": str(partnership["_id"]),
        "status": "proposed",
        "focus_areas": [x.strip() for x in data.focus_areas if x.strip()],
        "objectives": data.objectives.strip(),
        "created_at": now,
        "updated_at": now,
    }
    res = m_coll.insert_one(m_doc)
    m_doc["_id"] = res.inserted_id

    # 5. Log project activity
    _log_project_activity(
        project_id=str(project_id),
        university_id=uni_id,
        actor_id=str(industry_user_id),
        action="mentorship_proposed",
        description=f"Industry mentor {expert.get('name')} ({expert.get('designation')}) proposed for technical advisory.",
    )

    serialized = _serialize_mentorship(m_doc)
    serialized["expert_name"] = expert.get("name")
    serialized["expert_designation"] = expert.get("designation")
    serialized["expert_expertise"] = expert.get("expertise", [])
    serialized["expert_skills"] = expert.get("skills", [])
    return serialized


def get_project_mentorships_for_industry(
    industry_user_id: str,
    project_id: str,
) -> List[Dict[str, Any]]:
    """
    Get all mentorships on a project for the authenticated industry partner.
    """
    if not industry_user_id or not project_id:
        return []

    m_coll = get_project_mentorships_collection()
    exp_coll = get_industry_experts_collection()

    raw = list(m_coll.find({
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
    }).sort("created_at", -1))

    result: List[Dict[str, Any]] = []
    for item in raw:
        s = _serialize_mentorship(item)
        try:
            exp = exp_coll.find_one({"_id": ObjectId(item.get("expert_id"))})
            if exp:
                s["expert_name"] = exp.get("name")
                s["expert_designation"] = exp.get("designation")
                s["expert_expertise"] = exp.get("expertise", [])
                s["expert_skills"] = exp.get("skills", [])
        except Exception:
            pass
        result.append(s)

    return result


def get_all_industry_mentorships(industry_user_id: str) -> List[Dict[str, Any]]:
    """
    Get all mentorships across all projects for the authenticated industry partner.
    """
    if not industry_user_id:
        return []

    m_coll = get_project_mentorships_collection()
    exp_coll = get_industry_experts_collection()
    projects_coll = get_university_projects_collection()

    raw = list(m_coll.find({"industry_user_id": str(industry_user_id)}).sort("created_at", -1))
    result: List[Dict[str, Any]] = []

    for item in raw:
        s = _serialize_mentorship(item)
        try:
            exp = exp_coll.find_one({"_id": ObjectId(item.get("expert_id"))})
            if exp:
                s["expert_name"] = exp.get("name")
                s["expert_designation"] = exp.get("designation")
                s["expert_expertise"] = exp.get("expertise", [])
                s["expert_skills"] = exp.get("skills", [])

            p_doc = projects_coll.find_one({"_id": ObjectId(item.get("project_id"))})
            if p_doc:
                s["project_name"] = p_doc.get("name")
                s["university_name"] = _resolve_university_name(str(p_doc.get("university_id", "")))
        except Exception:
            pass
        result.append(s)

    return result


def update_mentorship(
    industry_user_id: str,
    mentorship_id: str,
    data: ProjectMentorshipUpdate,
) -> Dict[str, Any]:
    """
    Update mentorship status or details by the authenticated industry partner.
    """
    if not industry_user_id or not mentorship_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing parameters.")

    try:
        m_obj = ObjectId(mentorship_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid mentorship ID.")

    m_coll = get_project_mentorships_collection()
    doc = m_coll.find_one({"_id": m_obj, "industry_user_id": str(industry_user_id)})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentorship record not found.")

    updates: Dict[str, Any] = {}
    if data.status:
        updates["status"] = data.status
    if data.focus_areas is not None:
        updates["focus_areas"] = [x.strip() for x in data.focus_areas if x.strip()]
    if data.objectives:
        updates["objectives"] = data.objectives.strip()

    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        m_coll.update_one({"_id": m_obj}, {"$set": updates})

        # Activity logging on state transitions
        if data.status:
            action_map = {
                "active": ("mentorship_activated", "Mentorship engagement activated."),
                "completed": ("mentorship_completed", "Mentorship engagement completed."),
                "withdrawn": ("mentorship_withdrawn", "Mentorship engagement withdrawn."),
            }
            if data.status in action_map:
                act_name, act_desc = action_map[data.status]
                _log_project_activity(
                    project_id=str(doc.get("project_id")),
                    university_id=str(doc.get("university_id")),
                    actor_id=str(industry_user_id),
                    action=act_name,
                    description=act_desc,
                )

    updated = m_coll.find_one({"_id": m_obj})
    return _serialize_mentorship(updated)


def withdraw_or_delete_mentorship(industry_user_id: str, mentorship_id: str) -> bool:
    """
    Withdraw or remove a mentorship belonging to the authenticated industry partner.
    """
    if not industry_user_id or not mentorship_id:
        return False

    try:
        m_obj = ObjectId(mentorship_id)
    except Exception:
        return False

    m_coll = get_project_mentorships_collection()
    doc = m_coll.find_one({"_id": m_obj, "industry_user_id": str(industry_user_id)})
    if not doc:
        return False

    now = datetime.now(timezone.utc).isoformat()
    m_coll.update_one({"_id": m_obj}, {"$set": {"status": "withdrawn", "updated_at": now}})
    _log_project_activity(
        project_id=str(doc.get("project_id")),
        university_id=str(doc.get("university_id")),
        actor_id=str(industry_user_id),
        action="mentorship_withdrawn",
        description="Mentorship engagement withdrawn by industry partner.",
    )
    return True


def get_industry_dashboard_stats(industry_user_id: str) -> Dict[str, Any]:
    """
    Compute real, non-fabricated metrics for the Industry Dashboard from MongoDB.
    """
    if not industry_user_id:
        return {
            "discovered_projects": 0,
            "pending_partnerships": 0,
            "active_partnerships": 0,
            "active_mentorships": 0,
            "supported_projects": 0,
        }

    projects_coll = get_university_projects_collection()
    part_coll = get_industry_partnerships_collection()
    m_coll = get_project_mentorships_collection()
    res_coll = get_project_industry_resources_collection()
    fund_coll = get_project_industry_funding_collection()

    # Total discoverable unarchived projects
    disc_count = projects_coll.count_documents({"status": {"$ne": "archived"}})

    # Partnerships for this industry user
    pending_p = part_coll.count_documents({"industry_user_id": str(industry_user_id), "status": "pending"})
    active_p = part_coll.count_documents({"industry_user_id": str(industry_user_id), "status": "accepted"})

    # Mentorships
    active_m = m_coll.count_documents({"industry_user_id": str(industry_user_id), "status": "active"})

    # Supported projects (distinct accepted project IDs)
    accepted_records = list(part_coll.find({"industry_user_id": str(industry_user_id), "status": "accepted"}))
    supported_proj_ids = set(str(r["project_id"]) for r in accepted_records if r.get("project_id"))

    # Resources & Funding metrics
    resources_count = res_coll.count_documents({
        "industry_user_id": str(industry_user_id),
        "status": {"$in": ["provided", "approved"]},
    })
    funding_count = fund_coll.count_documents({"industry_user_id": str(industry_user_id)})

    return {
        "discovered_projects": disc_count,
        "pending_partnerships": pending_p,
        "active_partnerships": active_p,
        "active_mentorships": active_m,
        "supported_projects": len(supported_proj_ids),
        "resources_contributed": resources_count,
        "funding_proposals": funding_count,
        "active_collaborations": len(supported_proj_ids),
    }


# =============================================================================
# RESOURCE & TECHNOLOGY SUPPORT
# =============================================================================

def _serialize_resource(doc: Dict[str, Any]) -> Dict[str, Any]:
    res = {
        "id": str(doc["_id"]),
        "project_id": str(doc.get("project_id", "")),
        "university_id": str(doc.get("university_id", "")),
        "industry_user_id": str(doc.get("industry_user_id", "")),
        "partnership_id": str(doc.get("partnership_id", "")),
        "title": doc.get("title", ""),
        "resource_type": doc.get("resource_type", "other"),
        "description": doc.get("description", ""),
        "quantity_or_scope": doc.get("quantity_or_scope"),
        "status": doc.get("status", "proposed"),
        "provided_at": doc.get("provided_at"),
        "created_at": doc.get("created_at", datetime.now(timezone.utc).isoformat()),
        "updated_at": doc.get("updated_at", datetime.now(timezone.utc).isoformat()),
    }
    for k in ["company_name", "industry_sector", "project_name", "university_name"]:
        if k in doc:
            res[k] = doc[k]
    return res


def create_resource_contribution(
    industry_user_id: str,
    project_id: str,
    data: IndustryResourceCreate,
) -> Dict[str, Any]:
    """
    Propose a resource or technology contribution for a university project.
    Strictly validates: project exists, partnership exists and is 'accepted',
    and ownership is verified server-side.
    """
    if not industry_user_id:
        raise HTTPException(status_code=401, detail="Authenticated industry identity required.")

    # 1. Check project
    p_coll = get_university_projects_collection()
    try:
        p_doc = p_coll.find_one({"_id": ObjectId(project_id)})
    except Exception:
        p_doc = None
    if not p_doc or p_doc.get("status") == "archived":
        raise HTTPException(status_code=404, detail="Project not found or archived.")

    uni_id = str(p_doc.get("university_id", ""))
    proj_name = p_doc.get("name", "Project")

    # 2. Check accepted partnership
    part_coll = get_industry_partnerships_collection()
    part_doc = part_coll.find_one({
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
        "status": "accepted",
    })
    if not part_doc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Resource contributions require an accepted partnership for this project.",
        )

    # 3. Create document
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "project_id": str(project_id),
        "university_id": uni_id,
        "industry_user_id": str(industry_user_id),
        "partnership_id": str(part_doc["_id"]),
        "title": data.title.strip(),
        "resource_type": data.resource_type,
        "description": data.description.strip(),
        "quantity_or_scope": data.quantity_or_scope.strip() if data.quantity_or_scope else None,
        "status": "proposed",
        "provided_at": None,
        "created_at": now,
        "updated_at": now,
    }
    r_coll = get_project_industry_resources_collection()
    res = r_coll.insert_one(doc)
    doc["_id"] = res.inserted_id

    # 4. Project activity
    _log_project_activity(
        project_id=str(project_id),
        university_id=uni_id,
        actor_id=str(industry_user_id),
        action="resource_proposed",
        description=f"Industry partner proposed {data.resource_type} contribution: '{data.title}'.",
    )

    return _serialize_resource(doc)


def get_project_resources_for_industry(
    industry_user_id: str,
    project_id: str,
) -> List[Dict[str, Any]]:
    """
    Get all resource contributions for this project made by the authenticated industry partner.
    """
    if not industry_user_id or not project_id:
        return []

    r_coll = get_project_industry_resources_collection()
    docs = list(r_coll.find({
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
    }).sort("created_at", -1))
    return [_serialize_resource(d) for d in docs]


def update_resource_contribution(
    industry_user_id: str,
    resource_id: str,
    data: IndustryResourceUpdate,
) -> Dict[str, Any]:
    """
    Update resource details or status (e.g. mark provided or withdrawn).
    """
    if not industry_user_id or not resource_id:
        raise HTTPException(status_code=400, detail="Invalid request parameters.")

    try:
        r_obj = ObjectId(resource_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resource ID format.")

    r_coll = get_project_industry_resources_collection()
    doc = r_coll.find_one({"_id": r_obj, "industry_user_id": str(industry_user_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Resource contribution not found.")

    update_fields: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if data.title is not None:
        update_fields["title"] = data.title.strip()
    if data.resource_type is not None:
        update_fields["resource_type"] = data.resource_type
    if data.description is not None:
        update_fields["description"] = data.description.strip()
    if data.quantity_or_scope is not None:
        update_fields["quantity_or_scope"] = data.quantity_or_scope.strip() if data.quantity_or_scope else None
    if data.status is not None:
        update_fields["status"] = data.status
        if data.status == "provided":
            update_fields["provided_at"] = datetime.now(timezone.utc).isoformat()
            _log_project_activity(
                project_id=str(doc["project_id"]),
                university_id=str(doc["university_id"]),
                actor_id=str(industry_user_id),
                action="resource_provided",
                description=f"Industry resource '{doc.get('title')}' has been provided to the project.",
            )
        elif data.status == "withdrawn":
            _log_project_activity(
                project_id=str(doc["project_id"]),
                university_id=str(doc["university_id"]),
                actor_id=str(industry_user_id),
                action="resource_withdrawn",
                description=f"Industry resource proposal '{doc.get('title')}' was withdrawn.",
            )

    r_coll.update_one({"_id": r_obj}, {"$set": update_fields})
    updated = r_coll.find_one({"_id": r_obj})
    return _serialize_resource(updated)


def delete_or_withdraw_resource(industry_user_id: str, resource_id: str) -> bool:
    """
    Withdraw or remove resource contribution belonging to the authenticated industry partner.
    """
    if not industry_user_id or not resource_id:
        return False

    try:
        r_obj = ObjectId(resource_id)
    except Exception:
        return False

    r_coll = get_project_industry_resources_collection()
    doc = r_coll.find_one({"_id": r_obj, "industry_user_id": str(industry_user_id)})
    if not doc:
        return False

    now = datetime.now(timezone.utc).isoformat()
    r_coll.update_one({"_id": r_obj}, {"$set": {"status": "withdrawn", "updated_at": now}})
    _log_project_activity(
        project_id=str(doc["project_id"]),
        university_id=str(doc["university_id"]),
        actor_id=str(industry_user_id),
        action="resource_withdrawn",
        description=f"Industry resource contribution '{doc.get('title')}' was withdrawn.",
    )
    return True


# =============================================================================
# FUNDING & SPONSORSHIP PROPOSALS
# =============================================================================

def _serialize_funding(doc: Dict[str, Any]) -> Dict[str, Any]:
    res = {
        "id": str(doc["_id"]),
        "project_id": str(doc.get("project_id", "")),
        "university_id": str(doc.get("university_id", "")),
        "industry_user_id": str(doc.get("industry_user_id", "")),
        "partnership_id": str(doc.get("partnership_id", "")),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "amount": float(doc.get("amount", 0.0)),
        "currency": doc.get("currency", "INR"),
        "funding_type": doc.get("funding_type", "sponsorship"),
        "status": doc.get("status", "proposed"),
        "proposed_at": doc.get("proposed_at", datetime.now(timezone.utc).isoformat()),
        "updated_at": doc.get("updated_at", datetime.now(timezone.utc).isoformat()),
    }
    for k in ["company_name", "industry_sector", "project_name", "university_name"]:
        if k in doc:
            res[k] = doc[k]
    return res


def create_funding_proposal(
    industry_user_id: str,
    project_id: str,
    data: IndustryFundingCreate,
) -> Dict[str, Any]:
    """
    Propose sponsorship or grant funding for a university project.
    Requires accepted partnership and server-side ownership resolution.
    """
    if not industry_user_id:
        raise HTTPException(status_code=401, detail="Authenticated industry identity required.")

    # 1. Verify project
    p_coll = get_university_projects_collection()
    try:
        p_doc = p_coll.find_one({"_id": ObjectId(project_id)})
    except Exception:
        p_doc = None
    if not p_doc or p_doc.get("status") == "archived":
        raise HTTPException(status_code=404, detail="Project not found or archived.")

    uni_id = str(p_doc.get("university_id", ""))

    # 2. Verify accepted partnership
    part_coll = get_industry_partnerships_collection()
    part_doc = part_coll.find_one({
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
        "status": "accepted",
    })
    if not part_doc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Funding proposals require an accepted partnership for this project.",
        )

    # 3. Create document
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "project_id": str(project_id),
        "university_id": uni_id,
        "industry_user_id": str(industry_user_id),
        "partnership_id": str(part_doc["_id"]),
        "title": data.title.strip(),
        "description": data.description.strip(),
        "amount": float(data.amount),
        "currency": data.currency.strip().upper(),
        "funding_type": data.funding_type,
        "status": "proposed",
        "proposed_at": now,
        "updated_at": now,
    }
    fund_coll = get_project_industry_funding_collection()
    res = fund_coll.insert_one(doc)
    doc["_id"] = res.inserted_id

    # 4. Project activity
    _log_project_activity(
        project_id=str(project_id),
        university_id=uni_id,
        actor_id=str(industry_user_id),
        action="funding_proposed",
        description=f"Industry partner proposed {data.funding_type} of {data.currency} {data.amount:,.2f}: '{data.title}'.",
    )

    return _serialize_funding(doc)


def get_project_funding_for_industry(
    industry_user_id: str,
    project_id: str,
) -> List[Dict[str, Any]]:
    """
    Get all funding proposals for this project submitted by the authenticated industry partner.
    """
    if not industry_user_id or not project_id:
        return []

    fund_coll = get_project_industry_funding_collection()
    docs = list(fund_coll.find({
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
    }).sort("proposed_at", -1))
    return [_serialize_funding(d) for d in docs]


def update_funding_proposal(
    industry_user_id: str,
    funding_id: str,
    data: IndustryFundingUpdate,
) -> Dict[str, Any]:
    """
    Update funding proposal details or withdraw it.
    """
    if not industry_user_id or not funding_id:
        raise HTTPException(status_code=400, detail="Invalid request parameters.")

    try:
        f_obj = ObjectId(funding_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid funding ID format.")

    fund_coll = get_project_industry_funding_collection()
    doc = fund_coll.find_one({"_id": f_obj, "industry_user_id": str(industry_user_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Funding proposal not found.")

    update_fields: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if data.title is not None:
        update_fields["title"] = data.title.strip()
    if data.description is not None:
        update_fields["description"] = data.description.strip()
    if data.amount is not None:
        update_fields["amount"] = float(data.amount)
    if data.currency is not None:
        update_fields["currency"] = data.currency.strip().upper()
    if data.funding_type is not None:
        update_fields["funding_type"] = data.funding_type
    if data.status is not None:
        update_fields["status"] = data.status
        if data.status == "withdrawn":
            _log_project_activity(
                project_id=str(doc["project_id"]),
                university_id=str(doc["university_id"]),
                actor_id=str(industry_user_id),
                action="funding_withdrawn",
                description=f"Industry funding proposal '{doc.get('title')}' was withdrawn.",
            )
        elif data.status == "disbursed":
            _log_project_activity(
                project_id=str(doc["project_id"]),
                university_id=str(doc["university_id"]),
                actor_id=str(industry_user_id),
                action="funding_disbursed",
                description=f"Industry funding '{doc.get('title')}' was marked as disbursed.",
            )

    fund_coll.update_one({"_id": f_obj}, {"$set": update_fields})
    updated = fund_coll.find_one({"_id": f_obj})
    return _serialize_funding(updated)


def delete_or_withdraw_funding(industry_user_id: str, funding_id: str) -> bool:
    """
    Withdraw funding proposal.
    """
    if not industry_user_id or not funding_id:
        return False

    try:
        f_obj = ObjectId(funding_id)
    except Exception:
        return False

    fund_coll = get_project_industry_funding_collection()
    doc = fund_coll.find_one({"_id": f_obj, "industry_user_id": str(industry_user_id)})
    if not doc:
        return False

    now = datetime.now(timezone.utc).isoformat()
    fund_coll.update_one({"_id": f_obj}, {"$set": {"status": "withdrawn", "updated_at": now}})
    _log_project_activity(
        project_id=str(doc["project_id"]),
        university_id=str(doc["university_id"]),
        actor_id=str(industry_user_id),
        action="funding_withdrawn",
        description=f"Industry funding proposal '{doc.get('title')}' was withdrawn.",
    )
    return True


# =============================================================================
# COLLABORATION SUMMARY
# =============================================================================

def get_collaboration_summary(industry_user_id: str, project_id: str) -> Dict[str, Any]:
    """
    Return an integrated, real collaboration summary for the project workspace.
    """
    if not industry_user_id or not project_id:
        raise HTTPException(status_code=400, detail="Missing industry or project identity.")

    p_coll = get_university_projects_collection()
    try:
        p_doc = p_coll.find_one({"_id": ObjectId(project_id)})
    except Exception:
        p_doc = None
    if not p_doc:
        raise HTTPException(status_code=404, detail="Project not found.")

    part_coll = get_industry_partnerships_collection()
    part_doc = part_coll.find_one({
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
    })

    part_status = part_doc.get("status", "none") if part_doc else "none"

    m_coll = get_project_mentorships_collection()
    mentors_count = m_coll.count_documents({
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
        "status": {"$in": ["proposed", "active"]},
    })

    r_coll = get_project_industry_resources_collection()
    resources_count = r_coll.count_documents({
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
        "status": {"$in": ["proposed", "approved", "provided"]},
    })

    f_coll = get_project_industry_funding_collection()
    funding_count = f_coll.count_documents({
        "industry_user_id": str(industry_user_id),
        "project_id": str(project_id),
        "status": {"$in": ["proposed", "approved", "disbursed"]},
    })

    uni_name = "University"
    try:
        from app.database.mongodb import get_universities_collection
        u_doc = get_universities_collection().find_one({"_id": ObjectId(p_doc.get("university_id"))})
        if u_doc:
            uni_name = u_doc.get("name", uni_name)
    except Exception:
        pass

    return {
        "project_id": str(project_id),
        "project_name": p_doc.get("name", "Project"),
        "university_id": str(p_doc.get("university_id", "")),
        "university_name": uni_name,
        "project_status": p_doc.get("status", "planning"),
        "partnership_status": part_status,
        "assigned_mentors_count": mentors_count,
        "resources_count": resources_count,
        "funding_proposals_count": funding_count,
    }


