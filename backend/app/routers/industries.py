import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import require_role
from app.schemas.auth import UserRole
from app.schemas.industry import (
    IndustryProfileCreate,
    IndustryProfileUpdate,
    IndustryProfileResponse,
    IndustryDiscoveredProjectsPage,
    IndustryDiscoveredProjectDetail,
    PartnershipInterestCreate,
    IndustryPartnershipResponse,
    IndustryExpertCreate,
    IndustryExpertUpdate,
    IndustryExpertResponse,
    ProjectMentorshipCreate,
    ProjectMentorshipUpdate,
    ProjectMentorshipResponse,
    IndustryResourceCreate,
    IndustryResourceUpdate,
    IndustryResourceResponse,
    IndustryFundingCreate,
    IndustryFundingUpdate,
    IndustryFundingResponse,
    IndustryCollaborationSummary,
)
from app.services import industry_service

logger = logging.getLogger("unibridge.industries_router")
router = APIRouter()


@router.get(
    "/profile",
    response_model=IndustryProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated industry profile",
    description="Retrieves the industry profile for the authenticated corporate/industry account.",
)
def get_industry_profile_endpoint(
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )

    profile = industry_service.get_industry_profile(str(user_id))
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry profile not found. Please set up your corporate profile.",
        )

    return profile


@router.post(
    "/profile",
    response_model=IndustryProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create or initialize industry profile",
    description="Creates a new industry profile for the authenticated corporate partner.",
)
def create_industry_profile_endpoint(
    profile_in: IndustryProfileCreate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )

    return industry_service.create_industry_profile(str(user_id), profile_in)


@router.put(
    "/profile",
    response_model=IndustryProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update authenticated industry profile",
    description="Updates the corporate profile information for the authenticated industry user.",
)
def update_industry_profile_endpoint(
    profile_in: IndustryProfileUpdate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )

    return industry_service.update_industry_profile(str(user_id), profile_in)


# =============================================================================
# PROJECT DISCOVERY ENDPOINTS (STEP 7B)
# =============================================================================

@router.get(
    "/projects",
    response_model=IndustryDiscoveredProjectsPage,
    status_code=status.HTTP_200_OK,
    summary="Discover university projects eligible for industry collaboration",
    description="Provides real-time discovery of active university innovation projects addressing adopted civic challenges. Sanitized for external discovery.",
)
def discover_projects_endpoint(
    search: Optional[str] = Query(default=None, description="Search term matching project name, description, challenge, or university"),
    category: Optional[str] = Query(default=None, description="Filter by civic challenge category"),
    status_filter: Optional[str] = Query(default=None, alias="status", description="Filter by project lifecycle status"),
    university: Optional[str] = Query(default=None, description="Filter by university name or ID"),
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=10, ge=1, le=50, description="Items per page"),
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    return industry_service.get_discovered_projects(
        search=search,
        category=category,
        status_filter=status_filter,
        university_filter=university,
        page=page,
        limit=limit,
    )


