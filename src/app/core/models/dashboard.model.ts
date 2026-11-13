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
