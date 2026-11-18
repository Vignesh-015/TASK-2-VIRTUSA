
import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';
import { AuthService } from '../../../core/services/auth.service';
import { ReportService } from './report.service';

export interface ReportRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
  joinDate: string;
  roleOrDesignation: string;
}

export interface DepartmentChartItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StatusChartItem {
  status: 'ACTIVE' | 'INACTIVE' | 'OTHER';
  label: string;
  count: number;
  percentage: number;
  color: string;
  dashArray: string;
  dashOffset: number;
}

export interface MonthlyJoinItem {
  monthKey: string;
  label: string;
  fullLabel: string;
  count: number;
  barHeightPercent: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  public isLoading: boolean = true;
  public errorMessage: string | null = null;

  public selectedSource: 'users' | 'employees' = 'users';

  private rawRecords: ReportRecord[] = [];

  public filteredRecords: ReportRecord[] = [];

  public startDate: string = '';
  public endDate: string = '';
  public appliedStartDate: string | null = null;
  public appliedEndDate: string | null = null;
  public dateError: string | null = null;

  public departmentData: DepartmentChartItem[] = [];
  public maxDepartmentCount: number = 0;

  public statusData: StatusChartItem[] = [];
  public activeCount: number = 0;
  public inactiveCount: number = 0;
  public otherStatusCount: number = 0;
  public donutCircumference: number = 238.761;

  public monthlyJoinsData: MonthlyJoinItem[] = [];
  public maxMonthlyCount: number = 0;

  public totalRecords: number = 0;
  public totalDepartments: number = 0;
  public activePercentage: number = 0;

  public currentPage: number = 1;
  public pageSize: number = 6;

  private readonly departmentPalette: string[] = [
    '#2563EB',
    '#059669',
    '#D97706',
    '#7C3AED',
    '#0284C7',
    '#DC2626',
    '#475569',
    '#0D9488',
    '#4F46E5',
    '#B45309'
  ];

  constructor(
    private reportService: ReportService,
    private employeeService: EmployeeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  public setDataSource(source: 'users' | 'employees'): void {
    if (this.selectedSource === source) return;

    this.selectedSource = source;
    this.currentPage = 1;
    this.loadData();
  }

  public loadData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (this.selectedSource === 'users') {

      this.reportService.getEmployeeReports().subscribe({
        next: (users) => {
          this.rawRecords = users.map(u => ({
            id: String(u.id),
            name: u.fullName,
            email: u.email,
            department: u.department || 'Unassigned',
            status: u.status || 'OTHER',
            joinDate: u.joiningDate || '',
            roleOrDesignation: u.roleOrDesignation || 'Unassigned'
          }));

          this.applyFilterAndRecalculate();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Reports API error:', error);
          this.errorMessage =
            'Failed to load user reports from the backend. Please try again.';
          this.isLoading = false;
        }
      });

    } else {

      this.employeeService.getAllEmployees().subscribe({
        next: (employees: Employee[]) => {
          this.rawRecords = employees.map(e => ({
            id: e.id,
            name: e.fullName,
            email: e.email,
            department: e.department || 'Unassigned',
            status: e.status || 'OTHER',
            joinDate: e.joiningDate || '',
            roleOrDesignation: e.designation
          }));

          this.applyFilterAndRecalculate();
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage =
            'Failed to load employee records from EmployeeService. Please try again.';
          this.isLoading = false;
        }
      });
    }
  }

  public applyDateFilter(): void {
    this.dateError = null;

    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      this.dateError = 'Start date cannot be later than end date.';
      return;
    }

    this.appliedStartDate = this.startDate.trim()
      ? this.startDate.trim()
      : null;

    this.appliedEndDate = this.endDate.trim()
      ? this.endDate.trim()
      : null;

