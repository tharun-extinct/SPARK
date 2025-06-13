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

// Firebase configuration - directly from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyDHEmp3HyOf7cLKMLIHAttw9e8Pb6vtxZM",
  authDomain: "spark-17a.firebaseapp.com",
  projectId: "spark-17a",
  storageBucket: "spark-17a.appspot.com",
  messagingSenderId: "394900024165",
  appId: "1:394900024165:web:e06d38e3a7edb90262cf8c",
  measurementId: "G-Y4BEJK6J1Q"
};


// Initialize Firebase with simplified approach
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
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error("Error creating account:", error.code, error.message);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error("Error signing in:", error.code, error.message);
    throw error;
  }
};

export const signOut = async () => {
  try {
    return await firebaseSignOut(auth);
  } catch (error: any) {
    console.error("Error signing out:", error.code, error.message);
    throw error;
  }
};

// Observer for auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User data functions
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    await setDoc(doc(db, "users", userId), {
      ...userData,
      createdAt: new Date().toISOString(),
      onboardingCompleted: true, // Setting this to true to skip onboarding
    });
  } catch (error: any) {
    console.error("Error creating user profile:", error.code, error.message);
    throw error;
  }
};

export const getUserOnboardingStatus = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().onboardingCompleted || false;
    }
    return false;
  } catch (error: any) {
    console.error("Error getting user onboarding status:", error.code, error.message);
    return false;
  }
};

export const updateUserOnboardingStatus = async (userId: string, completed: boolean) => {
  try {
    await setDoc(doc(db, "users", userId), { onboardingCompleted: completed }, { merge: true });
  } catch (error: any) {
    console.error("Error updating onboarding status:", error.code, error.message);
    throw error;
  }
};
