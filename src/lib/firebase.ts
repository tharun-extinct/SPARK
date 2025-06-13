import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
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
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

export { app, auth, db };

// Helper authentication functions
export const createAccount = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  return firebaseSignOut(auth);
};

// Observer for auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User data functions
export const createUserProfile = async (userId: string, userData: any) => {
  await setDoc(doc(db, "users", userId), {
    ...userData,
    createdAt: new Date().toISOString(),
    onboardingCompleted: true, // Setting this to true to skip onboarding
  });
};

export const getUserOnboardingStatus = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().onboardingCompleted || false;
    }
    return false;
  } catch (error) {
    console.error("Error getting user onboarding status:", error);
    return false;
  }
};

export const updateUserOnboardingStatus = async (userId: string, completed: boolean) => {
  await setDoc(doc(db, "users", userId), { onboardingCompleted: completed }, { merge: true });
};
