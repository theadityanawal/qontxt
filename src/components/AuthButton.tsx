'use client';
import { useState, useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AuthButton() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);

      // Create/update user document
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        created_at: serverTimestamp(),
        last_login: serverTimestamp(),
        base_resume_id: null
      }, { merge: true });

    } catch (error) {
      console.error('Google sign-in error:', error);
      alert(`Authentication failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      alert(`Sign out failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-buttons">
      {user ? (
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="sign-out-btn"
        >
          {loading ? 'Signing out...' : 'Sign Out'}
        </button>
      ) : (
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="google-signin-btn"
        >
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
      )}
    </div>
  );
}
