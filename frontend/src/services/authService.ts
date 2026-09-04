import { api, getStoredToken, setStoredToken, removeStoredToken, ApiError } from "./api";
import { AuthUser, UserRole } from "../types";
import {
  LoginCredentials,
  LoginResponse,
  CitizenRegisterPayload,
  UniversityRegisterPayload,
  IndustryRegisterPayload,
  GovernmentRegisterPayload,
} from "../auth/authTypes";

export interface RegisterResponse {
  access_token?: string;
  token_type?: string;
  user?: AuthUser;
  message?: string;
}

/**
 * Normalizes user objects received from FastAPI/MongoDB into a consistent AuthUser shape.
 */
export function normalizeAuthUser(rawUser: any): AuthUser {
  if (!rawUser) {
    throw new Error("Invalid user payload received from server");
  }

  // Support both direct fields and nested profile dict
  const profile = (typeof rawUser.profile === "object" && rawUser.profile !== null)
    ? rawUser.profile
    : {};

  const name =
    rawUser.name ||
    profile.name ||
    profile.full_name ||
    profile.contact_person ||
    profile.officer_name ||
    rawUser.email?.split("@")[0] ||
    "User";

  const organization =
    rawUser.organization ||
    profile.organization ||
    profile.university_name ||
    profile.company_name ||
    profile.department_name ||
    "";

  const designation =
    rawUser.designation ||
    profile.designation ||
    "";

  const phone =
    rawUser.phone ||
    profile.phone ||
    "";

  const state =
    rawUser.state ||
    profile.state ||
    "";

  const district =
    rawUser.district ||
    profile.district ||
    "";

  const sector =
    rawUser.sector ||
    profile.sector ||
    profile.industry_sector ||
    "";

  const department =
    rawUser.department ||
    profile.department ||
    profile.department_type ||
    "";

  const expertise = Array.isArray(rawUser.expertise)
    ? rawUser.expertise
    : Array.isArray(profile.expertise)
    ? profile.expertise
    : [];

  const capabilities = Array.isArray(rawUser.capabilities)
    ? rawUser.capabilities
    : Array.isArray(profile.support_capabilities)
    ? profile.support_capabilities
    : [];

  const avatar =
    rawUser.avatar ||
    (name ? name.charAt(0).toUpperCase() : rawUser.email?.charAt(0).toUpperCase() || "U");

  return {
    id: rawUser.id || rawUser._id || String(Date.now()),
    email: rawUser.email,
    role: (rawUser.role as UserRole) || "citizen",
    name,
    organization,
    designation,
    phone,
    state,
    district,
    sector,
    department,
    expertise,
    capabilities,
    avatar,
    profile,
    created_at: rawUser.created_at || rawUser.joinedDate || new Date().toISOString(),
  };
}

export const authService = {
  /**
   * Log in with email, password, and expected role.
   */
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const response = await api.post<LoginResponse>("/api/auth/login", {
      email: credentials.email.trim(),
      password: credentials.password,
      role: credentials.role,
    });

    if (!response || !response.access_token) {
      throw new ApiError("Invalid response from login endpoint. No access token provided.", 500);
    }

    setStoredToken(response.access_token);
    const normalizedUser = normalizeAuthUser(response.user);

    return {
      user: normalizedUser,
      token: response.access_token,
    };
  },

  /**
   * Register a citizen.
   */
  async registerCitizen(payload: CitizenRegisterPayload): Promise<RegisterResponse> {
    return api.post<RegisterResponse>("/api/auth/register/citizen", payload);
  },

  /**
   * Register a university/faculty entity.
   */
  async registerUniversity(payload: UniversityRegisterPayload): Promise<RegisterResponse> {
    return api.post<RegisterResponse>("/api/auth/register/university", payload);
  },

  /**
   * Register an industry partner.
   */
  async registerIndustry(payload: IndustryRegisterPayload): Promise<RegisterResponse> {
    return api.post<RegisterResponse>("/api/auth/register/industry", payload);
  },

  /**
   * Register a government official.
   */
  async registerGovernment(payload: GovernmentRegisterPayload): Promise<RegisterResponse> {
    return api.post<RegisterResponse>("/api/auth/register/government", payload);
  },

  /**
   * Generic role registration dispatcher.
   */
  async register(role: UserRole, payload: Record<string, unknown>): Promise<RegisterResponse> {
    switch (role) {
      case "citizen":
        return this.registerCitizen(payload as unknown as CitizenRegisterPayload);
      case "university":
        return this.registerUniversity(payload as unknown as UniversityRegisterPayload);
      case "industry":
        return this.registerIndustry(payload as unknown as IndustryRegisterPayload);
      case "government":
        return this.registerGovernment(payload as unknown as GovernmentRegisterPayload);
      default:
        throw new ApiError(`Unsupported registration role: ${role}`, 400);
    }
  },

  /**
   * Verify session token and retrieve current authenticated user info.
   */
  async getMe(): Promise<AuthUser> {
    const token = getStoredToken();
    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await api.get<any>("/api/auth/me");
    const rawUser = response?.user || response;
    return normalizeAuthUser(rawUser);
  },

  /**
   * Sign out: notify backend if endpoint is available, and clear client-side token.
   */
  async logout(): Promise<void> {
    const token = getStoredToken();
    if (token) {
      try {
        await api.post("/api/auth/logout", {});
      } catch (err) {
        // Even if the backend logout endpoint fails or doesn't exist yet, clear local token
        console.warn("[UniBridge Auth] Backend logout call failed or endpoint not available:", err);
      }
    }
    removeStoredToken();
  },

  /**
   * Check if an access token is stored.
   */
  hasStoredToken(): boolean {
    return !!getStoredToken();
  },

  /**
   * Retrieve the stored token string.
   */
  getStoredToken(): string | null {
    return getStoredToken();
  },
};
