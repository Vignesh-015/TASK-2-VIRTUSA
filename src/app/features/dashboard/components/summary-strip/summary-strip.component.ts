import { Component, Input } from '@angular/core';
import { DashboardStats } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-summary-strip',
  templateUrl: './summary-strip.component.html',
  styleUrls: ['./summary-strip.component.scss']
})
export class SummaryStripComponent {
  @Input() stats: DashboardStats | null = null;
  @Input() isLoading = false;

  get activeRatio(): string {
    if (!this.stats || this.stats.totalUsers === 0) {
      return '0.0%';
    }
    const ratio = (this.stats.activeUsers / this.stats.totalUsers) * 100;
    return `${ratio.toFixed(1)}% of staff`;
  }

  get inactiveRatio(): string {
    if (!this.stats || this.stats.totalUsers === 0) {
      return '0.0%';
    }
    const ratio = (this.stats.inactiveUsers / this.stats.totalUsers) * 100;
    return `${ratio.toFixed(1)}% of staff`;
  }
}
