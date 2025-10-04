'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { setUser, setInitialized } from '../../store/slices/authSlice';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 Firebase Auth State Changed:', user ? 'LOGGED IN' : 'LOGGED OUT');
      
      if (user) {
        // Set user data immediately - no Firestore dependency
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL,
          role: 'admin' // Default everyone to admin for now
        };
        
        console.log('✅ Setting user data:', userData);
        dispatch(setUser(userData));
      } else {
        console.log('❌ Clearing user data and resetting state');
        // Clear user and reset all state
        dispatch(setUser(null));
        dispatch({ type: 'RESET_STATE' });
      }
      
      setIsInitialized(true);
      dispatch(setInitialized(true));
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Show loading until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

