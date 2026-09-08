from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import require_role
from app.schemas.auth import UserRole
from app.schemas.government import (
    GovernmentActionCreate,
    GovernmentActionResponse,
    GovernmentActionsPage,
    GovernmentActionUpdate,
    GovernmentAnalyticsResponse,
    GovernmentChallengeDetail,
    GovernmentChallengeReviewCreate,
    GovernmentChallengeReviewResponse,
    GovernmentChallengeReviewUpdate,
    GovernmentChallengesPage,
    GovernmentCollaborationDetail,
    GovernmentCollaborationsPage,
    GovernmentDashboardMetrics,
    GovernmentDeploymentItem,
    GovernmentDeploymentsPage,
    GovernmentLifecycleMonitoringSummary,
    GovernmentPilotItem,
    GovernmentPilotsPage,
    GovernmentProfileCreate,
    GovernmentProfileResponse,
    GovernmentProfileUpdate,
    GovernmentProjectDossier,
    GovernmentProjectsPage,
    PlatformActivityItem,
)
from app.services import government_service

router = APIRouter(
    prefix="/government",
    tags=["government"],
    dependencies=[Depends(require_role(UserRole.GOVERNMENT))],
)


@router.get("/profile", response_model=GovernmentProfileResponse)
async def get_profile(current_user: dict = Depends(require_role(UserRole.GOVERNMENT))):
    """Retrieve government profile for the authenticated government official."""
    profile = government_service.get_government_profile(current_user["id"])
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government profile not found. Please set up your official profile.",
        )
    return profile


