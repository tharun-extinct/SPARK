import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  onAuthChange, 
  getUserOnboardingStatus,
  ensureFirestoreConnection,
  validateFirestoreConnection
} from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

// Types
type AuthContextType = {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  checkOnboardingStatus: () => Promise<boolean>;
  resetFirestoreConnection: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

// Create context
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  isAuthenticated: false,
  onboardingCompleted: false,
  checkOnboardingStatus: async () => false,
  resetFirestoreConnection: async () => {},
});

// Track connection attempts to prevent excessive reconnection
let connectionAttemptTimestamp = 0;
const CONNECTION_COOLDOWN_MS = 15000; // 15 seconds cooldown between connection resets (reduced from 30s)

// Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0);
  // Reset Firestore connection - exposed to allow manual reconnection if needed
  const resetFirestoreConnection = async (): Promise<void> => {
    const now = Date.now();
    // Only allow reset if enough time has passed since last attempt
    if (now - connectionAttemptTimestamp < CONNECTION_COOLDOWN_MS) {
      console.log("Connection reset on cooldown, skipping");
      return;
    }
    
    try {
      console.log("Manually resetting Firestore connection");
      connectionAttemptTimestamp = now;
      setConnectionAttempts(prev => prev + 1);
      
      // Force a connection validation which will reset if needed
      const connected = await validateFirestoreConnection();
      
      // If still not connected, try ensure connection with more retries
      if (!connected) {
        await ensureFirestoreConnection(3);
      }
      
      console.log("Connection reset attempt completed");
    } catch (error) {
      console.error("Error resetting Firestore connection:", error);
    }
  };
  useEffect(() => {    // Set up a timeout to prevent indefinite loading state
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Auth loading timeout reached - forcing completion");
        setIsLoading(false);
      }
    }, 3000); // Reduced from 5s for faster UI response
    
    // Proactively ensure Firestore connection is established once at startup
    // Run in background to not block UI
    ensureFirestoreConnection(2).catch(err => {
      console.error("Failed to establish initial Firestore connection:", err);
    });
    
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((user) => {
      console.log("Auth state changed, user:", user?.uid);
      setCurrentUser(user);
      
      // If user is authenticated, check onboarding status
      if (user) {
        // Use immediately available user ID instead of relying on state
        checkUserOnboardingStatus(user.uid).catch(err => {
          console.error("Error in auth state change handler:", err);
          setIsLoading(false);
        });
      } else {
        setOnboardingCompleted(false);
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  // Handle connection reset when reaching excessive attempts
  useEffect(() => {
    if (connectionAttempts > 5) {
      // Reset connection attempts counter after a delay
      const timer = setTimeout(() => {
        setConnectionAttempts(0);
      }, 60000); // Reset counter after 1 minute
      
      return () => clearTimeout(timer);
    }
  }, [connectionAttempts]);
  const checkUserOnboardingStatus = async (userId: string): Promise<boolean> => {
    try {
      console.log("Checking onboarding status for user ID:", userId);
      
      // Try session storage first for the fastest possible response
      const cachedStatus = sessionStorage.getItem(`onboarding_complete_${userId}`);
      if (cachedStatus) {
        console.log("Using cached onboarding status from sessionStorage");
        const status = cachedStatus === 'true';
        setOnboardingCompleted(status);
        setIsLoading(false);
        
        // In the background, still verify with Firestore but don't block UI
        setTimeout(async () => {
          try {
            const firestoreStatus = await getUserOnboardingStatus(userId);
            if (firestoreStatus !== status) {
              console.log("Updating cached status with Firestore value");
              setOnboardingCompleted(firestoreStatus);
              sessionStorage.setItem(`onboarding_complete_${userId}`, firestoreStatus ? 'true' : 'false');
            }
          } catch (e) {
            console.error("Background Firestore status check failed:", e);
          }
        }, 0);
        
        return status;
      }
        // No cached value, set a short timeout for Firestore connection
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.log("Firestore connection timeout for onboarding status");
          resolve(false);
        }, 1000); // 1 second timeout (reduced from 2s)
      });
      
      // Attempt to get the status from Firestore
      const statusPromise = (async () => {
        // First ensure we have a valid connection before attempting to read
        const connectionEstablished = await ensureFirestoreConnection(1); // Reduced retries for faster response
        if (!connectionEstablished) {
          console.warn("Firestore connection not established, using fallback");
          return false;
        }
        
        return getUserOnboardingStatus(userId);
      })();
      
      // Race the Firestore call against the timeout
      const status = await Promise.race([statusPromise, timeoutPromise]);
      console.log("Retrieved onboarding status:", status);
      
      // Cache the result
      sessionStorage.setItem(`onboarding_complete_${userId}`, status ? 'true' : 'false');
      setOnboardingCompleted(status);
      setIsLoading(false);
      return status;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Don't set onboardingCompleted to false if there was an error
      // This prevents redirecting to onboarding if there's just a temporary issue
      setIsLoading(false);
      return false;
    }
  };

  const checkOnboardingStatus = async (): Promise<boolean> => {
    if (!currentUser) return false;
    return checkUserOnboardingStatus(currentUser.uid);
  };

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    onboardingCompleted,
    checkOnboardingStatus,
    resetFirestoreConnection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component to protect routes
