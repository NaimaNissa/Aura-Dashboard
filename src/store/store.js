import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import workspaceSlice from './slices/workspaceSlice';
import taskSlice from './slices/taskSlice';
import productSlice from './slices/productSlice';
import orderSlice from './slices/orderSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    workspace: workspaceSlice,
    task: taskSlice,
    product: productSlice,
    order: orderSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});


