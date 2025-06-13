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
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);    useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      
      // If user is authenticated, check onboarding status
      if (user) {
        // Use immediately available user ID instead of relying on state
        checkUserOnboardingStatus(user.uid);
      } else {
        setOnboardingCompleted(false);
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const checkUserOnboardingStatus = async (userId: string): Promise<boolean> => {
    try {
      const status = await getUserOnboardingStatus(userId);
      setOnboardingCompleted(status);
      setIsLoading(false);
      return status;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
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
    }, [isAuthenticated, isLoading, navigate]);    if (isLoading) {
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
    const { isAuthenticated, isLoading, currentUser, onboardingCompleted, checkOnboardingStatus } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      const checkStatus = async () => {
        // First check if user is authenticated
        if (!isLoading) {
          if (!isAuthenticated) {
            navigate('/login');
            return;
          }
          
          // Force a fresh check of onboarding status
          if (currentUser) {
            const isCompleted = await checkOnboardingStatus();
            if (!isCompleted) {
              navigate('/onboarding');
              return;
            }
          }
          
          setChecking(false);
        }
      };
      
      checkStatus();
    }, [isAuthenticated, isLoading, navigate, currentUser, checkOnboardingStatus]);

    if (isLoading || checking) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>;
    }

    return isAuthenticated && onboardingCompleted ? <Component {...props} /> : null;
  };
};
