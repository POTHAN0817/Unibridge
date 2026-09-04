from typing import Any, Callable, List, Union
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.schemas.auth import UserRole
from app.services.auth_service import decode_access_token, get_user_by_id, serialize_user


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
    auto_error=False,
)


def get_current_user(token: Union[str, None] = Depends(oauth2_scheme)) -> dict[str, Any]:
    """
    FastAPI dependency to extract and validate the JWT Bearer token,
    and retrieve the active user from the database.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently inactive.",
        )

    return serialize_user(user)


def require_role(allowed_role: Union[UserRole, str]) -> Callable:
    """
    Dependency factory to enforce single-role access on protected endpoints.
    Example:
        @router.post("/citizen/challenge")
        def create_challenge(user: dict = Depends(require_role(UserRole.CITIZEN))):
            ...
    """
    role_value = allowed_role.value if isinstance(allowed_role, UserRole) else str(allowed_role)

    def role_checker(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
        if current_user.get("role") != role_value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: This action requires the '{role_value}' role.",
            )
        return current_user

    return role_checker


def require_roles(allowed_roles: List[Union[UserRole, str]]) -> Callable:
    """
    Dependency factory to enforce multi-role access on protected endpoints.
    """
    role_values = {r.value if isinstance(r, UserRole) else str(r) for r in allowed_roles}

    def roles_checker(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
        if current_user.get("role") not in role_values:
            roles_str = ", ".join(sorted(role_values))
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: This action requires one of the following roles: {roles_str}.",
            )
        return current_user

    return roles_checker
