import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserUpdateRequest } from '../types';
import { usersApi, CURRENT_USER_ID } from '../api/usersApi';

interface UserContextValue {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateUser: (data: UserUpdateRequest) => Promise<User>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

// Initial fallback state matching userId=1 in case of temporary network latency
const DEFAULT_USER: User = {
  id: CURRENT_USER_ID,
  username: 'siddhant',
  name: 'Siddhant Prajapati',
  email: 'sidkp.official@gmail.com',
  experience: 2.7,
  roles: ['Java Developer', 'Full Stack Developer'],
  portfolioLink: 'https://siddhant-portfolio-k3vf.onrender.com/',
  githubLink: 'https://github.com/siddhant-prajapati',
  linkedInLink: 'https://www.linkedin.com/in/siddhant-prajapati-79680b233',
  leetcodeLink: '',
  hackerrankLink: '',
  companies: [],
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch userId=1 until Spring Security auth is active
      const user = await usersApi.getCurrentUser();
      if (user && user.id) {
        setCurrentUser(user);
      }
    } catch (err: any) {
      console.warn('Failed to fetch current user (id=1), using default fallback profile:', err);
      setError(err?.message || 'Failed to load user profile');
      // Keep DEFAULT_USER so UI continues to function smoothly
      if (!currentUser) {
        setCurrentUser(DEFAULT_USER);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const handleUpdateUser = async (data: UserUpdateRequest): Promise<User> => {
    const targetId = currentUser?.id || CURRENT_USER_ID;
    try {
      const updated = await usersApi.update(targetId, data);
      setCurrentUser(updated);
      return updated;
    } catch (err: any) {
      console.error('Failed to update user profile:', err);
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        error,
        refreshUser: fetchCurrentUser,
        updateUser: handleUpdateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
