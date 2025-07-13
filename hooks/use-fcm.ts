import { useEffect } from 'react';
import { messaging } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { api } from '../lib/api'; // Adjust path if needed

// TODO: Replace with your own VAPID key from Firebase Console
const VAPID_KEY = 'BFmFiVeMDrO6Di_ssLZ0voUGDDwbnavKSk8GxqYljfMOn9rm4GO9texbQFMmCV1rjqYP1taO9N1WnknMCjy_wZ8';

export function useFcmRegistration(user: { isAuthenticated: boolean }) {
  useEffect(() => {
    if (!user.isAuthenticated) {
      console.log('User not authenticated, skipping FCM registration');
      return;
    }

    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service worker registered:', registration);
        return getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
      })
      .then((token) => {
        console.log('FCM token:', token);
        if (token) {
          api('http://localhost:8081/api/fcm/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
            requiresAuth: true,
          })
          .then((res) => {
            console.log('FCM registration API response:', res);
          })
          .catch((err) => {
            console.error('FCM registration API error:', err);
          });
        } else {
          console.warn('No FCM token generated');
        }
      })
      .catch((err) => {
        console.error('FCM registration failed:', err);
      });
  }, [user.isAuthenticated]);

  // Foreground notification handler
  useEffect(() => {
    if (!user.isAuthenticated) return;
    const unsubscribe = onMessage(messaging, (payload) => {
      // You can show a toast or custom UI here
      alert(`Push notification: ${payload.notification?.title}\n${payload.notification?.body}`);
    });
    return () => unsubscribe();
  }, [user.isAuthenticated]);
} 