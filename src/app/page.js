'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    console.log('🏠 Home page - Auth status:', { isAuthenticated, isInitialized });
    
    // Only redirect after auth is initialized
    if (isInitialized) {
      if (isAuthenticated) {
        router.push('/products');
      } else {
        router.push('/auth');
      }
    }
  }, [isAuthenticated, isInitialized, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

