import { UserRole } from '../../../core/models/user.model';

export { UserRole };

export type UserStatus = 'ACTIVE' | 'ONBOARDING' | 'ON_LEAVE' | 'INACTIVE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';

export const USER_DEPARTMENTS = [
  'Engineering',
  'HR',
  'Finance',
  'Sales',
  'Operations',
  'Support'
] as const;

export interface User {
  id: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation?: string;
  role: UserRole;
  status: UserStatus;
  employmentType?: EmploymentType;
  joinedOn: string;
  workLocation?: string;
  managerName?: string;
  skills?: string;
  bio?: string;
}

export interface UserNotice {
  type: 'success' | 'error';
  message: string;
}
