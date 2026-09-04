import { UserProfile, UserRole } from "../types";

export interface AuthState {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  role: UserRole;
  rememberMe?: boolean;
}

export interface CitizenRegisterData {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  state: string;
  district: string;
  termsAccepted: boolean;
}

export interface UniversityRegisterData {
  universityName: string;
  email: string;
  contactPerson: string;
  designation: string;
  password?: string;
  state: string;
  district: string;
  expertise: string[];
}

export interface IndustryRegisterData {
  companyName: string;
  email: string;
  contactPerson: string;
  designation: string;
  password?: string;
  sector: string;
  location: string;
  expertise: string[];
  capabilities: string[];
}

export interface GovernmentRegisterData {
  departmentName: string;
  email: string;
  officerName: string;
  designation: string;
  password?: string;
  state: string;
  district: string;
  departmentType: string;
}

export type RegisterData =
  | { role: "citizen"; data: CitizenRegisterData }
  | { role: "university"; data: UniversityRegisterData }
  | { role: "industry"; data: IndustryRegisterData }
  | { role: "government"; data: GovernmentRegisterData };

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (payload: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}
