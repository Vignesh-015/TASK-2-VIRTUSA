import { Component } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastMessage } from '../../../core/models/notification.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-viewport" aria-live="polite">
      <div *ngFor="let toast of toasts$ | async" class="toast-item" [ngClass]="'toast-' + toast.type">
        <div class="toast-icon">
          <!-- Success Icon -->
          <svg *ngIf="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <!-- Error Icon -->
          <svg *ngIf="toast.type === 'error'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <!-- Warning Icon -->
          <svg *ngIf="toast.type === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <!-- Info Icon -->
          <svg *ngIf="toast.type === 'info'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>

        <div class="toast-content">
          <div class="toast-title" *ngIf="toast.title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>

        <button type="button" class="toast-dismiss" (click)="dismiss(toast.id)" aria-label="Dismiss toast">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-viewport {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 420px;
      pointer-events: none;
    }
    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: var(--radius-md);
      background: #FFFFFF;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--color-border);
      animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.2s ease;

      &.toast-success {
        border-left: 4px solid #059669;
        .toast-icon { color: #059669; }
      }
      &.toast-error {
        border-left: 4px solid #DC2626;
        .toast-icon { color: #DC2626; }
      }
      &.toast-warning {
        border-left: 4px solid #D97706;
        .toast-icon { color: #D97706; }
      }
      &.toast-info {
        border-left: 4px solid #2563EB;
        .toast-icon { color: #2563EB; }
      }
    }
    .toast-icon {
      flex-shrink: 0;
      margin-top: 1px;
    }
    .toast-content {
      flex: 1;
    }
    .toast-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-heading);
      margin-bottom: 2px;
    }
    .toast-message {
      font-size: 13px;
      color: var(--color-text-body);
      line-height: 1.4;
    }
    .toast-dismiss {
      background: transparent;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 2px;
      margin-left: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-xs);

      &:hover {
        color: var(--color-text-main);
        background-color: var(--color-surface-muted);
      }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastContainerComponent {
  public toasts$: Observable<ToastMessage[]> = this.notificationService.toasts$;

  constructor(private notificationService: NotificationService) {}

  public dismiss(id: string): void {
    this.notificationService.removeToast(id);
  }
}

