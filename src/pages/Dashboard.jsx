import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { userService } from '@services/index'
import { Brain, Map, FileText, MessageSquare, ArrowRight, Flame, TrendingUp, Target, Star, CheckCircle2, Briefcase, Mic } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import clsx from 'clsx'

const QUICK_ACTIONS = [
  { icon: Brain,        label: 'Take assessment',  href: '/assessment', color: 'bg-navy-50 dark:bg-navy-900/30 text-navy-600 dark:text-navy-300',     border: 'border-navy-200/60 dark:border-navy-700/50' },
  { icon: Map,          label: 'View roadmap',     href: '/roadmap',    color: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',      border: 'border-teal-200/60 dark:border-teal-700/50' },
  { icon: FileText,     label: 'Build resume',     href: '/resume',     color: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300', border: 'border-violet-200/60 dark:border-violet-700/50' },
  { icon: Briefcase,    label: 'Browse jobs',      href: '/jobs',       color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',   border: 'border-amber-200/60 dark:border-amber-700/50' },
  { icon: Mic,          label: 'Mock interview',   href: '/interview',  color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300',       border: 'border-pink-200/60 dark:border-pink-700/50' },
  { icon: MessageSquare,label: 'Ask AI advisor',   href: '/chatbot',    color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300', border: 'border-indigo-200/60 dark:border-indigo-700/50' },
]

const ACTIVITY_DATA = [
  { day: 'Mon', score: 62 }, { day: 'Tue', score: 68 },
  { day: 'Wed', score: 65 }, { day: 'Thu', score: 75 },
  { day: 'Fri', score: 72 }, { day: 'Sat', score: 80 },
  { day: 'Sun', score: 78 },
]

// Context-aware greeting based on experience level
const getGreeting = (user) => {
  const hour = new Date().getHours()
  const time = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const exp  = user?.experienceLevel || 'Student (Fresher)'

  if (exp === 'Student (Fresher)')              return { greeting: `${time}, ${user?.name?.split(' ')[0]}! 👋`, sub: 'Start building your career today — take your first skill assessment.' }
  if (['0-1 years','1-3 years'].includes(exp))  return { greeting: `${time}, ${user?.name?.split(' ')[0]}! 👋`, sub: 'Level up your early career — keep building skills and track your growth.' }
  if (['3-5 years'].includes(exp))              return { greeting: `${time}, ${user?.name?.split(' ')[0]}! 👋`, sub: 'Accelerate your mid-career growth — explore new paths and sharpen your expertise.' }
  return { greeting: `${time}, ${user?.name?.split(' ')[0]}! 👋`, sub: 'Navigate your senior career path — explore leadership roles and strategic upskilling.' }
}

function StatCard({ label, value, sub, icon: Icon, color, borderColor }) {
  return (
    <div className={clsx('card p-5 border-l-4', borderColor)}>
      <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-3', color)}>
        <Icon size={17} />
      </div>
      <div className="font-display text-2xl font-700 text-surface-900 dark:text-white mb-0.5">{value}</div>
      <div className="text-xs text-surface-500">{label}</div>
      {sub && <div className="text-xs text-teal-600 dark:text-teal-400 mt-1 font-medium">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user }          = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { greeting, sub } = getGreeting(user)

  useEffect(() => {
    userService.getStats()
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Build radar data from user skills
  const skillData = user?.skills?.slice(0, 6).map(s => ({
    subject: s.name.length > 10 ? s.name.substring(0, 10) + '...' : s.name,
    score:   s.level === 'Advanced' ? 85 : s.level === 'Intermediate' ? 60 : 35,
  })) || []

  const isProfessional = user?.experienceLevel && user.experienceLevel !== 'Student (Fresher)'

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Welcome banner */}
      <div className="gradient-brand-bg rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-5 w-32 h-32 rounded-full bg-white/5" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm mb-1">{greeting}</p>
            {isProfessional && user?.currentTitle && (
              <p className="text-white/70 text-xs mb-1">{user.currentTitle}{user?.currentCompany ? ` @ ${user.currentCompany}` : ''}</p>
            )}
            <p className="text-white/75 text-sm">{sub}</p>
          </div>
          <Link to="/roadmap" className="shrink-0 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all">
            {stats?.roadmapProgress ? 'Continue roadmap' : 'Generate roadmap'} <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Career score"     value={loading ? '—' : `${stats?.profileScore || 0}%`}        sub="Profile strength"       icon={Target}    color="bg-navy-50 dark:bg-navy-900/30 text-navy-600"    borderColor="border-l-navy-600" />
        <StatCard label="Roadmap"          value={loading ? '—' : `${stats?.roadmapProgress || 0}%`}      sub={stats?.targetRole || 'Set a target role'} icon={Map} color="bg-teal-50 dark:bg-teal-900/30 text-teal-600" borderColor="border-l-teal-600" />
        <StatCard label="Assessments"      value={loading ? '—' : stats?.totalAssessments || 0}            sub="domains tested"        icon={Brain}     color="bg-violet-50 dark:bg-violet-900/30 text-violet-600" borderColor="border-l-violet-600" />
        <StatCard label="Day streak"       value={loading ? '—' : `🔥 ${stats?.streak?.current || 0}`}    sub={`Best: ${stats?.streak?.longest || 0}d`} icon={Flame} color="bg-amber-50 dark:bg-amber-900/20 text-amber-600" borderColor="border-l-amber-500" />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Skill radar */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-700 text-surface-900 dark:text-white">Skill radar</h3>
            <Link to="/assessment" className="text-xs text-navy-600 dark:text-navy-300 hover:underline">Take test →</Link>
          </div>
          {skillData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={skillData}>
                <PolarGrid stroke="currentColor" className="text-surface-200 dark:text-surface-700" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'currentColor' }} className="text-surface-500" />
                <Radar name="Skills" dataKey="score" stroke="#0F4C81" fill="#0F4C81" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Brain size={28} className="text-surface-300 mb-2" />
              <p className="text-xs text-surface-400">Add skills to your profile to see your radar</p>
              <Link to="/profile" className="text-xs text-navy-600 mt-2 hover:underline">Add skills →</Link>
            </div>
          )}
        </div>

        {/* Activity chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-700 text-surface-900 dark:text-white">Weekly activity</h3>
            <span className="badge-accent text-xs">This week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ACTIVITY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-surface-100 dark:text-surface-700" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="score" stroke="#00C9A7" strokeWidth={2.5} dot={{ r: 4, fill: '#00C9A7' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Roadmap progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-700 text-surface-900 dark:text-white">Active roadmap</h3>
            <Link to="/roadmap" className="text-xs text-navy-600 dark:text-navy-300 hover:underline">View all →</Link>
          </div>
          {stats?.targetRole ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300 truncate mr-2">{stats.targetRole}</span>
                  <span className="text-sm text-teal-600 font-medium shrink-0">{stats.roadmapProgress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${stats.roadmapProgress}%` }} /></div>
              </div>
              <div className="space-y-2">
                {['Set up profile', 'Take skill assessment', 'Generate roadmap'].map((task, i) => (
                  <div key={task} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 size={15} className={i < 2 ? 'text-teal-500' : 'text-surface-300 dark:text-surface-600'} />
                    <span className={i < 2 ? 'text-surface-500 line-through' : 'text-surface-700 dark:text-surface-300'}>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Map size={32} className="text-surface-300 dark:text-surface-600 mb-3" />
              <p className="text-sm text-surface-500 mb-4">No roadmap yet. Generate your personalised path.</p>
              <Link to="/roadmap" className="btn-primary text-xs px-4 py-2 rounded-lg">Generate roadmap</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-display text-base font-700 text-surface-900 dark:text-white mb-3">Quick actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label, href, color, border }) => (
            <Link key={label} to={href} className={clsx('flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-card bg-white dark:bg-surface-800 text-center', border)}>
              <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
                <Icon size={17} />
              </div>
              <span className="text-xs font-medium text-surface-700 dark:text-surface-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent assessments */}
      {stats?.recentAssessments?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-700 text-surface-900 dark:text-white">Recent assessments</h3>
            <Link to="/assessment" className="text-xs text-navy-600 dark:text-navy-300 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {stats.recentAssessments.map((a) => (
              <div key={a._id} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center shrink-0">
                  <Brain size={16} className="text-navy-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-300 truncate">{a.domain}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="progress-bar w-20"><div className="progress-fill" style={{ width: `${a.score}%` }} /></div>
                    <span className="text-xs text-surface-500">{a.score}%</span>
                  </div>
                </div>
                <span className={clsx('badge text-xs', a.skillLevel === 'Advanced' ? 'badge-accent' : a.skillLevel === 'Intermediate' ? 'badge-primary' : 'badge-warning')}>
                  {a.skillLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}