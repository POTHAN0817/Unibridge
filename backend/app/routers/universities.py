import logging
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user, require_role
from app.schemas.auth import UserRole
from app.schemas.university import (
    UniversityProfileCreate,
    UniversityProfileResponse,
    UniversityMatchesResult,
)
from app.services import university_service

logger = logging.getLogger("unibridge.universities_router")
router = APIRouter()


@router.post(
    "/profile",
    response_model=UniversityProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Create or update university institutional profile",
    description="Allows authenticated university representatives to manage their institution's profile, departments, faculty, and capabilities.",
)
def save_university_profile_endpoint(
    profile_in: UniversityProfileCreate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )

    return university_service.create_or_update_profile(str(user_id), profile_in)


@router.get(
    "/profile",
    response_model=UniversityProfileResponse,
    summary="Get authenticated university's profile",
    description="Retrieves the current institution profile for the logged-in university account.",
)
def get_my_university_profile_endpoint(
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )

    profile = university_service.get_profile_by_user_id(str(user_id))
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University profile not created yet. Please complete your institutional profile setup.",
        )

    return profile


@router.get(
    "/challenges/matches",
    response_model=List[Dict[str, Any]],
    summary="Get challenges matching authenticated university's capabilities",
    description="Computes and retrieves societal challenges that match the logged-in university's registered capabilities.",
)
def get_matched_challenges_endpoint(
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )

    return university_service.get_matched_challenges_for_university(str(user_id))


@router.get(
    "/{university_id}",
    response_model=UniversityProfileResponse,
    summary="Get public university profile details by ID",
    description="Retrieves public academic details and capabilities for a university.",
)
def get_university_by_id_endpoint(
    university_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    profile = university_service.get_profile_by_id(university_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University profile not found.",
        )

    return profile
