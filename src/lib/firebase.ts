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
  disableNetwork as disableFirestoreNetwork,
  enableNetwork as enableFirestoreNetwork
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
    // Use the tabManager for multi-tab support
    tabManager: persistentMultipleTabManager()
  }),
  // Add experimental settings to improve connection reliability
  experimentalForceLongPolling: true, // Use long polling instead of WebSockets
  // Configure a longer timeout for operations
  experimentalLongPollingOptions: {
    timeoutSeconds: 30, // Set to maximum allowed value (30 seconds)
    longPollingTimeout: 30000 // 30 seconds in milliseconds
  }
};

// Create Firestore instance with optimized settings
const db = initializeFirestore(app, firestoreSettings);

// Explicitly enable network connections to ensure we're not in offline mode
enableFirestoreNetwork(db).catch(error => {
  console.error("Error enabling Firestore network:", error);
  
  // If we see a WebChannel error at initialization, try again after a delay
  if (error.message && (
      error.message.includes('WebChannelConnection') || 
      error.message.includes('transport errored') ||
      error.message.includes('Connection failed') ||
      error.message.includes('WebChannel') ||
      error.message.includes('RPC')
    )) {
    console.log("WebChannel error during initialization, retrying after delay");
    setTimeout(() => {
      enableFirestoreNetwork(db).catch(retryError => {
        console.error("Failed to enable network on retry:", retryError);
      });
    }, 3000);
  }
});

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
let pendingOperations = 0;
let networkResetInProgress = false;

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
    
    // Use our retry wrapper for WebChannel errors
    return await withWriteRetry(async () => {
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
    });
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
      await resetNetworkConnection();
      console.log("Network connection reset completed");
    } catch (error) {
      console.error("Error during network reset:", error);
    }
  }
  
  // Always save to sessionStorage as a fallback
  try {
    sessionStorage.setItem(`onboarding_complete_${userId}`, completed ? 'true' : 'false');
    console.log("Stored onboarding status in sessionStorage as fallback");
  } catch (storageError) {
    console.error("Failed to store in sessionStorage:", storageError);
  }
  
  const attemptUpdate = async () => {
    try {
      console.log(`Attempt ${retryCount + 1} to update onboarding status for user:`, userId);
      
      // First ensure Firestore connection is working with dedicated retry logic
      const connectionEstablished = await ensureFirestoreConnection(3);
      
      if (!connectionEstablished) {
        console.error("Failed to establish Firestore connection for update");
        // We already saved to sessionStorage as fallback above
        return false;
      }
      
      // Prepare minimal data to update - keep it as small as possible
      const updateData = { 
        onboardingCompleted: completed,
        lastUpdated: new Date().toISOString()
      };
      
      // Check if user document exists first
      const userDocRef = doc(db, "users", userId);
      const docSnap = await getDoc(userDocRef);
      
      // If document doesn't exist, create it with more complete data
      if (!docSnap.exists()) {
        console.log("User document doesn't exist, creating it with onboarding status");
        const initialUserData = {
          uid: userId,
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || '',
          onboardingCompleted: completed,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        
        // Use a simple try-catch to handle permission errors specifically
        try {
          await setDoc(userDocRef, initialUserData);
        } catch (writeError: any) {
          // If we get a permission error, return false immediately
          if (
            writeError.code === 'permission-denied' || 
            writeError.message?.includes('Permission denied')
          ) {
            console.error("Permission denied when writing to Firestore:", writeError);
            return false;
          }
          // For other errors, especially transport errors, throw to be caught by outer handler
          throw writeError;
        }
      } else {
        // Only update the necessary fields if the document exists
        // Use a simple try-catch to handle permission errors specifically
        try {
          await setDoc(userDocRef, updateData, { merge: true });
        } catch (writeError: any) {
          // If we get a permission error, return false immediately
          if (
            writeError.code === 'permission-denied' || 
            writeError.message?.includes('Permission denied')
          ) {
            console.error("Permission denied when writing to Firestore:", writeError);
            return false;
          }
          // For other errors, especially transport errors, throw to be caught by outer handler
          throw writeError;
        }
      }
      
      console.log("Successfully updated user document with onboarding status:", completed);
      isFirestoreConnected = true; // Mark connection as verified on successful write
      
      return true;
    } catch (error: any) {
      // Check for specific error types and handle accordingly
      const errorCode = error.code || 'unknown';
      const errorMessage = error.message || 'Unknown error';
      
      console.error(`Attempt ${retryCount + 1} failed:`, errorCode, errorMessage);
      
      // Check for WebChannel connection errors specifically
      const isWebChannelError = 
        errorMessage.includes('WebChannelConnection') || 
        errorMessage.includes('transport errored') ||
        errorMessage.includes('Connection failed') ||
        errorMessage.includes('WebChannel') ||
        errorMessage.includes('RPC') ||
        errorMessage.includes('write stream');
      
      if (isWebChannelError) {
        console.log("WebChannel connection error detected, resetting network connection");
        // Always reset the network for WebChannel errors
        await resetNetworkConnection();
        
        // For WebChannel errors, mark connection as needing verification
        isFirestoreConnected = false;
      }
      
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
          errorMessage.includes('timeout') ||
          isWebChannelError
        ) {
          isFirestoreConnected = false;
          
          // On network errors, try to reset the connection
          if (retryCount > 1) {
            try {
              await resetNetworkConnection();
              console.log("Network reset during retry");
            } catch (netError) {
              console.error("Failed to reset network:", netError);
            }
          }
        }
        
        return attemptUpdate();
      }
      
      // If we've run out of retries, we already saved to sessionStorage as a fallback
      console.error("Maximum retries reached, giving up on update");
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
      
      // Reset network connection
      await resetNetworkConnection();
    }
    
    // Try a minimal read operation to verify connection
    // Use timeout to prevent hanging operations
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Firestore connection timeout")), 10000)
    );
    
    const connectionPromise = (async () => {
      try {
        // Try to read the user's own document if authenticated
        if (auth.currentUser) {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          
          // If user document doesn't exist, create a minimal one
          if (!docSnap.exists()) {
            console.log("User document doesn't exist, creating a minimal one");
            await setDoc(userDocRef, {
              uid: auth.currentUser.uid,
              email: auth.currentUser.email,
              onboardingCompleted: false,
              createdAt: new Date().toISOString()
            });
          }
          
          return true;
        } else {
          // If not authenticated, try a simple system document
          const testDocRef = doc(db, "system", "connection-test");
          try {
            const docSnap = await getDoc(testDocRef);
            
            // If test document doesn't exist, attempt to create it (may fail due to security rules)
            if (!docSnap.exists()) {
              try {
                await setDoc(testDocRef, { 
                  timestamp: new Date().toISOString(),
                  healthy: true 
                });
              } catch (writeError) {
                // It's okay if we can't write due to security rules
                console.log("Unable to create test document, but read succeeded");
              }
            }
          } catch (readError) {
            // If we can't read the test document, Firestore is truly unavailable
            console.error("Failed to read test document:", readError);
            throw readError;
          }
          
          return true;
        }
      } catch (e) {
        console.error("Connection test failed:", e);
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
    
    // Check for WebChannel errors specifically
    if (error.message && (
        error.message.includes('WebChannelConnection') || 
        error.message.includes('transport errored') ||
        error.message.includes('Connection failed') ||
        error.message.includes('WebChannel') ||
        error.message.includes('RPC')
      )) {
      console.log("WebChannel error during connection test, resetting network");
      // Always reset network for WebChannel errors
      await resetNetworkConnection();
    }
    
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
    try {        try {
          await resetNetworkConnection();
          console.log("Network connection reset completed during ensureFirestoreConnection");
        } catch (error) {
          console.error("Error during network reset:", error);
        }
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

// Helper function to safely reset network connection
export const resetNetworkConnection = async (): Promise<boolean> => {
  // Prevent multiple simultaneous resets
  if (networkResetInProgress) {
    console.log("Network reset already in progress, skipping");
    return false;
  }
  
  // Prevent resets if we've recently reset already
  const now = Date.now();
  if (now - lastNetworkResetTime < 10000) {
    console.log("Network reset on cooldown, skipping");
    return false;
  }
  
  try {
    networkResetInProgress = true;
    lastNetworkResetTime = now;
    console.log("Resetting Firestore network connection");
    
    // Disable network
    await disableFirestoreNetwork(db);
    
    // Short delay to ensure clean disconnect
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Re-enable network
    await enableFirestoreNetwork(db);
    
    // Another short delay to let connection establish
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Firestore network connection reset complete");
    // Reset connection flag to true since we've just re-established the connection
    isFirestoreConnected = true;
    connectionRetryCount = 0; // Reset retry counter on successful network reset
    return true;
  } catch (error) {
    console.error("Error resetting network connection:", error);
    // Still mark connection as needing verification
    isFirestoreConnected = false;
    return false;
  } finally {
    networkResetInProgress = false;
  }
};

// Exported for use in firebaseAuth.tsx
export const disableNetwork = async (): Promise<void> => {
  try {
    await disableFirestoreNetwork(db);
  } catch (error) {
    console.error("Error disabling network:", error);
  }
};

// Exported for use in firebaseAuth.tsx
export const enableNetwork = async (): Promise<void> => {
  try {
    await enableFirestoreNetwork(db);
  } catch (error) {
    console.error("Error enabling network:", error);
  }
};

// Helper function to wrap Firestore write operations with automatic retry for WebChannel errors
export const withWriteRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let retryCount = 0;
  
  const attempt = async (): Promise<T> => {
    try {
      return await operation();
    } catch (error: any) {
      const errorMessage = error?.message || '';
      
      // Check for WebChannel/transport errors specifically
      const isWebChannelError = 
        errorMessage.includes('WebChannelConnection') || 
        errorMessage.includes('transport errored') ||
        errorMessage.includes('Connection failed') ||
        errorMessage.includes('WebChannel') ||
        errorMessage.includes('RPC') ||
        errorMessage.includes('write stream');
      
      // If it's a WebChannel error and we haven't exceeded max retries
      if (isWebChannelError && retryCount < maxRetries) {
        retryCount++;
        console.log(`WebChannel error detected, retry ${retryCount}/${maxRetries}`);
        
        // Always try to reset the network connection for WebChannel errors
        try {
          await resetNetworkConnection();
        } catch (resetError) {
          console.error("Failed to reset network during retry:", resetError);
        }
        
        // Add a delay with exponential backoff
        const delay = Math.min(Math.pow(2, retryCount) * 1000, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the operation
        return attempt();
      }
      
      // For other errors or if we've exhausted retries, propagate the error
      throw error;
    }
  };
  
  return attempt();
};
