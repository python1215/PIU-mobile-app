import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      permissions: null,

      login: (token, user) => {
        const permissions = user.permissions || null;
        set({ token, user, isAuthenticated: true, permissions });
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, permissions: null });
      },

      updateUser: (user) => {
        set({ user });
      },

      updatePermissions: (permissions) => {
        set({ permissions });
      },

      hasModuleAccess: (moduleKey) => {
        const state = get();
        if (!state.permissions) return true;
        if (state.user?.isSuperuser) return true;
        return state.permissions[moduleKey] === true;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
