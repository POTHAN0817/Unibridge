export type UserRole = "citizen" | "university" | "industry" | "government";

export type Role = UserRole | "faculty";

export type ChallengeStatus = "Submitted" | "AI Analyzed" | "Validated" | "Assigned" | "In Progress" | "Testing" | "Resolved";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar?: string;
  phone?: string;
  state?: string;
  district?: string;
  designation?: string;
  organization?: string;
  department?: string;
  sector?: string;
  expertise?: string[];
  capabilities?: string[];
  profile?: Record<string, unknown>;
  created_at?: string;
  joinedDate?: string;
}

// UserProfile is an alias for AuthUser
export type UserProfile = AuthUser;

export interface ChallengeImage {
  url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
}

export interface DuplicateCandidate {
  challenge_id: string;
  title: string;
  similarity_score: number;
  category?: string;
  district?: string;
  state?: string;
  created_at?: string;
}

export interface DuplicateAnalysisResult {
  is_duplicate: boolean;
  duplicate_candidates: DuplicateCandidate[];
  duplicate_count: number;
  highest_similarity: number;
  action_recommended: "cluster" | "link" | "unique";
}

export interface PriorityFactorDetail {
  weight: number;
  raw_value: any;
  normalized_score: number;
  weighted_contribution: number;
}

export interface PriorityAnalysisResult {
  score: number;
  level: "low" | "medium" | "high";
  explanation: string;
  factors: Record<string, PriorityFactorDetail>;
  calculated_at?: string;
}

export interface UniversityDepartmentItem {
  name: string;
  description?: string;
  expertise: string[];
  skills: string[];
}

export interface UniversityFacultyItem {
  name: string;
  department?: string;
  designation?: string;
  email?: string;
  phone?: string;
  expertise: string[];
  skills?: string[];
  research_areas?: string[];
}

