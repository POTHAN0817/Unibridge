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
