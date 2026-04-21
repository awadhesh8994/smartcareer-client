import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, ArrowRight, User, Mail, Lock, CheckCircle2, Building2, GraduationCap } from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import api, { GOOGLE_AUTH_URL } from '@services/axiosInstance'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-teal-500']

function getStrength(pw) {
  let s = 0
  if (pw.length >= 6)          s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

export default function Register() {
  const [selectedRole, setSelectedRole] = useState('student')
  const [form, setForm]       = useState({ name: '', email: '', password: '', companyName: '' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]   = useState({})
  const [agreed, setAgreed]   = useState(false)
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, isLoading } = useAuthStore()
  const navigate                = useNavigate()
  const strength                = getStrength(form.password)

  const validate = () => {
    const e = {}
    if (!form.name.trim())   e.name     = 'Full name is required'
    if (!form.email)          e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
    if (!form.password)       e.password = 'Password is required'
    else if (form.password.length < 6)  e.password = 'At least 6 characters required'
    if (selectedRole === 'recruiter' && !form.companyName.trim())
      e.companyName = 'Company name is required'
    if (!agreed) e.agreed = 'You must agree to the terms'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return

    if (selectedRole === 'recruiter') {
      setLoading(true)
      try {
        const { data } = await api.post('/auth/register', {
          name:        form.name,
          email:       form.email,
          password:    form.password,
          role:        'recruiter',
          companyName: form.companyName,
        })
        if (data.pending) {
          setPending(true)
        } else {
          toast.error('Unexpected response from server')
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Registration failed. Please try again.'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
      return
    }

    // Student registration
    const res = await register(form.name, form.email, form.password)
    if (res.success) {
      toast.success('Account created! Welcome to CareerAI 🎉')
      navigate('/onboarding')
    } else {
      toast.error(res.message || 'Registration failed')
    }
  }

  const busy = loading || isLoading

  // ── Pending screen ────────────────────────────────────────────
  if (pending) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <div className="card p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl gradient-brand-bg flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={30} className="text-white" />
        </div>
        <h2 className="font-display text-2xl font-700 text-surface-900 dark:text-white mb-3">
          Application Submitted! 🎉
        </h2>
        <p className="text-surface-500 text-sm leading-relaxed mb-2">
          Your recruiter account for{' '}
          <strong className="text-surface-700 dark:text-surface-300">{form.companyName}</strong>{' '}
          has been submitted for review.
        </p>
        <p className="text-surface-500 text-sm leading-relaxed mb-6">
          Our team will review and notify you at{' '}
          <strong className="text-surface-700 dark:text-surface-300">{form.email}</strong>{' '}
          once approved. This usually takes 24–48 hours.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 mb-6">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            ⏳ You won't be able to log in until your account is approved by an admin.
          </p>
        </div>
        <Link to="/login" className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2">
          Back to Login
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand-bg flex-col justify-between p-24 relative overflow-hidden">
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
            {selectedRole === 'recruiter'
              ? 'Find the best talent with AI-powered matching'
              : 'Start your AI-powered career journey today'}
          </h2>
          <p className="text-white/75 text-base leading-relaxed">
            {selectedRole === 'recruiter'
              ? 'Post jobs, get AI-ranked candidates, and manage your hiring pipeline — all in one place.'
              : 'Join thousands of students and professionals using CareerAI across Technology, Law, Finance, Design, Healthcare and more.'}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {(selectedRole === 'recruiter' ? [
              { value: 'AI',     label: 'Candidate ranking' },
              { value: 'Fast',   label: 'Quick approvals' },
              { value: 'Free',   label: 'To get started' },
              { value: '10K+',   label: 'Student pool' },
            ] : [
              { value: '10K+',   label: 'Users guided' },
              { value: '10+',    label: 'Career fields' },
              { value: '50+',    label: 'Career paths' },
              { value: 'Free',   label: 'To get started' },
            ]).map(({ value, label }) => (
              <div key={label} className="bg-white/15 rounded-xl p-4">
                <div className="font-display text-2xl font-700 text-white">{value}</div>
                <div className="text-white/70 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-white/50 text-xs">© 2026 CareerAI Platform</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50 dark:bg-surface-900 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg gradient-brand-bg flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-display text-lg font-700 gradient-text">CareerAI</span>
          </div>

          <div className="mb-6">
            <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white mb-2">Create your account</h1>
            <p className="text-surface-500 text-sm">Free forever — no credit card needed</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={clsx(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                selectedRole === 'student'
                  ? 'border-navy-600 bg-navy-50 dark:bg-navy-900/40'
                  : 'border-surface-200 dark:border-surface-700 hover:border-navy-300'
              )}
            >
              <GraduationCap size={22} className={selectedRole === 'student' ? 'text-navy-600' : 'text-surface-400'} />
              <div>
                <p className={clsx('text-sm font-600', selectedRole === 'student' ? 'text-navy-600 dark:text-navy-300' : 'text-surface-600 dark:text-surface-400')}>
                  Student / Professional
                </p>
                <p className="text-xs text-surface-400">Find your career path</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('recruiter')}
              className={clsx(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                selectedRole === 'recruiter'
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/30'
                  : 'border-surface-200 dark:border-surface-700 hover:border-teal-300'
              )}
            >
              <Building2 size={22} className={selectedRole === 'recruiter' ? 'text-teal-600' : 'text-surface-400'} />
              <div>
                <p className={clsx('text-sm font-600', selectedRole === 'recruiter' ? 'text-teal-700 dark:text-teal-300' : 'text-surface-600 dark:text-surface-400')}>
                  Recruiter
                </p>
                <p className="text-xs text-surface-400">Hire top talent</p>
              </div>
            </button>
          </div>

          {/* Recruiter pending notice */}
          {selectedRole === 'recruiter' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-3 mb-4 flex items-start gap-2">
              <span className="text-amber-500 shrink-0 mt-0.5">⏳</span>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Recruiter accounts require admin approval before you can log in. You'll be notified by email once approved.
              </p>
            </div>
          )}

          {/* Google OAuth — students only */}
          {selectedRole === 'student' && (
            <>
              <a
                href={GOOGLE_AUTH_URL}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-all mb-4"
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </a>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
                <span className="text-xs text-surface-400">or register with email</span>
                <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className={clsx('input pl-9', errors.name && 'border-red-400')}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {selectedRole === 'recruiter' && (
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Company name</label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Your company name"
                    value={form.companyName}
                    onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                    className={clsx('input pl-9', errors.companyName && 'border-red-400')}
                  />
                </div>
                {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className={clsx('input pl-9', errors.email && 'border-red-400')}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className={clsx('input pl-9 pr-10', errors.password && 'border-red-400')}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={clsx('h-1 flex-1 rounded-full transition-all', i <= strength ? STRENGTH_COLORS[strength] : 'bg-surface-200 dark:bg-surface-700')} />
                    ))}
                  </div>
                  <p className="text-xs text-surface-400">{STRENGTH_LABELS[strength]} password</p>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <div
                onClick={() => setAgreed(!agreed)}
                className={clsx('w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-all', agreed ? 'bg-navy-600 border-navy-600' : 'border-surface-300 dark:border-surface-600')}
              >
                {agreed && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <span className="text-sm text-surface-600 dark:text-surface-400">
                I agree to the <a href="#" className="text-navy-600 hover:underline">Terms of Service</a> and <a href="#" className="text-navy-600 hover:underline">Privacy Policy</a>
              </span>
            </label>
            {errors.agreed && <p className="text-xs text-red-500">{errors.agreed}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full btn-primary py-3 rounded-xl text-base font-medium justify-center flex items-center gap-2 disabled:opacity-60"
            >
              {busy
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : selectedRole === 'recruiter' ? <Building2 size={16} /> : <ArrowRight size={16} />
              }
              {selectedRole === 'recruiter' ? 'Submit Recruiter Application' : 'Create free account'}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-navy-600 dark:text-navy-300 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
