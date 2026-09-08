from typing import List, Literal, Optional
from pydantic import BaseModel, EmailStr, Field


JurisdictionLevel = Literal["national", "state", "district", "city", "local"]


class GovernmentProfileCreate(BaseModel):
    department_name: str = Field(..., min_length=2, max_length=200, description="Government department/ministry name")
    department_type: str = Field(..., min_length=2, max_length=100, description="Category/type (e.g., Urban Development, Agriculture)")
    designation: str = Field(..., min_length=2, max_length=150, description="Official title/designation of the officer")
    jurisdiction: str = Field(..., min_length=2, max_length=200, description="Geographic or administrative jurisdiction area")
    jurisdiction_level: JurisdictionLevel = Field(..., description="Administrative level of jurisdiction")
    state: Optional[str] = Field(default=None, max_length=100)
    district: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)
    official_email: EmailStr = Field(..., description="Official government-issued email address")
    phone: Optional[str] = Field(default=None, max_length=30)
    description: Optional[str] = Field(default=None, max_length=2000)
    areas_of_focus: List[str] = Field(default_factory=list, description="Target civic/infrastructure focus areas")


class GovernmentProfileUpdate(BaseModel):
    department_name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    department_type: Optional[str] = Field(default=None, min_length=2, max_length=100)
    designation: Optional[str] = Field(default=None, min_length=2, max_length=150)
    jurisdiction: Optional[str] = Field(default=None, min_length=2, max_length=200)
    jurisdiction_level: Optional[JurisdictionLevel] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    official_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    areas_of_focus: Optional[List[str]] = None


class GovernmentProfileResponse(BaseModel):
    id: str
    user_id: str
    department_name: str
    department_type: str
    designation: str
    jurisdiction: str
    jurisdiction_level: str
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    official_email: str
    phone: Optional[str] = None
    description: Optional[str] = None
    areas_of_focus: List[str] = []
    created_at: str
    updated_at: str
    open_actions_count: Optional[int] = None
    reviews_completed_count: Optional[int] = None


class GovernmentDashboardMetrics(BaseModel):
    total_challenges: int
    submitted_challenges: int
    ai_processed_challenges: int
    validated_challenges: int
    total_university_projects: int
    active_university_projects: int
    pilot_projects: int
    deployed_projects: int
    total_industry_partnerships: int
    accepted_industry_partnerships: int
    active_mentorships: int
    resource_contributions: int
    funding_proposals: int


class PlatformActivityItem(BaseModel):
    id: str
    project_id: str
    action: str
    description: str
    created_at: str


# ============================================================================
# Step 8B: Government Challenge Monitoring & Validation Schemas
# ============================================================================

GovernmentReviewDecision = Literal["pending", "validated", "rejected", "clarification_required"]


class GovernmentChallengeReviewCreate(BaseModel):
    decision: GovernmentReviewDecision = Field(..., description="Validation decision: pending, validated, rejected, clarification_required")
    review_note: Optional[str] = Field(default=None, max_length=2000, description="Notes/rationale for the decision")
    clarification_request: Optional[str] = Field(default=None, max_length=2000, description="Questions/clarifications required from submitter")

    @classmethod
    def validate_rules(cls, values: dict) -> dict:
        decision = values.get("decision")
        note = values.get("review_note")
        clarification = values.get("clarification_request")

        if decision == "rejected" and (not note or not note.strip()):
            raise ValueError("A review note explaining the reason for rejection is required.")
        if decision == "clarification_required" and (not clarification or not clarification.strip()):
            raise ValueError("Specific clarification details are required when requesting clarification.")
        return values

    def __init__(self, **data):
        super().__init__(**data)
        self.validate_rules(self.__dict__)


class GovernmentChallengeReviewUpdate(BaseModel):
    decision: Optional[GovernmentReviewDecision] = Field(default=None, description="Updated validation decision")
    review_note: Optional[str] = Field(default=None, max_length=2000, description="Updated notes")
    clarification_request: Optional[str] = Field(default=None, max_length=2000, description="Updated clarification request")

    def validate_rules(self):
        if self.decision == "rejected" and (not self.review_note or not self.review_note.strip()):
            raise ValueError("A review note explaining the reason for rejection is required.")
        if self.decision == "clarification_required" and (not self.clarification_request or not self.clarification_request.strip()):
            raise ValueError("Specific clarification details are required when requesting clarification.")

    def __init__(self, **data):
        super().__init__(**data)
        self.validate_rules()


class GovernmentChallengeReviewResponse(BaseModel):
    id: str
    challenge_id: str
    government_user_id: str
    decision: str
    review_note: Optional[str] = None
    clarification_request: Optional[str] = None
    reviewed_at: str
    created_at: str
    updated_at: str
    officer_name: Optional[str] = None
    department_name: Optional[str] = None


