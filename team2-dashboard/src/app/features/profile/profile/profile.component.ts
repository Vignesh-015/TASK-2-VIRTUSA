import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProfileService } from '../services/profile.service';
import { UserProfile, ProfileUpdateRequest } from '../models/profile.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public profile: UserProfile | null = null;
  public isLoading: boolean = true;
  public activeTab: 'personal' | 'job' | 'skills' | 'edit' | 'password' = 'personal';

  // Forms
  public editProfileForm!: FormGroup;
  public passwordForm!: FormGroup;

  // Form Submission States
  public isSubmitting: boolean = false;
  public isSubmittingPassword: boolean = false;

  // Alerts
  public errorMessage: string | null = null;
  public successMessage: string | null = null;
  public passwordErrorMessage: string | null = null;
  public passwordSuccessMessage: string | null = null;

  // Password Visibility Toggles
  public showCurrentPassword: boolean = false;
  public showNewPassword: boolean = false;
  public showConfirmPassword: boolean = false;

  constructor(
    public authService: AuthService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
  }

  private initForms(): void {
    // Edit Profile Form
    this.editProfileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+91[ -]?)?[0-9]{10}$/)]],
      workLocation: ['', [Validators.maxLength(100)]],
      skills: ['', [Validators.maxLength(500)]],
      bio: ['', [Validators.maxLength(1000)]],
      emergencyContactName: ['', [Validators.maxLength(100)]],
      emergencyContactRelation: ['', [Validators.maxLength(50)]],
      emergencyContactPhone: ['', [Validators.pattern(/^$|^(\+91[ -]?)?[0-9]{10}$/)]]
    });

    // Change Password Form
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(64),
            Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d).+$/)
          ]
        ],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validators: [this.passwordMatchValidator, this.passwordDifferenceValidator]
      }
    );
  }

  // Password validation getters
  get currentPass(): AbstractControl | null { return this.passwordForm.get('currentPassword'); }
  get newPass(): AbstractControl | null { return this.passwordForm.get('newPassword'); }
  get confirmPass(): AbstractControl | null { return this.passwordForm.get('confirmPassword'); }

  // Edit form getters
  get editFirstName(): AbstractControl | null { return this.editProfileForm.get('firstName'); }
  get editLastName(): AbstractControl | null { return this.editProfileForm.get('lastName'); }
  get editPhone(): AbstractControl | null { return this.editProfileForm.get('phone'); }
  get editEmergencyPhone(): AbstractControl | null { return this.editProfileForm.get('emergencyContactPhone'); }

  public loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.populateEditForm(profile);
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'Failed to load profile details.';
        this.isLoading = false;
      }
    });
  }

  private populateEditForm(p: UserProfile): void {
    this.editProfileForm.patchValue({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      phone: p.phone || '',
      workLocation: p.workLocation || '',
      skills: p.skillsRaw || (p.skills ? p.skills.join(', ') : ''),
      bio: p.bio || '',
      emergencyContactName: p.emergencyContactName || '',
      emergencyContactRelation: p.emergencyContactRelation || '',
      emergencyContactPhone: p.emergencyContactPhone || ''
    });
  }

  public setTab(tab: 'personal' | 'job' | 'skills' | 'edit' | 'password'): void {
    this.activeTab = tab;
    this.errorMessage = null;
    this.successMessage = null;
    this.passwordErrorMessage = null;
    this.passwordSuccessMessage = null;

    if (tab === 'edit' && this.profile) {
      this.populateEditForm(this.profile);
    }
  }

  public togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  public saveProfile(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const val = this.editProfileForm.value;

    const payload: ProfileUpdateRequest = {
      firstName: val.firstName.trim(),
      lastName: val.lastName.trim(),
      phone: val.phone.trim(),
      workLocation: val.workLocation ? val.workLocation.trim() : '',
      skills: val.skills ? val.skills.trim() : '',
      bio: val.bio ? val.bio.trim() : '',
      emergencyContactName: val.emergencyContactName ? val.emergencyContactName.trim() : '',
      emergencyContactRelation: val.emergencyContactRelation ? val.emergencyContactRelation.trim() : '',
      emergencyContactPhone: val.emergencyContactPhone ? val.emergencyContactPhone.trim() : ''
    };

    this.profileService.updateMyProfile(payload).subscribe({
      next: (updatedProfile) => {
        this.isSubmitting = false;
        this.profile = updatedProfile;
        this.populateEditForm(updatedProfile);

        // Update AuthService and localStorage so the topbar and shell update without reload
        this.authService.updateProfile({
          name: updatedProfile.fullName,
          phone: updatedProfile.phone,
          location: updatedProfile.workLocation
        });

        this.notificationService.success('Your profile details have been successfully updated.', 'Profile Saved');
        this.setTab('personal');
      },
      error: (err: Error) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Failed to update profile details.';
      }
    });
  }

  public onChangePasswordSubmit(): void {
    this.passwordErrorMessage = null;
    this.passwordSuccessMessage = null;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSubmittingPassword = true;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    this.profileService.changePassword({ currentPassword, newPassword, confirmPassword }).subscribe({
      next: (res) => {
        this.isSubmittingPassword = false;
        this.passwordForm.reset();
        this.passwordSuccessMessage = res.message || 'Password changed successfully.';
        this.notificationService.success(this.passwordSuccessMessage, 'Security Updated');
      },
      error: (err: Error) => {
        this.isSubmittingPassword = false;
        this.passwordErrorMessage = err.message || 'Failed to change password. Please check your inputs.';
      }
    });
  }

  public formatEmploymentType(type?: string): string {
    if (!type) return 'Not provided';
    switch (type) {
      case 'FULL_TIME': return 'Full-Time (Salaried)';
      case 'PART_TIME': return 'Part-Time';
      case 'CONTRACT': return 'Contractor';
      case 'INTERN': return 'Internship';
      default: return type;
    }
  }

  /* ─── Custom Password Validators ────────────────────────────────────────── */

  private passwordMatchValidator(group: FormGroup) {
    const newPass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    if (newPass && confirmPass && newPass !== confirmPass) {
      return { mismatch: true };
    }
    return null;
  }

  private passwordDifferenceValidator(group: FormGroup) {
    const currentPass = group.get('currentPassword')?.value;
    const newPass = group.get('newPassword')?.value;
    if (currentPass && newPass && currentPass === newPass) {
      return { sameAsCurrent: true };
    }
    return null;
  }
}
