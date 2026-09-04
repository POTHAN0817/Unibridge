import { mockUsers } from "../data/mock/users";
import { UserProfile, UserRole } from "../types";
import { LoginCredentials, RegisterData } from "../auth/authTypes";

const STORAGE_KEY = "unibridge_auth_user";

export const authService = {
  getCurrentUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return null;
  },

  async login(credentials: LoginCredentials): Promise<UserProfile> {
    // Simulated async delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    // Select default mock user for the requested role or build based on input
    const defaultUser = mockUsers[credentials.role];
    const user: UserProfile = {
      ...(defaultUser || mockUsers.citizen),
      email: credentials.email || defaultUser?.email || "user@unibridge.org",
      role: credentials.role,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  async register(payload: RegisterData): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let newUser: UserProfile;

    switch (payload.role) {
      case "citizen":
        newUser = {
          id: `usr-cit-${Date.now().toString().slice(-4)}`,
          name: payload.data.fullName,
          email: payload.data.email,
          role: "citizen",
          phone: payload.data.phone,
          state: payload.data.state,
          district: payload.data.district,
          joinedDate: "Today",
        };
        break;
      case "university":
        newUser = {
          id: `usr-uni-${Date.now().toString().slice(-4)}`,
          name: payload.data.contactPerson,
          organization: payload.data.universityName,
          email: payload.data.email,
          role: "university",
          designation: payload.data.designation,
          state: payload.data.state,
          district: payload.data.district,
          expertise: payload.data.expertise,
          joinedDate: "Today",
        };
        break;
      case "industry":
        newUser = {
          id: `usr-ind-${Date.now().toString().slice(-4)}`,
          name: payload.data.contactPerson,
          organization: payload.data.companyName,
          email: payload.data.email,
          role: "industry",
          designation: payload.data.designation,
          sector: payload.data.sector,
          expertise: payload.data.expertise,
          capabilities: payload.data.capabilities,
          joinedDate: "Today",
        };
        break;
      case "government":
        newUser = {
          id: `usr-gov-${Date.now().toString().slice(-4)}`,
          name: payload.data.officerName,
          department: payload.data.departmentName,
          email: payload.data.email,
          role: "government",
          designation: payload.data.designation,
          state: payload.data.state,
          district: payload.data.district,
          joinedDate: "Today",
        };
        break;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  updateProfile(profileUpdate: Partial<UserProfile>): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) return null;
    const updated = { ...current, ...profileUpdate };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },
};
