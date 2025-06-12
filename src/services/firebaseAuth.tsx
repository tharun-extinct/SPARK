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
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setIsLoading(false);
      
      // If user is authenticated, check onboarding status
      if (user) {
        checkOnboardingStatus();
      } else {
        setOnboardingCompleted(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const checkOnboardingStatus = async (): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const status = await getUserOnboardingStatus(currentUser.uid);
      setOnboardingCompleted(status);
      return status;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
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

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate('/login');
      }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
};

// HOC specifically for the dashboard that checks onboarding status
export const withCompletedOnboarding = (Component: React.ComponentType) => {
  return function ProtectedDashboardRoute(props: any) {
    const { isAuthenticated, isLoading, checkOnboardingStatus } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      // First check if user is authenticated
      if (!isLoading && !isAuthenticated) {
        navigate('/login');
        return;
      }

      // Then check if onboarding is completed
      if (isAuthenticated) {
        const checkStatus = async () => {
          const isCompleted = await checkOnboardingStatus();
          setChecking(false);
          
          if (!isCompleted) {
            navigate('/onboarding');
          }
        };
        
        checkStatus();
      }
    }, [isAuthenticated, isLoading, navigate, checkOnboardingStatus]);

    if (isLoading || checking) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
};
