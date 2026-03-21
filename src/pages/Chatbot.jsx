import { useEffect, useRef, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Clock3, Mic, MessageSquareText,
  Pencil, Plus, Send, Sparkles, Trash2, User, Copy, Check, ArrowRight,
  Github, FileText, BarChart2, X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { chatService } from '@services/index'
import { useAuthStore } from '@store/authStore'

const FIELD_SUGGESTIONS = {
  Technology: [
    'What skills should I learn for a Full Stack Developer role?',
    'How do I crack a FAANG technical interview?',
    'How to improve my GitHub profile for job applications?',
    'What is the best roadmap for becoming a Data Scientist?',
  ],
  'Business & Management': [
    'How do I break into product management as a fresher?',
    'What certifications help for an MBA career?',
    'How do I prepare for a case study interview?',
    'What skills does a Business Analyst need in 2026?',
  ],
  'Finance & Accounting': [
    'How do I prepare for a CA exam while working?',
    'What skills are needed for investment banking?',
    'How do I transition from accounting to finance?',
    'What certifications help for a financial analyst role?',
  ],
  'Law & Legal': [
    'How do I prepare for a corporate law career?',
    'What skills are essential for a legal analyst role?',
    'How do I build a strong law portfolio?',
    'What is the difference between in-house counsel and law firm roles?',
  ],
  'Arts & Design': [
    'How do I build a strong UX design portfolio?',
    'What tools should I learn for a graphic design career?',
    'How do I transition from graphic design to UX design?',
    'What does a creative director role involve?',
  ],
  'Marketing & Media': [
    'How do I grow my career in digital marketing?',
    'What skills are most in demand for marketing roles in 2026?',
    'How do I prepare for a brand manager interview?',
    'What certifications help for an SEO specialist role?',
  ],
  'Healthcare & Medicine': [
    'How do I build a career in healthcare management?',
    'What skills are needed for clinical research roles?',
    'How do I transition from clinical to non-clinical healthcare roles?',
    'What certifications help for public health careers?',
  ],
  'Engineering (Non-CS)': [
    'How do I advance my career as a mechanical engineer?',
    'What certifications help for civil engineering roles?',
    'How do I transition from core engineering to management?',
    'What skills does a quality engineer need?',
  ],
  Education: [
    'How do I transition from teaching to EdTech?',
    'What skills are needed for a curriculum designer role?',
    'How do I build a career in education consulting?',
    'What certifications help for training and development roles?',
  ],
  'Science & Research': [
    'How do I build a strong research career?',
    'What skills are needed for a data analyst role in science?',
    'How do I transition from academia to industry?',
    'What certifications help for biotechnology careers?',
  ],
  Other: [
    'How do I start a career as an entrepreneur?',
    'What skills help for a government officer role?',
    'How do I build a career in the social sector?',
    'What does a policy analyst do?',
  ],
}

const DEFAULT_SUGGESTIONS = [
  'What skills should I focus on for my career goals?',
  'How do I prepare for my first job interview?',
  'How can I improve my resume?',
  'What is the best way to grow my professional network?',
]

const STORAGE = {
  sessions:  'career-chat-sessions-v5',
  active:    'career-chat-active-v5',
  width:     'career-chat-sidebar-width-v5',
  collapsed: 'career-chat-sidebar-collapsed-v5',
}

const MIN_WIDTH       = 220
const MAX_WIDTH       = 380
const DEFAULT_WIDTH   = 260
const COLLAPSED_WIDTH = 60

function makeId() { return Date.now() + '-' + Math.random().toString(36).slice(2, 8) }

function getTitle(messages) {
  const first = (messages || []).find(m => m.role === 'user')
  if (!first) return 'New chat'
  const t = String(first.content || '').trim()
  return t.length > 36 ? t.slice(0, 36) + '...' : t
}

function buildSession(messages, id) {
  return { id: id || makeId(), title: getTitle(messages), updatedAt: Date.now(), messages: Array.isArray(messages) ? messages : [] }
}

function sortSessions(items) { return [].concat(items || []).sort((a, b) => b.updatedAt - a.updatedAt) }

function readJson(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}

function writeJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }

