import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Brain, Map, BookOpen, FileText,
  BarChart3, MessageSquare, Users, Bell, LogOut,
  Sparkles, Menu, Sun, Moon, ChevronRight, Shield,
  Briefcase, Mic
} from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import { useThemeStore, useNotifStore } from '@store/index'
import clsx from 'clsx'

// ── Nav items per role ────────────────────────────────────────────
const STUDENT_NAV = [
  {
    label: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',  href: '/dashboard' },
      { icon: Brain,           label: 'Assessment', href: '/assessment' },
      { icon: Map,             label: 'Roadmap',    href: '/roadmap' },
      { icon: BookOpen,        label: 'Learning',   href: '/learning' },
    ],
  },
  {
    label: 'Career Tools',
    items: [
      { icon: FileText,      label: 'Resume Builder', href: '/resume' },
      { icon: Briefcase,     label: 'Jobs',           href: '/jobs',      badge: 'New' },
      { icon: Mic,           label: 'Mock Interview', href: '/interview', badge: 'AI' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { icon: BarChart3,     label: 'Analytics',  href: '/analytics' },
      { icon: MessageSquare, label: 'AI Chatbot', href: '/chatbot',  badge: 'AI' },
      { icon: Users,         label: 'Network',    href: '/network' },
    ],
  },
]

const ADMIN_NAV = [
  {
    label: 'Admin',
    items: [
      { icon: Shield, label: 'Admin Panel', href: '/admin' },
    ],
  },
  {
    label: 'Student Tools',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',  href: '/dashboard' },
      { icon: Brain,           label: 'Assessment', href: '/assessment' },
      { icon: Map,             label: 'Roadmap',    href: '/roadmap' },
      { icon: BookOpen,        label: 'Learning',   href: '/learning' },
      { icon: FileText,        label: 'Resume',     href: '/resume' },
      { icon: Briefcase,       label: 'Jobs',       href: '/jobs' },
      { icon: Mic,             label: 'Interview',  href: '/interview' },
      { icon: BarChart3,       label: 'Analytics',  href: '/analytics' },
      { icon: MessageSquare,   label: 'AI Chatbot', href: '/chatbot' },
      { icon: Users,           label: 'Network',    href: '/network' },
    ],
  },
]

const BADGE_COLORS = {
  AI:  'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300',
  New: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout }              = useAuthStore()
  const { isDark, toggleTheme }       = useThemeStore()
  const { unreadCount }               = useNotifStore()
  const navigate                      = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  // Pick nav sections based on role
  const navSections = user?.role === 'admin' ? ADMIN_NAV : STUDENT_NAV

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-surface-200 dark:border-surface-700 shrink-0">
        <div className="w-8 h-8 rounded-lg gradient-brand-bg flex items-center justify-center shrink-0">
          <Sparkles size={15} className="text-white" />
        </div>
        <div>
          <span className="font-display text-base font-700 text-surface-900 dark:text-white">
            Career<span className="gradient-text">AI</span>
          </span>
          {user?.role === 'admin' && (
            <p className="text-2xs text-red-500 font-600">Admin Mode</p>
          )}
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {navSections.map(({ label, items }) => (
          <div key={label}>
            <p className="px-3 text-2xs font-600 uppercase tracking-widest text-surface-400 mb-1">
              {label}
            </p>
            {items.map(({ icon: Icon, label: itemLabel, href, badge }) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) => clsx('sidebar-link mb-0.5', isActive && 'active')}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1 text-sm">{itemLabel}</span>
                {badge && (
                  <span className={clsx('text-2xs font-600 px-1.5 py-0.5 rounded-md', BADGE_COLORS[badge])}>
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="border-t border-surface-200 dark:border-surface-700 p-3 shrink-0">
        <NavLink
          to="/profile"
          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 cursor-pointer group mb-1"
        >
          <div className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-600 shrink-0',
            user?.role === 'admin' ? 'bg-red-500' : 'gradient-brand-bg'
          )}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-surface-400 capitalize">
              {user?.role === 'admin' ? '🛡️ Administrator' : `Student · ${user?.profileCompletionScore || 0}%`}
            </p>
          </div>
          <ChevronRight size={14} className="text-surface-400 group-hover:translate-x-0.5 transition-transform" />
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-900 overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 shrink-0 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex items-center px-4 gap-3">
          <button className="lg:hidden btn-icon" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>

          <div className="hidden sm:flex flex-1 max-w-xs">
            <input type="text" placeholder="Search..." className="input text-xs py-1.5 h-8" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative btn-icon">
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-2xs flex items-center justify-center font-600">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button onClick={toggleTheme} className="btn-icon">
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-surface-400" />}
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}