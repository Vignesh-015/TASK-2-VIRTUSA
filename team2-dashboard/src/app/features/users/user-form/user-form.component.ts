import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { USER_DEPARTMENTS, UserRole, UserStatus } from '../models/user.model';
import { UserService } from '../services/user.service';
import { canAddOrEditUsers } from '../users.permissions';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnDestroy {
  public readonly departments = USER_DEPARTMENTS;

  public userForm!: FormGroup;
  public isEditMode: boolean = false;
  public isLoadingUser: boolean = false;
  public isSubmitting: boolean = false;
  public submitAttempted: boolean = false;
  public formError: string | null = null;

  private editingUserId: string | null = null;
  private existingEmails: { id: string; email: string }[] = [];
  private routeSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // replace with route guard in guards task
    if (!canAddOrEditUsers(this.authService.currentRole)) {
      this.router.navigate(['/forbidden']);
      return;
    }

    this.buildForm();
    this.loadExistingEmails();

    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.editingUserId = id;
        this.loadUser(id);
      } else {
        this.isEditMode = false;
        this.editingUserId = null;
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

    const raw = this.userForm.value;
    const payload = {
      fullName: (raw.fullName || '').trim(),
      email: (raw.email || '').trim().toLowerCase(),
      phone: (raw.phone || '').trim(),
      department: raw.department,
      role: raw.role as UserRole,
      status: raw.status as UserStatus,
      joinedOn: raw.joinedOn
    };

    this.isSubmitting = true;

    if (this.isEditMode && this.editingUserId) {
      this.userService.updateUser(this.editingUserId, payload).subscribe({
        next: (updated) => {
          this.isSubmitting = false;
          this.userService.setNotice(`User "${updated.fullName}" updated successfully.`, 'success');
          this.router.navigate(['/users']);
        },
        error: (err: Error) => {
          this.handleSaveError(err);
        }
      });
    } else {
      this.userService.addUser(payload).subscribe({
        next: (created) => {
          this.isSubmitting = false;
          this.userService.setNotice(`User "${created.fullName}" added successfully.`, 'success');
          this.router.navigate(['/users']);
        },
        error: (err: Error) => {
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
    const today = new Date().toISOString().slice(0, 10);

    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, this.trimmedMinLengthValidator(3)]],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
          this.uniqueEmailValidator()
        ]
      ],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      department: ['', [Validators.required]],
      role: ['EMPLOYEE', [Validators.required]],
      status: ['ACTIVE', [Validators.required]],
      joinedOn: [today, [Validators.required]]
    });
  }

  private loadExistingEmails(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.existingEmails = users.map(u => ({
          id: u.id,
          email: u.email.trim().toLowerCase()
        }));
        this.userForm.get('email')?.updateValueAndValidity({ emitEvent: false });
      }
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
        this.userForm.patchValue({
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          department: user.department,
          role: user.role,
          status: user.status,
          joinedOn: user.joinedOn
        });
        this.userForm.markAsPristine();
        this.userForm.get('email')?.updateValueAndValidity({ emitEvent: false });
      },
      error: () => {
        this.isLoadingUser = false;
        this.userService.setNotice('The requested user could not be found.', 'error');
        this.router.navigate(['/users']);
      }
    });
  }

  private trimmedMinLengthValidator(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = typeof control.value === 'string' ? control.value.trim() : '';
      if (!val) {
        return { required: true };
      }
      return val.length < min ? { minlength: { requiredLength: min, actualLength: val.length } } : null;
    };
  }

  private uniqueEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = typeof control.value === 'string' ? control.value.trim().toLowerCase() : '';
      if (!value) {
        return null;
      }
      const duplicate = this.existingEmails.some(
        entry => entry.email === value && entry.id !== this.editingUserId
      );
      return duplicate ? { duplicateEmail: true } : null;
    };
  }

  private handleSaveError(err: Error): void {
    this.isSubmitting = false;
    const message = err?.message || 'Unable to save user. Please try again.';
    if (message.toLowerCase().includes('email')) {
      this.userForm.get('email')?.setErrors({ duplicateEmail: true });
    } else {
      this.formError = message;
    }
  }
}

