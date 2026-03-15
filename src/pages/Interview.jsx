import { useState, useEffect } from 'react'
import { Mic, ChevronRight, CheckCircle2, TrendingUp, RotateCcw, Clock, AlertCircle } from 'lucide-react'
import api from '@services/axiosInstance'
import { useAuthStore } from '@store/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Field → roles mapping — consistent across app
const FIELD_ROLES = {
  'Technology':            ['Software Engineer','Full Stack Developer','Frontend Developer','Backend Developer','Data Scientist','ML Engineer','DevOps Engineer','Cloud Architect','Cybersecurity Analyst','Mobile Developer'],
  'Business & Management': ['Product Manager','Business Analyst','Operations Manager','Strategy Consultant','Scrum Master','Project Manager','Management Consultant'],
  'Finance & Accounting':  ['Financial Analyst','Investment Banker','Chartered Accountant','Risk Analyst','Portfolio Manager','Tax Consultant','Auditor'],
  'Law & Legal':           ['Corporate Lawyer','Legal Analyst','Compliance Officer','Legal Counsel','IP Attorney','Paralegal'],
  'Arts & Design':         ['UX Designer','Graphic Designer','Art Director','Motion Designer','Illustrator','Creative Director','Brand Designer'],
  'Marketing & Media':     ['Marketing Manager','Content Strategist','Brand Manager','SEO Specialist','Social Media Manager','Copywriter','Growth Marketer'],
  'Healthcare & Medicine': ['Doctor','Healthcare Analyst','Medical Researcher','Pharmacist','Public Health Officer','Healthcare Manager','Clinical Research Associate'],
  'Engineering (Non-CS)':  ['Mechanical Engineer','Civil Engineer','Electrical Engineer','Manufacturing Engineer','Quality Engineer','Structural Engineer'],
  'Education':             ['Teacher','Curriculum Designer','Education Consultant','School Principal','EdTech Specialist','Training Manager'],
  'Science & Research':    ['Research Scientist','Lab Analyst','Data Analyst','Science Writer','R&D Engineer','Environmental Scientist'],
  'Other':                 ['Entrepreneur','Freelancer','Social Worker','NGO Manager','Government Officer','Journalist','Policy Analyst'],
}

