from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import require_role
from app.schemas.auth import UserRole
from app.schemas.government import (
    GovernmentChallengeDetail,
    GovernmentChallengeReviewCreate,
    GovernmentChallengeReviewResponse,
    GovernmentChallengeReviewUpdate,
    GovernmentChallengesPage,
    GovernmentDashboardMetrics,
    GovernmentProfileCreate,
    GovernmentProfileResponse,
    GovernmentProfileUpdate,
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
