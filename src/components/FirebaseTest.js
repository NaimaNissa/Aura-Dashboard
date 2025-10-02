'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function FirebaseTest() {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing Firebase connection...');
    
    try {
      // Test 1: Try to read from products collection
      console.log('Testing Firebase read access...');
      const productsSnapshot = await getDocs(collection(db, 'products'));
      console.log('Products collection accessible, count:', productsSnapshot.size);
      
      // Test 2: Try to write a test document
      console.log('Testing Firebase write access...');
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'Firebase connection test',
        timestamp: new Date().toISOString()
      });
      console.log('Test document created with ID:', testDoc.id);
      
      setTestResult('✅ Firebase connection successful! Both read and write operations work.');
    } catch (error) {
      console.error('Firebase test failed:', error);
      setTestResult(`❌ Firebase test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Firebase Connection Test</h3>
      <button
        onClick={testFirebaseConnection}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Firebase Connection'}
      </button>
      {testResult && (
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <pre className="text-sm">{testResult}</pre>
        </div>
      )}
    </div>
  );
}