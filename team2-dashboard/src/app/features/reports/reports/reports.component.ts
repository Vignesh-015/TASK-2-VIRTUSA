import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReportService } from '../../../core/services/report.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  DepartmentReportItem,
  MonthlyJoinItem,
  ReportDateRange,
  ReportSummaryResponse,
  StatusReportItem
} from '../../../core/models/report.model';
import { Employee } from '../../../core/models/employee.model';

export interface ReportRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
  joinDate: string; // YYYY-MM-DD
  roleOrDesignation: string;
}

export interface DepartmentChartItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StatusChartItem {
  status: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  dashArray: string;
  dashOffset: number;
}

export interface MonthlyChartItem {
  monthKey: string;   // YYYY-MM
  label: string;      // MMM 'YY
  fullLabel: string;  // Month YYYY
  count: number;
  barHeightPercent: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  // State
  public isLoading: boolean = true;
  public errorMessage: string | null = null;
  public departmentError: string | null = null;
  public statusError: string | null = null;
  public monthlyError: string | null = null;
  public isExporting: boolean = false;

  // Filtered dataset for detailed table / CSV export
  public filteredRecords: ReportRecord[] = [];

  // Date Filter Inputs
  public startDate: string = '';
  public endDate: string = '';
  public appliedStartDate: string | null = null;
  public appliedEndDate: string | null = null;
  public dateError: string | null = null;

  // Visualisation Datasets
  public departmentData: DepartmentChartItem[] = [];
  public maxDepartmentCount: number = 0;

  public statusData: StatusChartItem[] = [];
  public activeCount: number = 0;
  public inactiveCount: number = 0;
  public otherStatusCount: number = 0;
  public donutCircumference: number = 238.761; // 2 * PI * 38

  public monthlyJoinsData: MonthlyChartItem[] = [];
  public maxMonthlyCount: number = 0;

  // Summary Metrics
  public totalRecords: number = 0;
  public totalDepartments: number = 0;
  public activePercentage: number = 0;

  // Detailed Table Pagination
  public currentPage: number = 1;
  public pageSize: number = 6;

  // Department Bar Colors (Conforming strictly to Enterprise Design System)
  private readonly departmentPalette: string[] = [
    '#2563EB', // Blue
    '#059669', // Emerald / Teal
    '#D97706', // Amber
    '#7C3AED', // Purple
    '#0284C7', // Sky
    '#DC2626', // Red
    '#475569', // Slate
    '#0D9488', // Dark Teal
    '#4F46E5', // Indigo
    '#B45309'  // Warm Brown
  ];

  constructor(
    private reportService: ReportService,
    private employeeService: EmployeeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Loads all analytics data from ReportService via database queries.
   * Eliminates downloading the entire user directory on page load.
   */
  public loadData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.departmentError = null;
    this.statusError = null;
    this.monthlyError = null;

    const range: ReportDateRange = {
      startDate: this.appliedStartDate,
      endDate: this.appliedEndDate
    };

    forkJoin({
      summary: this.reportService.getSummary(range).pipe(
        catchError(err => {
          console.error('Failed to load report summary:', err);
          return of(null);
        })
      ),
      departments: this.reportService.getDepartmentReport(range).pipe(
        catchError(err => {
          console.error('Failed to load department report:', err);
          this.departmentError = 'Failed to load department distribution.';
          return of(null);
        })
      ),
      statuses: this.reportService.getStatusReport(range).pipe(
        catchError(err => {
          console.error('Failed to load status report:', err);
          this.statusError = 'Failed to load account status health.';
          return of(null);
        })
      ),
      monthly: this.reportService.getMonthlyJoins(range).pipe(
        catchError(err => {
          console.error('Failed to load monthly joins report:', err);
          this.monthlyError = 'Failed to load monthly joins trend.';
          return of(null);
        })
      )
    }).subscribe({
      next: ({ summary, departments, statuses, monthly }) => {
        this.isLoading = false;

        // 1. Process KPI Summary
        if (summary) {
          this.totalRecords = summary.totalEmployees;
          this.activeCount = summary.activeEmployees;
          this.inactiveCount = summary.inactiveEmployees;
          this.activePercentage = summary.totalEmployees > 0
            ? Math.round((summary.activeEmployees / summary.totalEmployees) * 100)
            : 0;
        } else if (statuses) {
          const activeItem = statuses.find(s => s.status === 'ACTIVE');
          const inactiveItem = statuses.find(s => s.status === 'INACTIVE');
          this.activeCount = activeItem ? activeItem.count : 0;
          this.inactiveCount = inactiveItem ? inactiveItem.count : 0;
          this.totalRecords = statuses.reduce((acc, curr) => acc + curr.count, 0);
          this.activePercentage = this.totalRecords > 0
            ? Math.round((this.activeCount / this.totalRecords) * 100)
            : 0;
        }

        // 2. Process Department Distribution
        if (departments) {
          this.totalDepartments = departments.length;
          this.departmentData = departments.map((d, index) => ({
            name: d.department,
            count: d.headcount,
            percentage: d.percentage,
            color: this.departmentPalette[index % this.departmentPalette.length]
          }));
          this.maxDepartmentCount = this.departmentData.length > 0
            ? Math.max(1, ...this.departmentData.map(d => d.count))
            : 1;
        }

        // 3. Process Status Distribution
        if (statuses) {
          this.buildStatusChart(statuses);
        }

        // 4. Process Monthly Joins Trend
        if (monthly) {
          this.buildMonthlyJoinsChart(monthly);
        }

        if (!summary && !departments && !statuses && !monthly) {
          this.errorMessage = 'Failed to load analytics records. Please try again.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'An unexpected error occurred while loading reports.';
      }
    });
  }

  /**
   * Validate and apply date filter range
   */
  public applyDateFilter(): void {
    this.dateError = null;

    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      this.dateError = 'Start date cannot be later than end date.';
      return;
    }

    this.appliedStartDate = this.startDate.trim() ? this.startDate.trim() : null;
    this.appliedEndDate = this.endDate.trim() ? this.endDate.trim() : null;
    this.currentPage = 1;

    this.loadData();
  }

