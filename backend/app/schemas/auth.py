from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, EmailStr, Field, model_validator


class UserRole(str, Enum):
    CITIZEN = "citizen"
    UNIVERSITY = "university"
    INDUSTRY = "industry"
    GOVERNMENT = "government"


class CitizenRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=20)
    password: str = Field(..., min_length=8)
    confirm_password: str
    state: str = Field(..., min_length=2)
    district: str = Field(..., min_length=2)
    terms_accepted: bool = Field(..., description="Must accept terms and conditions")

    @model_validator(mode="after")
    def check_passwords_and_terms(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        if not self.terms_accepted:
            raise ValueError("You must accept the terms and conditions")
        return self


class UniversityRegisterRequest(BaseModel):
    university_name: str = Field(..., min_length=2, max_length=150)
    university_email: EmailStr
    contact_person: str = Field(..., min_length=2, max_length=100)
    designation: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)
    confirm_password: str
    state: str = Field(..., min_length=2)
    district: str = Field(..., min_length=2)
    expertise: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def check_passwords(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class IndustryRegisterRequest(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=150)
    official_email: EmailStr
    contact_person: str = Field(..., min_length=2, max_length=100)
    designation: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)
    confirm_password: str
    industry_sector: str = Field(..., min_length=2)
    location: str = Field(..., min_length=2)
    expertise: list[str] = Field(default_factory=list)
    support_capabilities: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def check_passwords(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class GovernmentRegisterRequest(BaseModel):
    department_name: str = Field(..., min_length=2, max_length=150)
    official_email: EmailStr
    officer_name: str = Field(..., min_length=2, max_length=100)
    designation: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)
    confirm_password: str
    state: str = Field(..., min_length=2)
    district: str = Field(..., min_length=2)
    department_type: str = Field(..., min_length=2)

    @model_validator(mode="after")
    def check_passwords(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole


class UserProfileResponse(BaseModel):
    id: str
    email: str
    role: UserRole
    profile: dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True
    created_at: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse


class LogoutResponse(BaseModel):
    message: str = "Logged out successfully."
