'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useLanguage } from './LanguageContext';
import { playerApi } from '@/lib/api-client';

interface UserPreferences {
  preferredLanguage: string;
  defaultCurrency: string;
}

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (
    newPreferences: Partial<UserPreferences>
  ) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export function UserPreferencesProvider({
  children,
}: UserPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setLanguage } = useLanguage();

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await playerApi.getPreferences();

      if (response.success && response.data) {
        setPreferences(response.data);
        // Update the language context if it's different
        if (response.data.preferredLanguage) {
          setLanguage(response.data.preferredLanguage as any);
        }
      }
    } catch (err) {
      console.error('Failed to load user preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (
    newPreferences: Partial<UserPreferences>
  ) => {
    try {
      setError(null);

      const response = await playerApi.updatePreferences(newPreferences);

      if (response.success && response.data) {
        setPreferences(response.data);
        // Update the language context if language changed
        if (newPreferences.preferredLanguage) {
          setLanguage(newPreferences.preferredLanguage as any);
        }
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (err) {
      console.error('Failed to update preferences:', err);
      setError('Failed to update preferences');
      throw err;
    }
  };

  const refreshPreferences = async () => {
    await loadPreferences();
  };

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const value = {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refreshPreferences,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      'useUserPreferences must be used within a UserPreferencesProvider'
    );
  }
  return context;
}
