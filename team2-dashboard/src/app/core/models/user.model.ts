/**
 * AuthUser represents the authenticated session user stored in memory and local storage
 * following login or registration. It carries session-level credentials, profile summary,
 * and current role clearances.
 */

export type UserRole = 'ADMIN' | 'HR' | 'EMPLOYEE';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  phone?: string;
  joinDate?: string;
  location?: string;
  status?: 'ACTIVE' | 'ONBOARDING' | 'ON_LEAVE' | 'INACTIVE';
}
