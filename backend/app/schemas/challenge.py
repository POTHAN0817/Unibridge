from typing import Any, Optional
from pydantic import BaseModel, Field


class ChallengeLocation(BaseModel):
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None


class ChallengeCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=250, description="Title of the challenge")
    description: str = Field(..., min_length=10, max_length=5000, description="Detailed problem description")
    category: Optional[str] = Field(default=None, max_length=100)
    subcategory: Optional[str] = Field(default=None, max_length=100)
    location: Optional[ChallengeLocation] = None


class ChallengeResponse(BaseModel):
    id: str
    title: str
    description: str
    category: Optional[str] = None
    subcategory: Optional[str] = None
    location: Optional[ChallengeLocation] = None
    reported_by: str
    status: str = "submitted"
    created_at: str
    updated_at: str

    # Extensible fields for future AI, matching, and project pipelines
    ai_analysis: Optional[dict[str, Any]] = None
    priority_score: Optional[float] = None
    duplicate_of: Optional[str] = None
    matched_universities: Optional[list[str]] = None
    required_skills: Optional[list[str]] = None
    validation: Optional[dict[str, Any]] = None
    project: Optional[dict[str, Any]] = None
    impact: Optional[dict[str, Any]] = None
