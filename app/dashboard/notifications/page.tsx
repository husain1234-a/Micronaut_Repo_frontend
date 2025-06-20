"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/app/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { notificationService } from "../../../src/services/notifications"

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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (state.user?.id) {
      fetchNotifications()
    }
  }, [state.user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationService.getNotifications(state.user.id)
      setNotifications(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      toast({
        title: "Success",
        description: "Notification marked as read"
      })
    } catch (error) {
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
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      )
      toast({
        title: "Success",
        description: "Notification deleted"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      })
    }
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

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500">No notifications yet</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
