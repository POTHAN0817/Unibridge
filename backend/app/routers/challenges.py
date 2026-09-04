from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user, require_role
from app.schemas.auth import UserRole
from app.schemas.challenge import ChallengeCreate, ChallengeResponse
from app.services import challenge_service

router = APIRouter()


@router.post(
    "",
    response_model=ChallengeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report a new civic challenge",
    description="Allows authenticated citizens to report a societal problem in their community.",
)
def create_challenge_endpoint(
    challenge_in: ChallengeCreate,
    current_user: dict[str, Any] = Depends(require_role(UserRole.CITIZEN)),
):
    """
    Creates a new challenge associated strictly with the authenticated citizen.
    Status is automatically initialized to 'submitted'.
    """
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification in authentication credentials.",
        )

    new_challenge = challenge_service.create_challenge(challenge_in, user_id=str(user_id))
    return new_challenge


@router.get(
    "/my",
    response_model=List[ChallengeResponse],
    summary="Get challenges submitted by the logged-in citizen",
    description="Returns all challenges created by the authenticated citizen, ordered newest first.",
)
def get_my_challenges_endpoint(
    current_user: dict[str, Any] = Depends(require_role(UserRole.CITIZEN)),
):
    """
    Retrieves challenges reported by the current citizen.
    """
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification in authentication credentials.",
        )

    return challenge_service.get_challenges_by_reporter(str(user_id))


@router.get(
    "/{challenge_id}",
    response_model=ChallengeResponse,
    summary="Get challenge details by ID",
    description="Fetches a challenge by ID. Citizens can only view their own private reports.",
)
def get_challenge_by_id_endpoint(
    challenge_id: str,
    current_user: dict[str, Any] = Depends(get_current_user),
):
    """
    Fetch a specific challenge by its unique identifier.
    Enforces ownership isolation so citizens cannot inspect another citizen's private challenge.
    """
    challenge = challenge_service.get_challenge_by_id(challenge_id)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found.",
        )

    # Ownership enforcement for citizens
    user_role = current_user.get("role")
    user_id = str(current_user.get("id"))
    if user_role == UserRole.CITIZEN.value and challenge.get("reported_by") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You cannot view another citizen's private challenge.",
        )

    return challenge
