'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDlJzlnCIvwM0Gi8AJ59Ii_2gML-3iAd_I",
  authDomain: "wheel-strategy-screener.firebaseapp.com",
  projectId: "wheel-strategy-screener",
  storageBucket: "wheel-strategy-screener.firebasestorage.app",
  messagingSenderId: "818091342209",
  appId: "1:818091342209:web:164a04fc6d5553c5b19080",
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { app, auth }; 