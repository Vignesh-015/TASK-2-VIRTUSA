import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ProfileService } from '../../profile/services/profile.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthUser, UserRole } from '../../../core/models/user.model';
import { Employee } from '../../../core/models/employee.model';
import { ColleagueResponse } from '../../profile/models/profile.model';
import {
  DashboardStatsResponse,
  DepartmentHeadcountResponse,
  RecentEmployeeResponse
} from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  public currentUser$!: Observable<AuthUser | null>;
  public currentUser: AuthUser | null = null;
  public userRole: UserRole = 'EMPLOYEE';
  public isLoading: boolean = true;
  public todayString: string = '';

  // Dynamic computed subtitles and badges
  public workforceSubtitle: string = 'Active employee records';
  public activeStaffSubtitle: string = 'Operational engagement';
  public addedThisMonthText: string = 'Total';
  public departmentsSubtitle: string = 'Functional business units';
  public distributionSubtitle: string = 'Exact headcount allocation across business units';

  // Fallback palette cycling for department visualization
  private readonly defaultPalette: string[] = [
    '#2563EB', // Blue
    '#0D9488', // Teal
    '#D97706', // Amber
    '#7C3AED', // Purple
    '#059669', // Emerald
    '#EA580C', // Orange
    '#6366F1', // Indigo
    '#EC4899', // Pink
    '#14B8A6', // Cyan
    '#F59E0B'  // Gold
  ];

  // Admin & HR metrics
  public stats = {
    totalEmployees: 0,
    activeEmployees: 0,
    newJoinersCount: 0,
    totalDepartments: 0,
    departmentBreakdown: [] as { department: string; count: number; percentage: number; color?: string }[],
    statusBreakdown: [] as { status: string; label: string; count: number; percentage: number; color: string }[],
    recentEmployees: [] as Employee[]
  };

  // Employee workspace metrics
  public employeeTeammates: (Employee | ColleagueResponse)[] = [];
  public employeeLeaveBalance = {
    annualLeave: 14,
    sickLeave: 5,
    remoteDaysThisMonth: 8,
    performanceScore: 'Exceeds Expectations'
  };

  constructor(
    public authService: AuthService,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private dashboardService: DashboardService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.todayString = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date());

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.userRole = user.role;
        this.loadDashboardData();
      }
    });
  }

  public loadDashboardData(): void {
    this.isLoading = true;

    if (this.userRole === 'ADMIN' || this.userRole === 'HR') {
      forkJoin({
        stats: this.dashboardService.getDashboardStats().pipe(
          catchError(() => {
            this.notificationService.error('Failed to load workforce summary metrics.');
            return of(null);
          })
        ),
        departments: this.dashboardService.getDepartmentHeadcounts().pipe(
          catchError(() => {
            this.notificationService.error('Failed to load department headcount breakdown.');
            return of(null);
          })
        ),
        recent: this.dashboardService.getRecentEmployees(5).pipe(
          catchError(() => {
            this.notificationService.error('Failed to load recent employee additions.');
            return of(null);
          })
        )
      }).subscribe({
        next: ({ stats, departments, recent }) => {
          if (stats) {
            this.applyStats(stats);
          }
          if (departments) {
            this.applyDepartments(departments);
          }
          if (recent) {
            this.applyRecent(recent);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.error('Failed to load dashboard metrics.');
        }
      });
    } else {
      // Employee Workspace: load colleagues via ProfileService
      this.profileService.getColleagues().subscribe({
        next: (colleagues) => {
          this.employeeTeammates = colleagues;
          this.isLoading = false;
        },
        error: () => {
          this.employeeTeammates = [];
          this.isLoading = false;
        }
      });
    }
  }

  private applyStats(stats: DashboardStatsResponse): void {
    const total = stats.totalEmployees;
    this.stats.totalEmployees = total;
    this.stats.activeEmployees = stats.activeEmployees;
    this.stats.newJoinersCount = stats.onboardingEmployees;
    this.stats.totalDepartments = stats.totalDepartments;

    // Subtitles
    this.workforceSubtitle = `${total} employee ${total === 1 ? 'record' : 'records'}`;
    this.activeStaffSubtitle = `${stats.activePercentage.toFixed(1)}% operational engagement`;
    this.addedThisMonthText = `${stats.newJoinersThisMonth} added this month`;
    this.departmentsSubtitle = `${stats.totalDepartments} functional business ${stats.totalDepartments === 1 ? 'unit' : 'units'}`;

    // Workforce status overview breakdown
    this.stats.statusBreakdown = [
      {
        status: 'ACTIVE',
        label: 'Active',
        count: stats.activeEmployees,
        percentage: total > 0 ? Number(((stats.activeEmployees / total) * 100).toFixed(1)) : 0,
        color: '#059669'
      },
      {
        status: 'ONBOARDING',
        label: 'Onboarding',
        count: stats.onboardingEmployees,
        percentage: total > 0 ? Number(((stats.onboardingEmployees / total) * 100).toFixed(1)) : 0,
        color: '#2563EB'
      },
      {
        status: 'ON_LEAVE',
        label: 'On Leave',
        count: stats.onLeaveEmployees,
        percentage: total > 0 ? Number(((stats.onLeaveEmployees / total) * 100).toFixed(1)) : 0,
        color: '#D97706'
      },
      {
        status: 'INACTIVE',
        label: 'Inactive',
        count: stats.inactiveEmployees,
        percentage: total > 0 ? Number(((stats.inactiveEmployees / total) * 100).toFixed(1)) : 0,
        color: '#DC2626'
      }
    ];

    this.updateDistributionSubtitle();
  }

  private applyDepartments(departments: DepartmentHeadcountResponse[]): void {
    this.stats.departmentBreakdown = departments.map((d, idx) => ({
      department: d.department,
      count: d.headcount,
      percentage: d.percentage,
      color: this.defaultPalette[idx % this.defaultPalette.length]
    }));

    this.updateDistributionSubtitle();
  }

  private updateDistributionSubtitle(): void {
    const totalDepts = this.stats.totalDepartments || this.stats.departmentBreakdown.length;
    const totalStaff = this.stats.totalEmployees;
    this.distributionSubtitle = `Exact headcount allocation across ${totalDepts} business ${totalDepts === 1 ? 'unit' : 'units'} (${totalStaff} staff total)`;
  }

  private applyRecent(recent: RecentEmployeeResponse[]): void {
    this.stats.recentEmployees = recent.map(r => ({
      id: String(r.id),
      employeeId: r.employeeCode || `EMP-${r.id}`,
      firstName: '',
      lastName: '',
      fullName: r.fullName,
      email: '',
      phone: '',
      department: r.department,
      designation: r.designation,
      joiningDate: r.joinedOn,
      status: r.status as any,
      employmentType: 'FULL_TIME' as any
    }));
  }

  public navigateToEmployees(dept?: string): void {
    if (dept) {
      this.router.navigate(['/employees'], { queryParams: { department: dept } });
    } else {
      this.router.navigate(['/employees']);
    }
  }

  public navigateToDepartments(): void {
    this.router.navigate(['/departments']);
  }

  public navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  public exportDirectoryCsv(): void {
    this.employeeService.getAllEmployees().subscribe(employees => {
      const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Status', 'Joining Date'];
      const rows = employees.map(e => [
        e.employeeId,
        `"${e.fullName}"`,
        e.email,
        `"${e.department}"`,
        `"${e.designation}"`,
        e.status,
        e.joiningDate
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `EmployeeHub_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.notificationService.success('Employee directory exported successfully!', 'Export Completed');
    });
  }
}