export interface FacultyMember {
  id: string;
  _id?: string;
  university_id: string;
  name: string;
  email: string;
  designation?: string;
  department?: string;
  expertise: string[];
  skills: string[];
  research_areas: string[];
  availability: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacultyCreateInput {
  name: string;
  email: string;
  designation?: string;
  department?: string;
  expertise?: string[];
  skills?: string[];
  research_areas?: string[];
  availability?: boolean;
}

export interface StudentMember {
  id: string;
  _id?: string;
  university_id: string;
  name: string;
  email: string;
  department?: string;
  degree?: string;
  program?: string;
  skills: string[];
  interests: string[];
  availability: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentCreateInput {
  name: string;
  email: string;
  department?: string;
  degree?: string;
  skills?: string[];
  interests?: string[];
  availability?: boolean;
}

export interface StudentUpdateInput {
  name?: string;
  department?: string;
  degree?: string;
  skills?: string[];
  interests?: string[];
  availability?: boolean;
}

export interface TeamMemberBrief {
  id: string;
  name: string;
  email?: string;
  department?: string;
  designation?: string;
  degree?: string;
  skills?: string[];
}

export interface UniversityTeam {
  id: string;
  _id?: string;
  university_id: string;
  name: string;
  challenge_id: string;
  challenge_title?: string;
  challenge_category?: string;
  faculty_member_ids: string[];
  student_member_ids: string[];
  faculty_members: TeamMemberBrief[];
  student_members: TeamMemberBrief[];
  description?: string | null;
  status: "forming" | "active" | "completed" | "archived" | string;
  created_at: string;
  updated_at: string;
}

export interface TeamCreateInput {
  name: string;
  challenge_id: string;
  faculty_member_ids: string[];
  student_member_ids: string[];
  description?: string;
  status?: string;
}

export interface TeamUpdateInput {
  name?: string;
  challenge_id?: string;
  faculty_member_ids?: string[];
  student_member_ids?: string[];
  description?: string;
  status?: string;
}

export type ProjectStatus =
  | "planning"
  | "research"
  | "solution_proposed"
  | "prototype"
  | "pilot"
  | "deployment"
  | "completed"
  | "archived";

export interface UniversityProject {
  id: string;
  _id?: string;
  university_id: string;
  name: string;
  challenge_id: string;
  team_id: string;
  description?: string | null;
  status: ProjectStatus | string;
  start_date?: string | null;
  target_date?: string | null;
  created_at: string;
  updated_at: string;
  challenge_title?: string;
  challenge_category?: string;
  team_name?: string;
  faculty_members?: TeamMemberBrief[];
  student_members?: TeamMemberBrief[];
  milestone_progress?: number;
  milestones_count?: number;
  completed_milestones_count?: number;
}

export interface ProjectCreateInput {
  name: string;
  challenge_id: string;
  team_id: string;
  description?: string;
  status?: string;
  start_date?: string;
  target_date?: string;
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
  status?: string;
  start_date?: string;
  target_date?: string;
}

// Workspace Types
export type MilestoneStatus = "pending" | "in_progress" | "completed" | "blocked" | string;

export interface ProjectMilestone {
  id: string;
  _id?: string;
  project_id: string;
  university_id: string;
  title: string;
  description?: string | null;
  status: MilestoneStatus;
  due_date?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MilestoneCreateInput {
  title: string;
  description?: string;
  status?: string;
  due_date?: string;
}

export interface MilestoneUpdateInput {
  title?: string;
  description?: string;
  status?: string;
  due_date?: string;
}

export interface ProjectResearch {
  id: string;
  _id?: string;
  project_id: string;
  university_id: string;
  title: string;
  description?: string | null;
  findings?: string | null;
  methodology?: string | null;
  references: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ResearchCreateInput {
  title: string;
  description?: string;
  findings?: string;
  methodology?: string;
  references?: string[];
}

export interface ResearchUpdateInput {
  title?: string;
  description?: string;
  findings?: string;
  methodology?: string;
  references?: string[];
}

export type SolutionStatus = "draft" | "under_review" | "approved" | "revision_required" | string;

export interface ProjectSolution {
  id: string;
  _id?: string;
  project_id: string;
  university_id: string;
  title: string;
  problem_statement: string;
  proposed_solution: string;
  technical_approach?: string | null;
  expected_outcomes?: string | null;
  required_resources?: string | null;
  risks?: string | null;
  constraints?: string | null;
  status: SolutionStatus;
  created_at: string;
  updated_at: string;
}

export interface SolutionProposalInput {
  title: string;
  problem_statement: string;
  proposed_solution: string;
  technical_approach?: string;
  expected_outcomes?: string;
  required_resources?: string;
  risks?: string;
  constraints?: string;
  status?: string;
}

export type PrototypeStatus = "planned" | "in_development" | "ready" | "tested" | "rejected" | string;

export interface ProjectPrototype {
  id: string;
  _id?: string;
  project_id: string;
  university_id: string;
  version: string;
  title: string;
  description?: string | null;
  status: PrototypeStatus;
  artifact_url?: string | null;
  artifact_public_id?: string | null;
  artifact_type?: string | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PrototypeCreateInput {
  version: string;
  title: string;
  description?: string;
  status?: string;
  artifact_url?: string;
  artifact_public_id?: string;
  artifact_type?: string;
}

export interface PrototypeUpdateInput {
  version?: string;
  title?: string;
  description?: string;
  status?: string;
  artifact_url?: string;
  artifact_public_id?: string;
  artifact_type?: string;
}

export type PilotStatus = "planned" | "preparation" | "active" | "completed" | "paused" | "cancelled" | string;

export interface ProjectPilot {
  id: string;
  _id?: string;
  project_id: string;
  university_id: string;
  title: string;
  location: string;
  objectives: string;
  start_date?: string | null;
  end_date?: string | null;
  status: PilotStatus;
  observations?: string | null;
  results?: string | null;
  issues?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PilotCreateInput {
  title: string;
  location: string;
  objectives: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  observations?: string;
  results?: string;
  issues?: string;
}

export interface PilotUpdateInput {
  title?: string;
  location?: string;
  objectives?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  observations?: string;
  results?: string;
  issues?: string;
}

export type ReadinessStatus = "not_ready" | "assessment" | "ready_for_deployment" | "deployment_in_progress" | "deployed" | string;

export interface DeploymentReadiness {
  id?: string;
  _id?: string;
  project_id: string;
  university_id: string;
  readiness_status: ReadinessStatus;
  technical_readiness?: string | null;
  infrastructure_requirements?: string | null;
  estimated_cost?: string | null;
  maintenance_requirements?: string | null;
  deployment_requirements?: string | null;
  blockers?: string | null;
  notes?: string | null;
  updated_at: string;
}

export interface DeploymentReadinessUpdateInput {
  readiness_status?: string;
  technical_readiness?: string;
  infrastructure_requirements?: string;
  estimated_cost?: string;
  maintenance_requirements?: string;
  deployment_requirements?: string;
  blockers?: string;
  notes?: string;
}

export interface ProjectActivity {
  id: string;
  _id?: string;
  project_id: string;
  university_id: string;
  actor_id?: string;
  action: string;
  description: string;
  created_at: string;
}


export interface UniversityProjectItem {
  title: string;
  description?: string;
  domain?: string;
  year?: number;
}

export interface UniversityProfile {
  id?: string;
  name: string;
  short_name?: string;
  description?: string;
  website?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  departments: UniversityDepartmentItem[];
  research_areas: string[];
  skills: string[];
  infrastructure: string[];
  previous_projects: UniversityProjectItem[];
  faculty: UniversityFacultyItem[];
  student_skills: string[];
  availability: "available" | "limited" | "unavailable" | "unknown" | string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UniversityMatchFactors {
  expertise_similarity: number;
  skill_match: number;
  previous_project_match: number;
  infrastructure_match: number;
  location_relevance: number;
  availability: number;
}

export interface UniversityMatchCandidate {
  university_id: string;
  university_name: string;
  short_name?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  score: number;
  level: "High Match" | "Good Match" | "Moderate Match" | "Low Match" | string;
  factors: UniversityMatchFactors;
  matched_skills: string[];
  missing_skills: string[];
  matched_departments: string[];
  matched_faculty: string[];
  relevant_projects: string[];
  relevant_infrastructure: string[];
  explanation: string;
  model_version?: string;
  calculated_at?: string;
}

export interface UniversityMatchesResult {
  status: "completed" | "no_candidates" | "pending" | "failed" | string;
  matches: UniversityMatchCandidate[];
  model_version: string;
  calculated_at?: string;
}

export interface UniversityMatchedChallenge {
  challenge_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  location?: any;
  status: string;
  affected_people?: number;
  urgency?: string;
  ai_status?: string;
  ai_analysis?: any;
  priority_analysis?: any;
  duplicate_analysis?: any;
  priority_score?: number;
  match_score: number;
  match_level: string;
  matched_skills: string[];
  missing_skills: string[];
  matched_departments: string[];
  matched_faculty: string[];
  explanation: string;
  match_evaluation?: any;
  created_at?: string;
}

export interface UniversityChallengeDossier {
  challenge_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  location: string;
  location_details?: Record<string, any>;
  affected_people?: number;
  urgency: string;
  status: string;
  submission_date: string;
  created_at: string;
  image?: ChallengeImage | null;
  ai_status: string;
  ai_analysis: {
    category?: string;
    subcategory?: string;
    confidence?: number;
    keywords?: string[];
    required_skills?: string[];
    summary?: string;
    status?: string;
    error?: string;
  };
  priority_analysis: {
    score: number;
    level: string;
    factors: {
      severity: number;
      urgency: number;
      population_impact: number;
      frequency: number;
      feasibility: number;
    };
    explanation: string;
  };
  duplicate_analysis: {
    status: string;
    is_duplicate: boolean;
    highest_similarity: number;
    matched_challenge_id?: string;
    candidates: Array<{
      challenge_id: string;
      title: string;
      similarity: number;
      confidence?: string;
    }>;
  };
  university_match: {
    score: number;
    level: string;
    factors: {
      expertise_similarity: number;
      skill_match: number;
      previous_project_match: number;
      infrastructure_match: number;
      location_relevance: number;
      availability: number;
    };
    matched_skills: string[];
    missing_skills: string[];
    matched_departments: string[];
    matched_faculty: string[];
    explanation: string;
    university_id?: string;
    university_name?: string;
  } | null;
  match_status: "evaluated" | "profile_incomplete" | "profile_not_found";
  interest?: UniversityInterest | null;
}

export interface UniversityInterest {
  id: string;
  _id?: string;
  challenge_id: string;
  university_id: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn" | string;
  message?: string | null;
  created_at: string;
  updated_at: string;
  university_name?: string;
  challenge_title?: string;
  challenge_category?: string;
  challenge_location?: any;
  challenge_priority?: string;
  challenge?: {
    id: string;
    title: string;
    category: string;
    location?: any;
    status: string;
    urgency?: string;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  location: string;
  state: string;
  district: string;
  status: ChallengeStatus;
  priority: PriorityLevel;
  priorityScore: number;
  similarReports: number;
  assignedUniversity?: string | null;
  assignedProjectId?: string | null;
  progress: number;
  stage: string;
  tags: string[];
  affectedPeople: string;
  affected_people?: number | null;
  urgency?: "low" | "medium" | "high" | string;
  citizen_tags?: string[];
  submittedBy: string;
  submittedDate: string;
  image?: ChallengeImage | null;
  aiCategoryConfidence?: number;
  aiSummary?: string;
  requiredExpertise?: string[];
  ai_analysis?: any;
  duplicate_analysis?: DuplicateAnalysisResult | null;
  priority_analysis?: PriorityAnalysisResult | null;
  university_matches?: UniversityMatchesResult | null;
  timeline?: {
    event: string;
    time: string;
    type: "success" | "info" | "ai" | "warning" | "neutral";
  }[];
}



export interface Project {
  id: string;
  challengeId: string;
  title: string;
  category: string;
  stage: string;
  progress: number;
  university: string;
  location: string;
  leadFaculty: string;
  leadStudent: string;
  teamSize: number;
  impactMetrics: string;
  startDate: string;
  estimatedCompletion: string;
  tags: string[];
  description: string;
  milestones: {
    title: string;
    date: string;
    done: boolean;
    current?: boolean;
  }[];
  teamMembers: {
    name: string;
    role: string;
    domain: string;
    avatar: string;
    email?: string;
  }[];
  industrySupport: {
    company: string;
    type: string;
    providing: string;
    status: "Confirmed" | "Active" | "Pending";
    logo: string;
  }[];
}

export interface UniversityItem {
  id: string;
  name: string;
  state: string;
  district: string;
  type: string;
  activeProjects: number;
  completedSolutions: number;
  facultyCount: number;
  studentCount: number;
  departments: string[];
  topDomains: string[];
  contactPerson: string;
  email: string;
  rating: number;
}

export interface IndustryPartnerItem {
  id: string;
  name: string;
  sector: string;
  location: string;
  contactPerson: string;
  email: string;
  activeCollaborations: number;
  supportedProjects: number;
  fundingCommitted: string;
  focusAreas: string[];
  supportCapabilities: string[];
  openMentorshipSlots: number;
}

export interface ImpactStory {
  id: string;
  title: string;
  location: string;
  category: string;
  university: string;
  before: { metric: string; label: string };
  after: { metric: string; label: string };
  impact: { benefited: string; satisfaction: string; score: string };
  replication: { potential: string; districts: number };
  color: string;
}

export interface ActivityItem {
  id: string;
  event: string;
  time: string;
  type: "success" | "info" | "ai" | "warning" | "neutral";
  role?: UserRole;
  link?: string;
}

export interface IndustryProfile {
  id: string;
  _id?: string;
  user_id: string;
  company_name: string;
  short_name?: string | null;
  description?: string | null;
  website?: string | null;
  industry_sector: string;
  sub_sectors: string[];
  headquarters_location?: string | null;
  operating_locations: string[];
  expertise: string[];
  technologies: string[];
  capabilities: string[];
  infrastructure: string[];
  resources_available: string[];
  research_interests: string[];
  collaboration_interests: string[];
  funding_capacity?: string | null;
  mentorship_capacity?: string | null;
  availability: string;
  created_at: string;
  updated_at: string;
}

export interface IndustryProfileCreateInput {
  company_name: string;
  short_name?: string;
  description?: string;
  website?: string;
  industry_sector: string;
  sub_sectors?: string[];
  headquarters_location?: string;
  operating_locations?: string[];
  expertise?: string[];
  technologies?: string[];
  capabilities?: string[];
  infrastructure?: string[];
  resources_available?: string[];
  research_interests?: string[];
  collaboration_interests?: string[];
  funding_capacity?: string;
  mentorship_capacity?: string;
  availability?: string;
}

export interface IndustryProfileUpdateInput {
  company_name?: string;
  short_name?: string;
  description?: string;
  website?: string;
  industry_sector?: string;
  sub_sectors?: string[];
  headquarters_location?: string;
  operating_locations?: string[];
  expertise?: string[];
  technologies?: string[];
  capabilities?: string[];
  infrastructure?: string[];
  resources_available?: string[];
  research_interests?: string[];
  collaboration_interests?: string[];
  funding_capacity?: string;
  mentorship_capacity?: string;
  availability?: string;
}

export interface IndustryDiscoveredProjectSummary {
  project_id: string;
  project_name: string;
  description?: string | null;
  project_status: string;
  challenge_id: string;
  challenge_title: string;
  challenge_category: string;
  challenge_subcategory?: string | null;
  challenge_location?: string | null;
  university_id: string;
  university_name: string;
  team_name: string;
  faculty_count: number;
  student_count: number;
  project_start_date?: string | null;
  target_date?: string | null;
}

export interface IndustryDiscoveredProjectsPage {
  items: IndustryDiscoveredProjectSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface IndustryProjectMilestoneSummary {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  due_date?: string | null;
  completed_at?: string | null;
}

export interface IndustryProjectSolutionSummary {
  title: string;
  problem_statement: string;
  proposed_solution: string;
  technical_approach?: string | null;
  expected_outcomes?: string | null;
  status: string;
}

export interface IndustryProjectPrototypeSummary {
  id: string;
  version: string;
  title: string;
  description?: string | null;
  status: string;
  artifact_url?: string | null;
  artifact_type?: string | null;
}

export interface IndustryProjectPilotSummary {
  id: string;
  title: string;
  location: string;
  objectives: string;
  status: string;
  start_date?: string | null;
  end_date?: string | null;
  observations?: string | null;
  results?: string | null;
}

export interface IndustryDiscoveredProjectDetail {
  project_id: string;
  project_name: string;
  description?: string | null;
  project_status: string;
  start_date?: string | null;
  target_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  // Linked Challenge
  challenge_id: string;
  challenge_title: string;
  challenge_description?: string | null;
  challenge_category: string;
  challenge_subcategory?: string | null;
  challenge_location?: string | null;
  challenge_urgency?: string | null;

