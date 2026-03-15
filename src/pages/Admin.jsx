import { useState, useEffect } from 'react'
import { Users, BarChart3, Shield, Trash2, CheckCircle2, XCircle, Clock, Building2 } from 'lucide-react'
import api from '@services/axiosInstance'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function Admin() {
  const [tab, setTab]             = useState('stats')
  const [stats, setStats]         = useState(null)
  const [users, setUsers]         = useState([])
  const [pending, setPending]     = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, u, p] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/recruiters/pending'),
      ])
      setStats(s.data.data)
      setUsers(u.data.data)
      setPending(p.data.data)
    } catch {}
    finally { setLoading(false) }
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(p => p.filter(u => u._id !== id))
      toast.success('User deleted')
    } catch { toast.error('Failed') }
  }

  const updateRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role })
      setUsers(p => p.map(u => u._id === id ? { ...u, role } : u))
      toast.success('Role updated')
    } catch { toast.error('Failed') }
  }

  const approveRecruiter = async (id) => {
    try {
      await api.patch(`/admin/recruiters/${id}/approve`)
      setPending(p => p.filter(r => r._id !== id))
      toast.success('Recruiter approved! Email sent.')
      loadAll()
    } catch { toast.error('Failed') }
  }

  const rejectRecruiter = async (id) => {
    const reason = prompt('Reason for rejection (optional):')
    try {
      await api.patch(`/admin/recruiters/${id}/reject`, { reason })
      setPending(p => p.filter(r => r._id !== id))
      toast.success('Recruiter rejected')
      loadAll()
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <Shield size={20} className="text-red-600" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white">Admin Panel</h1>
          {stats?.pendingRecruiters > 0 && (
            <p className="text-xs text-amber-600 font-medium">⚠️ {stats.pendingRecruiters} recruiter{stats.pendingRecruiters > 1 ? 's' : ''} pending approval</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit flex-wrap">
        {[
          ['stats',     'Platform Stats',      BarChart3],
          ['pending',   `Pending Recruiters ${pending.length > 0 ? `(${pending.length})` : ''}`, Clock],
          ['users',     'All Users',           Users],
        ].map(([t, l, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={clsx(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            tab === t ? 'bg-white dark:bg-surface-700 shadow-card text-surface-900 dark:text-white' : 'text-surface-500 hover:text-surface-700',
            t === 'pending' && pending.length > 0 && tab !== t ? 'text-amber-600' : ''
          )}>
            <Icon size={14} />{l}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === 'stats' && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total users',          value: stats.totalUsers,          color: 'text-navy-600' },
            { label: 'Assessments done',     value: stats.totalAssessments,    color: 'text-violet-600' },
            { label: 'Roadmaps created',     value: stats.totalRoadmaps,       color: 'text-teal-600' },
            { label: 'Forum posts',          value: stats.totalForumPosts,     color: 'text-amber-600' },
            { label: 'New users (7d)',        value: stats.newUsersThisWeek,    color: 'text-green-600' },
            { label: 'Pending recruiters',   value: stats.pendingRecruiters,   color: 'text-amber-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-5">
              <div className={clsx('font-display text-3xl font-800 mb-1', color)}>{value || 0}</div>
              <div className="text-xs text-surface-500">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pending recruiters */}
      {tab === 'pending' && (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <div className="card p-12 text-center">
              <CheckCircle2 size={40} className="text-teal-400 mx-auto mb-3" />
              <p className="text-surface-500 text-sm">No pending recruiter applications.</p>
            </div>
          ) : pending.map(r => (
            <div key={r._id} className="card p-5 border-l-4 border-l-amber-400">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                  <Building2 size={22} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-display text-base font-700 text-surface-900 dark:text-white">{r.companyName}</p>
                    <span className="badge-warning text-xs">Pending approval</span>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400">{r.name} · {r.email}</p>
                  <p className="text-xs text-surface-400 mt-1">Applied: {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => approveRecruiter(r._id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <CheckCircle2 size={13} /> Approve
                  </button>
                  <button
                    onClick={() => rejectRecruiter(r._id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All users */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
                <th className="text-left px-4 py-3 text-xs font-600 text-surface-500">User</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-surface-500">Role</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-surface-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-surface-500">Profile</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full gradient-brand-bg flex items-center justify-center text-white text-xs font-700 shrink-0">
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-surface-800 dark:text-surface-200">{u.name}</p>
                        <p className="text-xs text-surface-400">{u.email}</p>
                        {u.companyName && <p className="text-xs text-teal-600">{u.companyName}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={e => updateRole(u._id, e.target.value)}
                      className="text-xs border border-surface-200 dark:border-surface-600 rounded-lg px-2 py-1 bg-white dark:bg-surface-800"
                    >
                      <option value="student">Student</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === 'recruiter' ? (
                      <span className={clsx('badge text-xs', {
                        'badge-warning': u.recruiterStatus === 'pending',
                        'badge-accent':  u.recruiterStatus === 'active',
                        'badge-danger':  u.recruiterStatus === 'rejected',
                      })}>
                        {u.recruiterStatus || 'N/A'}
                      </span>
                    ) : (
                      <span className="badge-primary text-xs capitalize">{u.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-16">
                        <div className="progress-fill" style={{ width: `${u.profileCompletionScore || 0}%` }} />
                      </div>
                      <span className="text-xs text-surface-500">{u.profileCompletionScore || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteUser(u._id)} className="text-surface-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}