  /**
   * Reset date filter to all-time view
   */
  public resetDateFilter(): void {
    this.startDate = '';
    this.endDate = '';
    this.appliedStartDate = null;
    this.appliedEndDate = null;
    this.dateError = null;
    this.currentPage = 1;

    this.loadData();
  }

  /**
   * Apply quick preset ranges for convenience
   */
  public setQuickRange(range: 'all' | '2023' | '2024' | 'last12'): void {
    const today = new Date();
    const todayStr = this.formatDate(today);

    if (range === 'all') {
      this.resetDateFilter();
      return;
    } else if (range === '2023') {
      this.startDate = '2023-01-01';
      this.endDate = '2023-12-31';
    } else if (range === '2024') {
      this.startDate = '2024-01-01';
      this.endDate = '2024-12-31';
    } else if (range === 'last12') {
      const past = new Date();
      past.setFullYear(today.getFullYear() - 1);
      this.startDate = this.formatDate(past);
      this.endDate = todayStr;
    }

    this.applyDateFilter();
  }

  /**
   * Builds Active vs Inactive Donut Chart data for all four statuses.
   */
  private buildStatusChart(statuses: StatusReportItem[]): void {
    const statusConfig: { [key: string]: { label: string; color: string } } = {
      ACTIVE: { label: 'Active Users', color: '#059669' },
      ONBOARDING: { label: 'Onboarding', color: '#2563EB' },
      ON_LEAVE: { label: 'On Leave', color: '#D97706' },
      INACTIVE: { label: 'Inactive Users', color: '#DC2626' }
    };

    const total = this.totalRecords;
    const C = this.donutCircumference;
    let accumulatedOffset = 0;
    const items: StatusChartItem[] = [];

    for (const s of statuses) {
      const cfg = statusConfig[s.status] || { label: s.status, color: '#64748B' };
      const pct = total > 0 ? s.count / total : 0;
      const dash = pct * C;

      items.push({
        status: s.status,
        label: cfg.label,
        count: s.count,
        percentage: Math.round(s.percentage),
        color: cfg.color,
        dashArray: `${dash} ${C}`,
        dashOffset: accumulatedOffset
      });

      if (dash > 0) {
        accumulatedOffset -= dash;
      }
    }

    this.statusData = items;
  }

  /**
   * Builds Monthly Joins distribution chronologically from yyyy-MM backend data.
   */
  private buildMonthlyJoinsChart(joins: MonthlyJoinItem[]): void {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const fullMonthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const maxCount = joins.length > 0 ? Math.max(1, ...joins.map(j => j.count)) : 1;
    this.maxMonthlyCount = maxCount;

    this.monthlyJoinsData = joins.map(j => {
      const parts = j.month.split('-');
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const label = (monthIdx >= 0 && monthIdx < 12)
        ? `${monthNames[monthIdx]} '${year.toString().slice(-2)}`
        : j.month;
      const fullLabel = (monthIdx >= 0 && monthIdx < 12)
        ? `${fullMonthNames[monthIdx]} ${year}`
        : j.month;
      const barHeightPercent = j.count > 0 ? Math.max(12, Math.round((j.count / maxCount) * 100)) : 0;

      return {
        monthKey: j.month,
        label,
        fullLabel,
        count: j.count,
        barHeightPercent
      };
    });
  }

  /**
   * Export currently filtered data to CSV file.
   * Fetches employee records on demand from EmployeeService only when clicked, never on page load.
   */
  public exportToCsv(): void {
    if (this.isExporting) return;
    this.isExporting = true;

    this.employeeService.getAllEmployees().subscribe({
      next: (employees: Employee[]) => {
        let filtered = employees;
        if (this.appliedStartDate || this.appliedEndDate) {
          filtered = employees.filter(e => {
            const join = e.joiningDate || '';
            if (this.appliedStartDate && join < this.appliedStartDate) return false;
            if (this.appliedEndDate && join > this.appliedEndDate) return false;
            return true;
          });
        }

        this.filteredRecords = filtered.map(e => ({
          id: e.id,
          name: e.fullName,
          email: e.email,
          department: e.department || 'Unassigned',
          status: e.status || 'ACTIVE',
          joinDate: e.joiningDate || '',
          roleOrDesignation: e.designation
        }));

        if (this.filteredRecords.length === 0) {
          this.isExporting = false;
          return;
        }

        const headers = ['ID', 'Name', 'Email', 'Department', 'Role / Designation', 'Status', 'Joined Date'];
        const rows = this.filteredRecords.map(r => [
          `"${r.id}"`,
          `"${(r.name || '').replace(/"/g, '""')}"`,
          `"${r.email || ''}"`,
          `"${(r.department || '').replace(/"/g, '""')}"`,
          `"${r.roleOrDesignation || ''}"`,
          `"${r.status || ''}"`,
          `"${r.joinDate || ''}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const timestamp = new Date().toISOString().slice(0, 10);
        link.setAttribute('href', url);
        link.setAttribute('download', `workforce-analytics-report-${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.isExporting = false;
      },
      error: () => {
        this.isExporting = false;
      }
    });
  }

  // Table Pagination Helpers
  public get pagedRecords(): ReportRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRecords.slice(start, start + this.pageSize);
  }

  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRecords.length / this.pageSize));
  }

  public onPageChange(page: number): void {
    this.currentPage = page;
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
