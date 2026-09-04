from typing import Any
from fastapi import APIRouter, Depends, status

from app.dependencies import get_current_user
from app.schemas.auth import (
    AuthResponse,
    CitizenRegisterRequest,
    GovernmentRegisterRequest,
    IndustryRegisterRequest,
    LoginRequest,
    LogoutResponse,
    UniversityRegisterRequest,
    UserProfileResponse,
)
from app.services.auth_service import (
    authenticate_user,
    register_citizen,
    register_government,
    register_industry,
    register_university,
)


router = APIRouter()


@router.post(
    "/register/citizen",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Citizen",
    description="Registers a new citizen user account and returns an access token with profile info.",
)
def api_register_citizen(request: CitizenRegisterRequest) -> Any:
    return register_citizen(request)


@router.post(
    "/register/university",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register University Institution",
    description="Registers a new university/academic entity with faculty lead and research expertise.",
)
def api_register_university(request: UniversityRegisterRequest) -> Any:
    return register_university(request)


@router.post(
    "/register/industry",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Industry Partner",
    description="Registers a new corporate/industry partner with R&D capabilities and sector details.",
)
def api_register_industry(request: IndustryRegisterRequest) -> Any:
    return register_industry(request)


@router.post(
    "/register/government",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Government Official",
    description="Registers a government nodal department or administrative officer.",
)
def api_register_government(request: GovernmentRegisterRequest) -> Any:
    return register_government(request)


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="User Login",
    description="Authenticates credentials (email, password, and expected role) and returns a signed JWT access token.",
)
def api_login(request: LoginRequest) -> Any:
    return authenticate_user(
        email=request.email,
        password=request.password,
        role=request.role,
    )


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get Current Authenticated User",
    description="Validates Bearer token in the Authorization header and returns the current user profile.",
)
def api_get_me(current_user: dict[str, Any] = Depends(get_current_user)) -> Any:
    return current_user


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="User Logout",
    description=(
        "Stateless token logout endpoint. Because JWTs are stateless, the frontend removes "
        "the client-side token upon calling this endpoint. Server-side token blacklisting can "
        "be integrated here in future phases."
    ),
)
def api_logout() -> Any:
    return LogoutResponse(message="Logged out successfully.")
