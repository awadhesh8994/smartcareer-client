import { useState, useEffect } from 'react'
import { Brain, Clock, CheckCircle2, ChevronRight, RotateCcw, TrendingUp, Sparkles } from 'lucide-react'
import { useAssessmentStore } from '@store/index'
import { useAuthStore } from '@store/authStore'
import api from '@services/axiosInstance'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

// Field-based icon and color mapping
const DOMAIN_STYLE = {
  // Tech
  'DSA':                    { icon: '⚡', color: 'border-navy-200 dark:border-navy-700',     active: 'border-navy-600 bg-navy-50 dark:bg-navy-900/40' },
  'Web Development':        { icon: '🌐', color: 'border-teal-200 dark:border-teal-700',     active: 'border-teal-600 bg-teal-50 dark:bg-teal-900/30' },
  'Machine Learning':       { icon: '🤖', color: 'border-violet-200 dark:border-violet-700', active: 'border-violet-600 bg-violet-50 dark:bg-violet-900/30' },
  'Cloud Computing':        { icon: '☁️', color: 'border-blue-200 dark:border-blue-700',     active: 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' },
  'Python':                 { icon: '🐍', color: 'border-green-200 dark:border-green-700',   active: 'border-green-600 bg-green-50 dark:bg-green-900/20' },
  'Cybersecurity':          { icon: '🔒', color: 'border-red-200 dark:border-red-700',       active: 'border-red-600 bg-red-50 dark:bg-red-900/20' },
  // Business
  'Product Management':     { icon: '🎯', color: 'border-amber-200 dark:border-amber-700',   active: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  'Project Management':     { icon: '📋', color: 'border-cyan-200 dark:border-cyan-700',     active: 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20' },
  'Data Analysis':          { icon: '📊', color: 'border-indigo-200 dark:border-indigo-700', active: 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
  'Digital Marketing':      { icon: '📢', color: 'border-orange-200 dark:border-orange-700', active: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  'Finance':                { icon: '💰', color: 'border-emerald-200 dark:border-emerald-700', active: 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  'UI/UX Design':           { icon: '🎨', color: 'border-pink-200 dark:border-pink-700',     active: 'border-pink-600 bg-pink-50 dark:bg-pink-900/20' },
}

const getStyle = (domain) => DOMAIN_STYLE[domain] || { icon: '📝', color: 'border-surface-200 dark:border-surface-700', active: 'border-navy-600 bg-navy-50 dark:bg-navy-900/40' }

export default function Assessment() {
  const [phase, setPhase]       = useState('select')
  const [domains, setDomains]   = useState({ recommended: [], all: [], userField: '' })
  const [showAll, setShowAll]   = useState(false)
  const [domain, setDomain]     = useState('')
  const [current, setCurrent]   = useState(0)
  const [answers, setAnswers]   = useState([])
  const [selected, setSelected] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [result, setResult]     = useState(null)
  const [aiGenerated, setAiGenerated] = useState(false)

  const { currentAssessment, startAssessment, submitAssessment, isLoading } = useAssessmentStore()
  const { user } = useAuthStore()

  useEffect(() => {
    api.get('/assessments/domains')
      .then(r => setDomains(r.data.data))
      .catch(() => {
        // Fallback if API fails
        setDomains({ recommended: ['DSA', 'Web Development', 'Data Analysis', 'Digital Marketing'], all: [], userField: user?.field || 'Technology' })
      })
  }, [])

  const handleStart = async () => {
    if (!domain) return toast.error('Select a domain first')
    const res = await startAssessment(domain)
    if (res.success) {
      setPhase('quiz')
      setCurrent(0)
      setAnswers([])
      setSelected(null)
      setStartTime(Date.now())
      setAiGenerated(res.data?.generatedBy === 'ai')
    } else toast.error(res.message || 'Failed to start')
  }

  const handleNext = async () => {
    if (selected === null) return toast.error('Select an answer')
    const q = currentAssessment.questions[current]
    const newAnswers = [...answers, { questionId: q._id, chosen: selected }]
    setAnswers(newAnswers)
    setSelected(null)
    if (current + 1 < currentAssessment.questions.length) {
      setCurrent(current + 1)
    } else {
      const mins = Math.round((Date.now() - startTime) / 60000)
      const res  = await submitAssessment(currentAssessment._id, newAnswers, mins)
      if (res.success) { setResult(res.data); setPhase('result') }
      else toast.error(res.message || 'Submission failed')
    }
  }

  const questions  = currentAssessment?.questions || []
  const progress   = questions.length ? ((current + 1) / questions.length) * 100 : 0
  const displayDomains = showAll
    ? [...new Set([...domains.recommended, ...domains.all])]
    : domains.recommended

  // ── Domain Select ──────────────────────────────────────────────
  if (phase === 'select') return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white mb-1">Skill Assessment</h1>
        <p className="text-surface-500 text-sm">
          {domains.userField
            ? <>Showing domains for <strong className="text-navy-600 dark:text-navy-300">{domains.userField}</strong> · 15 questions · ~10 minutes</>
            : '15 adaptive questions · ~10 minutes · Instant AI analysis'
          }
        </p>
      </div>

      {/* AI generation notice */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/50 rounded-xl w-fit">
        <Sparkles size={14} className="text-violet-600" />
        <p className="text-xs text-violet-700 dark:text-violet-300">
          Don't see your domain? Select any topic — our AI will generate questions on the fly for you.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayDomains.map((id) => {
          const { icon, color, active } = getStyle(id)
          return (
            <button
              key={id}
              onClick={() => setDomain(id)}
              className={clsx('p-4 rounded-xl border-2 text-left transition-all duration-150 bg-white dark:bg-surface-800 hover:-translate-y-0.5', domain === id ? active : color)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-surface-800 dark:text-surface-200 truncate">{id}</div>
                  {!domains.recommended.includes(id) && (
                    <div className="text-2xs text-surface-400">All fields</div>
                  )}
                </div>
                {domain === id && <CheckCircle2 size={16} className="text-teal-500 shrink-0" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Show all toggle */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="text-sm text-navy-600 dark:text-navy-300 hover:underline flex items-center gap-1"
      >
        {showAll ? 'Show recommended only' : 'Explore all domains →'}
      </button>

      {/* Custom domain input */}
      <div className="card p-4">
        <p className="text-xs font-medium text-surface-500 mb-2">Or type any topic to test yourself:</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Contract Law, AutoCAD, Medical Ethics..."
            className="input flex-1 text-sm"
            value={!domains.recommended.includes(domain) && !domains.all?.includes(domain) ? domain : ''}
            onChange={e => setDomain(e.target.value)}
          />
        </div>
      </div>

      {domain && (
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-surface-800 dark:text-surface-200">
              Ready to test <span className="text-navy-600 dark:text-navy-300">{domain}</span>
            </p>
            <p className="text-xs text-surface-500 mt-0.5">
              {domains.recommended.includes(domain) || domains.all?.includes(domain)
                ? '15 questions from our curated bank'
                : '15 questions generated by AI for your topic'}
            </p>
          </div>
          <button onClick={handleStart} disabled={isLoading} className="btn-primary px-6 py-2.5 rounded-xl disabled:opacity-60 flex items-center gap-2">
            {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Start quiz <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )

  // ── Quiz ───────────────────────────────────────────────────────
  if (phase === 'quiz' && questions.length) {
    const q = questions[current]
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
        {aiGenerated && (
          <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/50 rounded-lg w-fit">
            <Sparkles size={12} className="text-violet-600" />
            <span className="text-xs text-violet-700 dark:text-violet-300">AI-generated questions for {domain}</span>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-surface-600 dark:text-surface-400">Question {current + 1} of {questions.length}</span>
            <div className="flex items-center gap-1.5 text-xs text-surface-500"><Clock size={13} /><span>~{questions.length - current} left</span></div>
          </div>
          <div className="progress-bar"><div className="progress-fill transition-all duration-500" style={{ width: `${progress}%` }} /></div>
        </div>

        <div className="card p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-brand-bg flex items-center justify-center text-white text-sm font-700 shrink-0">{current + 1}</div>
            <p className="text-surface-800 dark:text-surface-200 font-medium leading-relaxed">{q.question}</p>
          </div>
          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button key={idx} onClick={() => setSelected(idx)}
                className={clsx('w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150',
                  selected === idx
                    ? 'border-navy-600 bg-navy-50 dark:bg-navy-900/40'
                    : 'border-surface-200 dark:border-surface-700 hover:border-navy-300 dark:hover:border-navy-600 bg-white dark:bg-surface-800'
                )}>
                <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-700 shrink-0 transition-all', selected === idx ? 'bg-navy-600 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-500')}>
                  {OPTION_LABELS[idx]}
                </div>
                <span className="text-sm text-surface-700 dark:text-surface-300">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className={clsx('badge text-xs', q.difficulty === 'hard' ? 'badge-danger' : q.difficulty === 'medium' ? 'badge-warning' : 'badge-accent')}>
            {q.difficulty || 'medium'}
          </span>
          <button onClick={handleNext} disabled={selected === null || isLoading}
            className="btn-primary px-6 py-2.5 rounded-xl disabled:opacity-40 flex items-center gap-2">
            {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {current + 1 === questions.length ? 'Submit' : 'Next'} <ChevronRight size={15} />
          </button>
        </div>
      </div>
    )
  }

  // ── Result ─────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const color = result.score >= 75 ? 'text-teal-600' : result.score >= 45 ? 'text-amber-500' : 'text-red-500'
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
        <div className="card p-8 text-center">
          <div className={clsx('font-display text-6xl font-800 mb-2', color)}>{result.score}%</div>
          <div className="font-display text-xl font-700 text-surface-900 dark:text-white mb-1">{result.skillLevel}</div>
          <p className="text-surface-500 text-sm">{result.correctAnswers} / {result.totalQuestions} correct · {domain}</p>
          <div className="w-32 h-3 mx-auto mt-4 progress-bar"><div className="progress-fill" style={{ width: `${result.score}%` }} /></div>
        </div>

        {result.analysis && (
          <div className="card p-5">
            <h3 className="font-display text-base font-700 text-surface-900 dark:text-white mb-2">AI Analysis</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{result.analysis}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {result.strongTopics?.length > 0 && (
            <div className="card p-5">
              <h4 className="text-sm font-600 text-teal-700 dark:text-teal-400 flex items-center gap-1.5 mb-3"><CheckCircle2 size={14} /> Strong topics</h4>
              <div className="flex flex-wrap gap-2">{result.strongTopics.map(t => <span key={t} className="badge-accent text-xs">{t}</span>)}</div>
            </div>
          )}
          {result.weakTopics?.length > 0 && (
            <div className="card p-5">
              <h4 className="text-sm font-600 text-red-600 dark:text-red-400 flex items-center gap-1.5 mb-3"><TrendingUp size={14} /> Improve these</h4>
              <div className="flex flex-wrap gap-2">{result.weakTopics.map(t => <span key={t} className="badge-danger text-xs">{t}</span>)}</div>
            </div>
          )}
        </div>

        {result.recommendations?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-display text-base font-700 text-surface-900 dark:text-white mb-3">Recommendations</h3>
            <ul className="space-y-2">{result.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-surface-600 dark:text-surface-400">
                <ChevronRight size={15} className="text-navy-500 mt-0.5 shrink-0" />{r}
              </li>
            ))}</ul>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => { setPhase('select'); setDomain(''); setResult(null) }}
            className="btn-outline flex-1 py-3 rounded-xl justify-center flex items-center gap-2">
            <RotateCcw size={15} /> Try another
          </button>
          <a href="/roadmap" className="btn-primary flex-1 py-3 rounded-xl justify-center flex items-center gap-2">
            View roadmap <ChevronRight size={15} />
          </a>
        </div>
      </div>
    )
  }

  return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" /></div>
}