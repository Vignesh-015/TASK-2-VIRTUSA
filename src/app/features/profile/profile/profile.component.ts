import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public user: User | null = null;
  public employeeDossier: Employee | null = null;
  public activeTab: 'personal' | 'job' | 'skills' | 'edit' = 'personal';

  public editProfileForm!: FormGroup;
  public isSubmitting: boolean = false;

  constructor(
    public authService: AuthService,
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(currentUser => {
      this.user = currentUser;
      if (currentUser) {
        this.loadMatchingEmployeeRecord(currentUser);
        this.initEditForm(currentUser);
      }
    });
  }

  private loadMatchingEmployeeRecord(currentUser: User): void {
    this.employeeService.getEmployeeByEmail(currentUser.email).subscribe(emp => {
      if (emp) {
        this.employeeDossier = emp;
      } else {
        // Fallback matching by ID or dummy dossier
        this.employeeDossier = {
          id: currentUser.id,
          employeeId: currentUser.employeeId || 'EMP-1001',
          firstName: currentUser.name.split(' ')[0] || '',
          lastName: currentUser.name.split(' ').slice(1).join(' ') || '',
          fullName: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone || '+1 (555) 234-5678',
          avatar: currentUser.avatar,
          department: currentUser.department || 'Engineering',
          designation: currentUser.designation || 'Specialist',
          joiningDate: currentUser.joinDate || '2022-03-15',
          status: currentUser.status || 'ACTIVE',
          employmentType: 'FULL_TIME',
          location: currentUser.location || 'New York, NY (Hybrid)',
          manager: 'Executive Leadership',
          emergencyContact: {
            name: 'Sarah Connor',
            relationship: 'Spouse',
            phone: '+1 (555) 998-1122'
          },
          skills: ['Leadership', 'System Architecture', 'Agile Operations', 'Security Governance'],
          bio: 'Dedicated enterprise professional focused on operational excellence, team empowerment, and secure scalable solutions.'
        };
      }
    });
  }

  private initEditForm(user: User): void {
    this.editProfileForm = this.fb.group({
      name: [user.name, [Validators.required, Validators.minLength(2)]],
      phone: [user.phone || '+1 (555) 234-5678', [Validators.required]],
      location: [user.location || 'New York, NY (Hybrid)', [Validators.required]],
      bio: [this.employeeDossier?.bio || '']
    });
  }

  public setTab(tab: 'personal' | 'job' | 'skills' | 'edit'): void {
    this.activeTab = tab;
    if (tab === 'edit' && this.user) {
      this.editProfileForm.patchValue({
        name: this.user.name,
        phone: this.user.phone || '+1 (555) 234-5678',
        location: this.user.location || 'New York, NY',
        bio: this.employeeDossier?.bio || ''
      });
    }
  }

  public saveProfile(): void {
    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { name, phone, location, bio } = this.editProfileForm.value;

    this.authService.updateProfile({ name, phone, location });
    if (this.employeeDossier) {
      this.employeeService.updateEmployee(this.employeeDossier.id, {
        fullName: name,
        phone,
        location,
        bio
      }).subscribe();
    }

    setTimeout(() => {
      this.isSubmitting = false;
      this.activeTab = 'personal';
      this.notificationService.success('Your profile details have been successfully updated.', 'Profile Saved');
    }, 400);
  }
}
