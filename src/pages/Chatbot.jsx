import { useEffect, useRef, useState, useCallback } from 'react'
import {
  ChevronLeft, ChevronRight, Clock3, Mic, MessageSquareText,
  Pencil, Plus, Send, Sparkles, Trash2, User, Copy, Check,
  Github, FileText, BarChart2, X, ArrowRight,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { chatService } from '@services/index'
import { useAuthStore } from '@store/authStore'

// ── Field suggestions ──────────────────────────────────────────────
const FIELD_SUGGESTIONS = {
  'Technology':            ['What skills should I learn for Full Stack Development?', 'How do I crack a FAANG technical interview?', 'How to improve my GitHub profile for recruiters?', 'Best roadmap to become a Data Scientist?'],
  'Business & Management': ['How do I break into product management as a fresher?', 'How to prepare for a consulting case interview?', 'What certifications help for an MBA career?', 'What skills does a Business Analyst need in 2026?'],
  'Finance & Accounting':  ['How do I prepare for CA exams while working?', 'What skills are needed for investment banking?', 'How to transition from accounting to finance?', 'Best certifications for a financial analyst role?'],
  'Law & Legal':           ['How do I prepare for a corporate law career?', 'What skills are essential for a legal analyst?', 'How to build a strong law portfolio?', 'Difference between in-house counsel and law firm roles?'],
  'Arts & Design':         ['How do I build a strong UX design portfolio?', 'What tools should I learn for graphic design?', 'How to transition from graphic to UX design?', 'What does an art director role involve?'],
  'Marketing & Media':     ['How do I grow my digital marketing career?', 'What skills are in demand for marketing in 2026?', 'How to prepare for a brand manager interview?', 'Best certifications for an SEO specialist?'],
  'Healthcare & Medicine':  ['How to build a career in healthcare management?', 'What skills are needed for clinical research?', 'How to transition from clinical to non-clinical roles?', 'Best certifications for public health careers?'],
  'Engineering (Non-CS)':  ['How do I advance as a mechanical engineer?', 'What certifications help for civil engineering?', 'How to transition from core engineering to management?', 'What skills does a quality engineer need?'],
  'Education':             ['How do I transition from teaching to EdTech?', 'What skills are needed for curriculum design?', 'How to build a career in education consulting?', 'Best certifications for training and development?'],
  'Science & Research':    ['How do I build a strong research career?', 'What skills are needed for a science data analyst?', 'How to transition from academia to industry?', 'Best certifications for biotechnology careers?'],
  'Other':                 ['How do I start a career as an entrepreneur?', 'What skills help for a government officer role?', 'How to build a career in the social sector?', 'What does a policy analyst do?'],
}
const DEFAULT_SUGGESTIONS = [
  'What skills should I focus on for my career goals?',
  'How do I prepare for my first job interview?',
  'How can I improve my resume to get more callbacks?',
  'What is the best way to grow my professional network?',
]

// ── Local session storage ─────────────────────────────────────────
const KEYS = { sessions: 'cai-sessions-v6', active: 'cai-active-v6', collapsed: 'cai-sidebar-v6' }
const readJson  = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb } catch { return fb } }
const writeJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
const makeId    = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const getTitle  = (msgs) => { const f = msgs?.find(m => m.role === 'user'); if (!f) return 'New chat'; const t = String(f.content || '').trim(); return t.length > 38 ? t.slice(0, 38) + '…' : t }
const sortSess  = (arr) => [...(arr || [])].sort((a, b) => b.updatedAt - a.updatedAt)
const fmtTime   = (v) => { const d = Date.now() - Number(v || 0), m = Math.round(d / 60000); if (m < 1) return 'Now'; if (m < 60) return m + 'm'; const h = Math.round(m / 60); if (h < 24) return h + 'h'; return Math.round(h / 24) + 'd' }

