import { initializeApp, getApps } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

// TODO: Replace with your own Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyDbDNEzFvnxNC_W874kbQGOcMfh0KYLCJU",
    authDomain: "micronaut-4d0bb.firebaseapp.com",
    projectId: "micronaut-4d0bb",
    storageBucket: "micronaut-4d0bb.firebasestorage.app",
    messagingSenderId: "608704731618",
    appId: "1:608704731618:web:11359e866eaf5f833b81bb"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Only get messaging on the client
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null; 