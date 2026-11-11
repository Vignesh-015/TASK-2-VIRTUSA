import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { TimeAgoPipe } from './pipes/time-ago.pipe';

/*
 * SharedModule re-exports CommonModule, RouterModule, ReactiveFormsModule,
 * and custom shared pipes so feature modules can use them out of the box.
 */
@NgModule({
  declarations: [
    TimeAgoPipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TimeAgoPipe
  ]
})
export class SharedModule {}