class GovernmentChallengeSummary(BaseModel):
    challenge_id: str
    title: str
    description: str
    category: Optional[str] = None
    subcategory: Optional[str] = None
    location: Optional[dict] = None
    submitted_at: str
    status: str
    ai_status: Optional[str] = "pending"
    affected_people: Optional[int] = None
    urgency: Optional[str] = None
    citizen_tags: Optional[List[str]] = None
    ai_category: Optional[str] = None
    ai_confidence: Optional[float] = None
    keywords: List[str] = []
    required_skills: List[str] = []
    priority_score: Optional[float] = None
    priority_level: Optional[str] = None
    priority_explanation: Optional[str] = None
    duplicate_status: Optional[str] = None
    highest_similarity: Optional[float] = None
    matched_challenge_id: Optional[str] = None
    government_review: Optional[GovernmentChallengeReviewResponse] = None
    government_review_decision: str = "pending"
    government_review_date: Optional[str] = None
    has_project: bool = False
    project_name: Optional[str] = None
    project_status: Optional[str] = None
    university_name: Optional[str] = None


class GovernmentChallengesSummaryCounts(BaseModel):
    total: int
    pending: int
    validated: int
    clarification_required: int
    rejected: int


class GovernmentChallengesPage(BaseModel):
    items: List[GovernmentChallengeSummary]
    total: int
    page: int
    limit: int
    total_pages: int
    summary_counts: GovernmentChallengesSummaryCounts


class GovernmentProjectRelationship(BaseModel):
    project_id: str
    project_name: str
    status: str
    university_id: str
    university_name: Optional[str] = None
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    lifecycle_stage: Optional[str] = None
    start_date: Optional[str] = None
    target_date: Optional[str] = None


class GovernmentChallengeDetail(BaseModel):
    challenge_id: str
    title: str
    description: str
    category: Optional[str] = None
    subcategory: Optional[str] = None
    location: Optional[dict] = None
    affected_people: Optional[int] = None
    urgency: Optional[str] = None
    citizen_tags: Optional[List[str]] = None
    created_at: str
    updated_at: str
    challenge_status: str
    image_url: Optional[str] = None
    ai_analysis: Optional[dict] = None
    duplicate_analysis: Optional[dict] = None
    priority_analysis: Optional[dict] = None
    project_relationship: Optional[GovernmentProjectRelationship] = None
    government_review: Optional[GovernmentChallengeReviewResponse] = None


# ============================================================================
# Step 8C: Government University Project Monitoring Schemas
# ============================================================================

class GovernmentProjectSummary(BaseModel):
    project_id: str
    name: str
    title: str
    description: Optional[str] = None
    university_id: str
    university_name: Optional[str] = None
    challenge_id: Optional[str] = None
    challenge_title: Optional[str] = None
    category: Optional[str] = None
    project_status: str
    lifecycle_stage: str
    created_at: str
    updated_at: str
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    team_size: int = 0
    faculty_count: int = 0
    student_count: int = 0
    milestone_count: int = 0
    completed_milestone_count: int = 0
    prototype_count: int = 0
    pilot_count: int = 0
    deployment_readiness_state: Optional[str] = None
    industry_partnership_count: int = 0
    active_mentorship_count: int = 0
    resource_contribution_count: int = 0
    funding_proposal_count: int = 0


class GovernmentProjectsPage(BaseModel):
    items: List[GovernmentProjectSummary]
    total: int
    page: int
    limit: int
    total_pages: int
    status_counts: dict = {}


class GovernmentProjectDossier(BaseModel):
    overview: dict
    university: dict
    linked_challenge: Optional[dict] = None
    team: Optional[dict] = None
    milestones: List[dict] = []
    research: List[dict] = []
    solution: Optional[dict] = None
    prototypes: List[dict] = []
    pilots: List[dict] = []
    deployment_readiness: Optional[dict] = None
    industry_collaboration: dict = {}
    recent_activity: List[dict] = []


# ============================================================================
# Step 8D: Industry Collaboration Monitoring Schemas
# ============================================================================

class GovernmentCollaborationSummary(BaseModel):
    partnership_id: str
    project_id: str
    project_name: Optional[str] = None
    university_id: str
    university_name: Optional[str] = None
    industry_user_id: str
    company_name: Optional[str] = None
    industry_sector: Optional[str] = None
    partnership_status: str
    mentor_count: int = 0
    active_mentorship_count: int = 0
    resource_contribution_count: int = 0
    accepted_resource_count: int = 0
    funding_proposal_count: int = 0
    approved_funding_count: int = 0
    total_funding_amount: float = 0.0
    created_at: str
    updated_at: str


class GovernmentCollaborationsPage(BaseModel):
    items: List[GovernmentCollaborationSummary]
    total: int
    page: int
    limit: int
    total_pages: int
    summary_counts: dict = {}


