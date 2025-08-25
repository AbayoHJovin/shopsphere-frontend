import { UserRole } from './constants';

// Auth-related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userName: string;
  userEmail: string;
  message: string;
  userId: string;
  userPhone?: string;
  role: UserRole;
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