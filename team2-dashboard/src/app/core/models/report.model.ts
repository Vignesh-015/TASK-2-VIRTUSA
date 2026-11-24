/**
 * Models for the Reports & Analytics module (/api/reports/*).
 */

export interface DepartmentReportItem {
  department: string;
  headcount: number;
  percentage: number;
}

export interface StatusReportItem {
  status: 'ACTIVE' | 'ONBOARDING' | 'ON_LEAVE' | 'INACTIVE' | string;
  count: number;
  percentage: number;
}

export interface MonthlyJoinItem {
  month: string; // "yyyy-MM"
  count: number;
}

export interface ReportSummaryResponse {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  joinedInRange: number;
}

export interface ReportDateRange {
  startDate?: string | null;
  endDate?: string | null;
}

