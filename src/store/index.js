import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@services/axiosInstance'

// ── Theme Store ───────────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set) => ({
      isDark: true,
      toggleTheme: () => set((s) => ({ isDark: !s.isDark })),
      setDark: (val) => set({ isDark: val }),
    }),
    { name: 'career-theme' }
  )
)

// ── Notification Store ────────────────────────────────────────────
export const useNotifStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/notifications')
      set({ notifications: data.data, unreadCount: data.unreadCount, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  markRead: async (id) => {
    await api.patch(`/notifications/${id}/read`)
    set((s) => ({
      notifications: s.notifications.map((n) => n._id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }))
  },

  markAllRead: async () => {
    await api.patch('/notifications/read-all')
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  deleteNotif: async (id) => {
    await api.delete(`/notifications/${id}`)
    set((s) => ({
      notifications: s.notifications.filter((n) => n._id !== id),
    }))
  },
}))

// ── Assessment Store ──────────────────────────────────────────────
export const useAssessmentStore = create((set) => ({
  currentAssessment: null,
  history: [],
  isLoading: false,

  startAssessment: async (domain) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/assessments/start', { domain })
      set({ currentAssessment: data.data, isLoading: false })
      return { success: true, data: data.data }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message }
    }
  },

  submitAssessment: async (assessmentId, answers, timeTakenMinutes) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post(`/assessments/submit/${assessmentId}`, { answers, timeTakenMinutes })
      set({ currentAssessment: null, isLoading: false })
      return { success: true, data: data.data }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message }
    }
  },

  fetchHistory: async () => {
    const { data } = await api.get('/assessments/history')
    set({ history: data.data })
  },

  clearCurrent: () => set({ currentAssessment: null }),
}))

// ── Resume Store ──────────────────────────────────────────────────
export const useResumeStore = create((set) => ({
  resumes: [],
  activeResume: null,
  isLoading: false,

  fetchResumes: async () => {
    set({ isLoading: true })
    const { data } = await api.get('/resumes')
    set({ resumes: data.data, isLoading: false })
  },

  setActiveResume: (resume) => set({ activeResume: resume }),

  createResume: async (payload) => {
    const { data } = await api.post('/resumes', payload)
    set((s) => ({ resumes: [data.data, ...s.resumes], activeResume: data.data }))
    return data.data
  },

  updateResume: async (id, payload) => {
    const { data } = await api.put(`/resumes/${id}`, payload)
    set((s) => ({
      resumes: s.resumes.map((r) => r._id === id ? data.data : r),
      activeResume: data.data,
    }))
    return data.data
  },

  deleteResume: async (id) => {
    await api.delete(`/resumes/${id}`)
    set((s) => ({
      resumes: s.resumes.filter((r) => r._id !== id),
      activeResume: s.activeResume?._id === id ? null : s.activeResume,
    }))
  },
}))