import { User, UserRole } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
