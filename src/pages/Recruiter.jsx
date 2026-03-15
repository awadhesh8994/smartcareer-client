import { useState, useEffect } from 'react'
import { Building2, Plus, Users, Briefcase, TrendingUp, CheckCircle2, X, ChevronRight, Edit2 } from 'lucide-react'
import LocationInput from '@components/common/LocationInput'
import api from '@services/axiosInstance'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_COLORS = {
  saved:'bg-surface-100 text-surface-600',applied:'bg-navy-50 text-navy-600',
  shortlisted:'bg-teal-50 text-teal-700',interview:'bg-violet-50 text-violet-600',
  rejected:'bg-red-50 text-red-600',offered:'bg-amber-50 text-amber-700'
}

export default function Recruiter() {
  const [tab, setTab]             = useState('setup')
  const [profile, setProfile]     = useState(null)
  const [jobs, setJobs]           = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading]     = useState(true)
  const [setupForm, setSetupForm] = useState({ companyName: '', website: '', industry: '', about: '' })
  const [jobForm, setJobForm]     = useState({ title: '', company: '', location: '', type: 'full-time', isRemote: false, description: '', skillsRequired: '', experienceLevel: 'Fresher', applyLink: '' })
  const [showJobForm, setShowJobForm] = useState(false)

  useEffect(() => {
    api.get('/recruiter/profile')
      .then(r => { setProfile(r.data.data); setTab('dashboard'); loadDashboard() })
      .catch(() => setTab('setup'))
      .finally(() => setLoading(false))
  }, [])

  const loadDashboard = async () => {
    const [d, j] = await Promise.all([api.get('/recruiter/dashboard'), api.get('/recruiter/jobs')])
    setDashboard(d.data.data)
    setJobs(j.data.data)
  }

  const handleSetup = async (e) => {
    e.preventDefault()
    try {
      const r = await api.post('/recruiter/setup', setupForm)
      setProfile(r.data.data)
      setTab('dashboard')
      loadDashboard()
      toast.success('Recruiter profile created!')
    } catch (err) { toast.error(err.response?.data?.message || 'Setup failed') }
  }

  const handlePostJob = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...jobForm, skillsRequired: jobForm.skillsRequired.split(',').map(s => s.trim()).filter(Boolean) }
      await api.post('/recruiter/jobs', payload)
      toast.success('Job posted!')
      setShowJobForm(false)
      setJobForm({ title: '', company: profile?.companyName || '', location: '', type: 'full-time', isRemote: false, description: '', skillsRequired: '', experienceLevel: 'Fresher', applyLink: '' })
      loadDashboard()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post job') }
  }

  const loadCandidates = async (jobId) => {
    setSelectedJob(jobs.find(j => j._id === jobId))
    const r = await api.get(`/recruiter/jobs/${jobId}/candidates`)
    setCandidates(r.data.data)
    setTab('candidates')
  }

  const updateStatus = async (appId, status) => {
    try {
      await api.patch(`/recruiter/applications/${appId}`, { status })
      const r = await api.get(`/recruiter/jobs/${selectedJob._id}/candidates`)
      setCandidates(r.data.data)
      toast.success('Status updated')
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-brand-bg flex items-center justify-center">
          <Building2 size={20} className="text-white" />
        </div>
        <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white">Recruiter Portal</h1>
      </div>

      {/* Setup form */}
      {tab === 'setup' && (
        <div className="card p-8 max-w-lg">
          <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white mb-2">Set up your recruiter profile</h2>
          <p className="text-surface-500 text-sm mb-6">Create your company profile to start posting jobs and finding candidates.</p>
          <form onSubmit={handleSetup} className="space-y-4">
            <div><label className="block text-xs font-medium text-surface-500 mb-1.5">Company name *</label><input className="input" required value={setupForm.companyName} onChange={e => setSetupForm(p => ({ ...p, companyName: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-surface-500 mb-1.5">Website</label><input className="input" placeholder="https://company.com" value={setupForm.website} onChange={e => setSetupForm(p => ({ ...p, website: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-surface-500 mb-1.5">Industry</label>
              <select className="input" value={setupForm.industry} onChange={e => setSetupForm(p => ({ ...p, industry: e.target.value }))}>
                <option value="">Select industry...</option>
                {['Technology','Finance','Healthcare','Education','E-commerce','Consulting','Other'].map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-medium text-surface-500 mb-1.5">About company</label><textarea className="input resize-none h-20" value={setupForm.about} onChange={e => setSetupForm(p => ({ ...p, about: e.target.value }))} /></div>
            <button type="submit" className="btn-primary w-full py-3 rounded-xl justify-center">Create Recruiter Profile</button>
          </form>
        </div>
      )}

      {/* Dashboard */}
      {tab === 'dashboard' && profile && (
        <>
          {/* Company header */}
          <div className="card p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl gradient-brand-bg flex items-center justify-center text-white font-display text-2xl font-700 shrink-0">
              {profile.companyName?.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white">{profile.companyName}</h2>
              <p className="text-sm text-surface-500">{profile.industry} {profile.website && `· ${profile.website}`}</p>
            </div>
            <button onClick={() => setTab('setup')} className="btn-ghost text-xs flex items-center gap-1.5"><Edit2 size={13} /> Edit</button>
          </div>

          {/* Stats */}
          {dashboard && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Active jobs',     value: dashboard.activeJobs,        color: 'border-l-navy-600' },
                { label: 'Applications',    value: dashboard.totalApplications,  color: 'border-l-teal-600' },
                { label: 'Shortlisted',     value: dashboard.shortlisted,        color: 'border-l-amber-500' },
                { label: 'Interviews',      value: dashboard.interviews,         color: 'border-l-violet-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className={clsx('card p-4 border-l-4', color)}>
                  <div className="font-display text-2xl font-700 text-surface-900 dark:text-white">{value || 0}</div>
                  <div className="text-xs text-surface-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Post job button */}
          <div className="flex justify-between items-center">
            <h3 className="font-display text-lg font-700 text-surface-900 dark:text-white">Posted Jobs</h3>
            <button onClick={() => setShowJobForm(true)} className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2"><Plus size={15} /> Post Job</button>
          </div>

          {/* Post job form */}
          {showJobForm && (
            <div className="card p-6">
              <div className="flex justify-between mb-4">
                <h3 className="font-display text-base font-700 text-surface-900 dark:text-white">New Job Posting</h3>
                <button onClick={() => setShowJobForm(false)} className="btn-ghost p-1"><X size={16} /></button>
              </div>
              <form onSubmit={handlePostJob} className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-surface-500 mb-1.5">Job title *</label><input className="input" required value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div><label className="block text-xs font-medium text-surface-500 mb-1.5">Company *</label><input className="input" required value={jobForm.company || profile.companyName} onChange={e => setJobForm(p => ({ ...p, company: e.target.value }))} /></div>
                <div><label className="block text-xs font-medium text-surface-500 mb-1.5">Location</label><LocationInput value={jobForm.location} onChange={val => setJobForm(p => ({ ...p, location: val }))} placeholder="Start typing city..." /></div>
                <div><label className="block text-xs font-medium text-surface-500 mb-1.5">Type</label>
                  <select className="input" value={jobForm.type} onChange={e => setJobForm(p => ({ ...p, type: e.target.value }))}>
                    {['full-time','part-time','internship','contract'].map(t => <option key={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-surface-500 mb-1.5">Experience Level</label>
                  <select className="input" value={jobForm.experienceLevel} onChange={e => setJobForm(p => ({ ...p, experienceLevel: e.target.value }))}>
                    {['Fresher','0-1 years','1-2 years','2-5 years','5+ years'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-surface-500 mb-1.5">Apply Link</label><input className="input" placeholder="https://..." value={jobForm.applyLink} onChange={e => setJobForm(p => ({ ...p, applyLink: e.target.value }))} /></div>
                <div className="sm:col-span-2"><label className="block text-xs font-medium text-surface-500 mb-1.5">Required Skills (comma separated)</label><input className="input" placeholder="React, Node.js, MongoDB" value={jobForm.skillsRequired} onChange={e => setJobForm(p => ({ ...p, skillsRequired: e.target.value }))} /></div>
                <div className="sm:col-span-2"><label className="block text-xs font-medium text-surface-500 mb-1.5">Job Description</label><textarea className="input resize-none h-24" value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" className="btn-primary px-6 py-2.5 rounded-xl">Post Job</button>
                  <button type="button" onClick={() => setShowJobForm(false)} className="btn-ghost px-4 py-2.5 rounded-xl">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Jobs list */}
          {jobs.length === 0 ? (
            <div className="card p-12 text-center"><Briefcase size={40} className="text-surface-300 mx-auto mb-3" /><p className="text-surface-500 text-sm">No jobs posted yet.</p></div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job._id} className="card p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-surface-800 dark:text-surface-200">{job.title}</p>
                      <span className={clsx('badge text-xs', job.isActive ? 'badge-accent' : 'badge-warning')}>{job.isActive ? 'Active' : 'Closed'}</span>
                    </div>
                    <p className="text-xs text-surface-500">{job.location} · {job.type} · {job.experienceLevel}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {job.skillsRequired?.slice(0, 3).map(s => <span key={s} className="text-2xs px-1.5 py-0.5 bg-surface-100 dark:bg-surface-700 rounded text-surface-500">{s}</span>)}
                  </div>
                  <button onClick={() => loadCandidates(job._id)} className="btn-outline text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 shrink-0">
                    <Users size={13} /> Candidates <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Candidates */}
      {tab === 'candidates' && selectedJob && (
        <>
          <button onClick={() => setTab('dashboard')} className="btn-ghost text-sm flex items-center gap-2">← Back to jobs</button>
          <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white">Candidates for: {selectedJob.title}</h2>
          {candidates.length === 0 ? (
            <div className="card p-12 text-center"><Users size={40} className="text-surface-300 mx-auto mb-3" /><p className="text-surface-500 text-sm">No candidates yet.</p></div>
          ) : (
            <div className="space-y-3">
              {candidates.map((item, i) => {
                const candidate = item.userId || item.student
                const appId     = item._id
                const status    = item.status
                const fitScore  = item.fitScore
                return (
                  <div key={i} className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full gradient-brand-bg flex items-center justify-center text-white font-700 shrink-0">
                      {candidate?.name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-surface-800 dark:text-surface-200">{candidate?.name}</p>
                      <p className="text-xs text-surface-500">{candidate?.email} · {candidate?.experienceLevel}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {candidate?.skills?.slice(0, 3).map(s => <span key={s.name} className="text-2xs px-1.5 py-0.5 bg-navy-50 dark:bg-navy-900/30 text-navy-600 rounded">{s.name}</span>)}
                      </div>
                    </div>
                    {fitScore !== undefined && (
                      <div className="text-center shrink-0">
                        <div className={clsx('font-display text-lg font-800', fitScore >= 75 ? 'text-teal-600' : fitScore >= 50 ? 'text-amber-500' : 'text-surface-400')}>{fitScore}%</div>
                        <div className="text-2xs text-surface-400">fit</div>
                      </div>
                    )}
                    {appId && status ? (
                      <select value={status} onChange={e => updateStatus(appId, e.target.value)} className={clsx('text-xs px-2.5 py-1.5 rounded-lg border-0 font-medium cursor-pointer shrink-0', STATUS_COLORS[status])}>
                        {['applied','shortlisted','interview','rejected','offered'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    ) : (
                      <span className="badge-primary text-xs shrink-0">Suggested</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}