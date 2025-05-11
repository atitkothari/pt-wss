import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  const apps = getApps();
  
  if (!apps.length) {
    // Check if all required environment variables are present
    //if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    //  throw new Error('Missing required Firebase Admin environment variables');
    //}

    // Use environment variables for service account credentials
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID??'',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL??'',
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
    };

    // console.log('Private Key:', process.env);

    try {
      const app = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
      
      console.log('Firebase Admin initialized successfully');
      return app;
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      throw error;
    }
  }

  // Return the first app if it exists
  return apps[0];
}

const app = initializeFirebaseAdmin();
const adminDb = getFirestore(app);
const adminAuth = getAuth(app);

export { adminDb, adminAuth }; 