import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { SummaryStripComponent } from './components/summary-strip/summary-strip.component';
import { DepartmentListComponent } from './components/department-list/department-list.component';
import { ActivityTimelineComponent } from './components/activity-timeline/activity-timeline.component';

@NgModule({
  declarations: [
    DashboardHomeComponent,
    SummaryStripComponent,
    DepartmentListComponent,
    ActivityTimelineComponent
  ],
  imports: [
    SharedModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule {}
