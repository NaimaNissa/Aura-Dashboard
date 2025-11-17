'use client';

import { useSelector, useDispatch } from 'react-redux';
import { Edit, Trash2, Eye, Package } from 'lucide-react';
import { deleteProduct, updateProduct } from '../../store/slices/productSlice';
import { openModal } from '../../store/slices/uiSlice';

// Helper function to render text with bold formatting (**text** or __text__)
const renderFormattedText = (text) => {
  if (!text) return null;
  
  // Split by **text** or __text__ patterns
  const parts = [];
  let lastIndex = 0;
  const boldPattern = /\*\*(.*?)\*\*|__(.*?)__/g;
  let match;
  
  while ((match = boldPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({ text: text.substring(lastIndex, match.index), bold: false });
    }
    // Add the bold text (match[1] for ** or match[2] for __)
    parts.push({ text: match[1] || match[2], bold: true });
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ text: text.substring(lastIndex), bold: false });
  }
  
  // If no bold formatting found, return original text
  if (parts.length === 0) {
    return text;
  }
  
  // Render parts with bold formatting
  return (
    <>
      {parts.map((part, index) => 
        part.bold ? (
          <strong key={index} className="font-semibold">{part.text}</strong>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  );
};

// Helper function to render description with bullet points and bold text support
const renderDescription = (description) => {
  if (!description) return null;
  
  // Check if description contains bullet points (lines starting with - or *)
  const lines = description.split('\n');
  const bulletLines = lines.filter(line => 
    line.trim().startsWith('-') || line.trim().startsWith('*')
  );
  const hasBulletPoints = bulletLines.length > 0;
  
  if (hasBulletPoints) {
    // Render as bullet list (limit to first 3 items for display)
    const displayItems = bulletLines.slice(0, 3).map((line, index) => {
      // Remove the bullet marker and trim
      const text = line.trim().replace(/^[-*]\s*/, '');
      return text ? (
        <li key={index} className="line-clamp-1">
          {renderFormattedText(text)}
        </li>
      ) : null;
    }).filter(Boolean);
    
    return (
      <div className="text-gray-600 text-xs sm:text-sm mb-3">
        <ul className="space-y-0.5 list-disc list-inside">
          {displayItems}
        </ul>
        {bulletLines.length > 3 && (
          <span className="text-gray-400 text-xs">+{bulletLines.length - 3} more</span>
        )}
      </div>
    );
  }
  
  // Render as regular text with bold support
  return (
    <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
      {renderFormattedText(description)}
    </p>
  );
};

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
          <div className="p-3 sm:p-4">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2">
              {product.productname}
            </h3>
            
            {renderDescription(product.Description)}

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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => handleToggleStock(product)}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm ${
                    parseInt(product.Quantity) > 0
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <span className="hidden sm:inline">
                    {parseInt(product.Quantity) > 0 ? 'Out of Stock' : 'In Stock'}
                  </span>
                  <span className="sm:hidden">
                    {parseInt(product.Quantity) > 0 ? 'Out' : 'In'}
                  </span>
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
