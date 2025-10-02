'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { Calendar, User, Flag, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { updateTask, deleteTask } from '../../store/slices/taskSlice';

export default function TaskList() {
  const dispatch = useDispatch();
  const { filteredTasks } = useSelector((state) => state.task);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'in-review': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'dueDate') {
      aValue = aValue ? new Date(aValue) : new Date('9999-12-31');
      bValue = bValue ? new Date(bValue) : new Date('9999-12-31');
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleStatusChange = (taskId, newStatus) => {
    dispatch(updateTask({
      id: taskId,
      updates: { status: newStatus }
    }));
  };

  const handleDeleteTask = (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(taskId));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div 
            className="col-span-3 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort('title')}
          >
            Task {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div 
            className="col-span-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort('status')}
          >
            Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div 
            className="col-span-1 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort('priority')}
          >
            Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div 
            className="col-span-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort('assignee')}
          >
            Assignee {sortBy === 'assignee' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div 
            className="col-span-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort('dueDate')}
          >
            Due Date {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div className="col-span-1">Category</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {sortedTasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No tasks found. Create your first task!</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div key={task.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Task Title & Description */}
                <div className="col-span-3">
                  <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{task.description}</p>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(task.status)}`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="in-review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
                    <span className={`text-xs capitalize ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                {/* Assignee */}
                <div className="col-span-2">
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                        {task.assignee.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-700">{task.assignee}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Unassigned</span>
                  )}
                </div>

                {/* Due Date */}
                <div className="col-span-2">
                  {task.dueDate ? (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No due date</span>
                  )}
                </div>

                {/* Category */}
                <div className="col-span-1">
                  {task.category && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {task.category}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

