'use client';

import { useSelector } from 'react-redux';

export default function AuthStatus() {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <h3 className="font-semibold text-gray-900 mb-2">Auth Status</h3>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Loading:</span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isLoading ? 'Loading...' : 'Ready'}
          </span>
        </div>
        {user && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Email:</span>
              <span className="text-xs">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Role:</span>
              <span className="text-xs">{user.role || 'user'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">UID:</span>
              <span className="text-xs font-mono">{user.uid?.substring(0, 8)}...</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


