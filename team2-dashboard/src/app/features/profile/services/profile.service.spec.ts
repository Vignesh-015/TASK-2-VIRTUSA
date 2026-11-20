import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { ProfileResponse } from '../models/profile.model';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockResponse: ProfileResponse = {
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
    skills: 'Angular, TypeScript, Spring Boot',
    bio: 'Frontend Architect.',
    role: 'EMPLOYEE',
    emergencyContactName: 'Mary O\'Connor',
    emergencyContactRelation: 'Sister',
    emergencyContactPhone: '+91 9876543212'
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['updateProfile'], {
      currentUser: { avatar: 'avatar.png' }
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProfileService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('1. should fetch profile via GET /api/profile/me and map skills to array', () => {
    service.getMyProfile().subscribe(profile => {
      expect(profile.fullName).toBe('Liam O\'Connor');
      expect(profile.skills.length).toBe(3);
      expect(profile.skills).toContain('Angular');
      expect(profile.skills).toContain('TypeScript');
      expect(profile.skills).toContain('Spring Boot');
      expect(profile.emergencyContactName).toBe('Mary O\'Connor');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/profile/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('2. should update profile via PUT /api/profile/me', () => {
    const updatePayload = {
      firstName: 'Liam',
      lastName: 'O\'Connor',
      phone: '+91 9876543210',
      workLocation: 'Chennai (Hybrid)',
      skills: 'Angular 17, Java 17',
      bio: 'Full stack engineer',
      emergencyContactName: 'Mary',
      emergencyContactRelation: 'Sister',
      emergencyContactPhone: '+91 9876543212'
    };

    service.updateMyProfile(updatePayload).subscribe(res => {
      expect(res.workLocation).toBe('Chennai (Hybrid)');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/profile/me`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatePayload);
    req.flush({ ...mockResponse, workLocation: 'Chennai (Hybrid)', skills: 'Angular 17, Java 17' });
  });

  it('3. should change password via POST /api/profile/change-password', () => {
    const payload = {
      currentPassword: 'emp123',
      newPassword: 'Emp@12345',
      confirmPassword: 'Emp@12345'
    };

    service.changePassword(payload).subscribe(res => {
      expect(res.message).toBe('Password changed successfully');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/profile/change-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ message: 'Password changed successfully' });
  });

  it('4. should extract backend error message on failure', () => {
    service.changePassword({
      currentPassword: 'wrong',
      newPassword: 'Emp@12345',
      confirmPassword: 'Emp@12345'
    }).subscribe({
      next: () => fail('Should have failed'),
      error: (err: Error) => {
        expect(err.message).toBe('Current password is incorrect');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/profile/change-password`);
    req.flush({ message: 'Current password is incorrect', status: 400 }, { status: 400, statusText: 'Bad Request' });
  });
});

