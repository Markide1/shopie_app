import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  template: `
    <div
      [ngClass]="{
        'bg-green-600': notification?.type === 'success',
        'bg-red-600': notification?.type === 'error'
      }"
      class="fixed top-6 right-6 px-6 py-3 rounded shadow-lg text-white z-50 transition-all"
    >
      {{ notification?.message }}
    </div>
  `,
  imports: [NgClass],
})
export class NotificationComponent {
  notification: Notification | null = null;
  private timeout: any;

  constructor(private notificationService: NotificationService) {
    this.notificationService.notification$.subscribe((notif) => {
      this.notification = notif;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => (this.notification = null), 3000);
    });
  }
}