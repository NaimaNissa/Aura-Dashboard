import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  sidebarOpen: true,
  modals: {
    createTask: false,
    createWorkspace: false,
    editTask: false,
    editWorkspace: false,
    createProduct: false,
    editProduct: false,
    bulkUpload: false,
  },
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openModal: (state, action) => {
      if (typeof action.payload === 'string') {
        state.modals[action.payload] = true;
      } else if (typeof action.payload === 'object' && action.payload.type) {
        state.modals[action.payload.type] = true;
        if (action.payload.data) {
          state.modals[action.payload.type + 'Data'] = action.payload.data;
        }
      }
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
      // Clear associated data
      if (state.modals[action.payload + 'Data']) {
        state.modals[action.payload + 'Data'] = null;
      }
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Reset state on logout
      .addMatcher(
        (action) => action.type === 'RESET_STATE',
        () => initialState
      );
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;

