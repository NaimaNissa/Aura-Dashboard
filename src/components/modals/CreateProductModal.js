'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Package, DollarSign, Hash, Palette, FileText, Star } from 'lucide-react';
import { createProduct, updateProduct } from '../../store/slices/productSlice';
import { closeModal } from '../../store/slices/uiSlice';

export default function CreateProductModal() {
  const dispatch = useDispatch();
  const { modals } = useSelector((state) => state.ui);
  const { isLoading } = useSelector((state) => state.product);

  const [formData, setFormData] = useState({
    productname: '',
    brand: '',
    Description: '',
    Price: '',
    Quantity: '',
    productID: '',
    productImg: '',
    Colors: '',
    KeyFeatures: '',
    category: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productname.trim() || !formData.Price.trim()) return;

    const productData = {
      ...formData,
      Price: formData.Price,
      Quantity: formData.Quantity || '0',
    };

    if (modals.createProductData) {
      dispatch(updateProduct({
        id: modals.createProductData.id,
        updates: productData
      })).then(() => {
        handleClose();
      });
    } else {
      dispatch(createProduct(productData)).then(() => {
        handleClose();
      });
    }
  };

  const handleClose = () => {
    dispatch(closeModal('createProduct'));
    setFormData({
      productname: '',
      brand: '',
      Description: '',
      Price: '',
      Quantity: '',
      productID: '',
      productImg: '',
      Colors: '',
      KeyFeatures: '',
      category: '',
    });
  };

  // Load edit data if editing
  React.useEffect(() => {
    if (modals.createProductData) {
      setFormData({
        productname: modals.createProductData.productname || '',
        brand: modals.createProductData.brand || '',
        Description: modals.createProductData.Description || '',
        Price: modals.createProductData.Price || '',
        Quantity: modals.createProductData.Quantity || '',
        productID: modals.createProductData.productID || '',
        productImg: modals.createProductData.productImg || '',
        Colors: modals.createProductData.Colors || '',
        KeyFeatures: modals.createProductData.KeyFeatures || '',
        category: modals.createProductData.category || '',
      });
    }
  }, [modals.createProductData]);

  if (!modals.createProduct) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            {modals.createProductData ? 'Edit Product' : 'Create New Product'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Name and ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="productname" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                id="productname"
                name="productname"
                type="text"
                required
                value={formData.productname}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                <Package className="w-4 h-4 inline mr-1" />
                Brand
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter brand name"
              />
            </div>
          </div>

          {/* Product ID */}
            <div>
            <label htmlFor="productID" className="block text-sm font-medium text-gray-700 mb-1">
              <Hash className="w-4 h-4 inline mr-1" />
              Product ID
            </label>
              <input
                id="productID"
                name="productID"
                type="text"
                value={formData.productID}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter product ID"
              />
            </div>

          {/* Description */}
          <div>
            <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Description
            </label>
            <textarea
              id="Description"
              name="Description"
              rows={3}
              value={formData.Description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Enter product description"
            />
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="Price" className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Price *
              </label>
              <input
                id="Price"
                name="Price"
                type="number"
                step="0.01"
                required
                value={formData.Price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="Quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                id="Quantity"
                name="Quantity"
                type="number"
                value={formData.Quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="0"
              />
            </div>
          </div>

          {/* Image URL and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="productImg" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                id="productImg"
                name="productImg"
                type="url"
                value={formData.productImg}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="e.g., Electronics, Clothing"
              />
            </div>
          </div>

          {/* Colors */}
          <div>
            <label htmlFor="Colors" className="block text-sm font-medium text-gray-700 mb-1">
              <Palette className="w-4 h-4 inline mr-1" />
              Colors (comma separated)
            </label>
            <input
              id="Colors"
              name="Colors"
              type="text"
              value={formData.Colors}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Red, Blue, Green"
            />
          </div>

          {/* Key Features */}
          <div>
            <label htmlFor="KeyFeatures" className="block text-sm font-medium text-gray-700 mb-1">
              <Star className="w-4 h-4 inline mr-1" />
              Key Features
            </label>
            <textarea
              id="KeyFeatures"
              name="KeyFeatures"
              rows={3}
              value={formData.KeyFeatures}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Enter key features of the product"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.productname.trim() || !formData.Price.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : (modals.createProductData ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
