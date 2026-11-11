import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  public currentUser$!: Observable<User | null>;
  public isLoading: boolean = true;
  public todayString: string = '';

  public stats = {
    totalEmployees: 0,
    activeEmployees: 0,
    newJoinersThisMonth: 0,
    totalDepartments: 0,
    departmentBreakdown: [] as { department: string; count: number; percentage: number; color?: string }[],
    statusBreakdown: [] as { status: string; label: string; count: number; color: string }[],
    recentEmployees: [] as Employee[]
  };

  // Add Employee Modal state
  public isAddEmployeeModalOpen: boolean = false;

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

    this.loadDashboardData();
  }

  public loadDashboardData(): void {
    this.isLoading = true;
    this.employeeService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('Failed to load dashboard metrics');
      }
    });
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
