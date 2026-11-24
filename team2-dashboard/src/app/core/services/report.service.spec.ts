import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReportService } from './report.service';
import { environment } from '../../../environments/environment';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportService]
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
    service.useMock = false;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch department report from API', () => {
    const mockDepts = [
      { department: 'Engineering', headcount: 9, percentage: 40.9 },
      { department: 'Support', headcount: 4, percentage: 18.2 }
    ];

    service.getDepartmentReport().subscribe(data => {
      expect(data).toEqual(mockDepts);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reports/departments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDepts);
  });

  it('should attach startDate and endDate query params when provided', () => {
    service.getSummary({ startDate: '2026-11-01', endDate: '2026-11-30' }).subscribe();

    const req = httpMock.expectOne(
      r => r.url === `${environment.apiUrl}/reports/summary` &&
           r.params.get('startDate') === '2026-11-01' &&
           r.params.get('endDate') === '2026-11-30'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ totalEmployees: 6, activeEmployees: 5, inactiveEmployees: 1, joinedInRange: 6 });
  });

  it('should return mock data when useMock is true', (done) => {
    service.useMock = true;
    service.getStatusReport().subscribe(data => {
      expect(data.length).toBe(4);
      expect(data[0].status).toBe('ACTIVE');
      done();
    });
  });
});

