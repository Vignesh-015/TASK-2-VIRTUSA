export type EmployeeStatus = 'ACTIVE' | 'ONBOARDING' | 'ON_LEAVE' | 'INACTIVE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  designation: string;
  joiningDate: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  location?: string;
  manager?: string;
  salaryBand?: string;
  emergencyContact?: EmergencyContact;
  skills?: string[];
  bio?: string;
}

export interface EmployeeFilter {
  search?: string;
  department?: string;
  status?: string;
  employmentType?: string;
  sortBy?: 'name' | 'joiningDate' | 'department' | 'employeeId';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

