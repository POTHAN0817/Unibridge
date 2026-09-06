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


class UniversityInterestCreate(BaseModel):
    message: Optional[str] = Field(default=None, max_length=1500)


class UniversityInterestResponse(BaseModel):
    id: str
    challenge_id: str
    university_id: str
    status: str = "pending"
    message: Optional[str] = None
    created_at: str
    updated_at: str
    challenge: Optional[dict[str, Any]] = None
    university_name: Optional[str] = None


class FacultyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Full name of faculty member")
    email: str = Field(..., min_length=5, max_length=150, description="Academic or institutional email")
    designation: Optional[str] = Field(default="Faculty Lead", max_length=150)
    department: Optional[str] = Field(default=None, max_length=150)
    expertise: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    research_areas: List[str] = Field(default_factory=list)
    availability: bool = Field(default=True, description="True if available for mentorship")


class FacultyUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    email: Optional[str] = Field(default=None, min_length=5, max_length=150)
    designation: Optional[str] = Field(default=None, max_length=150)
    department: Optional[str] = Field(default=None, max_length=150)
    expertise: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    research_areas: Optional[List[str]] = None
    availability: Optional[bool] = None


class FacultyResponse(BaseModel):
    id: str
    _id: Optional[str] = None
    university_id: str
    name: str
    email: str
    designation: Optional[str] = "Faculty Lead"
    department: Optional[str] = None
    expertise: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    research_areas: List[str] = Field(default_factory=list)
    availability: bool = True
    created_at: str
    updated_at: str


class StudentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Full name of student")
    email: str = Field(..., min_length=5, max_length=150, description="Student academic or institutional email")
    department: Optional[str] = Field(default=None, max_length=150)
    degree: Optional[str] = Field(default=None, max_length=150, description="Degree or academic program")
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    availability: bool = Field(default=True, description="True if available for project cohorts")


class StudentUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    department: Optional[str] = Field(default=None, max_length=150)
    degree: Optional[str] = Field(default=None, max_length=150)
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    availability: Optional[bool] = None


class StudentResponse(BaseModel):
    id: str
    _id: Optional[str] = None
    university_id: str
    name: str
    email: str
    department: Optional[str] = None
    degree: Optional[str] = None
    program: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    availability: bool = True
    created_at: str
    updated_at: str


