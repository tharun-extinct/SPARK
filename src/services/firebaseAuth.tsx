import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, getUserOnboardingStatus } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

// Types
type AuthContextType = {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  checkOnboardingStatus: () => Promise<boolean>;
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
});

// Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  
  useEffect(() => {
    // Failsafe: ensure we don't stay in loading state indefinitely
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth loading timed out - forcing state update');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout as fallback
    
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((user) => {
      console.log('Auth state changed', user ? 'User logged in' : 'No user');
      setCurrentUser(user);
      
      // If user is authenticated, check onboarding status
      if (user) {
        checkOnboardingStatus();
      } else {
        setOnboardingCompleted(false);
        setIsLoading(false);
      }
    });

    // Cleanup subscription and timeout on unmount
    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);
  const checkOnboardingStatus = async (): Promise<boolean> => {
    if (!currentUser) {
      setIsLoading(false);
      return false;
    }
    
    try {
      console.log('Checking onboarding status for', currentUser.uid);
      // Perform onboarding check with timeout protection
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.warn('Onboarding status check timed out');
          resolve(true); // Default to completed if timeout
        }, 3000);
      });
      
      // Race between actual check and timeout
      const status = await Promise.race([
        getUserOnboardingStatus(currentUser.uid),
        timeoutPromise
      ]);
      
      console.log('Onboarding status:', status);
      setOnboardingCompleted(status);
      setIsLoading(false);
      return status;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to completed on error to prevent blocking
      setOnboardingCompleted(true);
      setIsLoading(false);
      return true;
    }
  };

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    onboardingCompleted,
    checkOnboardingStatus,
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
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    useEffect(() => {
      // Handle loading timeout
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn('Auth protection loading timed out');
          setLoadingTimeout(true);
        }
      }, 3000);

      // Check authentication
      if (!isLoading && !isAuthenticated) {
        navigate('/login');
      }
      
      return () => clearTimeout(timeoutId);
    }, [isAuthenticated, isLoading, navigate]);

    // Force render the component if loading takes too long
    if (isLoading && !loadingTimeout) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-3"></div>
          <p>Loading...</p>
        </div>
      );
    }

    // If loading timed out but we have a user, render the component anyway
    if (loadingTimeout && currentUser) {
      return <Component {...props} />;
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
};

// HOC specifically for the dashboard that checks onboarding status
export const withCompletedOnboarding = (Component: React.ComponentType) => {
  return function ProtectedDashboardRoute(props: any) {
    const { isAuthenticated, isLoading, currentUser, onboardingCompleted } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      // Run this effect only once per component mount
      const timeoutId = setTimeout(() => {
        // Force render the dashboard if it's taking too long
        if (isAuthenticated && checking) {
          console.log('Force rendering dashboard after timeout');
          setChecking(false);
        }
      }, 2000); // 2 second timeout as fallback

      // First check if user is authenticated
      if (!isLoading) {
        if (!isAuthenticated) {
          navigate('/login');
          return;
        }
        
        // Use the already loaded onboardingCompleted state instead of making a new request
        if (!onboardingCompleted) {
          navigate('/onboarding');
        }
        
        // Ensure we set checking to false when ready
        setChecking(false);
      }
      
      return () => clearTimeout(timeoutId);
    }, [isAuthenticated, isLoading, navigate, onboardingCompleted]);

    if (isLoading || checking) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-3"></div>
          <p>Loading your dashboard...</p>
        </div>
      );
    }    return <Component {...props} />;
  };
}