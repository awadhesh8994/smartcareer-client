import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Lock, Sparkles } from 'lucide-react'
import { authService } from '@services/index'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const getStrength = (value) => {
  let score = 0
  if (value.length >= 6) score += 1
  if (/[A-Z]/.test(value)) score += 1
  if (/[0-9]/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  return score
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-teal-500']

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [done, setDone] = useState(false)

  const strength = useMemo(() => getStrength(form.password), [form.password])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!token) {
      toast.error('Reset link is invalid. Please request a new one.')
      return
    }

    if (!form.password || !form.confirmPassword) {
      toast.error('Please fill in both password fields.')
      return
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long.')
      return
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, form.password)
      setDone(true)
      toast.success('Password updated successfully. Please sign in.')
      setTimeout(() => navigate('/login', { replace: true }), 1400)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset link is invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl gradient-brand-bg flex items-center justify-center">
            <Sparkles size={17} className="text-white" />
          </div>
          <span className="font-display text-xl font-700 gradient-text">CareerAI</span>
        </div>

        <div className="card p-8">
          {!done ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center mb-5">
                <Lock size={22} className="text-navy-600" />
              </div>

              <h1 className="font-display text-2xl font-800 text-surface-900 dark:text-white mb-2">
                Set a new password
              </h1>
              <p className="text-surface-500 text-sm mb-6 leading-relaxed">
                Choose a strong password for your account. This reset link works for a limited time.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                      placeholder="Enter your new password"
                      className="input pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                      placeholder="Re-enter your password"
                      className="input pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-surface-400 mb-2">
                    <span>Password strength</span>
                    <span className="font-semibold text-surface-600 dark:text-surface-300">{strengthLabels[strength]}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={clsx(
                          'h-2 rounded-full bg-surface-200 dark:bg-surface-700',
                          strength >= step && strengthColors[strength]
                        )}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl gradient-brand-bg text-white font-medium text-sm hover:opacity-90 disabled:opacity-60 transition-all"
                >
                  {loading ? 'Updating password...' : 'Reset password'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <Lock size={24} className="text-green-500" />
              </div>
              <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white mb-2">
                Password updated
              </h2>
              <p className="text-surface-500 text-sm leading-relaxed mb-6">
                Your password has been reset successfully. Redirecting you to sign in.
              </p>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-surface-100 dark:border-surface-700 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
