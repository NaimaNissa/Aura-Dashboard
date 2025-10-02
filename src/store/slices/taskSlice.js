import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Async thunks
export const createTask = createAsyncThunk(
  'task/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const newTask = {
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      
      return {
        id: docRef.id,
        ...newTask
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('workspaceId', '==', workspaceId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return tasks;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const taskRef = doc(db, 'tasks', id);
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(taskRef, updatedData);
      
      return { id, ...updatedData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tasks: [],
  filteredTasks: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    status: '',
    priority: '',
    assignee: '',
    category: ''
  },
  view: 'kanban', // 'kanban' or 'list'
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredTasks = filterTasks(state.tasks, state.filters);
    },
    setView: (state, action) => {
      state.view = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create task
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload);
        state.filteredTasks = filterTasks(state.tasks, state.filters);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
        state.filteredTasks = filterTasks(action.payload, state.filters);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...action.payload };
        }
        state.filteredTasks = filterTasks(state.tasks, state.filters);
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        state.filteredTasks = filterTasks(state.tasks, state.filters);
      })
      // Reset state on logout
      .addMatcher(
        (action) => action.type === 'RESET_STATE',
        () => initialState
      );
  },
});

// Helper function to filter tasks
function filterTasks(tasks, filters) {
  return tasks.filter(task => {
    const matchesSearch = !filters.search || 
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    const matchesAssignee = !filters.assignee || task.assignee === filters.assignee;
    const matchesCategory = !filters.category || task.category === filters.category;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesCategory;
  });
}

export const { setFilters, setView, clearError } = taskSlice.actions;
export default taskSlice.reducer;

