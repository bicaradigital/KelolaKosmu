import { type Notification, type Payment, type Tenant, generateId } from "./storage"

export class NotificationSystem {
  private storageKey = "kelola_kos_notifications"

  // Get all notifications
  getNotifications(): Notification[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(this.storageKey)
    return data ? JSON.parse(data) : []
  }

  // Get unread count
  getUnreadCount(): number {
    return this.getNotifications().filter((n) => !n.read).length
  }

  // Create payment reminder notification (when approaching due date)
  createPaymentReminderNotification(payment: Payment, tenant: Tenant, daysUntilDue: number): Notification {
    const message =
      daysUntilDue <= 0
        ? `Pembayaran kamar ${tenant.name} telah melewati jatuh tempo`
        : `Pembayaran kamar ${tenant.name} akan jatuh tempo dalam ${daysUntilDue} hari`

    return {
      id: generateId(),
      type: daysUntilDue <= 0 ? "payment_overdue" : "payment_due",
      title: daysUntilDue <= 0 ? "Pembayaran Terlambat" : "Pengingat Pembayaran",
      message,
      paymentId: payment.id,
      tenantId: tenant.id,
      read: false,
      action: {
        label: "Lihat Pembayaran",
        actionType: "view_payment",
        targetId: payment.id,
      },
      createdAt: new Date().toISOString(),
    }
  }

  // Create payment received notification
  createPaymentReceivedNotification(payment: Payment, tenant: Tenant, amount: number): Notification {
    return {
      id: generateId(),
      type: "payment_received",
      title: "Pembayaran Diterima",
      message: `Pembayaran sebesar Rp ${amount.toLocaleString("id-ID")} dari ${tenant.name} telah diterima`,
      paymentId: payment.id,
      tenantId: tenant.id,
      read: false,
      action: {
        label: "Lihat Detail",
        actionType: "view_payment",
        targetId: payment.id,
      },
      createdAt: new Date().toISOString(),
    }
  }

  // Add notification
  addNotification(notification: Notification): void {
    if (typeof window === "undefined") return
    const notifications = this.getNotifications()
    
    // Prevent duplicate notifications for the same payment
    const isDuplicate = notifications.some(
      (n) => n.paymentId === notification.paymentId && 
             n.type === notification.type &&
             new Date(n.createdAt).getTime() > Date.now() - 60000 // Within last minute
    )
    
    if (!isDuplicate) {
      notifications.unshift(notification)
      // Keep only last 50 notifications
      if (notifications.length > 50) {
        notifications.pop()
      }
      localStorage.setItem(this.storageKey, JSON.stringify(notifications))
      
      // Trigger custom event for real-time updates
      window.dispatchEvent(new CustomEvent("notificationAdded", { detail: notification }))
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    if (typeof window === "undefined") return
    const notifications = this.getNotifications()
    const notification = notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
      notification.readAt = new Date().toISOString()
      localStorage.setItem(this.storageKey, JSON.stringify(notifications))
      window.dispatchEvent(new CustomEvent("notificationRead", { detail: notification }))
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    if (typeof window === "undefined") return
    const notifications = this.getNotifications()
    notifications.forEach((n) => {
      if (!n.read) {
        n.read = true
        n.readAt = new Date().toISOString()
      }
    })
    localStorage.setItem(this.storageKey, JSON.stringify(notifications))
    window.dispatchEvent(new CustomEvent("allNotificationsRead"))
  }

  // Delete notification
  deleteNotification(notificationId: string): void {
    if (typeof window === "undefined") return
    const notifications = this.getNotifications().filter((n) => n.id !== notificationId)
    localStorage.setItem(this.storageKey, JSON.stringify(notifications))
  }

  // Clear all notifications
  clearAll(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.storageKey)
  }

  // Check for upcoming due dates and create notifications
  checkUpcomingDueDates(payments: Payment[], tenants: Tenant[], reminderDays: number = 3): Notification[] {
    const newNotifications: Notification[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    payments.forEach((payment) => {
      if (payment.status !== "pending") return

      const dueDate = new Date(payment.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Create notification if within reminder days or overdue
      if (daysUntilDue <= reminderDays) {
        const tenant = tenants.find((t) => t.id === payment.tenantId)
        if (tenant) {
          const notification = this.createPaymentReminderNotification(payment, tenant, daysUntilDue)
          newNotifications.push(notification)
        }
      }
    })

    return newNotifications
  }

  // Get notifications by type
  getNotificationsByType(type: Notification["type"]): Notification[] {
    return this.getNotifications().filter((n) => n.type === type)
  }

  // Get notifications for a specific payment
  getPaymentNotifications(paymentId: string): Notification[] {
    return this.getNotifications().filter((n) => n.paymentId === paymentId)
  }
}

// Export singleton instance
export const notificationSystem = new NotificationSystem()