class GovernmentCollaborationDetail(BaseModel):
    partnership_id: str
    status: str
    message: Optional[str] = None
    created_at: str
    updated_at: str
    industry_partner: dict
    university: dict
    project: dict
    mentors: List[dict] = []
    resources: List[dict] = []
    funding_proposals: List[dict] = []
    activity: List[dict] = []


# ============================================================================
# Step 8E: Pilot & Deployment Oversight Schemas
# ============================================================================

class GovernmentLifecycleMonitoringSummary(BaseModel):
    total_projects: int
    planning: int
    research: int
    solution_proposed: int
    prototype: int
    pilot: int
    deployment_ready: int
    deployed: int
    completed: int


class GovernmentPilotItem(BaseModel):
    pilot_id: str
    project_id: str
    project_name: Optional[str] = None
    university_id: str
    university_name: Optional[str] = None
    category: Optional[str] = None
    title: str
    location: str
    objectives: str
    status: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    observations: Optional[str] = None
    results: Optional[str] = None
    issues: Optional[str] = None
    created_at: str


class GovernmentPilotsPage(BaseModel):
    items: List[GovernmentPilotItem]
    total: int
    page: int
    limit: int
    total_pages: int
    status_counts: dict = {}


class GovernmentDeploymentItem(BaseModel):
    project_id: str
    project_name: str
    university_id: str
    university_name: Optional[str] = None
    category: Optional[str] = None
    lifecycle_stage: str
    project_status: str
    readiness_status: str
    technical_readiness: Optional[str] = None
    infrastructure_requirements: Optional[str] = None
    estimated_cost: Optional[str] = None
    maintenance_requirements: Optional[str] = None
    deployment_requirements: Optional[str] = None
    blockers: Optional[str] = None
    milestones_count: int = 0
    completed_milestones_count: int = 0
    updated_at: str


class GovernmentDeploymentsPage(BaseModel):
    items: List[GovernmentDeploymentItem]
    total: int
    page: int
    limit: int
    total_pages: int
    status_counts: dict = {}


# ============================================================================
# Step 8F: Regional & Category Analytics Schemas
# ============================================================================

class GovernmentAnalyticsItem(BaseModel):
    key: str
    label: str
    count: int
    percentage: Optional[float] = None


class GovernmentAnalyticsResponse(BaseModel):
    challenges_by_category: List[GovernmentAnalyticsItem] = []
    challenges_by_priority: List[GovernmentAnalyticsItem] = []
    challenges_by_status: List[GovernmentAnalyticsItem] = []
    challenges_by_ai_status: List[GovernmentAnalyticsItem] = []
    challenges_by_government_review: List[GovernmentAnalyticsItem] = []
    projects_by_category: List[GovernmentAnalyticsItem] = []
    projects_by_status: List[GovernmentAnalyticsItem] = []
    projects_by_lifecycle_stage: List[GovernmentAnalyticsItem] = []
    projects_by_state: List[GovernmentAnalyticsItem] = []
    projects_by_district: List[GovernmentAnalyticsItem] = []
    partnerships_by_status: List[GovernmentAnalyticsItem] = []
    pilots_by_status: List[GovernmentAnalyticsItem] = []
    total_challenges: int = 0
    total_projects: int = 0
    total_partnerships: int = 0
    total_pilots: int = 0


# ============================================================================
# Step 8G: Government Actions & Decisions Schemas
# ============================================================================

GovernmentActionType = Literal[
    "review_followup",
    "clarification_followup",
    "monitoring_required",
    "policy_attention",
    "coordination_required",
    "deployment_followup",
    "pilot_followup",
    "other",
]
GovernmentActionTargetType = Literal["challenge", "project", "partnership", "pilot", "deployment"]
GovernmentActionStatus = Literal["open", "in_progress", "completed", "cancelled"]
GovernmentActionPriority = Literal["low", "medium", "high", "critical"]


class GovernmentActionCreate(BaseModel):
    action_type: GovernmentActionType
    target_type: GovernmentActionTargetType
    target_id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=3000)
    priority: GovernmentActionPriority = Field(default="medium")
    due_date: Optional[str] = None


class GovernmentActionUpdate(BaseModel):
    action_type: Optional[GovernmentActionType] = None
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=3000)
    status: Optional[GovernmentActionStatus] = None
    priority: Optional[GovernmentActionPriority] = None
    due_date: Optional[str] = None


class GovernmentActionResponse(BaseModel):
    id: str
    government_user_id: str
    action_type: str
    target_type: str
    target_id: str
    target_title: Optional[str] = None
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[str] = None
    created_at: str
    updated_at: str
    completed_at: Optional[str] = None


class GovernmentActionsSummaryCounts(BaseModel):
    total: int
    open: int
    in_progress: int
    completed: int
    cancelled: int
    critical_priority: int


class GovernmentActionsPage(BaseModel):
    items: List[GovernmentActionResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    summary_counts: GovernmentActionsSummaryCounts


