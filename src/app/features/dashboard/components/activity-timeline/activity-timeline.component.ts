import { Component, Input } from '@angular/core';
import { ActivityItem } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-activity-timeline',
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.scss']
})
export class ActivityTimelineComponent {
  @Input() activities: ActivityItem[] | null = null;
  @Input() isLoading = false;
}
