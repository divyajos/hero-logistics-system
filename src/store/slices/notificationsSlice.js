import { createSlice } from '@reduxjs/toolkit';

const mockNotifications = [
  { id: 1, title: 'Load Delivered', message: 'Load LD-9411 has been successfully delivered.', category: 'Load Updates', priority: 'High', date: '06/19/2026', read: false, archived: false },
  { id: 2, title: 'Driver Delay', message: 'Driver John D. reported heavy traffic on I-35.', category: 'Driver', priority: 'Medium', date: '06/19/2026', read: false, archived: false },
  { id: 3, title: 'Invoice Paid', message: 'Invoice INV-3981 has been settled.', category: 'Accounts', priority: 'Normal', date: '06/18/2026', read: true, archived: false },
  { id: 4, title: 'System Update', message: 'Scheduled maintenance this weekend.', category: 'System', priority: 'Low', date: '06/17/2026', read: true, archived: true },
  { id: 5, title: 'Warehouse Capacity', message: 'Bay A (Dry) is at 94% capacity.', category: 'Warehouse', priority: 'Critical', date: '06/19/2026', read: false, archived: false }
];

const initialState = {
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.read && !n.archived).length,
  categories: ['All', 'Load Updates', 'Dispatch', 'Driver', 'Warehouse', 'Accounts', 'Customer', 'System'],
  priorities: ['All', 'Low', 'Medium', 'High', 'Critical'],
  loading: false
};

const updateUnreadCount = (state) => {
  state.unreadCount = state.notifications.filter(n => !n.read && !n.archived).length;
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        read: false,
        archived: false,
        ...action.payload
      });
      updateUnreadCount(state);
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
      updateUnreadCount(state);
    },
    markAsUnread: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = false;
      }
      updateUnreadCount(state);
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => {
        if (!n.archived) n.read = true;
      });
      updateUnreadCount(state);
    },
    archiveNotification: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.archived = true;
      }
      updateUnreadCount(state);
    },
    restoreArchive: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.archived = false;
      }
      updateUnreadCount(state);
    },
    bulkAction: (state, action) => {
      const { ids, actionType } = action.payload; // actionType: 'read', 'unread', 'archive'
      state.notifications.forEach(n => {
        if (ids.includes(n.id)) {
          if (actionType === 'read') n.read = true;
          if (actionType === 'unread') n.read = false;
          if (actionType === 'archive') n.archived = true;
        }
      });
      updateUnreadCount(state);
    }
  }
});

export const { 
  addNotification, 
  markAsRead, 
  markAsUnread, 
  markAllAsRead, 
  archiveNotification, 
  restoreArchive, 
  bulkAction 
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
