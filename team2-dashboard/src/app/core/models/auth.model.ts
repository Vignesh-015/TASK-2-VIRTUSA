import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'HR' | 'EMPLOYEE';
}

export interface LoginResponse {
  token: string;
  user: User;
}
