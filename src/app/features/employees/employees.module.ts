import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeeListComponent } from './employee-list/employee-list.component';

@NgModule({
  declarations: [
    EmployeeListComponent
  ],
  imports: [
    SharedModule,
    EmployeesRoutingModule
  ]
})
export class EmployeesModule {}

