import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import { GOOGLE_AUTH_URL } from '@services/axiosInstance'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Role-based redirect after login
const getRoleRedirect = (role) => {
  if (role === 'admin')     return '/admin'
  if (role === 'recruiter') return '/recruiter'
  return '/dashboard'
}

export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]     = useState({})
  const [pendingMsg, setPendingMsg] = useState('')
  const { login, isLoading }    = useAuthStore()
  const navigate                = useNavigate()
  const [searchParams]          = useSearchParams()

  const oauthError = searchParams.get('error')
  const oauthMessage =
    oauthError === 'pending_recruiter'
      ? 'Your recruiter account is pending admin approval. Please wait until it is approved before signing in with Google.'
      : oauthError === 'rejected_recruiter'
        ? 'Your recruiter application was rejected. Please contact support for help.'
        : oauthError === 'oauth'
          ? 'Google sign-in could not be completed. Please try again.'
          : ''

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setPendingMsg('')

    const res = await login(form.email, form.password)
    if (res.success) {
      const redirect = getRoleRedirect(res.role)
      toast.success(
        res.role === 'admin'     ? 'Welcome back, Admin! 🛡️'     :
        res.role === 'recruiter' ? 'Welcome back, Recruiter! 🏢' :
        'Welcome back! 🎉'
      )
      navigate(redirect)
    } else if (res.pending) {
      setPendingMsg(res.message)
    } else {
      toast.error(res.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand-bg flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />
        </div>
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-700 text-white">CareerAI</span>
          </Link>
        </div>
        <div className="relative space-y-6">
          <h2 className="font-display text-4xl font-700 text-white leading-tight">
            Your AI career companion is waiting
          </h2>
          <p className="text-white/75 text-base leading-relaxed">
            Log in to continue your personalised career journey — assessments, roadmaps, resume builder and AI advisor all in one place.
          </p>
          <div className="space-y-3">
            {['AI-generated career roadmaps','ATS resume scorer & builder','Personalised skill assessment','24/7 AI career advisor'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-white/85 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-white/50 text-xs">© 2026 CareerAI Platform</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50 dark:bg-surface-900">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg gradient-brand-bg flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-display text-lg font-700 gradient-text">CareerAI</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white mb-2">Welcome back</h1>
            <p className="text-surface-500 text-sm">Sign in to continue your career journey</p>
          </div>

          {/* Pending approval notice */}
          {(pendingMsg || oauthMessage) && (
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 mb-6">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">{pendingMsg || oauthMessage}</p>
            </div>
          )}

          {/* Google OAuth */}
          <a
            href={GOOGLE_AUTH_URL}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-all mb-6"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
            <span className="text-xs text-surface-400">or sign in with email</span>
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={clsx('input pl-9', errors.email && 'border-red-400')} />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-navy-600 dark:text-navy-300 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className={clsx('input pl-9 pr-10', errors.password && 'border-red-400')} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 rounded-xl text-base font-medium justify-center disabled:opacity-60 flex items-center gap-2">
              {isLoading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <ArrowRight size={16} />
              }
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-navy-600 dark:text-navy-300 font-medium hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
