'use client';

import { useSelector, useDispatch } from 'react-redux';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import TaskCard from './TaskCard';
import { updateTask } from '../../store/slices/taskSlice';
import { Plus } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'in-review', title: 'In Review', color: 'bg-yellow-100' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100' },
];

function SortableTaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3"
    >
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  );
}

function KanbanColumn({ column, tasks }) {
  const dispatch = useDispatch();

  return (
    <div className="flex-1 min-w-80">
      <div className={`p-4 rounded-lg ${column.color} mb-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">{column.title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{tasks.length}</span>
            <button className="p-1 hover:bg-white hover:bg-opacity-50 rounded">
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 min-h-96">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const dispatch = useDispatch();
  const { filteredTasks } = useSelector((state) => state.task);
  const [activeTask, setActiveTask] = useState(null);

  const handleDragStart = (event) => {
    const { active } = event;
    const task = filteredTasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeTask = filteredTasks.find(t => t.id === active.id);
    const overColumn = COLUMNS.find(col => over.id.includes(col.id));
    
    if (activeTask && overColumn && activeTask.status !== overColumn.id) {
      dispatch(updateTask({
        id: activeTask.id,
        updates: { status: overColumn.id }
      }));
    }

    setActiveTask(null);
  };

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => task.status === status);
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6">
        {COLUMNS.map((column) => (
          <div key={column.id} id={`column-${column.id}`}>
            <KanbanColumn
              column={column}
              tasks={getTasksByStatus(column.id)}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

