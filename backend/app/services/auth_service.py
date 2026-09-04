from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.database.mongodb import get_users_collection
from app.schemas.auth import (
    CitizenRegisterRequest,
    GovernmentRegisterRequest,
    IndustryRegisterRequest,
    UniversityRegisterRequest,
    UserRole,
)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    user_id: str,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Generate a signed JWT token containing user id ('sub'), role, and expiration.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.jwt_access_token_expire_minutes)

    to_encode: dict[str, Any] = {
        "sub": str(user_id),
        "role": str(role),
        "iat": now,
        "exp": expire,
    }

    return jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.
    Raises HTTPException(401) on invalid or expired token.
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject claim.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def serialize_user(user_doc: dict[str, Any]) -> dict[str, Any]:
    """
    Safely serialize a MongoDB user document into an API response dict.
    Guarantees password_hash and raw internal fields are never exposed.
    """
    return {
        "id": str(user_doc["_id"]),
        "email": user_doc["email"],
        "role": user_doc["role"],
        "profile": user_doc.get("profile", {}),
        "is_active": user_doc.get("is_active", True),
        "created_at": user_doc.get("created_at"),
    }


def _create_user(email: str, password: str, role: UserRole, profile: dict[str, Any]) -> dict[str, Any]:
    """
    Shared internal registration logic across all role types.
    Ensures email uniqueness, hashes password, saves to MongoDB, and returns JWT + user.
    """
    users = get_users_collection()
    normalized_email = email.strip().lower()

    # Pre-check email existence for immediate friendly 409 conflict
    existing_user = users.find_one({"email": normalized_email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    now = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "email": normalized_email,
        "password_hash": hash_password(password),
        "role": role.value,
        "profile": profile,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    access_token = create_access_token(
        user_id=str(user_doc["_id"]),
        role=role.value,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": serialize_user(user_doc),
    }


def register_citizen(data: CitizenRegisterRequest) -> dict[str, Any]:
    profile = {
        "full_name": data.full_name.strip(),
        "phone": data.phone.strip(),
        "state": data.state.strip(),
        "district": data.district.strip(),
    }
    return _create_user(
        email=data.email,
        password=data.password,
        role=UserRole.CITIZEN,
        profile=profile,
    )


def register_university(data: UniversityRegisterRequest) -> dict[str, Any]:
    profile = {
        "university_name": data.university_name.strip(),
        "contact_person": data.contact_person.strip(),
        "designation": data.designation.strip(),
        "state": data.state.strip(),
        "district": data.district.strip(),
        "expertise": data.expertise,
    }
    return _create_user(
        email=data.university_email,
        password=data.password,
        role=UserRole.UNIVERSITY,
        profile=profile,
    )


def register_industry(data: IndustryRegisterRequest) -> dict[str, Any]:
    profile = {
        "company_name": data.company_name.strip(),
        "contact_person": data.contact_person.strip(),
        "designation": data.designation.strip(),
        "industry_sector": data.industry_sector.strip(),
        "location": data.location.strip(),
        "expertise": data.expertise,
        "support_capabilities": data.support_capabilities,
    }
    return _create_user(
        email=data.official_email,
        password=data.password,
        role=UserRole.INDUSTRY,
        profile=profile,
    )


def register_government(data: GovernmentRegisterRequest) -> dict[str, Any]:
    profile = {
        "department_name": data.department_name.strip(),
        "officer_name": data.officer_name.strip(),
        "designation": data.designation.strip(),
        "state": data.state.strip(),
        "district": data.district.strip(),
        "department_type": data.department_type.strip(),
    }
    return _create_user(
        email=data.official_email,
        password=data.password,
        role=UserRole.GOVERNMENT,
        profile=profile,
    )


def authenticate_user(email: str, password: str, role: UserRole) -> dict[str, Any]:
    """
    Authenticate email, password, and requested role.
    Returns access token and serialized user on success.
    """
    users = get_users_collection()
    normalized_email = email.strip().lower()

    user = users.find_one({"email": normalized_email})

    # Generic 401 response prevents user enumeration
    if not user or user.get("role") != role.value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently inactive.",
        )

    access_token = create_access_token(
        user_id=str(user["_id"]),
        role=user["role"],
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": serialize_user(user),
    }


def get_user_by_id(user_id: str) -> Optional[dict[str, Any]]:
    """Retrieve user from MongoDB by string ID or ObjectId."""
    if not ObjectId.is_valid(user_id):
        return None
    users = get_users_collection()
    return users.find_one({"_id": ObjectId(user_id)})
