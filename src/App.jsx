import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@store/authStore'
import { useThemeStore } from '@store/index'
import { useEffect } from 'react'

// Layouts
import PublicLayout       from '@components/common/PublicLayout'
import AppLayout          from '@components/common/AppLayout'
import RecruiterLayout    from '@components/common/RecruiterLayout'

// Public pages
import LandingPage        from '@pages/LandingPage'
import Login              from '@pages/Auth/Login'
import Register           from '@pages/Auth/Register'
import OAuthSuccess       from '@pages/Auth/OAuthSuccess'
import ForgotPassword     from '@pages/Auth/ForgotPassword'

// Onboarding
import Onboarding         from '@pages/Onboarding'

// Student pages
import Dashboard          from '@pages/Dashboard'
import Profile            from '@pages/Profile'
import Assessment         from '@pages/Assessment'
import Roadmap            from '@pages/Roadmap'
import Learning           from '@pages/Learning'
import ResumeBuilder      from '@pages/ResumeBuilder'
import Analytics          from '@pages/Analytics'
import Chatbot            from '@pages/Chatbot'
import Resources         from '@pages/Resources'
import Jobs               from '@pages/Jobs'
import Interview          from '@pages/Interview'

// Recruiter & Admin
import Recruiter          from '@pages/Recruiter'
import Admin              from '@pages/Admin'

import NotFound           from '@pages/NotFound'

// ── Guards ────────────────────────────────────────────────────────

// Must be logged in + onboarded + correct role
const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated)                        return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role))    return <Navigate to="/unauthorized" replace />
  // Redirect to onboarding if not completed (students only)
  if (user?.role === 'student' && !user?.onboarded) return <Navigate to="/onboarding" replace />
  return children
}

// Must be logged in but NOT onboarded (guards the onboarding page itself)
const OnboardingRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated)  return <Navigate to="/login" replace />
  if (user?.onboarded)   return <Navigate to="/dashboard" replace />
  return children
}

// Redirect logged-in users to their home
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) {
    if (user?.role === 'admin')                           return <Navigate to="/admin" replace />
    if (user?.role === 'recruiter')                       return <Navigate to="/recruiter" replace />
    if (user?.role === 'student' && !user?.onboarded)     return <Navigate to="/onboarding" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
    <div className="text-center">
      <div className="font-display text-6xl font-800 gradient-text mb-4">403</div>
      <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white mb-3">Access Denied</h1>
      <p className="text-surface-500 text-sm mb-6">You don't have permission to view this page.</p>
      <a href="/" className="btn-primary px-6 py-3 rounded-xl inline-flex">Go Home</a>
    </div>
  </div>
)

export default function App() {
  const { isDark } = useThemeStore()
  useEffect(() => { document.documentElement.classList.toggle('dark', isDark) }, [isDark])

  const toastDark = {
    background: '#1E293B', color: '#F1F5F9', border: '1px solid #334155',
  }
  const toastLight = {
    background: '#fff', color: '#0F172A', border: '1px solid #E2E8F0',
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { ...(isDark ? toastDark : toastLight), borderRadius: '10px', fontSize: '13px', fontFamily: 'Plus Jakarta Sans, sans-serif' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* ── Public ──────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register"        element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/oauth-success"   element={<OAuthSuccess />} />
        </Route>

        {/* ── Onboarding (logged in, not yet onboarded) ────── */}
        <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

        {/* ── Student + Admin ──────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['student', 'admin']}><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/profile"    element={<Profile />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/roadmap"    element={<Roadmap />} />
          <Route path="/learning"   element={<Learning />} />
          <Route path="/resume"     element={<ResumeBuilder />} />
          <Route path="/analytics"  element={<Analytics />} />
          <Route path="/chatbot"    element={<Chatbot />} />
          <Route path="/resources"  element={<Resources />} />
          <Route path="/jobs"       element={<Jobs />} />
          <Route path="/interview"  element={<Interview />} />
        </Route>

        {/* ── Admin only ───────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['admin']}><AppLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* ── Recruiter + Admin ────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['recruiter', 'admin']}><RecruiterLayout /></ProtectedRoute>}>
          <Route path="/recruiter" element={<Recruiter />} />
        </Route>

        {/* ── Misc ─────────────────────────────────────────── */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*"             element={<NotFound />} />
      </Routes>
    </>
  )
}