  // University & Team
  university_id: string;
  university_name: string;
  team_name: string;
  faculty_count: number;
  student_count: number;

  // Progress & Milestones
  milestone_progress: number;
  milestones_count: number;
  completed_milestones_count: number;
  milestones: IndustryProjectMilestoneSummary[];

  // Solution Proposal
  solution?: IndustryProjectSolutionSummary | null;

  // Prototypes & Pilots
  prototypes: IndustryProjectPrototypeSummary[];
  pilots: IndustryProjectPilotSummary[];
}

export type PartnershipStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface IndustryPartnership {
  id: string;
  industry_user_id: string;
  project_id: string;
  university_id: string;
  status: PartnershipStatus;
  message?: string | null;
  created_at: string;
  updated_at: string;

  // Context fields for display
  project_name?: string;
  university_name?: string;
  challenge_title?: string;
  challenge_category?: string;
}

export interface UniversityPartnershipRequest {
  id: string;
  industry_user_id: string;
  project_id: string;
  university_id: string;
  status: PartnershipStatus;
  message?: string | null;
  created_at: string;
  updated_at: string;

  // Enriched corporate details
  company_name: string;
  short_name?: string | null;
  industry_sector: string;
  sub_sectors: string[];
  expertise: string[];
  technologies: string[];
  capabilities: string[];
  collaboration_interests: string[];
  headquarters_location?: string | null;
  website?: string | null;
}

export interface IndustryExpert {
  id: string;
  industry_user_id: string;
  name: string;
  designation: string;
  email: string;
  expertise: string[];
  skills: string[];
  domain_areas: string[];
  availability: "available" | "limited" | "unavailable" | string;
  created_at: string;
  updated_at: string;
}

export interface IndustryExpertCreateInput {
  name: string;
  designation: string;
  email: string;
  expertise?: string[];
  skills?: string[];
  domain_areas?: string[];
  availability?: string;
}

export interface IndustryExpertUpdateInput {
  name?: string;
  designation?: string;
  email?: string;
  expertise?: string[];
  skills?: string[];
  domain_areas?: string[];
  availability?: string;
}

export type MentorshipStatus = "proposed" | "active" | "completed" | "withdrawn";

export interface ProjectMentorship {
  id: string;
  project_id: string;
  university_id: string;
  industry_user_id: string;
  expert_id: string;
  partnership_id: string;
  status: MentorshipStatus;
  focus_areas: string[];
  objectives: string;
  created_at: string;
  updated_at: string;

