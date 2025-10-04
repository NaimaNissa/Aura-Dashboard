'use client';

import { useSelector, useDispatch } from 'react-redux';
import { Search, Filter, X } from 'lucide-react';
import { setFilters } from '../../store/slices/productSlice';

export default function ProductFilters() {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.product);
  const { products } = useSelector((state) => state.product);

  // Get unique values for filter options
  const uniqueCategories = [...new Set(products.map(product => product.category).filter(Boolean))];

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const clearFilters = () => {
    dispatch(setFilters({
      search: '',
      category: '',
      priceRange: '',
      inStock: ''
    }));
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Stock Filter */}
        <select
          value={filters.inStock}
          onChange={(e) => handleFilterChange('inStock', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Stock</option>
          <option value="in-stock">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.search && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Search: &quot;{filters.search}&quot;
            </span>
          )}
          {filters.category && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Category: {filters.category}
            </span>
          )}
          {filters.inStock && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Stock: {filters.inStock}
            </span>
          )}
        </div>
      )}
    </div>
  );
}










