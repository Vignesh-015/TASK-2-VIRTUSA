import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { USER_DEPARTMENTS, User, UserNotice } from '../models/user.model';
import { UserService } from '../services/user.service';
import { canAddOrEditUsers, canDeleteUsers, canViewUsers } from '../users.permissions';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  public readonly departments = USER_DEPARTMENTS;
  public readonly pageSize = 8;

  public users: User[] = [];
  public filteredUsers: User[] = [];
  public pagedUsers: User[] = [];

  public searchTerm: string = '';
  public selectedDepartment: string = 'ALL';
  public selectedRole: string = 'ALL';
  public selectedStatus: string = 'ALL';

  public currentPage: number = 1;
  public isLoading: boolean = true;

  public notice: UserNotice | null = null;
  private noticeTimer: ReturnType<typeof setTimeout> | null = null;

  public userToDelete: User | null = null;
  public isDeleteDialogOpen: boolean = false;
  public isDeleting: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  public get canView(): boolean {
    return canViewUsers(this.authService.currentRole);
  }

  public get canAddOrEdit(): boolean {
    return canAddOrEditUsers(this.authService.currentRole);
  }

  public get canDelete(): boolean {
    return canDeleteUsers(this.authService.currentRole);
  }

  public get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim() !== '' ||
      this.selectedDepartment !== 'ALL' ||
      this.selectedRole !== 'ALL' ||
      this.selectedStatus !== 'ALL'
    );
  }

  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  public get startItem(): number {
    if (this.filteredUsers.length === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  public get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredUsers.length);
  }

  public get deleteMessage(): string {
    const name = this.userToDelete ? this.userToDelete.fullName : 'this user';
    return `Are you sure you want to delete ${name}? This cannot be undone.`;
  }

  ngOnInit(): void {
    // replace with route guard in guards task
    if (!this.canView) {
      this.router.navigate(['/forbidden']);
      return;
    }

    const pendingNotice = this.userService.consumeNotice();
    if (pendingNotice) {
      this.showNotice(pendingNotice.message, pendingNotice.type);
    }
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.clearNoticeTimer();
  }

  public loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (list) => {
        this.users = list;
        this.applyFilters(false);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showNotice('Unable to load users. Please try again.', 'error');
      }
    });
  }

  public onFilterChange(): void {
    this.applyFilters(true);
  }

  public clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = 'ALL';
    this.selectedRole = 'ALL';
    this.selectedStatus = 'ALL';
    this.applyFilters(true);
  }

  public goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedUsers();
    }
  }

  public goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedUsers();
    }
  }

  public openDeleteDialog(user: User): void {
    if (!this.canDelete) {
      return;
    }
    this.userToDelete = user;
    this.isDeleteDialogOpen = true;
  }

  public closeDeleteDialog(): void {
    this.isDeleteDialogOpen = false;
    this.userToDelete = null;
  }

  public confirmDelete(): void {
    if (!this.userToDelete || this.isDeleting) {
      return;
    }

    const deletedName = this.userToDelete.fullName;
    const deletedId = this.userToDelete.id;
    this.isDeleting = true;

    this.userService.deleteUser(deletedId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteDialog();
        this.showNotice(`User "${deletedName}" has been deleted.`, 'success');
        this.loadUsers();
      },
      error: () => {
        this.isDeleting = false;
        this.closeDeleteDialog();
        this.showNotice('Could not delete user. Please try again.', 'error');
      }
    });
  }

  public dismissNotice(): void {
    this.clearNoticeTimer();
    this.notice = null;
  }

  private applyFilters(resetPage: boolean): void {
    const query = this.searchTerm.trim().toLowerCase();

    this.filteredUsers = this.users.filter(user => {
      const matchesQuery =
        !query ||
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      const matchesDept =
        this.selectedDepartment === 'ALL' || user.department === this.selectedDepartment;

      const matchesRole =
        this.selectedRole === 'ALL' || user.role === this.selectedRole;

      const matchesStatus =
        this.selectedStatus === 'ALL' || user.status === this.selectedStatus;

      return matchesQuery && matchesDept && matchesRole && matchesStatus;
    });

    if (resetPage) {
      this.currentPage = 1;
    } else if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.updatePagedUsers();
  }

  private updatePagedUsers(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(start, start + this.pageSize);
  }

  private showNotice(message: string, type: 'success' | 'error'): void {
    this.clearNoticeTimer();
    this.notice = { message, type };
    this.noticeTimer = setTimeout(() => {
      this.notice = null;
      this.noticeTimer = null;
    }, 3000);
  }

  private clearNoticeTimer(): void {
    if (this.noticeTimer) {
      clearTimeout(this.noticeTimer);
      this.noticeTimer = null;
    }
  }
}

