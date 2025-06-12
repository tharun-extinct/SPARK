import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

// Types
type AuthContextType = {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

// Create context
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  isAuthenticated: false,
});

// Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
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
