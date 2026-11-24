export interface DashboardStatsResponse {
  totalEmployees: number;
  activeEmployees: number;
  onboardingEmployees: number;
  onLeaveEmployees: number;
  inactiveEmployees: number;
  newJoinersThisMonth: number;
  totalDepartments: number;
  activePercentage: number;
}

export interface DepartmentHeadcountResponse {
  department: string;
  headcount: number;
  percentage: number;
}

export interface RecentEmployeeResponse {
  id: number;
  employeeCode: string;
  fullName: string;
  department: string;
  designation: string;
  joinedOn: string;
  status: 'ACTIVE' | 'ONBOARDING' | 'ON_LEAVE' | 'INACTIVE' | string;
}

// Retained for backward compatibility with unused dashboard components and tests
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  departments: number;
  onLeave: number;
}

export interface DepartmentCount {
  department: string;
  count: number;
}

export type ActivityType = 'CREATED' | 'UPDATED' | 'DELETED' | 'LOGIN';

export interface ActivityItem {
  id: number;
  message: string;
  actor: string;
  type: ActivityType;
  timestamp: string; // ISO string
}
