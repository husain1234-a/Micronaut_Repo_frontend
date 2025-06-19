"use client"

import { useEffect, useState } from "react"
import { useAppContext } from "@/app/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MapPin, Bell, Settings } from "lucide-react"
import { userService } from "../../src/services/user"
import { notificationService } from "../../src/services/notifications"

interface DashboardStats {
  totalUsers: number
  totalAddresses: number
  unreadNotifications: number
}

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  createdAt: string
  read: boolean
}

export default function DashboardPage() {
  const { state } = useAppContext()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAddresses: 0,
    unreadNotifications: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (state.user?.role === "ADMIN") {
      fetchDashboardStats()
    } else {
      setLoading(false)
    }
  }, [state.user])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      // Fetch users count
      const users = await userService.getUsers()
      
      // Fetch notifications
      const notifications = await notificationService.getNotifications()
      const unreadCount = notifications.filter((n: Notification) => !n.read).length

      setStats({
        totalUsers: users.length,
        totalAddresses: 0, // TODO: Implement address service
        unreadNotifications: unreadCount
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  if (state.user?.role !== "ADMIN") {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {state.user?.email || "User"}!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                We're glad to have you here. This is your personal dashboard where you can manage your profile and stay updated with notifications.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                    <Settings className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Update your profile information</li>
                      <li>• Check your notifications</li>
                      <li>• Manage your settings</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                    <Bell className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Your recent activities and updates will appear here.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500">
              Active users in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
            <MapPin className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAddresses}</div>
            <p className="text-xs text-gray-500">
              Registered addresses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <Bell className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadNotifications}</div>
            <p className="text-xs text-gray-500">
              Pending notifications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Settings className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Active</div>
            <p className="text-xs text-gray-500">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
