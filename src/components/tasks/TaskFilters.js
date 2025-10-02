'use client';

import { useSelector, useDispatch } from 'react-redux';
import { Search, Filter, X } from 'lucide-react';
import { setFilters } from '../../store/slices/taskSlice';

export default function TaskFilters() {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.task);
  const { tasks } = useSelector((state) => state.task);

  // Get unique values for filter options
  const uniqueAssignees = [...new Set(tasks.map(task => task.assignee).filter(Boolean))];
  const uniqueCategories = [...new Set(tasks.map(task => task.category).filter(Boolean))];

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const clearFilters = () => {
    dispatch(setFilters({
      search: '',
      status: '',
      priority: '',
      assignee: '',
      category: ''
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
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="in-review">In Review</option>
          <option value="completed">Completed</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Assignee Filter */}
        <select
          value={filters.assignee}
          onChange={(e) => handleFilterChange('assignee', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Assignees</option>
          {uniqueAssignees.map((assignee) => (
            <option key={assignee} value={assignee}>
              {assignee}
            </option>
          ))}
        </select>

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
          {filters.status && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Status: {filters.status}
            </span>
          )}
          {filters.priority && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Priority: {filters.priority}
            </span>
          )}
          {filters.assignee && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Assignee: {filters.assignee}
            </span>
          )}
          {filters.category && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Category: {filters.category}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
