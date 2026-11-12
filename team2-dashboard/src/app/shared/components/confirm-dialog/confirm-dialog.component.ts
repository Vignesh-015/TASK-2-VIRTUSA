import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirm';
  @Input() message: string = '';
  @Input() confirmLabel: string = 'Confirm';
  @Input() cancelLabel: string = 'Cancel';
  @Input() isDanger: boolean = true;
  @Input() isLoading: boolean = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  public onEscapeKey(): void {
    if (this.isOpen && !this.isLoading) {
      this.onCancel();
    }
  }

  public onBackdropClick(): void {
    if (!this.isLoading) {
      this.onCancel();
    }
  }

  public onCancel(): void {
    this.cancelled.emit();
  }

  public onConfirm(): void {
    if (!this.isLoading) {
      this.confirmed.emit();
    }
  }
}

