import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@services/axiosInstance'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,
      isLoading:       false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({ user: data.data, token: data.token, isAuthenticated: true, isLoading: false })
          return { success: true, role: data.data.role }
        } catch (err) {
          set({ isLoading: false })
          const resData = err.response?.data
          // Pass pending flag back to Login page
          if (resData?.pending) {
            return { success: false, pending: true, message: resData.message }
          }
          return { success: false, message: resData?.message || 'Login failed' }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', { name, email, password })
          set({ user: data.data, token: data.token, isAuthenticated: true, isLoading: false })
          return { success: true, role: data.data.role }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Registration failed' }
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }))
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data.data })
        } catch {
          get().logout()
        }
      },
    }),
    {
      name: 'career-auth',
      partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
)