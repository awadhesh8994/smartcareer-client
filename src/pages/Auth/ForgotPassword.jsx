import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowLeft, Mail } from 'lucide-react'
import { authService } from '@services/index'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl gradient-brand-bg flex items-center justify-center">
            <Sparkles size={17} className="text-white" />
          </div>
          <span className="font-display text-xl font-700 gradient-text">CareerAI</span>
        </div>

        <div className="card p-8">
          {!sent ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center mb-5">
                <Mail size={22} className="text-navy-600" />
              </div>
              <h1 className="font-display text-2xl font-800 text-surface-900 dark:text-white mb-2">Forgot password?</h1>
              <p className="text-surface-500 text-sm mb-6 leading-relaxed">
                No worries. Enter your email and we'll send a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl gradient-brand-bg text-white font-medium text-sm hover:opacity-90 disabled:opacity-60 transition-all">
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <Mail size={26} className="text-green-500" />
              </div>
              <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-surface-500 text-sm leading-relaxed mb-6">
                We sent a password reset link to <span className="font-medium text-surface-700 dark:text-surface-300">{email}</span>. Link expires in 10 minutes.
              </p>
              <button onClick={() => setSent(false)} className="text-navy-600 text-sm hover:underline">
                Try a different email
              </button>
            </div>
          )}
          <div className="mt-6 pt-5 border-t border-surface-100 dark:border-surface-700 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
