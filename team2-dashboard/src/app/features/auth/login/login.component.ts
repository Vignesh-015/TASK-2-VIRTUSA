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
  public loginForm!: FormGroup;
  public isLoading: boolean = false;
  public errorMessage: string | null = null;
  public infoMessage: string | null = null;
  public sessionExpiredMessage: string | null = null;
  public showPassword: boolean = false;

  private returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const rememberedEmail = this.authService.getRememberedEmail() || 'admin@employeehub.com';

    this.loginForm = this.fb.group({
      email: [rememberedEmail, [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required, Validators.minLength(4)]],
      rememberMe: [!!rememberedEmail]
    });

    this.route.queryParams.subscribe(params => {
      if (params['registered']) {
        this.infoMessage = 'Account created successfully. You can now sign in.';
      }
      if (params['sessionExpired']) {
        this.sessionExpiredMessage = 'Your session has expired. Please authenticate again.';
      }
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  public fillDemoCredentials(role: UserRole): void {
    const account = this.authService.demoAccounts[role];
    this.loginForm.patchValue({
      email: account.user.email,
      password: account.password
    });
    this.errorMessage = null;
  }

  public quickDemoLogin(role: UserRole): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.loginWithDemoAccount(role).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.notificationService.success(`Signed in as ${res.user.name} (${role})`, 'Welcome back!');
        this.redirectAfterLogin(res.user.role);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Quick login failed.';
      }
    });
  }

  public onSubmit(): void {
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
        this.notificationService.success(`Welcome back, ${res.user.name}!`, 'Authentication Successful');
        this.redirectAfterLogin(res.user.role);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Invalid email or password.';
      }
    });
  }

  private redirectAfterLogin(role: UserRole): void {
    if (this.returnUrl && !this.returnUrl.includes('/forbidden')) {
      // Check if employee has clearance for returnUrl
      if (role === 'EMPLOYEE' && (this.returnUrl.includes('/dashboard') || this.returnUrl.includes('/employees') || this.returnUrl.includes('/departments'))) {
        this.router.navigate(['/profile']);
        return;
      }
      this.router.navigateByUrl(this.returnUrl);
    } else {
      if (role === 'EMPLOYEE') {
        this.router.navigate(['/profile']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }
}