export const withAuth = (Component: React.ComponentType) => {
  return function ProtectedRoute(props: any) {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [showLoading, setShowLoading] = useState(false);
    
    // Only show loading indicator after a delay to prevent flashing
    useEffect(() => {
      if (isLoading) {
        const timer = setTimeout(() => setShowLoading(true), 500);
        return () => clearTimeout(timer);
      } else {
        setShowLoading(false);
      }
    }, [isLoading]);

    useEffect(() => {
      // Set a timeout to prevent indefinite loading
      const timeout = setTimeout(() => {
        if (isLoading) {
          console.log("Auth protection timeout reached, redirecting to login");
          navigate('/login');
        }
      }, 5000);
      
      if (!isLoading && !isAuthenticated) {
        navigate('/login');
      }
      
      return () => clearTimeout(timeout);
    }, [isAuthenticated, isLoading, navigate]);
    
    if (isLoading) {
      return showLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : null; // Show nothing briefly to avoid flash
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
};

// HOC specifically for the dashboard that checks onboarding status
export const withCompletedOnboarding = (Component: React.ComponentType) => {
  return function ProtectedDashboardRoute(props: any) {
    const { 
      isAuthenticated, 
      isLoading, 
      currentUser, 
      onboardingCompleted, 
      checkOnboardingStatus,
      resetFirestoreConnection
    } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false); // Start with false to reduce extra loading state
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {      // Set a max timeout for checking status to prevent indefinite loading
      const checkTimeout = setTimeout(() => {
        if (checking) {
          console.log("Dashboard check timeout reached - showing dashboard anyway");
          setChecking(false);
        }
      }, 2000); // Show dashboard after 2 seconds max wait (reduced from 3s)
      
      const checkStatus = async () => {
        try {
          // If still loading auth state, don't do anything yet
          if (isLoading) {
            return;
          }
          
          // If not authenticated, redirect to login immediately
          if (!isAuthenticated) {
            navigate('/login');
            return;
          }
          
          // If onboarding status is already known and completed, show dashboard immediately
          if (onboardingCompleted) {
            setChecking(false);
            return;
          }
          
          // Only set checking to true if we actually need to check
          setChecking(true);
          
          // Check onboarding status only if we don't already know it
          if (currentUser) {
            console.log("Checking onboarding status for user:", currentUser.uid);
            
            // First check sessionStorage for faster response
            const cachedStatus = sessionStorage.getItem(`onboarding_complete_${currentUser.uid}`);
            if (cachedStatus === 'true') {
              console.log("Using cached onboarding completed status");
              setChecking(false);
              return;
            }
            
            // If not complete in cache or no cache, check with server
            const isCompleted = await checkOnboardingStatus();
            console.log("Onboarding completed:", isCompleted);
            
            if (!isCompleted) {
              navigate('/onboarding');
              return;
            }
            
            setChecking(false);
          }
        } catch (err) {
          console.error("Error in withCompletedOnboarding:", err);
          
          // If we have fewer than 2 retries, try to reset connection and retry
          if (retryCount < 2) {
            setRetryCount(prevCount => prevCount + 1);
            console.log(`Retry attempt ${retryCount + 1}/2`);
            
            // Try to reset the Firestore connection
            resetFirestoreConnection().catch(console.error);
              // Wait a moment then retry, but shorter wait
            setTimeout(() => {
              checkStatus();
            }, 500); // Reduced from 1000ms for faster retry
          } else {
            // After retries, just show dashboard instead of error
            // This is a better user experience than showing an error
            console.log("Proceeding to dashboard despite errors after retries");
            setChecking(false);
          }
        }
      };
      
      checkStatus();
      
      return () => clearTimeout(checkTimeout);
    }, [isAuthenticated, isLoading, navigate, currentUser, checkOnboardingStatus, retryCount, onboardingCompleted]);

    if (isLoading || checking) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your dashboard{retryCount > 0 ? ` (retry ${retryCount}/2)` : ''}...</p>
        </div>
      </div>;
    }
    
    if (error) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
            <p>{error}</p>
            <div className="flex space-x-2 mt-4">
              <button 
                onClick={() => {
                  resetFirestoreConnection().then(() => {
                    setError(null);
                    setRetryCount(0);
                    setChecking(true);
                  });
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry Connection
              </button>
              <button 
                onClick={() => navigate('/dashboard', { replace: true })}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Continue Anyway
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>;
    }

    return <Component {...props} />;
  };
};
