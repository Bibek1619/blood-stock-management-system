import { useState, useEffect } from 'react';
import { getUser, isAuthenticated, type User } from '@/lib/auth';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMounted: boolean;
}

/**
 * Custom hook for authentication that prevents hydration mismatches
 * by ensuring localStorage is only accessed after component mounts
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    try {
      const authStatus = isAuthenticated();
      const userData = getUser();
      
      setAuthenticated(authStatus);
      setUser(userData);
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isMounted]);

  return {
    user,
    isAuthenticated: authenticated,
    isLoading,
    isMounted,
  };
}