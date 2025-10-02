'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchOrders } from '../../store/slices/orderSlice';
import { Package, ShoppingCart, Users, BarChart3 } from 'lucide-react';

export default function SimpleDashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.product);
  const { orders } = useSelector((state) => state.order);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    // Fetch data without workspace dependency
    dispatch(fetchProducts());
    dispatch(fetchOrders());
  }, [dispatch, isAuthenticated, router]);

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

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-500',
      link: '/dashboard/products'
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: ShoppingCart,
      color: 'bg-green-500',
      link: '/dashboard/orders'
    },
    {
      title: 'Pending Orders',
      value: orders.filter(order => order.Status === 'pending').length,
      icon: Users,
      color: 'bg-yellow-500',
      link: '/dashboard/orders'
    },
    {
      title: 'In Stock Products',
      value: products.filter(product => parseInt(product.Quantity) > 0).length,
      icon: BarChart3,
      color: 'bg-purple-500',
      link: '/dashboard/products'
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.displayName || user?.email}! Here&apos;s your business overview.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                     onClick={() => router.push(stat.link)}>
                  <div className="flex items-center">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Products Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Products</h3>
                  <button
                    onClick={() => router.push('/dashboard/products')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  Manage your product inventory, add new products, and track stock levels.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/dashboard/products')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Manage Products
                  </button>
                </div>
              </div>

              {/* Orders Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Orders</h3>
                  <button
                    onClick={() => router.push('/dashboard/orders')}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    View All
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  Track customer orders, update order status, and manage fulfillment.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/dashboard/orders')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Manage Orders
                  </button>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{user?.displayName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user?.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.role || 'user'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-medium text-xs">{user?.uid}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


