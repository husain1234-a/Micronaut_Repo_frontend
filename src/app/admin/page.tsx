'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  userId: string;
}

interface Notification {
  id: string;
  message: string;
  userId: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTab, setSelectedTab] = useState('users');

  useEffect(() => {
    fetchUsers();
    fetchAddresses();
    fetchNotifications();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const sendNotification = async (userId: string, message: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId, message })
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">User Management</h2>
              <div className="grid gap-4">
                {users.map((user) => (
                  <div key={user.id} className="border p-4 rounded-lg">
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">Role: {user.role}</p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => sendNotification(user.id, 'New system update available!')}
                    >
                      Send Notification
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Address Management</h2>
              <div className="grid gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border p-4 rounded-lg">
                    <p className="font-medium">{address.street}</p>
                    <p className="text-gray-600">
                      {address.city}, {address.state}, {address.country}
                    </p>
                    <p className="text-sm text-gray-500">User ID: {address.userId}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
              <div className="grid gap-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border p-4 rounded-lg">
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      Sent to User ID: {notification.userId}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
} 