/**
 * ============================================================================
 * BACKEND CONTRACT (Spring Boot API - com.sec.team2.ems.dashboard)
 * ============================================================================
 *
 * 1. GET /api/dashboard/stats
 *    Response (200 OK):
 *    {
 *      "totalEmployees": 21,
 *      "activeEmployees": 15,
 *      "onboardingEmployees": 0,
 *      "onLeaveEmployees": 0,
 *      "inactiveEmployees": 6,
 *      "newJoinersThisMonth": 5,
 *      "totalDepartments": 8,
 *      "activePercentage": 71.4
 *    }
 *
 * 2. GET /api/dashboard/departments
 *    Response (200 OK):
 *    [
 *      { "department": "Engineering", "headcount": 9, "percentage": 42.9 },
 *      { "department": "Finance & Operations", "headcount": 4, "percentage": 19.0 },
 *      ...
 *    ]
 *
 * 3. GET /api/dashboard/recent?limit=5
 *    Response (200 OK):
 *    [
 *      {
 *        "id": 28,
 *        "employeeCode": "EMP-1021",
 *        "fullName": "Kiran Bedi",
 *        "department": "Support",
 *        "designation": "Senior Helpdesk Specialist",
 *        "joinedOn": "2026-11-20",
 *        "status": "INACTIVE"
 *      }
 *    ]
 * ============================================================================
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ActivityItem,
  DashboardStats,
  DashboardStatsResponse,
  DepartmentCount,
  DepartmentHeadcountResponse,
  RecentEmployeeResponse
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Set to false when connecting to the live Spring Boot REST API
  private readonly useMock: boolean = false;

  private readonly apiUrl: string = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Retrieves overall staff metrics from GET /api/dashboard/stats.
   */
  getDashboardStats(): Observable<DashboardStatsResponse> {
    if (this.useMock || environment.useMockApi) {
      const mockStats: DashboardStatsResponse = {
        totalEmployees: 21,
        activeEmployees: 15,
        onboardingEmployees: 0,
        onLeaveEmployees: 0,
        inactiveEmployees: 6,
        newJoinersThisMonth: 5,
        totalDepartments: 8,
        activePercentage: 71.4
      };
      return of(mockStats).pipe(delay(200));
    }

    return this.http.get<DashboardStatsResponse>(`${this.apiUrl}/stats`);
  }

  /**
   * Retrieves department breakdown counts from GET /api/dashboard/departments.
   */
  getDepartmentHeadcounts(): Observable<DepartmentHeadcountResponse[]> {
    if (this.useMock || environment.useMockApi) {
      const mockDepartments: DepartmentHeadcountResponse[] = [
        { department: 'Engineering', headcount: 9, percentage: 42.9 },
        { department: 'Finance & Operations', headcount: 4, percentage: 19.0 },
        { department: 'Human Resources', headcount: 4, percentage: 19.0 },
        { department: 'Support', headcount: 3, percentage: 14.3 },
        { department: 'Sales & Partnerships', headcount: 1, percentage: 4.8 },
        { department: 'AI DEVELOPMENT', headcount: 0, percentage: 0.0 },
        { department: 'Marketing', headcount: 0, percentage: 0.0 },
        { department: 'Product & Design', headcount: 0, percentage: 0.0 }
      ];
      return of(mockDepartments).pipe(delay(200));
    }

    return this.http.get<DepartmentHeadcountResponse[]>(`${this.apiUrl}/departments`);
  }

  /**
   * Retrieves recent employee additions from GET /api/dashboard/recent.
   */
  getRecentEmployees(limit: number = 5): Observable<RecentEmployeeResponse[]> {
    if (this.useMock || environment.useMockApi) {
      const mockRecent: RecentEmployeeResponse[] = [
        { id: 28, employeeCode: 'EMP-1021', fullName: 'Kiran Bedi', department: 'Support', designation: 'Senior Helpdesk Specialist', joinedOn: '2026-11-20', status: 'INACTIVE' },
        { id: 27, employeeCode: 'EMP-1020', fullName: 'Rakesh R', department: 'Engineering', designation: 'Frontend Architect', joinedOn: '2026-11-19', status: 'ACTIVE' },
        { id: 18, employeeCode: 'EMP-1016', fullName: 'Yuvan Sarathy S', department: 'Engineering', designation: 'SDE-1', joinedOn: '2026-11-19', status: 'ACTIVE' },
        { id: 17, employeeCode: 'EMP-1015', fullName: 'Deepak Varma', department: 'Engineering', designation: 'Senior Frontend Engineer', joinedOn: '2026-11-19', status: 'ACTIVE' },
        { id: 15, employeeCode: 'EMP-1013', fullName: 'Manimaran AK', department: 'Engineering', designation: 'Software Engineer', joinedOn: '2026-11-14', status: 'ACTIVE' }
      ].slice(0, limit);
      return of(mockRecent).pipe(delay(200));
    }

    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<RecentEmployeeResponse[]>(`${this.apiUrl}/recent`, { params });
  }

  // --------------------------------------------------------------------------
  // Retained for backward compatibility with unused components and existing tests
  // --------------------------------------------------------------------------

  /**
   * Legacy staff metrics.
   */
  getStats(): Observable<DashboardStats> {
    if (this.useMock || environment.useMockApi) {
      const mockStats: DashboardStats = {
        totalUsers: 128,
        activeUsers: 112,
        inactiveUsers: 16,
        departments: 8,
        onLeave: 6
      };
      return of(mockStats).pipe(delay(400));
    }

    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Legacy department breakdown counts.
   */
  getDepartmentCounts(): Observable<DepartmentCount[]> {
    if (this.useMock || environment.useMockApi) {
      const mockDepartments: DepartmentCount[] = [
        { department: 'Engineering', count: 34 },
        { department: 'Sales', count: 26 },
        { department: 'Operations', count: 22 },
        { department: 'Support', count: 15 },
        { department: 'Finance', count: 14 },
        { department: 'Human Resources', count: 9 },
        { department: 'Marketing', count: 8 }
      ];
      return of(mockDepartments).pipe(delay(400));
    }

    return this.http.get<DepartmentCount[]>(`${this.apiUrl}/departments`);
  }

  /**
   * Legacy recent audit log activity items.
   */
  getRecentActivity(): Observable<ActivityItem[]> {
    const now = Date.now();
    const mockActivity: ActivityItem[] = [
      {
        id: 1,
        message: 'Added employee Karthik Subramanian to Engineering',
        actor: 'Priya Sharma',
        type: 'CREATED',
        timestamp: new Date(now - 1000 * 60 * 110).toISOString()
      },
      {
        id: 2,
        message: 'Marked Divya Lakshmi as inactive',
        actor: 'Admin User',
        type: 'UPDATED',
        timestamp: new Date(now - 1000 * 60 * 270).toISOString()
      }
    ];
    return of(mockActivity).pipe(delay(400));
  }
}