class TeamMemberBrief(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    degree: Optional[str] = None
    skills: List[str] = Field(default_factory=list)


class TeamCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Innovation Team / Cohort name")
    challenge_id: str = Field(..., description="Adopted challenge ID")
    faculty_member_ids: List[str] = Field(..., min_length=1, description="At least one faculty mentor ID")
    student_member_ids: List[str] = Field(..., min_length=1, description="At least one student researcher ID")
    description: Optional[str] = Field(default=None, max_length=2000)
    status: str = Field(default="active", description="forming, active, completed, archived")


class TeamUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    challenge_id: Optional[str] = None
    faculty_member_ids: Optional[List[str]] = Field(default=None, min_length=1)
    student_member_ids: Optional[List[str]] = Field(default=None, min_length=1)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[str] = None


class TeamResponse(BaseModel):
    id: str
    _id: Optional[str] = None
    university_id: str
    name: str
    challenge_id: str
    challenge_title: Optional[str] = None
    challenge_category: Optional[str] = None
    faculty_member_ids: List[str] = Field(default_factory=list)
    student_member_ids: List[str] = Field(default_factory=list)
    faculty_members: List[TeamMemberBrief] = Field(default_factory=list)
    student_members: List[TeamMemberBrief] = Field(default_factory=list)
    description: Optional[str] = None
    status: str = "active"
    created_at: str
    updated_at: str


VALID_PROJECT_STATUSES = [
    "planning",
    "research",
    "solution_proposed",
    "prototype",
    "pilot",
    "deployment",
    "completed",
    "archived",
]


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Project title")
    challenge_id: str = Field(..., description="Challenge ID")
    team_id: str = Field(..., description="Associated University Team ID")
    description: Optional[str] = Field(default=None, max_length=3000)
    status: str = Field(default="planning", description="Project status")
    start_date: Optional[str] = Field(default=None, description="Start date (YYYY-MM-DD)")
    target_date: Optional[str] = Field(default=None, description="Target deployment date (YYYY-MM-DD)")


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    description: Optional[str] = Field(default=None, max_length=3000)
    status: Optional[str] = None
    start_date: Optional[str] = None
    target_date: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    _id: Optional[str] = None
    university_id: str
    name: str
    challenge_id: str
    team_id: str
    description: Optional[str] = None
    status: str = "planning"
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    created_at: str
    updated_at: str
    challenge_title: Optional[str] = None
    challenge_category: Optional[str] = None
    team_name: Optional[str] = None
    faculty_members: List[TeamMemberBrief] = Field(default_factory=list)
    student_members: List[TeamMemberBrief] = Field(default_factory=list)
    milestone_progress: int = 0
    milestones_count: int = 0
    completed_milestones_count: int = 0


# =============================================================================
# PROJECT WORKSPACE SCHEMAS
# =============================================================================

VALID_MILESTONE_STATUSES = ["pending", "in_progress", "completed", "blocked"]


class MilestoneCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: str = Field(default="pending")
    due_date: Optional[str] = None


class MilestoneUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[str] = None
    due_date: Optional[str] = None


class MilestoneResponse(BaseModel):
    id: str
    _id: Optional[str] = None
    project_id: str
    university_id: str
    title: str
    description: Optional[str] = None
    status: str = "pending"
    due_date: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: str
    updated_at: str


class ResearchCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=3000)
    findings: Optional[str] = Field(default=None, max_length=5000)
    methodology: Optional[str] = Field(default=None, max_length=3000)
    references: List[str] = Field(default_factory=list)


class ResearchUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=3000)
    findings: Optional[str] = Field(default=None, max_length=5000)
    methodology: Optional[str] = Field(default=None, max_length=3000)
    references: Optional[List[str]] = None


class ResearchResponse(BaseModel):
    id: str
    _id: Optional[str] = None
    project_id: str
    university_id: str
    title: str
    description: Optional[str] = None
    findings: Optional[str] = None
    methodology: Optional[str] = None
    references: List[str] = Field(default_factory=list)
    created_by: Optional[str] = None
    created_at: str
    updated_at: str


VALID_SOLUTION_STATUSES = ["draft", "under_review", "approved", "revision_required"]


class SolutionProposalCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    problem_statement: str = Field(..., min_length=5, max_length=4000)
    proposed_solution: str = Field(..., min_length=5, max_length=5000)
    technical_approach: Optional[str] = Field(default=None, max_length=4000)
    expected_outcomes: Optional[str] = Field(default=None, max_length=3000)
    required_resources: Optional[str] = Field(default=None, max_length=3000)
    risks: Optional[str] = Field(default=None, max_length=3000)
    constraints: Optional[str] = Field(default=None, max_length=3000)
    status: str = Field(default="draft")


class SolutionProposalUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    problem_statement: Optional[str] = Field(default=None, max_length=4000)
    proposed_solution: Optional[str] = Field(default=None, max_length=5000)
    technical_approach: Optional[str] = Field(default=None, max_length=4000)
    expected_outcomes: Optional[str] = Field(default=None, max_length=3000)
    required_resources: Optional[str] = Field(default=None, max_length=3000)
    risks: Optional[str] = Field(default=None, max_length=3000)
    constraints: Optional[str] = Field(default=None, max_length=3000)
    status: Optional[str] = None


class SolutionProposalResponse(BaseModel):
    id: str
    _id: Optional[str] = None
    project_id: str
    university_id: str
    title: str
    problem_statement: str
    proposed_solution: str
    technical_approach: Optional[str] = None
    expected_outcomes: Optional[str] = None
    required_resources: Optional[str] = None
    risks: Optional[str] = None
    constraints: Optional[str] = None
    status: str = "draft"
    created_at: str
    updated_at: str


