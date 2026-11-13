import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="modal-dialog" [ngClass]="'modal-' + size" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title-wrapper">
            <h3 class="modal-title">{{ title }}</h3>
            <p class="modal-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
          </div>
          <button type="button" class="btn-close" (click)="close()" aria-label="Close dialog">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <ng-content select="[body]"></ng-content>
          <ng-content></ng-content>
        </div>

        <div class="modal-footer" *ngIf="showFooter">
          <ng-content select="[footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 16px;
      animation: fadeIn 0.15s ease-out;
    }
    .modal-dialog {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
      border: 1px solid var(--color-border);
    }
    .modal-sm { max-width: 440px; }
    .modal-md { max-width: 600px; }
    .modal-lg { max-width: 780px; }
    .modal-xl { max-width: 960px; }

    .modal-header {
      padding: 18px 24px;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-heading);
      margin: 0;
    }
    .modal-subtitle {
      font-size: 13px;
      color: var(--color-text-muted);
      margin-top: 2px;
    }
    .btn-close {
      background: transparent;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;

      &:hover {
        background-color: var(--color-surface-muted);
        color: var(--color-text-main);
      }
    }
    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border);
      background-color: #F8FAFC;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showFooter: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  @Output() closeDialog = new EventEmitter<void>();

  public close(): void {
    this.closeDialog.emit();
  }

  public onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }
}

