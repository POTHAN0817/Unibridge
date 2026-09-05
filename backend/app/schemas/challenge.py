from typing import Any, Optional
from pydantic import BaseModel, Field


class ChallengeLocation(BaseModel):
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None


class ChallengeImage(BaseModel):
    url: str
    public_id: str
    format: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None


class ChallengeCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=250, description="Title of the challenge")
    description: str = Field(..., min_length=10, max_length=5000, description="Detailed problem description")
    category: Optional[str] = Field(default=None, max_length=100)
    subcategory: Optional[str] = Field(default=None, max_length=100)
    location: Optional[ChallengeLocation] = None
    affected_people: Optional[int] = Field(default=None, ge=0, description="Estimated number of affected citizens/families")
    urgency: Optional[str] = Field(default=None, description="Urgency level: low, medium, high")
    citizen_tags: Optional[list[str]] = None
    image: Optional[ChallengeImage] = None


class ChallengeResponse(BaseModel):
    id: str
    title: str
    description: str
    category: Optional[str] = None
    subcategory: Optional[str] = None
    location: Optional[ChallengeLocation] = None
    reported_by: str
    status: str = "submitted"
    ai_status: Optional[str] = "pending"
    affected_people: Optional[int] = None
    urgency: Optional[str] = None
    citizen_tags: Optional[list[str]] = None
    created_at: str
    updated_at: str

    # Image metadata from Cloudinary
    image: Optional[ChallengeImage] = None

    # AI & Phase 2B Analysis
    ai_analysis: Optional[dict[str, Any]] = None
    duplicate_analysis: Optional[dict[str, Any]] = None
    priority_analysis: Optional[dict[str, Any]] = None
    priority_score: Optional[float] = None
    university_matches: Optional[dict[str, Any]] = None

    # Pipeline linkage
    duplicate_of: Optional[str] = None
    matched_universities: Optional[list[str]] = None
    required_skills: Optional[list[str]] = None
    validation: Optional[dict[str, Any]] = None
    project: Optional[dict[str, Any]] = None
    impact: Optional[dict[str, Any]] = None

