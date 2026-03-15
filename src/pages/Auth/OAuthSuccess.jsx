import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import api from '@services/axiosInstance'
import toast from 'react-hot-toast'

export default function OAuthSuccess() {
  const [params]    = useSearchParams()
  const navigate    = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const token = params.get('token')
    if (!token) { navigate('/login'); return }

    localStorage.setItem('career-auth', JSON.stringify({ state: { token } }))
    api.get('/users/profile')
      .then(({ data }) => {
        setAuth(data.data, token)
        toast.success('Signed in with Google!')
        navigate('/dashboard')
      })
      .catch(() => { toast.error('Login failed'); navigate('/login') })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl gradient-brand-bg mx-auto mb-4 animate-pulse" />
        <p className="text-surface-500 text-sm">Completing sign in...</p>
      </div>
    </div>
  )
}
