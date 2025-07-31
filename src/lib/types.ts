import { UserRole } from './constants';

// Auth-related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenType?: string | null;
}

export interface User {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

// Auth state type for Redux
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkingAuth: boolean;
} 