import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { AvatarComponent } from './components/avatar/avatar.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ModalComponent } from './components/modal/modal.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

const COMPONENTS = [
  AvatarComponent,
  StatusBadgeComponent,
  StatCardComponent,
  PaginationComponent,
  ModalComponent,
  ToastContainerComponent,
  TimeAgoPipe
];

@NgModule({
  declarations: [
    ...COMPONENTS
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ...COMPONENTS
  ]
})
export class SharedModule {}
