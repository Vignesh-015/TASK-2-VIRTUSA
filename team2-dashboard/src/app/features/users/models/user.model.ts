import { UserRole } from '../../../core/models/user.model';

export { UserRole };

export type UserStatus = 'ACTIVE' | 'INACTIVE';

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
  fullName: string;
  email: string;
  phone: string;
  department: string;
  role: UserRole;
  status: UserStatus;
  joinedOn: string;
}

export interface UserNotice {
  type: 'success' | 'error';
  message: string;
}
