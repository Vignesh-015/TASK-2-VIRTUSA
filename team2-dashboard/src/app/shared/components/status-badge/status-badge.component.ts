import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `
    <span class="badge" [ngClass]="badgeClass">
      <span *ngIf="showDot" class="badge-dot"></span>
      {{ displayText }}
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';
  @Input() type: 'status' | 'role' | 'employmentType' = 'status';
  @Input() showDot: boolean = true;

  public get badgeClass(): string {
    const val = (this.status || '').toUpperCase();

    if (this.type === 'role') {
      switch (val) {
        case 'ADMIN': return 'badge-primary';
        case 'HR': return 'badge-info';
        case 'EMPLOYEE': return 'badge-neutral';
        default: return 'badge-neutral';
      }
    }

    if (this.type === 'employmentType') {
      switch (val) {
        case 'FULL_TIME': return 'badge-primary';
        case 'CONTRACT': return 'badge-warning';
        case 'PART_TIME': return 'badge-info';
        case 'INTERN': return 'badge-neutral';
        default: return 'badge-neutral';
      }
    }

    // Default status
    switch (val) {
      case 'ACTIVE': return 'badge-success';
      case 'ONBOARDING': return 'badge-info';
      case 'ON_LEAVE': return 'badge-warning';
      case 'INACTIVE': return 'badge-danger';
      default: return 'badge-neutral';
    }
  }

  public get displayText(): string {
    const val = (this.status || '').toUpperCase();

    if (this.type === 'role') {
      switch (val) {
        case 'ADMIN': return 'Administrator';
        case 'HR': return 'HR Specialist';
        case 'EMPLOYEE': return 'Employee';
        default: return this.status;
      }
    }

    if (this.type === 'employmentType') {
      switch (val) {
        case 'FULL_TIME': return 'Full-time';
        case 'CONTRACT': return 'Contract';
        case 'PART_TIME': return 'Part-time';
        case 'INTERN': return 'Intern';
        default: return this.status;
      }
    }

    switch (val) {
      case 'ACTIVE': return 'Active';
      case 'ONBOARDING': return 'Onboarding';
      case 'ON_LEAVE': return 'On Leave';
      case 'INACTIVE': return 'Inactive';
      default: return this.status;
    }
  }
}

