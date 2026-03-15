import { useState, useEffect } from 'react'
import { Map, Sparkles, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, RotateCcw } from 'lucide-react'
import { roadmapService } from '@services/index'
import { useAuthStore } from '@store/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Field → roles mapping — same as onboarding
const FIELD_ROLES = {
  'Technology':            ['Software Engineer','Full Stack Developer','Frontend Developer','Backend Developer','Data Scientist','ML Engineer','DevOps Engineer','Cloud Architect','Cybersecurity Analyst','Mobile Developer','QA Engineer','Data Engineer'],
  'Business & Management': ['Product Manager','Business Analyst','Operations Manager','Strategy Consultant','Scrum Master','Project Manager','Management Consultant','Chief of Staff','Program Manager'],
  'Finance & Accounting':  ['Financial Analyst','Investment Banker','Chartered Accountant','Risk Analyst','Portfolio Manager','Tax Consultant','Auditor','CFO','Equity Research Analyst'],
  'Law & Legal':           ['Corporate Lawyer','Legal Analyst','Compliance Officer','Legal Counsel','Public Prosecutor','IP Attorney','Paralegal','In-house Counsel'],
  'Arts & Design':         ['UX Designer','Graphic Designer','Art Director','Motion Designer','Illustrator','Photographer','Creative Director','Brand Designer','Product Designer'],
  'Marketing & Media':     ['Marketing Manager','Content Strategist','Brand Manager','SEO Specialist','Social Media Manager','Copywriter','PR Manager','Growth Marketer','Performance Marketer'],
  'Healthcare & Medicine': ['Doctor','Healthcare Analyst','Medical Researcher','Pharmacist','Public Health Officer','Healthcare Manager','Clinical Research Associate','Nurse Practitioner'],
  'Engineering (Non-CS)':  ['Mechanical Engineer','Civil Engineer','Electrical Engineer','Manufacturing Engineer','Quality Engineer','Structural Engineer','Process Engineer','Aerospace Engineer'],
  'Education':             ['Teacher','Curriculum Designer','Education Consultant','School Principal','EdTech Specialist','Training Manager','Instructional Designer','Academic Counselor'],
  'Science & Research':    ['Research Scientist','Lab Analyst','Data Analyst','Science Writer','R&D Engineer','Environmental Scientist','Biotech Researcher','Clinical Scientist'],
  'Other':                 ['Entrepreneur','Freelancer','Social Worker','NGO Manager','Government Officer','Journalist','Policy Analyst','Community Manager'],
}

