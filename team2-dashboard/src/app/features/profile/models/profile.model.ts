/**
 * Profile models matching the backend /api/profile REST contract.
 */

export interface ProfileResponse {
  id: number;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joinedOn: string;
  status: string;
  employmentType?: string;
  workLocation?: string;
  managerName?: string;
  skills?: string;
  bio?: string;
  role: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
}

export interface UserProfile {
  id: number;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joinedOn: string;
  status: string;
  employmentType?: string;
  workLocation?: string;
  managerName?: string;
  skills: string[];
  skillsRaw: string;
  bio?: string;
  role: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  avatar?: string;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  phone: string;
  workLocation?: string;
  skills?: string;
  bio?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MessageResponse {
  message: string;
}

export interface ColleagueResponse {
  id: number;
  fullName: string;
  designation: string;
  workLocation?: string;
  avatar?: string;
  status?: string;
}


