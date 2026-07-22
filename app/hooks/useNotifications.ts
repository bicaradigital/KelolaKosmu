"use client"

import { useState, useEffect, useCallback } from "react"
import { type Notification } from "@/app/lib/storage"
import { notificationSystem } from "@/app/lib/notificationSystem"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Initialize notifications on mount
  useEffect(() => {
    setNotifications(notificationSystem.getNotifications())
    setUnreadCount(notificationSystem.getUnreadCount())

    // Listen for notification events
    const handleNotificationAdded = (event: Event) => {
      const customEvent = event as CustomEvent<Notification>
      setNotifications((prev) => [customEvent.detail, ...prev])
      setUnreadCount((prev) => prev + 1)
    }

    const handleNotificationRead = (event: Event) => {
      const customEvent = event as CustomEvent<Notification>
      setNotifications((prev) =>
        prev.map((n) => (n.id === customEvent.detail.id ? customEvent.detail : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    const handleAllNotificationsRead = () => {
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
        }))
      )
      setUnreadCount(0)
    }

    window.addEventListener("notificationAdded", handleNotificationAdded)
    window.addEventListener("notificationRead", handleNotificationRead)
    window.addEventListener("allNotificationsRead", handleAllNotificationsRead)

    return () => {
      window.removeEventListener("notificationAdded", handleNotificationAdded)
      window.removeEventListener("notificationRead", handleNotificationRead)
      window.removeEventListener("allNotificationsRead", handleAllNotificationsRead)
    }
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    notificationSystem.markAsRead(notificationId)
  }, [])

  const markAllAsRead = useCallback(() => {
    notificationSystem.markAllAsRead()
  }, [])

  const deleteNotification = useCallback((notificationId: string) => {
    notificationSystem.deleteNotification(notificationId)
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }, [])

  const clearAll = useCallback(() => {
    notificationSystem.clearAll()
    setNotifications([])
  }, [])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  }
}
