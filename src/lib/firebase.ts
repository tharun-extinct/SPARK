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
  signInWithPopup                   } from 'firebase/auth';
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
  enableNetwork as enableFirestoreNetwork    } from 'firebase/firestore';

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
    tabManager: persistentMultipleTabManager(),
    // Set cache size to unlimited for better offline support
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  }),
  // Use long polling instead of WebSockets for more reliable connections
  experimentalForceLongPolling: true,
  // Configure a shorter timeout for faster initial loading
  experimentalLongPollingOptions: {
    timeoutSeconds: 10 // Shorter timeout for faster response (30s max allowed by Firebase)
  }
};

// Create Firestore instance with optimized settings
const db = initializeFirestore(app, firestoreSettings);

// Explicitly enable network connections to ensure we're not in offline mode
// but do it in background to not block UI
setTimeout(() => {
  enableFirestoreNetwork(db).catch(error => {
    //console.error("Error enabling Firestore network:", error);
    console.log("Error enabling Firestore network:", error);
  });
}, 0);
// Set auth persistence to LOCAL by default for persistent sessions
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.log("Error setting auth persistence:", error);
});

console.log("Firestore initialized with optimized settings");

// Track Firestore connection state
let isFirestoreConnected = false; // Assume not connected until validated
let connectionRetryCount = 0;
const MAX_CONNECTION_RETRIES = 3; // Reduced max retries for ensureConnection
let lastNetworkResetTime = Date.now();
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
  
  // Always save to sessionStorage as a fallback BEFORE attempting the update
  try {
    sessionStorage.setItem(`onboarding_complete_${userId}`, completed ? 'true' : 'false');
    console.log("Stored onboarding status in sessionStorage as fallback");
  } catch (storageError) { 
    console.error("Failed to store in sessionStorage:", storageError); 
  }  

  const maxRetries = 3; // Reduced from 5 for faster feedback

  const attemptUpdate = async () => {
    try {
      // Ensure Firestore connection is working
      const connectionEstablished = await ensureFirestoreConnection(2);
      if (!connectionEstablished) {
        console.warn("Proceeding with update despite connection issues");
        // Continue anyway - the withWriteRetry will handle retries
      }
      
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
        await setDoc(userDocRef, initialUserData);
      } else {
        // Only update the necessary fields if the document exists
        await setDoc(userDocRef, updateData, { merge: true });
      }
      isFirestoreConnected = true; // Mark connection as verified on successful write

      // Save to sessionStorage on successful update as well
      try {
        sessionStorage.setItem(`onboarding_complete_${userId}`, completed ? 'true' : 'false');
        console.log("Stored onboarding status in sessionStorage on successful update");
      } catch (storageError) {
        console.error("Failed to store in sessionStorage after successful update:", storageError);
      }
      
      return true;
    } catch (error: any) {
      // Check for specific error types and handle accordingly
      const errorCode = error.code || 'unknown';
      const errorMessage = error.message || 'Unknown error';
      
      // For specific error codes that indicate retry is pointless, fail fast
      if (
        errorCode === 'permission-denied' || 
        errorCode === 'unauthenticated' ||
        errorMessage.includes('Permission denied')
      ) {
        console.error("Fatal error, retries won't help:", errorMessage);
        return false;
      }
      
      // Rethrow for withWriteRetry to handle
      throw error;
    }
  };

  // Use withWriteRetry to wrap the core update logic
  try {
    return await withWriteRetry(attemptUpdate, maxRetries);
  } catch (error) {
    console.error("All retries failed for onboarding status update:", error);
    return false; // Return false after exhausting all retries
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
    if (isFirestoreConnected) return true; // Return immediately if we believe we are connected

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Firestore connection timeout")), 8000) // Reduced from 10s
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
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log("Firestore connection verified successfully");
    isFirestoreConnected = true;
    connectionRetryCount = 0; // Reset retry counter on success
    return true;
  } catch (error: any) {
    // Log the specific error type for debugging
    console.error(`Firestore connection test failed (attempt ${connectionRetryCount + 1}):`, 
      error.name, error.code, error.message);
    
    // Check for WebChannel errors specifically and attempt network reset
    const isWebChannelError = error.message && (
      error.message.includes('WebChannelConnection') || error.message.includes('transport errored') ||
      error.message.includes('Connection failed') || error.message.includes('WebChannel') ||
      error.message.includes('RPC') || error.message.includes('write stream'));
      
    // We don't know for sure if we are connected after an error
    isFirestoreConnected = false; 
    
    // Attempt network reset if a WebChannel error occurred
    if (isWebChannelError) {
      console.warn("WebChannel error during connection test, attempting network reset.");
      resetNetworkConnection().catch(err => console.error("Error during connection test network reset:", err));
    }
    
    connectionRetryCount++;
    return false;
  }
};
  
