'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Plus, Upload, Package } from 'lucide-react';
import { fetchProducts } from '../../store/slices/productSlice';
import { openModal } from '../../store/slices/uiSlice';
import SimpleNav from '../../components/SimpleNav';
import FirebaseTest from '../../components/FirebaseTest';
import ProductFilters from '../../components/products/ProductFilters';
import ProductGrid from '../../components/products/ProductGrid';
import CreateProductModal from '../../components/modals/CreateProductModal';
import BulkUploadModal from '../../components/modals/BulkUploadModal';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { filteredProducts, isLoading, error } = useSelector((state) => state.product);
  const { isAuthenticated, user, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('Products page - Auth check:', { isAuthenticated, isInitialized, user: user?.email });
    
    // Only check auth after initialization
    if (isInitialized && !isAuthenticated) {
      console.log('Not authenticated, redirecting to auth page');
      router.push('/auth');
      return;
    }
    
    console.log('Authenticated, fetching products...');
    dispatch(fetchProducts());
  }, [dispatch, isAuthenticated, isInitialized, router, user]);

  const handleCreateProduct = () => {
    dispatch(openModal('createProduct'));
  };

  const handleBulkUpload = () => {
    dispatch(openModal('bulkUpload'));
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';


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
    <div className="min-h-screen bg-gray-50">
      <SimpleNav />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              Products
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} in inventory
            </p>
          </div>

          {/* Action Buttons */}
          {isAdmin && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleBulkUpload}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Bulk Upload</span>
                <span className="sm:hidden">Upload</span>
              </button>
              <button
                onClick={handleCreateProduct}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          )}
        </div>

        {/* Firebase Test */}
        <FirebaseTest />

        {/* Filters */}
        <ProductFilters />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
            <br />
            <small>Please check your Firebase configuration and security rules.</small>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        ) : (
          <ProductGrid />
        )}

        {/* Modals */}
        {isAdmin && (
          <>
            <CreateProductModal />
            <BulkUploadModal />
          </>
        )}
      </div>
    </div>
  );
}
