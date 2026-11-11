import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
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
  // Constant to easily configure mock token validity in minutes (set to 1 for quick testing)
  public static readonly MOCK_TOKEN_MINUTES = 30;

  private readonly TOKEN_KEY = 'team2_token';
  private readonly USER_KEY = 'team2_user';
  private readonly MOCK_USERS_KEY = 'team2_mock_registered_users';

  private sessionTimer: ReturnType<typeof setTimeout> | null = null;

  // Seed mock accounts
  private readonly defaultMockAccounts: MockAccount[] = [
    {
      user: { id: 'usr-1', name: 'Admin User', email: 'admin@team2.com', role: 'ADMIN' },
      password: 'Admin@123'
    },
    {
      user: { id: 'usr-2', name: 'Priya Sharma', email: 'user@team2.com', role: 'USER' },
      password: 'User@123'
    }
  ];

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

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !isTokenExpired(token);
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
    } else if (token && isTokenExpired(token)) {
      // Clear expired session on startup
      this.logout();
    }
  }

  public login(request: LoginRequest): Observable<LoginResponse> {
    if (environment.useMockApi) {
      return this.mockLogin(request);
    }

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        this.saveSession(response.token, response.user);
      }),
      catchError((error: HttpErrorResponse) => {
        const message = error.error?.message || 'Login failed. Please check your network and credentials.';
        return throwError(() => new Error(message));
      })
    );
  }

  public register(request: RegisterRequest): Observable<{ message: string }> {
    if (environment.useMockApi) {
      return this.mockRegister(request);
    }

    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/register`, request).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = error.error?.message || 'Registration failed. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  public logout(): void {
    this.clearSessionTimer();
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
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
      this.handleSessionExpired();
      return;
    }

    this.sessionTimer = setTimeout(() => {
      this.handleSessionExpired();
    }, expiresInMs);
  }

  private handleSessionExpired(): void {
    this.logout();
    this.router.navigate(['/auth/login'], {
      queryParams: { sessionExpired: 'true' }
    });
  }

  private clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  // --------------------------------------------------------------------------
  // Mock implementations
  // --------------------------------------------------------------------------

  private getMockAccounts(): MockAccount[] {
    const custom = localStorage.getItem(this.MOCK_USERS_KEY);
    let registered: MockAccount[] = [];
    if (custom) {
      try {
        registered = JSON.parse(custom);
      } catch {
        registered = [];
      }
    }
    return [...this.defaultMockAccounts, ...registered];
  }

  private mockLogin(request: LoginRequest): Observable<LoginResponse> {
    const accounts = this.getMockAccounts();
    const match = accounts.find(
      a => a.user.email.toLowerCase() === request.email.trim().toLowerCase() && a.password === request.password
    );

    if (!match) {
      return of(null).pipe(
        delay(600),
        map(() => {
          throw new Error('Invalid email or password');
        })
      );
    }

    const fakeToken = this.generateFakeJwt(match.user);
    const response: LoginResponse = {
      token: fakeToken,
      user: match.user
    };

    return of(response).pipe(
      delay(600),
      tap(res => this.saveSession(res.token, res.user))
    );
  }

  private mockRegister(request: RegisterRequest): Observable<{ message: string }> {
    const accounts = this.getMockAccounts();
    const exists = accounts.some(
      a => a.user.email.toLowerCase() === request.email.trim().toLowerCase()
    );

    if (exists) {
      return of(null).pipe(
        delay(600),
        map(() => {
          throw new Error('This email is already registered');
        })
      );
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: request.name.trim(),
      email: request.email.trim(),
      role: 'USER'
    };

    const custom = localStorage.getItem(this.MOCK_USERS_KEY);
    let registered: MockAccount[] = [];
    if (custom) {
      try {
        registered = JSON.parse(custom);
      } catch {
        registered = [];
      }
    }
    registered.push({ user: newUser, password: request.password });
    localStorage.setItem(this.MOCK_USERS_KEY, JSON.stringify(registered));

    return of({ message: 'Registration successful' }).pipe(delay(600));
  }

  /**
   * Constructs base64url(header).base64url(payload).mockSignature
   * with sub (email), role, name, iat, exp (AuthService.MOCK_TOKEN_MINUTES from now).
   */
  private generateFakeJwt(user: User): string {
    const toBase64Url = (obj: object): string => {
      const json = JSON.stringify(obj);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    const header = { alg: 'HS256', typ: 'JWT' };
    const nowSec = Math.floor(Date.now() / 1000);
    const payload = {
      sub: user.email,
      role: user.role,
      name: user.name,
      iat: nowSec,
      exp: nowSec + AuthService.MOCK_TOKEN_MINUTES * 60
    };

    const encodedHeader = toBase64Url(header);
    const encodedPayload = toBase64Url(payload);
    const fakeSignature = 'fake-signature-for-development';

    return `${encodedHeader}.${encodedPayload}.${fakeSignature}`;
  }
}
