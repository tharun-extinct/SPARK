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
  enableIndexedDbPersistence,
  collection,
  getDocs,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
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


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use more reliable Firestore initialization with explicit cache settings
// We use persistentLocalCache for better offline support
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

// Set auth persistence to LOCAL by default for persistent sessions
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

// We don't need to manually call enableIndexedDbPersistence when using initializeFirestore with persistentLocalCache
// This avoids potential conflicts and duplicate initialization errors
console.log("Firestore initialized with persistent local cache");

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
    // Create a reference to the user document
    const userDocRef = doc(db, "users", userId);
    
    // Check if the document already exists
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Only create if it doesn't exist already
      const userDataWithDefaults = {
        ...userData,
        createdAt: new Date().toISOString(),
        onboardingCompleted: false, // Setting this to false to show onboarding
        lastUpdated: new Date().toISOString()
      };
      
      await setDoc(userDocRef, userDataWithDefaults);
      console.log("User profile created successfully");
    } else {
      console.log("User profile already exists, not creating a new one");
    }
    
    return true;
  } catch (error: any) {
    console.error("Error creating user profile:", error.code, error.message);
    throw error;
  }
};

export const getUserOnboardingStatus = async (userId: string) => {
  try {
    console.log("Fetching onboarding status for user:", userId);
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("User data retrieved:", userData);
      // If onboardingCompleted field exists, return its value, otherwise false
      return userData.onboardingCompleted === true;
    }
    
    console.log("User document doesn't exist yet");
    return false;
  } catch (error: any) {
    console.error("Error getting user onboarding status:", error.code, error.message);
    // Return false on error instead of throwing, to prevent cascading failures
    return false;
  }
};

export const updateUserOnboardingStatus = async (userId: string, completed: boolean) => {
  let retryCount = 0;
  const maxRetries = 3;
  
  const attemptUpdate = async () => {
    try {
      console.log(`Attempt ${retryCount + 1} to update onboarding status for user:`, userId);
      
      // First check if the Firestore connection is working
      if (!(await validateFirestoreConnection())) {
        console.error("Firestore connection not available");
        throw new Error("Firestore connection not available");
      }
      
      // Get a fresh reference to the user document
      const userDocRef = doc(db, "users", userId);
      
      // Prepare minimal data to update
      const updateData = { 
        onboardingCompleted: completed,
        lastUpdated: new Date().toISOString()
      };
      
      // Always use setDoc with merge option for more reliable updates
      await setDoc(userDocRef, updateData, { merge: true });
      console.log("Successfully updated user document with onboarding status:", completed);
      
      return true;
    } catch (error: any) {
      console.error(`Attempt ${retryCount + 1} failed:`, error.code, error.message);
      
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying update (${retryCount}/${maxRetries})...`);
        // Exponential backoff: 1s, 2s, 4s, etc.
        const backoffTime = Math.pow(2, retryCount - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return attemptUpdate();
      }
      
      // If we've run out of retries, return false instead of throwing
      console.error("Maximum retries reached, giving up");
      return false;
    }
  };
  
  return attemptUpdate();
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
    if (isNewUser && result.user) {      await createUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        onboardingCompleted: false, // Show onboarding for new users
      });
    }
    
    return result;
  } catch (error: any) {
    console.error("Error signing in with Google:", error.code, error.message);
    throw error;
  }
};

// Utility function to test Firestore connection and initialize properly
export const validateFirestoreConnection = async () => {
  try {
    // Try a simple read operation to verify connection
    const usersRef = collection(db, "users");
    await getDocs(usersRef);
    console.log("Firestore connection verified successfully");
    return true;
  } catch (error) {
    console.error("Firestore connection test failed:", error);
    return false;
  }
};

// Export a function to handle reconnection attempts
export const ensureFirestoreConnection = async (maxRetries = 3) => {
  let attempts = 0;
  
  const attempt = async () => {
    attempts++;
    console.log(`Attempting to connect to Firestore (${attempts}/${maxRetries})`);
    
    const isConnected = await validateFirestoreConnection();
    
    if (isConnected) {
      return true;
    } else if (attempts < maxRetries) {
      // Wait with exponential backoff
      const delay = Math.pow(2, attempts - 1) * 1000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return attempt();
    } else {
      console.error("Failed to connect to Firestore after maximum retries");
      return false;
    }
  };
  
  return attempt();
};