@router.get(
    "/projects/{project_id}",
    response_model=IndustryDiscoveredProjectDetail,
    status_code=status.HTTP_200_OK,
    summary="Get discovered university project details",
    description="Retrieves sanitized project details, challenge dossier summary, team composition, verified milestone progress, and prototype/pilot status for industry discovery.",
)
def get_discovered_project_detail_endpoint(
    project_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    project = industry_service.get_discovered_project_detail(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not eligible for industry discovery.",
        )
    return project


# =============================================================================
# 7C: INDUSTRY PARTNERSHIP ENDPOINTS
# =============================================================================

@router.post(
    "/projects/{project_id}/interest",
    response_model=IndustryPartnershipResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Express partnership interest in a university project",
    description="Submits an industry partnership expression of interest for a university project.",
)
def express_partnership_interest_endpoint(
    project_id: str,
    body: Optional[PartnershipInterestCreate] = None,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    msg = body.message if body else None
    return industry_service.express_partnership_interest(str(user_id), project_id, msg)


@router.get(
    "/projects/{project_id}/interest",
    response_model=Optional[IndustryPartnershipResponse],
    status_code=status.HTTP_200_OK,
    summary="Get partnership interest status for a project",
    description="Checks whether the authenticated industry partner has expressed interest in a specific project.",
)
def get_project_interest_endpoint(
    project_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.get_project_interest(str(user_id), project_id)


@router.get(
    "/partnerships",
    response_model=List[IndustryPartnershipResponse],
    status_code=status.HTTP_200_OK,
    summary="List authenticated industry partnerships",
    description="Returns all partnership requests and collaborations submitted by the authenticated industry partner.",
)
def get_industry_partnerships_endpoint(
    status_filter: Optional[str] = Query(default=None, alias="status", description="Filter by status: pending, accepted, rejected, withdrawn"),
    search: Optional[str] = Query(default=None, description="Search by project name, challenge, or message"),
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.get_industry_partnerships(str(user_id), status_filter, search)


@router.put(
    "/partnerships/{partnership_id}/withdraw",
    response_model=IndustryPartnershipResponse,
    status_code=status.HTTP_200_OK,
    summary="Withdraw a pending partnership request",
    description="Withdraws a previously submitted partnership expression of interest.",
)
def withdraw_partnership_endpoint(
    partnership_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.withdraw_partnership(str(user_id), partnership_id)


# =============================================================================
# 7D: INDUSTRY EXPERTS ENDPOINTS
# =============================================================================

@router.post(
    "/experts",
    response_model=IndustryExpertResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new industry expert / advisor",
    description="Adds a technical expert to the corporate roster of the authenticated industry organization.",
)
def create_expert_endpoint(
    data: IndustryExpertCreate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.create_expert(str(user_id), data)


@router.get(
    "/experts",
    response_model=List[IndustryExpertResponse],
    status_code=status.HTTP_200_OK,
    summary="List authenticated industry organization experts",
    description="Retrieves the technical expert roster belonging strictly to the authenticated industry user.",
)
def get_experts_endpoint(
    search: Optional[str] = Query(default=None, description="Search by expert name, designation, or expertise"),
    expertise: Optional[str] = Query(default=None, description="Filter by expertise area"),
    skills: Optional[str] = Query(default=None, description="Filter by skill tag"),
    availability: Optional[str] = Query(default=None, description="Filter by availability: available, limited, unavailable"),
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.get_experts(str(user_id), search, expertise, skills, availability)


@router.get(
    "/experts/{expert_id}",
    response_model=IndustryExpertResponse,
    status_code=status.HTTP_200_OK,
    summary="Get industry expert details",
)
def get_expert_endpoint(
    expert_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    expert = industry_service.get_expert_by_id(str(user_id), expert_id)
    if not expert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert not found.")
    return expert


@router.put(
    "/experts/{expert_id}",
    response_model=IndustryExpertResponse,
    status_code=status.HTTP_200_OK,
    summary="Update industry expert details",
)
def update_expert_endpoint(
    expert_id: str,
    data: IndustryExpertUpdate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.update_expert(str(user_id), expert_id, data)


@router.delete(
    "/experts/{expert_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an industry expert from the corporate roster",
)
def delete_expert_endpoint(
    expert_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    success = industry_service.delete_expert(str(user_id), expert_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert not found or unauthorized.")
    return None


# =============================================================================
# 7D: PROJECT MENTORSHIP ENDPOINTS (INDUSTRY PERSPECTIVE)
# =============================================================================

@router.post(
    "/projects/{project_id}/mentorships",
    response_model=ProjectMentorshipResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Propose technical mentorship for an accepted project partnership",
    description="Assigns an industry expert as a technical mentor for an accepted university project partnership.",
)
def propose_mentorship_endpoint(
    project_id: str,
    data: ProjectMentorshipCreate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.propose_mentorship(str(user_id), project_id, data)


@router.get(
    "/projects/{project_id}/mentorships",
    response_model=List[ProjectMentorshipResponse],
    status_code=status.HTTP_200_OK,
    summary="List mentorship engagements for a project",
)
def get_project_mentorships_endpoint(
    project_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.get_project_mentorships_for_industry(str(user_id), project_id)


@router.get(
    "/mentorships",
    response_model=List[ProjectMentorshipResponse],
    status_code=status.HTTP_200_OK,
    summary="List all mentorship engagements across projects",
)
def get_all_mentorships_endpoint(
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.get_all_industry_mentorships(str(user_id))


@router.put(
    "/mentorships/{mentorship_id}",
    response_model=ProjectMentorshipResponse,
    status_code=status.HTTP_200_OK,
    summary="Update mentorship status or objectives",
)
def update_mentorship_endpoint(
    mentorship_id: str,
    data: ProjectMentorshipUpdate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.update_mentorship(str(user_id), mentorship_id, data)


@router.delete(
    "/mentorships/{mentorship_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Withdraw or cancel a mentorship engagement",
)
def withdraw_mentorship_endpoint(
    mentorship_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    success = industry_service.withdraw_or_delete_mentorship(str(user_id), mentorship_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentorship not found or unauthorized.")
    return None


@router.get(
    "/dashboard/metrics",
    status_code=status.HTTP_200_OK,
    summary="Get real Industry Dashboard metrics",
)
def get_industry_dashboard_metrics_endpoint(
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.get_industry_dashboard_stats(str(user_id))


# =============================================================================
# RESOURCE & TECHNOLOGY CONTRIBUTION ENDPOINTS
# =============================================================================

@router.post(
    "/projects/{project_id}/resources",
    response_model=IndustryResourceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Propose a resource or technology contribution for a university project",
)
def create_resource_endpoint(
    project_id: str,
    data: IndustryResourceCreate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.create_resource_contribution(str(user_id), project_id, data)


@router.get(
    "/projects/{project_id}/resources",
    response_model=List[IndustryResourceResponse],
    status_code=status.HTTP_200_OK,
    summary="List resource contributions made by this industry partner for a project",
)
def get_project_resources_endpoint(
    project_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.get_project_resources_for_industry(str(user_id), project_id)


@router.put(
    "/resources/{resource_id}",
    response_model=IndustryResourceResponse,
    status_code=status.HTTP_200_OK,
    summary="Update or change status of a resource contribution",
)
def update_resource_endpoint(
    resource_id: str,
    data: IndustryResourceUpdate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.update_resource_contribution(str(user_id), resource_id, data)


@router.delete(
    "/resources/{resource_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Withdraw a resource contribution proposal",
)
def withdraw_resource_endpoint(
    resource_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    success = industry_service.delete_or_withdraw_resource(str(user_id), resource_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found or unauthorized.")
    return None


# =============================================================================
# FUNDING & SPONSORSHIP ENDPOINTS
# =============================================================================

@router.post(
    "/projects/{project_id}/funding",
    response_model=IndustryFundingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a funding or sponsorship proposal for a project",
)
def create_funding_endpoint(
    project_id: str,
    data: IndustryFundingCreate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.create_funding_proposal(str(user_id), project_id, data)


@router.get(
    "/projects/{project_id}/funding",
    response_model=List[IndustryFundingResponse],
    status_code=status.HTTP_200_OK,
    summary="List funding proposals for a project by this industry partner",
)
def get_project_funding_endpoint(
    project_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.get_project_funding_for_industry(str(user_id), project_id)


@router.put(
    "/funding/{funding_id}",
    response_model=IndustryFundingResponse,
    status_code=status.HTTP_200_OK,
    summary="Update or withdraw a funding proposal",
)
def update_funding_endpoint(
    funding_id: str,
    data: IndustryFundingUpdate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.update_funding_proposal(str(user_id), funding_id, data)


@router.delete(
    "/funding/{funding_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Withdraw a funding proposal",
)
def withdraw_funding_endpoint(
    funding_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    success = industry_service.delete_or_withdraw_funding(str(user_id), funding_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Funding proposal not found or unauthorized.")
    return None


# =============================================================================
# COLLABORATION SUMMARY ENDPOINT
# =============================================================================

@router.get(
    "/projects/{project_id}/collaboration-summary",
    response_model=IndustryCollaborationSummary,
    status_code=status.HTTP_200_OK,
    summary="Get integrated collaboration summary for a project workspace",
)
def get_collaboration_summary_endpoint(
    project_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.INDUSTRY)),
):
    user_id = current_user.get("id")
    return industry_service.get_collaboration_summary(str(user_id), project_id)



