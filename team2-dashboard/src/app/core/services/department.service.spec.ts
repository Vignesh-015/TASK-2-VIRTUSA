import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DepartmentService } from './department.service';
import { environment } from '../../../environments/environment';
import { Department } from '../models/department.model';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let httpMock: HttpTestingController;

  const mockDeptResponse = [
    {
      id: 1,
      name: 'Engineering',
      code: 'ENG',
      description: 'Engineering and Tech',
      headName: 'Alexander Hayes',
      headEmail: 'alexander@employeehub.com',
      employeeCount: 9,
      budget: '$2.4M',
      location: 'Building A, Floor 4',
      color: '#2563EB'
    },
    {
      id: 2,
      name: 'Human Resources',
      code: 'HRD',
      description: 'People experience',
      headName: 'Sarah Jenkins',
      headEmail: 'sarah@employeehub.com',
      employeeCount: 4,
      budget: '$680K',
      location: 'Building A, Floor 2',
      color: '#7C3AED'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DepartmentService]
    });
    service = TestBed.inject(DepartmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch departments from backend and cache them', () => {
    service.getDepartments().subscribe(depts => {
      expect(depts.length).toBe(2);
      expect(depts[0].name).toBe('Engineering');
      expect(depts[0].id).toBe('1');
      expect(depts[0].employeeCount).toBe(9);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/departments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDeptResponse);

    // Subsequent call should hit cache without triggering another HTTP GET
    service.getDepartments().subscribe(depts => {
      expect(depts.length).toBe(2);
    });
    httpMock.expectNone(`${environment.apiUrl}/departments`);
  });

  it('should create a department and invalidate cache', () => {
    const newDept: Omit<Department, 'id'> = {
      name: 'Marketing',
      code: 'MKT',
      description: 'Brand positioning',
      headName: 'Elena Rostova',
      headEmail: 'elena@employeehub.com',
      employeeCount: 0
    };

    service.addDepartment(newDept).subscribe(created => {
      expect(created.name).toBe('Marketing');
      expect(created.id).toBe('3');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/departments`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...newDept, id: 3 });
  });

  it('should update a department via PUT', () => {
    const updates: Partial<Department> = {
      name: 'Core Engineering',
      code: 'CENG'
    };

    service.updateDepartment('1', updates).subscribe(updated => {
      expect(updated.name).toBe('Core Engineering');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/departments/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockDeptResponse[0], name: 'Core Engineering', code: 'CENG' });
  });

  it('should delete a department via DELETE', () => {
    service.deleteDepartment('1').subscribe(success => {
      expect(success).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/departments/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should handle backend error message on conflict', () => {
    service.deleteDepartment('1').subscribe({
      next: () => fail('Should have failed with 409'),
      error: (err) => {
        expect(err.message).toBe('Cannot delete a department that still has employees. Move them first.');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/departments/1`);
    req.flush(
      { message: 'Cannot delete a department that still has employees. Move them first.' },
      { status: 409, statusText: 'Conflict' }
    );
  });
});

