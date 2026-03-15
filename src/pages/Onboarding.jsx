import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import api from '@services/axiosInstance'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ── Data ──────────────────────────────────────────────────────────
const USER_TYPES = [
  { id: 'Student',                    icon: '🎓', desc: 'Currently studying or recently graduated' },
  { id: 'Working Professional',       icon: '💼', desc: 'Currently employed, looking to grow' },
  { id: 'Career Switcher',            icon: '🔄', desc: 'Transitioning to a completely new field' },
  { id: 'Freelancer / Entrepreneur',  icon: '🚀', desc: 'Self-employed or building your own thing' },
]

const FIELDS = [
  { id: 'Technology',            icon: '💻', color: 'border-navy-300 dark:border-navy-600 hover:bg-navy-50 dark:hover:bg-navy-900/30',       active: 'border-navy-600 bg-navy-50 dark:bg-navy-900/40' },
  { id: 'Business & Management', icon: '📊', color: 'border-amber-300 dark:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20',   active: 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' },
  { id: 'Finance & Accounting',  icon: '💰', color: 'border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',   active: 'border-green-600 bg-green-50 dark:bg-green-900/30' },
  { id: 'Law & Legal',           icon: '⚖️', color: 'border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20', active: 'border-purple-600 bg-purple-50 dark:bg-purple-900/30' },
  { id: 'Arts & Design',         icon: '🎨', color: 'border-pink-300 dark:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20',       active: 'border-pink-600 bg-pink-50 dark:bg-pink-900/30' },
  { id: 'Marketing & Media',     icon: '📢', color: 'border-orange-300 dark:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20', active: 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' },
  { id: 'Healthcare & Medicine', icon: '🏥', color: 'border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',           active: 'border-red-600 bg-red-50 dark:bg-red-900/30' },
  { id: 'Engineering (Non-CS)',  icon: '⚙️', color: 'border-teal-300 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20',       active: 'border-teal-600 bg-teal-50 dark:bg-teal-900/30' },
  { id: 'Education',             icon: '📚', color: 'border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',       active: 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' },
  { id: 'Science & Research',    icon: '🔬', color: 'border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20', active: 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
  { id: 'Other',                 icon: '🌐', color: 'border-surface-300 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800', active: 'border-surface-600 bg-surface-100 dark:bg-surface-700' },
]

const GOALS = [
  { id: 'Get my first job',                   icon: '🎯', desc: 'Land your first full-time role' },
  { id: 'Switch to a new career',             icon: '🔄', desc: 'Move to a completely different field' },
  { id: 'Get promoted / grow in current role',icon: '📈', desc: 'Advance within your current path' },
  { id: 'Build new skills / upskill',         icon: '🧠', desc: 'Learn and stay ahead in your field' },
  { id: 'Pass a certification or exam',       icon: '📜', desc: 'Prepare for a specific qualification' },
  { id: 'Start my own business',              icon: '🚀', desc: 'Build something of your own' },
]

const EXP_LEVELS = ['Student (Fresher)', '0-1 years', '1-3 years', '3-5 years', '5-8 years', '8+ years']

// Field → target roles mapping
const FIELD_ROLES = {
  'Technology':            ['Software Engineer', 'Full Stack Developer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer', 'Cloud Architect', 'Product Manager (Tech)', 'Cybersecurity Analyst', 'Mobile Developer', 'QA Engineer'],
  'Business & Management': ['Product Manager', 'Business Analyst', 'Operations Manager', 'Strategy Consultant', 'Scrum Master', 'Project Manager', 'Management Consultant', 'Chief of Staff'],
  'Finance & Accounting':  ['Financial Analyst', 'Investment Banker', 'Chartered Accountant', 'CFO', 'Risk Analyst', 'Portfolio Manager', 'Tax Consultant', 'Auditor'],
  'Law & Legal':           ['Corporate Lawyer', 'Legal Analyst', 'Compliance Officer', 'Legal Counsel', 'Public Prosecutor', 'IP Attorney', 'Paralegal', 'Judiciary'],
  'Arts & Design':         ['UX Designer', 'Graphic Designer', 'Art Director', 'Motion Designer', 'Illustrator', 'Photographer', 'Creative Director', 'Brand Designer'],
  'Marketing & Media':     ['Marketing Manager', 'Content Strategist', 'Brand Manager', 'SEO Specialist', 'Social Media Manager', 'Copywriter', 'PR Manager', 'Growth Marketer'],
  'Healthcare & Medicine': ['Doctor', 'Healthcare Analyst', 'Medical Researcher', 'Pharmacist', 'Public Health Officer', 'Healthcare Manager', 'Clinical Research Associate'],
  'Engineering (Non-CS)':  ['Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Manufacturing Engineer', 'Quality Engineer', 'Structural Engineer', 'Process Engineer'],
  'Education':             ['Teacher', 'Curriculum Designer', 'Education Consultant', 'School Principal', 'EdTech Specialist', 'Training Manager', 'Instructional Designer'],
  'Science & Research':    ['Research Scientist', 'Lab Analyst', 'Data Analyst', 'Science Writer', 'R&D Engineer', 'Environmental Scientist', 'Biotech Researcher'],
  'Other':                 ['Entrepreneur', 'Freelancer', 'Social Worker', 'NGO Manager', 'Government Officer', 'Journalist', 'Policy Analyst'],
}

// ── Step indicator ────────────────────────────────────────────────
function StepIndicator({ step, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 transition-all',
            i + 1 < step  ? 'gradient-brand-bg text-white' :
            i + 1 === step ? 'bg-navy-600 text-white ring-4 ring-navy-200 dark:ring-navy-800' :
            'bg-surface-200 dark:bg-surface-700 text-surface-400'
          )}>
            {i + 1 < step ? <CheckCircle2 size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={clsx('h-0.5 w-8 rounded-full transition-all', i + 1 < step ? 'bg-navy-600' : 'bg-surface-200 dark:bg-surface-700')} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main Onboarding page ──────────────────────────────────────────
export default function Onboarding() {
  const [step, setStep]       = useState(1)
  const [saving, setSaving]   = useState(false)
  const [data, setData]       = useState({
    userType: '', field: '', goal: '', targetRole: '', experienceLevel: 'Student (Fresher)',
  })
  const { updateUser, user }  = useAuthStore()
  const navigate              = useNavigate()

  const set = (key, val) => setData(p => ({ ...p, [key]: val }))

  const canNext = () => {
    if (step === 1) return !!data.userType
    if (step === 2) return !!data.field
    if (step === 3) return !!data.goal
    if (step === 4) return !!data.targetRole
    return false
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      const { data: res } = await api.patch('/users/onboarding', data)
      updateUser(res.data)
      toast.success(`Welcome to CareerAI, ${user?.name?.split(' ')[0]}! 🎉`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const roles = FIELD_ROLES[data.field] || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-blue-50/30 dark:from-surface-900 dark:via-surface-900 dark:to-navy-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-brand-bg flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-display text-xl font-700 gradient-text">CareerAI</span>
          </div>
          <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white mb-2">
            Let's personalise your experience
          </h1>
          <p className="text-surface-500 text-sm">
            Answer 4 quick questions so we can tailor everything just for you
          </p>
        </div>

        <StepIndicator step={step} total={4} />

        {/* Step cards */}
        <div className="card p-8 mb-6">

          {/* Step 1 — Who are you? */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white mb-1">Who are you?</h2>
              <p className="text-surface-500 text-sm mb-6">This helps us set the right tone and context for you.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {USER_TYPES.map(({ id, icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => set('userType', id)}
                    className={clsx(
                      'flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all',
                      data.userType === id
                        ? 'border-navy-600 bg-navy-50 dark:bg-navy-900/40'
                        : 'border-surface-200 dark:border-surface-700 hover:border-navy-300 dark:hover:border-navy-600'
                    )}
                  >
                    <span className="text-2xl mt-0.5">{icon}</span>
                    <div>
                      <p className={clsx('font-600 text-sm', data.userType === id ? 'text-navy-600 dark:text-navy-300' : 'text-surface-800 dark:text-surface-200')}>{id}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{desc}</p>
                    </div>
                    {data.userType === id && <CheckCircle2 size={16} className="text-navy-600 ml-auto shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — What is your field? */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white mb-1">What is your field?</h2>
              <p className="text-surface-500 text-sm mb-6">We'll tailor your assessments, roadmaps, and resources to your domain.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FIELDS.map(({ id, icon, color, active }) => (
                  <button
                    key={id}
                    onClick={() => set('field', id)}
                    className={clsx(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all',
                      data.field === id ? active : `border-surface-200 dark:border-surface-700 ${color}`
                    )}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className={clsx('text-xs font-medium leading-tight', data.field === id ? 'text-surface-900 dark:text-white' : 'text-surface-600 dark:text-surface-400')}>{id}</span>
                    {data.field === id && <CheckCircle2 size={12} className="text-teal-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — What do you want to achieve? */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white mb-1">What do you want to achieve?</h2>
              <p className="text-surface-500 text-sm mb-6">Your goal shapes everything — your roadmap, your AI advice, your assessments.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {GOALS.map(({ id, icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => set('goal', id)}
                    className={clsx(
                      'flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all',
                      data.goal === id
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/30'
                        : 'border-surface-200 dark:border-surface-700 hover:border-teal-300 dark:hover:border-teal-700'
                    )}
                  >
                    <span className="text-2xl mt-0.5">{icon}</span>
                    <div>
                      <p className={clsx('font-600 text-sm', data.goal === id ? 'text-teal-700 dark:text-teal-300' : 'text-surface-800 dark:text-surface-200')}>{id}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{desc}</p>
                    </div>
                    {data.goal === id && <CheckCircle2 size={16} className="text-teal-600 ml-auto shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Target role + experience */}
          {step === 4 && (
            <div>
              <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white mb-1">Where are you headed?</h2>
              <p className="text-surface-500 text-sm mb-6">Your target role and experience level helps us generate the perfect roadmap.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Target role</label>
                  <select
                    className="input"
                    value={data.targetRole}
                    onChange={e => set('targetRole', e.target.value)}
                  >
                    <option value="">Select your target role...</option>
                    {roles.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <p className="text-xs text-surface-400 mt-1.5">Based on your field: <strong>{data.field}</strong></p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Current experience level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EXP_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => set('experienceLevel', level)}
                        className={clsx(
                          'py-2.5 px-3 rounded-xl border-2 text-xs font-medium transition-all text-center',
                          data.experienceLevel === level
                            ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                            : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-violet-300'
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary card */}
                {data.targetRole && (
                  <div className="gradient-brand-bg rounded-xl p-4 text-white">
                    <p className="text-sm font-600 mb-2">Your personalised journey</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/15 rounded-lg p-2"><span className="opacity-70">Type:</span> {data.userType}</div>
                      <div className="bg-white/15 rounded-lg p-2"><span className="opacity-70">Field:</span> {data.field}</div>
                      <div className="bg-white/15 rounded-lg p-2"><span className="opacity-70">Goal:</span> {data.goal}</div>
                      <div className="bg-white/15 rounded-lg p-2"><span className="opacity-70">Target:</span> {data.targetRole}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className="btn-ghost px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-30"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <span className="text-xs text-surface-400">Step {step} of 4</span>

          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-40"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canNext() || saving}
              className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-40"
            >
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Sparkles size={16} />
              }
              Launch my CareerAI
            </button>
          )}
        </div>
      </div>
    </div>
  )
}