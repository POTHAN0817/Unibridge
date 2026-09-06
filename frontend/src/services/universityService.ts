import { api } from "./api";
import {
  UniversityProfile,
  UniversityMatchesResult,
  UniversityMatchedChallenge,
  UniversityChallengeDossier,
  UniversityInterest,
  FacultyMember,
  FacultyCreateInput,
  StudentMember,
  StudentCreateInput,
  StudentUpdateInput,
  UniversityTeam,
  TeamCreateInput,
  TeamUpdateInput,
  UniversityProject,
  ProjectCreateInput,
  ProjectUpdateInput,
  ProjectMilestone,
  MilestoneCreateInput,
  MilestoneUpdateInput,
  ProjectResearch,
  ResearchCreateInput,
  ResearchUpdateInput,
  ProjectSolution,
  SolutionProposalInput,
  ProjectPrototype,
  PrototypeCreateInput,
  PrototypeUpdateInput,
  ProjectPilot,
  PilotCreateInput,
  PilotUpdateInput,
  DeploymentReadiness,
  DeploymentReadinessUpdateInput,
  ProjectActivity,
  Challenge,
} from "../types";
import { mapBackendChallengeToFrontend, BackendChallenge } from "./challengeService";

export const universityService = {
  /**
   * Fetch authenticated university profile from MongoDB.
   */
  async getMyProfile(): Promise<UniversityProfile | null> {
    try {
      return await api.get<UniversityProfile>("/api/universities/profile");
    } catch {
      return null;
    }
  },

  /**
   * Create or update authenticated university profile in MongoDB.
   */
  async saveProfile(profile: Partial<UniversityProfile>): Promise<UniversityProfile> {
    return await api.post<UniversityProfile>("/api/universities/profile", profile);
  },

  /**
   * Fetch public university details by ID.
   */
  async getUniversityById(id: string): Promise<UniversityProfile | null> {
    try {
      return await api.get<UniversityProfile>(`/api/universities/${id}`);
    } catch {
      return null;
    }
  },

  /**
   * Fetch all universities.
   */
  async getUniversities(): Promise<any[]> {
    try {
      return await api.get<any[]>("/api/universities");
    } catch {
      return [];
    }
  },

  /**
   * Fetch real challenges matching the authenticated university's capabilities.
   * Throws on error so callers can render specific error or profile-incomplete states.
   */
  async getMatchedChallenges(): Promise<UniversityMatchedChallenge[]> {
    return await api.get<UniversityMatchedChallenge[]>("/api/universities/challenges/matches");
  },

  /**
   * Fetch complete challenge dossier and institutional match evaluation for authenticated university.
   */
  async getUniversityChallengeDetails(challengeId: string): Promise<UniversityChallengeDossier> {
    return await api.get<UniversityChallengeDossier>(`/api/universities/challenges/${challengeId}`);
  },

  /**
   * Retrieve calculated real university matches for a specific challenge.
   */
  async getChallengeUniversityMatches(challengeId: string): Promise<UniversityMatchesResult> {
    try {
      return await api.get<UniversityMatchesResult>(`/api/challenges/${challengeId}/university-matches`);
    } catch {
      return {
        status: "no_candidates",
        matches: [],
        model_version: "unibridge-university-match-v1",
      };
    }
  },

  /**
   * Express genuine university interest in adopting a civic challenge.
   */
  async expressInterest(challengeId: string, message?: string): Promise<UniversityInterest> {
    return await api.post<UniversityInterest>(`/api/universities/challenges/${challengeId}/interest`, {
      message,
    });
  },

  /**
   * Fetch authenticated university's interest status for a specific challenge.
   */
  async getChallengeInterest(challengeId: string): Promise<UniversityInterest | null> {
    try {
      return await api.get<UniversityInterest>(`/api/universities/challenges/${challengeId}/interest`);
    } catch {
      return null;
    }
  },

  /**
   * Fetch all challenge adoption interests submitted by authenticated university.
   */
  async getUniversityInterests(): Promise<UniversityInterest[]> {
    try {
      return await api.get<UniversityInterest[]>("/api/universities/interests");
    } catch {
      return [];
    }
  },

  /**
   * Fetch real faculty roster belonging to authenticated university.
   */
  async getFacultyList(params?: { search?: string; department?: string }): Promise<FacultyMember[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.department) query.append("department", params.department);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return await api.get<FacultyMember[]>(`/api/universities/faculty${qs}`);
  },

  /**
   * Retrieve a specific faculty member by ID.
   */
  async getFacultyById(facultyId: string): Promise<FacultyMember> {
    return await api.get<FacultyMember>(`/api/universities/faculty/${facultyId}`);
  },

  /**
   * Add a new faculty member for authenticated university.
   */
  async createFaculty(data: FacultyCreateInput): Promise<FacultyMember> {
    return await api.post<FacultyMember>("/api/universities/faculty", data);
  },

  /**
   * Update an existing faculty member.
   */
  async updateFaculty(facultyId: string, data: Partial<FacultyCreateInput>): Promise<FacultyMember> {
    return await api.put<FacultyMember>(`/api/universities/faculty/${facultyId}`, data);
  },

  /**
   * Delete a faculty member.
   */
  async deleteFaculty(facultyId: string): Promise<{ message: string; id: string }> {
    return await api.delete<{ message: string; id: string }>(`/api/universities/faculty/${facultyId}`);
  },

  /**
   * Fetch students belonging to the authenticated university institution.
   */
  async getStudentList(params?: {
    search?: string;
    department?: string;
    skill?: string;
    availability?: boolean;
  }): Promise<StudentMember[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.department) query.append("department", params.department);
    if (params?.skill) query.append("skill", params.skill);
    if (params?.availability !== undefined) query.append("availability", String(params.availability));
    const qs = query.toString() ? `?${query.toString()}` : "";
    return await api.get<StudentMember[]>(`/api/universities/students${qs}`);
  },

  /**
   * Fetch a single student record by ID.
   */
  async getStudentById(studentId: string): Promise<StudentMember> {
    return await api.get<StudentMember>(`/api/universities/students/${studentId}`);
  },

  /**
   * Enroll a student to the authenticated university.
   */
  async createStudent(data: StudentCreateInput): Promise<StudentMember> {
    return await api.post<StudentMember>("/api/universities/students", data);
  },

  /**
   * Update student institutional competencies and information.
   */
  async updateStudent(studentId: string, data: StudentUpdateInput): Promise<StudentMember> {
    return await api.put<StudentMember>(`/api/universities/students/${studentId}`, data);
  },

  /**
   * Fetch all teams formed by the authenticated university.
   */
  async getTeamList(params?: {
    search?: string;
    status?: string;
    challenge_id?: string;
  }): Promise<UniversityTeam[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    if (params?.challenge_id) query.append("challenge_id", params.challenge_id);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return await api.get<UniversityTeam[]>(`/api/universities/teams${qs}`);
  },

  /**
   * Fetch single team by ID.
   */
  async getTeamById(teamId: string): Promise<UniversityTeam> {
    return await api.get<UniversityTeam>(`/api/universities/teams/${teamId}`);
  },

  /**
   * Create / form a new multidisciplinary innovation team.
   */
  async createTeam(data: TeamCreateInput): Promise<UniversityTeam> {
    return await api.post<UniversityTeam>("/api/universities/teams", data);
  },

  /**
   * Update an existing team.
   */
  async updateTeam(teamId: string, data: TeamUpdateInput): Promise<UniversityTeam> {
    return await api.put<UniversityTeam>(`/api/universities/teams/${teamId}`, data);
  },

  /**
   * Delete a team.
   */
  async deleteTeam(teamId: string): Promise<{ message: string; id: string }> {
    return await api.delete<{ message: string; id: string }>(`/api/universities/teams/${teamId}`);
  },

  /**
   * Fetch all projects created by the authenticated university.
   */
  async getProjectList(params?: {
    search?: string;
    status?: string;
    team_id?: string;
    challenge_id?: string;
  }): Promise<UniversityProject[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    if (params?.team_id) query.append("team_id", params.team_id);
    if (params?.challenge_id) query.append("challenge_id", params.challenge_id);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return await api.get<UniversityProject[]>(`/api/universities/projects${qs}`);
  },

  /**
   * Fetch single project by ID with hydrated team, roster, and challenge data.
   */
  async getProjectById(projectId: string): Promise<UniversityProject> {
    return await api.get<UniversityProject>(`/api/universities/projects/${projectId}`);
  },

  /**
   * Create a new project workspace.
   */
  async createProject(data: ProjectCreateInput): Promise<UniversityProject> {
    return await api.post<UniversityProject>("/api/universities/projects", data);
  },

  /**
   * Update an existing project.
   */
  async updateProject(projectId: string, data: ProjectUpdateInput): Promise<UniversityProject> {
    return await api.put<UniversityProject>(`/api/universities/projects/${projectId}`, data);
  },

  /**
   * Delete a project.
   */
  async deleteProject(projectId: string): Promise<{ message: string; id: string }> {
    return await api.delete<{ message: string; id: string }>(`/api/universities/projects/${projectId}`);
  },

  // =========================================================================
  // Part 2: Milestones API
  // =========================================================================

  async getMilestones(projectId: string): Promise<ProjectMilestone[]> {
    return await api.get<ProjectMilestone[]>(`/api/universities/projects/${projectId}/milestones`);
  },

  async createMilestone(projectId: string, data: MilestoneCreateInput): Promise<ProjectMilestone> {
    return await api.post<ProjectMilestone>(`/api/universities/projects/${projectId}/milestones`, data);
  },

  async updateMilestone(projectId: string, milestoneId: string, data: MilestoneUpdateInput): Promise<ProjectMilestone> {
    return await api.put<ProjectMilestone>(`/api/universities/projects/${projectId}/milestones/${milestoneId}`, data);
  },

  async deleteMilestone(projectId: string, milestoneId: string): Promise<{ message: string; id: string }> {
    return await api.delete<{ message: string; id: string }>(`/api/universities/projects/${projectId}/milestones/${milestoneId}`);
  },

  // =========================================================================
  // Part 3: Research API
  // =========================================================================

  async getResearchList(projectId: string): Promise<ProjectResearch[]> {
    return await api.get<ProjectResearch[]>(`/api/universities/projects/${projectId}/research`);
  },

  async createResearch(projectId: string, data: ResearchCreateInput): Promise<ProjectResearch> {
    return await api.post<ProjectResearch>(`/api/universities/projects/${projectId}/research`, data);
  },

  async updateResearch(projectId: string, researchId: string, data: ResearchUpdateInput): Promise<ProjectResearch> {
    return await api.put<ProjectResearch>(`/api/universities/projects/${projectId}/research/${researchId}`, data);
  },

  async deleteResearch(projectId: string, researchId: string): Promise<{ message: string; id: string }> {
    return await api.delete<{ message: string; id: string }>(`/api/universities/projects/${projectId}/research/${researchId}`);
  },

  // =========================================================================
  // Part 4: Solution Proposal API
  // =========================================================================

  async getSolution(projectId: string): Promise<ProjectSolution | null> {
    return await api.get<ProjectSolution | null>(`/api/universities/projects/${projectId}/solution`);
  },

  async saveSolution(projectId: string, data: SolutionProposalInput): Promise<ProjectSolution> {
    return await api.post<ProjectSolution>(`/api/universities/projects/${projectId}/solution`, data);
  },

  // =========================================================================
  // Part 5: Prototypes API
  // =========================================================================

  async getPrototypeList(projectId: string): Promise<ProjectPrototype[]> {
    return await api.get<ProjectPrototype[]>(`/api/universities/projects/${projectId}/prototypes`);
  },

  async getPrototypeById(projectId: string, prototypeId: string): Promise<ProjectPrototype> {
    return await api.get<ProjectPrototype>(`/api/universities/projects/${projectId}/prototypes/${prototypeId}`);
  },

  async createPrototype(projectId: string, data: PrototypeCreateInput): Promise<ProjectPrototype> {
    return await api.post<ProjectPrototype>(`/api/universities/projects/${projectId}/prototypes`, data);
  },

  async updatePrototype(projectId: string, prototypeId: string, data: PrototypeUpdateInput): Promise<ProjectPrototype> {
    return await api.put<ProjectPrototype>(`/api/universities/projects/${projectId}/prototypes/${prototypeId}`, data);
  },

  async deletePrototype(projectId: string, prototypeId: string): Promise<{ message: string; id: string }> {
    return await api.delete<{ message: string; id: string }>(`/api/universities/projects/${projectId}/prototypes/${prototypeId}`);
  },

  async uploadPrototypeArtifact(projectId: string, file: File): Promise<{ artifact_url: string; artifact_public_id: string; artifact_type: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return await api.post<{ artifact_url: string; artifact_public_id: string; artifact_type: string }>(
      `/api/universities/projects/${projectId}/prototypes/upload-artifact`,
      formData
    );
  },

  // =========================================================================
  // Part 6: Pilots API
  // =========================================================================

  async getPilotList(projectId: string): Promise<ProjectPilot[]> {
    return await api.get<ProjectPilot[]>(`/api/universities/projects/${projectId}/pilots`);
  },

  async getPilotById(projectId: string, pilotId: string): Promise<ProjectPilot> {
    return await api.get<ProjectPilot>(`/api/universities/projects/${projectId}/pilots/${pilotId}`);
  },

  async createPilot(projectId: string, data: PilotCreateInput): Promise<ProjectPilot> {
    return await api.post<ProjectPilot>(`/api/universities/projects/${projectId}/pilots`, data);
  },

  async updatePilot(projectId: string, pilotId: string, data: PilotUpdateInput): Promise<ProjectPilot> {
    return await api.put<ProjectPilot>(`/api/universities/projects/${projectId}/pilots/${pilotId}`, data);
  },

  async deletePilot(projectId: string, pilotId: string): Promise<{ message: string; id: string }> {
    return await api.delete<{ message: string; id: string }>(`/api/universities/projects/${projectId}/pilots/${pilotId}`);
  },

  // =========================================================================
  // Part 7: Deployment Readiness API
  // =========================================================================

  async getDeploymentReadiness(projectId: string): Promise<DeploymentReadiness> {
    return await api.get<DeploymentReadiness>(`/api/universities/projects/${projectId}/deployment-readiness`);
  },

  async updateDeploymentReadiness(projectId: string, data: DeploymentReadinessUpdateInput): Promise<DeploymentReadiness> {
    return await api.put<DeploymentReadiness>(`/api/universities/projects/${projectId}/deployment-readiness`, data);
  },

  // =========================================================================
  // Part 9: Project Activity API
  // =========================================================================

  async getProjectActivity(projectId: string): Promise<ProjectActivity[]> {
    return await api.get<ProjectActivity[]>(`/api/universities/projects/${projectId}/activity`);
  },
};


