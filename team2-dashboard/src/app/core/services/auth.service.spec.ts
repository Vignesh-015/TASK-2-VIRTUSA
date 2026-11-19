import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

describe('AuthService and AuthInterceptor Real Backend Integration', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: '1',
    name: 'System Admin',
    email: 'admin@ems.com',
    role: 'ADMIN',
    employeeId: 'EMP-1001',
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '9876543210',
    joinDate: '2023-01-10',
    location: 'Chennai (Hybrid)',
    status: 'ACTIVE'
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl'], { url: '/dashboard' });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('1. should authenticate with POST /api/auth/login and store token + user in localStorage', () => {
    service.login({ email: 'admin@ems.com', password: 'Welcome@123' }).subscribe(res => {
      expect(res.token).toBe('jwt.mock.token');
      expect(res.user.email).toBe('admin@ems.com');
      expect(localStorage.getItem('employeehub_token')).toBe('jwt.mock.token');
      expect(localStorage.getItem('employeehub_user')).toContain('admin@ems.com');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin@ems.com', password: 'Welcome@123' });
    req.flush({ token: 'jwt.mock.token', user: mockUser });
  });

  it('2. should extract backend error message on 401 without redirecting', () => {
    service.login({ email: 'admin@ems.com', password: 'wrong' }).subscribe({
      next: () => fail('Should have failed with 401'),
      error: (err: Error) => {
        expect(err.message).toBe('Invalid email or password');
        expect(routerSpy.navigate).not.toHaveBeenCalled();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ message: 'Invalid email or password', status: 401 }, { status: 401, statusText: 'Unauthorized' });
  });

  it('3. should return friendly message when backend cannot be reached (status 0)', () => {
    service.login({ email: 'admin@ems.com', password: 'password' }).subscribe({
      next: () => fail('Should have failed with status 0'),
      error: (err: Error) => {
        expect(err.message).toBe('Cannot reach the server. Please check that the backend is running.');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
  });

  it('4. should post to /api/auth/register with EMPLOYEE role', () => {
    service.register({
      name: 'Test Employee',
      email: 'test@employeehub.com',
      password: 'Password123',
      role: 'EMPLOYEE',
      department: 'Engineering'
    }).subscribe(res => {
      expect(res.message).toBe('Account created');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.role).toBe('EMPLOYEE');
    req.flush({ message: 'Account created', user: mockUser });
  });

  it('5. should extract duplicate email message on registration 409 Conflict', () => {
    service.register({
      name: 'Dup User',
      email: 'dup@employeehub.com',
      password: 'Password123',
      role: 'EMPLOYEE',
      department: 'Engineering'
    }).subscribe({
      next: () => fail('Should have failed with 409'),
      error: (err: Error) => {
        expect(err.message).toBe('A user with this email already exists');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    req.flush({ message: 'A user with this email already exists', status: 409 }, { status: 409, statusText: 'Conflict' });
  });

  it('6. loginWithDemoAccount should call live login when useMockApi is false', () => {
    service.loginWithDemoAccount('ADMIN').subscribe(res => {
      expect(res.token).toBe('admin-live-jwt');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('admin@employeehub.com');
    req.flush({ token: 'admin-live-jwt', user: mockUser });
  });

  it('7. interceptor should attach Bearer token to protected /api/users request', () => {
    localStorage.setItem('employeehub_token', 'valid-jwt-token');

    httpClient.get(`${environment.apiUrl}/users`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/users`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer valid-jwt-token');
    req.flush([]);
  });

  it('8. interceptor should redirect to /login?sessionExpired=true on 401 from protected endpoint', () => {
    httpClient.get(`${environment.apiUrl}/users`).subscribe({
      next: () => fail('Should have failed with 401'),
      error: () => {
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
          queryParams: { returnUrl: '/dashboard', sessionExpired: 'true' }
        });
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users`);
    req.flush({ message: 'Session expired' }, { status: 401, statusText: 'Unauthorized' });
  });
});
