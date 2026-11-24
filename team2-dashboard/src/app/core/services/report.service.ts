import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DepartmentReportItem,
  MonthlyJoinItem,
  ReportDateRange,
  ReportSummaryResponse,
  StatusReportItem
} from '../models/report.model';

/**
 * Service connecting the Reports feature to the Spring Boot /api/reports REST endpoints.
 * Handles department breakdowns, status health distributions, monthly hiring volume, and KPI summaries.
 */
@Injectable({
  providedIn: 'root'
})
export class ReportService {
  // Set to false when connecting to the live Spring Boot REST API
  public useMock: boolean = false;

  private readonly apiUrl: string = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  /**
   * Retrieves department headcount and percentage distribution within an optional date range.
   */
  getDepartmentReport(range?: ReportDateRange): Observable<DepartmentReportItem[]> {
    if (this.useMock || environment.useMockApi) {
      return of(this.getMockDepartmentReport(range)).pipe(delay(200));
    }
    const params = this.buildParams(range);
    return this.http.get<DepartmentReportItem[]>(`${this.apiUrl}/departments`, { params });
  }

  /**
   * Retrieves account status distribution (ACTIVE, ONBOARDING, ON_LEAVE, INACTIVE) within an optional date range.
   */
  getStatusReport(range?: ReportDateRange): Observable<StatusReportItem[]> {
    if (this.useMock || environment.useMockApi) {
      return of(this.getMockStatusReport(range)).pipe(delay(200));
    }
    const params = this.buildParams(range);
    return this.http.get<StatusReportItem[]>(`${this.apiUrl}/status-distribution`, { params });
  }

  /**
   * Retrieves continuous monthly join counts formatted as yyyy-MM within an optional date range.
   */
  getMonthlyJoins(range?: ReportDateRange): Observable<MonthlyJoinItem[]> {
    if (this.useMock || environment.useMockApi) {
      return of(this.getMockMonthlyJoins(range)).pipe(delay(200));
    }
    const params = this.buildParams(range);
    return this.http.get<MonthlyJoinItem[]>(`${this.apiUrl}/monthly-joins`, { params });
  }

  /**
   * Retrieves executive KPI summary figures for the filtered workforce.
   */
  getSummary(range?: ReportDateRange): Observable<ReportSummaryResponse> {
    if (this.useMock || environment.useMockApi) {
      return of(this.getMockSummary(range)).pipe(delay(200));
    }
    const params = this.buildParams(range);
    return this.http.get<ReportSummaryResponse>(`${this.apiUrl}/summary`, { params });
  }

  /**
   * Builds HttpParams appending startDate and endDate only when they contain non-empty values.
   */
  private buildParams(range?: ReportDateRange): HttpParams {
    let params = new HttpParams();
    if (range) {
      if (range.startDate && range.startDate.trim()) {
        params = params.set('startDate', range.startDate.trim());
      }
      if (range.endDate && range.endDate.trim()) {
        params = params.set('endDate', range.endDate.trim());
      }
    }
    return params;
  }

  // ── Mock Data Fallbacks ────────────────────────────────────────────────────

  private getMockDepartmentReport(range?: ReportDateRange): DepartmentReportItem[] {
    return [
      { department: 'Engineering', headcount: 9, percentage: 40.9 },
      { department: 'Finance & Operations', headcount: 4, percentage: 18.2 },
      { department: 'Human Resources', headcount: 4, percentage: 18.2 },
      { department: 'Support', headcount: 4, percentage: 18.2 },
      { department: 'Sales & Partnerships', headcount: 1, percentage: 4.5 },
      { department: 'AI Development', headcount: 0, percentage: 0.0 },
      { department: 'Marketing', headcount: 0, percentage: 0.0 },
      { department: 'Product & Design', headcount: 0, percentage: 0.0 }
    ];
  }

  private getMockStatusReport(range?: ReportDateRange): StatusReportItem[] {
    return [
      { status: 'ACTIVE', count: 16, percentage: 72.7 },
      { status: 'ONBOARDING', count: 0, percentage: 0.0 },
      { status: 'ON_LEAVE', count: 0, percentage: 0.0 },
      { status: 'INACTIVE', count: 6, percentage: 27.3 }
    ];
  }

  private getMockMonthlyJoins(range?: ReportDateRange): MonthlyJoinItem[] {
    return [
      { month: '2025-12', count: 0 },
      { month: '2026-01', count: 0 },
      { month: '2026-02', count: 0 },
      { month: '2026-03', count: 0 },
      { month: '2026-04', count: 0 },
      { month: '2026-05', count: 0 },
      { month: '2026-06', count: 0 },
      { month: '2026-07', count: 0 },
      { month: '2026-08', count: 0 },
      { month: '2026-09', count: 0 },
      { month: '2026-10', count: 0 },
      { month: '2026-11', count: 6 }
    ];
  }

  private getMockSummary(range?: ReportDateRange): ReportSummaryResponse {
    return {
      totalEmployees: 22,
      activeEmployees: 16,
      inactiveEmployees: 6,
      joinedInRange: 22
    };
  }
}

