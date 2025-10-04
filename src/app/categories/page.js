'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Package, Eye, EyeOff } from 'lucide-react';
import SimpleNav from '../../components/SimpleNav';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📦',
    color: '#3B82F6',
    isActive: true
  });

  // Predefined icons for categories
  const categoryIcons = [
    '📱', '💻', '🎧', '📷', '⌚', '🎮', '🔌', '🔋', '📺', '🖥️',
    '⌨️', '🖱️', '📞', '📠', '💾', '💿', '🔊', '🎵', '📻', '📹',
    '📷', '🔍', '💡', '🔧', '⚡', '🔌', '📡', '🛰️', '🎯', '📊'
  ];

  // Predefined colors for categories
  const categoryColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5A2B', '#64748B', '#0EA5E9'
  ];

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('📁 Loading categories...');
      
      const { getAllCategories } = await import('../../lib/categoryService');
      const categoriesData = await getAllCategories();
      
      console.log('📁 Categories loaded:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setError('Failed to load categories: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      console.log('📁 Creating category:', formData);
      
      const { createCategory } = await import('../../lib/categoryService');
      const newCategory = await createCategory(formData);
      
      setCategories(prev => [...prev, newCategory]);
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        icon: '📦',
        color: '#3B82F6',
        isActive: true
      });
      setSuccess('Category created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('❌ Error creating category:', error);
      setError('Failed to create category: ' + error.message);
    }
  };

  // Update category
  const handleUpdateCategory = async (categoryId, updateData) => {
    try {
      setError(null);
      console.log('📁 Updating category:', categoryId, updateData);
      
      const { updateCategory } = await import('../../lib/categoryService');
      const updatedCategory = await updateCategory(categoryId, updateData);
      
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId ? { ...cat, ...updateData } : cat
        )
      );
      setEditingCategory(null);
      setSuccess('Category updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('❌ Error updating category:', error);
      setError('Failed to update category: ' + error.message);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      console.log('📁 Deleting category:', categoryId);
      
      const { deleteCategory } = await import('../../lib/categoryService');
      await deleteCategory(categoryId);
      
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setSuccess('Category deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      setError('Failed to delete category: ' + error.message);
    }
  };

  // Toggle category active status
  const handleToggleActive = async (categoryId, currentStatus) => {
    try {
      setError(null);
      const newStatus = !currentStatus;
      
      await handleUpdateCategory(categoryId, { isActive: newStatus });
    } catch (error) {
      console.error('❌ Error toggling category status:', error);
      setError('Failed to update category status: ' + error.message);
    }
  };

  // Start editing
  const startEditing = (category) => {
    setEditingCategory(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📦',
      color: category.color || '#3B82F6',
      isActive: category.isActive
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '📦',
      color: '#3B82F6',
      isActive: true
    });
  };

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600 mt-2">Manage product categories for your store</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Create Category Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Smartphones, Laptops"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the category"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                      maxLength="2"
                    />
                    <div className="flex flex-wrap gap-1">
                      {categoryIcons.slice(0, 10).map((icon, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon })}
                          className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-1">
                      {categoryColors.slice(0, 8).map((color, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  Active (visible on website)
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Create Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading categories...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All Categories ({categories.length})
              </h2>
            </div>
            
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first category</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Category
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingCategory === category.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <input
                                type="text"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-8 px-1 py-1 border border-gray-300 rounded text-center"
                                maxLength="2"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                                style={{ backgroundColor: category.color }}
                              >
                                {category.icon}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {category.name}
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingCategory === category.id ? (
                            <input
                              type="text"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <div className="text-sm text-gray-600">
                              {category.description || 'No description'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {category.productCount || 0} products
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingCategory === category.id ? (
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="mr-2"
                              />
                              <span className="text-sm">Active</span>
                            </label>
                          ) : (
                            <button
                              onClick={() => handleToggleActive(category.id, category.isActive)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                category.isActive
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {category.isActive ? (
                                <>
                                  <Eye className="w-3 h-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingCategory === category.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleUpdateCategory(category.id, formData)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEditing(category)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
