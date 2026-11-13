import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const elapsedMs = now.getTime() - date.getTime();

    // In case of clock skew or future date
    if (elapsedMs < 0) {
      return 'Just now';
    }

    const timeStr = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      const minutes = Math.floor(elapsedMs / (1000 * 60));
      if (minutes < 1) {
        return 'Just now';
      }
      if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    if (isYesterday) {
      return `Yesterday, ${timeStr}`;
    }

    const day = date.getDate();
    const month = date.toLocaleDateString([], { month: 'short' });
    return `${day} ${month}, ${timeStr}`;
  }
}
