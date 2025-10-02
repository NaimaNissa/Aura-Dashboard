'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    const runDebugChecks = async () => {
      const info = {
        timestamp: new Date().toISOString(),
        checks: {}
      };

      try {
        // Check 1: Authentication State
        info.checks.authState = {
          isAuthenticated,
          user: user ? {
            uid: user.uid,
            email: user.email,
            role: user.role,
            displayName: user.displayName
          } : null
        };

        // Check 2: Firebase Auth
        const currentUser = auth.currentUser;
        info.checks.firebaseAuth = {
          currentUser: currentUser ? {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName
          } : null
        };

        // Check 3: Firebase Firestore Connection
        try {
          const testSnapshot = await getDocs(collection(db, 'test'));
          info.checks.firestoreConnection = {
            status: 'success',
            testCollectionCount: testSnapshot.size
          };
        } catch (error) {
          info.checks.firestoreConnection = {
            status: 'error',
            error: error.message
          };
        }

        // Check 4: Products Collection Access
        try {
          const productsSnapshot = await getDocs(collection(db, 'products'));
          info.checks.productsAccess = {
            status: 'success',
            count: productsSnapshot.size
          };
        } catch (error) {
          info.checks.productsAccess = {
            status: 'error',
            error: error.message
          };
        }

        // Check 5: Orders Collection Access
        try {
          const ordersSnapshot = await getDocs(collection(db, 'orders'));
          info.checks.ordersAccess = {
            status: 'success',
            count: ordersSnapshot.size
          };
        } catch (error) {
          info.checks.ordersAccess = {
            status: 'error',
            error: error.message
          };
        }

        // Check 6: User Document Access
        if (user?.uid) {
          try {
            const userSnapshot = await getDocs(collection(db, 'users'));
            const userDoc = userSnapshot.docs.find(doc => doc.id === user.uid);
            info.checks.userDocument = {
              status: 'success',
              exists: !!userDoc,
              data: userDoc ? userDoc.data() : null
            };
          } catch (error) {
            info.checks.userDocument = {
              status: 'error',
              error: error.message
            };
          }
        }

      } catch (error) {
        info.checks.generalError = error.message;
      }

      setDebugInfo(info);
      setIsLoading(false);
    };

    runDebugChecks();
  }, [isAuthenticated, user]);

  const handleGoToProducts = () => {
    router.push('/dashboard/products');
  };

  const handleGoToOrders = () => {
    router.push('/dashboard/orders');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Running debug checks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Debug Information</h1>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={handleGoToDashboard}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleGoToProducts}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Go to Products
            </button>
            <button
              onClick={handleGoToOrders}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Go to Orders
            </button>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Debug Results</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
          <div className="space-y-2 text-sm">
            {!isAuthenticated && (
              <p className="text-red-600">❌ You are not authenticated. Please log in first.</p>
            )}
            {debugInfo.checks?.firestoreConnection?.status === 'error' && (
              <p className="text-red-600">❌ Firebase Firestore connection failed. Check your Firebase configuration.</p>
            )}
            {debugInfo.checks?.productsAccess?.status === 'error' && (
              <p className="text-red-600">❌ Cannot access products collection. Check Firestore security rules.</p>
            )}
            {debugInfo.checks?.ordersAccess?.status === 'error' && (
              <p className="text-red-600">❌ Cannot access orders collection. Check Firestore security rules.</p>
            )}
            {debugInfo.checks?.userDocument?.status === 'error' && (
              <p className="text-red-600">❌ Cannot access user document. Check Firestore security rules.</p>
            )}
            {isAuthenticated && debugInfo.checks?.firestoreConnection?.status === 'success' && (
              <p className="text-green-600">✅ Firebase connection is working!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


