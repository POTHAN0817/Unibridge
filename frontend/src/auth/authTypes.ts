import { AuthUser, UserRole } from "../types";

export interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  user: AuthUser;
}

export interface CitizenRegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password?: string;
  confirm_password?: string;
  state: string;
  district: string;
  terms_accepted: boolean;
}

export interface UniversityRegisterPayload {
  university_name: string;
  university_email: string;
  contact_person: string;
  designation: string;
  password?: string;
  confirm_password?: string;
  state: string;
  district: string;
  expertise: string[];
}

export interface IndustryRegisterPayload {
  company_name: string;
  official_email: string;
  contact_person: string;
  designation: string;
  password?: string;
  confirm_password?: string;
  industry_sector: string;
  location: string;
  expertise: string[];
  support_capabilities: string[];
}

export interface GovernmentRegisterPayload {
  department_name: string;
  official_email: string;
  officer_name: string;
  designation: string;
  password?: string;
  confirm_password?: string;
  state: string;
  district: string;
  department_type: string;
}

export type RegisterPayload =
  | CitizenRegisterPayload
  | UniversityRegisterPayload
  | IndustryRegisterPayload
  | GovernmentRegisterPayload;

export interface AuthResult {
  success: boolean;
  error?: string;
  autoLoggedIn?: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (role: UserRole, payload: Record<string, unknown>) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (profile: Partial<AuthUser>) => void;
}
