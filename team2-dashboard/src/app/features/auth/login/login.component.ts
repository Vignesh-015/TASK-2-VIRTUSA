import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Tab: 'signin' or 'signup'
  public activeTab: 'signin' | 'signup' = 'signin';

  // Forms
  public loginForm!: FormGroup;
  public registerForm!: FormGroup;

  public isLoading: boolean = false;
  public errorMessage: string | null = null;
  public successMessage: string | null = null;
  public sessionExpiredMessage: string | null = null;
  public showPassword: boolean = false;
  public showRegPassword: boolean = false;

  public departments = [
    'Engineering',
    'Product & Design',
    'Marketing',
    'Human Resources',
    'Finance & Operations',
    'Sales & Partnerships'
  ];

  private returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const rememberedEmail = this.authService.getRememberedEmail() || '';

    this.loginForm = this.fb.group({
      email: [rememberedEmail, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rememberMe: [!!rememberedEmail]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['EMPLOYEE' as UserRole, [Validators.required]],
      department: ['Engineering', [Validators.required]]
    });

    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'signup' || this.router.url.includes('/register')) {
        this.activeTab = 'signup';
      }
      if (params['registered']) {
        this.successMessage = 'Account created successfully. You can now sign in.';
      }
      if (params['sessionExpired']) {
        this.sessionExpiredMessage = 'Your session has expired. Please sign in again.';
      }
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  // Getters for template validation
  get loginEmail() { return this.loginForm.get('email'); }
  get loginPassword() { return this.loginForm.get('password'); }

  get regName() { return this.registerForm.get('name'); }
  get regEmail() { return this.registerForm.get('email'); }
  get regPassword() { return this.registerForm.get('password'); }
  get regRole() { return this.registerForm.get('role'); }

  public setTab(tab: 'signin' | 'signup'): void {
    this.activeTab = tab;
    this.errorMessage = null;
    this.successMessage = null;
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  public toggleRegPasswordVisibility(): void {
    this.showRegPassword = !this.showRegPassword;
  }

  public selectRole(role: UserRole): void {
    this.registerForm.patchValue({ role });
  }

  // 1-Click Quick Demo Login (Admin, HR, Employee)
  public quickDemoLogin(role: UserRole): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.loginWithDemoAccount(role).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.notificationService.success(`Welcome, ${res.user.name} (${role})`, 'Signed In');
        this.redirectAfterLogin(res.user.role);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Demo authentication failed.';
      }
    });
  }

  public onSignInSubmit(): void {
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password, rememberMe }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.notificationService.success(`Welcome back, ${res.user.name}!`, 'Signed In');
        this.redirectAfterLogin(res.user.role);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Invalid email or password.';
      }
    });
  }

  public onSignUpSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { name, email, password, role, department } = this.registerForm.value;

    this.authService.register({ name, email, password, role, department }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.activeTab = 'signin';
        this.successMessage = `Account registered for ${res.user.name} (${res.user.role})! Please enter your password to sign in.`;
        this.loginForm.patchValue({ email: res.user.email, password: '' });
        this.notificationService.success('Registration successful. You can now sign in.', 'Account Created');
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Registration failed. Please check your inputs.';
      }
    });
  }

  private redirectAfterLogin(role: UserRole): void {
    // If a valid returnUrl was requested and user has clearance, go there
    if (this.returnUrl && !this.returnUrl.includes('/forbidden') && !this.returnUrl.includes('/login')) {
      if (role === 'EMPLOYEE' && (this.returnUrl.includes('/employees') || this.returnUrl.includes('/departments'))) {
        this.router.navigate(['/dashboard']);
        return;
      }
      this.router.navigateByUrl(this.returnUrl);
    } else {
      // Role-based redirect to dashboard
      this.router.navigate(['/dashboard']);
    }
  }
}
