import { Link } from 'react-router-dom'
import { Sparkles, Github, Linkedin, Twitter, Mail, ArrowUpRight } from 'lucide-react'

const FOOTER_LINKS = {
  Platform: [
    { label: 'Skill Assessment', href: '/assessment' },
    { label: 'Career Roadmap',   href: '/roadmap' },
    { label: 'Resume Builder',   href: '/resume' },
    { label: 'AI Chatbot',       href: '/chatbot' },
    { label: 'Analytics',        href: '/analytics' },
  ],
  Community: [
    { label: 'Mentor Network', href: '/network' },
    { label: 'Forums',         href: '/network#forum' },
    { label: 'Leaderboard',    href: '/network#leaderboard' },
  ],
  Resources: [
    { label: 'Learning Hub',  href: '/learning' },
    { label: 'Documentation', href: '#' },
    { label: 'API Docs',      href: '#' },
  ],
  Company: [
    { label: 'About us',     href: '#about' },
    { label: 'Privacy',      href: '#' },
    { label: 'Terms',        href: '#' },
    { label: 'Contact',      href: 'mailto:hello@careerai.dev' },
  ],
}

const STATS = [
  { value: '10K+', label: 'Students guided' },
  { value: '95%',  label: 'Placement rate' },
  { value: '50+',  label: 'Career paths' },
  { value: '4.9★', label: 'Avg. rating' },
]

export default function Footer() {
  return (
    <footer className="bg-surface-900 dark:bg-black text-surface-300">

      {/* Stats bar */}
      <div className="border-b border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-3xl font-700 gradient-text mb-1">{value}</div>
                <div className="text-sm text-surface-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">

          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl gradient-brand-bg flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-display text-xl font-700 text-white">
                Career<span className="gradient-text">AI</span>
              </span>
            </Link>

            <p className="text-sm text-surface-400 leading-relaxed mb-6 max-w-xs">
              Empowering students and professionals with AI-driven career guidance — from skill discovery to your next big opportunity.
            </p>

            {/* Mission statement */}
            <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 mb-6">
              <div className="text-xs font-medium text-navy-300 mb-1.5 uppercase tracking-wider">Our Mission</div>
              <p className="text-sm text-surface-300 leading-relaxed">
                To make world-class career guidance accessible to every student, powered by AI.
              </p>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Github,   href: '#', label: 'GitHub' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Twitter,  href: '#', label: 'Twitter' },
                { icon: Mail,     href: 'mailto:hello@careerai.dev', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 hover:border-surface-600 transition-all duration-150"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links cols */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="lg:col-span-1">
              <h4 className="text-sm font-600 text-white mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-surface-400 hover:text-white transition-colors duration-150 flex items-center gap-1 group"
                    >
                      {label}
                      {href.startsWith('http') && (
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} CareerAI Platform. Built with ❤️ for students.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse-slow" />
            <span className="text-xs text-surface-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}