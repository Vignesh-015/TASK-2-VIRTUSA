import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthUser } from '../../../core/models/user.model';

describe('LoginComponent Real Authentication Integration', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let router: Router;

  const mockUser: AuthUser = {
    id: '1',
    name: 'Alexander Hayes',
    email: 'admin@employeehub.com',
    role: 'ADMIN',
    employeeId: 'EMP-1001',
    department: 'Engineering',
    designation: 'VP of Engineering',
    phone: '+1 555-1234',
    status: 'ACTIVE'
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'register',
      'loginWithDemoAccount',
      'getRememberedEmail',
      'isLoggedIn'
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning']);

    authServiceSpy.getRememberedEmail.and.returnValue(null);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    spyOn(router, 'navigateByUrl');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should initialize with signin tab and empty forms', () => {
    expect(component.activeTab).toBe('signin');
    expect(component.loginForm).toBeDefined();
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.value.role).toBe('EMPLOYEE');
  });

  it('2. should display backend error message when login fails', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Invalid email or password')));

    component.loginForm.setValue({
      email: 'admin@ems.com',
      password: 'wrongpassword',
      rememberMe: false
    });

    component.onSignInSubmit();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Invalid email or password');
    expect(router.navigate).not.toHaveBeenCalled();

    const alertEl = fixture.nativeElement.querySelector('.alert-box--error');
    expect(alertEl).toBeTruthy();
    expect(alertEl.textContent).toContain('Invalid email or password');
  });

  it('3. should display server unreachable error when status 0 occurs', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => new Error('Cannot reach the server. Please check that the backend is running.'))
    );

    component.loginForm.setValue({
      email: 'admin@ems.com',
      password: 'password123',
      rememberMe: false
    });

    component.onSignInSubmit();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Cannot reach the server. Please check that the backend is running.');
    const alertEl = fixture.nativeElement.querySelector('.alert-box--error');
    expect(alertEl.textContent).toContain('Cannot reach the server');
  });

  it('4. should navigate to /dashboard on successful login', () => {
    authServiceSpy.login.and.returnValue(of({ token: 'jwt-token', user: mockUser }));

    component.loginForm.setValue({
      email: 'admin@ems.com',
      password: 'Welcome@123',
      rememberMe: false
    });

    component.onSignInSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(notificationServiceSpy.success).toHaveBeenCalled();
  });

  it('5. should enforce role EMPLOYEE when registering from sign up tab', () => {
    authServiceSpy.register.and.returnValue(
      of({ message: 'Account registered', user: { ...mockUser, role: 'EMPLOYEE' } })
    );

    component.setTab('signup');
    fixture.detectChanges();

    // Verify role selector hint text is present in HTML
    const hintEl = fixture.nativeElement.querySelector('.role-selector-grid + p');
    expect(hintEl).toBeTruthy();
    expect(hintEl.textContent).toContain('New accounts are created as Employee. An administrator can change roles later.');

    // User attempts to select ADMIN in the UI
    component.selectRole('ADMIN');
    component.registerForm.patchValue({
      name: 'New Employee',
      email: 'newemp@employeehub.com',
      password: 'Password123'
    });

    component.onSignUpSubmit();

    // Verify payload sent to authService always has role: 'EMPLOYEE'
    expect(authServiceSpy.register).toHaveBeenCalledWith({
      name: 'New Employee',
      email: 'newemp@employeehub.com',
      password: 'Password123',
      role: 'EMPLOYEE'
    });

    // Should switch to signin tab with success message
    expect(component.activeTab).toBe('signin');
    expect(component.successMessage).toContain('Account registered');
  });

  it('6. should display backend duplicate email error on registration failure', () => {
    authServiceSpy.register.and.returnValue(
      throwError(() => new Error('A user with this email address already exists.'))
    );

    component.setTab('signup');
    fixture.detectChanges();

    component.registerForm.patchValue({
      name: 'Duplicate Employee',
      email: 'admin@ems.com',
      password: 'Password123'
    });

    component.onSignUpSubmit();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('A user with this email address already exists.');
    const alertEl = fixture.nativeElement.querySelector('.alert-box--error');
    expect(alertEl).toBeTruthy();
    expect(alertEl.textContent).toContain('A user with this email address already exists.');
  });

  it('7. should not display quick demo access cards and should show account hint', () => {
    const demoSection = fixture.nativeElement.querySelector('.demo-section');
    expect(demoSection).toBeFalsy();

    const hintEl = fixture.nativeElement.querySelector('.switch-tab-hint');
    expect(hintEl).toBeTruthy();
    expect(hintEl.textContent).toContain("Don't have an account? Use Create Account, or ask your administrator.");
  });
});

