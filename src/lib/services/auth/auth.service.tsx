'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirebaseError } from './firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Types
interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: Error | null;
}

interface AuthContextValue extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Context
const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  initialized: false,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
    error: null,
  });
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (user) {
            const token = await user.getIdToken();
            await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            });
          }
          setState(prev => ({
            ...prev,
            user,
            loading: false,
            initialized: true,
            error: null
          }));
        } catch (error) {
          console.error('Auth state change error:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            initialized: true,
            error: error instanceof Error ? error : new Error('Authentication error')
          }));
        }
      },
      (error) => {
        console.error('Auth state observer error:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          initialized: true,
          error: error instanceof Error ? error : new Error('Authentication error')
        }));
      }
    );

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await signInWithPopup(auth, googleProvider);

      // Update user profile in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        lastSeen: serverTimestamp(),
        created_at: serverTimestamp(),
      }, { merge: true });

      // Get redirect URL from query params
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('from') || '/dashboard';

      toast.success('Successfully signed in');
      router.push(redirectTo);
    } catch (error) {
      console.error('Sign in error:', error);
      const firebaseError = handleFirebaseError(error);
      setState(prev => ({ ...prev, error: firebaseError }));
      toast.error('Sign in failed', {
        description: firebaseError.message
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [router]);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await firebaseSignOut(auth);
      await fetch('/api/auth/session', { method: 'DELETE' });

      toast.success('Successfully signed out');
      router.push('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      const firebaseError = handleFirebaseError(error);
      setState(prev => ({ ...prev, error: firebaseError }));
      toast.error('Sign out failed', {
        description: firebaseError.message
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [router]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      if (!state.user) throw new Error('No user logged in');

      setState(prev => ({ ...prev, loading: true, error: null }));
      await setDoc(doc(db, 'users', state.user.uid),
        { ...data, updated_at: serverTimestamp() },
        { merge: true }
      );

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      const firebaseError = handleFirebaseError(error);
      setState(prev => ({ ...prev, error: firebaseError }));
      toast.error('Failed to update profile', {
        description: firebaseError.message
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Route Protection HOC
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedRoute(props: P) {
    const { user, loading, initialized, error } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (error) {
        toast.error('Authentication error', {
          description: error.message
        });
      }
    }, [error]);

    useEffect(() => {
      if (initialized && !loading && !user) {
        router.push(`/auth?from=${window.location.pathname}`);
      }
    }, [user, loading, initialized, router]);

    if (!initialized || loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return user ? <Component {...props} /> : null;
  };
}

