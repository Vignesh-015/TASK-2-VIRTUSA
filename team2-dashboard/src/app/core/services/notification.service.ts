import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppNotification, ToastMessage } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$: Observable<ToastMessage[]> = this.toastsSubject.asObservable();

  private initialNotifications: AppNotification[] = [
    {
      id: 'notif-1',
      title: 'New Employee Onboarding',
      message: 'Sarah Jenkins has submitted onboarding documents for Engineering.',
      time: '10 minutes ago',
      type: 'INFO',
      read: false,
      link: '/employees'
    },
    {
      id: 'notif-2',
      title: 'Department Head Updated',
      message: 'Marcus Chen has been assigned as Head of Product & Design.',
      time: '1 hour ago',
      type: 'SUCCESS',
      read: false,
      link: '/departments'
    },
    {
      id: 'notif-3',
      title: 'Quarterly Review Reminder',
      message: 'Q4 Performance Review cycle ends next Friday.',
      time: 'Yesterday',
      type: 'WARNING',
      read: false
    },
    {
      id: 'notif-4',
      title: 'System Maintenance Notice',
      message: 'Scheduled portal backup completed successfully.',
      time: '2 days ago',
      type: 'INFO',
      read: true
    }
  ];

  private notificationsSubject = new BehaviorSubject<AppNotification[]>(this.initialNotifications);
  public notifications$: Observable<AppNotification[]> = this.notificationsSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('employeehub_notifications');
    if (saved) {
      try {
        this.notificationsSubject.next(JSON.parse(saved));
      } catch {
        // use default
      }
    }
  }

  public showToast(type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string, duration: number = 4000): void {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, message, title, duration };
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
  }

  public success(message: string, title: string = 'Success'): void {
    this.showToast('success', message, title);
  }

  public error(message: string, title: string = 'Error'): void {
    this.showToast('error', message, title);
  }

  public warning(message: string, title: string = 'Warning'): void {
    this.showToast('warning', message, title);
  }

  public info(message: string, title: string = 'Information'): void {
    this.showToast('info', message, title);
  }

  public removeToast(id: string): void {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter(t => t.id !== id));
  }

  public get unreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  public markAsRead(id: string): void {
    const updated = this.notificationsSubject.value.map(n => n.id === id ? { ...n, read: true } : n);
    this.notificationsSubject.next(updated);
    this.saveNotifications(updated);
  }

  public markAllAsRead(): void {
    const updated = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
    this.saveNotifications(updated);
  }

  private saveNotifications(notifications: AppNotification[]): void {
    localStorage.setItem('employeehub_notifications', JSON.stringify(notifications));
  }
}

