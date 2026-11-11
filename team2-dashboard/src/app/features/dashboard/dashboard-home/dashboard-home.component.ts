import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ActivityItem, DashboardStats, DepartmentCount } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  stats: DashboardStats | null = null;
  departments: DepartmentCount[] | null = null;
  activities: ActivityItem[] | null = null;

  isLoading = true;
  hasError = false;

  private dataSubscription: Subscription | null = null;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  get greetingName(): string {
    const user = this.authService.currentUser;
    return user && user.name ? user.name : 'there';
  }

  get currentDate(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date());
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    this.dataSubscription = forkJoin({
      stats: this.dashboardService.getStats(),
      departments: this.dashboardService.getDepartmentCounts(),
      activities: this.dashboardService.getRecentActivity()
    }).subscribe({
      next: ({ stats, departments, activities }) => {
        this.stats = stats;
        this.departments = departments;
        this.activities = activities;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }
}