// ── Typewriter hook ───────────────────────────────────────────────
function useTypewriter(text, speed = 8) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone]           = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!text) return
    let i = 0
    const tick = () => {
      if (i >= text.length) { setDone(true); return }
      // Chunk 3-5 chars per tick for speed
      const chunk = text.slice(i, i + 4)
      setDisplayed(p => p + chunk)
      i += 4
    }
    const id = setInterval(tick, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return { displayed, done }
}

// ── Modals ────────────────────────────────────────────────────────
function Modal({ title, icon: Icon, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-700">
          <div className="flex items-center gap-2.5">
            <Icon size={16} className="text-teal-500" />
            <h3 className="font-display text-sm font-700 text-surface-900 dark:text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function SkillGapModal({ onClose, onSubmit }) {
  const [skills, setSkills] = useState('')
  const [role, setRole]     = useState('')
  const submit = () => {
    if (!skills.trim() || !role.trim()) return toast.error('Fill both fields')
    onSubmit(skills, role); onClose()
  }
  return (
    <Modal title="Skill Gap Analyzer" icon={BarChart2} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-surface-500 mb-1.5">Your current skills (comma separated)</label>
          <textarea value={skills} onChange={e => setSkills(e.target.value)} rows={3} placeholder="e.g. JavaScript, React, Node.js, SQL..." className="input resize-none text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-500 mb-1.5">Your target role</label>
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Full Stack Developer..." className="input text-sm" />
        </div>
        <button onClick={submit} className="w-full btn-primary py-2.5 rounded-xl text-sm">Analyze my skill gap →</button>
      </div>
    </Modal>
  )
}

function GitHubModal({ onClose, onSubmit }) {
  const [url, setUrl]     = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    if (!url.trim()) return toast.error('Enter your GitHub URL')
    const username = url.trim().replace('https://github.com/', '').replace(/\/$/, '').split('/')[0]
    if (!username) return toast.error('Invalid GitHub URL')
    setLoading(true)
    try {
      const [ur, rr] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`),
      ])
      if (!ur.ok) { toast.error('GitHub user not found'); setLoading(false); return }
      const ud = await ur.json(); const rd = await rr.json()
      const langs = [...new Set(rd.filter(r => r.language).map(r => r.language))].slice(0, 6)
      const ctx = `GitHub: ${ud.login}\nName: ${ud.name || 'N/A'}\nBio: ${ud.bio || 'N/A'}\nRepos: ${ud.public_repos}\nFollowers: ${ud.followers}\nLanguages: ${langs.join(', ') || 'N/A'}\nRecent repos: ${rd.slice(0, 5).map(r => r.name).join(', ')}`
      onSubmit(ctx, username); onClose()
    } catch { toast.error('Failed to fetch GitHub data') }
    finally { setLoading(false) }
  }
  return (
    <Modal title="Import GitHub Profile" icon={Github} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-surface-500 mb-1.5">Your GitHub profile URL</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://github.com/yourusername" className="input text-sm" />
        </div>
        <p className="text-xs text-surface-400">We'll fetch your public repos and languages to give personalised advice.</p>
        <button onClick={submit} disabled={loading} className="w-full btn-primary py-2.5 rounded-xl text-sm disabled:opacity-60">
          {loading ? 'Fetching...' : 'Import & Analyze →'}
        </button>
      </div>
    </Modal>
  )
}

// ── Streaming message component ───────────────────────────────────
function StreamingMessage({ content }) {
  const { displayed } = useTypewriter(content, 12)
  return (
    <ReactMarkdown components={MD_COMPONENTS}>{displayed || '▋'}</ReactMarkdown>
  )
}

const MD_COMPONENTS = {
  p:      ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-surface-900 dark:text-white">{children}</strong>,
  ul:     ({ children }) => <ul className="mb-2 space-y-1 pl-4 list-disc">{children}</ul>,
  ol:     ({ children }) => <ol className="mb-2 space-y-1 pl-4 list-decimal">{children}</ol>,
  li:     ({ children }) => <li className="leading-relaxed">{children}</li>,
  h2:     ({ children }) => <h2 className="font-display text-sm font-700 mb-1.5 mt-2 text-surface-900 dark:text-white">{children}</h2>,
  h3:     ({ children }) => <h3 className="font-600 text-sm mb-1 mt-1.5">{children}</h3>,
  code:   ({ inline, children }) => inline
    ? <code className="bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
    : <pre className="bg-surface-100 dark:bg-surface-700 rounded-xl p-3 text-xs font-mono overflow-x-auto my-2"><code>{children}</code></pre>,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-navy-600 dark:text-navy-300 underline hover:no-underline">{children}</a>,
}

// ── Message ───────────────────────────────────────────────────────
function Message({ msg, isStreaming }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={clsx('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>

      {/* Avatar */}
      <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
        isUser
          ? 'gradient-brand-bg text-white'
          : 'bg-gradient-to-br from-violet-500 to-teal-500 text-white'
      )}>
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>

      {/* Bubble */}
      <div className={clsx('max-w-[78%] flex flex-col', isUser ? 'items-end' : 'items-start')}>
        <span className={clsx('text-[11px] font-medium mb-1 px-1', isUser ? 'text-navy-500 dark:text-navy-400' : 'text-surface-400')}>
          {isUser ? 'You' : 'CareerAI'}
        </span>

        <div className={clsx('px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-gradient-to-r from-navy-600 to-teal-600 text-white rounded-tr-sm'
            : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 rounded-tl-sm'
        )}>
          {isUser
            ? msg.content
            : isStreaming
              ? <StreamingMessage content={msg.content} />
              : <ReactMarkdown components={MD_COMPONENTS}>{msg.content}</ReactMarkdown>
          }
        </div>

        {/* Copy button — AI only */}
        {!isUser && !isStreaming && (
          <button
            onClick={copy}
            className="mt-1 ml-1 flex items-center gap-1 text-[11px] text-surface-400 hover:text-teal-500 opacity-0 group-hover:opacity-100 transition-all"
          >
            {copied ? <><Check size={10} className="text-teal-500" /><span className="text-teal-500">Copied</span></> : <><Copy size={10} />Copy</>}
          </button>
        )}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles size={14} className="text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-medium text-surface-400 mb-1 px-1">CareerAI</span>
        <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function Chatbot() {
  const [sessions, setSessions]           = useState(() => sortSess(readJson(KEYS.sessions, [])))
  const [activeId, setActiveId]           = useState(() => readJson(KEYS.active, null))
  const [collapsed, setCollapsed]         = useState(() => readJson(KEYS.collapsed, false))
  const [input, setInput]                 = useState('')
  const [typing, setTyping]               = useState(false)
  const [streamingId, setStreamingId]     = useState(null)
  const [loading, setLoading]             = useState(true)
  const [listening, setListening]         = useState(false)
  const [showPlus, setShowPlus]           = useState(false)
  const [showSkillGap, setShowSkillGap]   = useState(false)
  const [showGitHub, setShowGitHub]       = useState(false)

  const bottomRef    = useRef(null)
  const inputRef     = useRef(null)
  const fileRef      = useRef(null)
  const plusRef      = useRef(null)
  const micRef       = useRef(null)
  const { user }     = useAuthStore()

  const name        = user?.name?.split(' ')[0] || 'there'
  const suggestions = FIELD_SUGGESTIONS[user?.field] || DEFAULT_SUGGESTIONS
  const badge       = user?.field ? `Specialised for ${user.field}` : 'AI Career Guidance'

  const activeSession = sessions.find(s => s.id === activeId) || null
  const messages      = activeSession?.messages || []

  // Persist
  useEffect(() => { writeJson(KEYS.sessions, sessions) }, [sessions])
  useEffect(() => { writeJson(KEYS.active, activeId) }, [activeId])
  useEffect(() => { writeJson(KEYS.collapsed, collapsed) }, [collapsed])

  // Load remote history once
  useEffect(() => {
    chatService.getHistory()
      .then(r => {
        const remote = r?.data?.data || []
        if (!remote.length) return
        const sess = { id: makeId(), title: getTitle(remote), updatedAt: Date.now(), messages: remote }
        setSessions(prev => {
          if (prev.some(s => JSON.stringify(s.messages) === JSON.stringify(remote))) return sortSess(prev)
          return sortSess([sess, ...prev])
        })
        setActiveId(id => id || sess.id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length, typing])
  useEffect(() => { if (!loading) inputRef.current?.focus() }, [loading, activeId])

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current; if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }, [input])

  // Close plus menu on outside click
  useEffect(() => {
    const h = (e) => { if (plusRef.current && !plusRef.current.contains(e.target)) setShowPlus(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const saveSession = useCallback((msgs, id) => {
    const sess = { id: id || makeId(), title: getTitle(msgs), updatedAt: Date.now(), messages: msgs }
    setSessions(prev => sortSess([sess, ...prev.filter(s => s.id !== sess.id)]))
    setActiveId(sess.id)
  }, [])

  const newChat = () => { setActiveId(null); setInput('') }

  const clearChat = async () => {
    try { await chatService.clearHistory() } catch {}
    newChat(); toast.success('Chat cleared')
  }

  // ── Send ────────────────────────────────────────────────────────
  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || typing) return
    setInput('')
    const nextMsgs = [...messages, { role: 'user', content: msg }]
    // Optimistically add user message
    saveSession(nextMsgs, activeId)
    setTyping(true)
    try {
      const r    = await chatService.sendMessage(msg)
      const reply = r?.data?.data?.reply || "Sorry, I couldn't generate a response. Please try again."
      const finalMsgs = [...nextMsgs, { role: 'assistant', content: reply }]
      const newId = activeId || makeId()
      const sess  = { id: newId, title: getTitle(finalMsgs), updatedAt: Date.now(), messages: finalMsgs }
      setSessions(prev => sortSess([sess, ...prev.filter(s => s.id !== newId)]))
      setActiveId(newId)
      setStreamingId(newId + '-' + (finalMsgs.length - 1))
      setTimeout(() => setStreamingId(null), reply.length * 3 + 500)
    } catch { toast.error('Failed to get response') }
    finally { setTyping(false); inputRef.current?.focus() }
  }

  // ── Mic ─────────────────────────────────────────────────────────
  const handleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return toast.error('Mic not supported in this browser')
    if (listening) { micRef.current?.stop(); setListening(false); return }
    const r = new SR()
    r.lang = 'en-IN'; r.interimResults = false
    r.onstart = () => setListening(true)
    r.onend   = () => setListening(false)
    r.onerror = () => { setListening(false); toast.error('Could not hear you') }
    r.onresult = e => setInput(p => p ? p + ' ' + e.results[0][0].transcript : e.results[0][0].transcript)
    micRef.current = r; r.start()
  }

  // ── File upload ──────────────────────────────────────────────────
  const handleFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setShowPlus(false)
    toast('Reading your resume...')
    try {
      const text = await file.text()
      const cleaned = text.replace(/\s+/g, ' ').trim().slice(0, 3000)
      await send(`Please analyze my resume and give me:\n1. Key strengths\n2. Areas to improve\n3. ATS score estimate\n4. Career suggestions\n\nResume:\n${cleaned}`)
    } catch { toast.error('Could not read file. Try a .txt file.') }
    e.target.value = ''
  }

  const handleGitHub  = async (ctx, user) => send(`Analyze my GitHub profile and give me:\n1. What it says about my skills\n2. How to improve it for job applications\n3. Career path suggestions\n\nGitHub Data:\n${ctx}`)
  const handleSkillGap = async (skills, role) => send(`Analyze my skill gap:\nCurrent skills: ${skills}\nTarget role: ${role}\n\nTell me:\n1. Missing skills\n2. Priority order to learn them\n3. Time to be job-ready\n4. Best resources`)

  return (
    <div className="h-[calc(100vh-7rem)] flex rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-lifted bg-white dark:bg-surface-900">

      {/* Modals */}
      {showSkillGap && <SkillGapModal onClose={() => setShowSkillGap(false)} onSubmit={handleSkillGap} />}
      {showGitHub   && <GitHubModal  onClose={() => setShowGitHub(false)}   onSubmit={handleGitHub}  />}
      <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFile} className="hidden" />

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={clsx(
        'flex flex-col border-r border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 transition-all duration-300 shrink-0',
        collapsed ? 'w-14' : 'w-56'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-3.5 border-b border-surface-200 dark:border-surface-700">
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg gradient-brand-bg flex items-center justify-center shrink-0">
                <Sparkles size={13} className="text-white" />
              </div>
              <span className="font-display text-sm font-700 text-surface-900 dark:text-white truncate">CareerAI</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={clsx('w-7 h-7 flex items-center justify-center rounded-lg text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors shrink-0', collapsed && 'mx-auto')}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* New chat */}
        <div className="px-2 py-2.5 border-b border-surface-200 dark:border-surface-700">
          <button
            onClick={newChat}
            title="New chat"
            className={clsx('flex items-center gap-2 w-full rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:border-teal-400 hover:text-teal-600 dark:hover:border-teal-600 dark:hover:text-teal-300 transition-all text-xs font-medium',
              collapsed ? 'justify-center p-2' : 'px-3 py-2'
            )}
          >
            <Pencil size={13} />
            {!collapsed && 'New chat'}
          </button>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {!collapsed && (
            <p className="text-[10px] font-600 uppercase tracking-widest text-surface-400 flex items-center gap-1.5 px-1 mb-2">
              <Clock3 size={10} /> History
            </p>
          )}
          {sortSess(sessions).map(s => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              title={s.title}
              className={clsx(
                'w-full rounded-xl text-left transition-all flex items-center gap-2.5',
                collapsed ? 'p-2 justify-center' : 'px-2.5 py-2',
                s.id === activeId
                  ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-300 dark:border-teal-700'
                  : 'hover:bg-white dark:hover:bg-surface-800 border border-transparent'
              )}
            >
              <MessageSquareText size={13} className={s.id === activeId ? 'text-teal-600 dark:text-teal-300 shrink-0' : 'text-surface-400 shrink-0'} />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-surface-800 dark:text-surface-200 truncate">{s.title}</p>
                  <p className="text-[10px] text-surface-400">{fmtTime(s.updatedAt)}</p>
                </div>
              )}
            </button>
          ))}
          {!sessions.length && !collapsed && (
            <p className="text-[11px] text-surface-400 text-center py-4">No chats yet</p>
          )}
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 bg-gradient-to-b from-white via-surface-50/30 to-white dark:from-surface-900 dark:via-surface-900 dark:to-surface-900">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-900/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-base font-700 text-surface-900 dark:text-white leading-none mb-0.5">AI Career Advisor</h1>
              <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                {badge}
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-all">
              <Trash2 size={12} /> Clear
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="max-w-2xl mx-auto w-full">

            {/* Loading */}
            {loading && (
              <div className="flex justify-center pt-16">
                <div className="w-6 h-6 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Empty state */}
            {!loading && messages.length === 0 && (
              <div className="flex flex-col items-center text-center pt-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy-600 via-violet-600 to-teal-500 flex items-center justify-center mb-5 shadow-glow">
                  <Sparkles size={24} className="text-white" />
                </div>
                <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white mb-2">
                  Hi {name}, what can I help with?
                </h2>
                <p className="text-sm text-surface-500 mb-7 max-w-sm leading-relaxed">
                  Ask me anything about careers, interviews, skills, or use the <strong>+</strong> menu to upload your resume or analyse your GitHub.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="group flex items-center justify-between gap-3 text-left px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-all duration-200"
                    >
                      <span className="text-xs font-medium text-surface-700 dark:text-surface-300 leading-relaxed">{s}</span>
                      <ArrowRight size={12} className="text-surface-300 group-hover:text-teal-500 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {!loading && messages.length > 0 && (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <Message
                    key={`${msg.role}-${i}`}
                    msg={msg}
                    isStreaming={
                      msg.role === 'assistant' &&
                      i === messages.length - 1 &&
                      streamingId === activeId + '-' + i
                    }
                  />
                ))}
                {typing && <TypingDots />}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        {/* ── Input bar ───────────────────────────────────────────── */}
        <div className="px-4 py-3 sm:px-6 border-t border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-900/80 backdrop-blur">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl px-3 py-2 focus-within:border-teal-400 dark:focus-within:border-teal-600 transition-colors">

              {/* Plus menu */}
              <div ref={plusRef} className="relative mb-0.5">
                <button
                  onClick={() => setShowPlus(p => !p)}
                  className={clsx('w-8 h-8 flex items-center justify-center rounded-xl transition-all',
                    showPlus ? 'bg-teal-500 text-white' : 'text-surface-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-surface-700'
                  )}
                >
                  <Plus size={16} className={clsx('transition-transform duration-200', showPlus && 'rotate-45')} />
                </button>

                {showPlus && (
                  <div className="absolute bottom-11 left-0 w-52 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lifted py-1.5 z-30">
                    {[
                      { icon: FileText, label: 'Upload Resume', sub: 'PDF, DOC, TXT', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500', action: () => { setShowPlus(false); fileRef.current?.click() } },
                      { icon: Github,   label: 'GitHub Profile', sub: 'Import & analyze',  color: 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-white', action: () => { setShowPlus(false); setShowGitHub(true) } },
                    ].map(({ icon: Icon, label, sub, color, action }) => (
                      <button key={label} onClick={action} className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                        <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', color)}><Icon size={13} /></div>
                        <div><p className="text-xs font-medium text-surface-800 dark:text-surface-200">{label}</p><p className="text-[10px] text-surface-400">{sub}</p></div>
                      </button>
                    ))}
                    <div className="h-px bg-surface-100 dark:bg-surface-700 my-1" />
                    <button onClick={() => { setShowPlus(false); setShowSkillGap(true) }} className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 flex items-center justify-center shrink-0"><BarChart2 size={13} /></div>
                      <div><p className="text-xs font-medium text-surface-800 dark:text-surface-200">Skill Gap Analyzer</p><p className="text-[10px] text-surface-400">Find what's missing</p></div>
                    </button>
                  </div>
                )}
              </div>

              {/* Textarea */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder={user?.field ? `Ask about ${user.field} careers...` : 'Ask your career question...'}
                rows={1}
                className="flex-1 bg-transparent text-sm text-surface-900 dark:text-white placeholder:text-surface-400 resize-none outline-none py-1.5 max-h-36"
              />

              {/* Mic */}
              <button
                onClick={handleMic}
                className={clsx('w-8 h-8 mb-0.5 flex items-center justify-center rounded-xl transition-all',
                  listening ? 'bg-red-500 text-white animate-pulse' : 'text-surface-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-surface-700'
                )}
                title={listening ? 'Stop listening' : 'Voice input'}
              >
                <Mic size={15} />
              </button>

              {/* Send */}
              <button
                onClick={() => send()}
                disabled={!input.trim() || typing}
                className="w-8 h-8 mb-0.5 flex items-center justify-center rounded-xl gradient-brand-bg text-white disabled:opacity-40 hover:-translate-y-0.5 transition-all shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-center text-[10px] text-surface-300 mt-2">
              Enter to send · Shift+Enter for new line · AI advice is for guidance only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}