import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User, UserRole } from '../../../core/models/user.model';
import { Employee } from '../../../core/models/employee.model';

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

  // Admin & HR metrics
  public stats = {
    totalEmployees: 24,
    activeEmployees: 20,
    newJoinersCount: 2,
    totalDepartments: 6,
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
      this.employeeService.getDashboardStats().subscribe({
        next: (data) => {
          this.stats = data;
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
