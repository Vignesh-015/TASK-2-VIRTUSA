import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';
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

  public currentUser$!: Observable<User | null>;
  public notifications$!: Observable<AppNotification[]>;

  public pageTitle: string = 'Dashboard';
  public breadcrumbs: BreadcrumbItem[] = [{ label: 'EmployeeHub' }, { label: 'Dashboard' }];

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
    } else if (cleanUrl === '/users/new') {
      this.pageTitle = 'Add User';
      this.breadcrumbs = [{ label: 'EmployeeHub' }, { label: 'Users', url: '/users' }, { label: 'Add User' }];
    } else if (cleanUrl.startsWith('/users/') && cleanUrl.endsWith('/edit')) {
      this.pageTitle = 'Edit User';
      this.breadcrumbs = [{ label: 'EmployeeHub' }, { label: 'Users', url: '/users' }, { label: 'Edit User' }];
    } else if (cleanUrl.startsWith('/users')) {
      this.pageTitle = 'Users';
      this.breadcrumbs = [{ label: 'EmployeeHub' }, { label: 'Users' }];
    } else if (cleanUrl.startsWith('/profile')) {
      this.pageTitle = 'My Profile';
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
    }
  }

  public toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
    if (this.profileMenuOpen) {
      this.notificationsOpen = false;
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
    }
  }
}
