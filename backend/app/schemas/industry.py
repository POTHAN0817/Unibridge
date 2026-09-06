from datetime import datetime, timezone
from typing import Any, List, Optional, Literal
from pydantic import BaseModel, Field, EmailStr


class IndustryProfileCreate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=200, description="Company or corporate entity name")
    short_name: Optional[str] = Field(default=None, max_length=50)
    description: Optional[str] = Field(default=None, max_length=5000)
    website: Optional[str] = Field(default=None, max_length=250)
    industry_sector: str = Field(..., min_length=2, max_length=150)
    sub_sectors: List[str] = Field(default_factory=list)
    headquarters_location: Optional[str] = Field(default=None, max_length=250)
    operating_locations: List[str] = Field(default_factory=list)
    expertise: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    capabilities: List[str] = Field(default_factory=list)
    infrastructure: List[str] = Field(default_factory=list)
    resources_available: List[str] = Field(default_factory=list)
    research_interests: List[str] = Field(default_factory=list)
    collaboration_interests: List[str] = Field(default_factory=list)
    funding_capacity: Optional[str] = Field(default=None, max_length=150)
    mentorship_capacity: Optional[str] = Field(default=None, max_length=150)
    availability: str = Field(default="available", max_length=50)


class IndustryProfileUpdate(BaseModel):
    company_name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    short_name: Optional[str] = Field(default=None, max_length=50)
    description: Optional[str] = Field(default=None, max_length=5000)
    website: Optional[str] = Field(default=None, max_length=250)
    industry_sector: Optional[str] = Field(default=None, min_length=2, max_length=150)
    sub_sectors: Optional[List[str]] = None
    headquarters_location: Optional[str] = Field(default=None, max_length=250)
    operating_locations: Optional[List[str]] = None
    expertise: Optional[List[str]] = None
    technologies: Optional[List[str]] = None
    capabilities: Optional[List[str]] = None
    infrastructure: Optional[List[str]] = None
    resources_available: Optional[List[str]] = None
    research_interests: Optional[List[str]] = None
    collaboration_interests: Optional[List[str]] = None
    funding_capacity: Optional[str] = Field(default=None, max_length=150)
    mentorship_capacity: Optional[str] = Field(default=None, max_length=150)
    availability: Optional[str] = Field(default=None, max_length=50)


class IndustryProfileResponse(BaseModel):
    id: str
    user_id: str
    company_name: str
    short_name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    industry_sector: str
    sub_sectors: List[str] = Field(default_factory=list)
    headquarters_location: Optional[str] = None
    operating_locations: List[str] = Field(default_factory=list)
    expertise: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    capabilities: List[str] = Field(default_factory=list)
    infrastructure: List[str] = Field(default_factory=list)
    resources_available: List[str] = Field(default_factory=list)
    research_interests: List[str] = Field(default_factory=list)
    collaboration_interests: List[str] = Field(default_factory=list)
    funding_capacity: Optional[str] = None
    mentorship_capacity: Optional[str] = None
    availability: str = "available"
    created_at: str
    updated_at: str


# =============================================================================
# INDUSTRY PROJECT DISCOVERY SCHEMAS (STEP 7B)
# =============================================================================

class IndustryDiscoveredProjectSummary(BaseModel):
    project_id: str
    project_name: str
    description: Optional[str] = None
    project_status: str
    challenge_id: str
    challenge_title: str
    challenge_category: str
    challenge_subcategory: Optional[str] = None
    challenge_location: Optional[str] = None
    university_id: str
    university_name: str
    team_name: str
    faculty_count: int = 0
    student_count: int = 0
    project_start_date: Optional[str] = None
    target_date: Optional[str] = None


class IndustryDiscoveredProjectsPage(BaseModel):
    items: List[IndustryDiscoveredProjectSummary]
    total: int
    page: int
    limit: int
    total_pages: int


