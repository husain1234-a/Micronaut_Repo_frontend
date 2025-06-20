"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/app/providers"
import { Users, MapPin, Bell, Settings, LogOut, Home } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Cookies from 'js-cookie'
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useAppContext()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    console.log('🚪 Starting logout process...');
    
    // Clear cookies and localStorage
    console.log('🗑️ Clearing cookies and localStorage...');
    Cookies.remove('token')
    localStorage.removeItem('user')
    console.log('✅ Cookies and localStorage cleared');
    
    // Clear app context
    console.log('🔄 Clearing application context...');
    dispatch({ type: "SET_USER", payload: null })
    console.log('✅ Application context cleared');
    
    // Show success message
    console.log('💬 Showing logout success message...');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    })
    
    // Redirect to login page
    console.log('🚀 Redirecting to login page...');
    router.push("/auth/login")
    console.log('✅ Logout process completed');
  }

  // Get user's full name
  const userFullName = state.user?.firstName && state.user?.lastName 
    ? `${state.user.firstName} ${state.user.lastName}`
    : state.user?.email || 'User';

  // Define navigation items based on user role
  const navigation = state.user?.role === 'ADMIN' 
    ? [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Users", href: "/dashboard/users", icon: Users },
        // { name: "Addresses", href: "/dashboard/addresses", icon: MapPin },
        { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
        { name: "Password Requests", href: "/dashboard/password-requests", icon: Users },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "My Profile", href: "/dashboard/profile", icon: Users },
        { name: "My Notifications", href: "/dashboard/notifications", icon: Bell },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">User Management</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      item.href === "/dashboard" && "text-primary font-semibold"
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-4">
                Welcome, {userFullName}
              </span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
