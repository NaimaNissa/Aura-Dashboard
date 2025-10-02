'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, LogOut, User, Users, FileText, Truck } from 'lucide-react';
import { logoutUser } from '../store/slices/authSlice';

export default function SimpleNav() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/auth');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">AuraDashboard</h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <a
              href="/products"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium"
            >
              <Package className="w-4 h-4" />
              Products
            </a>
            <a
              href="/orders"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              Orders
            </a>
            <a
              href="/customers"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              Customers
            </a>
            <a
              href="/invoices"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              Invoices
            </a>
            <a
              href="/shipments"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium"
            >
              <Truck className="w-4 h-4" />
              Shipments
            </a>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.displayName}</p>
                <p className="text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
