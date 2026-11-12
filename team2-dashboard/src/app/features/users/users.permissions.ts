import { UserRole } from '../../core/models/user.model';

export function canViewUsers(role: UserRole | null | undefined): boolean {
  return role === 'ADMIN' || role === 'HR';
}

export function canAddOrEditUsers(role: UserRole | null | undefined): boolean {
  return role === 'ADMIN' || role === 'HR';
}

export function canDeleteUsers(role: UserRole | null | undefined): boolean {
  return role === 'ADMIN';
}
