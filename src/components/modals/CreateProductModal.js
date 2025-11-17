'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Package, DollarSign, Hash, Palette, FileText, Star, FolderOpen, Plus, Trash2, Truck } from 'lucide-react';
import { createProduct, updateProduct } from '../../store/slices/productSlice';
import { closeModal } from '../../store/slices/uiSlice';
import { collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getActiveCategories } from '../../lib/categoryService';

export default function CreateProductModal() {
  const dispatch = useDispatch();
  const { modals } = useSelector((state) => state.ui);
  const { isLoading } = useSelector((state) => state.product);
  
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load categories
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await getActiveCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

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
    tax: [], // Array of {quantity: number, taxAmount: number}
    discount: '', // Discount percentage (0-100)
    freeShipping: false, // Free shipping option
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  // Handle tax entries
  const handleAddTaxEntry = () => {
    setFormData({
      ...formData,
      tax: [...formData.tax, { quantity: '', taxAmount: '' }]
    });
  };

  const handleTaxChange = (index, field, value) => {
    const updatedTax = [...formData.tax];
    updatedTax[index] = {
      ...updatedTax[index],
      [field]: field === 'quantity' ? parseInt(value) || '' : parseFloat(value) || ''
    };
    setFormData({
      ...formData,
      tax: updatedTax
    });
  };

  const handleRemoveTaxEntry = (index) => {
    const updatedTax = formData.tax.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      tax: updatedTax
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productname.trim() || !formData.Price.trim()) return;

    // Calculate originalPrice from discount if discount is set
    let originalPrice = formData.Price;
    if (formData.discount && parseFloat(formData.discount) > 0) {
      const discountPercent = parseFloat(formData.discount) / 100;
      const price = parseFloat(formData.Price);
      originalPrice = (price / (1 - discountPercent)).toFixed(2);
    }

    const productData = {
      ...formData,
      Price: formData.Price,
      Quantity: formData.Quantity || '0',
      discount: formData.discount || '',
      originalPrice: formData.discount && parseFloat(formData.discount) > 0 ? originalPrice : '',
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
      tax: [],
      discount: '',
      freeShipping: false,
    });
  };

  // Load categories when modal opens
  useEffect(() => {
    if (modals.createProduct) {
      loadCategories();
    }
  }, [modals.createProduct]);

  // Load edit data if editing
  useEffect(() => {
    if (modals.createProductData) {
      // Handle both old format (string/number) and new format (array)
      let taxData = modals.createProductData.tax || [];
      if (typeof taxData === 'string' || typeof taxData === 'number') {
        // Convert old format to new format - create entry for quantity 1
        taxData = [{ quantity: 1, taxAmount: parseFloat(taxData) || 0 }];
      } else if (!Array.isArray(taxData)) {
        taxData = [];
      }

      // Calculate discount from originalPrice if discount not set
      let discountValue = modals.createProductData.discount || '';
      if (!discountValue && modals.createProductData.originalPrice && modals.createProductData.Price) {
        const originalPrice = parseFloat(modals.createProductData.originalPrice);
        const price = parseFloat(modals.createProductData.Price);
        if (originalPrice > price) {
          discountValue = (((originalPrice - price) / originalPrice) * 100).toFixed(2);
        }
      }

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
        tax: taxData,
        discount: discountValue,
        freeShipping: modals.createProductData.freeShipping || false,
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
              rows={4}
              value={formData.Description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Enter product description. Use **text** for bold, or start lines with - or * for bullets"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tips: Use <strong>**text**</strong> or <strong>__text__</strong> for bold text. Start lines with &quot;-&quot; or &quot;*&quot; to create bullet points.
            </p>
          </div>

          {/* Price, Quantity, and Discount */}
          <div className="grid grid-cols-3 gap-4">
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

            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                id="discount"
                name="discount"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="0"
              />
              {formData.discount && parseFloat(formData.discount) > 0 && formData.Price && (
                <p className="text-xs text-gray-500 mt-1">
                  Original: ${(parseFloat(formData.Price) / (1 - parseFloat(formData.discount) / 100)).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Tax by Quantity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Tax Amount by Quantity
              </label>
              <button
                type="button"
                onClick={handleAddTaxEntry}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Tax Entry
              </button>
            </div>
            
            {formData.tax.length === 0 ? (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="text-sm text-gray-500 mb-2">No tax entries added</p>
                <p className="text-xs text-gray-400">Click &quot;Add Tax Entry&quot; to set tax for specific quantities</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.tax.map((taxEntry, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={taxEntry.quantity || ''}
                          onChange={(e) => handleTaxChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                          placeholder="e.g., 1, 2, 3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Tax Amount ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={taxEntry.taxAmount || ''}
                          onChange={(e) => handleTaxChange(index, 'taxAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTaxEntry(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove this tax entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">
                💡 How it works:
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Add tax entries for specific quantities (e.g., Qty 1 = $5.00, Qty 2 = $10.00)</li>
                <li>• Tax will be applied based on the quantity customer selects</li>
                <li>• If quantity doesn&apos;t match any entry, the closest lower quantity&apos;s tax will be used</li>
                <li>• Example: If you set Qty 1 = $5 and Qty 3 = $15, then Qty 2 will use $5 tax</li>
              </ul>
            </div>
          </div>

          {/* Free Shipping Option */}
          <div className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
            <input
              type="checkbox"
              id="freeShipping"
              name="freeShipping"
              checked={formData.freeShipping}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="freeShipping" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <Truck className="w-4 h-4 text-green-600" />
              <span>Enable Free Shipping for this product</span>
            </label>
          </div>
          {formData.freeShipping && (
            <p className="text-xs text-green-600 ml-1">
              ✓ This product will show &quot;Free Shipping&quot; badge and customers won&apos;t be charged shipping for this item
            </p>
          )}

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
                <FolderOpen className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                disabled={loadingCategories}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {loadingCategories && (
                <p className="text-sm text-gray-500 mt-1">Loading categories...</p>
              )}
              {categories.length === 0 && !loadingCategories && (
                <p className="text-sm text-gray-500 mt-1">
                  No categories found. <a href="/categories" className="text-blue-600 hover:underline">Create one first</a>
                </p>
              )}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label htmlFor="Colors" className="block text-sm font-medium text-gray-700 mb-1">
              <Palette className="w-4 h-4 inline mr-1" />
              Product Colors
            </label>
            <input
              id="Colors"
              name="Colors"
              type="text"
              value={formData.Colors}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="e.g., Black, White, Red, Blue (separate with commas)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter colors separated by commas (e.g., Black, White, Red, Blue)
            </p>
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
              rows={4}
              value={formData.KeyFeatures}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Enter key features separated by commas (e.g., High Resolution Camera, Fast Processor, Long Battery Life, 5G Connectivity)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate each feature with a comma. Features will be displayed as individual items on the product page.
            </p>
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