export default function Interview() {
  const [phase, setPhase]       = useState('select')
  const [role, setRole]         = useState('')
  const [customRole, setCustomRole] = useState('')
  const [type, setType]         = useState('Mixed')
  const [interview, setInterview] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answer, setAnswer]     = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [allEvals, setAllEvals] = useState([])
  const [result, setResult]     = useState(null)
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { user }                = useAuthStore()

  const userField  = user?.field || 'Technology'
  const fieldRoles = FIELD_ROLES[userField] || FIELD_ROLES['Technology']
  // Pre-fill with user's target role if set
  const defaultRole = user?.targetRole || ''

  useEffect(() => {
    if (defaultRole) setRole(defaultRole)
    api.get('/interviews/history')
      .then(r => setHistory(r.data.data || []))
      .catch(() => {})
  }, [])

  const startInterview = async () => {
    const finalRole = customRole.trim() || role
    if (!finalRole) return toast.error('Select or enter a role')
    setLoading(true)
    try {
      const r = await api.post('/interviews/start', { role: finalRole, type })
      setInterview(r.data.data)
      setCurrentQ(0); setAnswer(''); setEvaluation(null); setAllEvals([])
      setPhase('interview')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to start') }
    finally { setLoading(false) }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) return toast.error('Please type your answer')
    setLoading(true)
    try {
      const r = await api.post(`/interviews/${interview._id}/answer`, { questionIndex: currentQ, userAnswer: answer })
      setEvaluation(r.data.data.evaluation)
      setAllEvals(p => [...p, { questionIndex: currentQ, ...r.data.data.evaluation }])
    } catch { toast.error('Submission failed') }
    finally { setLoading(false) }
  }

  const nextQuestion = () => {
    const questions = interview.questions
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1); setAnswer(''); setEvaluation(null)
    } else finishInterview()
  }

  const finishInterview = async () => {
    setLoading(true)
    try {
      const r = await api.post(`/interviews/${interview._id}/complete`)
      setResult(r.data.data); setPhase('result')
      const h = await api.get('/interviews/history')
      setHistory(h.data.data || [])
    } catch { toast.error('Failed to complete') }
    finally { setLoading(false) }
  }

  const reset = () => { setPhase('select'); setInterview(null); setResult(null) }

  const questions = interview?.questions || []
  const q         = questions[currentQ]
  const progress  = questions.length ? ((currentQ + (evaluation ? 1 : 0)) / questions.length) * 100 : 0
  const scoreColor = (s) => s >= 8 ? 'text-teal-600' : s >= 5 ? 'text-amber-500' : 'text-red-500'
  const scoreBg    = (s) => s >= 8 ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700/50' : s >= 5 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50'

  // ── Role Select ────────────────────────────────────────────────
  if (phase === 'select') return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white mb-1">AI Mock Interview</h1>
          <p className="text-surface-500 text-sm">
            Showing roles for <strong className="text-navy-600 dark:text-navy-300">{userField}</strong> · Practice with AI-generated questions
          </p>
        </div>
        <button onClick={() => setShowHistory(!showHistory)} className="btn-ghost text-xs flex items-center gap-1.5">
          <Clock size={13} /> History ({history.length})
        </button>
      </div>

      {showHistory && history.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display text-sm font-700 text-surface-900 dark:text-white mb-3">Past interviews</h3>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h._id} className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <div className={clsx('font-display text-xl font-800', h.overallScore >= 70 ? 'text-teal-600' : 'text-amber-500')}>{h.overallScore}%</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{h.role} — {h.type}</p>
                  <p className="text-xs text-surface-400">{new Date(h.completedAt).toLocaleDateString()}</p>
                </div>
                <span className={clsx('badge text-xs', h.overallScore >= 70 ? 'badge-accent' : 'badge-warning')}>
                  {h.overallScore >= 70 ? 'Good' : 'Needs practice'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">
              Select role <span className="text-surface-400">(for {userField})</span>
            </label>
            <select className="input" value={role} onChange={e => { setRole(e.target.value); setCustomRole('') }}>
              <option value="">Choose from your field...</option>
              {fieldRoles.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Or type a specific role</label>
            <input
              className="input"
              placeholder={`e.g. ${fieldRoles[0]}...`}
              value={customRole}
              onChange={e => { setCustomRole(e.target.value); setRole('') }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Interview type</label>
            <div className="flex gap-2">
              {['HR', 'Technical', 'Mixed'].map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={clsx('flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
                    type === t ? 'border-navy-600 bg-navy-50 dark:bg-navy-900/40 text-navy-600 dark:text-navy-300' : 'border-surface-200 dark:border-surface-700 text-surface-500 hover:border-navy-300'
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: '8 Questions', sub: 'Mixed difficulty', icon: '❓' },
            { label: 'AI Feedback', sub: 'On every answer',  icon: '🤖' },
            { label: 'Full Report', sub: 'After completion', icon: '📊' },
          ].map(({ label, sub, icon }) => (
            <div key={label} className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{icon}</div>
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{label}</p>
              <p className="text-xs text-surface-400">{sub}</p>
            </div>
          ))}
        </div>

        <button onClick={startInterview} disabled={(!role && !customRole.trim()) || loading}
          className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Mic size={17} />}
          Start Interview
        </button>
      </div>
    </div>
  )

  // ── Interview ──────────────────────────────────────────────────
  if (phase === 'interview' && q) return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={clsx('badge text-xs', q.category === 'HR' ? 'badge-primary' : q.category === 'Technical' ? 'badge-accent' : 'badge-violet')}>{q.category}</span>
            <span className={clsx('badge text-xs', q.difficulty === 'hard' ? 'badge-danger' : q.difficulty === 'medium' ? 'badge-warning' : 'badge-success')}>{q.difficulty}</span>
          </div>
          <span className="text-sm text-surface-500">Q{currentQ + 1} / {questions.length}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="card p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg gradient-brand-bg flex items-center justify-center text-white text-sm font-700 shrink-0">{currentQ + 1}</div>
          <p className="text-surface-800 dark:text-surface-200 font-medium leading-relaxed text-base">{q.question}</p>
        </div>

        {!evaluation ? (
          <>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here... Be specific and use real examples from your experience."
              className="input resize-none h-36 text-sm mb-4 w-full"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-surface-400">{answer.length} characters · Aim for 100–300 words</p>
              <button onClick={submitAnswer} disabled={!answer.trim() || loading}
                className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-40">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Submit Answer
              </button>
            </div>
          </>
        ) : (
          <div className={clsx('rounded-xl border p-4 mb-4', scoreBg(evaluation.score))}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className={scoreColor(evaluation.score)} />
                <span className="text-sm font-600 text-surface-800 dark:text-surface-200">AI Feedback</span>
              </div>
              <span className={clsx('font-display text-2xl font-800', scoreColor(evaluation.score))}>{evaluation.score}/10</span>
            </div>
            <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed mb-3">{evaluation.feedback}</p>
            {evaluation.keywordsFound?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-surface-500">Keywords found:</span>
                {evaluation.keywordsFound.map(k => <span key={k} className="badge-accent text-xs">{k}</span>)}
              </div>
            )}
          </div>
        )}

        {evaluation && (
          <button onClick={nextQuestion} className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2">
            {currentQ + 1 < questions.length
              ? <><span>Next Question</span><ChevronRight size={16} /></>
              : <><span>Finish & Get Report</span><ChevronRight size={16} /></>
            }
          </button>
        )}
      </div>

      {allEvals.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allEvals.map((ev, i) => (
            <div key={i} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-800">
              <span className="text-xs text-surface-500">Q{ev.questionIndex + 1}</span>
              <span className={clsx('text-xs font-700', scoreColor(ev.score))}>{ev.score}/10</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── Result ─────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const score = result.overallScore
    const color = score >= 70 ? 'text-teal-600' : score >= 50 ? 'text-amber-500' : 'text-red-500'
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
        <div className="card p-8 text-center">
          <div className={clsx('font-display text-7xl font-800 mb-2', color)}>{score}%</div>
          <p className="font-display text-xl font-700 text-surface-900 dark:text-white mb-1">
            {score >= 70 ? 'Great Performance! 🎉' : score >= 50 ? 'Good Effort! 💪' : 'Keep Practising! 📚'}
          </p>
          <p className="text-surface-500 text-sm">{result.role} — {result.type} Interview</p>
          <div className="w-40 h-3 mx-auto mt-4 progress-bar"><div className="progress-fill" style={{ width: `${score}%` }} /></div>
        </div>

        {result.overallFeedback && (
          <div className="card p-5">
            <h3 className="font-display text-base font-700 text-surface-900 dark:text-white mb-2">Overall Feedback</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{result.overallFeedback}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {result.strengths?.length > 0 && (
            <div className="card p-5">
              <h4 className="text-sm font-600 text-teal-600 flex items-center gap-1.5 mb-3"><CheckCircle2 size={14} /> Strengths</h4>
              <ul className="space-y-1.5">{result.strengths.map((s, i) => <li key={i} className="text-sm text-surface-600 dark:text-surface-400 flex items-start gap-2"><span className="text-teal-500">✓</span>{s}</li>)}</ul>
            </div>
          )}
          {result.improvements?.length > 0 && (
            <div className="card p-5">
              <h4 className="text-sm font-600 text-amber-600 flex items-center gap-1.5 mb-3"><TrendingUp size={14} /> Improve</h4>
              <ul className="space-y-1.5">{result.improvements.map((s, i) => <li key={i} className="text-sm text-surface-600 dark:text-surface-400 flex items-start gap-2"><AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />{s}</li>)}</ul>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-display text-base font-700 text-surface-900 dark:text-white mb-4">Answer Breakdown</h3>
          <div className="space-y-3">
            {result.answers?.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
                <div className={clsx('font-display text-lg font-800 shrink-0 w-12 text-center', scoreColor(a.aiScore))}>{a.aiScore}/10</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-0.5 truncate">{a.questionText}</p>
                  <p className="text-xs text-surface-500 leading-relaxed">{a.aiFeedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={reset} className="btn-outline flex-1 py-3 rounded-xl flex items-center justify-center gap-2">
            <RotateCcw size={15} /> Try Another
          </button>
          <a href="/chatbot" className="btn-primary flex-1 py-3 rounded-xl flex items-center justify-center gap-2">
            Ask AI for tips <ChevronRight size={15} />
          </a>
        </div>
      </div>
    )
  }

  return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" /></div>
}