  // Context fields for display
  expert_name?: string;
  expert_designation?: string;
  expert_email?: string;
  expert_expertise?: string[];
  expert_skills?: string[];
  skills?: string[];
  company_name?: string;
  project_name?: string;
  university_name?: string;
}

export interface ProjectMentorshipCreateInput {
  expert_id: string;
  focus_areas?: string[];
  objectives: string;
}

export interface ProjectMentorshipUpdateInput {
  status?: MentorshipStatus;
  focus_areas?: string[];
  objectives?: string;
}

export interface IndustryDashboardMetrics {
  discovered_projects: number;
  pending_partnerships: number;
  active_partnerships: number;
  active_mentorships: number;
  supported_projects: number;
  resources_contributed?: number;
  funding_proposals?: number;
  active_collaborations?: number;
}

export interface UniversityIndustryCollaborationMetrics {
  projects_with_partnerships: number;
  pending_requests: number;
  pending_partnership_requests?: number;
  active_partnerships: number;
  accepted_partnerships?: number;
  active_mentors: number;
  resource_contributions?: number;
  funding_proposals?: number;
}

// ============================================================================
// Resources & Technology Support
// ============================================================================
export type ResourceType =
  | "technology"
  | "equipment"
  | "software"
  | "dataset"
  | "infrastructure"
  | "technical_service"
  | "other";

export type ResourceStatus = "proposed" | "approved" | "rejected" | "provided" | "withdrawn";

export interface IndustryResource {
  id: string;
  project_id: string;
  university_id: string;
  industry_user_id: string;
  partnership_id: string;
  title: string;
  resource_type: ResourceType | string;
  description: string;
  quantity_or_scope?: string | null;
  status: ResourceStatus;
  provided_at?: string | null;
  created_at: string;
  updated_at: string;

