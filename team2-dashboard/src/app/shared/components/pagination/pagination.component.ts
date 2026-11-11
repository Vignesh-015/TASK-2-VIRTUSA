import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    <div class="pagination-bar" *ngIf="total > 0">
      <div class="pagination-info">
        Showing <strong>{{ startIndex }}</strong> to <strong>{{ endIndex }}</strong> of <strong>{{ total }}</strong> records
      </div>

      <div class="pagination-nav" *ngIf="totalPages > 1">
        <button class="btn btn-sm btn-secondary"
                [disabled]="page <= 1"
                (click)="setPage(page - 1)"
                aria-label="Previous Page">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Previous
        </button>

        <div class="page-numbers">
          <button *ngFor="let p of pages"
                  class="page-number-btn"
                  [class.active]="p === page"
                  (click)="setPage(p)">
            {{ p }}
          </button>
        </div>

        <button class="btn btn-sm btn-secondary"
                [disabled]="page >= totalPages"
                (click)="setPage(page + 1)"
                aria-label="Next Page">
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding: 12px 16px;
      background: #FFFFFF;
      border-top: 1px solid var(--color-border);
      border-bottom-left-radius: var(--radius-md);
      border-bottom-right-radius: var(--radius-md);
    }
    .pagination-info {
      font-size: 13px;
      color: var(--color-text-muted);

      strong {
        color: var(--color-text-main);
      }
    }
    .pagination-nav {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .page-numbers {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .page-number-btn {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-body);
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.15s;

      &:hover:not(.active) {
        background-color: var(--color-surface-muted);
        color: var(--color-text-main);
      }

      &.active {
        background-color: var(--color-primary-blue);
        color: #FFFFFF;
        font-weight: 600;
      }
    }
  `]
})
export class PaginationComponent {
  @Input() total: number = 0;
  @Input() page: number = 1;
  @Input() pageSize: number = 10;
  @Output() pageChange = new EventEmitter<number>();

  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  public get startIndex(): number {
    if (this.total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  public get endIndex(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  public get pages(): number[] {
    const total = this.totalPages;
    const current = this.page;
    const result: number[] = [];

    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  }

  public setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages && p !== this.page) {
      this.pageChange.emit(p);
    }
  }
}

