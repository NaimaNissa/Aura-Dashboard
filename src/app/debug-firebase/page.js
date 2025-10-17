'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

export default function DebugFirebase() {
  const [authStatus, setAuthStatus] = useState('Checking...');
  const [firestoreStatus, setFirestoreStatus] = useState('Checking...');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Test Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthStatus(`✅ Authenticated: ${user.email}`);
      } else {
        setAuthStatus('❌ Not authenticated');
      }
    });

    // Test Firestore
    const testFirestore = async () => {
      try {
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        setFirestoreStatus('✅ Firestore connection working');
      } catch (err) {
        setFirestoreStatus(`❌ Firestore error: ${err.message}`);
        setError(err.message);
      }
    };

    testFirestore();

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Firebase Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-2">Firebase Auth Status:</h2>
          <p className="text-gray-700">{authStatus}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-2">Firestore Status:</h2>
          <p className="text-gray-700">{firestoreStatus}</p>
        </div>

        {error && (
          <div className="bg-red-100 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-red-800">Error Details:</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6">
          <button 
            onClick={() => window.location.href = '/'} 
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
