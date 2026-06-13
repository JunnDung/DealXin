import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UserResponse } from "@/lib/api";
import { authApi, clearTokens, getAccessToken, setTokens } from "@/lib/api";

interface AuthState {
  user: UserResponse | null;
  isLoading: boolean;
  isHydrated: boolean;

  hydrate: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      isLoading: false,
      isHydrated: false,

      hydrate: () => {
        set({ isHydrated: true });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const result = await authApi.login({ email, password });
          setTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });
          set({ user: result.user, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (email: string, password: string, fullName: string) => {
        set({ isLoading: true });
        try {
          const result = await authApi.register({
            email,
            password,
            fullName,
          });
          setTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });
          set({ user: result.user, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore network errors on logout
        } finally {
          clearTokens();
          set({ user: null });
        }
      },

      refreshUser: async () => {
        if (!getAccessToken()) return;
        try {
          const user = await authApi.me();
          set({ user });
        } catch {
          clearTokens();
          set({ user: null });
        }
      },
    }),
    {
      name: "dx-auth",
      partialize: () => ({}), // tokens stored separately via api.ts
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrate();
      },
    },
  ),
);

export function useAuth() {
  return {
    user: useAuthStore((s) => s.user),
    isLoading: useAuthStore((s) => s.isLoading),
    isHydrated: useAuthStore((s) => s.isHydrated),
    login: useAuthStore((s) => s.login),
    register: useAuthStore((s) => s.register),
    logout: useAuthStore((s) => s.logout),
    refreshUser: useAuthStore((s) => s.refreshUser),
  };
}
