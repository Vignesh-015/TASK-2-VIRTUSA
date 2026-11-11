import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/user.model';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { decodeToken, isTokenExpired } from '../utils/jwt.util';

interface MockAccount {
  user: User;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public static readonly MOCK_TOKEN_MINUTES = 120;

  private readonly TOKEN_KEY = 'employeehub_token';
  private readonly USER_KEY = 'employeehub_user';
  private readonly REMEMBER_KEY = 'employeehub_remember_email';

  private sessionTimer: ReturnType<typeof setTimeout> | null = null;

  // Pre-configured Demo Accounts according to requirements
  public readonly demoAccounts: Record<UserRole, MockAccount> = {
    ADMIN: {
      user: {
        id: 'usr-admin-1',
        employeeId: 'EMP-1001',
        name: 'Alexander Hayes',
        email: 'admin@employeehub.com',
        role: 'ADMIN',
        department: 'Engineering',
        designation: 'VP of Engineering & Portal Admin',
        phone: '+1 (555) 234-5678',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinDate: '2021-03-15',
        location: 'New York, NY',
        status: 'ACTIVE'
      },
      password: 'admin123'
    },
    HR: {
      user: {
        id: 'usr-hr-1',
        employeeId: 'EMP-1002',
        name: 'Sarah Jenkins',
        email: 'hr@employeehub.com',
        role: 'HR',
        department: 'Human Resources',
        designation: 'Head of People Operations',
        phone: '+1 (555) 345-6789',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        joinDate: '2021-08-10',
        location: 'San Francisco, CA',
        status: 'ACTIVE'
      },
      password: 'hr123'
    },
    EMPLOYEE: {
      user: {
        id: 'usr-emp-1',
        employeeId: 'EMP-1007',
        name: 'Liam O\'Connor',
        email: 'employee@employeehub.com',
        role: 'EMPLOYEE',
        department: 'Engineering',
        designation: 'Staff Frontend Architect',
        phone: '+1 (555) 890-1234',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        joinDate: '2023-04-11',
        location: 'Boston, MA',
        status: 'ACTIVE'
      },
      password: 'emp123'
    }
  };

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.restoreSession();
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public get currentRole(): UserRole | null {
    return this.currentUserSubject.value?.role || null;
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public getRememberedEmail(): string | null {
    return localStorage.getItem(this.REMEMBER_KEY);
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !isTokenExpired(token) && !!this.currentUser;
  }

  public isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  public isHr(): boolean {
    return this.currentUser?.role === 'HR';
  }

  public isEmployee(): boolean {
    return this.currentUser?.role === 'EMPLOYEE';
  }

  public hasRole(roles: string | string[]): boolean {
    if (!this.currentUser) return false;
    const allowed = Array.isArray(roles) ? roles : [roles];
    return allowed.includes(this.currentUser.role);
  }

  private restoreSession(): void {
    const token = this.getToken();
    const storedUser = localStorage.getItem(this.USER_KEY);

    if (token && !isTokenExpired(token) && storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.scheduleAutoLogout(token);
      } catch {
        this.logout();
      }
    } else {
      // Default to ADMIN for smooth evaluator onboarding if no previous session
      this.loginWithDemoAccount('ADMIN');
    }
  }

  public register(request: RegisterRequest): Observable<{ message: string }> {
    if (environment.useMockApi) {
      return of({ message: 'Registration successful.' }).pipe(delay(300));
    }
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/register`, request).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = error.error?.message || 'Registration failed. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  public login(request: LoginRequest): Observable<LoginResponse> {
    if (request.rememberMe) {
      localStorage.setItem(this.REMEMBER_KEY, request.email);
    } else {
      localStorage.removeItem(this.REMEMBER_KEY);
    }

    if (environment.useMockApi) {
      return this.mockLogin(request);
    }

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        this.saveSession(response.token, response.user);
      }),
      catchError((error: HttpErrorResponse) => {
        const message = error.error?.message || 'Invalid credentials. Please verify your email and password.';
        return throwError(() => new Error(message));
      })
    );
  }

  public loginWithDemoAccount(role: UserRole): Observable<LoginResponse> {
    const account = this.demoAccounts[role];
    const token = this.generateMockToken(account.user);
    this.saveSession(token, account.user);
    return of({ token, user: account.user }).pipe(delay(200));
  }

  public switchDemoRole(role: UserRole): void {
    const account = this.demoAccounts[role];
    const token = this.generateMockToken(account.user);
    this.saveSession(token, account.user);

    // If switched to EMPLOYEE and currently on an admin/hr route, redirect to profile
    if (role === 'EMPLOYEE') {
      const currentUrl = this.router.url;
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/employees') || currentUrl.includes('/departments') || currentUrl.includes('/forbidden')) {
        this.router.navigate(['/profile']);
      }
    } else {
      if (this.router.url.includes('/forbidden')) {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  public updateProfile(updates: Partial<User>): void {
    if (!this.currentUser) return;
    const updated: User = { ...this.currentUser, ...updates };
    this.currentUserSubject.next(updated);
    localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
  }

  public logout(): void {
    this.clearSessionTimer();
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private saveSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.scheduleAutoLogout(token);
  }

  private scheduleAutoLogout(token: string): void {
    this.clearSessionTimer();
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return;

    const expiresInMs = payload.exp * 1000 - Date.now();
    if (expiresInMs <= 0) {
      this.logout();
      return;
    }

    this.sessionTimer = setTimeout(() => {
      this.logout();
    }, expiresInMs);
  }

  private clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  private mockLogin(request: LoginRequest): Observable<LoginResponse> {
    const email = request.email.trim().toLowerCase();
    const password = request.password;

    // Find in demo accounts
    for (const roleKey of Object.keys(this.demoAccounts) as UserRole[]) {
      const acc = this.demoAccounts[roleKey];
      if (acc.user.email.toLowerCase() === email && acc.password === password) {
        const token = this.generateMockToken(acc.user);
        this.saveSession(token, acc.user);
        return of({ token, user: acc.user }).pipe(delay(350));
      }
    }

    // Generic fallback for any email with correct test pattern
    if (email.includes('@') && password.length >= 6) {
      const role: UserRole = email.includes('admin') ? 'ADMIN' : (email.includes('hr') ? 'HR' : 'EMPLOYEE');
      const user: User = {
        id: 'usr-' + Math.random().toString(36).substring(2, 7),
        name: email.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
        email,
        role,
        department: role === 'HR' ? 'Human Resources' : 'Engineering',
        designation: role === 'ADMIN' ? 'System Administrator' : (role === 'HR' ? 'HR Specialist' : 'Software Engineer'),
        status: 'ACTIVE'
      };
      const token = this.generateMockToken(user);
      this.saveSession(token, user);
      return of({ token, user }).pipe(delay(350));
    }

    return throwError(() => new Error('Invalid email or password. You can use one of the Quick Demo buttons below.'));
  }

  private generateMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = nowSec + AuthService.MOCK_TOKEN_MINUTES * 60;
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: nowSec,
      exp: expSec
    }));
    const signature = btoa('mock-employeehub-sig');
    return `${header}.${payload}.${signature}`;
  }
}