    this.currentPage = 1;
    this.applyFilterAndRecalculate();
  }

  public resetDateFilter(): void {
    this.startDate = '';
    this.endDate = '';
    this.appliedStartDate = null;
    this.appliedEndDate = null;
    this.dateError = null;
    this.currentPage = 1;

    this.applyFilterAndRecalculate();
  }

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

  private applyFilterAndRecalculate(): void {

    this.filteredRecords = this.rawRecords.filter(item => {
      if (!item.joinDate) return true;

      if (this.appliedStartDate && item.joinDate < this.appliedStartDate) {
        return false;
      }

      if (this.appliedEndDate && item.joinDate > this.appliedEndDate) {
        return false;
      }

      return true;
    });

    this.totalRecords = this.filteredRecords.length;

    this.buildDepartmentChart();
    this.buildStatusChart();
    this.buildMonthlyJoinsChart();
  }

  private buildDepartmentChart(): void {
    const deptMap: { [name: string]: number } = {};

    for (const record of this.filteredRecords) {
      const dept = record.department || 'Unassigned';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    }

    const deptKeys = Object.keys(deptMap);
    this.totalDepartments = deptKeys.length;

    const list: DepartmentChartItem[] = deptKeys.map((name, index) => {
      const count = deptMap[name];
      const percentage = this.totalRecords > 0
        ? (count / this.totalRecords) * 100
        : 0;

      const color =
        this.departmentPalette[index % this.departmentPalette.length];

      return { name, count, percentage, color };
    });

    list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    this.departmentData = list;
    this.maxDepartmentCount = list.length > 0
      ? Math.max(...list.map(d => d.count))
      : 1;
  }

  private buildStatusChart(): void {
    this.activeCount = 0;
    this.inactiveCount = 0;
    this.otherStatusCount = 0;

    for (const record of this.filteredRecords) {
      const rawStatus = (record.status || '').toUpperCase().trim();

      if (rawStatus === 'ACTIVE') {
        this.activeCount++;
      } else if (rawStatus === 'INACTIVE') {
        this.inactiveCount++;
      } else {
        this.otherStatusCount++;
      }
    }

    const total = this.totalRecords;

    this.activePercentage = total > 0
      ? Math.round((this.activeCount / total) * 100)
      : 0;

    const inactivePercentage = total > 0
      ? Math.round((this.inactiveCount / total) * 100)
      : 0;

    const otherPercentage = total > 0
      ? Math.round((this.otherStatusCount / total) * 100)
      : 0;

    const items: StatusChartItem[] = [];
    const C = this.donutCircumference;
    let accumulatedOffset = 0;

    if (this.activeCount > 0) {
      const pct = this.activeCount / total;
      const dash = pct * C;

      items.push({
        status: 'ACTIVE',
        label: 'Active Users',
        count: this.activeCount,
        percentage: this.activePercentage,
        color: '#059669',
        dashArray: `${dash} ${C}`,
        dashOffset: accumulatedOffset
      });

      accumulatedOffset -= dash;
    }

    if (this.inactiveCount > 0) {
      const pct = this.inactiveCount / total;
      const dash = pct * C;

      items.push({
        status: 'INACTIVE',
        label: 'Inactive Users',
        count: this.inactiveCount,
        percentage: inactivePercentage,
        color: '#DC2626',
        dashArray: `${dash} ${C}`,
        dashOffset: accumulatedOffset
      });

      accumulatedOffset -= dash;
    }

    if (this.otherStatusCount > 0) {
      const pct = this.otherStatusCount / total;
      const dash = pct * C;

      items.push({
        status: 'OTHER',
        label: 'On Leave / Onboarding',
        count: this.otherStatusCount,
        percentage: otherPercentage,
        color: '#D97706',
        dashArray: `${dash} ${C}`,
        dashOffset: accumulatedOffset
      });
    }

    this.statusData = items;
  }

  private buildMonthlyJoinsChart(): void {
    const monthCounts: { [key: string]: number } = {};

    for (const record of this.filteredRecords) {
      if (!record.joinDate) continue;

      const parts = record.joinDate.split('-');

      if (parts.length >= 2) {
        const key = `${parts[0]}-${parts[1]}`;
        monthCounts[key] = (monthCounts[key] || 0) + 1;
      }
    }

    const sortedKeys = Object.keys(monthCounts).sort();

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const fullMonthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const result: MonthlyJoinItem[] = sortedKeys.map(key => {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr, 10);
      const monthIdx = parseInt(monthStr, 10) - 1;
      const count = monthCounts[key];

      const label = `${monthNames[monthIdx]} '${year.toString().slice(-2)}`;
      const fullLabel = `${fullMonthNames[monthIdx]} ${year}`;

      return {
        monthKey: key,
        label,
        fullLabel,
        count,
        barHeightPercent: 0
      };
    });

    const maxCount = result.length > 0
      ? Math.max(...result.map(m => m.count))
      : 1;

    this.maxMonthlyCount = maxCount;

    for (const item of result) {
      item.barHeightPercent = Math.max(
        12,
        Math.round((item.count / maxCount) * 100)
      );
    }

    this.monthlyJoinsData = result;
  }

  public exportToCsv(): void {
    if (this.filteredRecords.length === 0) return;

    const headers = [
      'ID',
      'Name',
      'Email',
      'Department',
      'Role / Designation',
      'Status',
      'Joined Date'
    ];

    const rows = this.filteredRecords.map(r => [
      `"${r.id}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.department.replace(/"/g, '""')}"`,
      `"${r.roleOrDesignation}"`,
      `"${r.status}"`,
      `"${r.joinDate}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const timestamp = new Date().toISOString().slice(0, 10);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${this.selectedSource}-analytics-report-${timestamp}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public get pagedRecords(): ReportRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRecords.slice(start, start + this.pageSize);
  }

  public get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredRecords.length / this.pageSize)
    );
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
