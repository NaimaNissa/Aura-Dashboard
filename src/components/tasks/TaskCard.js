'use client';

import { useDispatch } from 'react-redux';
import { Calendar, User, Flag, MoreHorizontal } from 'lucide-react';
import { updateTask } from '../../store/slices/taskSlice';

export default function TaskCard({ task, isDragging = false }) {
  const dispatch = useDispatch();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-white';
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

  const handleStatusChange = (newStatus) => {
    dispatch(updateTask({
      id: task.id,
      updates: { status: newStatus }
    }));
  };

  return (
    <div
      className={`p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        isDragging ? 'opacity-50' : ''
      } ${getPriorityColor(task.priority)}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        
        {task.assignee && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{task.assignee}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          
          {task.priority && (
            <div className="flex items-center gap-1">
              <Flag className={`w-3 h-3 ${
                task.priority === 'high' ? 'text-red-500' :
                task.priority === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`} />
              <span className="text-xs text-gray-500 capitalize">{task.priority}</span>
            </div>
          )}
        </div>

        {task.category && (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
            {task.category}
          </span>
        )}
      </div>
    </div>
  );
}

