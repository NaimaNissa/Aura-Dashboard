import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Async thunks
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const newOrder = {
        ...orderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'orders'), newOrder);
      
      return {
        id: docRef.id,
        ...newOrder
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const orders = [];
      
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return orders;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrder = createAsyncThunk(
  'order/updateOrder',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const orderRef = doc(db, 'orders', id);
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(orderRef, updatedData);
      
      return { id, ...updatedData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'order/deleteOrder',
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  orders: [],
  filteredOrders: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    status: '',
    dateRange: ''
  },
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredOrders = filterOrders(state.orders, state.filters);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.filteredOrders = filterOrders(state.orders, state.filters);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.filteredOrders = filterOrders(action.payload, state.filters);
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update order
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...action.payload };
        }
        state.filteredOrders = filterOrders(state.orders, state.filters);
      })
      // Delete order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(o => o.id !== action.payload);
        state.filteredOrders = filterOrders(state.orders, state.filters);
      })
      // Reset state on logout
      .addMatcher(
        (action) => action.type === 'RESET_STATE',
        () => initialState
      );
  },
});

// Helper function to filter orders
function filterOrders(orders, filters) {
  return orders.filter(order => {
    const matchesSearch = !filters.search || 
      order.FullName.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.OrderID.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.productname.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || order.Status === filters.status;
    
    return matchesSearch && matchesStatus;
  });
}

export const { setFilters, clearError } = orderSlice.actions;
export default orderSlice.reducer;










