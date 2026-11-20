import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User, UserRole } from '../../../core/models/user.model';
import { Employee } from '../../../core/models/employee.model';
import { Department } from '../../../core/models/department.model';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  public currentUser$!: Observable<User | null>;
  public currentUser: User | null = null;
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
  public employeeTeammates: Employee[] = [];
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
        departments: this.departmentService.getDepartments(true),
        employees: this.employeeService.getAllEmployees()
      }).subscribe({
        next: ({ departments, employees }) => {
          this.computeDashboardMetrics(departments, employees);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.error('Failed to load dashboard metrics.');
        }
      });
    } else {
      // Employee Workspace: load teammates in same department
      const userDept = this.currentUser?.department || 'Engineering';
      this.employeeService.getAllEmployees().subscribe({
        next: (all) => {
          this.employeeTeammates = all
            .filter(e => e.department.toLowerCase() === userDept.toLowerCase() && e.email !== this.currentUser?.email)
            .slice(0, 5);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  private computeDashboardMetrics(departments: Department[], employees: Employee[]): void {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'ACTIVE').length;
    const onboarding = employees.filter(e => e.status === 'ONBOARDING').length;
    const onLeave = employees.filter(e => e.status === 'ON_LEAVE').length;
    const inactive = employees.filter(e => e.status === 'INACTIVE').length;
    const totalDepts = departments.length;

    // Monthly joiners for trend indicator
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const addedThisMonth = employees.filter(e => {
      if (!e.joiningDate) return false;
      const d = new Date(e.joiningDate);
      return !isNaN(d.getTime()) && d.getFullYear() === curYear && d.getMonth() === curMonth;
    }).length;

    // Subtitles computed dynamically
    this.workforceSubtitle = `${total} employee ${total === 1 ? 'record' : 'records'}`;
    const activePct = total > 0 ? ((active / total) * 100).toFixed(1) : '0.0';
    this.activeStaffSubtitle = `${activePct}% operational engagement`;
    this.addedThisMonthText = `${addedThisMonth} added this month`;
    this.departmentsSubtitle = `${totalDepts} functional business ${totalDepts === 1 ? 'unit' : 'units'}`;
    this.distributionSubtitle = `Exact headcount allocation across ${totalDepts} business ${totalDepts === 1 ? 'unit' : 'units'} (${total} staff total)`;

    // Count employees per department (case-insensitive mapping)
    const empCountByDeptName = new Map<string, number>();
    for (const emp of employees) {
      const rawDept = (emp.department || '').trim();
      if (rawDept) {
        const key = rawDept.toLowerCase();
        empCountByDeptName.set(key, (empCountByDeptName.get(key) || 0) + 1);
      }
    }

    // Registered departments from DepartmentService (source of truth)
    const matchedKeys = new Set<string>();
    const recognizedBreakdown: { department: string; count: number; percentage: number; color: string }[] = [];

    departments.forEach((dept, idx) => {
      const key = (dept.name || '').trim().toLowerCase();
      matchedKeys.add(key);

      const count = empCountByDeptName.get(key) ?? (typeof dept.employeeCount === 'number' ? dept.employeeCount : 0);
      const percentage = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
      const color = dept.color && dept.color.trim() ? dept.color : this.defaultPalette[idx % this.defaultPalette.length];

      recognizedBreakdown.push({
        department: dept.name,
        count,
        percentage,
        color
      });
    });

    // Sort registered departments: headcount descending, then name ascending
    recognizedBreakdown.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.department.localeCompare(b.department);
    });

    // Fallback: unlisted departments from employees (e.g., legacy or typo)
    const unlistedMap = new Map<string, number>();
    for (const emp of employees) {
      const rawDept = (emp.department || '').trim();
      const key = rawDept.toLowerCase();
      if (!matchedKeys.has(key)) {
        const displayName = rawDept || 'Unassigned';
        unlistedMap.set(displayName, (unlistedMap.get(displayName) || 0) + 1);
      }
    }

    const unlistedBreakdown: { department: string; count: number; percentage: number; color: string }[] = [];
    let unlistedIdx = departments.length;
    unlistedMap.forEach((count, deptName) => {
      const percentage = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
      const color = this.defaultPalette[unlistedIdx % this.defaultPalette.length];
      unlistedIdx++;
      unlistedBreakdown.push({
        department: deptName,
        count,
        percentage,
        color
      });
    });

    unlistedBreakdown.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.department.localeCompare(b.department);
    });

    // Sum of counts in breakdown equals total workforce
    const departmentBreakdown = [...recognizedBreakdown, ...unlistedBreakdown];

    // Status breakdown
    const statusBreakdown = [
      {
        status: 'ACTIVE',
        label: 'Active',
        count: active,
        percentage: total > 0 ? Number(((active / total) * 100).toFixed(1)) : 0,
        color: '#059669'
      },
      {
        status: 'ONBOARDING',
        label: 'Onboarding',
        count: onboarding,
        percentage: total > 0 ? Number(((onboarding / total) * 100).toFixed(1)) : 0,
        color: '#2563EB'
      },
      {
        status: 'ON_LEAVE',
        label: 'On Leave',
        count: onLeave,
        percentage: total > 0 ? Number(((onLeave / total) * 100).toFixed(1)) : 0,
        color: '#D97706'
      },
      {
        status: 'INACTIVE',
        label: 'Inactive',
        count: inactive,
        percentage: total > 0 ? Number(((inactive / total) * 100).toFixed(1)) : 0,
        color: '#DC2626'
      }
    ];

    // Recent employee additions
    const recentEmployees = [...employees]
      .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
      .slice(0, 5);

    this.stats = {
      totalEmployees: total,
      activeEmployees: active,
      newJoinersCount: onboarding,
      totalDepartments: totalDepts,
      departmentBreakdown,
      statusBreakdown,
      recentEmployees
    };
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
