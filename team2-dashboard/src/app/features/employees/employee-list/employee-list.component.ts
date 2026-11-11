import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Employee, EmployeeFilter, EmployeeStatus, EmploymentType } from '../../../core/models/employee.model';
import { Department } from '../../../core/models/department.model';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  public employees: Employee[] = [];
  public departments: Department[] = [];
  public totalEmployees: number = 0;
  public isLoading: boolean = true;

  // View mode: 'table' or 'grid'
  public viewMode: 'table' | 'grid' = 'table';

  // Filters & Pagination
  public searchKeyword: string = '';
  public selectedDepartment: string = 'ALL';
  public selectedStatus: string = 'ALL';
  public selectedSortBy: 'name' | 'joiningDate' | 'department' | 'employeeId' = 'name';
  public sortOrder: 'asc' | 'desc' = 'asc';
  public currentPage: number = 1;
  public pageSize: number = 8;

  // Modals state
  public isFormModalOpen: boolean = false;
  public isDetailModalOpen: boolean = false;
  public isDeleteModalOpen: boolean = false;

  public isEditing: boolean = false;
  public selectedEmployee: Employee | null = null;
  public employeeToDelete: Employee | null = null;

  // Reactive Form
  public employeeForm!: FormGroup;
  public isSubmittingForm: boolean = false;

  private routeSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    public authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();

    // Check query params for quick filtering or search
    this.routeSub = this.route.queryParams.subscribe(params => {
      if (params['department']) {
        this.selectedDepartment = params['department'];
      }
      if (params['q']) {
        this.searchKeyword = params['q'];
      }
      if (params['action'] === 'new' && this.authService.hasRole(['ADMIN', 'HR'])) {
        this.openAddModal();
      }
      this.loadEmployees();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private initForm(): void {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      department: ['Engineering', [Validators.required]],
      designation: ['', [Validators.required]],
      joiningDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
      status: ['ACTIVE' as EmployeeStatus, [Validators.required]],
      employmentType: ['FULL_TIME' as EmploymentType, [Validators.required]],
      location: ['New York, NY (Hybrid)'],
      manager: ['Alexander Hayes'],
      salaryBand: ['Band 4'],
      skillsString: ['Angular, TypeScript'],
      bio: ['']
    });
  }

  public loadDepartments(): void {
    this.departmentService.getDepartments().subscribe(depts => {
      this.departments = depts;
    });
  }

  public loadEmployees(): void {
    this.isLoading = true;
    const filter: EmployeeFilter = {
      search: this.searchKeyword,
      department: this.selectedDepartment,
      status: this.selectedStatus,
      sortBy: this.selectedSortBy,
      sortOrder: this.sortOrder,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.employeeService.getEmployees(filter).subscribe({
      next: (res) => {
        this.employees = res.data;
        this.totalEmployees = res.total;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('Failed to load employee directory.');
      }
    });
  }

  public onFilterChange(): void {
    this.currentPage = 1;
    this.loadEmployees();
  }

  public onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEmployees();
  }

  public toggleSort(field: 'name' | 'joiningDate' | 'department' | 'employeeId'): void {
    if (this.selectedSortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.selectedSortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadEmployees();
  }

  // Add Employee Modal
  public openAddModal(): void {
    this.isEditing = false;
    this.selectedEmployee = null;
    this.employeeForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: this.departments[0]?.name || 'Engineering',
      designation: '',
      joiningDate: new Date().toISOString().slice(0, 10),
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'New York, NY (Hybrid)',
      manager: 'Alexander Hayes',
      salaryBand: 'Band 4',
      skillsString: '',
      bio: ''
    });
    this.isFormModalOpen = true;
  }

  // Edit Employee Modal
  public openEditModal(emp: Employee): void {
    this.isEditing = true;
    this.selectedEmployee = emp;
    this.employeeForm.patchValue({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
      joiningDate: emp.joiningDate,
      status: emp.status,
      employmentType: emp.employmentType,
      location: emp.location || '',
      manager: emp.manager || '',
      salaryBand: emp.salaryBand || 'Band 4',
      skillsString: (emp.skills || []).join(', '),
      bio: emp.bio || ''
    });
    this.isFormModalOpen = true;
  }

  public saveEmployee(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSubmittingForm = true;
    const val = this.employeeForm.value;
    const skills = val.skillsString ? val.skillsString.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

    if (this.isEditing && this.selectedEmployee) {
      this.employeeService.updateEmployee(this.selectedEmployee.id, {
        firstName: val.firstName,
        lastName: val.lastName,
        email: val.email,
        phone: val.phone,
        department: val.department,
        designation: val.designation,
        joiningDate: val.joiningDate,
        status: val.status,
        employmentType: val.employmentType,
        location: val.location,
        manager: val.manager,
        salaryBand: val.salaryBand,
        skills,
        bio: val.bio
      }).subscribe({
        next: (updated) => {
          this.isSubmittingForm = false;
          this.isFormModalOpen = false;
          this.notificationService.success(`Employee ${updated.fullName} updated successfully.`, 'Updated');
          this.loadEmployees();
        },
        error: (err) => {
          this.isSubmittingForm = false;
          this.notificationService.error(err.message || 'Failed to update employee.');
        }
      });
    } else {
      this.employeeService.addEmployee({
        firstName: val.firstName,
        lastName: val.lastName,
        email: val.email,
        phone: val.phone,
        department: val.department,
        designation: val.designation,
        joiningDate: val.joiningDate,
        status: val.status,
        employmentType: val.employmentType,
        location: val.location,
        manager: val.manager,
        salaryBand: val.salaryBand,
        skills,
        bio: val.bio
      }).subscribe({
        next: (created) => {
          this.isSubmittingForm = false;
          this.isFormModalOpen = false;
          this.notificationService.success(`Employee ${created.fullName} (${created.employeeId}) added successfully.`, 'Created');
          this.loadEmployees();
        },
        error: (err) => {
          this.isSubmittingForm = false;
          this.notificationService.error(err.message || 'Failed to add employee.');
        }
      });
    }
  }

  // View Details Modal
  public openDetailsModal(emp: Employee): void {
    this.selectedEmployee = emp;
    this.isDetailModalOpen = true;
  }

  // Delete Confirmation Dialog
  public confirmDelete(emp: Employee): void {
    if (!this.authService.isAdmin()) {
      this.notificationService.warning('Only Administrators possess permission to permanently delete employee records.', 'Permission Denied');
      return;
    }
    this.employeeToDelete = emp;
    this.isDeleteModalOpen = true;
  }

  public executeDelete(): void {
    if (!this.employeeToDelete) return;
    const name = this.employeeToDelete.fullName;

    this.employeeService.deleteEmployee(this.employeeToDelete.id).subscribe({
      next: () => {
        this.isDeleteModalOpen = false;
        this.employeeToDelete = null;
        this.notificationService.success(`Employee ${name} permanently removed.`, 'Deleted');
        this.loadEmployees();
      },
      error: (err) => {
        this.notificationService.error(err.message || 'Failed to delete employee.');
      }
    });
  }

  public resetFilters(): void {
    this.searchKeyword = '';
    this.selectedDepartment = 'ALL';
    this.selectedStatus = 'ALL';
    this.selectedSortBy = 'name';
    this.sortOrder = 'asc';
    this.currentPage = 1;
    this.loadEmployees();
  }
}

