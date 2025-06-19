import { api } from "../utils/api"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  createdAt: string
  read: boolean
}

export const notificationService = {
  async getNotifications() {
    try {
      return await api<Notification[]>("/notifications")
    } catch (error) {
      console.error("Error fetching notifications:", error)
      throw error
    }
  },

  async markAsRead(notificationId: string) {
    try {
      return await api<Notification>(`/notifications/${notificationId}/read`, {
        method: "PUT"
      })
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error)
      throw error
    }
  },

  async deleteNotification(notificationId: string) {
    try {
      return await api<void>(`/notifications/${notificationId}`, {
        method: "DELETE"
      })
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error)
      throw error
    }
  }
} 