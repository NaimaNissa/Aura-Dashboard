'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Package, DollarSign, Hash, Palette, FileText, Star, FolderOpen, Plus, Trash2, Edit3, Save } from 'lucide-react';
import { createProduct, updateProduct } from '../../store/slices/productSlice';
import { closeModal } from '../../store/slices/uiSlice';
import { collection, getDocs, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getActiveCategories } from '../../lib/categoryService';

export default function CreateProductModal() {
  const dispatch = useDispatch();
  const { modals } = useSelector((state) => state.ui);
  const { isLoading } = useSelector((state) => state.product);
  
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [colorOptions, setColorOptions] = useState([]);
  const [loadingColors, setLoadingColors] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000', displayName: '' });

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

  // Load color options
  const loadColorOptions = async () => {
    try {
      setLoadingColors(true);
      const colorsRef = collection(db, 'colorOptions');
      const q = query(colorsRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      const colorsData = [];
      snapshot.forEach((doc) => {
        colorsData.push({ id: doc.id, ...doc.data() });
      });
      
      setColorOptions(colorsData);
    } catch (error) {
      console.error('Error loading color options:', error);
    } finally {
      setLoadingColors(false);
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
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Color management functions
  const handleAddColor = async () => {
    if (!newColor.name.trim() || !newColor.displayName.trim()) return;
    
    try {
      const colorData = {
        name: newColor.name.toLowerCase().replace(/\s+/g, ''),
        displayName: newColor.displayName,
        hex: newColor.hex,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'colorOptions'), colorData);
      setNewColor({ name: '', hex: '#000000', displayName: '' });
      loadColorOptions(); // Reload colors
    } catch (error) {
      console.error('Error adding color:', error);
    }
  };

  const handleEditColor = (color) => {
    setEditingColor(color);
    setNewColor({
      name: color.name,
      hex: color.hex,
      displayName: color.displayName
    });
  };

  const handleUpdateColor = async () => {
    if (!editingColor || !newColor.name.trim() || !newColor.displayName.trim()) return;
    
    try {
      const colorData = {
        name: newColor.name.toLowerCase().replace(/\s+/g, ''),
        displayName: newColor.displayName,
        hex: newColor.hex,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'colorOptions', editingColor.id), colorData);
      setEditingColor(null);
      setNewColor({ name: '', hex: '#000000', displayName: '' });
      loadColorOptions(); // Reload colors
    } catch (error) {
      console.error('Error updating color:', error);
    }
  };

  const handleDeleteColor = async (colorId) => {
    if (!confirm('Are you sure you want to delete this color?')) return;
    
    try {
      await deleteDoc(doc(db, 'colorOptions', colorId));
      loadColorOptions(); // Reload colors
    } catch (error) {
      console.error('Error deleting color:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingColor(null);
    setNewColor({ name: '', hex: '#000000', displayName: '' });
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

  // Load categories and colors when modal opens
  useEffect(() => {
    if (modals.createProduct) {
      loadCategories();
      loadColorOptions();
    }
  }, [modals.createProduct]);

  // Load edit data if editing
  useEffect(() => {
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

          {/* Color Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Product Colors
            </label>
            
            {/* Selected Colors Display */}
            <div className="mb-3">
              <input
                type="text"
                value={formData.Colors}
                onChange={(e) => setFormData({ ...formData, Colors: e.target.value })}
                placeholder="e.g., Black, White, Red, Blue (separate with commas)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter colors separated by commas (e.g., Black, White, Red, Blue)
              </p>
            </div>

            {/* Color Management Section */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Manage Color Options
              </h4>
              
              {/* Add/Edit Color Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Color name (e.g., black)"
                  value={newColor.name}
                  onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
                <input
                  type="text"
                  placeholder="Display name (e.g., Black)"
                  value={newColor.displayName}
                  onChange={(e) => setNewColor({ ...newColor, displayName: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
                <input
                  type="color"
                  value={newColor.hex}
                  onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  {editingColor ? (
                    <>
                      <button
                        type="button"
                        onClick={handleUpdateColor}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Color Options List */}
              <div className="max-h-40 overflow-y-auto">
                {loadingColors ? (
                  <p className="text-sm text-gray-500">Loading colors...</p>
                ) : colorOptions.length === 0 ? (
                  <p className="text-sm text-gray-500">No colors available. Add some colors above.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {colorOptions.map((color) => (
                      <div key={color.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: color.hex }}
                          ></div>
                          <span className="text-sm font-medium">{color.displayName}</span>
                          <span className="text-xs text-gray-500">({color.name})</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditColor(color)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteColor(color.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