export default function Roadmap() {
  const [roadmap, setRoadmap]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [generating, setGenerating] = useState(false)
  const [targetRole, setTargetRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [expanded, setExpanded]     = useState({})
  const { user }                    = useAuthStore()

  // Get roles for user's field
  const userField   = user?.field || 'Technology'
  const fieldRoles  = FIELD_ROLES[userField] || FIELD_ROLES['Technology']
  // Pre-fill target role from profile if set
  const defaultRole = user?.targetRole || ''

  useEffect(() => {
    if (defaultRole) setTargetRole(defaultRole)
    roadmapService.get()
      .then(r => setRoadmap(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const generate = async () => {
    const role = customRole.trim() || targetRole
    if (!role) return toast.error('Select or enter a target role')
    setGenerating(true)
    try {
      const r = await roadmapService.generate(role)
      setRoadmap(r.data.data)
      toast.success('Roadmap generated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed')
    } finally { setGenerating(false) }
  }

  const toggleMilestone = async (milestoneId, completed) => {
    try {
      const r = await roadmapService.updateMilestone(milestoneId, { completed })
      setRoadmap(r.data.data)
    } catch { toast.error('Update failed') }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!roadmap) return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white mb-1">Career Roadmap</h1>
        <p className="text-surface-500 text-sm">
          Showing roles for <strong className="text-navy-600 dark:text-navy-300">{userField}</strong> — your selected field
        </p>
      </div>

      <div className="card p-8">
        <div className="w-16 h-16 rounded-2xl gradient-brand-bg flex items-center justify-center mx-auto mb-5">
          <Map size={28} className="text-white" />
        </div>
        <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white mb-2 text-center">Generate your roadmap</h2>
        <p className="text-surface-500 text-sm mb-6 text-center">
          Our AI analyses your skills and builds a step-by-step milestone plan with resources tailored to your field.
        </p>

        <div className="space-y-4">
          {/* Field-specific role dropdown */}
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">
              Target role <span className="text-surface-400">(for {userField})</span>
            </label>
            <select
              value={targetRole}
              onChange={e => { setTargetRole(e.target.value); setCustomRole('') }}
              className="input"
            >
              <option value="">Select from your field...</option>
              {fieldRoles.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {/* Or type custom */}
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">
              Or type a specific role
            </label>
            <input
              className="input"
              placeholder={`e.g. ${fieldRoles[0]}, ${fieldRoles[1]}...`}
              value={customRole}
              onChange={e => { setCustomRole(e.target.value); setTargetRole('') }}
            />
          </div>

          <button
            onClick={generate}
            disabled={generating || (!targetRole && !customRole.trim())}
            className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {generating
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Sparkles size={15} />
            }
            Generate AI roadmap
          </button>
        </div>
      </div>
    </div>
  )

  const done = roadmap.milestones.filter(m => m.completed).length

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white mb-1">{roadmap.targetRole}</h1>
          <p className="text-surface-500 text-sm">{done} of {roadmap.milestones.length} milestones completed</p>
        </div>
        <button onClick={() => setRoadmap(null)} className="btn-ghost text-xs flex items-center gap-1.5 shrink-0">
          <RotateCcw size={13} /> New roadmap
        </button>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Overall progress</span>
          <span className="text-sm font-700 text-teal-600">{roadmap.overallProgress}%</span>
        </div>
        <div className="progress-bar h-3"><div className="progress-fill h-3" style={{ width: `${roadmap.overallProgress}%` }} /></div>
        {roadmap.summary && <p className="text-xs text-surface-500 mt-3 leading-relaxed">{roadmap.summary}</p>}
      </div>

      {/* Alternative paths */}
      {roadmap.alternativePaths?.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-600 text-surface-500 uppercase tracking-wider mb-3">You could also pursue</p>
          <div className="flex flex-wrap gap-2">
            {roadmap.alternativePaths.map(p => (
              <div key={p.role} className="badge-primary text-xs flex items-center gap-1.5">
                {p.role} <span className="opacity-70">· {p.matchScore}% match</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="space-y-3">
        {roadmap.milestones.map((m, idx) => (
          <div key={m._id} className={clsx('card overflow-hidden transition-all duration-200', m.completed && 'opacity-75')}>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <button
                    onClick={() => toggleMilestone(m._id, !m.completed)}
                    className={clsx('w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
                      m.completed ? 'border-teal-500 bg-teal-500 text-white' : 'border-surface-300 dark:border-surface-600 hover:border-navy-400'
                    )}
                  >
                    {m.completed ? <CheckCircle2 size={16} /> : <span className="text-xs font-700 text-surface-400">{idx + 1}</span>}
                  </button>
                  {idx < roadmap.milestones.length - 1 && (
                    <div className="w-0.5 h-4 bg-surface-200 dark:bg-surface-700 mt-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={clsx('font-display text-base font-700 mb-1', m.completed ? 'text-surface-400 line-through' : 'text-surface-900 dark:text-white')}>
                        {m.title}
                      </h3>
                      <p className="text-xs text-surface-500 leading-relaxed">{m.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-surface-400 whitespace-nowrap">~{m.estimatedDays}d</span>
                      <button onClick={() => setExpanded(p => ({ ...p, [m._id]: !p[m._id] }))} className="btn-ghost p-1">
                        {expanded[m._id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {expanded[m._id] && m.resources?.length > 0 && (
              <div className="border-t border-surface-100 dark:border-surface-700 px-5 py-4 bg-surface-50 dark:bg-surface-900/50">
                <p className="text-xs font-600 text-surface-500 uppercase tracking-wider mb-3">Resources</p>
                <div className="space-y-2">
                  {m.resources.map((r, ri) => (
                    <a key={ri} href={r.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-surface-800 transition-colors group"
                    >
                      <div className={clsx('w-7 h-7 rounded-md flex items-center justify-center text-xs shrink-0',
                        r.isFree ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                      )}>
                        {r.type === 'video' ? '▶' : r.type === 'course' ? '📚' : r.type === 'article' ? '📄' : '🔧'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-700 dark:text-surface-300 truncate group-hover:text-navy-600">{r.title}</p>
                        <p className="text-xs text-surface-400">{r.platform} · {r.isFree ? 'Free' : 'Paid'} · ~{r.estimatedMinutes}min</p>
                      </div>
                      <ExternalLink size={13} className="text-surface-400 group-hover:text-navy-500 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}