@router.post("/profile", response_model=GovernmentProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    data: GovernmentProfileCreate,
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """Create a new government profile for the authenticated government official."""
    return government_service.create_government_profile(current_user["id"], data)


@router.put("/profile", response_model=GovernmentProfileResponse)
async def update_profile(
    data: GovernmentProfileUpdate,
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """Update existing government profile for the authenticated government official."""
    return government_service.update_government_profile(current_user["id"], data)


@router.get("/dashboard/metrics", response_model=GovernmentDashboardMetrics)
async def get_dashboard_metrics(current_user: dict = Depends(require_role(UserRole.GOVERNMENT))):
    """
    Retrieve real platform oversight metrics aggregated from MongoDB collections.
    """
    return government_service.get_dashboard_metrics()


@router.get("/dashboard/activity", response_model=List[PlatformActivityItem])
async def get_dashboard_activity(current_user: dict = Depends(require_role(UserRole.GOVERNMENT))):
    """
    Retrieve real platform activity records from project_activity collection.
    """
    return government_service.get_recent_platform_activity()


# ============================================================================
# Step 8B: Challenge Monitoring & Review Endpoints
# ============================================================================

@router.get("/challenges", response_model=GovernmentChallengesPage)
async def list_challenges(
    search: Optional[str] = Query(None, description="Search keyword in title or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    priority_level: Optional[str] = Query(None, description="Filter by priority level"),
    government_review_status: Optional[str] = Query(None, description="pending, validated, rejected, clarification_required"),
    ai_status: Optional[str] = Query(None, description="Filter by AI processing status"),
    duplicate_status: Optional[str] = Query(None, description="Filter by duplicate status"),
    challenge_status: Optional[str] = Query(None, description="Filter by challenge lifecycle status"),
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    List, filter, and paginate societal challenges for government oversight.
    All data is directly loaded from MongoDB.
    """
    return government_service.get_challenges(
        search=search,
        category=category,
        priority_level=priority_level,
        government_review_status=government_review_status,
        ai_status=ai_status,
        duplicate_status=duplicate_status,
        challenge_status=challenge_status,
        state=state,
        district=district,
        page=page,
        limit=limit,
        government_user_id=current_user["id"],
    )


@router.get("/challenges/{challenge_id}", response_model=GovernmentChallengeDetail)
async def get_challenge_detail(
    challenge_id: str,
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    Retrieve full challenge dossier for government review.
    Safely hides citizen private personal data.
    """
    return government_service.get_challenge_detail(challenge_id, current_user["id"])


@router.get("/challenges/{challenge_id}/review", response_model=Optional[GovernmentChallengeReviewResponse])
async def get_challenge_review(
    challenge_id: str,
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    Retrieve the authenticated government official's review for this challenge.
    """
    review = government_service.get_challenge_review(challenge_id, current_user["id"])
    if not review:
        return None
    return review


@router.post(
    "/challenges/{challenge_id}/review",
    response_model=GovernmentChallengeReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_challenge_review(
    challenge_id: str,
    data: GovernmentChallengeReviewCreate,
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    Record an official Government validation decision for this challenge.
    Source of government_user_id is the verified JWT token.
    """
    return government_service.create_challenge_review(challenge_id, current_user["id"], data)


@router.put("/challenges/{challenge_id}/review", response_model=GovernmentChallengeReviewResponse)
async def update_challenge_review(
    challenge_id: str,
    data: GovernmentChallengeReviewUpdate,
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    Update the authenticated government official's existing review.
    Cross-user editing is strictly forbidden.
    """
    return government_service.update_challenge_review(challenge_id, current_user["id"], data)


# ============================================================================
# Step 8H: Dashboard Priorities / Attention
# ============================================================================

@router.get("/dashboard/priorities", response_model=dict)
async def get_dashboard_priorities(current_user: dict = Depends(require_role(UserRole.GOVERNMENT))):
    """
    Retrieve prioritized items requiring Government attention across challenges, actions, and pilots.
    """
    return government_service.get_government_priorities(current_user["id"])


# ============================================================================
# Step 8C: University Project Monitoring Endpoints
# ============================================================================

@router.get("/projects", response_model=GovernmentProjectsPage)
async def list_projects(
    search: Optional[str] = Query(None, description="Search keyword in project title or description"),
    category: Optional[str] = Query(None, description="Filter by challenge category"),
    project_status: Optional[str] = Query(None, description="planning, research, solution_proposed, prototype, pilot, deployment, completed, archived"),
    lifecycle_stage: Optional[str] = Query(None, description="Lifecycle stage filter"),
    university: Optional[str] = Query(None, description="Filter by university ID or name"),
    challenge: Optional[str] = Query(None, description="Filter by linked challenge ID"),
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    List, filter, and paginate University projects for Government oversight.
    All data is directly loaded from MongoDB source collections.
    """
    return government_service.get_projects(
        search=search,
        category=category,
        project_status=project_status,
        lifecycle_stage=lifecycle_stage,
        university=university,
        challenge=challenge,
        state=state,
        district=district,
        page=page,
        limit=limit,
    )


@router.get("/projects/{project_id}", response_model=GovernmentProjectDossier)
async def get_project_dossier(
    project_id: str,
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    Retrieve complete 12-section administrative project dossier.
    Completely read-only; no editing controls on University-owned data.
    """
    return government_service.get_project_dossier(project_id)


# ============================================================================
# Step 8D: Industry Collaboration Monitoring Endpoints
# ============================================================================

@router.get("/collaborations", response_model=GovernmentCollaborationsPage)
async def list_collaborations(
    search: Optional[str] = Query(None, description="Search keyword in company name or project name"),
    status: Optional[str] = Query(None, description="pending, accepted, rejected, withdrawn"),
    university: Optional[str] = Query(None, description="Filter by university ID"),
    industry: Optional[str] = Query(None, description="Filter by industry user ID"),
    project: Optional[str] = Query(None, description="Filter by project ID"),
    category: Optional[str] = Query(None, description="Filter by challenge category"),
    collaboration_type: Optional[str] = Query(None, description="Filter by collaboration type"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    List, filter, and paginate Industry-University partnerships.
    Zero private authentication secrets or tokens exposed.
    """
    return government_service.get_collaborations(
        search=search,
        status=status,
        university=university,
        industry=industry,
        project=project,
        category=category,
        collaboration_type=collaboration_type,
        page=page,
        limit=limit,
    )


@router.get("/collaborations/{partnership_id}", response_model=GovernmentCollaborationDetail)
async def get_collaboration_detail(
    partnership_id: str,
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    Comprehensive read-only collaboration detail view.
    """
    return government_service.get_collaboration_detail(partnership_id)


# ============================================================================
# Step 8E: Pilot & Deployment Oversight Endpoints
# ============================================================================

@router.get("/monitoring", response_model=GovernmentLifecycleMonitoringSummary)
async def get_monitoring_summary(current_user: dict = Depends(require_role(UserRole.GOVERNMENT))):
    """
    Return real project lifecycle monitoring summaries across all stages.
    """
    return government_service.get_monitoring_summary()


@router.get("/pilots", response_model=GovernmentPilotsPage)
async def list_pilots(
    project: Optional[str] = Query(None, description="Filter by project ID"),
    university: Optional[str] = Query(None, description="Filter by university ID"),
    status: Optional[str] = Query(None, description="planned, preparation, active, completed, paused, cancelled"),
    category: Optional[str] = Query(None, description="Filter by challenge category"),
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    List, filter, and paginate real engineering pilot records from project_pilots.
    """
    return government_service.get_pilots(
        project=project,
        university=university,
        status=status,
        category=category,
        state=state,
        district=district,
        page=page,
        limit=limit,
    )


@router.get("/deployments", response_model=GovernmentDeploymentsPage)
async def list_deployments(
    status: Optional[str] = Query(None, description="not_ready, assessment, ready_for_deployment, deployment_in_progress, deployed"),
    university: Optional[str] = Query(None, description="Filter by university ID"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    List, filter, and paginate real deployment readiness records.
    """
    return government_service.get_deployments(
        status=status,
        university=university,
        page=page,
        limit=limit,
    )


# ============================================================================
# Step 8F: Regional & Category Analytics Endpoint
# ============================================================================

@router.get("/analytics", response_model=GovernmentAnalyticsResponse)
async def get_analytics(current_user: dict = Depends(require_role(UserRole.GOVERNMENT))):
    """
    Administrative analytics derived purely from MongoDB aggregation pipelines.
    Zero synthetic statistics or fabricated percentages.
    """
    return government_service.get_analytics()


# ============================================================================
# Step 8G: Government Actions & Decisions Endpoints
# ============================================================================

@router.post("/actions", response_model=GovernmentActionResponse, status_code=status.HTTP_201_CREATED)
async def create_action(
    data: GovernmentActionCreate,
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    Create a new Government Action.
    Validates target existence before creating. Does not mutate the target object.
    Enforces user isolation and writes real audit trail to government_activity.
    """
    return government_service.create_government_action(current_user["id"], data)


@router.get("/actions", response_model=GovernmentActionsPage)
async def list_actions(
    status: Optional[str] = Query(None, description="Filter by status: open, in_progress, completed, cancelled"),
    priority: Optional[str] = Query(None, description="Filter by priority: low, medium, high, critical"),
    action_type: Optional[str] = Query(None, description="Filter by action type"),
    target_type: Optional[str] = Query(None, description="challenge, project, partnership, pilot, deployment"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    List, filter, and paginate Government actions owned strictly by authenticated official.
    """
    return government_service.get_government_actions(
        government_user_id=current_user["id"],
        status=status,
        priority=priority,
        action_type=action_type,
        target_type=target_type,
        page=page,
        limit=limit,
    )


@router.get("/actions/{action_id}", response_model=GovernmentActionResponse)
async def get_action_detail(
    action_id: str,
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    Retrieve details of a specific Government Action.
    Cross-user access is strictly forbidden.
    """
    return government_service.get_government_action_detail(action_id, current_user["id"])


@router.put("/actions/{action_id}", response_model=GovernmentActionResponse)
async def update_action(
    action_id: str,
    data: GovernmentActionUpdate,
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    Update an existing Government Action.
    Cross-user editing is strictly forbidden. Writes audit log.
    """
    return government_service.update_government_action(action_id, current_user["id"], data)


@router.delete("/actions/{action_id}", response_model=dict)
async def delete_action(
    action_id: str,
    current_user: dict = Depends(require_role(UserRole.GOVERNMENT)),
):
    """
    Delete a Government Action.
    Cross-user deletion is strictly forbidden. Writes audit log.
    """
    return government_service.delete_government_action(action_id, current_user["id"])

