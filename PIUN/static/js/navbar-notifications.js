/**
 * Navbar Notification Bell Handler
 * Manages notification count badge and dropdown for the main navigation bar
 */

class NavbarNotificationBell {
    constructor() {
        this.checkInterval = 30000; // Check every 30 seconds
        this.countBadge = document.getElementById('notification-count');
        this.notificationList = document.getElementById('notification-list');
        this.noNotifications = document.getElementById('no-notifications');
        this.notificationDropdown = document.getElementById('notificationDropdown');
        this.bellIcon = this.notificationDropdown ? this.notificationDropdown.querySelector('i.bi-bell-fill') : null;
        
        if (!this.countBadge || !this.notificationList) {
            console.warn('Notification bell elements not found');
            return;
        }
        
        this.init();
    }

    async init() {
        // Initial count update
        await this.updateNotificationCount();
        
        // Auto-refresh count periodically
        setInterval(() => this.updateNotificationCount(), this.checkInterval);
        
        // Load notifications when dropdown is opened
        if (this.notificationDropdown) {
            this.notificationDropdown.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadNotifications();
            });
        }
        
        console.log('Navbar notification bell initialized');
    }

    async updateNotificationCount() {
        try {
            const response = await fetch('/Issues_Actions_monitoring/api/notifications/');
            if (!response.ok) return;
            
            const data = await response.json();
            const count = data.notifications.length;
            
            if (count > 0) {
                // Show badge
                this.countBadge.textContent = count > 99 ? '99+' : count;
                this.countBadge.style.display = 'inline-block';
                
                // Make bell icon RED
                if (this.bellIcon) {
                    this.bellIcon.style.color = '#dc3545'; // Bootstrap red
                    this.bellIcon.classList.add('notification-active');
                }
            } else {
                // Hide badge
                this.countBadge.style.display = 'none';
                
                // Reset bell icon to white
                if (this.bellIcon) {
                    this.bellIcon.style.color = 'white';
                    this.bellIcon.classList.remove('notification-active');
                }
            }
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    }

    async loadNotifications() {
        try {
            const response = await fetch('/Issues_Actions_monitoring/api/notifications/');
            if (!response.ok) return;
            
            const data = await response.json();
            const notifications = data.notifications;
            
            // Clear previous notifications
            const existingNotifs = this.notificationList.querySelectorAll('.notification-item');
            existingNotifs.forEach(item => item.remove());
            
            if (notifications.length === 0) {
                this.noNotifications.style.display = 'block';
            } else {
                this.noNotifications.style.display = 'none';
                
                // Add new notifications
                notifications.forEach(notif => {
                    const notifElement = this.createNotificationElement(notif);
                    this.notificationList.insertBefore(notifElement, this.noNotifications);
                });
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    createNotificationElement(notif) {
        const li = document.createElement('li');
        const div = document.createElement('div');
        div.className = 'notification-item dropdown-item-text border-bottom';
        div.style.cssText = 'padding: 12px 16px; cursor: pointer; transition: background 0.2s;';
        
        const priorityColors = {
            'critical': '#dc3545',
            'high': '#fd7e14',
            'medium': '#ffc107',
            'low': '#28a745',
            'none': '#6c757d'
        };
        
        const priorityColor = priorityColors[notif.priority] || '#6c757d';
        
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-1">
                <strong style="color: ${priorityColor}; font-size: 0.9rem;">
                    <i class="bi bi-exclamation-circle"></i> ${this.escapeHtml(notif.issue_code)}
                </strong>
                <small class="text-muted">${this.formatDate(notif.created_at)}</small>
            </div>
            <p class="mb-1" style="font-size: 0.85rem; color: #495057;">${this.escapeHtml(notif.message)}</p>
            <div class="d-flex justify-content-between align-items-center">
                <span class="badge" style="background: ${priorityColor}; font-size: 0.7rem;">${this.escapeHtml(notif.priority).toUpperCase()}</span>
                <span class="text-primary" style="font-size: 0.75rem;">
                    View Issue <i class="bi bi-arrow-right"></i>
                </span>
            </div>
        `;
        
        div.addEventListener('mouseenter', () => {
            div.style.background = '#f8f9fa';
        });
        
        div.addEventListener('mouseleave', () => {
            div.style.background = 'white';
        });
        
        div.addEventListener('click', async (e) => {
            e.stopPropagation();
            // Mark as read
            await this.markAsRead(notif.id);
            // Navigate to issue
            window.location.href = `/Issues_Actions_monitoring/issues/${notif.issue_id}/`;
        });
        
        li.appendChild(div);
        return li;
    }

    async markAsRead(notificationId) {
        try {
            const csrftoken = this.getCookie('csrftoken');
            await fetch(`/Issues_Actions_monitoring/api/notifications/${notificationId}/read/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json'
                }
            });
            // Update count after marking as read
            await this.updateNotificationCount();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NavbarNotificationBell();
});
