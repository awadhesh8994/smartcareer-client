import { useState, useEffect } from 'react'
import { Briefcase, MapPin, Clock, Zap, Bookmark, CheckCircle2, Filter, Search, TrendingUp, X } from 'lucide-react'
import api from '@services/axiosInstance'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_COLORS = {
  saved:       'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400',
  applied:     'bg-navy-50 dark:bg-navy-900/40 text-navy-600 dark:text-navy-300',
  shortlisted: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  interview:   'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300',
  rejected:    'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  offered:     'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
}

const STATUSES = ['saved','applied','shortlisted','interview','rejected','offered']

function JobCard({ job, onSave, onApply, applicationStatus }) {
  const score = job.fitScore
  const scoreColor = score >= 75 ? 'text-teal-600' : score >= 50 ? 'text-amber-500' : 'text-surface-400'
  return (
    <div className="card p-5 hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center text-navy-600 font-display font-700 text-base shrink-0">
          {job.company?.charAt(0) || 'C'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-700 text-surface-900 dark:text-white truncate">{job.title}</h3>
          <p className="text-sm text-surface-500">{job.company}</p>
        </div>
        {score !== undefined && (
          <div className="text-right shrink-0">
            <div className={clsx('font-display text-lg font-800', scoreColor)}>{score}%</div>
            <div className="text-2xs text-surface-400">match</div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {job.location && (
          <span className="flex items-center gap-1 text-xs text-surface-500">
            <MapPin size={11} />{job.location}
          </span>
        )}
        <span className={clsx('badge text-xs capitalize', job.type === 'internship' ? 'badge-accent' : job.isRemote ? 'badge-violet' : 'badge-primary')}>
          {job.isRemote ? 'Remote' : job.type}
        </span>
        {job.experienceLevel && (
          <span className="flex items-center gap-1 text-xs text-surface-500">
            <Clock size={11} />{job.experienceLevel}
          </span>
        )}
      </div>

      {job.skillsRequired?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skillsRequired.slice(0, 4).map(s => (
            <span key={s} className="text-2xs px-2 py-0.5 bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 rounded-full">{s}</span>
          ))}
          {job.skillsRequired.length > 4 && <span className="text-2xs text-surface-400">+{job.skillsRequired.length - 4}</span>}
        </div>
      )}

      {job.fitReasons?.length > 0 && (
        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-2.5 mb-4">
          <p className="text-xs text-teal-700 dark:text-teal-300 leading-relaxed">✦ {job.fitReasons[0]}</p>
        </div>
      )}

      <div className="flex gap-2">
        {applicationStatus ? (
          <span className={clsx('flex-1 text-center py-2 rounded-lg text-xs font-medium capitalize', STATUS_COLORS[applicationStatus])}>
            <CheckCircle2 size={12} className="inline mr-1" />{applicationStatus}
          </span>
        ) : (
          <>
            <button onClick={() => onSave(job._id)} className="btn-outline text-xs px-3 py-2 rounded-lg flex items-center gap-1.5">
              <Bookmark size={12} /> Save
            </button>
            <button onClick={() => onApply(job)} className="btn-primary text-xs px-4 py-2 rounded-lg flex-1 justify-center flex items-center gap-1.5">
              <Zap size={12} /> Apply
            </button>
          </>
        )}
        {job.applyLink && (
          <a href={job.applyLink} target="_blank" rel="noreferrer" className="btn-ghost text-xs px-3 py-2 rounded-lg">↗</a>
        )}
      </div>
    </div>
  )
}

export default function Jobs() {
  const [tab, setTab]             = useState('matched')
  const [jobs, setJobs]           = useState([])
  const [applications, setApps]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filters, setFilters]     = useState({ type: '', location: '', experienceLevel: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [kanbanStatus, setKanbanStatus] = useState('all')

  useEffect(() => { loadData() }, [tab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (tab === 'matched') {
        const r = await api.get('/jobs/matched')
        setJobs(r.data.data || [])
      } else if (tab === 'browse') {
        const params = new URLSearchParams({ ...filters })
        if (search) params.set('search', search)
        const r = await api.get(`/jobs?${params}`)
        setJobs(r.data.data || [])
      } else {
        const r = await api.get('/jobs/applications')
        setApps(r.data.data || [])
      }
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const handleSave = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/save`)
      toast.success('Job saved!')
      const r = await api.get('/jobs/applications')
      setApps(r.data.data || [])
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleApply = async (job) => {
    try {
      await api.post(`/jobs/${job._id}/apply`, { fitScore: job.fitScore, fitReasons: job.fitReasons })
      toast.success('Application submitted!')
      loadData()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const updateStatus = async (appId, status) => {
    try {
      await api.post(`/jobs/applications/${appId}`, { status })
      const r = await api.get('/jobs/applications')
      setApps(r.data.data || [])
      toast.success('Status updated')
    } catch { toast.error('Failed to update') }
  }

  const getAppStatus = (jobId) => applications.find(a => a.jobId?._id === jobId)?.status

  const filteredApps = kanbanStatus === 'all' ? applications : applications.filter(a => a.status === kanbanStatus)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white">Job Matching</h1>
        <span className="badge-primary text-xs">{applications.length} applications</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit">
        {[['matched','AI Matched',Zap],['browse','Browse All',Search],['tracker','My Applications',Briefcase]].map(([t,l,Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={clsx('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === t ? 'bg-white dark:bg-surface-700 shadow-card text-surface-900 dark:text-white' : 'text-surface-500 hover:text-surface-700')}>
            <Icon size={14} />{l}
          </button>
        ))}
      </div>

      {/* Browse filters */}
      {tab === 'browse' && (
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input className="input pl-8 text-sm" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadData()} />
          </div>
          <select className="input w-36 text-sm" value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
            <option value="">All types</option>
            {['full-time','part-time','internship','contract','remote'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
          <select className="input w-40 text-sm" value={filters.experienceLevel} onChange={e => setFilters(p => ({ ...p, experienceLevel: e.target.value }))}>
            <option value="">All levels</option>
            {['Fresher','0-1 years','1-2 years','2-5 years'].map(l => <option key={l}>{l}</option>)}
          </select>
          <button onClick={loadData} className="btn-primary px-4 rounded-xl text-sm">Search</button>
        </div>
      )}

      {/* Kanban filter for tracker */}
      {tab === 'tracker' && (
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setKanbanStatus(s)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all', kanbanStatus === s ? 'bg-navy-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200')}>
              {s} {s !== 'all' && `(${applications.filter(a => a.status === s).length})`}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Matched / Browse jobs grid */}
          {(tab === 'matched' || tab === 'browse') && (
            <>
              {jobs.length === 0 ? (
                <div className="card p-12 text-center">
                  <Briefcase size={40} className="text-surface-300 mx-auto mb-4" />
                  <h3 className="font-display text-lg font-700 text-surface-900 dark:text-white mb-2">
                    {tab === 'matched' ? 'No matched jobs yet' : 'No jobs found'}
                  </h3>
                  <p className="text-surface-500 text-sm">
                    {tab === 'matched' ? 'Complete your profile with skills and target role to get AI-matched jobs.' : 'Try different search terms or filters.'}
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.map(job => (
                    <JobCard key={job._id} job={job} onSave={handleSave} onApply={handleApply} applicationStatus={getAppStatus(job._id)} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Application tracker */}
          {tab === 'tracker' && (
            <>
              {filteredApps.length === 0 ? (
                <div className="card p-12 text-center">
                  <TrendingUp size={40} className="text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-500 text-sm">No applications {kanbanStatus !== 'all' ? `with status "${kanbanStatus}"` : 'yet'}.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApps.map(app => (
                    <div key={app._id} className="card p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center text-navy-600 font-700 shrink-0">
                        {app.jobId?.company?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-surface-800 dark:text-surface-200 truncate">{app.jobId?.title || 'Unknown Job'}</p>
                        <p className="text-xs text-surface-500">{app.jobId?.company} · {app.jobId?.location}</p>
                      </div>
                      {app.fitScore > 0 && <span className="text-sm font-700 text-teal-600 shrink-0">{app.fitScore}%</span>}
                      <select
                        value={app.status}
                        onChange={e => updateStatus(app._id, e.target.value)}
                        className={clsx('text-xs px-2.5 py-1.5 rounded-lg border-0 font-medium cursor-pointer', STATUS_COLORS[app.status])}
                      >
                        {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
