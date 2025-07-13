"use client"

import { useState, useEffect, useCallback } from "react"
import { useAppContext } from "@/app/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { notificationService } from "../../../src/services/notifications"
import { BroadcastNotificationDialog } from '../../../components/notifications/broadcast-notification-dialog'

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  createdAt: string
  read: boolean
}

export default function NotificationsPage() {
  const { state } = useAppContext()
  const { toast } = useToast()
  
  // State management
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [page, setPage] = useState(0) // 0-based
  const [size, setSize] = useState(2) // notifications per page
  const [totalPages, setTotalPages] = useState(1)
  const [totalNotifications, setTotalNotifications] = useState(0)

  // Debug: Log user state
  useEffect(() => {
    console.log('User state:', state.user)
    console.log('User ID:', state.user?.id)
  }, [state.user])

  const sortNotifications = (notifications: Notification[]) => {
    const unread = notifications.filter(n => !n.read).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const read = notifications.filter(n => n.read).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return [...unread, ...read]
  }

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchNotifications = useCallback(async (pageNum: number = 0, pageSize: number = 2) => {
    if (!state.user?.id) {
      console.warn('User ID not available, skipping fetch')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log(`Fetching notifications for user ${state.user.id}, page ${pageNum}, size ${pageSize}`)
      
      const data = await notificationService.getNotifications(state.user.id, pageNum, pageSize)
      console.log(  'Fetched notifications:', data);
      setNotifications(sortNotifications(data.content || []))
      setTotalPages(data.totalPages || 1)
      setTotalNotifications(data.totalElements || (data.content ? data.content.length : 0))
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [state.user?.id, toast])

  // Remove polling/interval effect
  // Only fetch notifications on mount and when page/size changes
  useEffect(() => {
    if (!state.user?.id) {
      console.log('User not available yet')
      return
    }
    fetchNotifications(page, size)
  }, [state.user?.id, page, size])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => sortNotifications(prev.map(n => n.id === notificationId ? { ...n, read: true } : n)))
      toast({
        title: "Success",
        description: "Notification marked as read"
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      
      // Update local state
      setNotifications(prev => {
        const filtered = prev.filter(n => n.id !== notificationId)
        
        // If we deleted the last item on current page and we're not on page 0
        if (filtered.length === 0 && page > 0) {
          setPage(page - 1)
        }
        
        return filtered
      })
      
      // Update total count
      setTotalNotifications(prev => prev - 1)
      
      toast({
        title: "Success", 
        description: "Notification deleted"
      })
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      })
    }
  }

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
      setPage(page + 1)
    
  }

  const getBadgeColor = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "bg-blue-500"
      case "success":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Show loading state if user is not loaded yet
  if (!state.user) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Loading user information...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {state.user?.role !== 'ADMIN' && (
        <h2 className="text-2xl font-bold mb-6 text-white dark:text-white">Welcome, {state.user?.firstName ? `${state.user.firstName} ${state.user.lastName}` : "User"}!</h2>
      )}
      {state.user?.role === 'ADMIN' && (
        <div className="flex justify-end mb-4">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
            onClick={() => setBroadcastOpen(true)}
          >
            Send Broadcast
          </Button>
          <BroadcastNotificationDialog open={broadcastOpen} onOpenChange={setBroadcastOpen} />
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Bell className="h-6 w-6" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No notifications yet</p>
          ) : (
            <>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.read ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"
                    }`}
                  >
                    <div>
                      <h3 className="font-medium dark:text-white">{notification.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-300 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getBadgeColor(notification.type)} text-white`}
                      >
                        {notification.type}
                      </Badge>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls with proper bounds checking */}
              
                <div className="flex justify-center items-center gap-4 py-4">
                  <Button 
                    onClick={handlePreviousPage}
                   
                    variant={page === 0 ? "ghost" : "default"}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page + 1} ({totalNotifications} total notifications)
                  </span>
                  <Button 
                    onClick={handleNextPage}
                    
                    variant={page >= totalPages - 1 ? "ghost" : "default"}
                  >
                    Next
                  </Button>
                </div>
              
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}