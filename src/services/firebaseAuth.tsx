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
const CONNECTION_COOLDOWN_MS = 30000; // 30 seconds cooldown between connection resets

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

  useEffect(() => {
    // Proactively ensure Firestore connection is established once at startup
    ensureFirestoreConnection(3).catch(err => {
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
      // No need to disable network on unmount as it could affect other components
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
      
      // First ensure we have a valid connection before attempting to read
      const connectionEstablished = await ensureFirestoreConnection(2);
      if (!connectionEstablished) {
        console.warn("Firestore connection not established, using fallback for onboarding status");
        // Check session storage for fallback value
        const fallbackValue = sessionStorage.getItem(`onboarding_complete_${userId}`);
        if (fallbackValue) {
          const status = fallbackValue === 'true';
          setOnboardingCompleted(status);
          setIsLoading(false);
          return status;
        }
        throw new Error("Firestore connection failed");
      }
      
      const status = await getUserOnboardingStatus(userId);
      console.log("Retrieved onboarding status:", status);
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
    const { isAuthenticated, isLoading, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate('/login');
      }
    }, [isAuthenticated, isLoading, navigate]);
    
    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>;
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
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
      const checkStatus = async () => {
        try {
          // First check if user is authenticated
          if (!isLoading) {
            if (!isAuthenticated) {
              navigate('/login');
              return;
            }
            
            // Force a fresh check of onboarding status
            if (currentUser) {
              console.log("Checking onboarding status for user:", currentUser.uid);
              const isCompleted = await checkOnboardingStatus();
              console.log("Onboarding completed:", isCompleted);
              
              if (!isCompleted) {
                navigate('/onboarding');
                return;
              }
            }
            
            setChecking(false);
          }
        } catch (err) {
          console.error("Error in withCompletedOnboarding:", err);
          
          // If we have fewer than 3 retries, try to reset connection and retry
          if (retryCount < 3) {
            setRetryCount(prevCount => prevCount + 1);
            console.log(`Retry attempt ${retryCount + 1}/3`);
            
            // Try to reset the Firestore connection
            await resetFirestoreConnection();
            
            // Wait a moment then retry
            setTimeout(() => {
              checkStatus();
            }, 2000);
          } else {
            setError("Error loading dashboard. Please try again.");
            setChecking(false);
          }
        }
      };
      
      checkStatus();
    }, [isAuthenticated, isLoading, navigate, currentUser, checkOnboardingStatus, retryCount]);

    if (isLoading || checking) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your dashboard{retryCount > 0 ? ` (retry ${retryCount}/3)` : ''}...</p>
        </div>
      </div>;    }
    
    if (error) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
            <p>{error}</p>
            <button 
              onClick={() => {
                resetFirestoreConnection().then(() => {
                  setError(null);
                  setRetryCount(0);
                  setChecking(true);
                });
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry Connection
            </button>            <button 
              onClick={() => window.location.reload()}
              className="mt-4 ml-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>;
    }

    return isAuthenticated && onboardingCompleted ? <Component {...props} /> : null;
  };
};
