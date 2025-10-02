'use client';

import { useSelector, useDispatch } from 'react-redux';
import { Edit, Trash2, Eye, Package } from 'lucide-react';
import { deleteProduct, updateProduct } from '../../store/slices/productSlice';
import { openModal } from '../../store/slices/uiSlice';

export default function ProductGrid() {
  const dispatch = useDispatch();
  const { filteredProducts } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === 'admin';

  const handleEdit = (product) => {
    dispatch(openModal({ type: 'createProduct', data: product }));
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(productId));
    }
  };

  const handleToggleStock = (product) => {
    const newQuantity = parseInt(product.Quantity) > 0 ? '0' : '10';
    dispatch(updateProduct({
      id: product.id,
      updates: { Quantity: newQuantity }
    }));
  };

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Get started by adding your first product.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 relative">
            {product.productImg ? (
              <img
                src={product.productImg}
                alt={product.productname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Stock Badge */}
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                parseInt(product.Quantity) > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {parseInt(product.Quantity) > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
              {product.productname}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.Description}
            </p>

            {/* Product Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price:</span>
                <span className="font-medium text-gray-900">${product.Price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quantity:</span>
                <span className="font-medium text-gray-900">{product.Quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ID:</span>
                <span className="font-medium text-gray-900">{product.productID}</span>
              </div>
            </div>

            {/* Colors */}
            {product.Colors && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">Colors:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.Colors.split(',').map((color, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {color.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Features */}
            {product.KeyFeatures && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">Key Features:</span>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {product.KeyFeatures}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStock(product)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    parseInt(product.Quantity) > 0
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {parseInt(product.Quantity) > 0 ? 'Out of Stock' : 'In Stock'}
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
