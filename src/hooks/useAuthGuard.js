'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export const useAuthGuard = (redirectTo = '/auth') => {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    console.log('🔐 Auth Guard - Status:', { isAuthenticated, isInitialized });
    
    // Only redirect after auth is initialized
    if (isInitialized && !isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [isAuthenticated, isInitialized, router, redirectTo]);

  return {
    isAuthenticated,
    isInitialized,
    isLoading: !isInitialized
  };
};
