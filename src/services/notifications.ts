import { api } from "../utils/api"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  createdAt: string
  read: boolean
}
interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  // ...other fields if needed
}
export const notificationService = {
  async getNotifications(userId: string, page = 0, size = 2) {
    try {
      // Add pagination params
      return await api<PaginatedResponse<Notification>>(
        `/notifications/user/${userId}?page=${page}&size=${size}`
      )
    } catch (error) {
      console.error("Error fetching notifications:", error)
      throw error
    }
  },

  async markAsRead(notificationId: string) {
    try {
      return await api<void>(`/notifications/${notificationId}/read`, {
        method: "PATCH"
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