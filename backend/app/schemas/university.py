from datetime import datetime, timezone
from typing import Any, List, Optional
from pydantic import BaseModel, Field


class UniversityLocation(BaseModel):
    city: Optional[str] = Field(default=None, max_length=100)
    state: Optional[str] = Field(default=None, max_length=100)
    country: str = Field(default="India", max_length=100)


class UniversityDepartment(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = Field(default=None, max_length=1000)
    expertise: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)


class UniversityFaculty(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    department: Optional[str] = Field(default=None, max_length=150)
    expertise: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    research_areas: List[str] = Field(default_factory=list)


class UniversityProject(BaseModel):
    title: str = Field(..., min_length=2, max_length=250)
    description: Optional[str] = Field(default=None, max_length=2000)
    domain: Optional[str] = Field(default=None, max_length=100)
    year: Optional[int] = Field(default=None, ge=1950, le=2100)


class UniversityProfileCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=250, description="Official university / institution name")
    short_name: Optional[str] = Field(default=None, max_length=50)
    description: Optional[str] = Field(default=None, max_length=5000)
    website: Optional[str] = Field(default=None, max_length=250)
    location: Optional[UniversityLocation] = None
    departments: List[UniversityDepartment] = Field(default_factory=list)
    research_areas: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    infrastructure: List[str] = Field(default_factory=list)
    previous_projects: List[UniversityProject] = Field(default_factory=list)
    faculty: List[UniversityFaculty] = Field(default_factory=list)
    student_skills: List[str] = Field(default_factory=list)
    availability: str = Field(default="available", description="available, limited, unavailable, unknown")


class UniversityProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=250)
    short_name: Optional[str] = Field(default=None, max_length=50)
    description: Optional[str] = Field(default=None, max_length=5000)
    website: Optional[str] = Field(default=None, max_length=250)
    location: Optional[UniversityLocation] = None
    departments: Optional[List[UniversityDepartment]] = None
    research_areas: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    infrastructure: Optional[List[str]] = None
    previous_projects: Optional[List[UniversityProject]] = None
    faculty: Optional[List[UniversityFaculty]] = None
    student_skills: Optional[List[str]] = None
    availability: Optional[str] = None


class UniversityProfileResponse(BaseModel):
    id: str
    name: str
    short_name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    location: Optional[UniversityLocation] = None
    departments: List[UniversityDepartment] = Field(default_factory=list)
    research_areas: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    infrastructure: List[str] = Field(default_factory=list)
    previous_projects: List[UniversityProject] = Field(default_factory=list)
    faculty: List[UniversityFaculty] = Field(default_factory=list)
    student_skills: List[str] = Field(default_factory=list)
    availability: str = "available"
    created_by: str
    created_at: str
    updated_at: str


class UniversityMatchFactors(BaseModel):
    expertise_similarity: float
    skill_match: float
    previous_project_match: float
    infrastructure_match: float
    location_relevance: float
    availability: float


class UniversityMatchCandidate(BaseModel):
    university_id: str
    university_name: str
    short_name: Optional[str] = None
    location: Optional[UniversityLocation] = None
    score: int
    level: str  # "High Match", "Good Match", "Moderate Match", "Low Match"
    factors: UniversityMatchFactors
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    matched_departments: List[str] = Field(default_factory=list)
    matched_faculty: List[str] = Field(default_factory=list)
    relevant_projects: List[str] = Field(default_factory=list)
    relevant_infrastructure: List[str] = Field(default_factory=list)
    explanation: str


class UniversityMatchesResult(BaseModel):
    status: str  # "completed", "no_candidates", "pending", "failed"
    matches: List[UniversityMatchCandidate] = Field(default_factory=list)
    model_version: str = "unibridge-university-match-v1"
    calculated_at: str
