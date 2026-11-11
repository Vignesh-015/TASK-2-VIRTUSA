import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Employee, EmployeeFilter, EmployeeStatus } from '../models/employee.model';
import { DepartmentService } from './department.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly STORAGE_KEY = 'employeehub_employees';

  private readonly initialEmployees: Employee[] = [
    {
      id: 'emp-1',
      employeeId: 'EMP-1001',
      firstName: 'Alexander',
      lastName: 'Hayes',
      fullName: 'Alexander Hayes',
      email: 'alexander.hayes@employeehub.com',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department: 'Engineering',
      designation: 'VP of Engineering',
      joiningDate: '2021-03-15',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'New York, NY (Hybrid)',
      manager: 'Executive Committee',
      salaryBand: 'Band 7',
      emergencyContact: { name: 'Evelyn Hayes', relationship: 'Spouse', phone: '+1 (555) 234-9988' },
      skills: ['Distributed Systems', 'Cloud Architecture', 'Engineering Leadership', 'Go', 'Kubernetes'],
      bio: 'Over 14 years leading high-performance engineering teams and modernizing mission-critical enterprise systems.'
    },
    {
      id: 'emp-2',
      employeeId: 'EMP-1002',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@employeehub.com',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      department: 'Human Resources',
      designation: 'Head of People & Culture',
      joiningDate: '2021-08-10',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'San Francisco, CA (On-site)',
      manager: 'Chief Executive Officer',
      salaryBand: 'Band 6',
      emergencyContact: { name: 'Mark Jenkins', relationship: 'Spouse', phone: '+1 (555) 345-0011' },
      skills: ['Talent Strategy', 'Employee Experience', 'Performance Management', 'DE&I', 'HR Compliance'],
      bio: 'Passionate People Operations leader dedicated to cultivating healthy, inclusive, and thriving enterprise cultures.'
    },
    {
      id: 'emp-3',
      employeeId: 'EMP-1003',
      firstName: 'Marcus',
      lastName: 'Chen',
      fullName: 'Marcus Chen',
      email: 'marcus.chen@employeehub.com',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      department: 'Product & Design',
      designation: 'Head of Product',
      joiningDate: '2022-01-18',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'Seattle, WA (Remote)',
      manager: 'Chief Product Officer',
      salaryBand: 'Band 6',
      emergencyContact: { name: 'Linda Chen', relationship: 'Sister', phone: '+1 (555) 456-9912' },
      skills: ['Product Discovery', 'Design Systems', 'Data Analytics', 'Agile Product Management', 'Enterprise UX'],
      bio: 'Product strategist passionate about customer-driven innovation and delightful enterprise workflows.'
    },
    {
      id: 'emp-4',
      employeeId: 'EMP-1004',
      firstName: 'Elena',
      lastName: 'Rostova',
      fullName: 'Elena Rostova',
      email: 'elena.rostova@employeehub.com',
      phone: '+1 (555) 567-8901',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      department: 'Marketing',
      designation: 'Director of Growth & Brand',
      joiningDate: '2022-06-01',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'Chicago, IL (Hybrid)',
      manager: 'Chief Marketing Officer',
      salaryBand: 'Band 6',
      emergencyContact: { name: 'Oleg Rostov', relationship: 'Father', phone: '+1 (555) 567-4433' },
      skills: ['Brand Identity', 'Product Marketing', 'Demand Generation', 'Content Strategy', 'SEO & Analytics'],
      bio: 'Driving enterprise demand, brand positioning, and digital acquisition channels.'
    },
    {
      id: 'emp-5',
      employeeId: 'EMP-1005',
      firstName: 'David',
      lastName: 'Kalu',
      fullName: 'David Kalu',
      email: 'david.kalu@employeehub.com',
      phone: '+1 (555) 678-9012',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      department: 'Finance & Operations',
      designation: 'Finance Controller',
      joiningDate: '2022-09-15',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'Austin, TX (On-site)',
      manager: 'Chief Financial Officer',
      salaryBand: 'Band 5',
      emergencyContact: { name: 'Amara Kalu', relationship: 'Spouse', phone: '+1 (555) 678-1122' },
      skills: ['Financial Modeling', 'Budgeting & Forecasting', 'GAAP Compliance', 'ERP Systems', 'Risk Management'],
      bio: 'CPA with extensive experience in fiscal governance, capital allocation, and compliance frameworks.'
    },
    {
      id: 'emp-6',
      employeeId: 'EMP-1006',
      firstName: 'Jessica',
      lastName: 'Morales',
      fullName: 'Jessica Morales',
      email: 'jessica.morales@employeehub.com',
      phone: '+1 (555) 789-0123',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      department: 'Sales & Partnerships',
      designation: 'VP of Strategic Alliances',
      joiningDate: '2023-02-01',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'Miami, FL (Remote)',
      manager: 'Chief Revenue Officer',
      salaryBand: 'Band 6',
      emergencyContact: { name: 'Carlos Morales', relationship: 'Brother', phone: '+1 (555) 789-5566' },
      skills: ['Enterprise Sales', 'Partner Ecosystems', 'Executive Negotiation', 'Revenue Forecasting', 'CRM'],
      bio: 'Scaling global partner alliances and enterprise revenue pipelines with strategic enterprise accounts.'
    },
    {
      id: 'emp-7',
      employeeId: 'EMP-1007',
      firstName: 'Liam',
      lastName: 'O\'Connor',
      fullName: 'Liam O\'Connor',
      email: 'liam.oconnor@employeehub.com',
      phone: '+1 (555) 890-1234',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      department: 'Engineering',
      designation: 'Staff Frontend Architect',
      joiningDate: '2023-04-11',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'Boston, MA (Hybrid)',
      manager: 'Alexander Hayes',
      salaryBand: 'Band 5',
      emergencyContact: { name: 'Fiona O\'Connor', relationship: 'Mother', phone: '+1 (555) 890-7788' },
      skills: ['Angular', 'TypeScript', 'Web Performance', 'Micro-frontends', 'Design Systems', 'RxJS'],
      bio: 'Crafting performant, accessible enterprise frontend architectures and developer toolkits.'
    },
    {
      id: 'emp-8',
      employeeId: 'EMP-1008',
      firstName: 'Ananya',
      lastName: 'Patel',
      fullName: 'Ananya Patel',
      email: 'ananya.patel@employeehub.com',
      phone: '+1 (555) 901-2345',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      department: 'Engineering',
      designation: 'Senior Backend Engineer',
      joiningDate: '2023-07-20',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'New York, NY (Hybrid)',
      manager: 'Alexander Hayes',
      salaryBand: 'Band 4',
      emergencyContact: { name: 'Raj Patel', relationship: 'Father', phone: '+1 (555) 901-3322' },
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Kafka', 'REST APIs', 'Spring Security'],
      bio: 'Specialist in Spring Boot microservices, high-throughput message streams, and relational data modeling.'
    },
    {
      id: 'emp-9',
      employeeId: 'EMP-1009',
      firstName: 'Lucas',
      lastName: 'Silva',
      fullName: 'Lucas Silva',
      email: 'lucas.silva@employeehub.com',
      phone: '+1 (555) 012-3456',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      department: 'Product & Design',
      designation: 'Senior Product Designer',
      joiningDate: '2023-10-02',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'San Francisco, CA (Hybrid)',
      manager: 'Marcus Chen',
      salaryBand: 'Band 4',
      emergencyContact: { name: 'Maria Silva', relationship: 'Mother', phone: '+1 (555) 012-7744' },
      skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Prototyping', 'Accessibility'],
      bio: 'Obsessed with micro-interactions, cohesive typography, and clean enterprise user journeys.'
    },
    {
      id: 'emp-10',
      employeeId: 'EMP-1010',
      firstName: 'Chloe',
      lastName: 'Dupont',
      fullName: 'Chloe Dupont',
      email: 'chloe.dupont@employeehub.com',
      phone: '+1 (555) 123-4567',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      department: 'Marketing',
      designation: 'Content & Social Lead',
      joiningDate: '2024-01-15',
      status: 'ONBOARDING',
      employmentType: 'FULL_TIME',
      location: 'Denver, CO (Remote)',
      manager: 'Elena Rostova',
      salaryBand: 'Band 3',
      emergencyContact: { name: 'Jean Dupont', relationship: 'Father', phone: '+1 (555) 123-9933' },
      skills: ['Content Marketing', 'Copywriting', 'Social Strategy', 'Creative Direction'],
      bio: 'Amplifying the brand story and engineering compelling multi-channel narratives.'
    },
    {
      id: 'emp-11',
      employeeId: 'EMP-1011',
      firstName: 'Tariq',
      lastName: 'Mansour',
      fullName: 'Tariq Mansour',
      email: 'tariq.mansour@employeehub.com',
      phone: '+1 (555) 234-5670',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      department: 'Engineering',
      designation: 'DevOps & SRE Specialist',
      joiningDate: '2024-02-01',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'Dallas, TX (Hybrid)',
      manager: 'Alexander Hayes',
      salaryBand: 'Band 4',
      emergencyContact: { name: 'Nadia Mansour', relationship: 'Spouse', phone: '+1 (555) 234-8899' },
      skills: ['Terraform', 'AWS', 'Docker', 'CI/CD Pipelines', 'Prometheus', 'Linux'],
      bio: 'Championing 99.99% uptime, infrastructure as code, and automated deployment pipelines.'
    },
    {
      id: 'emp-12',
      employeeId: 'EMP-1012',
      firstName: 'Olivia',
      lastName: 'Bennett',
      fullName: 'Olivia Bennett',
      email: 'olivia.bennett@employeehub.com',
      phone: '+1 (555) 345-6780',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      department: 'Human Resources',
      designation: 'HR Operations Specialist',
      joiningDate: '2024-03-01',
      status: 'ONBOARDING',
      employmentType: 'FULL_TIME',
      location: 'San Francisco, CA (On-site)',
      manager: 'Sarah Jenkins',
      salaryBand: 'Band 3',
      emergencyContact: { name: 'Arthur Bennett', relationship: 'Father', phone: '+1 (555) 345-4422' },
      skills: ['HRIS Management', 'Employee Onboarding', 'Benefits Administration', 'Payroll'],
      bio: 'Delivering seamless onboarding experiences and modern HR self-service tooling.'
    },
    {
      id: 'emp-13',
      employeeId: 'EMP-1013',
      firstName: 'Ethan',
      lastName: 'Wong',
      fullName: 'Ethan Wong',
      email: 'ethan.wong@employeehub.com',
      phone: '+1 (555) 456-7891',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      department: 'Finance & Operations',
      designation: 'Senior Financial Analyst',
      joiningDate: '2023-05-15',
      status: 'ON_LEAVE',
      employmentType: 'FULL_TIME',
      location: 'Austin, TX (On-site)',
      manager: 'David Kalu',
      salaryBand: 'Band 4',
      emergencyContact: { name: 'Grace Wong', relationship: 'Mother', phone: '+1 (555) 456-1188' },
      skills: ['Variance Analysis', 'Corporate Planning', 'Financial Reporting', 'Tableau', 'Excel Mastery'],
      bio: 'On approved parental leave. Specializes in variance modeling and department operational budgets.'
    },
    {
      id: 'emp-14',
      employeeId: 'EMP-1014',
      firstName: 'Rachel',
      lastName: 'Kim',
      fullName: 'Rachel Kim',
      email: 'rachel.kim@employeehub.com',
      phone: '+1 (555) 567-8902',
      avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed2820e9?w=150&auto=format&fit=crop&q=80',
      department: 'Sales & Partnerships',
      designation: 'Senior Enterprise Account Exec',
      joiningDate: '2023-08-20',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'New York, NY (Hybrid)',
      manager: 'Jessica Morales',
      salaryBand: 'Band 4',
      emergencyContact: { name: 'Kevin Kim', relationship: 'Brother', phone: '+1 (555) 567-2244' },
      skills: ['Consultative Selling', 'Solution Architecture', 'Enterprise Contract Negotiation', 'Pipeline Mgmt'],
      bio: 'Driving strategic client partnerships and enterprise cloud transformation agreements.'
    },
    {
      id: 'emp-15',
      employeeId: 'EMP-1015',
      firstName: 'Vikram',
      lastName: 'Singh',
      fullName: 'Vikram Singh',
      email: 'vikram.singh@employeehub.com',
      phone: '+1 (555) 678-9013',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
      department: 'Engineering',
      designation: 'QA Automation Lead',
      joiningDate: '2023-11-10',
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      location: 'San Jose, CA (Hybrid)',
      manager: 'Alexander Hayes',
      salaryBand: 'Band 4',
      emergencyContact: { name: 'Sunita Singh', relationship: 'Spouse', phone: '+1 (555) 678-5511' },
      skills: ['Cypress', 'Playwright', 'Jest', 'Test Automation', 'API Testing', 'Performance Benchmarking'],
      bio: 'Establishing test automation rigor, regression harnesses, and quality gate metrics.'
    },
    {
      id: 'emp-16',
      employeeId: 'EMP-1016',
      firstName: 'Maya',
      lastName: 'Lin',
      fullName: 'Maya Lin',
      email: 'maya.lin@employeehub.com',
      phone: '+1 (555) 789-0124',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      department: 'Product & Design',
      designation: 'Associate UX Researcher',
      joiningDate: '2024-04-01',
      status: 'ONBOARDING',
      employmentType: 'FULL_TIME',
      location: 'Seattle, WA (Remote)',
      manager: 'Marcus Chen',
      salaryBand: 'Band 2',
      emergencyContact: { name: 'Wei Lin', relationship: 'Father', phone: '+1 (555) 789-8833' },
      skills: ['User Interviews', 'Usability Testing', 'Heuristic Evaluation', 'Survey Design'],
      bio: 'Conducting in-depth user interviews and ethnographic research to inform product roadmaps.'
    }
  ];

  private employeesSubject = new BehaviorSubject<Employee[]>(this.loadInitial());
  public employees$: Observable<Employee[]> = this.employeesSubject.asObservable();

  constructor(private departmentService: DepartmentService) {
    this.syncDepartmentCounts();
  }

  private loadInitial(): Employee[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    this.persist(this.initialEmployees);
    return this.initialEmployees;
  }

  private persist(employees: Employee[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(employees));
    this.syncDepartmentCounts();
  }

  private syncDepartmentCounts(): void {
    const counts: Record<string, number> = {};
    for (const emp of this.employeesSubject.value) {
      counts[emp.department] = (counts[emp.department] || 0) + 1;
    }
    this.departmentService.recalculateHeadcounts(counts);
  }

  public getEmployees(filter?: EmployeeFilter): Observable<{ data: Employee[]; total: number; page: number; pageSize: number }> {
    let list = [...this.employeesSubject.value];

    if (filter) {
      if (filter.search) {
        const query = filter.search.toLowerCase().trim();
        list = list.filter(e =>
          e.fullName.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query) ||
          e.employeeId.toLowerCase().includes(query) ||
          e.designation.toLowerCase().includes(query)
        );
      }

      if (filter.department && filter.department !== 'ALL') {
        list = list.filter(e => e.department.toLowerCase() === filter.department!.toLowerCase());
      }

      if (filter.status && filter.status !== 'ALL') {
        list = list.filter(e => e.status.toUpperCase() === filter.status!.toUpperCase());
      }

      if (filter.employmentType && filter.employmentType !== 'ALL') {
        list = list.filter(e => e.employmentType.toUpperCase() === filter.employmentType!.toUpperCase());
      }

      if (filter.sortBy) {
        const field = filter.sortBy;
        const dir = filter.sortOrder === 'desc' ? -1 : 1;
        list.sort((a, b) => {
          let valA = (a as any)[field] || '';
          let valB = (b as any)[field] || '';
          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();
          return valA > valB ? dir : valA < valB ? -dir : 0;
        });
      }
    }

    const total = list.length;
    const page = filter?.page || 1;
    const pageSize = filter?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paged = list.slice(start, start + pageSize);

    return of({ data: paged, total, page, pageSize }).pipe(delay(120));
  }

  public getAllEmployees(): Observable<Employee[]> {
    return of(this.employeesSubject.value).pipe(delay(80));
  }

  public getEmployeeById(id: string): Observable<Employee | undefined> {
    const emp = this.employeesSubject.value.find(e => e.id === id || e.employeeId === id);
    return of(emp).pipe(delay(80));
  }

  public getEmployeeByEmail(email: string): Observable<Employee | undefined> {
    const emp = this.employeesSubject.value.find(e => e.email.toLowerCase() === email.toLowerCase());
    return of(emp).pipe(delay(80));
  }

  public addEmployee(payload: Omit<Employee, 'id' | 'employeeId' | 'fullName'> & { employeeId?: string }): Observable<Employee> {
    const count = this.employeesSubject.value.length + 1001;
    const generatedId = payload.employeeId || `EMP-${count}`;
    const newEmp: Employee = {
      ...payload,
      id: 'emp-' + Math.random().toString(36).substring(2, 9),
      employeeId: generatedId,
      fullName: `${payload.firstName} ${payload.lastName}`.trim(),
      avatar: payload.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.firstName + '+' + payload.lastName)}&background=2563EB&color=fff&size=150`
    };

    const updated = [newEmp, ...this.employeesSubject.value];
    this.employeesSubject.next(updated);
    this.persist(updated);
    return of(newEmp).pipe(delay(200));
  }

  public updateEmployee(id: string, updates: Partial<Employee>): Observable<Employee> {
    const current = this.employeesSubject.value;
    const idx = current.findIndex(e => e.id === id || e.employeeId === id);
    if (idx === -1) {
      return throwError(() => new Error('Employee not found'));
    }

    let fullName = current[idx].fullName;
    if (updates.firstName || updates.lastName) {
      const fn = updates.firstName ?? current[idx].firstName;
      const ln = updates.lastName ?? current[idx].lastName;
      fullName = `${fn} ${ln}`.trim();
    }

    const updatedEmp: Employee = {
      ...current[idx],
      ...updates,
      fullName
    };

    const updatedList = [...current];
    updatedList[idx] = updatedEmp;
    this.employeesSubject.next(updatedList);
    this.persist(updatedList);
    return of(updatedEmp).pipe(delay(200));
  }

  public deleteEmployee(id: string): Observable<boolean> {
    const current = this.employeesSubject.value;
    const filtered = current.filter(e => e.id !== id && e.employeeId !== id);
    if (filtered.length === current.length) {
      return throwError(() => new Error('Employee not found'));
    }
    this.employeesSubject.next(filtered);
    this.persist(filtered);
    return of(true).pipe(delay(200));
  }

  public getDashboardStats(): Observable<{
    totalEmployees: number;
    activeEmployees: number;
    newJoinersThisMonth: number;
    totalDepartments: number;
    departmentBreakdown: { department: string; count: number; percentage: number; color?: string }[];
    statusBreakdown: { status: string; label: string; count: number; color: string }[];
    recentEmployees: Employee[];
  }> {
    const list = this.employeesSubject.value;
    const total = list.length;
    const active = list.filter(e => e.status === 'ACTIVE').length;
    const newJoiners = list.filter(e => {
      const year = new Date(e.joiningDate).getFullYear();
      return year >= 2024;
    }).length;

    // Dept breakdown
    const deptMap: Record<string, number> = {};
    for (const e of list) {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    }

    const deptColors: Record<string, string> = {
      'Engineering': '#2563EB',
      'Product & Design': '#0D9488',
      'Marketing': '#D97706',
      'Human Resources': '#7C3AED',
      'Finance & Operations': '#059669',
      'Sales & Partnerships': '#EA580C'
    };

    const departmentBreakdown = Object.keys(deptMap).map(dept => ({
      department: dept,
      count: deptMap[dept],
      percentage: total > 0 ? Math.round((deptMap[dept] / total) * 100) : 0,
      color: deptColors[dept] || '#3B82F6'
    })).sort((a, b) => b.count - a.count);

    const statusBreakdown = [
      { status: 'ACTIVE', label: 'Active', count: list.filter(e => e.status === 'ACTIVE').length, color: '#059669' },
      { status: 'ONBOARDING', label: 'Onboarding', count: list.filter(e => e.status === 'ONBOARDING').length, color: '#2563EB' },
      { status: 'ON_LEAVE', label: 'On Leave', count: list.filter(e => e.status === 'ON_LEAVE').length, color: '#D97706' },
      { status: 'INACTIVE', label: 'Inactive', count: list.filter(e => e.status === 'INACTIVE').length, color: '#DC2626' }
    ];

    const recentEmployees = [...list]
      .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
      .slice(0, 5);

    return of({
      totalEmployees: total,
      activeEmployees: active,
      newJoinersThisMonth: newJoiners,
      totalDepartments: Object.keys(deptMap).length,
      departmentBreakdown,
      statusBreakdown,
      recentEmployees
    }).pipe(delay(150));
  }
}

