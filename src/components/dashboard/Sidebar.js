'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Plus, 
  Settings, 
  LogOut, 
  ChevronDown,
  Folder,
  BarChart3,
  Package,
  ShoppingCart
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { setCurrentWorkspace } from '../../store/slices/workspaceSlice';
import { openModal } from '../../store/slices/uiSlice';

export default function Sidebar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { workspaces, currentWorkspace } = useSelector((state) => state.workspace);
  const { sidebarOpen } = useSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/auth');
  };

  const handleWorkspaceChange = (workspace) => {
    dispatch(setCurrentWorkspace(workspace));
  };

  const handleCreateWorkspace = () => {
    dispatch(openModal('createWorkspace'));
  };

  if (!sidebarOpen) return null;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">AuraDashboard</h1>
      </div>

      {/* Workspace Selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <select
            value={currentWorkspace?.id || ''}
            onChange={(e) => {
              const workspace = workspaces.find(w => w.id === e.target.value);
              if (workspace) handleWorkspaceChange(workspace);
            }}
            className="w-full p-2 border border-gray-300 rounded-lg appearance-none bg-white pr-8"
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <button
          onClick={handleCreateWorkspace}
          className="w-full mt-2 p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Workspace
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <a
              href="/dashboard"
              className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Home className="w-5 h-5" />
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/dashboard/tasks"
              className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Folder className="w-5 h-5" />
              Tasks
            </a>
          </li>
          <li>
            <a
              href="/dashboard/products"
              className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Package className="w-5 h-5" />
              Products
            </a>
          </li>
          <li>
            <a
              href="/dashboard/orders"
              className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Orders
            </a>
          </li>
          <li>
            <a
              href="/dashboard/analytics"
              className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </a>
          </li>
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