  // Context fields
  company_name?: string;
  industry_sector?: string;
  project_name?: string;
  university_name?: string;
}

export interface IndustryResourceCreateInput {
  title: string;
  resource_type: ResourceType;
  description: string;
  quantity_or_scope?: string;
}

export interface IndustryResourceUpdateInput {
  title?: string;
  resource_type?: ResourceType;
  description?: string;
  quantity_or_scope?: string;
  status?: ResourceStatus;
}

// ============================================================================
// Funding / Sponsorship Proposals
// ============================================================================
export type FundingType = "sponsorship" | "grant" | "project_support" | "csr" | "other";

export type FundingStatus = "proposed" | "approved" | "rejected" | "withdrawn" | "disbursed";

export interface IndustryFunding {
  id: string;
  project_id: string;
  university_id: string;
  industry_user_id: string;
  partnership_id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  funding_type: FundingType | string;
  status: FundingStatus;
  proposed_at: string;
  updated_at: string;

  // Context fields
  company_name?: string;
  industry_sector?: string;
  project_name?: string;
  university_name?: string;
}

export interface IndustryFundingCreateInput {
  title: string;
  description: string;
  amount: number;
  currency?: string;
  funding_type: FundingType;
}

export interface IndustryFundingUpdateInput {
  title?: string;
  description?: string;
  amount?: number;
  currency?: string;
  funding_type?: FundingType;
  status?: FundingStatus;
}

// ============================================================================
// Collaboration Summary
// ============================================================================
export interface IndustryCollaborationSummary {
  project_id: string;
  project_name: string;
  university_id: string;
  university_name: string;
  project_status: string;
  partnership_status: string;
  assigned_mentors_count: number;
  resources_count: number;
  funding_proposals_count: number;
}

// ============================================================================
// Government Module (Step 8A Foundation)
// ============================================================================
export type JurisdictionLevel = "national" | "state" | "district" | "city" | "local";

export interface GovernmentProfile {
  id: string;
  user_id: string;
  department_name: string;
  department_type: string;
  designation: string;
  jurisdiction: string;
  jurisdiction_level: JurisdictionLevel;
  state?: string;
  district?: string;
  city?: string;
  official_email: string;
  phone?: string;
  description?: string;
  areas_of_focus: string[];
  created_at: string;
  updated_at: string;
  open_actions_count?: number;
  reviews_completed_count?: number;
}

export interface GovernmentProfileCreateInput {
  department_name: string;
  department_type: string;
  designation: string;
  jurisdiction: string;
  jurisdiction_level: JurisdictionLevel;
  state?: string;
  district?: string;
  city?: string;
  official_email: string;
  phone?: string;
  description?: string;
  areas_of_focus: string[];
}

export interface GovernmentProfileUpdateInput {
  department_name?: string;
  department_type?: string;
  designation?: string;
  jurisdiction?: string;
  jurisdiction_level?: JurisdictionLevel;
  state?: string;
  district?: string;
  city?: string;
  official_email?: string;
  phone?: string;
  description?: string;
  areas_of_focus?: string[];
}

export interface GovernmentDashboardMetrics {
  total_challenges: number;
  submitted_challenges: number;
  ai_processed_challenges: number;
  validated_challenges: number;
  total_university_projects: number;
  active_university_projects: number;
  pilot_projects: number;
  deployed_projects: number;
  total_industry_partnerships: number;
  accepted_industry_partnerships: number;
  active_mentorships: number;
  resource_contributions: number;
  funding_proposals: number;
}

export interface PlatformActivityItem {
  id: string;
  project_id: string;
  action: string;
  description: string;
  created_at: string;
}

// ============================================================================
// Step 8B: Government Challenge Monitoring & Validation Types
// ============================================================================

export type GovernmentReviewDecision = "pending" | "validated" | "rejected" | "clarification_required";

export interface GovernmentChallengeReview {
  id: string;
  challenge_id: string;
  government_user_id: string;
  decision: GovernmentReviewDecision;
  review_note?: string | null;
  clarification_request?: string | null;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
  officer_name?: string | null;
  department_name?: string | null;
}

export interface GovernmentChallengeReviewCreateInput {
  decision: GovernmentReviewDecision;
  review_note?: string | null;
  clarification_request?: string | null;
}

export interface GovernmentChallengeReviewUpdateInput {
  decision?: GovernmentReviewDecision;
  review_note?: string | null;
  clarification_request?: string | null;
}

export interface GovernmentChallengeSummary {
  challenge_id: string;
  title: string;
  description: string;
  category?: string | null;
  subcategory?: string | null;
  location?: {
    district?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  } | null;
  submitted_at: string;
  status: string;
  ai_status?: string | null;
  affected_people?: number | null;
  urgency?: string | null;
  citizen_tags?: string[];
  ai_category?: string | null;
  ai_confidence?: number | null;
  keywords: string[];
  required_skills: string[];
  priority_score?: number | null;
  priority_level?: string | null;
  priority_explanation?: string | null;
  duplicate_status?: string | null;
  highest_similarity?: number | null;
  matched_challenge_id?: string | null;
  government_review?: GovernmentChallengeReview | null;
  government_review_decision: GovernmentReviewDecision;
  government_review_date?: string | null;
  has_project: boolean;
  project_name?: string | null;
  project_status?: string | null;
  university_name?: string | null;
}

export interface GovernmentChallengesSummaryCounts {
  total: number;
  pending: number;
  validated: number;
  clarification_required: number;
  rejected: number;
}

export interface GovernmentChallengesPage {
  items: GovernmentChallengeSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  summary_counts: GovernmentChallengesSummaryCounts;
}

export interface GovernmentProjectRelationship {
  project_id: string;
  project_name: string;
  status: string;
  university_id: string;
  university_name?: string | null;
  team_id?: string | null;
  team_name?: string | null;
  lifecycle_stage?: string | null;
  start_date?: string | null;
  target_date?: string | null;
}

export interface GovernmentChallengeDetail {
  challenge_id: string;
  title: string;
  description: string;
  category?: string | null;
  subcategory?: string | null;
  location?: {
    district?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  } | null;
  affected_people?: number | null;
  urgency?: string | null;
  citizen_tags?: string[];
  created_at: string;
  updated_at: string;
  challenge_status: string;
  image_url?: string | null;
  ai_analysis?: Record<string, any> | null;
  duplicate_analysis?: Record<string, any> | null;
  priority_analysis?: Record<string, any> | null;
  project_relationship?: GovernmentProjectRelationship | null;
  government_review?: GovernmentChallengeReview | null;
}

// ============================================================================
// Step 8C: Government University Project Monitoring Types
// ============================================================================

export interface GovernmentProjectSummary {
  project_id: string;
  name: string;
  title: string;
  description?: string | null;
  university_id: string;
  university_name?: string | null;
  challenge_id?: string | null;
  challenge_title?: string | null;
  category?: string | null;
  project_status: string;
  lifecycle_stage: string;
  created_at: string;
  updated_at: string;
  start_date?: string | null;
  target_date?: string | null;
  team_id?: string | null;
  team_name?: string | null;
  team_size: number;
  faculty_count: number;
  student_count: number;
  milestone_count: number;
  completed_milestone_count: number;
  prototype_count: number;
  pilot_count: number;
  deployment_readiness_state?: string | null;
  industry_partnership_count: number;
  active_mentorship_count: number;
  resource_contribution_count: number;
  funding_proposal_count: number;
}

export interface GovernmentProjectsPage {
  items: GovernmentProjectSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  status_counts: Record<string, number>;
}

export interface GovernmentProjectDossier {
  overview: {
    project_id: string;
    name: string;
    description?: string | null;
    status: string;
    lifecycle_stage: string;
    start_date?: string | null;
    target_date?: string | null;
    created_at: string;
    updated_at: string;
  };
  university: {
    university_id: string;
    name: string;
    short_name?: string | null;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    } | null;
    website?: string | null;
  };
  linked_challenge?: {
    challenge_id: string;
    title: string;
    description: string;
    category?: string | null;
    subcategory?: string | null;
    urgency?: string | null;
    affected_people?: number | null;
    location?: any;
    priority_level?: string | null;
    priority_score?: number | null;
    priority_explanation?: string | null;
    submitted_at: string;
  } | null;
  team?: {
    team_id: string;
    name: string;
    faculty_count: number;
    student_count: number;
    faculty_members: any[];
    student_members: any[];
  } | null;
  milestones: Array<{
    id: string;
    title: string;
    description?: string | null;
    status: string;
    due_date?: string | null;
    completed_at?: string | null;
    created_at: string;
  }>;
  research: Array<{
    id: string;
    title: string;
    description?: string | null;
    findings?: string | null;
    methodology?: string | null;
    references?: string[];
    created_at: string;
  }>;
  solution?: {
    id: string;
    title: string;
    problem_statement: string;
    proposed_solution: string;
    technical_approach?: string | null;
    expected_outcomes?: string | null;
    required_resources?: string | null;
    risks?: string | null;
    constraints?: string | null;
    status: string;
    created_at: string;
    updated_at: string;
  } | null;
  prototypes: Array<{
    id: string;
    version: string;
    title: string;
    description?: string | null;
    status: string;
    artifact_url?: string | null;
    artifact_type?: string | null;
    created_at: string;
  }>;
  pilots: Array<{
    id: string;
    title: string;
    location: string;
    objectives: string;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
    observations?: string | null;
    results?: string | null;
    issues?: string | null;
    created_at: string;
  }>;
  deployment_readiness?: {
    id?: string;
    readiness_status: string;
    technical_readiness?: string | null;
    infrastructure_requirements?: string | null;
    estimated_cost?: string | null;
    maintenance_requirements?: string | null;
    deployment_requirements?: string | null;
    blockers?: string | null;
    notes?: string | null;
    updated_at: string;
  } | null;
  industry_collaboration: {
    partnerships: Array<{
      partnership_id: string;
      company_name: string;
      status: string;
      message?: string | null;
      created_at: string;
    }>;
    partnerships_count: number;
    mentors: Array<{
      id: string;
      objectives: string;
      focus_areas: string[];
      status: string;
      created_at: string;
    }>;
    mentorships_count: number;
    resources: Array<{
      id: string;
      title: string;
      resource_type: string;
      description: string;
      quantity_or_scope?: string | null;
      status: string;
      provided_at?: string | null;
      created_at: string;
    }>;
    resources_count: number;
    funding: Array<{
      id: string;
      title: string;
      description: string;
      amount: number;
      currency: string;
      funding_type: string;
      status: string;
      proposed_at: string;
    }>;
    funding_count: number;
  };
  recent_activity: Array<{
    id: string;
    action: string;
    description: string;
    created_at: string;
  }>;
}

// ============================================================================
// Step 8D: Industry Collaboration Monitoring Types
// ============================================================================

export interface GovernmentCollaborationSummary {
  partnership_id: string;
  project_id: string;
  project_name?: string | null;
  university_id: string;
  university_name?: string | null;
  industry_user_id: string;
  company_name?: string | null;
  industry_sector?: string | null;
  partnership_status: string;
  mentor_count: number;
  active_mentorship_count: number;
  resource_contribution_count: number;
  accepted_resource_count: number;
  funding_proposal_count: number;
  approved_funding_count: number;
  total_funding_amount: number;
  created_at: string;
  updated_at: string;
}

export interface GovernmentCollaborationsPage {
  items: GovernmentCollaborationSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  summary_counts: Record<string, number>;
}

export interface GovernmentCollaborationDetail {
  partnership_id: string;
  status: string;
  message?: string | null;
  created_at: string;
  updated_at: string;
  industry_partner: {
    industry_user_id: string;
    company_name: string;
    short_name?: string | null;
    industry_sector?: string | null;
    sub_sectors: string[];
    headquarters_location?: string | null;
    operating_locations: string[];
    website?: string | null;
    expertise: string[];
    technologies: string[];
  };
  university: {
    university_id: string;
    name: string;
    location?: any;
  };
  project: {
    project_id: string;
    name: string;
    description?: string | null;
    status: string;
    lifecycle_stage: string;
    challenge_title?: string | null;
    challenge_category?: string | null;
  };
  mentors: Array<{
    id: string;
    expert_name: string;
    expert_designation?: string | null;
    focus_areas: string[];
    objectives: string;
    status: string;
    created_at: string;
  }>;
  resources: Array<{
    id: string;
    title: string;
    resource_type: string;
    description: string;
    quantity_or_scope?: string | null;
    status: string;
    provided_at?: string | null;
    created_at: string;
  }>;
  funding_proposals: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    currency: string;
    funding_type: string;
    status: string;
    proposed_at: string;
  }>;
  activity: Array<{
    id: string;
    action: string;
    description: string;
    created_at: string;
  }>;
}

// ============================================================================
// Step 8E: Pilot & Deployment Oversight Types
// ============================================================================

export interface GovernmentLifecycleMonitoringSummary {
  total_projects: number;
  planning: number;
  research: number;
  solution_proposed: number;
  prototype: number;
  pilot: number;
  deployment_ready: number;
  deployed: number;
  completed: number;
}

export interface GovernmentPilotItem {
  pilot_id: string;
  project_id: string;
  project_name?: string | null;
  university_id: string;
  university_name?: string | null;
  category?: string | null;
  title: string;
  location: string;
  objectives: string;
  status: string;
  start_date?: string | null;
  end_date?: string | null;
  observations?: string | null;
  results?: string | null;
  issues?: string | null;
  created_at: string;
}

export interface GovernmentPilotsPage {
  items: GovernmentPilotItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  status_counts: Record<string, number>;
}

export interface GovernmentDeploymentItem {
  project_id: string;
  project_name: string;
  university_id: string;
  university_name?: string | null;
  category?: string | null;
  lifecycle_stage: string;
  project_status: string;
  readiness_status: string;
  technical_readiness?: string | null;
  infrastructure_requirements?: string | null;
  estimated_cost?: string | null;
  maintenance_requirements?: string | null;
  deployment_requirements?: string | null;
  blockers?: string | null;
  milestones_count: number;
  completed_milestones_count: number;
  updated_at: string;
}

export interface GovernmentDeploymentsPage {
  items: GovernmentDeploymentItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  status_counts: Record<string, number>;
}

// ============================================================================
// Step 8F: Regional & Category Analytics Types
// ============================================================================

export interface GovernmentAnalyticsItem {
  key: string;
  label: string;
  count: number;
  percentage?: number | null;
}

export interface GovernmentAnalyticsResponse {
  challenges_by_category: GovernmentAnalyticsItem[];
  challenges_by_priority: GovernmentAnalyticsItem[];
  challenges_by_status: GovernmentAnalyticsItem[];
  challenges_by_ai_status: GovernmentAnalyticsItem[];
  challenges_by_government_review: GovernmentAnalyticsItem[];
  projects_by_category: GovernmentAnalyticsItem[];
  projects_by_status: GovernmentAnalyticsItem[];
  projects_by_lifecycle_stage: GovernmentAnalyticsItem[];
  projects_by_state: GovernmentAnalyticsItem[];
  projects_by_district: GovernmentAnalyticsItem[];
  partnerships_by_status: GovernmentAnalyticsItem[];
  pilots_by_status: GovernmentAnalyticsItem[];
  total_challenges: number;
  total_projects: number;
  total_partnerships: number;
  total_pilots: number;
}

// ============================================================================
// Step 8G: Government Actions & Decisions Types
// ============================================================================

export type GovernmentActionType =
  | "review_followup"
  | "clarification_followup"
  | "monitoring_required"
  | "policy_attention"
  | "coordination_required"
  | "deployment_followup"
  | "pilot_followup"
  | "other";

export type GovernmentActionTargetType = "challenge" | "project" | "partnership" | "pilot" | "deployment";
export type GovernmentActionStatus = "open" | "in_progress" | "completed" | "cancelled";
export type GovernmentActionPriority = "low" | "medium" | "high" | "critical";

export interface GovernmentActionCreateInput {
  action_type: GovernmentActionType;
  target_type: GovernmentActionTargetType;
  target_id: string;
  title: string;
  description?: string;
  priority?: GovernmentActionPriority;
  due_date?: string;
}

export interface GovernmentActionUpdateInput {
  action_type?: GovernmentActionType;
  title?: string;
  description?: string;
  status?: GovernmentActionStatus;
  priority?: GovernmentActionPriority;
  due_date?: string;
}

export interface GovernmentAction {
  id: string;
  government_user_id: string;
  action_type: GovernmentActionType;
  target_type: GovernmentActionTargetType;
  target_id: string;
  target_title?: string | null;
  title: string;
  description?: string | null;
  status: GovernmentActionStatus;
  priority: GovernmentActionPriority;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface GovernmentActionsSummaryCounts {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  critical_priority: number;
}

export interface GovernmentActionsPage {
  items: GovernmentAction[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  summary_counts: GovernmentActionsSummaryCounts;
}

// ============================================================================
// Step 8H: Dashboard Priorities
// ============================================================================

export interface GovernmentDashboardPriorities {
  pending_reviews: Array<{
    id: string;
    title: string;
    category?: string | null;
    urgency?: string | null;
    created_at: string;
  }>;
  clarification_challenges: Array<{
    id: string;
    title: string;
    category?: string | null;
    created_at: string;
  }>;
  high_priority_challenges: Array<{
    id: string;
    title: string;
    category?: string | null;
    priority_level: string;
    created_at: string;
  }>;
  open_actions: Array<{
    id: string;
    title: string;
    action_type: string;
    target_type: string;
    target_id: string;
    priority: string;
    due_date?: string | null;
  }>;
  active_pilots: Array<{
    id: string;
    title: string;
    project_id: string;
    status: string;
    location: string;
  }>;
}






