import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole, UserStatus } from '../models/user.model';
import { UserService } from '../services/user.service';
import { canAddOrEditUsers, canChangeRole } from '../users.permissions';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnDestroy {
  public userForm!: FormGroup;
  public currentUser: User | null = null;
  public isLoadingUser: boolean = false;
  public isSubmitting: boolean = false;
  public submitAttempted: boolean = false;
  public formError: string | null = null;

  private editingUserId: string | null = null;
  private originalRole: UserRole | null = null;
  private originalStatus: UserStatus | null = null;
  private routeSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public get canChangeRole(): boolean {
    return canChangeRole(this.authService.currentRole);
  }

  ngOnInit(): void {
    if (!canAddOrEditUsers(this.authService.currentRole)) {
      this.router.navigate(['/forbidden']);
      return;
    }

    this.buildForm();

    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editingUserId = id;
        this.loadUser(id);
      } else {
        this.router.navigate(['/users']);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  public showError(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control && control.invalid && (control.touched || this.submitAttempted));
  }

  public getControl(controlName: string): AbstractControl | null {
    return this.userForm.get(controlName);
  }

  public onSubmit(): void {
    this.submitAttempted = true;
    this.formError = null;

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (!this.editingUserId || !this.currentUser) {
      return;
    }

    const raw = this.userForm.getRawValue() as { role: UserRole; status: UserStatus };
    const roleChanged = raw.role !== this.originalRole;
    const statusChanged = raw.status !== this.originalStatus;

    if (!roleChanged && !statusChanged) {
      this.userService.setNotice('No changes made.', 'success');
      this.router.navigate(['/users']);
      return;
    }

    this.isSubmitting = true;

    if (roleChanged && !statusChanged) {
      this.userService.updateRole(this.editingUserId, raw.role).subscribe({
        next: (updated) => {
          this.isSubmitting = false;
          this.userService.setNotice(`Access role updated for "${updated.fullName}".`, 'success');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.handleSaveError(err);
        }
      });
    } else if (statusChanged && !roleChanged) {
      this.userService.updateStatus(this.editingUserId, raw.status).subscribe({
        next: (updated) => {
          this.isSubmitting = false;
          this.userService.setNotice(`Status updated for "${updated.fullName}".`, 'success');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.handleSaveError(err);
        }
      });
    } else {
      this.userService.updateRole(this.editingUserId, raw.role).pipe(
        switchMap(() => this.userService.updateStatus(this.editingUserId!, raw.status))
      ).subscribe({
        next: (updated) => {
          this.isSubmitting = false;
          this.userService.setNotice(`Access role and status updated for "${updated.fullName}".`, 'success');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.handleSaveError(err);
        }
      });
    }
  }

  public onCancel(): void {
    if (this.userForm.dirty && !confirm('You have unsaved changes. Discard changes and return to users?')) {
      return;
    }
    this.router.navigate(['/users']);
  }

  private buildForm(): void {
    this.userForm = this.fb.group({
      role: ['EMPLOYEE', [Validators.required]],
      status: ['ACTIVE', [Validators.required]]
    });
  }

  private loadUser(id: string): void {
    this.isLoadingUser = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.isLoadingUser = false;
        if (!user) {
          this.userService.setNotice('The requested user could not be found.', 'error');
          this.router.navigate(['/users']);
          return;
        }

        this.currentUser = user;
        this.originalRole = user.role;
        this.originalStatus = user.status;

        this.userForm.patchValue({
          role: user.role,
          status: user.status
        });

        if (!this.canChangeRole) {
          this.userForm.get('role')?.disable();
        } else {
          this.userForm.get('role')?.enable();
        }

        this.userForm.markAsPristine();
      },
      error: () => {
        this.isLoadingUser = false;
        this.userService.setNotice('The requested user could not be found.', 'error');
        this.router.navigate(['/users']);
      }
    });
  }

  private handleSaveError(err: any): void {
    this.isSubmitting = false;
    const message = err?.error?.message || err?.message || 'Unable to update user access. Please try again.';
    this.formError = message;
  }
}
