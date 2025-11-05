class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;

  async init(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission === 'granted';
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration || !this.vapidPublicKey) {
      console.warn('Service worker or VAPID key not available');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('Push subscription created:', subscription);
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
        console.log('Unsubscribed from push notifications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) return null;
    
    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return null;
    }
  }

  async isSubscribed(): Promise<boolean> {
    const subscription = await this.getSubscription();
    return subscription !== null;
  }

  // Local notifications for immediate feedback
  async showLocalNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!await this.requestPermission()) {
      console.warn('Notification permission denied');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      ...options
    };

    if (this.registration) {
      // Use service worker notification for better control
      await this.registration.showNotification(title, defaultOptions);
    } else {
      // Fallback to browser notification
      new Notification(title, defaultOptions);
    }
  }

  // Schedule local reminder (using setTimeout, not persistent across app restarts)
  scheduleLocalReminder(title: string, body: string, delay: number): number {
    return window.setTimeout(() => {
      this.showLocalNotification(title, { body });
    }, delay);
  }

  clearLocalReminder(timerId: number): void {
    clearTimeout(timerId);
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      await fetch('http://localhost:8080/api/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      await fetch('http://localhost:8080/api/v1/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  // Predefined notification types for ChoreMe
  async notifyChoreAssigned(choreName: string): Promise<void> {
    await this.showLocalNotification('New Chore Assigned! 📋', {
      body: `You've been assigned: ${choreName}`,
      tag: 'chore-assigned',
      requireInteraction: false
    });
  }

  async notifyChoreReminder(choreName: string, dueTime: string): Promise<void> {
    await this.showLocalNotification('Chore Reminder ⏰', {
      body: `"${choreName}" is due ${dueTime}`,
      tag: 'chore-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'complete',
          title: 'Mark Complete'
        },
        {
          action: 'snooze',
          title: 'Remind Later'
        }
      ]
    });
  }

  async notifyRewardApproved(rewardName: string): Promise<void> {
    await this.showLocalNotification('Reward Approved! 🎉', {
      body: `Your "${rewardName}" reward has been approved!`,
      tag: 'reward-approved'
    });
  }

  async notifyEarningsUpdate(amount: string): Promise<void> {
    await this.showLocalNotification('Money Earned! 💰', {
      body: `You earned ${amount} for completing a chore!`,
      tag: 'earnings-update'
    });
  }

  // Setup notification preferences based on user settings
  async setupNotificationPreferences(preferences: {
    choreReminders: boolean;
    rewardUpdates: boolean;
    earningsUpdates: boolean;
    reminderTime: number; // hours before due date
  }): Promise<void> {
    if (preferences.choreReminders) {
      // This would typically involve server-side scheduling
      console.log(`Setting up chore reminders ${preferences.reminderTime} hours before due date`);
    }
    
    // Store preferences locally for immediate notifications
    localStorage.setItem('notification_preferences', JSON.stringify(preferences));
  }

  getNotificationPreferences(): any {
    const stored = localStorage.getItem('notification_preferences');
    return stored ? JSON.parse(stored) : {
      choreReminders: true,
      rewardUpdates: true,
      earningsUpdates: true,
      reminderTime: 2 // 2 hours before due date
    };
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Initialize service when loaded
notificationService.init();

export default notificationService;