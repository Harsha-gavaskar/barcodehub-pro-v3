import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarCollapsed: boolean
  activeModal: string | null
  theme: 'dark' | 'light'
  notifications: Notification[]
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  read: boolean
  timestamp: string
}

const initialState: UIState = {
  sidebarCollapsed: false,
  activeModal: null,
  theme: 'dark',
  notifications: [
    { id: '1', type: 'success', title: 'Sync Complete', message: 'Google Sheets synced 124 products', read: false, timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: '2', type: 'warning', title: 'Low Stock Alert', message: 'Product SKU-0042 has 3 units remaining', read: false, timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: '3', type: 'info', title: 'Print Job Done', message: 'Batch of 50 labels sent to HP LaserJet', read: true, timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
  ],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload
    },
    closeModal(state) {
      state.activeModal = null
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const n = state.notifications.find(n => n.id === action.payload)
      if (n) n.read = true
    },
    markAllRead(state) {
      state.notifications.forEach(n => { n.read = true })
    },
    addNotification(state, action: PayloadAction<Omit<Notification, 'id' | 'read'>>) {
      state.notifications.unshift({
        ...action.payload,
        id: Date.now().toString(),
        read: false,
      })
    },
  },
})

export const { toggleSidebar, setSidebarCollapsed, openModal, closeModal, markNotificationRead, markAllRead, addNotification } = uiSlice.actions
export default uiSlice.reducer
