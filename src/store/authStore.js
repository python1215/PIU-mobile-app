import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
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
        const state = useAuthStore.getState();
        if (!state.permissions) return true;
        if (state.user?.isSuperuser) return true;
        return state.permissions[moduleKey] === true;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
