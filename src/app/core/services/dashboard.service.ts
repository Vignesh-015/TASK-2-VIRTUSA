/**
 * ============================================================================
 * BACKEND CONTRACT (Spring Boot API - Yuvashree)
 * ============================================================================
 *
 * 1. GET /api/dashboard/stats
 *    Response (200 OK):
 *    {
 *      "totalUsers": 128,
 *      "activeUsers": 112,
 *      "inactiveUsers": 16,
 *      "departments": 8,
 *      "onLeave": 6
 *    }
 *
 * 2. GET /api/dashboard/departments
 *    Response (200 OK):
 *    [
 *      { "department": "Engineering", "count": 34 },
 *      { "department": "Sales", "count": 26 },
 *      { "department": "Operations", "count": 22 },
 *      { "department": "Support", "count": 15 },
 *      { "department": "Finance", "count": 14 },
 *      { "department": "Human Resources", "count": 9 },
 *      { "department": "Marketing", "count": 8 }
 *    ]
 *
 * 3. GET /api/dashboard/recent
 *    Response (200 OK):
 *    [
 *      {
 *        "id": 1,
 *        "message": "Added employee Karthik Subramanian to Engineering",
 *        "actor": "Priya Sharma",
 *        "type": "CREATED",       // "CREATED" | "UPDATED" | "DELETED" | "LOGIN"
 *        "timestamp": "2026-11-11T16:30:00.000Z" // ISO 8601 string
 *      }
 *    ]
 * ============================================================================
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ActivityItem, DashboardStats, DepartmentCount } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  /**
   * Retrieves overall staff metrics.
   */
  getStats(): Observable<DashboardStats> {
    if (environment.useMockApi) {
      const mockStats: DashboardStats = {
        totalUsers: 128,
        activeUsers: 112,
        inactiveUsers: 16,
        departments: 8,
        onLeave: 6
      };
      return of(mockStats).pipe(delay(400));
    }

    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`);
  }

  /**
   * Retrieves department breakdown counts.
   */
  getDepartmentCounts(): Observable<DepartmentCount[]> {
    if (environment.useMockApi) {
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

    return this.http.get<DepartmentCount[]>(`${environment.apiUrl}/dashboard/departments`);
  }

  /**
   * Retrieves recent audit log activity items spread over the last two days.
   */
  getRecentActivity(): Observable<ActivityItem[]> {
    if (environment.useMockApi) {
      const now = Date.now();
      const mockActivity: ActivityItem[] = [
        {
          id: 1,
          message: 'Added employee Karthik Subramanian to Engineering',
          actor: 'Priya Sharma',
          type: 'CREATED',
          timestamp: new Date(now - 1000 * 60 * 110).toISOString() // ~2 hours ago
        },
        {
          id: 2,
          message: 'Marked Divya Lakshmi as inactive',
          actor: 'Admin User',
          type: 'UPDATED',
          timestamp: new Date(now - 1000 * 60 * 270).toISOString() // ~4.5 hours ago
        },
        {
          id: 3,
          message: 'Logged in from Chennai office network',
          actor: 'Arun Kumar',
          type: 'LOGIN',
          timestamp: new Date(now - 1000 * 60 * 430).toISOString() // ~7 hours ago
        },
        {
          id: 4,
          message: 'Transferred Rajesh Nair from Support to Operations',
          actor: 'Priya Sharma',
          type: 'UPDATED',
          timestamp: new Date(now - 1000 * 60 * 60 * 22).toISOString() // Yesterday, ~22 hours ago
        },
        {
          id: 5,
          message: 'Removed contractor record for Vikram Sen',
          actor: 'Admin User',
          type: 'DELETED',
          timestamp: new Date(now - 1000 * 60 * 60 * 26).toISOString() // Yesterday, ~26 hours ago
        },
        {
          id: 6,
          message: 'Registered new joinee Ananya Iyer to Human Resources',
          actor: 'Priya Sharma',
          type: 'CREATED',
          timestamp: new Date(now - 1000 * 60 * 60 * 31).toISOString() // Yesterday, ~31 hours ago
        },
        {
          id: 7,
          message: 'Logged in to staff management portal',
          actor: 'Suresh Patel',
          type: 'LOGIN',
          timestamp: new Date(now - 1000 * 60 * 60 * 42).toISOString() // 2 days ago
        }
      ];
      return of(mockActivity).pipe(delay(400));
    }

    return this.http.get<ActivityItem[]>(`${environment.apiUrl}/dashboard/recent`);
  }
}
