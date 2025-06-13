import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  connectFirestoreEmulator,
  enableIndexedDbPersistence
} from 'firebase/firestore';

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
// Enable offline persistence for Firestore
const db = getFirestore(app);

// Enable Firestore persistence - only needs to be called once
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab
      console.warn('Firestore persistence not enabled: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // Current browser doesn't support persistence
      console.warn('Firestore persistence not supported in this browser');
    }
  });

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
  console.log('Setting up auth state observer');
  return onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user ? `User ${user.uid} logged in` : 'No user');
    callback(user);
  });
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
    console.time('getUserOnboardingStatus');
    const userDoc = await getDoc(doc(db, "users", userId));
    
    // If the user doc doesn't exist, create it with onboarding completed = true
    // This prevents the dashboard from getting stuck if there's no user profile
    if (!userDoc.exists()) {
      console.log('Creating missing user profile for', userId);
      await createUserProfile(userId, {
        createdAt: new Date().toISOString(),
        onboardingCompleted: true,
      });
      console.timeEnd('getUserOnboardingStatus');
      return true;
    }
    
    const status = userDoc.data().onboardingCompleted || false;
    console.timeEnd('getUserOnboardingStatus');
    return status;
  } catch (error: any) {
    console.error("Error getting user onboarding status:", error.code, error.message);
    // Default to completed on error to prevent blocking
    return true;
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

// Google Authentication
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
      // Google doesn't directly expose isNewUser in the type, but we can check if the user already exists
    const userExists = await getDoc(doc(db, "users", result.user.uid));
    const isNewUser = !userExists.exists();
    
    // If it's a new user, create a profile
    if (isNewUser && result.user) {
      await createUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        onboardingCompleted: true, // Skip onboarding
      });
    }
    
    return result;
  } catch (error: any) {
    console.error("Error signing in with Google:", error.code, error.message);
    throw error;
  }
};
