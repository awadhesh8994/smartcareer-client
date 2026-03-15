import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 px-4">
      <div className="text-center">
        <div className="font-display text-9xl font-800 gradient-text mb-4">404</div>
        <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white mb-3">Page not found</h1>
        <p className="text-surface-500 text-sm mb-8 max-w-sm mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>
    </div>
  )
}
