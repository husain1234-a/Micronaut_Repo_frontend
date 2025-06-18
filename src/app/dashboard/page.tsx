'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
}

interface Notification {
  id: string;
  message: string;
  createdAt: string;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [address, setAddress] = useState<Address | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTab, setSelectedTab] = useState('profile');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      fetchAddress();
      fetchNotifications();
    }
  }, [user]);

  const fetchAddress = async () => {
    try {
      const response = await fetch(`/api/addresses/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAddress(data);
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/user/${user?.id}`, {
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

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: newPassword })
      });
      alert('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password');
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Name</p>
                  <p className="text-gray-600">{user?.name}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
                {address && (
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600">
                      {address.street}, {address.city}, {address.state}, {address.country}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button onClick={updatePassword}>Update Password</Button>
                </div>
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