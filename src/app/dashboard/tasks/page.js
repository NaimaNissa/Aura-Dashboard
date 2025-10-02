'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import TaskFilters from '../../../components/tasks/TaskFilters';
import KanbanBoard from '../../../components/tasks/KanbanBoard';
import TaskList from '../../../components/tasks/TaskList';
import CreateTaskModal from '../../../components/modals/CreateTaskModal';
import { fetchTasks, setView } from '../../../store/slices/taskSlice';
import { LayoutGrid, List } from 'lucide-react';

export default function TasksPage() {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { view, filteredTasks } = useSelector((state) => state.task);

  useEffect(() => {
    if (currentWorkspace?.id) {
      dispatch(fetchTasks(currentWorkspace.id));
    }
  }, [currentWorkspace, dispatch]);

  const handleViewChange = (newView) => {
    dispatch(setView(newView));
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} in {currentWorkspace?.name}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewChange('kanban')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'kanban'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4 inline mr-2" />
              Kanban
            </button>
            <button
              onClick={() => handleViewChange('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4 inline mr-2" />
              List
            </button>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters />

        {/* Task View */}
        {view === 'kanban' ? <KanbanBoard /> : <TaskList />}

        {/* Modals */}
        <CreateTaskModal />
      </div>
    </DashboardLayout>
  );
}

import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const handleLogout = async () => {
  await signOut(auth);
  window.location.href = '/login'; // Redirect
};

// Usage
<button onClick={handleLogout} className="text-red-600 font-semibold">Logout</button>
