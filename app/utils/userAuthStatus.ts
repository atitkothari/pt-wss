/**
 * Utility functions to get user authentication status for analytics tracking
 * This provides a centralized way to determine if a user is signed in
 * and get their user ID across different contexts (React components, utilities, etc.)
 */

export interface UserAuthStatus {
  isSignedIn: boolean;
  userId: string | null;
  email?: string | null;
}

/**
 * Get user authentication status from Firebase auth state
 * This is the primary method for getting auth status
 */
export const getFirebaseAuthStatus = (): UserAuthStatus => {
  if (typeof window === 'undefined') {
    return { isSignedIn: false, userId: null, email: null };
  }

  try {
    // Try to get the Firebase auth instance from the window object
    const firebase = (window as any).firebase;
    if (firebase?.auth) {
      const auth = firebase.auth();
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        return {
          isSignedIn: true,
          userId: currentUser.uid,
          email: currentUser.email
        };
      }
    }
  } catch (error) {
    console.debug('Could not access Firebase auth directly:', error);
  }

  return { isSignedIn: false, userId: null, email: null };
};

/**
 * Get user authentication status from localStorage (fallback method)
 * This checks for stored Firebase auth data
 */
export const getStoredAuthStatus = (): UserAuthStatus => {
  if (typeof window === 'undefined') {
    return { isSignedIn: false, userId: null, email: null };
  }

  try {
    // Check for Firebase auth user data in localStorage
    const userData = localStorage.getItem('firebase:authUser:AIzaSyBmGmeot5jiM_Mn9-sqPo9xPlBBCDgoTgc:[DEFAULT]');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed?.uid) {
        return {
          isSignedIn: true,
          userId: parsed.uid,
          email: parsed.email || null
        };
      }
    }
  } catch (error) {
    console.debug('Could not parse stored user data:', error);
  }

  return { isSignedIn: false, userId: null, email: null };
};

/**
 * Get user authentication status using the best available method
 * This combines Firebase auth state with localStorage fallback
 */
export const getUserAuthStatus = (): UserAuthStatus => {
  // First try Firebase auth state
  const firebaseStatus = getFirebaseAuthStatus();
  if (firebaseStatus.isSignedIn) {
    return firebaseStatus;
  }

  // Fallback to stored auth data
  return getStoredAuthStatus();
};

/**
 * Get user authentication status for analytics tracking
 * Returns a simplified object with just the essential fields for analytics
 */
export const getAnalyticsAuthStatus = () => {
  const status = getUserAuthStatus();
  return {
    user_signed_in: status.isSignedIn,
    ...(status.isSignedIn && status.userId ? { user_id: status.userId } : {}),
    ...(status.email ? { user_email: status.email } : {})
  };
};

/**
 * Check if user is currently signed in
 */
export const isUserSignedIn = (): boolean => {
  return getUserAuthStatus().isSignedIn;
};

/**
 * Get current user ID if signed in
 */
export const getCurrentUserId = (): string | null => {
  return getUserAuthStatus().userId;
};
