export type UserRole = 'ADMIN' | 'HR' | 'EMPLOYEE';

export interface User {
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
