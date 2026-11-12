/**
 * Spring Boot REST API Contract (/api/users)
 *
 * GET    /api/users      -> User[]
 * GET    /api/users/{id} -> User
 * POST   /api/users      -> User
 * PUT    /api/users/{id} -> User
 * DELETE /api/users/{id} -> void
 *
 * JSON payload / response shape:
 * {
 *   "id": "usr-101",
 *   "fullName": "Aarav Sharma",
 *   "email": "aarav.sharma@employeehub.com",
 *   "phone": "9876543210",
 *   "department": "Engineering",
 *   "role": "ADMIN",       // 'ADMIN' | 'HR' | 'EMPLOYEE'
 *   "status": "ACTIVE",    // 'ACTIVE' | 'INACTIVE'
 *   "joinedOn": "2023-02-14" // 'YYYY-MM-DD'
 * }
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User, UserNotice } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Set to false when connecting to the Spring Boot backend API
  private readonly useMock = true;

  private readonly apiUrl = environment.apiUrl.endsWith('/api')
    ? `${environment.apiUrl}/users`
    : `${environment.apiUrl}/api/users`;

  private pendingNotice: UserNotice | null = null;

  private users: User[] = [
    {
      id: 'usr-101',
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@employeehub.com',
      phone: '9876543210',
      department: 'Engineering',
      role: 'ADMIN',
      status: 'ACTIVE',
      joinedOn: '2023-02-14'
    },
    {
      id: 'usr-102',
      fullName: 'Priya Nair',
      email: 'priya.nair@employeehub.com',
      phone: '9820145678',
      department: 'Engineering',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      joinedOn: '2023-06-05'
    },
    {
      id: 'usr-103',
      fullName: 'Kavita Deshmukh',
      email: 'kavita.deshmukh@employeehub.com',
      phone: '9811234567',
      department: 'HR',
      role: 'HR',
      status: 'ACTIVE',
      joinedOn: '2022-11-21'
    },
    {
      id: 'usr-104',
      fullName: 'Rohan Kulkarni',
      email: 'rohan.kulkarni@employeehub.com',
      phone: '9765432109',
      department: 'HR',
      role: 'HR',
      status: 'ACTIVE',
      joinedOn: '2024-01-15'
    },
    {
      id: 'usr-105',
      fullName: 'Sneha Iyer',
      email: 'sneha.iyer@employeehub.com',
      phone: '9845012345',
      department: 'Finance',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      joinedOn: '2023-04-10'
    },
    {
      id: 'usr-106',
      fullName: 'Vikramaditya Rao',
      email: 'vikram.rao@employeehub.com',
      phone: '9900112233',
      department: 'Finance',
      role: 'EMPLOYEE',
      status: 'INACTIVE',
      joinedOn: '2022-08-19'
    },
    {
      id: 'usr-107',
      fullName: 'Ananya Chatterjee',
      email: 'ananya.chatterjee@employeehub.com',
      phone: '9830198765',
      department: 'Sales',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      joinedOn: '2023-09-04'
    },
    {
      id: 'usr-108',
      fullName: 'Karthik Subramanian',
      email: 'karthik.s@employeehub.com',
      phone: '9840987654',
      department: 'Sales',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      joinedOn: '2024-03-18'
    },
    {
      id: 'usr-109',
      fullName: 'Meera Joshi',
      email: 'meera.joshi@employeehub.com',
      phone: '9822334455',
      department: 'Operations',
      role: 'ADMIN',
      status: 'ACTIVE',
      joinedOn: '2023-01-09'
    },
    {
      id: 'usr-110',
      fullName: 'Siddharth Verma',
      email: 'siddharth.verma@employeehub.com',
      phone: '9818776655',
      department: 'Operations',
      role: 'EMPLOYEE',
      status: 'INACTIVE',
      joinedOn: '2023-07-24'
    },
    {
      id: 'usr-111',
      fullName: 'Divya Menon',
      email: 'divya.menon@employeehub.com',
      phone: '9895123456',
      department: 'Support',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      joinedOn: '2024-05-02'
    },
    {
      id: 'usr-112',
      fullName: 'Arjun Malhotra',
      email: 'arjun.malhotra@employeehub.com',
      phone: '9810456789',
      department: 'Support',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      joinedOn: '2024-07-11'
    }
  ];

  constructor(private http: HttpClient) {}

  public setNotice(message: string, type: 'success' | 'error' = 'success'): void {
    this.pendingNotice = { message, type };
  }

  public consumeNotice(): UserNotice | null {
    const notice = this.pendingNotice;
    this.pendingNotice = null;
    return notice;
  }

  public isEmailTaken(email: string, excludeId?: string): boolean {
    const normalized = email.trim().toLowerCase();
    return this.users.some(
      u => u.email.toLowerCase() === normalized && u.id !== excludeId
    );
  }

  public getUsers(): Observable<User[]> {
    if (!this.useMock) {
      return this.http.get<User[]>(this.apiUrl);
    }

    return of(this.users.map(u => ({ ...u }))).pipe(delay(150));
  }

  public getUserById(id: string): Observable<User | undefined> {
    if (!this.useMock) {
      return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    const found = this.users.find(u => u.id === id);
    return of(found ? { ...found } : undefined).pipe(delay(100));
  }

  public addUser(user: Omit<User, 'id'>): Observable<User> {
    if (!this.useMock) {
      return this.http.post<User>(this.apiUrl, user);
    }

    if (this.isEmailTaken(user.email)) {
      return throwError(() => new Error('A user with this email already exists'));
    }

    const newUser: User = {
      ...user,
      id: 'usr-' + Date.now().toString(36),
      fullName: user.fullName.trim(),
      email: user.email.trim().toLowerCase(),
      phone: user.phone.trim()
    };

    this.users = [newUser, ...this.users];
    return of({ ...newUser }).pipe(delay(150));
  }

  public updateUser(id: string, user: Omit<User, 'id'>): Observable<User> {
    if (!this.useMock) {
      return this.http.put<User>(`${this.apiUrl}/${id}`, user);
    }

    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return throwError(() => new Error('User not found'));
    }

    if (this.isEmailTaken(user.email, id)) {
      return throwError(() => new Error('A user with this email already exists'));
    }

    const updatedUser: User = {
      ...user,
      id,
      fullName: user.fullName.trim(),
      email: user.email.trim().toLowerCase(),
      phone: user.phone.trim()
    };

    this.users = this.users.map(u => (u.id === id ? updatedUser : u));
    return of({ ...updatedUser }).pipe(delay(150));
  }

  public deleteUser(id: string): Observable<void> {
    if (!this.useMock) {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    const exists = this.users.some(u => u.id === id);
    if (!exists) {
      return throwError(() => new Error('User not found'));
    }

    this.users = this.users.filter(u => u.id !== id);
    return of(void 0).pipe(delay(150));
  }
}

