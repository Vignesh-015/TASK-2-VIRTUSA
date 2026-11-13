import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return mock stats in mock mode', (done) => {
    service.getStats().subscribe((stats) => {
      expect(stats.totalUsers).toBe(128);
      expect(stats.activeUsers).toBe(112);
      expect(stats.inactiveUsers).toBe(16);
      expect(stats.departments).toBe(8);
      expect(stats.onLeave).toBe(6);
      done();
    });
  });

  it('should return mock departments in mock mode', (done) => {
    service.getDepartmentCounts().subscribe((departments) => {
      expect(departments.length).toBeGreaterThan(0);
      const engineering = departments.find(d => d.department === 'Engineering');
      expect(engineering).toBeDefined();
      expect(engineering?.count).toBe(34);
      done();
    });
  });

  it('should return mock activity items in mock mode', (done) => {
    service.getRecentActivity().subscribe((activities) => {
      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0].actor).toBeDefined();
      expect(activities[0].message).toBeDefined();
      expect(activities[0].type).toBeDefined();
      done();
    });
  });
});
