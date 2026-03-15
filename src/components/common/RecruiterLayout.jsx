import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Building2, Briefcase, Users, BarChart3, Bell, LogOut, Sparkles, Menu, Sun, Moon, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import { useThemeStore, useNotifStore } from '@store/index'
import clsx from 'clsx'

export default function RecruiterLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout }              = useAuthStore()
  const { isDark, toggleTheme }       = useThemeStore()
  const { unreadCount }               = useNotifStore()
  const navigate                      = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-surface-200 dark:border-surface-700">
        <div className="w-8 h-8 rounded-lg gradient-brand-bg flex items-center justify-center">
          <Sparkles size={15} className="text-white" />
        </div>
        <div>
          <span className="font-display text-base font-700 text-surface-900 dark:text-white">
            Career<span className="gradient-text">AI</span>
          </span>
          <p className="text-2xs text-teal-600 font-medium">Recruiter Portal</p>
        </div>
      </div>

      {/* Company info */}
      <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700 bg-teal-50 dark:bg-teal-900/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-700 text-sm shrink-0">
            {user?.companyName?.charAt(0) || 'C'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-600 text-surface-800 dark:text-surface-200 truncate">{user?.companyName || 'Company'}</p>
            <p className="text-2xs text-teal-600">Active Recruiter</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <NavLink to="/recruiter" className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}>
          <Building2 size={16} /> <span className="text-sm">Dashboard</span>
        </NavLink>
      </nav>

      {/* User */}
      <div className="border-t border-surface-200 dark:border-surface-700 p-3">
        <div className="flex items-center gap-2.5 p-2 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-700 shrink-0">
            {user?.name?.charAt(0) || 'R'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-surface-400">Recruiter</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-900 overflow-hidden">
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-surface-800">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex items-center px-4 gap-3">
          <button className="lg:hidden btn-icon" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative btn-icon">
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-2xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={toggleTheme} className="btn-icon">
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-surface-400" />}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}