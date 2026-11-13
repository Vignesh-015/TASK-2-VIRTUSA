import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  template: `
    <div class="card stat-card" [class.is-loading]="isLoading">
      <div class="stat-card__header">
        <span class="stat-card__title">{{ title }}</span>
        <div class="stat-card__icon" [ngClass]="iconClass">
          <ng-content select="[icon]"></ng-content>
        </div>
      </div>
      <div class="stat-card__body">
        <span class="stat-card__value">{{ value }}</span>
        <div class="stat-card__meta" *ngIf="trendText || subtitle">
          <span *ngIf="trendText" class="stat-card__trend" [ngClass]="trendPositive ? 'trend-up' : 'trend-neutral'">
            <svg *ngIf="trendPositive" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            {{ trendText }}
          </span>
          <span class="stat-card__subtitle" *ngIf="subtitle">{{ subtitle }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s ease;
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);

      &:hover {
        box-shadow: var(--shadow-md);
        border-color: #CBD5E1;
      }
    }
    .stat-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .stat-card__title {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .stat-card__icon {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-primary-blue-light);
      color: var(--color-primary-blue);

      &.icon-teal {
        background-color: #ECFDF5;
        color: #059669;
      }
      &.icon-amber {
        background-color: #FFFBEB;
        color: #D97706;
      }
      &.icon-purple {
        background-color: #F5F3FF;
        color: #7C3AED;
      }
    }
    .stat-card__body {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .stat-card__value {
      font-family: var(--font-heading);
      font-size: 28px;
      font-weight: 700;
      color: var(--color-text-heading);
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .stat-card__meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      margin-top: 4px;
    }
    .stat-card__trend {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 4px;

      &.trend-up {
        background-color: #ECFDF5;
        color: #059669;
      }
      &.trend-neutral {
        background-color: #F1F5F9;
        color: #475569;
      }
    }
    .stat-card__subtitle {
      color: var(--color-text-muted);
    }
  `]
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() subtitle?: string;
  @Input() trendText?: string;
  @Input() trendPositive: boolean = true;
  @Input() iconClass: string = '';
  @Input() isLoading: boolean = false;
}

