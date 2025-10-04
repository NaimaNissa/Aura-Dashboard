'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, LogOut, User, Users, FileText, Truck, MessageSquare, Mail, Image, Globe, FolderOpen, UserCheck } from 'lucide-react';
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
          <div className="flex items-center flex-wrap gap-1 lg:gap-2">
            <a
              href="/products"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 px-1.5 py-1.5 rounded text-xs font-medium"
            >
              <Package className="w-3 h-3" />
              <span className="hidden md:inline">Products</span>
            </a>
            <a
              href="/categories"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 px-1.5 py-1.5 rounded text-xs font-medium"
            >
              <FolderOpen className="w-3 h-3" />
              <span className="hidden md:inline">Categories</span>
            </a>
            <a
              href="/orders"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 px-1.5 py-1.5 rounded text-xs font-medium"
            >
              <ShoppingCart className="w-3 h-3" />
              <span className="hidden md:inline">Orders</span>
            </a>
            <a
              href="/customers"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 px-1.5 py-1.5 rounded text-xs font-medium"
            >
              <Users className="w-3 h-3" />
              <span className="hidden md:inline">Customers</span>
            </a>
            <a
              href="/invoices"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 px-1.5 py-1.5 rounded text-xs font-medium"
            >
              <FileText className="w-3 h-3" />
              <span className="hidden md:inline">Invoices</span>
            </a>
            <a
              href="/shipments"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 px-1.5 py-1.5 rounded text-xs font-medium"
            >
              <Truck className="w-3 h-3" />
              <span className="hidden md:inline">Shipments</span>
            </a>
            <a
              href="/reviews"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 px-1.5 py-1.5 rounded text-xs font-medium"
            >
              <MessageSquare className="w-3 h-3" />
              <span className="hidden md:inline">Reviews</span>
            </a>
            <a
              href="/contact-messages"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 px-1.5 py-1.5 rounded text-xs font-medium"
            >
              <Mail className="w-3 h-3" />
              <span className="hidden md:inline">Messages</span>
            </a>
            <a
              href="/product-images"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 px-1.5 py-1.5 rounded text-xs font-medium"
            >
              <Image className="w-3 h-3" />
              <span className="hidden md:inline">Images</span>
            </a>
            <a
              href="/shipping-costs"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 px-1.5 py-1.5 rounded text-xs font-medium"
            >
              <Globe className="w-3 h-3" />
              <span className="hidden md:inline">Shipping</span>
            </a>
            <a
              href="/user-approvals"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 px-1.5 py-1.5 rounded text-xs font-medium"
            >
              <UserCheck className="w-3 h-3" />
              <span className="hidden md:inline">Approvals</span>
            </a>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <div className="text-xs hidden lg:block">
                <p className="font-medium text-gray-900 truncate max-w-16">{user?.displayName}</p>
                <p className="text-gray-500 truncate max-w-16">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600 flex items-center gap-1 px-1.5 py-1.5 rounded text-xs font-medium"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
