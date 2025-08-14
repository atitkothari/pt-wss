import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const checkUserMarketingConsent = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    return userData.marketingConsent === true;
  } catch (error) {
    console.error('Error checking marketing consent:', error);
    return false;
  }
};

export const hasUserGivenMarketingConsent = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    return userData.marketingConsent !== undefined;
  } catch (error) {
    console.error('Error checking if user has given marketing consent:', error);
    return false;
  }
};
