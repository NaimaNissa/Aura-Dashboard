import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Async thunks
export const createWorkspace = createAsyncThunk(
  'workspace/createWorkspace',
  async ({ name, description, color, userId }, { rejectWithValue }) => {
    try {
      const workspaceData = {
        name,
        description,
        color,
        owner: userId,
        members: [userId],
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'workspaces'), workspaceData);
      
      return {
        id: docRef.id,
        ...workspaceData
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWorkspaces = createAsyncThunk(
  'workspace/fetchWorkspaces',
  async (userId, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, 'workspaces'),
        where('members', 'array-contains', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const workspaces = [];
      
      querySnapshot.forEach((doc) => {
        workspaces.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return workspaces;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateWorkspace = createAsyncThunk(
  'workspace/updateWorkspace',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const workspaceRef = doc(db, 'workspaces', id);
      await updateDoc(workspaceRef, updates);
      
      return { id, ...updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  'workspace/deleteWorkspace',
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'workspaces', id));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create workspace
      .addCase(createWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workspaces.push(action.payload);
        if (!state.currentWorkspace) {
          state.currentWorkspace = action.payload;
        }
      })
      .addCase(createWorkspace.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch workspaces
      .addCase(fetchWorkspaces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workspaces = action.payload;
        if (action.payload.length > 0 && !state.currentWorkspace) {
          state.currentWorkspace = action.payload[0];
        }
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update workspace
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        const index = state.workspaces.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.workspaces[index] = { ...state.workspaces[index], ...action.payload };
        }
        if (state.currentWorkspace?.id === action.payload.id) {
          state.currentWorkspace = { ...state.currentWorkspace, ...action.payload };
        }
      })
      // Delete workspace
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.filter(w => w.id !== action.payload);
        if (state.currentWorkspace?.id === action.payload) {
          state.currentWorkspace = state.workspaces[0] || null;
        }
      })
      // Reset state on logout
      .addMatcher(
        (action) => action.type === 'RESET_STATE',
        () => initialState
      );
  },
});

export const { setCurrentWorkspace, clearError } = workspaceSlice.actions;
export default workspaceSlice.reducer;

