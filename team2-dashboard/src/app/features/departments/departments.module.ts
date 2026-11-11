import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DepartmentsRoutingModule } from './departments-routing.module';
import { DepartmentListComponent } from './department-list/department-list.component';

@NgModule({
  declarations: [
    DepartmentListComponent
  ],
  imports: [
    SharedModule,
    DepartmentsRoutingModule
  ]
})
export class DepartmentsModule {}

