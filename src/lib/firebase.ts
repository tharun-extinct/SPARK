import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, setPersistence, browserLocalPersistence, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Replace these with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to LOCAL by default for persistent sessions
setPersistence(auth, browserLocalPersistence);

export { app, auth, db };

// Helper authentication functions
export const createAccount = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

// Observer for auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User data related functions
export const updateUserOnboardingStatus = async (userId: string, completed: boolean = true) => {
  try {
    await setDoc(doc(db, "users", userId), {
      onboardingCompleted: completed,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating onboarding status:", error);
    return false;
  }
};

export const getUserOnboardingStatus = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.onboardingCompleted || false;
    }
    return false;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return false;
  }
};