VALID_PROTOTYPE_STATUSES = ["planned", "in_development", "ready", "tested", "rejected"]


class PrototypeCreate(BaseModel):
    version: str = Field(default="v1.0", max_length=50)
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=3000)
    status: str = Field(default="planned")
    artifact_url: Optional[str] = None
    artifact_public_id: Optional[str] = None
    artifact_type: Optional[str] = None


class PrototypeUpdate(BaseModel):
    version: Optional[str] = Field(default=None, max_length=50)
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=3000)
    status: Optional[str] = None
    artifact_url: Optional[str] = None
    artifact_public_id: Optional[str] = None
    artifact_type: Optional[str] = None


class PrototypeResponse(BaseModel):
    id: str
    _id: Optional[str] = None
    project_id: str
    university_id: str
    version: str
    title: str
    description: Optional[str] = None
    status: str = "planned"
    artifact_url: Optional[str] = None
    artifact_public_id: Optional[str] = None
    artifact_type: Optional[str] = None
    created_by: Optional[str] = None
    created_at: str
    updated_at: str


VALID_PILOT_STATUSES = ["planned", "preparation", "active", "completed", "paused", "cancelled"]


class PilotCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    location: str = Field(..., min_length=2, max_length=200)
    objectives: str = Field(..., min_length=5, max_length=3000)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: str = Field(default="planned")
    observations: Optional[str] = Field(default=None, max_length=4000)
    results: Optional[str] = Field(default=None, max_length=4000)
    issues: Optional[str] = Field(default=None, max_length=3000)


class PilotUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    location: Optional[str] = Field(default=None, max_length=200)
    objectives: Optional[str] = Field(default=None, max_length=3000)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None
    observations: Optional[str] = Field(default=None, max_length=4000)
    results: Optional[str] = Field(default=None, max_length=4000)
    issues: Optional[str] = Field(default=None, max_length=3000)


class PilotResponse(BaseModel):
    id: str
    _id: Optional[str] = None
    project_id: str
    university_id: str
    title: str
    location: str
    objectives: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: str = "planned"
    observations: Optional[str] = None
    results: Optional[str] = None
    issues: Optional[str] = None
    created_at: str
    updated_at: str


VALID_READINESS_STATUSES = [
    "not_ready",
    "assessment",
    "ready_for_deployment",
    "deployment_in_progress",
    "deployed",
]


class DeploymentReadinessUpdate(BaseModel):
    readiness_status: Optional[str] = Field(default="not_ready")
    technical_readiness: Optional[str] = Field(default=None, max_length=3000)
    infrastructure_requirements: Optional[str] = Field(default=None, max_length=3000)
    estimated_cost: Optional[str] = Field(default=None, max_length=500)
    maintenance_requirements: Optional[str] = Field(default=None, max_length=3000)
    deployment_requirements: Optional[str] = Field(default=None, max_length=3000)
    blockers: Optional[str] = Field(default=None, max_length=3000)
    notes: Optional[str] = Field(default=None, max_length=4000)


class DeploymentReadinessResponse(BaseModel):
    id: Optional[str] = None
    _id: Optional[str] = None
    project_id: str
    university_id: str
    readiness_status: str = "not_ready"
    technical_readiness: Optional[str] = None
    infrastructure_requirements: Optional[str] = None
    estimated_cost: Optional[str] = None
    maintenance_requirements: Optional[str] = None
    deployment_requirements: Optional[str] = None
    blockers: Optional[str] = None
    notes: Optional[str] = None
    updated_at: str


class ProjectActivityResponse(BaseModel):
    id: str
    _id: Optional[str] = None
    project_id: str
    university_id: str
    actor_id: Optional[str] = None
    action: str
    description: str
    created_at: str






