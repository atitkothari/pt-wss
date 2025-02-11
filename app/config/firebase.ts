'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDlJzlnCIvwM0Gi8AJ59Ii_2gML-3iAd_I",
  authDomain: "wheel-strategy-screener.firebaseapp.com",
  projectId: "wheel-strategy-screener",
  storageBucket: "wheel-strategy-screener.firebasestorage.app",
  messagingSenderId: "818091342209",
  appId: "1:818091342209:web:164a04fc6d5553c5b19080",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth }; 