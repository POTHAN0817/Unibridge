export type UserRole = "citizen" | "university" | "industry" | "government";

export type Role = UserRole | "faculty";

export type ChallengeStatus = "Submitted" | "AI Analyzed" | "Validated" | "Assigned" | "In Progress" | "Testing" | "Resolved";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
  joinedDate: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
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
  submittedBy: string;
  submittedDate: string;
  aiCategoryConfidence?: number;
  aiSummary?: string;
  requiredExpertise?: string[];
  urgency?: "low" | "medium" | "high";
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
