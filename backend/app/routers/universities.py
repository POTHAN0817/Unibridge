import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user, require_role
from app.schemas.auth import UserRole
from app.schemas.university import (
    UniversityProfileCreate,
    UniversityProfileResponse,
    UniversityMatchesResult,
    UniversityInterestCreate,
    UniversityInterestResponse,
    FacultyCreate,
    FacultyUpdate,
    FacultyResponse,
    StudentCreate,
    StudentUpdate,
    StudentResponse,
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
    "/challenges/{challenge_id}",
    response_model=Dict[str, Any],
    summary="Get citizen challenge dossier and institutional match evaluation",
    description="Loads citizen challenge overview, Phase 2A AI problem analysis, Phase 2B priority & duplicate data, and institutional match calculation for the authenticated university.",
)
def get_university_challenge_details_endpoint(
    challenge_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )

    return university_service.get_challenge_details_for_university(str(user_id), challenge_id)


@router.post(
    "/challenges/{challenge_id}/interest",
    response_model=UniversityInterestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Express university interest in adopting a challenge",
    description="Records institutional interest from the authenticated university for a verified citizen challenge.",
)
def express_challenge_interest_endpoint(
    challenge_id: str,
    interest_in: UniversityInterestCreate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )

    return university_service.express_challenge_interest(
        user_id=str(user_id),
        challenge_id=challenge_id,
        message=interest_in.message,
    )


@router.get(
    "/challenges/{challenge_id}/interest",
    response_model=Optional[UniversityInterestResponse],
    summary="Get authenticated university's interest status for a challenge",
    description="Checks whether the authenticated university has already expressed interest in a specific challenge.",
)
def get_challenge_interest_endpoint(
    challenge_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )

    return university_service.get_challenge_interest(str(user_id), challenge_id)


@router.get(
    "/interests",
    response_model=List[UniversityInterestResponse],
    summary="Get all challenge interests expressed by authenticated university",
    description="Lists all adoption and interest records submitted by the logged-in university.",
)
def get_my_university_interests_endpoint(
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )

    return university_service.get_university_interests(str(user_id))


# =============================================================================
# FACULTY MANAGEMENT ENDPOINTS (Step 5A)
# =============================================================================

@router.post(
    "/faculty",
    response_model=FacultyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new faculty member",
    description="Registers a real faculty mentor/lead belonging strictly to the authenticated university.",
)
def create_faculty_endpoint(
    faculty_in: FacultyCreate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )
    return university_service.create_faculty(str(user_id), faculty_in)


@router.get(
    "/faculty",
    response_model=List[FacultyResponse],
    summary="List all faculty members for authenticated university",
    description="Returns all faculty members associated with the calling university, with optional search and department filters.",
)
def get_faculty_list_endpoint(
    search: Optional[str] = None,
    department: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )
    return university_service.get_faculty_list(str(user_id), search=search, department=department)


@router.get(
    "/faculty/{faculty_id}",
    response_model=FacultyResponse,
    summary="Get a specific faculty member by ID",
    description="Retrieves a single faculty record. Enforces ownership isolation.",
)
def get_faculty_by_id_endpoint(
    faculty_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )
    return university_service.get_faculty_by_id(str(user_id), faculty_id)


@router.put(
    "/faculty/{faculty_id}",
    response_model=FacultyResponse,
    summary="Update an existing faculty member",
    description="Updates details of a faculty member. Enforces ownership isolation and unique email protection.",
)
def update_faculty_endpoint(
    faculty_id: str,
    faculty_in: FacultyUpdate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )
    return university_service.update_faculty(str(user_id), faculty_id, faculty_in)


@router.delete(
    "/faculty/{faculty_id}",
    summary="Delete a faculty member",
    description="Removes a faculty record. Enforces ownership isolation.",
)
def delete_faculty_endpoint(
    faculty_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )
    return university_service.delete_faculty(str(user_id), faculty_id)


# =============================================================================
# STUDENT MANAGEMENT ENDPOINTS (Step 5B)
# =============================================================================

@router.get(
    "/students",
    response_model=List[StudentResponse],
    summary="List enrolled students for authenticated university",
    description="Returns students associated with the calling university, supporting search, department, skill, and availability filters.",
)
def get_student_list_endpoint(
    search: Optional[str] = None,
    department: Optional[str] = None,
    skill: Optional[str] = None,
    availability: Optional[bool] = None,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )
    return university_service.get_student_list(
        user_id=str(user_id),
        search=search,
        department=department,
        skill=skill,
        availability=availability,
    )


@router.get(
    "/students/{student_id}",
    response_model=StudentResponse,
    summary="Get a specific student by ID",
    description="Retrieves a single student record. Enforces strict university ownership.",
)
def get_student_by_id_endpoint(
    student_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )
    return university_service.get_student_by_id(str(user_id), student_id)


@router.put(
    "/students/{student_id}",
    response_model=StudentResponse,
    summary="Update student institutional information and competencies",
    description="Updates department, degree, skills, interests, and availability for a student in the calling university.",
)
def update_student_endpoint(
    student_id: str,
    student_in: StudentUpdate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )
    return university_service.update_student(str(user_id), student_id, student_in)


@router.post(
    "/students",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enroll a student to the university",
    description="Registers a student belonging strictly to the authenticated university.",
)
def create_student_endpoint(
    student_in: StudentCreate,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.UNIVERSITY)),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification.",
        )
    return university_service.create_student(str(user_id), student_in)


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
