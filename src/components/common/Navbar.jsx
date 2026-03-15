import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react'
import { useThemeStore } from '@store/index'
import { useAuthStore } from '@store/authStore'
import clsx from 'clsx'

const NAV_LINKS = [
  { label: 'Features',   href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About',      href: '#about' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const { isDark, toggleTheme }       = useThemeStore()
  const { isAuthenticated }           = useAuthStore()
  const location                      = useLocation()
  const isLanding                     = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  return (
    <>
      <header className={clsx(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        isScrolled || !isLanding
          ? 'bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-b border-surface-200 dark:border-surface-700 shadow-sm'
          : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-8">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-lg gradient-brand-bg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-display text-lg font-700 text-surface-900 dark:text-white tracking-tight">
                Career<span className="gradient-text">AI</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            {isLanding && (
              <nav className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="px-3 py-2 text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-150"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            )}

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="btn-icon w-9 h-9 flex items-center justify-center rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                aria-label="Toggle theme"
              >
                {isDark
                  ? <Sun size={16} className="text-amber-400" />
                  : <Moon size={16} className="text-surface-500" />
                }
              </button>

              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary text-sm px-4 py-2 rounded-lg">
                  Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex btn-ghost text-sm px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm px-4 py-2 rounded-lg shadow-sm"
                  >
                    Get started free
                  </Link>
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden btn-icon ml-1"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 inset-x-0 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 p-4 space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="block px-4 py-3 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex flex-col gap-2">
              <Link to="/login"    className="btn-outline text-sm justify-center py-2.5">Log in</Link>
              <Link to="/register" className="btn-primary text-sm justify-center py-2.5">Get started free</Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
