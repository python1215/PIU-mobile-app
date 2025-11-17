/**
 * Issue Notification System
 * Handles popup notifications for assigned issues with priority-based reminders
 */

class IssueNotificationSystem {
    constructor() {
        this.notificationCheckInterval = 30000; // Check every 30 seconds
        this.reminderCheckInterval = 60000; // Check reminders every minute
        this.initialized = false;
        this.lastNotificationCheck = 0;
        this.lastReminderCheck = 0;
    }

    async init() {
        if (this.initialized) return;
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
        }
        
        this.initialized = true;
        
        // Start checking for notifications and reminders
        this.startNotificationChecks();
        
        console.log('Issue Notification System initialized');
    }

    startNotificationChecks() {
        // Check immediately on init
        this.checkPendingNotifications();
        this.checkPendingReminders();
        
        // Set up periodic checks
        setInterval(() => {
            this.checkPendingNotifications();
        }, this.notificationCheckInterval);
        
        setInterval(() => {
            this.checkPendingReminders();
        }, this.reminderCheckInterval);
    }

    async checkPendingNotifications() {
        try {
            const response = await fetch('/Issues_Actions_monitoring/api/notifications/');
            if (!response.ok) return;
            
            const data = await response.json();
            const notifications = data.notifications || [];
            
            notifications.forEach(notif => {
                this.showBrowserNotification(notif);
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    async checkPendingReminders() {
        try {
            const response = await fetch('/Issues_Actions_monitoring/api/reminders/');
            if (!response.ok) return;
            
            const data = await response.json();
            const reminders = data.reminders || [];
            
            reminders.forEach(reminder => {
                this.showReminderNotification(reminder);
            });
        } catch (error) {
            console.error('Error fetching reminders:', error);
        }
    }

    showBrowserNotification(notif) {
        // Create popup notification HTML
        const notificationHtml = this.createNotificationPopup(notif);
        
        // Also show browser notification if supported and permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            const browserNotif = new Notification('Issue Assigned: ' + notif.issue_code, {
                body: notif.message,
                icon: '/static/images/notification-icon.png', // Add icon if available
                tag: 'issue-' + notif.issue_code,
                requireInteraction: false
            });
            
            browserNotif.onclick = () => {
                window.focus();
                window.location.href = '/Issues_Actions_monitoring/issues/' + notif.issue_id + '/';
                browserNotif.close();
            };
            
            // Auto-close after 10 seconds
            setTimeout(() => browserNotif.close(), 10000);
        }
        
        // Mark as read after showing
        this.markNotificationAsRead(notif.id);
    }

    showReminderNotification(reminder) {
        // Create reminder popup HTML
        const reminderHtml = this.createReminderPopup(reminder);
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            let urgencyLevel = 'Reminder';
            if (reminder.priority === 'critical') {
                urgencyLevel = '🔴 URGENT';
            } else if (reminder.priority === 'high') {
                urgencyLevel = '🟠 High Priority';
            }
            
            const title = `${urgencyLevel}: ${reminder.issue_code}`;
            let body = reminder.description;
            if (reminder.days_until_due !== null) {
                if (reminder.days_until_due < 0) {
                    body += `\n⚠️ OVERDUE by ${Math.abs(reminder.days_until_due)} days!`;
                } else if (reminder.days_until_due === 0) {
                    body += '\n⏰ Due TODAY!';
                } else {
                    body += `\n📅 Due in ${reminder.days_until_due} days`;
                }
            }
            
            const browserNotif = new Notification(title, {
                body: body,
                icon: '/static/images/reminder-icon.png',
                tag: 'reminder-' + reminder.issue_code,
                requireInteraction: reminder.priority === 'critical' || reminder.priority === 'high'
            });
            
            browserNotif.onclick = () => {
                window.focus();
                window.location.href = '/Issues_Actions_monitoring/issues/' + reminder.issue_id + '/';
                browserNotif.close();
            };
            
            // Auto-close after time based on priority
            const autoCloseTime = reminder.priority === 'critical' ? 20000 : 10000;
            setTimeout(() => browserNotif.close(), autoCloseTime);
        }
    }

    createNotificationPopup(notif) {
        const popup = document.createElement('div');
        popup.className = 'issue-notification-popup';
        popup.innerHTML = `
            <div class="notification-header">
                <strong>🔔 New Assignment</strong>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-body">
                <div class="notification-issue-code">${notif.issue_code}</div>
                <div class="notification-message">${notif.message}</div>
                <div class="notification-actions">
                    <a href="/Issues_Actions_monitoring/issues/${notif.issue_id}/" class="btn btn-sm btn-primary">View Issue</a>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Auto-remove after 10 seconds
        setTimeout(() => popup.remove(), 10000);
        
        return popup;
    }

    createReminderPopup(reminder) {
        const priorityColors = {
            'critical': '#dc3545',
            'high': '#fd7e14',
            'medium': '#0dcaf0',
            'low': '#198754'
        };
        
        const popup = document.createElement('div');
        popup.className = 'issue-notification-popup reminder-popup';
        popup.style.borderLeft = `5px solid ${priorityColors[reminder.priority] || '#6c757d'}`;
        
        let dueMessage = '';
        if (reminder.days_until_due !== null) {
            if (reminder.days_until_due < 0) {
                dueMessage = `<span class="text-danger">⚠️ OVERDUE by ${Math.abs(reminder.days_until_due)} days!</span>`;
            } else if (reminder.days_until_due === 0) {
                dueMessage = '<span class="text-warning">⏰ Due TODAY!</span>';
            } else {
                dueMessage = `📅 Due in ${reminder.days_until_due} days`;
            }
        }
        
        popup.innerHTML = `
            <div class="notification-header">
                <strong>⏰ Issue Reminder (${reminder.priority_label})</strong>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-body">
                <div class="notification-issue-code">${reminder.issue_code}</div>
                <div class="notification-message">${reminder.description}</div>
                <div class="notification-due">${dueMessage}</div>
                <div class="notification-info">
                    <small>You'll receive ${reminder.notifications_per_day} reminder(s) per day for this issue</small>
                </div>
                <div class="notification-actions">
                    <a href="/Issues_Actions_monitoring/issues/${reminder.issue_id}/" class="btn btn-sm btn-primary">View Issue</a>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Auto-remove based on priority
        const autoRemoveTime = reminder.priority === 'critical' ? 20000 : 12000;
        setTimeout(() => popup.remove(), autoRemoveTime);
        
        return popup;
    }

    async markNotificationAsRead(notificationId) {
        try {
            const csrftoken = this.getCookie('csrftoken');
            await fetch(`/Issues_Actions_monitoring/api/notifications/${notificationId}/read/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}

// Initialize notification system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const notificationSystem = new IssueNotificationSystem();
    notificationSystem.init();
});
