import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Department } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private readonly STORAGE_KEY = 'employeehub_departments_v2';

  private readonly initialDepartments: Department[] = [
    {
      id: 'dept-1',
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
      id: 'dept-2',
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
      id: 'dept-3',
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
      id: 'dept-4',
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
      id: 'dept-5',
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
      id: 'dept-6',
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

  private departmentsSubject = new BehaviorSubject<Department[]>(this.loadInitial());
  public departments$: Observable<Department[]> = this.departmentsSubject.asObservable();

  constructor() {}

  private loadInitial(): Department[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback to seed
      }
    }
    this.persist(this.initialDepartments);
    return this.initialDepartments;
  }

  private persist(departments: Department[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(departments));
  }

  public getDepartments(): Observable<Department[]> {
    return of(this.departmentsSubject.value).pipe(delay(100));
  }

  public getDepartmentById(id: string): Observable<Department | undefined> {
    const found = this.departmentsSubject.value.find(d => d.id === id || d.code.toLowerCase() === id.toLowerCase());
    return of(found).pipe(delay(80));
  }

  public addDepartment(dept: Omit<Department, 'id'>): Observable<Department> {
    const newDept: Department = {
      ...dept,
      id: 'dept-' + (this.departmentsSubject.value.length + 1) + '-' + Math.random().toString(36).substring(2, 6),
      employeeCount: dept.employeeCount || 0
    };
    const updated = [...this.departmentsSubject.value, newDept];
    this.departmentsSubject.next(updated);
    this.persist(updated);
    return of(newDept).pipe(delay(150));
  }

  public updateDepartment(id: string, updates: Partial<Department>): Observable<Department> {
    const current = this.departmentsSubject.value;
    const index = current.findIndex(d => d.id === id);
    if (index === -1) {
      return throwError(() => new Error('Department not found'));
    }
    const updatedDept = { ...current[index], ...updates };
    const updatedList = [...current];
    updatedList[index] = updatedDept;
    this.departmentsSubject.next(updatedList);
    this.persist(updatedList);
    return of(updatedDept).pipe(delay(150));
  }

  public deleteDepartment(id: string): Observable<boolean> {
    const current = this.departmentsSubject.value;
    const filtered = current.filter(d => d.id !== id);
    if (filtered.length === current.length) {
      return throwError(() => new Error('Department not found'));
    }
    this.departmentsSubject.next(filtered);
    this.persist(filtered);
    return of(true).pipe(delay(150));
  }

  public recalculateHeadcounts(deptCountMap: Record<string, number>): void {
    const current = this.departmentsSubject.value;
    const updated = current.map(d => ({
      ...d,
      employeeCount: deptCountMap[d.name] !== undefined ? deptCountMap[d.name] : d.employeeCount
    }));
    this.departmentsSubject.next(updated);
    this.persist(updated);
  }
}
