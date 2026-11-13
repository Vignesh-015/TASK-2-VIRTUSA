import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  template: `
    <div class="avatar-wrapper" [ngClass]="['avatar-' + size]">
      <img *ngIf="src && !hasError; else fallback"
           [src]="src"
           [alt]="name"
           (error)="onError()"
           class="avatar-img" />
      <ng-template #fallback>
        <div class="avatar-initials" [style.backgroundColor]="bgColor">
          {{ initials }}
        </div>
      </ng-template>
      <span *ngIf="showStatus" class="avatar-indicator" [ngClass]="['status-' + (status || 'online')]"></span>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      vertical-align: middle;
    }
    .avatar-wrapper {
      position: relative;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      display: block;
    }
    .avatar-initials {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #FFFFFF;
      text-transform: uppercase;
      user-select: none;
    }
    /* Sizes */
    .avatar-xs {
      width: 24px;
      height: 24px;
      font-size: 10px;
    }
    .avatar-sm {
      width: 32px;
      height: 32px;
      font-size: 12px;
    }
    .avatar-md {
      width: 40px;
      height: 40px;
      font-size: 14px;
    }
    .avatar-lg {
      width: 52px;
      height: 52px;
      font-size: 18px;
    }
    .avatar-xl {
      width: 80px;
      height: 80px;
      font-size: 26px;
    }
    .avatar-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 26%;
      height: 26%;
      min-width: 8px;
      min-height: 8px;
      border-radius: 50%;
      border: 2px solid #FFFFFF;
    }
    .status-online, .status-ACTIVE { background-color: #10B981; }
    .status-ONBOARDING { background-color: #3B82F6; }
    .status-ON_LEAVE { background-color: #F59E0B; }
    .status-INACTIVE { background-color: #94A3B8; }
  `]
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() name: string = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showStatus: boolean = false;
  @Input() status?: string;

  public hasError: boolean = false;

  private colors = [
    '#2563EB', '#7C3AED', '#0D9488', '#059669', '#D97706',
    '#DC2626', '#4F46E5', '#0284C7', '#E11D48', '#475569'
  ];

  public onError(): void {
    this.hasError = true;
  }

  public get initials(): string {
    if (!this.name) return '?';
    const parts = this.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  public get bgColor(): string {
    if (!this.name) return '#2563EB';
    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % this.colors.length;
    return this.colors[idx];
  }
}

