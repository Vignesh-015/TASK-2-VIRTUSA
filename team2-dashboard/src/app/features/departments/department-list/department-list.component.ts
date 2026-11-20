import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Department } from '../../../core/models/department.model';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit {
  public departments: Department[] = [];
  public isLoading: boolean = true;
  public totalHeadcount: number = 0;

  // Add / Edit Modal
  public isFormModalOpen: boolean = false;
  public isEditing: boolean = false;
  public selectedDepartment: Department | null = null;
  public departmentForm!: FormGroup;
  public isSubmittingForm: boolean = false;
  public nameErrorMessage: string | null = null;

  // Delete Modal
  public isDeleteModalOpen: boolean = false;
  public departmentToDelete: Department | null = null;
  public isDeleting: boolean = false;
  public deleteErrorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  public get canAddOrEdit(): boolean {
    return this.authService.hasRole(['ADMIN', 'HR']);
  }

  public get canDelete(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();
  }

  private initForm(): void {
    this.departmentForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(6)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      headName: ['', [Validators.required]],
      headEmail: ['', [Validators.required, Validators.email]],
      budget: ['$1.0M'],
      location: ['Building A, Floor 2'],
      color: ['#2563EB']
    });
  }

  public loadDepartments(): void {
    this.isLoading = true;
    this.departmentService.getDepartments(true).subscribe({
      next: (data) => {
        this.departments = data;
        this.totalHeadcount = data.reduce((acc, curr) => acc + (curr.employeeCount || 0), 0);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(err.message || 'Failed to load departments.');
      }
    });
  }

  public viewEmployeesInDept(dept: Department): void {
    this.router.navigate(['/employees'], { queryParams: { department: dept.name } });
  }

  public openAddModal(): void {
    if (!this.canAddOrEdit) {
      this.notificationService.warning('Only Administrators and HR can add new departments.', 'Permission Denied');
      return;
    }
    this.isEditing = false;
    this.selectedDepartment = null;
    this.nameErrorMessage = null;
    this.departmentForm.reset({
      code: '',
      name: '',
      description: '',
      headName: '',
      headEmail: '',
      budget: '$1.0M',
      location: 'Building A, Floor 2',
      color: '#2563EB'
    });
    this.isFormModalOpen = true;
  }

  public openEditModal(dept: Department): void {
    if (!this.canAddOrEdit) {
      this.notificationService.warning('Only Administrators and HR can edit department settings.', 'Permission Denied');
      return;
    }
    this.isEditing = true;
    this.selectedDepartment = dept;
    this.nameErrorMessage = null;
    this.departmentForm.patchValue({
      code: dept.code,
      name: dept.name,
      description: dept.description,
      headName: dept.headName,
      headEmail: dept.headEmail,
      budget: dept.budget || '$1.0M',
      location: dept.location || 'Building A, Floor 2',
      color: dept.color || '#2563EB'
    });
    this.isFormModalOpen = true;
  }

  public saveDepartment(): void {
    this.nameErrorMessage = null;
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.isSubmittingForm = true;
    const formVal = this.departmentForm.value;

    if (this.isEditing && this.selectedDepartment) {
      this.departmentService.updateDepartment(this.selectedDepartment.id, formVal).subscribe({
        next: (updated) => {
          this.isSubmittingForm = false;
          this.isFormModalOpen = false;
          this.nameErrorMessage = null;
          this.notificationService.success(`Department ${updated.name} updated successfully.`, 'Updated');
          this.loadDepartments();
        },
        error: (err) => {
          this.isSubmittingForm = false;
          const msg = err.message || 'Failed to update department.';
          if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('name')) {
            this.nameErrorMessage = msg;
          }
          this.notificationService.error(msg);
        }
      });
    } else {
      this.departmentService.addDepartment(formVal).subscribe({
        next: (created) => {
          this.isSubmittingForm = false;
          this.isFormModalOpen = false;
          this.nameErrorMessage = null;
          this.notificationService.success(`Department ${created.name} (${created.code}) created successfully.`, 'Created');
          this.loadDepartments();
        },
        error: (err) => {
          this.isSubmittingForm = false;
          const msg = err.message || 'Failed to create department.';
          if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('name')) {
            this.nameErrorMessage = msg;
          }
          this.notificationService.error(msg);
        }
      });
    }
  }

  public confirmDelete(dept: Department): void {
    if (!this.canDelete) {
      this.notificationService.warning('Only Administrators can delete departments.', 'Permission Denied');
      return;
    }
    this.departmentToDelete = dept;
    this.deleteErrorMessage = null;
    this.isDeleting = false;
    this.isDeleteModalOpen = true;
  }

  public executeDelete(): void {
    if (!this.canDelete || !this.departmentToDelete) return;
    const name = this.departmentToDelete.name;

    this.isDeleting = true;
    this.deleteErrorMessage = null;
    this.departmentService.deleteDepartment(this.departmentToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        this.departmentToDelete = null;
        this.deleteErrorMessage = null;
        this.notificationService.success(`Department ${name} deleted successfully.`, 'Deleted');
        this.loadDepartments();
      },
      error: (err) => {
        this.isDeleting = false;
        const msg = err.message || 'Failed to delete department.';
        this.deleteErrorMessage = msg;
        this.notificationService.error(msg, 'Cannot Delete');
      }
    });
  }
}

