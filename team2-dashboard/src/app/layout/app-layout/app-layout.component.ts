import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User, UserRole } from '../../core/models/user.model';
import { AppNotification } from '../../core/models/notification.model';

interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  public sidebarMobileOpen: boolean = false;
  public sidebarCollapsed: boolean = false;
  public notificationsOpen: boolean = false;
  public profileMenuOpen: boolean = false;
  public demoRoleSwitcherOpen: boolean = false;

  public currentUser$!: Observable<User | null>;
  public notifications$!: Observable<AppNotification[]>;

  public pageTitle: string = 'Dashboard';
  public breadcrumbs: BreadcrumbItem[] = [{ label: 'EmployeeHub' }, { label: 'Dashboard' }];
  public globalSearch: string = '';

  private routerSub?: Subscription;

  constructor(
    public authService: AuthService,
    public notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.notifications$ = this.notificationService.notifications$;
    this.updatePageInfo(this.router.url);

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageInfo(event.urlAfterRedirects || event.url);
      this.sidebarMobileOpen = false;
      this.notificationsOpen = false;
      this.profileMenuOpen = false;
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updatePageInfo(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];

    if (cleanUrl.startsWith('/dashboard')) {
      this.pageTitle = 'Dashboard Overview';
      this.breadcrumbs = [{ label: 'EmployeeHub' }, { label: 'Dashboard' }];
    } else if (cleanUrl.startsWith('/employees')) {
      this.pageTitle = 'Employee Directory';
      this.breadcrumbs = [{ label: 'EmployeeHub' }, { label: 'Employees', url: '/employees' }, { label: 'Directory' }];
    } else if (cleanUrl.startsWith('/departments')) {
      this.pageTitle = 'Department Management';
      this.breadcrumbs = [{ label: 'EmployeeHub' }, { label: 'Departments' }];
    } else if (cleanUrl.startsWith('/profile')) {
      this.pageTitle = 'Employee Profile';
      this.breadcrumbs = [{ label: 'EmployeeHub' }, { label: 'My Profile' }];
    } else if (cleanUrl.startsWith('/forbidden')) {
      this.pageTitle = 'Access Denied';
      this.breadcrumbs = [{ label: 'EmployeeHub' }, { label: '403 Forbidden' }];
    } else {
      this.pageTitle = 'Portal';
      this.breadcrumbs = [{ label: 'EmployeeHub' }];
    }
  }

  public toggleMobileSidebar(): void {
    this.sidebarMobileOpen = !this.sidebarMobileOpen;
  }

  public toggleCollapseSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  public closeMobileSidebar(): void {
    this.sidebarMobileOpen = false;
  }

  public toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.profileMenuOpen = false;
      this.demoRoleSwitcherOpen = false;
    }
  }

  public toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
    if (this.profileMenuOpen) {
      this.notificationsOpen = false;
      this.demoRoleSwitcherOpen = false;
    }
  }

  public toggleRoleSwitcher(): void {
    this.demoRoleSwitcherOpen = !this.demoRoleSwitcherOpen;
    if (this.demoRoleSwitcherOpen) {
      this.notificationsOpen = false;
      this.profileMenuOpen = false;
    }
  }

  public switchDemoRole(role: UserRole): void {
    this.authService.switchDemoRole(role);
    this.demoRoleSwitcherOpen = false;
    this.profileMenuOpen = false;
    this.notificationService.info(`Switched view to demo account: ${role}`, 'Role Switched');
  }

  public onGlobalSearch(event: Event): void {
    event.preventDefault();
    if (this.globalSearch.trim()) {
      this.router.navigate(['/employees'], { queryParams: { q: this.globalSearch.trim() } });
      this.globalSearch = '';
    }
  }

  public onLogout(): void {
    this.authService.logout();
    this.notificationService.info('You have been securely logged out.', 'Signed Out');
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header-dropdown-container')) {
      this.notificationsOpen = false;
      this.profileMenuOpen = false;
      this.demoRoleSwitcherOpen = false;
    }
  }
}
