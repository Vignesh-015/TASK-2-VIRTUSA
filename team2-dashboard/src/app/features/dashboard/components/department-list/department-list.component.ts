import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DepartmentCount } from '../../../../core/models/dashboard.model';

interface DepartmentDisplayItem {
  department: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnChanges {
  @Input() departments: DepartmentCount[] | null = null;
  @Input() isLoading = false;

  displayItems: DepartmentDisplayItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['departments']) {
      this.computeDisplayItems();
    }
  }

  private computeDisplayItems(): void {
    if (!this.departments || this.departments.length === 0) {
      this.displayItems = [];
      return;
    }

    const sorted = [...this.departments].sort((a, b) => b.count - a.count);
    const maxCount = Math.max(...sorted.map(d => d.count), 1);

    this.displayItems = sorted.map(d => ({
      department: d.department,
      count: d.count,
      percentage: Math.round((d.count / maxCount) * 100)
    }));
  }
}
