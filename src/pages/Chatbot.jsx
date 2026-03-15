import { useState, useEffect, useRef } from 'react'
import { Send, Trash2, Sparkles, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { chatService } from '@services/index'
import { useAuthStore } from '@store/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Field-specific suggestions
const FIELD_SUGGESTIONS = {
  'Technology': [
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
  'Education': [
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
  'Other': [
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

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={clsx('flex gap-3 animate-fade-up', isUser && 'flex-row-reverse')}>
      <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        isUser ? 'gradient-brand-bg' : 'bg-violet-100 dark:bg-violet-900/40'
      )}>
        {isUser
          ? <User size={14} className="text-white" />
          : <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
        }
      </div>
      <div className={clsx('max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
        isUser
          ? 'gradient-brand-bg text-white rounded-tr-sm'
          : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 rounded-tl-sm'
      )}>
        {isUser ? msg.content : (
          <ReactMarkdown
            components={{
              p:      ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              ul:     ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
              ol:     ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
              li:     ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
              h2:     ({ children }) => <h2 className="font-display text-sm font-700 mb-1.5 mt-1">{children}</h2>,
              h3:     ({ children }) => <h3 className="font-semibold text-sm mb-1 mt-1">{children}</h3>,
              code:   ({ inline, children }) => inline
                ? <code className="bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                : <pre className="bg-surface-100 dark:bg-surface-700 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2"><code>{children}</code></pre>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noreferrer" className="text-navy-600 dark:text-navy-300 underline hover:no-underline">{children}</a>
              ),
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
        <Sparkles size={14} className="text-violet-600" />
      </div>
      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
        {[0,1,2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
        ))}
      </div>
    </div>
  )
}

export default function Chatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [typing, setTyping]     = useState(false)
  const [loading, setLoading]   = useState(true)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)
  const { user }                = useAuthStore()

  // Get field-specific suggestions
  const suggestions = FIELD_SUGGESTIONS[user?.field] || DEFAULT_SUGGESTIONS

  useEffect(() => {
    chatService.getHistory()
      .then(r => setMessages(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput('')
    setMessages(p => [...p, { role: 'user', content: msg }])
    setTyping(true)
    try {
      const r = await chatService.sendMessage(msg)
      setMessages(p => [...p, { role: 'assistant', content: r.data.data.reply }])
    } catch {
      toast.error('Failed to get response')
    } finally {
      setTyping(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = async () => {
    await chatService.clearHistory()
    setMessages([])
    toast.success('Chat cleared')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-700 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-700 text-surface-900 dark:text-white">AI Career Advisor</h1>
            <div className="flex items-center gap-1.5 text-xs text-teal-600">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              {user?.field ? `Specialised for ${user.field}` : 'Powered by Groq AI'}
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-ghost text-xs flex items-center gap-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-white" />
            </div>
            <h3 className="font-display text-lg font-700 text-surface-900 dark:text-white mb-2">
              Hi {user?.name?.split(' ')[0]}! I'm your AI career advisor.
            </h3>
            <p className="text-surface-500 text-sm mb-2 max-w-sm mx-auto">
              {user?.field
                ? `I'm specialised for <strong>${user.field}</strong> careers. Ask me anything!`
                : 'Ask me anything about careers, skills, interviews, or job searching.'
              }
            </p>
            {user?.field && (
              <p className="text-xs text-teal-600 mb-6">
                Specialised for <strong>{user.field}</strong> · {user?.goal || 'Career growth'}
              </p>
            )}
            <div className="grid sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {suggestions.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-left p-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-xs text-surface-600 dark:text-surface-400 hover:border-navy-300 hover:text-navy-600 dark:hover:border-navy-600 dark:hover:text-navy-300 transition-all"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={user?.field ? `Ask about ${user.field} careers...` : 'Ask your career question...'}
            rows={1}
            className="input flex-1 py-3 resize-none"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button onClick={() => send()} disabled={!input.trim() || typing}
            className="btn-primary px-4 rounded-xl disabled:opacity-40 shrink-0">
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-surface-400 mt-2 text-center">
          AI responses are for guidance only · Always verify important career decisions
        </p>
      </div>
    </div>
  )
}