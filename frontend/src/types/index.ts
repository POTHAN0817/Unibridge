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
