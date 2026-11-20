import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserProfile } from '../models/profile.model';
import { SharedModule } from '../../../shared/shared.module';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const mockProfile: UserProfile = {
    id: 1,
    employeeCode: 'EMP-1007',
    firstName: 'Liam',
    lastName: 'O\'Connor',
    fullName: 'Liam O\'Connor',
    email: 'employee@employeehub.com',
    phone: '+91 9876543210',
    department: 'Engineering',
    designation: 'Staff Frontend Architect',
    joinedOn: '2023-04-11',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    workLocation: 'Boston, MA (Hybrid)',
    managerName: 'Executive Leadership',
    skills: ['Angular', 'TypeScript', 'SCSS'],
    skillsRaw: 'Angular, TypeScript, SCSS',
    bio: 'Dedicated frontend developer.',
    role: 'EMPLOYEE',
    emergencyContactName: 'Mary O\'Connor',
    emergencyContactRelation: 'Sister',
    emergencyContactPhone: '+91 9876543212'
  };

  beforeEach(async () => {
    profileServiceSpy = jasmine.createSpyObj('ProfileService', [
      'getMyProfile',
      'updateMyProfile',
      'changePassword'
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['updateProfile'], {
      currentUser: { avatar: 'avatar.png' }
    });
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning']);

    profileServiceSpy.getMyProfile.and.returnValue(of(mockProfile));

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [ReactiveFormsModule, SharedModule],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should load profile on init and set activeTab to personal', () => {
    expect(profileServiceSpy.getMyProfile).toHaveBeenCalled();
    expect(component.profile).toEqual(mockProfile);
    expect(component.isLoading).toBeFalse();
    expect(component.activeTab).toBe('personal');
  });

  it('2. should populate edit form with profile details', () => {
    component.setTab('edit');
    fixture.detectChanges();

    expect(component.editProfileForm.value.firstName).toBe('Liam');
    expect(component.editProfileForm.value.lastName).toBe('O\'Connor');
    expect(component.editProfileForm.value.phone).toBe('+91 9876543210');
    expect(component.editProfileForm.value.skills).toBe('Angular, TypeScript, SCSS');
  });

  it('3. should save profile updates and update AuthService topbar', () => {
    const updatedProfile = {
      ...mockProfile,
      fullName: 'Liam Updated',
      phone: '+91 9876543299',
      workLocation: 'Chennai (Hybrid)'
    };
    profileServiceSpy.updateMyProfile.and.returnValue(of(updatedProfile));

    component.setTab('edit');
    component.editProfileForm.patchValue({
      firstName: 'Liam',
      lastName: 'Updated',
      phone: '+91 9876543299',
      workLocation: 'Chennai (Hybrid)'
    });

    component.saveProfile();

    expect(profileServiceSpy.updateMyProfile).toHaveBeenCalled();
    expect(authServiceSpy.updateProfile).toHaveBeenCalledWith({
      name: 'Liam Updated',
      phone: '+91 9876543299',
      location: 'Chennai (Hybrid)'
    });
    expect(notificationServiceSpy.success).toHaveBeenCalled();
    expect(component.activeTab).toBe('personal');
  });

  it('4. should validate phone format in edit form', () => {
    component.setTab('edit');
    component.editProfileForm.patchValue({ phone: '123' });
    expect(component.editProfileForm.get('phone')?.invalid).toBeTrue();

    component.editProfileForm.patchValue({ phone: '+91 9876543210' });
    expect(component.editProfileForm.get('phone')?.valid).toBeTrue();
  });

  it('5. should validate change password rules: mismatch, weak, same password', () => {
    component.setTab('password');

    // Mismatched confirmation
    component.passwordForm.setValue({
      currentPassword: 'emp123',
      newPassword: 'Emp@12345',
      confirmPassword: 'Different123'
    });
    expect(component.passwordForm.errors?.['mismatch']).toBeTrue();

    // Same as current password
    component.passwordForm.setValue({
      currentPassword: 'Emp@12345',
      newPassword: 'Emp@12345',
      confirmPassword: 'Emp@12345'
    });
    expect(component.passwordForm.errors?.['sameAsCurrent']).toBeTrue();

    // Weak password (<8 chars)
    component.passwordForm.setValue({
      currentPassword: 'emp123',
      newPassword: 'weak1',
      confirmPassword: 'weak1'
    });
    expect(component.passwordForm.get('newPassword')?.invalid).toBeTrue();
  });

  it('6. should submit valid password change and clear form', () => {
    profileServiceSpy.changePassword.and.returnValue(of({ message: 'Password changed successfully' }));

    component.setTab('password');
    component.passwordForm.setValue({
      currentPassword: 'emp123',
      newPassword: 'Emp@12345',
      confirmPassword: 'Emp@12345'
    });

    component.onChangePasswordSubmit();

    expect(profileServiceSpy.changePassword).toHaveBeenCalledWith({
      currentPassword: 'emp123',
      newPassword: 'Emp@12345',
      confirmPassword: 'Emp@12345'
    });
    expect(component.passwordSuccessMessage).toBe('Password changed successfully');
    expect(notificationServiceSpy.success).toHaveBeenCalled();
    expect(component.passwordForm.value.newPassword).toBeNull();
  });

  it('7. should display backend error when password change fails', () => {
    profileServiceSpy.changePassword.and.returnValue(throwError(() => new Error('Current password is incorrect')));

    component.setTab('password');
    component.passwordForm.setValue({
      currentPassword: 'wrongpassword',
      newPassword: 'Emp@12345',
      confirmPassword: 'Emp@12345'
    });

    component.onChangePasswordSubmit();
    fixture.detectChanges();

    expect(component.passwordErrorMessage).toBe('Current password is incorrect');
  });

  it('8. should toggle password visibility', () => {
    expect(component.showCurrentPassword).toBeFalse();
    component.togglePasswordVisibility('current');
    expect(component.showCurrentPassword).toBeTrue();

    expect(component.showNewPassword).toBeFalse();
    component.togglePasswordVisibility('new');
    expect(component.showNewPassword).toBeTrue();

    expect(component.showConfirmPassword).toBeFalse();
    component.togglePasswordVisibility('confirm');
    expect(component.showConfirmPassword).toBeTrue();
  });
});