class IndustryProjectMilestoneSummary(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    due_date: Optional[str] = None
    completed_at: Optional[str] = None


class IndustryProjectSolutionSummary(BaseModel):
    title: str
    problem_statement: str
    proposed_solution: str
    technical_approach: Optional[str] = None
    expected_outcomes: Optional[str] = None
    status: str


class IndustryProjectPrototypeSummary(BaseModel):
    id: str
    version: str
    title: str
    description: Optional[str] = None
    status: str
    artifact_url: Optional[str] = None
    artifact_type: Optional[str] = None


class IndustryProjectPilotSummary(BaseModel):
    id: str
    title: str
    location: str
    objectives: str
    status: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    observations: Optional[str] = None
    results: Optional[str] = None


class IndustryDiscoveredProjectDetail(BaseModel):
    project_id: str
    project_name: str
    description: Optional[str] = None
    project_status: str
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    # Linked Challenge (sanitized)
    challenge_id: str
    challenge_title: str
    challenge_description: Optional[str] = None
    challenge_category: str
    challenge_subcategory: Optional[str] = None
    challenge_location: Optional[str] = None
    challenge_urgency: Optional[str] = None

    # University & Team (sanitized)
    university_id: str
    university_name: str
    team_name: str
    faculty_count: int = 0
    student_count: int = 0

    # Progress & Milestones
    milestone_progress: int = 0
    milestones_count: int = 0
    completed_milestones_count: int = 0
    milestones: List[IndustryProjectMilestoneSummary] = Field(default_factory=list)

    # Discovered Solution Proposal (if any)
    solution: Optional[IndustryProjectSolutionSummary] = None

    # Discovered Prototypes & Pilots
    prototypes: List[IndustryProjectPrototypeSummary] = Field(default_factory=list)
    pilots: List[IndustryProjectPilotSummary] = Field(default_factory=list)


# =============================================================================
# 7C: INDUSTRY PARTNERSHIP SCHEMAS
# =============================================================================

class PartnershipInterestCreate(BaseModel):
    message: Optional[str] = None


class IndustryPartnershipResponse(BaseModel):
    id: str
    industry_user_id: str
    project_id: str
    university_id: str
    status: Literal["pending", "accepted", "rejected", "withdrawn"]
    message: Optional[str] = None
    created_at: str
    updated_at: str

    # Contextual display fields for industry side
    project_name: Optional[str] = None
    university_name: Optional[str] = None
    challenge_title: Optional[str] = None
    challenge_category: Optional[str] = None


class UniversityPartnershipItem(BaseModel):
    id: str
    industry_user_id: str
    project_id: str
    university_id: str
    status: Literal["pending", "accepted", "rejected", "withdrawn"]
    message: Optional[str] = None
    created_at: str
    updated_at: str

    # Enriched sanitized industry profile details for university review
    company_name: str
    short_name: Optional[str] = None
    industry_sector: str
    sub_sectors: List[str] = Field(default_factory=list)
    expertise: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    capabilities: List[str] = Field(default_factory=list)
    collaboration_interests: List[str] = Field(default_factory=list)
    headquarters_location: Optional[str] = None
    website: Optional[str] = None


# =============================================================================
# 7D: INDUSTRY EXPERT & MENTORSHIP SCHEMAS
# =============================================================================

class IndustryExpertCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    designation: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    expertise: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    domain_areas: List[str] = Field(default_factory=list)
    availability: str = Field(default="available", max_length=50)


class IndustryExpertUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    designation: Optional[str] = Field(default=None, min_length=2, max_length=150)
    email: Optional[EmailStr] = None
    expertise: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    domain_areas: Optional[List[str]] = None
    availability: Optional[str] = None


class IndustryExpertResponse(BaseModel):
    id: str
    industry_user_id: str
    name: str
    designation: str
    email: str
    expertise: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    domain_areas: List[str] = Field(default_factory=list)
    availability: str
    created_at: str
    updated_at: str


class ProjectMentorshipCreate(BaseModel):
    expert_id: str
    focus_areas: List[str] = Field(default_factory=list)
    objectives: str = Field(..., min_length=5, max_length=2000)


class ProjectMentorshipUpdate(BaseModel):
    status: Optional[Literal["proposed", "active", "completed", "withdrawn"]] = None
    focus_areas: Optional[List[str]] = None
    objectives: Optional[str] = Field(default=None, min_length=5, max_length=2000)


class ProjectMentorshipResponse(BaseModel):
    id: str
    project_id: str
    university_id: str
    industry_user_id: str
    expert_id: str
    partnership_id: str
    status: Literal["proposed", "active", "completed", "withdrawn"]
    focus_areas: List[str] = Field(default_factory=list)
    objectives: str
    created_at: str
    updated_at: str

    # Enriched context
    expert_name: Optional[str] = None
    expert_designation: Optional[str] = None
    expert_expertise: List[str] = Field(default_factory=list)
    expert_skills: List[str] = Field(default_factory=list)
    company_name: Optional[str] = None
    project_name: Optional[str] = None
    university_name: Optional[str] = None


# ============================================================================
# Resource & Technology Support Schemas
# ============================================================================
ResourceType = Literal["technology", "equipment", "software", "dataset", "infrastructure", "technical_service", "other"]
ResourceStatus = Literal["proposed", "approved", "rejected", "provided", "withdrawn"]


class IndustryResourceCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    resource_type: ResourceType
    description: str = Field(..., min_length=5, max_length=2000)
    quantity_or_scope: Optional[str] = Field(default=None, max_length=500)


class IndustryResourceUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    resource_type: Optional[ResourceType] = None
    description: Optional[str] = Field(default=None, min_length=5, max_length=2000)
    quantity_or_scope: Optional[str] = Field(default=None, max_length=500)
    status: Optional[ResourceStatus] = None


class IndustryResourceResponse(BaseModel):
    id: str
    project_id: str
    university_id: str
    industry_user_id: str
    partnership_id: str
    title: str
    resource_type: str
    description: str
    quantity_or_scope: Optional[str] = None
    status: str
    provided_at: Optional[str] = None
    created_at: str
    updated_at: str

    # Context
    company_name: Optional[str] = None
    industry_sector: Optional[str] = None
    project_name: Optional[str] = None
    university_name: Optional[str] = None


# ============================================================================
# Funding / Sponsorship Proposals Schemas
# ============================================================================
FundingType = Literal["sponsorship", "grant", "project_support", "csr", "other"]
FundingStatus = Literal["proposed", "approved", "rejected", "withdrawn", "disbursed"]


class IndustryFundingCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=5, max_length=2000)
    amount: float = Field(..., gt=0)
    currency: str = Field(default="INR", max_length=10)
    funding_type: FundingType


class IndustryFundingUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, min_length=5, max_length=2000)
    amount: Optional[float] = Field(default=None, gt=0)
    currency: Optional[str] = Field(default=None, max_length=10)
    funding_type: Optional[FundingType] = None
    status: Optional[FundingStatus] = None


class IndustryFundingResponse(BaseModel):
    id: str
    project_id: str
    university_id: str
    industry_user_id: str
    partnership_id: str
    title: str
    description: str
    amount: float
    currency: str
    funding_type: str
    status: str
    proposed_at: str
    updated_at: str

    # Context
    company_name: Optional[str] = None
    industry_sector: Optional[str] = None
    project_name: Optional[str] = None
    university_name: Optional[str] = None


# ============================================================================
# Collaboration Summary & Metrics
# ============================================================================
class IndustryCollaborationSummary(BaseModel):
    project_id: str
    project_name: str
    university_id: str
    university_name: str
    project_status: str
    partnership_status: str
    assigned_mentors_count: int
    resources_count: int
    funding_proposals_count: int


class IndustryDashboardMetrics(BaseModel):
    discovered_projects: int
    pending_partnerships: int
    active_partnerships: int
    active_mentorships: int
    supported_projects: int
    resources_contributed: int = 0
    funding_proposals: int = 0
    active_collaborations: int = 0


