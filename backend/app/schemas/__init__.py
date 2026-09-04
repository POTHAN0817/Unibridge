from app.schemas.auth import (
    UserRole,
    CitizenRegisterRequest,
    UniversityRegisterRequest,
    IndustryRegisterRequest,
    GovernmentRegisterRequest,
    LoginRequest,
    UserProfileResponse,
    AuthResponse,
    LogoutResponse,
)
from app.schemas.challenge import (
    ChallengeLocation,
    ChallengeCreate,
    ChallengeResponse,
)

__all__ = [
    "UserRole",
    "CitizenRegisterRequest",
    "UniversityRegisterRequest",
    "IndustryRegisterRequest",
    "GovernmentRegisterRequest",
    "LoginRequest",
    "UserProfileResponse",
    "AuthResponse",
    "LogoutResponse",
    "ChallengeLocation",
    "ChallengeCreate",
    "ChallengeResponse",
]

