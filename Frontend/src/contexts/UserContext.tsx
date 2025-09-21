import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createUser } from '@/lib/api-adapter';
import { MatchesProvider } from './MatchesContext';

interface User {
  id: string;
  email?: string;
  name?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (userData?: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (userData?: User) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem('realestate_user_id', userData.id);
      if (userData.email) {
        localStorage.setItem('realestate_user_email', userData.email);
      }
      if (userData.name) {
        localStorage.setItem('realestate_user_name', userData.name);
      }
    } else {
      // Auto-login for demo purposes
      const storedUserId = localStorage.getItem('realestate_user_id');
      const storedEmail = localStorage.getItem('realestate_user_email');
      const storedName = localStorage.getItem('realestate_user_name');
      
      if (storedUserId) {
        setUser({
          id: storedUserId,
          email: storedEmail || undefined,
          name: storedName || undefined
        });
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('realestate_user_id');
    localStorage.removeItem('realestate_user_email');
    localStorage.removeItem('realestate_user_name');
  };

  useEffect(() => {
    // Check if user exists in localStorage
    const storedUserId = localStorage.getItem('realestate_user_id');
    const storedEmail = localStorage.getItem('realestate_user_email');
    const storedName = localStorage.getItem('realestate_user_name');
    
    if (storedUserId) {
      setUser({
        id: storedUserId,
        email: storedEmail || undefined,
        name: storedName || undefined
      });
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      <MatchesProvider userId={user?.id}>
        {children}
      </MatchesProvider>
    </UserContext.Provider>
  );
};
