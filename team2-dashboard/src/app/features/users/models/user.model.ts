/**
 * User describes a personnel / employee directory record returned by the /api/users
 * REST endpoints, managing profile details, employment statuses, assignments,
 * and organization-wide account metadata.
 */

import { UserRole } from '../../../core/models/user.model';

export { UserRole };

export type UserStatus = 'ACTIVE' | 'ONBOARDING' | 'ON_LEAVE' | 'INACTIVE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';

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
