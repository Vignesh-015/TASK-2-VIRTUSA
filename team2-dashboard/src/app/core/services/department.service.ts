import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Department } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  /**
   * Mock mode flag:
   * false: connects to Spring Boot backend API at /api/departments
   * true: operates on localStorage mock data for offline development/testing
   */
  private readonly useMock: boolean = false;

  private readonly apiUrl = environment.apiUrl.endsWith('/api')
    ? `${environment.apiUrl}/departments`
    : `${environment.apiUrl}/api/departments`;

  private readonly STORAGE_KEY = 'employeehub_departments_v2';

  // In-memory cache to prevent redundant network calls across multiple components/dropdowns
  private cachedDepartments: Department[] | null = null;
  private departmentsSubject = new BehaviorSubject<Department[]>([]);
  public departments$: Observable<Department[]> = this.departmentsSubject.asObservable();

  private readonly initialDepartments: Department[] = [
    {
      id: '1',
      code: 'ENG',
      name: 'Engineering',
      description: 'Core platform engineering, cloud infrastructure, security architectures, and microservices.',
      headName: 'Alexander Hayes',
      headEmail: 'alexander.hayes@employeehub.com',
      headAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      employeeCount: 6,
      budget: '$2.4M',
      location: 'Building A, Floor 4',
      color: '#2563EB'
    },
    {
      id: '2',
      code: 'PRD',
      name: 'Product & Design',
      description: 'Product discovery, UX research, enterprise design systems, and product lifecycle roadmap.',
      headName: 'Marcus Chen',
      headEmail: 'marcus.chen@employeehub.com',
      headAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      employeeCount: 4,
      budget: '$1.2M',
      location: 'Building A, Floor 3',
      color: '#0D9488'
    },
    {
      id: '3',
      code: 'MKT',
      name: 'Marketing',
      description: 'Brand positioning, global communications, product marketing, and demand generation.',
      headName: 'Elena Rostova',
      headEmail: 'elena.rostova@employeehub.com',
      headAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      employeeCount: 4,
      budget: '$950K',
      location: 'Building B, Floor 2',
      color: '#D97706'
    },
    {
      id: '4',
      code: 'HRD',
      name: 'Human Resources',
      description: 'People experience, talent acquisition, total rewards, and compliance operations.',
      headName: 'Sarah Jenkins',
      headEmail: 'sarah.jenkins@employeehub.com',
      headAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      employeeCount: 3,
      budget: '$680K',
      location: 'Building A, Floor 2',
      color: '#7C3AED'
    },
    {
      id: '5',
      code: 'FIN',
      name: 'Finance & Operations',
      description: 'Corporate financial planning, treasury, facilities management, and audit governance.',
      headName: 'David Kalu',
      headEmail: 'david.kalu@employeehub.com',
      headAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      employeeCount: 3,
      budget: '$1.5M',
      location: 'Building B, Floor 4',
      color: '#059669'
    },
    {
      id: '6',
      code: 'SLS',
      name: 'Sales & Partnerships',
      description: 'Enterprise account growth, global strategic alliances, client success, and sales enablement.',
      headName: 'Jessica Morales',
      headEmail: 'jessica.morales@employeehub.com',
      headAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      employeeCount: 4,
      budget: '$1.8M',
      location: 'Building B, Floor 3',
      color: '#EA580C'
    }
  ];

  constructor(private http: HttpClient) {
    if (this.useMock) {
      this.departmentsSubject.next(this.loadMockInitial());
    }
  }

  // ── MOCK HELPERS ──────────────────────────────────────────────────────────

  private loadMockInitial(): Department[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback to seed
      }
    }
    this.persistMock(this.initialDepartments);
    return this.initialDepartments;
  }

  private persistMock(departments: Department[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(departments));
  }

  // ── MAPPER HELPERS ────────────────────────────────────────────────────────

  private mapFromBackend(dto: any): Department {
    return {
      id: String(dto.id),
      code: dto.code || '',
      name: dto.name,
      description: dto.description || '',
      headName: dto.headName || '',
      headEmail: dto.headEmail || '',
      headAvatar: dto.headAvatar || undefined,
      employeeCount: typeof dto.employeeCount === 'number' ? dto.employeeCount : 0,
      budget: dto.budget || undefined,
      location: dto.location || undefined,
      color: dto.color || '#2563EB'
    };
  }

  private mapToBackend(dept: Partial<Department>): any {
    return {
      name: dept.name != null ? dept.name.trim() : null,
      code: dept.code != null ? dept.code.trim() : null,
      description: dept.description != null ? dept.description.trim() : null,
      headName: dept.headName != null ? dept.headName.trim() : null,
      headEmail: dept.headEmail != null ? dept.headEmail.trim() : null,
      headAvatar: dept.headAvatar || null,
      budget: dept.budget || null,
      location: dept.location || null,
      color: dept.color || null
    };
  }

  private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (error.error.message) {
        return error.error.message;
      }
    }
    return error.message || fallback;
  }

  // ── PUBLIC API METHODS ────────────────────────────────────────────────────

  /**
   * Retrieves all organizational departments.
   * Leverages in-memory caching unless forceRefresh is true.
   */
  public getDepartments(forceRefresh: boolean = false): Observable<Department[]> {
    if (this.useMock) {
      return of(this.departmentsSubject.value).pipe(delay(100));
    }

    if (!forceRefresh && this.cachedDepartments !== null) {
      return of(this.cachedDepartments);
    }

    return this.http.get<any[]>(this.apiUrl).pipe(
      map(items => items.map(item => this.mapFromBackend(item))),
      tap(depts => {
        this.cachedDepartments = depts;
        this.departmentsSubject.next(depts);
      }),
      catchError((error: HttpErrorResponse) => {
        const msg = this.extractErrorMessage(error, 'Failed to load departments.');
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Retrieves a single department by its ID or code.
   */
  public getDepartmentById(id: string): Observable<Department | undefined> {
    if (this.useMock) {
      const found = this.departmentsSubject.value.find(
        d => d.id === id || d.code.toLowerCase() === id.toLowerCase()
      );
      return of(found).pipe(delay(80));
    }

    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.mapFromBackend(dto)),
      catchError((error: HttpErrorResponse) => {
        const msg = this.extractErrorMessage(error, 'Department not found');
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Creates a new department. Invalidates cache on success.
   */
  public addDepartment(dept: Omit<Department, 'id'>): Observable<Department> {
    if (this.useMock) {
      const newDept: Department = {
        ...dept,
        id: 'dept-' + (this.departmentsSubject.value.length + 1) + '-' + Math.random().toString(36).substring(2, 6),
        employeeCount: dept.employeeCount || 0
      };
      const updated = [...this.departmentsSubject.value, newDept];
      this.departmentsSubject.next(updated);
      this.persistMock(updated);
      this.cachedDepartments = updated;
      return of(newDept).pipe(delay(150));
    }

    return this.http.post<any>(this.apiUrl, this.mapToBackend(dept)).pipe(
      map(dto => this.mapFromBackend(dto)),
      tap(() => {
        this.cachedDepartments = null; // Invalidate cache
      }),
      catchError((error: HttpErrorResponse) => {
        const msg = this.extractErrorMessage(error, 'Failed to create department.');
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Updates an existing department. Invalidates cache on success.
   */
  public updateDepartment(id: string, updates: Partial<Department>): Observable<Department> {
    if (this.useMock) {
      const current = this.departmentsSubject.value;
      const index = current.findIndex(d => d.id === id);
      if (index === -1) {
        return throwError(() => new Error('Department not found'));
      }
      const updatedDept = { ...current[index], ...updates };
      const updatedList = [...current];
      updatedList[index] = updatedDept;
      this.departmentsSubject.next(updatedList);
      this.persistMock(updatedList);
      this.cachedDepartments = updatedList;
      return of(updatedDept).pipe(delay(150));
    }

    return this.http.put<any>(`${this.apiUrl}/${id}`, this.mapToBackend(updates)).pipe(
      map(dto => this.mapFromBackend(dto)),
      tap(() => {
        this.cachedDepartments = null; // Invalidate cache
      }),
      catchError((error: HttpErrorResponse) => {
        const msg = this.extractErrorMessage(error, 'Failed to update department.');
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Deletes a department by ID. Invalidates cache on success.
   */
  public deleteDepartment(id: string): Observable<boolean> {
    if (this.useMock) {
      const current = this.departmentsSubject.value;
      const filtered = current.filter(d => d.id !== id);
      if (filtered.length === current.length) {
        return throwError(() => new Error('Department not found'));
      }
      this.departmentsSubject.next(filtered);
      this.persistMock(filtered);
      this.cachedDepartments = filtered;
      return of(true).pipe(delay(150));
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      tap(() => {
        this.cachedDepartments = null; // Invalidate cache
      }),
      catchError((error: HttpErrorResponse) => {
        const msg = this.extractErrorMessage(error, 'Failed to delete department.');
        return throwError(() => new Error(msg));
      })
    );
  }

  public recalculateHeadcounts(deptCountMap: Record<string, number>): void {
    if (this.useMock) {
      const current = this.departmentsSubject.value;
      const updated = current.map(d => ({
        ...d,
        employeeCount: deptCountMap[d.name] !== undefined ? deptCountMap[d.name] : d.employeeCount
      }));
      this.departmentsSubject.next(updated);
      this.persistMock(updated);
      this.cachedDepartments = updated;
    }
  }
}
