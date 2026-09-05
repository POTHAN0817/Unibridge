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
};
