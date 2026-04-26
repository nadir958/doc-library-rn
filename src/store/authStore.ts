import { create } from 'zustand';
import { authenticate } from '../services/biometricService';

interface AuthState {
  isAuthenticated: boolean;
}

interface AuthActions {
  authenticate: () => Promise<boolean>;
  reset: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  isAuthenticated: false,

  authenticate: async () => {
    const success = await authenticate();
    if (success) set({ isAuthenticated: true });
    return success;
  },

  reset: () => set({ isAuthenticated: false }),
}));
