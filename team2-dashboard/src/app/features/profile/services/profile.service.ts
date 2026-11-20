import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import {
  ProfileResponse,
  UserProfile,
  ProfileUpdateRequest,
  ChangePasswordRequest,
  MessageResponse
} from '../models/profile.model';

/**
 * Service handling personal profile retrieval, updates, and password changes.
 * Connected to Spring Boot endpoints:
 * - GET  /api/profile/me
 * - PUT  /api/profile/me
 * - POST /api/profile/change-password
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  /**
   * Mock flag matching UserService convention.
   * False: calls real Spring Boot endpoints.
   * True: operates on local mock data for offline testing.
   */
  private readonly useMock: boolean = false;

  private readonly MOCK_STORAGE_KEY = 'employeehub_profile_mock';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Fetches the profile of the currently logged-in user.
   */
  public getMyProfile(): Observable<UserProfile> {
    if (this.useMock) {
      return this.mockGetMyProfile();
    }

    return this.http.get<ProfileResponse>(`${environment.apiUrl}/profile/me`).pipe(
      map(res => this.mapToUserProfile(res)),
      catchError((error: HttpErrorResponse) => {
        const msg = error.error?.message || (error.status === 0
          ? 'Cannot reach the server. Please check that the backend is running.'
          : 'Failed to load profile details.');
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Updates editable personal fields for the authenticated user.
   */
  public updateMyProfile(payload: ProfileUpdateRequest): Observable<UserProfile> {
    if (this.useMock) {
      return this.mockUpdateMyProfile(payload);
    }

    return this.http.put<ProfileResponse>(`${environment.apiUrl}/profile/me`, payload).pipe(
      map(res => this.mapToUserProfile(res)),
      catchError((error: HttpErrorResponse) => {
        const msg = error.error?.message || (error.status === 0
          ? 'Cannot reach the server. Please check that the backend is running.'
          : 'Failed to update profile details.');
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Changes the authenticated user's password.
   */
  public changePassword(payload: ChangePasswordRequest): Observable<MessageResponse> {
    if (this.useMock) {
      return this.mockChangePassword(payload);
    }

    return this.http.post<MessageResponse>(`${environment.apiUrl}/profile/change-password`, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        const msg = error.error?.message || (error.status === 0
          ? 'Cannot reach the server. Please check that the backend is running.'
          : 'Failed to change password. Please check your inputs.');
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Maps backend ProfileResponse DTO into UserProfile model used by UI views.
   */
  public mapToUserProfile(res: ProfileResponse): UserProfile {
    const rawSkills = res.skills || '';
    const skillsList = rawSkills
      ? rawSkills.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    return {
      ...res,
      skills: skillsList,
      skillsRaw: rawSkills,
      avatar: this.authService.currentUser?.avatar
    };
  }

  /* ─── Mock Fallback Methods ────────────────────────────────────────────── */

  private mockGetMyProfile(): Observable<UserProfile> {
    const stored = localStorage.getItem(this.MOCK_STORAGE_KEY);
    if (stored) {
      try {
        return of(JSON.parse(stored)).pipe(delay(200));
      } catch {
        // Fall back to generation
      }
    }

    const current = this.authService.currentUser;
    const initial: UserProfile = {
      id: 1,
      employeeCode: current?.employeeId || 'EMP-1001',
      firstName: current?.name ? current.name.split(' ')[0] : 'Alexander',
      lastName: current?.name ? current.name.split(' ').slice(1).join(' ') : 'Hayes',
      fullName: current?.name || 'Alexander Hayes',
      email: current?.email || 'admin@employeehub.com',
      phone: current?.phone || '+91 9876543210',
      department: current?.department || 'Engineering',
      designation: current?.designation || 'Specialist',
      joinedOn: current?.joinDate || '2023-01-15',
      status: current?.status || 'ACTIVE',
      employmentType: 'FULL_TIME',
      workLocation: current?.location || 'New York, NY (Hybrid)',
      managerName: 'Executive Leadership',
      skills: ['Leadership', 'System Architecture', 'Agile Operations'],
      skillsRaw: 'Leadership, System Architecture, Agile Operations',
      bio: 'Enterprise professional committed to operational excellence.',
      role: current?.role || 'ADMIN',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactPhone: '',
      avatar: current?.avatar
    };

    localStorage.setItem(this.MOCK_STORAGE_KEY, JSON.stringify(initial));
    return of(initial).pipe(delay(200));
  }

  private mockUpdateMyProfile(payload: ProfileUpdateRequest): Observable<UserProfile> {
    return this.mockGetMyProfile().pipe(
      map(profile => {
        const fullName = `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim();
        const rawSkills = payload.skills || '';
        const skillsList = rawSkills
          ? rawSkills.split(',').map(s => s.trim()).filter(s => s.length > 0)
          : [];

        const updated: UserProfile = {
          ...profile,
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          fullName,
          phone: payload.phone.trim(),
          workLocation: payload.workLocation?.trim() || '',
          skills: skillsList,
          skillsRaw: rawSkills,
          bio: payload.bio?.trim() || '',
          emergencyContactName: payload.emergencyContactName?.trim() || '',
          emergencyContactRelation: payload.emergencyContactRelation?.trim() || '',
          emergencyContactPhone: payload.emergencyContactPhone?.trim() || ''
        };

        localStorage.setItem(this.MOCK_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      })
    );
  }

  private mockChangePassword(payload: ChangePasswordRequest): Observable<MessageResponse> {
    if (!payload.currentPassword) {
      return throwError(() => new Error('Current password is required'));
    }
    if (payload.newPassword !== payload.confirmPassword) {
      return throwError(() => new Error('New password and confirmation do not match'));
    }
    if (payload.newPassword.length < 8) {
      return throwError(() => new Error('Password must be at least 8 characters and include a letter and a number'));
    }
    if (payload.newPassword === payload.currentPassword) {
      return throwError(() => new Error('New password must be different from the current password'));
    }

    return of({ message: 'Password changed successfully' }).pipe(delay(200));
  }
}

