'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../components/dashboard/Sidebar';
import Header from '../../../components/dashboard/Header';
import OrderFilters from '../../../components/orders/OrderFilters';
import OrderTable from '../../../components/orders/OrderTable';
import { fetchOrders } from '../../../store/slices/orderSlice';
import { ShoppingCart, Package, Truck, CheckCircle } from 'lucide-react';

export default function OrdersPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { filteredOrders, isLoading } = useSelector((state) => state.order);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    dispatch(fetchOrders());
  }, [dispatch, isAuthenticated, router]);

  // Calculate order statistics
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(order => order.Status === 'pending').length;
  const processingOrders = filteredOrders.filter(order => order.Status === 'processing').length;
  const shippedOrders = filteredOrders.filter(order => order.Status === 'shipped').length;
  const deliveredOrders = filteredOrders.filter(order => order.Status === 'delivered').length;

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending',
      value: pendingOrders,
      icon: Package,
      color: 'bg-yellow-500',
    },
    {
      title: 'Processing',
      value: processingOrders,
      icon: Truck,
      color: 'bg-orange-500',
    },
    {
      title: 'Delivered',
      value: deliveredOrders,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
  ];

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
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Orders
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track all customer orders
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
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

            {/* Filters */}
            <OrderFilters />

            {/* Orders Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading orders...</span>
              </div>
            ) : (
              <OrderTable />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
