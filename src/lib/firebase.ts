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
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
  disableNetwork,
  enableNetwork
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

// Configure Firebase with memory management settings to prevent excessive re-connects
const firestoreSettings = {
  // Use persistent cache with multi-tab support
  localCache: persistentLocalCache({
    // Explicitly set cache size limits to prevent memory issues
    cacheSizeBytes: 40 * 1024 * 1024, // 40MB cache size
    tabManager: persistentMultipleTabManager()
  })
};

// Create Firestore instance with optimized settings
const db = initializeFirestore(app, firestoreSettings);

// Set auth persistence to LOCAL by default for persistent sessions
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

console.log("Firestore initialized with optimized settings");

// Track Firestore connection state
let isFirestoreConnected = false;
let connectionRetryCount = 0;
const MAX_CONNECTION_RETRIES = 5;
let lastNetworkResetTime = 0;

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
  if (!userId) {
    console.error("Cannot update onboarding status: Missing user ID");
    return false;
  }
  
  let retryCount = 0;
  const maxRetries = 5; // Maximum number of retries
  
  // Reset Firestore connection state if needed before attempting update
  if (!isFirestoreConnected && connectionRetryCount > 0) {
    console.log("Resetting Firestore connection state before updating user status");
    isFirestoreConnected = false;
    connectionRetryCount = 0;
    
    // Force a network reset
    try {
      await disableNetwork(db);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await enableNetwork(db);
      console.log("Network connection reset completed");
    } catch (error) {
      console.error("Error during network reset:", error);
    }
  }
  
  const attemptUpdate = async () => {
    try {
      console.log(`Attempt ${retryCount + 1} to update onboarding status for user:`, userId);
      
      // First ensure Firestore connection is working with dedicated retry logic
      const connectionEstablished = await ensureFirestoreConnection(3);
      
      if (!connectionEstablished) {
        console.error("Failed to establish Firestore connection for update");
        
        // Save to sessionStorage as a fallback if Firestore is unreachable
        try {
          sessionStorage.setItem(`onboarding_complete_${userId}`, completed ? 'true' : 'false');
          console.log("Stored onboarding status in sessionStorage as fallback");
        } catch (storageError) {
          console.error("Failed to store in sessionStorage:", storageError);
        }
        
        throw new Error("Firestore connection failed");
      }
      
      // Prepare minimal data to update - keep it as small as possible
      const updateData = { 
        onboardingCompleted: completed,
        lastUpdated: new Date().toISOString()
      };
      
      // Get a fresh reference to the user document
      const userDocRef = doc(db, "users", userId);
      
      // Use a transaction to ensure data consistency or use setDoc with timeout
      const updatePromise = setDoc(userDocRef, updateData, { merge: true });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Update operation timeout")), 10000) // Longer timeout
      );
      
      // Race the update against a timeout
      await Promise.race([updatePromise, timeoutPromise]);
      
      console.log("Successfully updated user document with onboarding status:", completed);
      isFirestoreConnected = true; // Mark connection as verified on successful write
      
      // Clean up any fallback status if we succeeded
      try {
        sessionStorage.removeItem(`onboarding_complete_${userId}`);
      } catch (e) {}
      
      return true;
    } catch (error: any) {
      // Check for specific error types and handle accordingly
      const errorCode = error.code || 'unknown';
      const errorMessage = error.message || 'Unknown error';
      
      console.error(`Attempt ${retryCount + 1} failed:`, errorCode, errorMessage);
      
      // For specific error codes that indicate retry is pointless, fail fast
      if (
        errorCode === 'permission-denied' || 
        errorCode === 'unauthenticated' ||
        errorMessage.includes('Permission denied')
      ) {
        console.error("Fatal error, retries won't help:", errorMessage);
        return false;
      }
      
      // For network-related errors or timeouts, try again
      if (retryCount < maxRetries) {
        retryCount++;
        // Use jittered exponential backoff
        const baseDelay = Math.min(Math.pow(2, retryCount) * 500, 8000); // Cap at 8 seconds
        const jitter = Math.random() * 1000;
        const backoffTime = baseDelay + jitter;
        
        console.log(`Retrying update (${retryCount}/${maxRetries}) in ${Math.round(backoffTime)}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        
        // For network errors, mark connection as needing verification
        if (
          errorCode === 'unavailable' || 
          errorCode === 'network-request-failed' ||
          errorMessage.includes('network') ||
          errorMessage.includes('timeout')
        ) {
          isFirestoreConnected = false;
          
          // On network errors, try to reset the connection
          if (retryCount > 1) {
            try {
              await disableNetwork(db);
              await new Promise(resolve => setTimeout(resolve, 1000));
              await enableNetwork(db);
              console.log("Network reset during retry");
            } catch (netError) {
              console.error("Failed to reset network:", netError);
            }
          }
        }
        
        return attemptUpdate();
      }
      
      // If we've run out of retries, save to sessionStorage and return false
      console.error("Maximum retries reached, giving up on update");
      
      // Save to sessionStorage as a last resort
      try {
        sessionStorage.setItem(`onboarding_complete_${userId}`, completed ? 'true' : 'false');
        console.log("Stored onboarding status in sessionStorage after all retries failed");
      } catch (storageError) {
        console.error("Failed to store in sessionStorage:", storageError);
      }
      
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

// Utility function to test Firestore connection with better error handling
export const validateFirestoreConnection = async () => {
  try {
    if (isFirestoreConnected) {
      return true; // Return immediately if we already have a verified connection
    }
    
    // Force network reset if we've been having persistent issues
    const now = Date.now();
    if (connectionRetryCount > 3 && (now - lastNetworkResetTime > 10000)) {
      console.log("Too many connection failures, resetting network connection");
      lastNetworkResetTime = now;
      
      // Disable and re-enable network to force a fresh connection
      try {
        await disableNetwork(db);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await enableNetwork(db);
      } catch (netError) {
        console.error("Error resetting network:", netError);
      }
    }
    
    // Try a minimal read operation to verify connection
    // Use timeout to prevent hanging operations
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Firestore connection timeout")), 7000)
    );
    
    const connectionPromise = (async () => {
      try {
        // First try a simple system document that should be accessible to anyone
        const testDocRef = doc(db, "system", "connection-test");
        await getDoc(testDocRef);
        return true;
      } catch (e) {
        // If that fails, try to read the user's own document if authenticated
        if (auth.currentUser) {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          await getDoc(userDocRef);
          return true;
        }
        throw e;
      }
    })();
    
    // Race the connection attempt against timeout
    const result = await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log("Firestore connection verified successfully");
    isFirestoreConnected = true;
    connectionRetryCount = 0; // Reset retry counter on success
    return result;
  } catch (error) {
    // Log the specific error type for debugging
    console.error(`Firestore connection test failed (attempt ${connectionRetryCount + 1}):`, 
      error.name, error.code, error.message);
    
    connectionRetryCount++;
    isFirestoreConnected = false;
    return false;
  }
};

// Enhanced function to handle reconnection attempts with circuit breaker pattern
export const ensureFirestoreConnection = async (maxRetries = MAX_CONNECTION_RETRIES) => {
  // Circuit breaker pattern
  if (connectionRetryCount > maxRetries * 2) {
    console.log("Circuit breaker activated: Resetting Firestore connection state");
    connectionRetryCount = 0;
    isFirestoreConnected = false;
    
    // Force a network reset
    try {
      await disableNetwork(db);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Longer pause for full reset
      await enableNetwork(db);
      console.log("Network connection reset completed");
    } catch (error) {
      console.error("Error during network reset:", error);
    }
  }
  
  let attempts = 0;
  
  const attempt = async () => {
    attempts++;
    console.log(`Attempting to connect to Firestore (${attempts}/${maxRetries})`);
    
    const isConnected = await validateFirestoreConnection();
    
    if (isConnected) {
      console.log("Firestore connection established successfully");
      return true;
    } else if (attempts < maxRetries) {
      // Wait with jittered exponential backoff to prevent thundering herd
      const baseDelay = Math.min(Math.pow(2, attempts) * 500, 8000); // Cap at 8 seconds
      const jitter = Math.random() * 1000; // Add up to 1000ms of random jitter
      const delay = baseDelay + jitter;
      console.log(`Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return attempt();
    } else {
      console.error(`Failed to connect to Firestore after ${maxRetries} attempts`);
      return false;
    }
  };
  
  return attempt();
};