function buildPrompt(messages, nextMessage) {
  const recent = (messages || []).slice(-12)
  if (!recent.length) return nextMessage
  const transcript = recent.map(m => (m.role === 'user' ? 'User' : 'Assistant') + ': ' + m.content).join('\n\n')
  return ['You are CareerAI, an expert AI career advisor.', 'Continue this conversation and respond only as the assistant.', '', transcript, '', 'User: ' + nextMessage, '', 'Assistant:'].join('\n')
}

function formatTime(value) {
  const diff = Date.now() - Number(value || 0)
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'Now'
  if (mins < 60) return mins + 'm'
  const hours = Math.round(mins / 60)
  if (hours < 24) return hours + 'h'
  const days = Math.round(hours / 24)
  if (days < 7) return days + 'd'
  return new Date(value).toLocaleDateString()
}

// ─── Skill Gap Modal ──────────────────────────────────────────────────────────
function SkillGapModal({ onClose, onSubmit }) {
  const [skills, setSkills] = useState('')
  const [role, setRole]     = useState('')

  const handleSubmit = () => {
    if (!skills.trim() || !role.trim()) { toast.error('Please fill both fields!'); return }
    onSubmit(skills, role); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-surface-200 bg-white p-6 shadow-xl dark:border-surface-700 dark:bg-surface-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-teal-500" />
            <h3 className="font-display text-base font-bold text-surface-900 dark:text-white">Skill Gap Analyzer</h3>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-surface-600 dark:text-surface-400">Your current skills (comma separated)</label>
            <textarea value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. JavaScript, React, Node.js, SQL..." rows={3}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-teal-400 focus:outline-none dark:border-surface-700 dark:bg-surface-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-surface-600 dark:text-surface-400">Your target role</label>
            <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Full Stack Developer..."
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-teal-400 focus:outline-none dark:border-surface-700 dark:bg-surface-800 dark:text-white" />
          </div>
          <button onClick={handleSubmit} className="w-full rounded-xl gradient-brand-bg py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-md">
            Analyze my skill gap →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── GitHub Modal ─────────────────────────────────────────────────────────────
function GitHubModal({ onClose, onSubmit }) {
  const [url, setUrl]         = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!url.trim()) { toast.error('Please enter your GitHub URL!'); return }
    const username = url.trim().replace('https://github.com/', '').replace(/\/$/, '').split('/')[0]
    if (!username) { toast.error('Invalid GitHub URL'); return }
    setLoading(true)
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`),
      ])
      if (!userRes.ok) { toast.error('GitHub user not found!'); setLoading(false); return }
      const userData  = await userRes.json()
      const reposData = await reposRes.json()
      const languages = [...new Set(reposData.filter(r => r.language).map(r => r.language))].slice(0, 6)
      const repos     = reposData.slice(0, 5).map(r => r.name).join(', ')
      const context   = [
        `GitHub Username: ${userData.login}`,
        `Name: ${userData.name || 'N/A'}`,
        `Bio: ${userData.bio || 'N/A'}`,
        `Public Repos: ${userData.public_repos}`,
        `Followers: ${userData.followers}`,
        `Top Languages: ${languages.join(', ') || 'N/A'}`,
        `Recent Repos: ${repos || 'N/A'}`,
        `Location: ${userData.location || 'N/A'}`,
      ].join('\n')
      onSubmit(context, username); onClose()
    } catch { toast.error('Failed to fetch GitHub data!') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-surface-200 bg-white p-6 shadow-xl dark:border-surface-700 dark:bg-surface-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github size={18} className="text-surface-700 dark:text-white" />
            <h3 className="font-display text-base font-bold text-surface-900 dark:text-white">Import GitHub Profile</h3>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-surface-600 dark:text-surface-400">Your GitHub profile URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://github.com/yourusername"
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-teal-400 focus:outline-none dark:border-surface-700 dark:bg-surface-800 dark:text-white" />
          </div>
          <p className="text-xs text-surface-400">We'll fetch your public profile, repos, and languages to give you personalized career advice.</p>
          <button onClick={handleSubmit} disabled={loading}
            className="w-full rounded-xl gradient-brand-bg py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50">
            {loading ? 'Fetching profile...' : 'Import & Analyze →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Message ──────────────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={clsx('flex gap-3 animate-fade-up group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={clsx(
        'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm',
        isUser ? 'gradient-brand-bg text-white' : 'bg-gradient-to-br from-violet-500 to-teal-500 text-white'
      )}>
        {isUser ? <User size={16} /> : <Sparkles size={16} />}
      </div>

      {/* Bubble */}
      <div className={clsx('flex flex-col gap-1', isUser ? 'items-end max-w-[75%]' : 'items-start max-w-[78%]')}>
        <p className={clsx('px-1 text-xs font-medium', isUser ? 'text-navy-600 dark:text-navy-300' : 'text-surface-500')}>
          {isUser ? 'You' : 'CareerAI Advisor'}
        </p>

        <div className={clsx(
          'rounded-[22px] px-4 py-3 text-sm leading-relaxed shadow-sm',
          isUser
            ? 'rounded-tr-md bg-gradient-to-r from-navy-600 to-teal-500 text-white'
            : 'rounded-tl-md border border-surface-200 bg-white text-surface-800 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200'
        )}>
          {isUser ? msg.content : (
            <ReactMarkdown components={{
              p:      ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              ul:     ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4">{children}</ul>,
              ol:     ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4">{children}</ol>,
              li:     ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
              h2:     ({ children }) => <h2 className="mt-1 mb-1.5 font-display text-sm font-bold">{children}</h2>,
              h3:     ({ children }) => <h3 className="mt-1 mb-1 text-sm font-semibold">{children}</h3>,
              code:   ({ inline, children }) => inline
                ? <code className="rounded bg-surface-100 px-1.5 py-0.5 text-xs font-mono dark:bg-surface-700">{children}</code>
                : <pre className="my-2 overflow-x-auto rounded-xl bg-surface-100 p-3 text-xs font-mono dark:bg-surface-700"><code>{children}</code></pre>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noreferrer" className="text-navy-600 underline hover:no-underline dark:text-navy-300">{children}</a>
              ),
            }}>{msg.content}</ReactMarkdown>
          )}
        </div>

        {/* Copy button for AI messages */}
        {!isUser && (
          <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-surface-400 hover:text-teal-500 transition-colors">
              {copied
                ? <><Check size={10} className="text-teal-500" /><span className="text-teal-500">Copied!</span></>
                : <><Copy size={10} /><span>Copy</span></>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-teal-500 text-white shadow-sm">
        <Sparkles size={16} />
      </div>
      <div>
        <p className="mb-1 px-1 text-xs font-medium text-surface-500">CareerAI Advisor</p>
        <div className="flex items-center gap-1.5 rounded-[22px] rounded-tl-md border border-surface-200 bg-white px-4 py-3 shadow-sm dark:border-surface-700 dark:bg-surface-800">
          {[0, 1, 2].map(i => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: i * 150 + 'ms' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Chatbot() {
  const [sessions, setSessions]               = useState(() => sortSessions(readJson(STORAGE.sessions, [])))
  const [activeSessionId, setActiveSessionId] = useState(() => readJson(STORAGE.active, null))
  const [input, setInput]                     = useState('')
  const [typing, setTyping]                   = useState(false)
  const [loading, setLoading]                 = useState(true)
  const [listening, setListening]             = useState(false)
  const [showPlusMenu, setShowPlusMenu]       = useState(false)
  const [showSkillGap, setShowSkillGap]       = useState(false)
  const [showGitHub, setShowGitHub]           = useState(false)
  const [sidebarWidth, setSidebarWidth]       = useState(() => {
    const v = Number(readJson(STORAGE.width, DEFAULT_WIDTH))
    return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, v || DEFAULT_WIDTH))
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readJson(STORAGE.collapsed, false))

  const containerRef   = useRef(null)
  const bottomRef      = useRef(null)
  const inputRef       = useRef(null)
  const fileInputRef   = useRef(null)
  const resizingRef    = useRef(false)
  const recognitionRef = useRef(null)
  const plusMenuRef    = useRef(null)
  const { user }       = useAuthStore()

  const firstName   = user?.name ? user.name.split(' ')[0] : 'there'
  const suggestions = (user?.field && FIELD_SUGGESTIONS[user.field]) ? FIELD_SUGGESTIONS[user.field] : DEFAULT_SUGGESTIONS
  const badgeText   = user?.field ? 'Specialised for ' + user.field : 'AI Career guidance'

  const activeSession = activeSessionId ? sessions.find(s => s.id === activeSessionId) || null : null
  const messages      = activeSession ? activeSession.messages : []
  const historyItems  = sortSessions(sessions)

  useEffect(() => { writeJson(STORAGE.sessions, sortSessions(sessions)) }, [sessions])
  useEffect(() => { writeJson(STORAGE.active, activeSessionId) }, [activeSessionId])
  useEffect(() => { writeJson(STORAGE.width, sidebarWidth); writeJson(STORAGE.collapsed, sidebarCollapsed) }, [sidebarWidth, sidebarCollapsed])

  useEffect(() => {
    chatService.getHistory()
      .then(r => {
        const remote = r?.data?.data || []
        if (!remote.length) return
        const imported = buildSession(remote)
        setSessions(prev => {
          const exists = prev.some(s => JSON.stringify(s.messages) === JSON.stringify(remote))
          if (exists) return sortSessions(prev)
          return sortSessions([imported, ...prev])
        })
        setActiveSessionId(id => id || imported.id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])
  useEffect(() => { if (!loading) inputRef.current?.focus() }, [loading, activeSessionId])
  useEffect(() => {
    const node = inputRef.current; if (!node) return
    node.style.height = '0px'
    node.style.height = Math.min(node.scrollHeight, 160) + 'px'
  }, [input])

  useEffect(() => {
    const onMove = e => {
      if (!resizingRef.current || !containerRef.current) return
      const left = containerRef.current.getBoundingClientRect().left
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX - left))
      setSidebarCollapsed(false); setSidebarWidth(next)
    }
    const onUp = () => { resizingRef.current = false; document.body.style.cursor = ''; document.body.style.userSelect = '' }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  useEffect(() => {
    const handler = e => { if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) setShowPlusMenu(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const saveSession = (nextMessages, id) => {
    const session = buildSession(nextMessages, id)
    setSessions(prev => sortSessions([session, ...prev.filter(s => s.id !== session.id)]))
    setActiveSessionId(session.id)
  }

  const openSession     = id => { setActiveSessionId(id); setInput('') }
  const createFreshChat = () => { setActiveSessionId(null); setInput(''); setTyping(false) }
  const clearCurrentChat = async () => {
    try { await chatService.clearHistory() } catch {}
    createFreshChat(); toast.success('Chat cleared')
  }

  const handleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { toast.error('Mic not supported in this browser'); return }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const r = new SR()
    r.lang = 'en-IN'; r.interimResults = false
    r.onstart  = () => setListening(true)
    r.onend    = () => setListening(false)
    r.onerror  = () => { setListening(false); toast.error('Could not hear you!') }
    r.onresult = e => { const t = e.results[0][0].transcript; setInput(p => p ? p + ' ' + t : t) }
    recognitionRef.current = r; r.start()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setShowPlusMenu(false); toast('Reading your resume...')
    try {
      const text    = await file.text()
      const cleaned = text.replace(/\s+/g, ' ').trim().slice(0, 3000)
      await send(`I have uploaded my resume. Please analyze it and give me:\n1. Key strengths\n2. Areas to improve\n3. ATS score estimate\n4. Career suggestions\n\nResume content:\n${cleaned}`)
    } catch { toast.error('Could not read file. Try a .txt file!') }
    e.target.value = ''
  }

  const handleGitHubSubmit = async (context) => {
    await send(`I have shared my GitHub profile. Please analyze it and give me:\n1. What my profile says about my skills\n2. How to improve my GitHub for job applications\n3. Career path suggestions based on my repos\n\nMy GitHub Data:\n${context}`)
  }

  const handleSkillGapSubmit = async (skills, role) => {
    await send(`Please analyze my skill gap:\n\nMy current skills: ${skills}\nMy target role: ${role}\n\nPlease tell me:\n1. What skills I'm missing\n2. Priority order to learn them\n3. Estimated time to be job-ready\n4. Best resources to learn each skill`)
  }

  const send = async (text) => {
    if (typing) return
    const nextMessage = String(text || input).trim(); if (!nextMessage) return
    const prompt       = buildPrompt(messages, nextMessage)
    const nextMessages = [...messages, { role: 'user', content: nextMessage }]
    setInput(''); setTyping(true)
    try {
      const response = await chatService.sendMessage(prompt)
      const reply    = response?.data?.data?.reply || 'Sorry, I could not generate a response.'
      saveSession([...nextMessages, { role: 'assistant', content: reply }], activeSessionId)
    } catch { toast.error('Failed to get response') }
    finally { setTyping(false); inputRef.current?.focus() }
  }

  const startResize = e => {
    e.preventDefault(); resizingRef.current = true
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'
  }

  const layoutStyle = { gridTemplateColumns: (sidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth) + 'px minmax(0, 1fr)' }

  return (
    <div className="h-[calc(100vh-8rem)] max-w-7xl mx-auto">
      {showSkillGap && <SkillGapModal onClose={() => setShowSkillGap(false)} onSubmit={handleSkillGapSubmit} />}
      {showGitHub   && <GitHubModal  onClose={() => setShowGitHub(false)}   onSubmit={handleGitHubSubmit}  />}
      <input ref={fileInputRef} type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />

      <div ref={containerRef}
        className="relative grid h-full overflow-hidden rounded-[28px] border border-surface-200 bg-white shadow-lifted dark:border-surface-700 dark:bg-surface-900"
        style={layoutStyle}>

        {/* ── Sidebar ── */}
        <aside className="relative flex min-h-0 flex-col border-r border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900">
          <div className="border-b border-surface-200 p-3 dark:border-surface-700">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-brand-bg text-white shadow-sm">
                  <Sparkles size={16} />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-bold text-surface-900 dark:text-white">CareerAI</p>
                    <p className="text-[11px] text-surface-500">AI Career Workspace</p>
                  </div>
                )}
              </div>
              <button onClick={() => setSidebarCollapsed(c => !c)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white">
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
          </div>

          <div className="border-b border-surface-200 p-3 dark:border-surface-700">
            {sidebarCollapsed ? (
              <button onClick={createFreshChat} title="New chat"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200 bg-white text-navy-600 transition-colors hover:border-teal-300 hover:bg-teal-50 dark:border-surface-700 dark:bg-surface-800 dark:text-teal-300 dark:hover:border-teal-700">
                <Plus size={16} />
              </button>
            ) : (
              <button onClick={createFreshChat}
                className="flex w-full items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm font-medium text-surface-800 transition-colors hover:border-teal-300 hover:bg-teal-50 dark:border-surface-700 dark:bg-surface-800 dark:text-white dark:hover:border-teal-700">
                <Pencil size={15} />
                New chat
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {!sidebarCollapsed && (
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-surface-400">
                <Clock3 size={12} />
                History
              </div>
            )}
            <div className="space-y-1.5">
              {historyItems.length > 0 ? historyItems.map(session =>
                sidebarCollapsed ? (
                  <button key={session.id} onClick={() => openSession(session.id)} title={session.title}
                    className={clsx('flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                      session.id === activeSessionId
                        ? 'border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-900/20 dark:text-teal-300'
                        : 'border-surface-200 bg-white text-surface-500 hover:border-teal-300 hover:bg-teal-50 dark:border-surface-700 dark:bg-surface-800 dark:hover:border-teal-700')}>
                    <MessageSquareText size={15} />
                  </button>
                ) : (
                  <button key={session.id} onClick={() => openSession(session.id)}
                    className={clsx('w-full rounded-xl border px-3 py-2 text-left transition-colors',
                      session.id === activeSessionId
                        ? 'border-teal-300 bg-teal-50/70 dark:border-teal-700 dark:bg-teal-900/20'
                        : 'border-surface-200 bg-white hover:border-teal-300 hover:bg-teal-50/60 dark:border-surface-700 dark:bg-surface-800 dark:hover:border-teal-700')}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquareText size={13} className={clsx('shrink-0', session.id === activeSessionId ? 'text-teal-500' : 'text-surface-400')} />
                        <p className="truncate text-[13px] font-medium text-surface-900 dark:text-white">{session.title}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-surface-400">{formatTime(session.updatedAt)}</span>
                    </div>
                  </button>
                )
              ) : !sidebarCollapsed && (
                <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-4 text-sm text-surface-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400">
                  Your chat history will appear here.
                </div>
              )}
            </div>
          </div>

          <div onMouseDown={startResize} onDoubleClick={() => setSidebarCollapsed(c => !c)}
            className="absolute -right-3 top-0 z-20 hidden h-full w-6 cursor-col-resize items-center justify-center touch-none lg:flex">
            {!sidebarCollapsed && (
              <div className="flex h-20 w-6 items-center justify-center rounded-full bg-transparent text-surface-300 transition-colors hover:text-teal-500">
                <div className="flex h-14 w-1 items-center justify-center rounded-full bg-surface-200 dark:bg-surface-700" />
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Chat ── */}
        <section className="flex min-h-0 min-w-0 flex-col bg-gradient-to-b from-white via-surface-50/40 to-white dark:from-surface-900 dark:via-surface-900 dark:to-surface-900">

          <div className="border-b border-surface-200 bg-white/70 p-5 backdrop-blur dark:border-surface-700 dark:bg-surface-900/70">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-navy-500 to-teal-500 text-white shadow-glow">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-surface-900 dark:text-white">AI Career Advisor</h1>
                  <div className="mt-1 flex items-center gap-2 text-sm text-teal-600 dark:text-teal-300">
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                    {badgeText}
                  </div>
                </div>
              </div>
              {activeSession && messages.length > 0 && (
                <button onClick={clearCurrentChat}
                  className="btn-ghost rounded-full px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <span className="flex items-center gap-1.5"><Trash2 size={13} />Clear chat</span>
                </button>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-6">
              {loading && (
                <div className="flex flex-1 items-center justify-center">
                  <div className="h-7 w-7 rounded-full border-2 border-navy-600 border-t-transparent animate-spin" />
                </div>
              )}

              {!loading && messages.length === 0 && (
                <div className="m-auto w-full max-w-3xl text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[30px] bg-gradient-to-br from-navy-600 via-violet-600 to-teal-500 text-white shadow-glow">
                    <Sparkles size={30} />
                  </div>
                  <h2 className="mb-3 font-display text-3xl font-bold text-surface-900 dark:text-white">
                    Hey, {firstName}. Ready to dive in?
                  </h2>
                  <p className="mx-auto mb-6 max-w-2xl text-sm leading-7 text-surface-500">
                    Ask about roles, resumes, interviews, upskilling, and career strategy. Each chat stays saved in History and opens instantly.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {suggestions.map(s => (
                      <button key={s} onClick={() => send(s)}
                        className="group rounded-[18px] border border-surface-200 bg-white/90 p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50/60 dark:border-surface-700 dark:bg-surface-800/80 dark:hover:border-teal-700 dark:hover:bg-surface-800 flex items-start justify-between gap-2">
                        <div>
                          <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 transition-colors group-hover:bg-gradient-to-br group-hover:from-navy-600 group-hover:to-teal-500 group-hover:text-white dark:bg-teal-900/20 dark:text-teal-300">
                            <Sparkles size={14} />
                          </div>
                          <p className="text-[13px] font-medium leading-5 text-surface-800 dark:text-surface-100">{s}</p>
                        </div>
                        <ArrowRight size={13} className="mt-1 shrink-0 opacity-0 group-hover:opacity-100 text-teal-500 transition-all group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading && messages.length > 0 && (
                <div className="space-y-5 py-2">
                  {messages.map((msg, i) => <Message key={msg.role + '-' + i} msg={msg} />)}
                  {typing && <TypingIndicator />}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </div>

          {/* ── Input ── */}
          <div className="border-t border-surface-200 bg-white/80 p-4 backdrop-blur dark:border-surface-700 dark:bg-surface-900/80 sm:p-5">
            <div className="mx-auto w-full max-w-4xl">
              <div className="rounded-[28px] border border-surface-200 bg-surface-50/90 p-2 shadow-sm dark:border-surface-700 dark:bg-surface-800/85">
                <div className="flex items-end gap-2">

                  {/* Plus Menu */}
                  <div className="relative mb-1" ref={plusMenuRef}>
                    <button onClick={() => setShowPlusMenu(p => !p)}
                      className={clsx('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-all',
                        showPlusMenu
                          ? 'bg-teal-500 text-white'
                          : 'bg-white text-surface-500 hover:bg-teal-50 hover:text-teal-600 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600 dark:hover:text-teal-300')}>
                      <Plus size={17} className={clsx('transition-transform duration-200', showPlusMenu && 'rotate-45')} />
                    </button>

                    {showPlusMenu && (
                      <div className="absolute bottom-14 left-0 z-30 w-56 rounded-2xl border border-surface-200 bg-white py-2 shadow-xl dark:border-surface-700 dark:bg-surface-800">
                        <button onClick={() => { setShowPlusMenu(false); fileInputRef.current?.click() }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700 transition-colors">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-900/20">
                            <FileText size={15} />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Upload Resume</p>
                            <p className="text-[11px] text-surface-400">PDF, DOC, TXT</p>
                          </div>
                        </button>

                        <button onClick={() => { setShowPlusMenu(false); setShowGitHub(true) }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700 transition-colors">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-white">
                            <Github size={15} />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">GitHub Profile</p>
                            <p className="text-[11px] text-surface-400">Import & analyze</p>
                          </div>
                        </button>

                        <div className="my-1 border-t border-surface-100 dark:border-surface-700" />

                        <button onClick={() => { setShowPlusMenu(false); setShowSkillGap(true) }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700 transition-colors">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-300">
                            <BarChart2 size={15} />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Skill Gap Analyzer</p>
                            <p className="text-[11px] text-surface-400">Find what's missing</p>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  <textarea ref={inputRef} value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                    placeholder={user?.field ? 'Ask about ' + user.field + ' careers...' : 'Ask your career question...'}
                    style={{ maxHeight: '160px', outline: 'none', boxShadow: 'none' }}
                    className="min-h-[56px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 dark:text-white border-none" />

                  <button onClick={handleMic}
                    className={clsx('mb-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-all',
                      listening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-surface-500 hover:bg-teal-50 hover:text-teal-600 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600 dark:hover:text-teal-300'
                    )} title={listening ? 'Stop' : 'Voice input'}>
                    <Mic size={17} />
                  </button>

                  <button onClick={() => send()} disabled={!input.trim() || typing}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gradient-brand-bg text-white shadow-glow transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Send">
                    <Send size={17} />
                  </button>

                </div>
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  )
}
