'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, LogOut, User, Users, FileText, Truck, MessageSquare, Mail, Image, Globe, FolderOpen, UserCheck, Palette, Menu, X } from 'lucide-react';
import { logoutUser } from '../store/slices/authSlice';
import NotificationCenter from './NotificationCenter';

export default function SimpleNav() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/auth');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    { href: '/products', icon: Package, label: 'Products' },
    { href: '/categories', icon: FolderOpen, label: 'Categories' },
    { href: '/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/customers', icon: Users, label: 'Customers' },
    { href: '/invoices', icon: FileText, label: 'Invoices' },
    { href: '/shipments', icon: Truck, label: 'Shipments' },
    { href: '/reviews', icon: MessageSquare, label: 'Reviews' },
    { href: '/contact-messages', icon: Mail, label: 'Messages' },
    { href: '/product-images', icon: Image, label: 'Images' },
    { href: '/shipping-costs', icon: Globe, label: 'Shipping' },
    { href: '/user-approvals', icon: UserCheck, label: 'Approvals' }
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">AuraDashboard</h1>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <NotificationCenter />
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-gray-900 p-1"
              title="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 p-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-wrap gap-1 lg:gap-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
                >
                  <IconComponent className="w-3 h-3" />
                  <span className="hidden lg:inline">{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-2">
            <NotificationCenter />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <div className="text-xs hidden lg:block">
                  <p className="font-medium text-gray-900 truncate max-w-20">{user?.displayName}</p>
                  <p className="text-gray-500 truncate max-w-20">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="py-2 space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
