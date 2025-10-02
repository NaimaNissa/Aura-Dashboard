'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser } from '../../store/slices/authSlice';

export default function TestAuthPage() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authState, setAuthState] = useState('checking');
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase auth state changed:', user);
      setFirebaseUser(user);
      setAuthState(user ? 'authenticated' : 'not-authenticated');
      
      if (user) {
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user'
        }));
      } else {
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleLogin = () => {
    window.location.href = '/auth';
  };

  const handleTestProducts = () => {
    window.location.href = '/dashboard/products';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Firebase Auth Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Firebase Auth Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  authState === 'authenticated' ? 'bg-green-100 text-green-800' :
                  authState === 'not-authenticated' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {authState}
                </span>
              </div>
              {firebaseUser && (
                <>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-sm">{firebaseUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UID:</span>
                    <span className="text-sm font-mono">{firebaseUser.uid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Display Name:</span>
                    <span className="text-sm">{firebaseUser.displayName || 'Not set'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Redux Auth Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Redux Auth Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Authenticated:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              {user && (
                <>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <span className="text-sm">{user.role || 'user'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UID:</span>
                    <span className="text-sm font-mono">{user.uid}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="flex gap-4">
            {!isAuthenticated ? (
              <button
                onClick={handleLogin}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Go to Login
              </button>
            ) : (
              <button
                onClick={handleTestProducts}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Test Products Page
              </button>
            )}
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify({
              firebaseUser: firebaseUser ? {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName
              } : null,
              reduxUser: user,
              isAuthenticated,
              authState
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}


