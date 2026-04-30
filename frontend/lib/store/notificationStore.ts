import { create } from 'zustand';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  
  // Actions
  addNotification: (message: string, type?: Notification['type'], duration?: number) => void;
  removeNotification: (id: number) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const notification: Notification = { id, message, type, duration };
    
    set((state) => ({
      notifications: [...state.notifications, notification]
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        }));
      }, duration);
    }
  },

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),

  clearAll: () => set({ notifications: [] }),
}));

// Convenience hooks
export const useToast = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  return {
    toast: addNotification,
    success: (message: string) => addNotification(message, 'success'),
    error: (message: string) => addNotification(message, 'error'),
    info: (message: string) => addNotification(message, 'info'),
    warning: (message: string) => addNotification(message, 'warning'),
  };
};
