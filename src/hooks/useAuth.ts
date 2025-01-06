// src/hooks/useAuth.ts
import { auth } from '@/lib/firebase/config';
import { useCallback } from 'react';

export const useAuth = () => {
  const createSessionCookie = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      const token = await currentUser.getIdToken();
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }, []);

  const clearSession = useCallback(async () => {
    try {
      await fetch('/api/auth', {
        method: 'DELETE',
      });
      await auth.signOut();
    } catch (error) {
      console.error('Error clearing session:', error);
      throw error;
    }
  }, []);

  return {
    createSessionCookie,
    clearSession,
  };
};