// Enhanced function to handle reconnection attempts with circuit breaker pattern
export const ensureFirestoreConnection = async (maxAttempts = 2) => {
  // If we believe we're already connected, verify it quickly
  if (isFirestoreConnected) {
    try {
      // Quick verification without a full test
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Quick verification timeout")), 3000)
      );
      
      // Just attempt a quick connection check
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await Promise.race([getDoc(userRef), timeoutPromise]);
        return true; // If we get here, the connection is working
      }
      return true; // No user, but we believe we're connected
    } catch (error) {
      // Quick check failed, continue with full reconnection process
      console.log("Quick connection verification failed, trying full reconnection");
      isFirestoreConnected = false;
    }
  }

  // Circuit breaker pattern
  if (connectionRetryCount > MAX_CONNECTION_RETRIES) {
    console.log("Circuit breaker activated: Resetting Firestore connection state");
    connectionRetryCount = 0;
    isFirestoreConnected = false;
    
    // Force a network reset
    try {
      await resetNetworkConnection();
      console.log("Network connection reset completed during ensureFirestoreConnection");
    } catch (error) {
      console.error("Error during network reset:", error);
    }
  }
  
  let attempts = 0;
  
  const attempt = async () => {
    attempts++;
    console.log(`Attempting to connect to Firestore (${attempts}/${maxAttempts})`);
    
    const isConnected = await validateFirestoreConnection();
    
    if (isConnected) {
      console.log("Firestore connection established successfully");
      return true;
    } else if (attempts < maxAttempts) {
      // Wait with jittered exponential backoff to prevent thundering herd
      const baseDelay = Math.min(Math.pow(2, attempts) * 500, 3000); // Cap at 3 seconds for faster response
      const jitter = Math.random() * 500; // Add up to 500ms of random jitter
      const delay = baseDelay + jitter;
      console.log(`Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return attempt();
    } else {
      console.error(`Failed to connect to Firestore after ${maxAttempts} attempts`);
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
  
  // Prevent resets if we've recently reset already (cooldown of 10s)
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
    await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced from 2s
    
    // Re-enable network
    await enableFirestoreNetwork(db);
    
    // Another short delay to let connection establish
    await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced from 1.5s
    
    console.log("Firestore network connection reset complete");
    // Reset connection flag to force verification on next operation
    isFirestoreConnected = false;
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
  maxRetries: number = 3 // Reduced from 5 for faster feedback
): Promise<T> => {
  let retryCount = 0;

  const attempt = async (): Promise<T> => {
    try {
      pendingOperations++;
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
        console.warn(`WebChannel error detected during write, retry ${retryCount}/${maxRetries}`);
        
        // For first retry, try to reset the network connection
        if (retryCount === 1) {
          try {
            await resetNetworkConnection();
          } catch (resetError) {
            console.error("Failed to reset network during retry:", resetError);
          }
        }
        
        // Add a delay with exponential backoff
        const delay = Math.min(Math.pow(2, retryCount) * 500, 5000); // Reduced base and max delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the operation
        return attempt();
      }
      
      // For other errors or if we've exhausted retries, propagate the error
      throw error;
    } finally {
      pendingOperations--;
    }
  };
  
  return attempt();
};
