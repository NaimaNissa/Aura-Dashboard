'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { fetchWorkspaces, createWorkspace } from '../../store/slices/workspaceSlice';

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { workspaces, currentWorkspace } = useSelector((state) => state.workspace);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (user?.uid) {
      dispatch(fetchWorkspaces(user.uid)).then((result) => {
        // If no workspaces exist, create a default one
        if (result.payload && result.payload.length === 0) {
          dispatch(createWorkspace({
            name: 'My Workspace',
            description: 'Default workspace',
            color: '#3B82F6',
            userId: user.uid
          }));
        }
      });
    }
  }, [isAuthenticated, user, dispatch, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

