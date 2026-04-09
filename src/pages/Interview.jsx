import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  AudioLines,
  CheckCircle2,
  ChevronRight,
  Clock,
  LoaderCircle,
  Mic,
  PenLine,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Square,
  TrendingUp,
  Volume2,
  WandSparkles,
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import api from '@services/axiosInstance'
import { useAuthStore } from '@store/authStore'
import { useLocalStorage } from '@hooks/index'
import useSpeechRecognition from '@hooks/useSpeechRecognition'
import useSpeechPlayback from '@hooks/useSpeechPlayback'

const FIELD_ROLES = {
  Technology: ['Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer', 'Cloud Architect', 'Cybersecurity Analyst', 'Mobile Developer'],
  'Business & Management': ['Product Manager', 'Business Analyst', 'Operations Manager', 'Strategy Consultant', 'Scrum Master', 'Project Manager', 'Management Consultant'],
  'Finance & Accounting': ['Financial Analyst', 'Investment Banker', 'Chartered Accountant', 'Risk Analyst', 'Portfolio Manager', 'Tax Consultant', 'Auditor'],
  'Law & Legal': ['Corporate Lawyer', 'Legal Analyst', 'Compliance Officer', 'Legal Counsel', 'IP Attorney', 'Paralegal'],
  'Arts & Design': ['UX Designer', 'Graphic Designer', 'Art Director', 'Motion Designer', 'Illustrator', 'Creative Director', 'Brand Designer'],
  'Marketing & Media': ['Marketing Manager', 'Content Strategist', 'Brand Manager', 'SEO Specialist', 'Social Media Manager', 'Copywriter', 'Growth Marketer'],
  'Healthcare & Medicine': ['Doctor', 'Healthcare Analyst', 'Medical Researcher', 'Pharmacist', 'Public Health Officer', 'Healthcare Manager', 'Clinical Research Associate'],
  'Engineering (Non-CS)': ['Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Manufacturing Engineer', 'Quality Engineer', 'Structural Engineer'],
  Education: ['Teacher', 'Curriculum Designer', 'Education Consultant', 'School Principal', 'EdTech Specialist', 'Training Manager'],
  'Science & Research': ['Research Scientist', 'Lab Analyst', 'Data Analyst', 'Science Writer', 'R&D Engineer', 'Environmental Scientist'],
  Other: ['Entrepreneur', 'Freelancer', 'Social Worker', 'NGO Manager', 'Government Officer', 'Journalist', 'Policy Analyst'],
}

const DEFAULT_VOICE_SETTINGS = {
  autoplayQuestions: true,
  readFeedbackAloud: true,
}

const ACTIVE_INTERVIEW_STORAGE_KEY = 'career-interview-active-session'
const INTERVIEW_HISTORY_STATE_KEY = 'career-interview-phase'
const QUESTION_START_DELAY_MS = 2000
const MIC_START_DELAY_AFTER_QUESTION_MS = 2000
const NO_SPEECH_AUTO_SUBMIT_MS = 10000
const NO_SPEECH_FALLBACK_ANSWER = 'No spoken response provided.'

const readActiveInterviewSession = () => {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(ACTIVE_INTERVIEW_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const writeActiveInterviewSession = (value) => {
  if (typeof window === 'undefined') return

  try {
    if (value) window.localStorage.setItem(ACTIVE_INTERVIEW_STORAGE_KEY, JSON.stringify(value))
    else window.localStorage.removeItem(ACTIVE_INTERVIEW_STORAGE_KEY)
  } catch {}
}

const joinTranscriptParts = (...parts) => parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()

const getScoreTone = (score) => {
  if (score >= 8) {
    return {
      text: 'text-teal-600 dark:text-teal-300',
      badge: 'badge-accent',
      panel: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700/50',
      label: 'Strong answer',
    }
  }

  if (score >= 5) {
    return {
      text: 'text-amber-600 dark:text-amber-300',
      badge: 'badge-warning',
      panel: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50',
      label: 'Good base',
    }
  }

  return {
    text: 'text-red-600 dark:text-red-300',
    badge: 'badge-danger',
    panel: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50',
    label: 'Needs work',
  }
}

const getSessionStatus = ({ loading, isListening, isSpeaking, evaluation }) => {
  if (loading) return { label: 'Processing answer', hint: 'We are evaluating your response against the current question.', tone: 'badge-warning' }
  if (isListening) return { label: 'Listening', hint: 'Speak naturally. Your transcript will appear live below.', tone: 'badge-danger' }
  if (isSpeaking) return { label: 'AI speaking', hint: 'The interviewer is reading the current question aloud.', tone: 'badge-accent' }
  if (evaluation) return { label: 'Feedback ready', hint: 'Review the score, then continue to the next question.', tone: 'badge-success' }
  return { label: 'Ready for your answer', hint: 'Use the mic or type directly. Your transcript stays editable.', tone: 'badge-primary' }
}

const getStructuredSuggestions = (feedbackText, fallback = []) => {
  const fromFeedback = String(feedbackText || '')
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item.length > 18)
    .slice(0, 3)

  const merged = [...fromFeedback, ...(Array.isArray(fallback) ? fallback : [])]
  const unique = Array.from(new Set(merged.map((item) => item.trim()).filter(Boolean)))
  return unique.slice(0, 3)
}

const toStructuredFeedback = (evaluation) => {
  const numericScore = Number(evaluation?.score || 0)
  const feedbackText = String(evaluation?.feedback || '').trim()

  const clarity = numericScore >= 8
    ? 'Clear and well-structured response.'
    : numericScore >= 5
      ? 'Reasonably clear, but structure can be tighter.'
      : 'Needs stronger structure and sharper points.'

  const confidence = numericScore >= 8
    ? 'Confident and decisive delivery.'
    : numericScore >= 5
      ? 'Moderate confidence; add more certainty.'
      : 'Low confidence signal; be more direct and specific.'

  const suggestions = getStructuredSuggestions(feedbackText, [
    'Use one concrete example with measurable outcome.',
    'Keep answer concise with clear beginning, middle, and end.',
    'End with business impact or lesson learned.',
  ])

  return {
    clarity,
    confidence,
    suggestions,
    raw: evaluation,
    score: numericScore,
  }
}

const INTERVIEW_TIPS = {
  HR: [
    'Use the STAR structure to keep your answer clear and credible.',
    'Show ownership, communication, and the business impact of your work.',
    'Aim for a confident answer that fits comfortably inside 90 to 120 seconds.',
  ],
  Technical: [
    'Explain your thinking in sequence, not just the final solution.',
    'Mention trade-offs, constraints, and why you made specific decisions.',
    'Use concrete examples from projects, bugs, systems, or production incidents.',
  ],
  Mixed: [
    'Balance communication, problem solving, and measurable impact in the same answer.',
    'Use one concrete example instead of speaking in broad generic statements.',
    'Keep the answer structured enough to sound thoughtful, but natural enough to feel spoken.',
  ],
}

const formatDuration = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function SettingToggle({ label, hint, checked, onToggle, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={clsx(
        'flex w-full items-start justify-between gap-4 rounded-2xl border p-4 text-left transition-all',
        disabled
          ? 'cursor-not-allowed border-surface-200 bg-surface-50 opacity-60 dark:border-surface-700 dark:bg-surface-900/60'
          : checked
            ? 'border-navy-300 bg-navy-50 dark:border-navy-700/50 dark:bg-navy-900/30'
            : 'border-surface-200 bg-white hover:border-surface-300 dark:border-surface-700 dark:bg-surface-900/60 dark:hover:border-surface-600'
      )}
    >
      <div>
        <div className="text-sm font-semibold text-surface-900 dark:text-white">{label}</div>
        <div className="mt-1 text-xs leading-relaxed text-surface-500">{hint}</div>
      </div>
      <span className={clsx(
        'mt-1 inline-flex h-6 w-11 items-center rounded-full p-1 transition-colors',
        checked ? 'bg-navy-600' : 'bg-surface-300 dark:bg-surface-700'
      )}>
        <span className={clsx(
          'h-4 w-4 rounded-full bg-white transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )} />
      </span>
    </button>
  )
}

function VoiceOrbButton({ canRecord, isListening, isSpeaking }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <div className={clsx(
          'absolute inset-0 rounded-full transition-all',
          isListening
            ? 'bg-red-100/70 dark:bg-red-900/20'
            : isSpeaking
              ? 'bg-teal-100/70 dark:bg-teal-900/20'
              : 'bg-surface-100 dark:bg-surface-800'
        )} />
        <div
          className={clsx(
            'relative z-10 flex h-20 w-20 items-center justify-center rounded-full border transition-all shadow-sm',
            !canRecord
              ? 'border-surface-200 bg-surface-100 text-surface-400 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-500'
              : isListening
                ? 'border-red-300 bg-red-500 text-white'
                : isSpeaking
                  ? 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-700/40 dark:bg-teal-900/20 dark:text-teal-300'
                  : 'border-surface-300 bg-surface-50 text-surface-700 dark:border-surface-700 dark:bg-surface-900/80 dark:text-surface-100'
          )}
        >
          <Mic size={24} />
        </div>
      </div>

      <div className="text-center">
        <div className="text-base font-semibold text-surface-900 dark:text-white">
          {isListening ? 'Recording answer' : isSpeaking ? 'Interviewer speaking' : canRecord ? 'Listening starts automatically' : 'Voice capture unavailable'}
        </div>
        <div className="mt-1 text-sm text-surface-500">
          {isListening
            ? 'Recording is live. Pause naturally or submit when ready.'
            : isSpeaking
              ? 'Wait for the prompt to finish before you respond.'
            : canRecord
              ? 'The mic opens on its own after the question finishes.'
              : 'Switch to Chrome or Edge to unlock the voice-first interview flow.'
          }
        </div>
      </div>
    </div>
  )
}

export default function Interview() {
  const [phase, setPhase] = useState('select')
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [type, setType] = useState('Mixed')
  const [interview, setInterview] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [allEvals, setAllEvals] = useState([])
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSessionSetup, setShowSessionSetup] = useState(false)
  const [workspaceTab, setWorkspaceTab] = useState('recording')
  const [feedbackPanelOpen, setFeedbackPanelOpen] = useState(false)
  const [feedbackByQuestion, setFeedbackByQuestion] = useState({})
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0)
  const [sessionStartedAt, setSessionStartedAt] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [voiceSettings, setVoiceSettings] = useLocalStorage('career-interview-voice-settings', DEFAULT_VOICE_SETTINGS)
  const resolvedVoiceSettings = { ...DEFAULT_VOICE_SETTINGS, ...(voiceSettings || {}) }

  const { user } = useAuthStore()
  const {
    isSupported: isRecognitionSupported,
    isListening,
    finalTranscript,
    interimTranscript,
    error: recognitionError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ restartOnEnd: true })
  const {
    isSupported: isPlaybackSupported,
    isSpeaking,
    speak,
    stop: stopPlayback,
  } = useSpeechPlayback({ lang: 'en-US', rate: 0.96, pitch: 0.94, volume: 0.92 })

  const recordingSessionRef = useRef(false)
  const recordingQuestionIndexRef = useRef(null)
  const baseAnswerRef = useRef('')
  const autoQuestionKeyRef = useRef('')
  const spokenFeedbackKeyRef = useRef('')
  const autoSubmitPendingRef = useRef(false)
  const submitAnswerRef = useRef(null)
  const lastSpeechAtRef = useRef(null)
  const noSpeechTimerRef = useRef(null)
  const autoNextTimerRef = useRef(null)
  const playQuestionAndCaptureRef = useRef(() => () => {})
  const heardSpeechRef = useRef(false)
  const hasRestoredSessionRef = useRef(false)
  const browserHistoryReadyRef = useRef(false)
  const isHandlingBrowserBackRef = useRef(false)
  const lastHistoryPhaseRef = useRef('select')
  const isListeningRef = useRef(false)
  const isSpeakingRef = useRef(false)
  const evaluationRef = useRef(null)
  const loadingRef = useRef(false)
  const phaseRef = useRef('select')
  const pendingSubmissionSetRef = useRef(new Set())
  const finalizeAfterPendingRef = useRef(false)
  const [silenceCountdown, setSilenceCountdown] = useState(null)

  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  useEffect(() => {
    isSpeakingRef.current = isSpeaking
  }, [isSpeaking])

  useEffect(() => {
    evaluationRef.current = evaluation
  }, [evaluation])

  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const userField = user?.field || 'Technology'
  const fieldRoles = FIELD_ROLES[userField] || FIELD_ROLES.Technology
  const defaultRole = user?.targetRole || ''

  useEffect(() => {
    if (defaultRole && !readActiveInterviewSession()) setRole(defaultRole)

    api.get('/interviews/history')
      .then((response) => setHistory(response.data.data || []))
      .catch(() => {})
  }, [defaultRole])

  useEffect(() => {
    if (hasRestoredSessionRef.current) return
    hasRestoredSessionRef.current = true

    const savedSession = readActiveInterviewSession()
    const historyPhase = typeof window !== 'undefined'
      ? window.history.state?.[INTERVIEW_HISTORY_STATE_KEY]
      : null
    const shouldRestore = Boolean(
      savedSession && (historyPhase === 'interview' || (historyPhase === 'result' && savedSession.result))
    )

    if (!shouldRestore) {
      writeActiveInterviewSession(null)
      if (typeof window !== 'undefined') {
        window.history.replaceState(
          { ...(window.history.state || {}), [INTERVIEW_HISTORY_STATE_KEY]: 'select' },
          ''
        )
      }
      browserHistoryReadyRef.current = true
      lastHistoryPhaseRef.current = 'select'
      return
    }

    setRole(savedSession.role || '')
    setCustomRole(savedSession.customRole || '')
    setType(savedSession.type || 'Mixed')
    setInterview(savedSession.interview || null)
    setCurrentQ(savedSession.currentQ || 0)
    setAnswer(savedSession.answer || '')
    setEvaluation(savedSession.evaluation || null)
    setAllEvals(savedSession.allEvals || [])
    setFeedbackByQuestion(savedSession.feedbackByQuestion || {})
    setResult(savedSession.result || null)

    const restoredStart = savedSession.sessionStartedAt || Date.now()
    setSessionStartedAt(restoredStart)
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - restoredStart) / 1000)))

    const restoredPhase = savedSession.phase === 'result' && savedSession.result ? 'result' : 'interview'
    setPhase(restoredPhase)

    if (typeof window !== 'undefined') {
      window.history.replaceState(
        { ...(window.history.state || {}), [INTERVIEW_HISTORY_STATE_KEY]: 'select' },
        ''
      )

      window.history.pushState(
        { ...(window.history.state || {}), [INTERVIEW_HISTORY_STATE_KEY]: 'interview' },
        ''
      )

      if (restoredPhase === 'result') {
        window.history.pushState(
          { ...(window.history.state || {}), [INTERVIEW_HISTORY_STATE_KEY]: 'result' },
          ''
        )
      }
    }

    browserHistoryReadyRef.current = true
    lastHistoryPhaseRef.current = restoredPhase
  }, [])

  useEffect(() => {
    if (!browserHistoryReadyRef.current || typeof window === 'undefined') return undefined

    const handlePopState = (event) => {
      const nextPhase = event.state?.[INTERVIEW_HISTORY_STATE_KEY]
      if (!nextPhase) return

      isHandlingBrowserBackRef.current = true
      stopVoiceActivity()

      if (nextPhase === 'result' && result) {
        setPhase('result')
        return
      }

      if (nextPhase === 'interview' && interview) {
        setPhase('interview')
        return
      }

      writeActiveInterviewSession(null)
      recordingSessionRef.current = false
      autoSubmitPendingRef.current = false
      setPhase('select')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [interview, result])

  useEffect(() => {
    if (voiceSettings?.readFeedbackAloud === true) return
    setVoiceSettings({
      ...DEFAULT_VOICE_SETTINGS,
      ...(voiceSettings || {}),
      readFeedbackAloud: true,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      writeActiveInterviewSession(null)
      if (autoNextTimerRef.current) {
        window.clearTimeout(autoNextTimerRef.current)
        autoNextTimerRef.current = null
      }
      if (noSpeechTimerRef.current) {
        window.clearTimeout(noSpeechTimerRef.current)
        noSpeechTimerRef.current = null
      }
      stopListening()
      stopPlayback()
    }
  }, [stopListening, stopPlayback])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handlePageHide = () => {
      writeActiveInterviewSession(null)
    }

    window.addEventListener('pagehide', handlePageHide)
    return () => window.removeEventListener('pagehide', handlePageHide)
  }, [])

  useEffect(() => {
    if (recordingSessionRef.current && !isListening) {
      const mergedTranscript = joinTranscriptParts(baseAnswerRef.current, finalTranscript)

      if (
        mergedTranscript
        && recordingQuestionIndexRef.current === currentQ
        && phaseRef.current === 'interview'
      ) {
        setAnswer(mergedTranscript)
      }

      recordingSessionRef.current = false
      recordingQuestionIndexRef.current = null
      baseAnswerRef.current = ''
    }
  }, [currentQ, finalTranscript, isListening])

  useEffect(() => {
    if (!isListening) {
      setSilenceCountdown(null)
      return
    }

    const activeTranscript = joinTranscriptParts(finalTranscript, interimTranscript)
    if (!activeTranscript) return

    heardSpeechRef.current = true
    if (noSpeechTimerRef.current) {
      window.clearTimeout(noSpeechTimerRef.current)
      noSpeechTimerRef.current = null
    }
    lastSpeechAtRef.current = Date.now()
    setSilenceCountdown(Math.ceil(NO_SPEECH_AUTO_SUBMIT_MS / 1000))
  }, [finalTranscript, interimTranscript, isListening])

  useEffect(() => {
    if (!isListening) {
      if (noSpeechTimerRef.current) {
        window.clearTimeout(noSpeechTimerRef.current)
        noSpeechTimerRef.current = null
      }
      return
    }

    if (heardSpeechRef.current) return

    if (noSpeechTimerRef.current) {
      window.clearTimeout(noSpeechTimerRef.current)
      noSpeechTimerRef.current = null
    }

    noSpeechTimerRef.current = window.setTimeout(() => {
      if (
        !isListeningRef.current
        || heardSpeechRef.current
        || phaseRef.current !== 'interview'
        || Boolean(evaluationRef.current)
      ) {
        return
      }

      autoSubmitPendingRef.current = true
      setAnswer(NO_SPEECH_FALLBACK_ANSWER)
      stopListening()
    }, NO_SPEECH_AUTO_SUBMIT_MS)

    return () => {
      if (noSpeechTimerRef.current) {
        window.clearTimeout(noSpeechTimerRef.current)
        noSpeechTimerRef.current = null
      }
    }
  }, [isListening, stopListening])

  useEffect(() => {
    if (!recognitionError) return
    toast.error(recognitionError)
  }, [recognitionError])

  useEffect(() => {
    if (phase !== 'interview' || !sessionStartedAt) return undefined

    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000)))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [phase, sessionStartedAt])

  const questions = interview?.questions || []
  const currentQuestion = questions[currentQ]
  const questionProgress = questions.length ? ((currentQ + (evaluation ? 1 : 0)) / questions.length) * 100 : 0
  const selectedRole = customRole.trim() || role
  const draftPreview = isListening
    ? joinTranscriptParts(baseAnswerRef.current, finalTranscript, interimTranscript)
    : answer

  const interviewSummary = useMemo(() => {
    const completedCount = history.length
    const averageScore = completedCount
      ? Math.round(history.reduce((sum, item) => sum + (item.overallScore || 0), 0) / completedCount)
      : 0
    const bestScore = completedCount
      ? Math.max(...history.map((item) => item.overallScore || 0))
      : 0

    return { completedCount, averageScore, bestScore }
  }, [history])

  const sessionStatus = getSessionStatus({
    loading,
    isListening,
    isSpeaking,
    evaluation,
  })

  useEffect(() => {
    if (phase !== 'interview') return

    if (isListening || isSpeaking || loading) {
      setWorkspaceTab('recording')
    }
  }, [isListening, isSpeaking, loading, phase])

  const beginVoiceCapture = useCallback((baseText = '') => {
    if (!isRecognitionSupported) {
      toast.error('Voice capture is unavailable in this browser. You can still answer by typing.')
      return false
    }

    if (isListeningRef.current) {
      stopListening()
    }

    stopPlayback()
    setWorkspaceTab('recording')
    resetTranscript()
    baseAnswerRef.current = baseText
    recordingQuestionIndexRef.current = currentQ
    autoSubmitPendingRef.current = false
    lastSpeechAtRef.current = null
    heardSpeechRef.current = false
    if (noSpeechTimerRef.current) {
      window.clearTimeout(noSpeechTimerRef.current)
      noSpeechTimerRef.current = null
    }
    setSilenceCountdown(null)

    const didStart = startListening()
    if (didStart) recordingSessionRef.current = true
    return didStart
  }, [currentQ, isRecognitionSupported, resetTranscript, startListening, stopListening, stopPlayback])

  const primeMicrophonePermission = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
    } catch {
      // Keep flowing; startListening will still surface a user-facing error if needed.
    }
  }, [])

  const safeBeginVoiceCapture = useCallback((baseText = '') => {
    let cancelled = false
    let retryTimer = null
    let verifyTimer = null
    let attempts = 0
    const maxAttempts = 8

    const tryStart = (attempt = 0) => {
      if (
        cancelled
        || phaseRef.current !== 'interview'
        || Boolean(evaluationRef.current)
        || loadingRef.current
      ) {
        return
      }

      attempts += 1
      const didStart = beginVoiceCapture(baseText)

      if (!didStart) {
        if (attempt < maxAttempts) {
          retryTimer = window.setTimeout(() => tryStart(attempt + 1), 700)
        } else if (!cancelled) {
          toast.error('Could not auto-start recording. Please check microphone permission and try again.')
        }
        return
      }

      verifyTimer = window.setTimeout(() => {
        if (
          cancelled
          || phaseRef.current !== 'interview'
          || Boolean(evaluationRef.current)
          || loadingRef.current
          || isListeningRef.current
        ) {
          return
        }

        if (attempt < maxAttempts) {
          tryStart(attempt + 1)
        } else if (!cancelled && !isListeningRef.current && attempts >= maxAttempts) {
          toast.error('Mic did not start. Click Replay question once to restart the turn.')
        }
      }, 1200)
    }

    tryStart(0)

    return () => {
      cancelled = true
      if (retryTimer) window.clearTimeout(retryTimer)
      if (verifyTimer) window.clearTimeout(verifyTimer)
    }
  }, [beginVoiceCapture])

  const playQuestionAndCapture = useCallback((questionText, baseText = '') => {
    if (!questionText) return () => {}

    let cancelled = false
    let captureCleanup = () => {}
    let captureDelayTimer = null
    let speechFallbackTimer = null
    let captureScheduled = false
    let captureTriggered = false

    const launchCapture = () => {
      if (
        cancelled
        || captureTriggered
        || phaseRef.current !== 'interview'
        || Boolean(evaluationRef.current)
        || loadingRef.current
      ) {
        return
      }

      captureTriggered = true
      stopPlayback()
      captureCleanup = safeBeginVoiceCapture(baseText)
    }

    const scheduleCapture = () => {
      if (cancelled || captureScheduled || captureTriggered) return
      captureScheduled = true
      captureDelayTimer = window.setTimeout(() => {
        launchCapture()
      }, MIC_START_DELAY_AFTER_QUESTION_MS)
    }

    stopPlayback()

    const ensureSpeechFinishedThenCapture = () => {
      if (cancelled || captureTriggered || captureScheduled) return

      const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
      if (synth && (synth.speaking || synth.pending || isSpeakingRef.current)) {
        speechFallbackTimer = window.setTimeout(() => {
          ensureSpeechFinishedThenCapture()
        }, 900)
        return
      }

      scheduleCapture()
    }

    if (isPlaybackSupported) {
      const questionPrompt = `Question ${currentQ + 1}. ${questionText}`
      const questionWordCount = questionPrompt.trim().split(/\s+/).length
      const estimatedQuestionMs = Math.min(28000, Math.max(5000, questionWordCount * 420 + 2200))

      speechFallbackTimer = window.setTimeout(() => {
        ensureSpeechFinishedThenCapture()
      }, estimatedQuestionMs)

      speak(questionPrompt).then(() => {
        if (cancelled) return
        if (speechFallbackTimer) {
          window.clearTimeout(speechFallbackTimer)
          speechFallbackTimer = null
        }
        scheduleCapture()
      })
    } else {
      scheduleCapture()
    }

    return () => {
      cancelled = true
      if (speechFallbackTimer) window.clearTimeout(speechFallbackTimer)
      if (captureDelayTimer) window.clearTimeout(captureDelayTimer)
      captureCleanup()
    }
  }, [currentQ, isPlaybackSupported, safeBeginVoiceCapture, speak, stopPlayback])

  useEffect(() => {
    playQuestionAndCaptureRef.current = playQuestionAndCapture
  }, [playQuestionAndCapture])

  useEffect(() => {
    if (phase === 'interview' && interview?._id) {
      writeActiveInterviewSession({
        phase: 'interview',
        role,
        customRole,
        type,
        interview,
        currentQ,
        answer: isListening ? joinTranscriptParts(baseAnswerRef.current, finalTranscript, interimTranscript) : answer,
        evaluation,
        allEvals,
        feedbackByQuestion,
        sessionStartedAt,
      })
      return
    }

    if (phase === 'result' && result) {
      writeActiveInterviewSession({
        phase: 'result',
        role,
        customRole,
        type,
        interview,
        currentQ,
        answer,
        evaluation,
        allEvals,
        feedbackByQuestion,
        result,
        sessionStartedAt,
      })
      return
    }

    if (phase === 'select' && (interview?._id || result)) return

    writeActiveInterviewSession(null)
  }, [
    allEvals,
    feedbackByQuestion,
    answer,
    currentQ,
    customRole,
    evaluation,
    finalTranscript,
    interimTranscript,
    interview,
    isListening,
    phase,
    result,
    role,
    sessionStartedAt,
    type,
  ])

  useEffect(() => {
    if (!browserHistoryReadyRef.current || typeof window === 'undefined') return

    if (isHandlingBrowserBackRef.current) {
      isHandlingBrowserBackRef.current = false
      lastHistoryPhaseRef.current = phase
      return
    }

    const previousPhase = lastHistoryPhaseRef.current
    if (previousPhase === phase) return

    if (phase === 'interview' && previousPhase === 'select' && interview?._id) {
      window.history.pushState(
        { ...(window.history.state || {}), [INTERVIEW_HISTORY_STATE_KEY]: 'interview' },
        ''
      )
    } else if (phase === 'result' && previousPhase === 'interview' && result) {
      window.history.pushState(
        { ...(window.history.state || {}), [INTERVIEW_HISTORY_STATE_KEY]: 'result' },
        ''
      )
    } else if (phase === 'select' && !interview && !result) {
      window.history.replaceState(
        { ...(window.history.state || {}), [INTERVIEW_HISTORY_STATE_KEY]: 'select' },
        ''
      )
    }

    lastHistoryPhaseRef.current = phase
  }, [interview, phase, result])


  useEffect(() => {
    if (phase !== 'interview' || !currentQuestion || evaluation || loading) return

    const questionKey = `${interview?._id}-${currentQ}`
    if (autoQuestionKeyRef.current === questionKey) return

    let turnCleanup = () => {}
    const timeout = window.setTimeout(() => {
      autoQuestionKeyRef.current = questionKey
      spokenFeedbackKeyRef.current = ''
      turnCleanup = playQuestionAndCaptureRef.current(currentQuestion.question, '')
    }, QUESTION_START_DELAY_MS)

    return () => {
      window.clearTimeout(timeout)
      turnCleanup()
    }
  }, [
    currentQ,
    currentQuestion,
    evaluation,
    interview?._id,
    loading,
    phase,
  ])

  useEffect(() => {
    if (phase !== 'interview') return
    if (!finalizeAfterPendingRef.current) return
    if (pendingFeedbackCount > 0 || loading) return

    finalizeAfterPendingRef.current = false
    finishInterview()
  }, [pendingFeedbackCount, loading, phase])

  const updateVoiceSetting = (key) => {
    setVoiceSettings({
      ...resolvedVoiceSettings,
      [key]: !resolvedVoiceSettings[key],
    })
  }

  const stopVoiceActivity = useCallback(() => {
    stopListening()
    stopPlayback()
    recordingSessionRef.current = false
    recordingQuestionIndexRef.current = null
    autoSubmitPendingRef.current = false
    baseAnswerRef.current = ''
    heardSpeechRef.current = false
    lastSpeechAtRef.current = null
    if (autoNextTimerRef.current) {
      window.clearTimeout(autoNextTimerRef.current)
      autoNextTimerRef.current = null
    }
    if (noSpeechTimerRef.current) {
      window.clearTimeout(noSpeechTimerRef.current)
      noSpeechTimerRef.current = null
    }
    setSilenceCountdown(null)
  }, [stopListening, stopPlayback])

  const resetCurrentTurnDraft = useCallback(() => {
    stopVoiceActivity()
    resetTranscript()
    setAnswer('')
  }, [resetTranscript, stopVoiceActivity])

  const handleReplayQuestion = () => {
    if (!currentQuestion) return
    playQuestionAndCapture(currentQuestion.question, answer.trim())
  }

  const handleStopRecording = () => {
    if (!isListening) return

    const mergedTranscript = joinTranscriptParts(baseAnswerRef.current, finalTranscript, interimTranscript)
    autoSubmitPendingRef.current = false
    recordingSessionRef.current = false
    setSilenceCountdown(null)
    lastSpeechAtRef.current = null
    stopListening()
    if (!mergedTranscript.trim()) {
      setAnswer('')
      return
    }

    setAnswer(mergedTranscript)
    submitAnswerRef.current?.({ skipListeningCheck: true, forcedAnswer: mergedTranscript })
  }

  const startInterview = async () => {
    if (!selectedRole) {
      toast.error('Select or enter a role to begin your interview.')
      return
    }

    await primeMicrophonePermission()
    setLoading(true)
    resetCurrentTurnDraft()

    try {
      const response = await api.post('/interviews/start', { role: selectedRole, type })
      setInterview(response.data.data)
      setCurrentQ(0)
      setAnswer('')
      setEvaluation(null)
      setAllEvals([])
      setFeedbackByQuestion({})
      setPendingFeedbackCount(0)
      pendingSubmissionSetRef.current.clear()
      finalizeAfterPendingRef.current = false
      setResult(null)
      setSessionStartedAt(Date.now())
      setElapsedSeconds(0)
      setPhase('interview')
      setShowSessionSetup(false)
      setWorkspaceTab('recording')
      setFeedbackPanelOpen(false)
      autoQuestionKeyRef.current = ''
      spokenFeedbackKeyRef.current = ''
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start the interview.')
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = ({ skipListeningCheck = false, forcedAnswer = '' } = {}) => {
    if (!skipListeningCheck && isListening) {
      const mergedTranscript = joinTranscriptParts(baseAnswerRef.current, finalTranscript, interimTranscript)
      stopListening()
      if (mergedTranscript) {
        submitAnswerRef.current?.({ skipListeningCheck: true, forcedAnswer: mergedTranscript })
      } else {
        toast.error('Please record or type your answer before submitting.')
      }
      return
    }

    const finalAnswer = String(forcedAnswer || answer).trim()
    if (!finalAnswer) {
      toast.error('Record or type your answer before submitting.')
      return
    }

    if (!interview?._id || !currentQuestion) return

    const questionIndex = currentQ
    const submissionKey = `${interview._id}-${questionIndex}`
    if (pendingSubmissionSetRef.current.has(submissionKey)) return
    pendingSubmissionSetRef.current.add(submissionKey)

    const isLastQuestion = questionIndex >= questions.length - 1
    autoSubmitPendingRef.current = false
    stopVoiceActivity()
    setWorkspaceTab('recording')
    setEvaluation(null)
    setFeedbackByQuestion((current) => ({
      ...current,
      [questionIndex]: {
        status: 'loading',
        questionText: questions[questionIndex]?.question || '',
        clarity: '',
        confidence: '',
        suggestions: [],
        updatedAt: Date.now(),
      },
    }))
    setPendingFeedbackCount((count) => count + 1)

    api.post(`/interviews/${interview._id}/answer`, {
      questionIndex,
      userAnswer: finalAnswer,
    })
      .then((response) => {
        const nextEvaluation = response?.data?.data?.evaluation || {}
        const structured = toStructuredFeedback(nextEvaluation)

        setFeedbackByQuestion((current) => ({
          ...current,
          [questionIndex]: {
            status: 'ready',
            questionText: questions[questionIndex]?.question || '',
            ...structured,
            updatedAt: Date.now(),
          },
        }))

        setAllEvals((current) => {
          const remaining = current.filter((item) => item.questionIndex !== questionIndex)
          return [...remaining, { questionIndex, ...nextEvaluation }]
            .sort((left, right) => left.questionIndex - right.questionIndex)
        })
      })
      .catch((error) => {
        setFeedbackByQuestion((current) => ({
          ...current,
          [questionIndex]: {
            status: 'error',
            questionText: questions[questionIndex]?.question || '',
            clarity: 'Feedback could not be generated for this answer.',
            confidence: 'Please retry or continue with the next question.',
            suggestions: ['Check network connection and try replaying this question.'],
            updatedAt: Date.now(),
          },
        }))
        toast.error(error.response?.data?.message || 'Answer submission failed.')
      })
      .finally(() => {
        pendingSubmissionSetRef.current.delete(submissionKey)
        setPendingFeedbackCount((count) => Math.max(0, count - 1))
      })

    if (isLastQuestion) {
      finalizeAfterPendingRef.current = true
      resetCurrentTurnDraft()
      return
    }

    autoQuestionKeyRef.current = ''
    spokenFeedbackKeyRef.current = ''
    resetCurrentTurnDraft()
    setCurrentQ((value) => value + 1)
    setEvaluation(null)
  }

  submitAnswerRef.current = submitAnswer

  useEffect(() => {
    if (!isListening) {
      setSilenceCountdown(null)
      return undefined
    }

    const timer = window.setInterval(() => {
      if (!lastSpeechAtRef.current) {
        setSilenceCountdown(null)
        return
      }

      const elapsed = Date.now() - lastSpeechAtRef.current
      const remainingMs = Math.max(0, NO_SPEECH_AUTO_SUBMIT_MS - elapsed)
      const nextCountdown = remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0
      setSilenceCountdown(nextCountdown)

      const mergedTranscript = joinTranscriptParts(baseAnswerRef.current, finalTranscript, interimTranscript)
      if (remainingMs <= 0 && mergedTranscript && !autoSubmitPendingRef.current) {
        autoSubmitPendingRef.current = true
        setAnswer(mergedTranscript)
        stopListening()
      }
    }, 250)

    return () => window.clearInterval(timer)
  }, [finalTranscript, interimTranscript, isListening, stopListening])

  useEffect(() => {
    if (isListening || !autoSubmitPendingRef.current || !answer.trim() || loading) return

    autoSubmitPendingRef.current = false
    submitAnswerRef.current?.({ skipListeningCheck: true })
  }, [answer, isListening, loading])

  const nextQuestion = () => {
    resetCurrentTurnDraft()
    autoQuestionKeyRef.current = ''
    spokenFeedbackKeyRef.current = ''

    if (currentQ + 1 < questions.length) {
      setCurrentQ((value) => value + 1)
      setEvaluation(null)
      return
    }

    finishInterview()
  }

  const handleEndSession = () => {
    if (loading) return
    if (pendingFeedbackCount > 0) {
      finalizeAfterPendingRef.current = true
      toast('Finishing session after pending feedback completes...')
      return
    }
    if (allEvals.length > 0) {
      finishInterview()
      return
    }
    resetInterview()
  }

  const finishInterview = async () => {
    if (!interview?._id) return
    finalizeAfterPendingRef.current = false
    setLoading(true)
    stopVoiceActivity()

    try {
      const response = await api.post(`/interviews/${interview._id}/complete`)
      setResult(response.data.data)
      setPhase('result')

      const historyResponse = await api.get('/interviews/history')
      setHistory(historyResponse.data.data || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete the interview.')
    } finally {
      setLoading(false)
    }
  }

  const resetInterview = () => {
    resetCurrentTurnDraft()
    autoQuestionKeyRef.current = ''
    spokenFeedbackKeyRef.current = ''
    pendingSubmissionSetRef.current.clear()
    finalizeAfterPendingRef.current = false

    setPhase('select')
    setInterview(null)
    setResult(null)
    setEvaluation(null)
    setAllEvals([])
    setFeedbackByQuestion({})
    setPendingFeedbackCount(0)
    setFeedbackPanelOpen(false)
    setShowSessionSetup(false)
    setSessionStartedAt(null)
    setElapsedSeconds(0)
    setCurrentQ(0)
    setWorkspaceTab('recording')
    writeActiveInterviewSession(null)
  }

  if (phase === 'select') {
    return (
      <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
        <section className="card p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">Mock interview</div>
              <h1 className="mt-3 font-display text-3xl font-800 tracking-tight text-surface-900 dark:text-white">
                Start a focused interview session
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-surface-500">
                Pick a role, choose the round type, and begin. Voice capture starts inside the interview, and your transcript stays editable before every submission.
              </p>
            </div>

            <button type="button" onClick={() => setShowHistory((value) => !value)} className="btn-ghost text-xs">
              <Clock size={14} />
              {showHistory ? 'Hide' : 'Show'} history
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-surface-400">
                Role from {userField}
              </label>
              <select
                className="input"
                value={role}
                onChange={(event) => {
                  setRole(event.target.value)
                  setCustomRole('')
                }}
              >
                <option value="">Choose a role</option>
                {fieldRoles.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-surface-400">
                Custom role
              </label>
              <input
                className="input"
                placeholder={`Example: ${fieldRoles[0]}`}
                value={customRole}
                onChange={(event) => {
                  setCustomRole(event.target.value)
                  setRole('')
                }}
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-surface-400">
              Interview type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['HR', 'Technical', 'Mixed'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setType(item)}
                  className={clsx(
                    'rounded-xl border px-4 py-3 text-sm font-semibold transition-all',
                    type === item
                      ? 'border-navy-300 bg-navy-50 text-navy-700 dark:border-navy-700/50 dark:bg-navy-900/30 dark:text-navy-200'
                      : 'border-surface-200 text-surface-600 hover:border-surface-300 dark:border-surface-700 dark:text-surface-300 dark:hover:border-surface-600'
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-1">
            <SettingToggle
              label="Read feedback aloud"
              hint="Optional spoken coaching after each answer."
              checked={resolvedVoiceSettings.readFeedbackAloud}
              disabled={!isPlaybackSupported}
              onToggle={() => updateVoiceSetting('readFeedbackAloud')}
            />
          </div>

          {!isRecognitionSupported && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-300">
              Voice transcription is not available in this browser. You can still continue with typed answers inside the interview.
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-surface-200 pt-6 dark:border-surface-700">
            <div className="text-sm text-surface-500">
              {history.length
                ? `${interviewSummary.completedCount} completed interviews | ${interviewSummary.averageScore}% average score`
                : 'No previous interviews yet. Your completed sessions will appear in history.'}
            </div>

            <button
              type="button"
              onClick={startInterview}
              disabled={!selectedRole || loading}
              className="btn-primary min-w-[220px] justify-center rounded-xl py-3 disabled:opacity-60"
            >
              {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Mic size={18} />}
              Start interview
            </button>
          </div>
        </section>

        {showHistory && (
          <section className="card p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">Recent history</div>
            {history.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {history.slice(0, 3).map((item) => {
                  const tone = getScoreTone(Math.round((item.overallScore || 0) / 10))
                  return (
                    <div key={item._id} className="rounded-2xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900/70">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-surface-900 dark:text-white">{item.role}</div>
                          <div className="mt-1 text-xs text-surface-500">{item.type}</div>
                        </div>
                        <div className={clsx('font-display text-2xl font-800', tone.text)}>{item.overallScore}%</div>
                      </div>
                      <div className="mt-3 text-xs text-surface-500">{new Date(item.completedAt).toLocaleDateString()}</div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-surface-200 p-4 text-sm text-surface-500 dark:border-surface-700">
                No completed interviews yet.
              </div>
            )}
          </section>
        )}
      </div>
    )
  }

  if (phase === 'interview' && currentQuestion) {
    const progressPercent = questions.length ? Math.round((((evaluation ? currentQ + 1 : currentQ) / questions.length) * 100)) : 0
    const activeTranscript = draftPreview || answer
    const activeWorkspaceTab = workspaceTab === 'transcript' ? 'transcript' : 'recording'
    const workspaceTabIndex = activeWorkspaceTab === 'recording' ? 0 : 1
    const workspaceIndicatorOffset = workspaceTabIndex === 0 ? '0%' : 'calc(100% + 0.25rem)'
    const canSubmitNow = Boolean((isListening ? draftPreview : answer).trim()) && !loading
    const readyFeedbackCount = Object.values(feedbackByQuestion).filter((item) => item?.status === 'ready').length

    return (
      <div className="mx-auto max-w-[1500px] animate-fade-in">
        <div className="flex items-start justify-center gap-5">
          <section
            className={clsx(
              'w-full max-w-4xl overflow-hidden rounded-[32px] border border-slate-700 bg-[#162033] shadow-[0_24px_80px_rgba(2,6,23,0.35)] transition-transform duration-300 ease-out',
              feedbackPanelOpen ? 'xl:-translate-x-8' : 'translate-x-0'
            )}
          >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={clsx('badge text-xs', currentQuestion.category === 'HR' ? 'badge-primary' : currentQuestion.category === 'Technical' ? 'badge-accent' : 'badge-violet')}>
                {currentQuestion.category}
              </span>
              <span className="rounded-full border border-slate-700 bg-[#0b1220] px-3 py-1 text-xs font-semibold text-slate-300">
                {interview.type} round
              </span>
              <span className="rounded-full border border-slate-700 bg-[#0b1220] px-3 py-1 text-xs font-semibold text-slate-300">
                {interview.role}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm font-semibold text-slate-200">
                {formatDuration(elapsedSeconds)}
              </div>
              <button
                type="button"
                onClick={() => setShowSessionSetup((value) => !value)}
                className="btn-outline rounded-full px-4 py-2"
              >
                {showSessionSetup ? 'Hide setup' : 'Change setup'}
              </button>
              <button type="button" onClick={handleReplayQuestion} className="btn-outline rounded-full px-4 py-2">
                <RotateCcw size={14} />
                Replay
              </button>
              <button
                type="button"
                onClick={handleEndSession}
                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-700/40 dark:bg-red-900/10 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                End session
              </button>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8 sm:py-9">
            {showSessionSetup && (
              <section className="mb-6 rounded-[28px] border border-slate-700 bg-[#111b2e] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Interview setup</div>
                    <div className="mt-2 text-lg font-semibold text-white">Change role or round and start a new session</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSessionSetup(false)}
                    className="btn-outline rounded-full px-4 py-2"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Role from {userField}
                    </label>
                    <select
                      className="input"
                      value={role}
                      onChange={(event) => {
                        setRole(event.target.value)
                        setCustomRole('')
                      }}
                    >
                      <option value="">Choose a role</option>
                      {fieldRoles.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Custom role
                    </label>
                    <input
                      className="input"
                      placeholder={`Example: ${fieldRoles[0]}`}
                      value={customRole}
                      onChange={(event) => {
                        setCustomRole(event.target.value)
                        setRole('')
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Interview type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['HR', 'Technical', 'Mixed'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setType(item)}
                        className={clsx(
                          'rounded-xl border px-4 py-3 text-sm font-semibold transition-all',
                          type === item
                            ? 'border-navy-300 bg-navy-50 text-navy-700 dark:border-navy-700/50 dark:bg-navy-900/30 dark:text-navy-200'
                            : 'border-slate-700 bg-[#0b1220] text-slate-300 hover:border-slate-600'
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-700 pt-5">
                  <div className="text-sm text-slate-400">
                    Starting a new interview replaces the current active session.
                  </div>
                  <button
                    type="button"
                    onClick={startInterview}
                    disabled={!selectedRole || loading}
                    className="btn-primary min-w-[220px] justify-center rounded-xl py-3 disabled:opacity-60"
                  >
                    {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Mic size={18} />}
                    Start new interview
                  </button>
                </div>
              </section>
            )}

            <div className="text-center">
              <h1 className="mx-auto max-w-[46rem] font-display text-2xl font-800 leading-[1.14] tracking-tight text-white sm:text-[2.35rem]">
                {currentQuestion.question}
              </h1>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-surface-300">
                <span className={clsx('inline-flex rounded-full border px-3 py-1.5 font-semibold', sessionStatus.tone)}>
                  {sessionStatus.label}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 font-medium text-slate-300">
                  Question {currentQ + 1} of {questions.length}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 font-medium text-slate-300">
                  {progressPercent}% complete
                </span>
              </div>
            </div>

            <div className="mt-7 rounded-[30px] border border-slate-700 bg-[#0f172a]">
              <div className="border-b border-slate-700 px-4 py-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="relative grid w-full max-w-[320px] grid-cols-2 gap-1 rounded-2xl bg-[#0b1220] p-1">
                    <span
                      className="absolute bottom-1 top-1 rounded-xl border border-slate-600 bg-slate-800 shadow-sm transition-all duration-300"
                      style={{ left: workspaceIndicatorOffset, width: 'calc(50% - 0.25rem)' }}
                    />
                    {[
                      { key: 'recording', label: 'Recording', icon: Mic },
                      { key: 'transcript', label: 'Transcript', icon: PenLine },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setWorkspaceTab(key)}
                        className={clsx(
                          'relative z-10 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                          activeWorkspaceTab === key ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                        )}
                      >
                        <Icon size={15} />
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="text-sm text-slate-300">
                    {isListening
                      ? silenceCountdown !== null
                        ? `Auto-submit in ${silenceCountdown}s of silence`
                        : 'Recording live now'
                      : evaluation
                        ? 'Review feedback or move to the next question'
                        : isSpeaking
                          ? 'The interviewer is speaking'
                          : 'Ready for your response'}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden">
                <div
                  className="flex w-[200%] transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${workspaceTabIndex * 50}%)` }}
                >
                  <div className="w-1/2 shrink-0 p-5 sm:p-6">
                    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                      <div className="rounded-[28px] border border-slate-700 bg-[#111b2e] p-5">
                        <VoiceOrbButton
                          canRecord={isRecognitionSupported}
                          isListening={isListening}
                          isSpeaking={isSpeaking}
                        />

                        <div className="mt-6 flex h-14 items-end justify-center gap-1.5">
                          {[18, 30, 42, 28, 38, 24, 34].map((height, index) => (
                            <span
                              key={`${height}-${index}`}
                              className={clsx(
                                'w-2 rounded-full transition-all duration-300',
                                isListening || isSpeaking ? 'bg-teal-500/90' : 'bg-surface-300 dark:bg-surface-700'
                              )}
                              style={{ height: `${isListening || isSpeaking ? height : 10}px` }}
                            />
                          ))}
                        </div>

                        <div className="mt-6 grid gap-3">
                          {isListening && (
                            <button
                              type="button"
                              onClick={handleStopRecording}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-700/40 dark:bg-red-900/10 dark:text-red-300 dark:hover:bg-red-900/20"
                            >
                              <Square size={14} />
                              Stop recording
                            </button>
                          )}

                          <button type="button" onClick={handleReplayQuestion} className="btn-outline justify-center rounded-2xl px-4 py-3">
                            <PlayCircle size={15} />
                            Replay question
                          </button>
                        </div>

                        {recognitionError && (
                          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-300">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{recognitionError}</span>
                          </div>
                        )}
                      </div>

                      <div className="rounded-[28px] border border-slate-700 bg-[#111b2e] p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <AudioLines size={15} className="text-teal-500" />
                            Live response
                          </div>
                          <div className="text-xs font-medium text-slate-300">
                            {isListening ? 'Listening live' : isSpeaking ? 'Waiting for interviewer' : 'Ready to review'}
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-700 bg-[#0b1324] p-4">
                          <div className="min-h-[260px] whitespace-pre-wrap text-base leading-7 text-slate-200">
                            {activeTranscript || (isSpeaking
                              ? 'The question is being read aloud. Recording will begin automatically right after.'
                              : 'Start speaking and your response will build here in real time.')}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 pt-4">
                          <div className="text-sm text-slate-300">
                            {isListening
                              ? 'Stop whenever you want, or submit immediately.'
                              : 'Use this as a quick live preview before you switch to transcript review.'}
                          </div>

                          <button
                            type="button"
                            onClick={submitAnswer}
                            disabled={!canSubmitNow}
                            className="btn-primary rounded-xl px-5 py-3 disabled:opacity-60"
                          >
                            {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            Submit now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-1/2 shrink-0 p-5 sm:p-6">
                    <div
                      className="rounded-[28px] border border-slate-700 p-5 text-slate-100"
                      style={{ backgroundColor: '#111b2e', borderColor: '#334155' }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                            <PenLine size={15} className="text-teal-500" />
                            Transcript review
                          </div>
                          <div className="mt-1 text-sm text-slate-400">
                            Clean up the response before you send it for evaluation.
                          </div>
                        </div>
                        <span
                          className="rounded-full px-3 py-1 text-xs font-semibold text-slate-300"
                          style={{ backgroundColor: '#0b1324', border: '1px solid #334155' }}
                        >
                          {isListening ? 'Read-only while recording' : 'Editable'}
                        </span>
                      </div>

                      <div
                        className="mt-5 rounded-2xl p-4"
                        style={{ backgroundColor: '#0b1324', border: '1px solid #334155' }}
                      >
                        <textarea
                          value={isListening ? draftPreview : answer}
                          onChange={(event) => {
                            if (isListening) return
                            setAnswer(event.target.value)
                          }}
                          readOnly={isListening}
                          placeholder={
                            isListening
                              ? 'Recording is active. Your transcript is updating live.'
                              : 'Your transcript will appear here. You can edit it before evaluation.'
                          }
                          className="h-72 w-full resize-none border-none bg-transparent px-0 py-0 text-base leading-7 text-slate-100 shadow-none outline-none placeholder:text-slate-500 focus:ring-0"
                        />

                        {interimTranscript && (
                          <div
                            className="mt-4 rounded-xl px-3 py-2 text-sm text-slate-300"
                            style={{ backgroundColor: '#0f172a' }}
                          >
                            {interimTranscript}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 pt-4">
                        <div className="text-sm text-slate-400">
                          {isListening
                            ? 'You can stop recording first, or submit immediately with the captured transcript.'
                            : 'Submit manually or let silence auto-submit when recording is active.'}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {isListening && (
                            <button
                              type="button"
                              onClick={handleStopRecording}
                              className="btn-outline rounded-xl px-5 py-3"
                            >
                              <Square size={14} />
                              Stop
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={submitAnswer}
                            disabled={!canSubmitNow}
                            className="btn-primary rounded-xl px-5 py-3 disabled:opacity-60"
                          >
                            {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            Submit now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
          </section>

          <div className="hidden xl:flex w-[190px] shrink-0 justify-start pt-5">
            <button
              type="button"
              onClick={() => setFeedbackPanelOpen((value) => !value)}
              className="sticky top-24 flex items-center gap-2 rounded-full border border-slate-700 bg-[#111b2e] px-4 py-3 text-sm font-semibold text-slate-100 shadow-[0_16px_40px_rgba(2,6,23,0.35)]"
            >
              <WandSparkles size={16} className="text-teal-400" />
              <span>{feedbackPanelOpen ? 'Hide feedback' : 'Feedback'}</span>
              <span className="rounded-full bg-[#0b1324] px-2 py-0.5 text-[11px] text-slate-300">
                {readyFeedbackCount}/{questions.length}
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setFeedbackPanelOpen((value) => !value)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-slate-700 bg-[#111b2e]/95 px-4 py-3 text-sm font-semibold text-slate-100 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur xl:hidden"
        >
          <WandSparkles size={16} className="text-teal-400" />
          <span>{feedbackPanelOpen ? 'Hide feedback' : 'Feedback'}</span>
          <span className="rounded-full bg-[#0b1324] px-2 py-0.5 text-[11px] text-slate-300">
            {readyFeedbackCount}/{questions.length}
          </span>
        </button>

        <aside
          className={clsx(
            'fixed z-40 overflow-hidden rounded-[28px] border border-slate-700 bg-[#111b2e]/98 shadow-[0_24px_80px_rgba(2,6,23,0.5)] backdrop-blur transition-all duration-300 ease-out',
            'bottom-4 right-4 top-auto h-[70vh] w-[calc(100vw-2rem)] max-w-[380px] sm:right-6 sm:w-[360px]',
            'md:bottom-6 md:top-24 md:h-[calc(100vh-8rem)]',
            feedbackPanelOpen ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+2rem)] opacity-0 pointer-events-none'
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-100">Answer feedback</div>
              <div className="mt-1 text-xs text-slate-400">Generated in the background while the interview keeps moving.</div>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackPanelOpen(false)}
              className="rounded-full border border-slate-700 bg-[#0b1324] px-3 py-1.5 text-xs font-semibold text-slate-300"
            >
              Close
            </button>
          </div>

          <div className="h-[calc(100%-81px)] overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {questions.map((questionItem, index) => {
                const feedbackItem = feedbackByQuestion[index]
                const status = feedbackItem?.status || 'idle'
                const isCurrent = index === currentQ

                return (
                  <section
                    key={`${index}-${questionItem.question}`}
                    className={clsx(
                      'rounded-2xl border p-3',
                      isCurrent ? 'border-navy-500 bg-[#0f1a2c]' : 'border-slate-700 bg-[#0b1324]'
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Q{index + 1}
                      </span>
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                          status === 'ready'
                            ? 'bg-teal-900/40 text-teal-300'
                            : status === 'loading'
                              ? 'bg-amber-900/40 text-amber-300'
                              : status === 'error'
                                ? 'bg-red-900/40 text-red-300'
                                : 'bg-slate-800 text-slate-400'
                        )}
                      >
                        {status === 'loading' ? 'Generating...' : status}
                      </span>
                    </div>

                    <p className="text-xs leading-5 text-slate-400">
                      {questionItem.question}
                    </p>

                    {status === 'loading' && (
                      <div className="mt-3 rounded-xl border border-slate-700 bg-[#101b30] px-3 py-2 text-xs text-amber-300">
                        Generating feedback...
                      </div>
                    )}

                    {status === 'ready' && (
                      <div className="mt-3 space-y-2">
                        <div className="rounded-xl border border-slate-700 bg-[#101b30] px-3 py-2">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Clarity</div>
                          <div className="mt-1 text-xs leading-5 text-slate-200">{feedbackItem.clarity}</div>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-[#101b30] px-3 py-2">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Confidence</div>
                          <div className="mt-1 text-xs leading-5 text-slate-200">{feedbackItem.confidence}</div>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-[#101b30] px-3 py-2">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Suggestions</div>
                          <ul className="mt-1 space-y-1">
                            {(feedbackItem.suggestions || []).slice(0, 3).map((tip, tipIndex) => (
                              <li key={`${tip}-${tipIndex}`} className="text-xs leading-5 text-slate-200">- {tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
    )
  }

  if (phase === 'result' && result) {
    const score = result.overallScore || 0
    const resultTone = score >= 70
      ? 'text-teal-600 dark:text-teal-300'
      : score >= 50
        ? 'text-amber-600 dark:text-amber-300'
        : 'text-red-600 dark:text-red-300'

    return (
      <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
        <section className="card p-8 text-center">
          <div className={clsx('font-display text-7xl font-800', resultTone)}>{score}%</div>
          <h1 className="mt-3 font-display text-3xl font-800 text-surface-900 dark:text-white">
            {score >= 70 ? 'Strong interview performance' : score >= 50 ? 'Solid base, keep refining' : 'More repetitions will help'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-surface-500">
            {result.role} | {result.type} interview | {result.answers?.length || 0} answers scored
          </p>
          <div className="mx-auto mt-6 w-full max-w-sm progress-bar">
            <div className="progress-fill" style={{ width: `${score}%` }} />
          </div>
        </section>

        {result.overallFeedback && (
          <section className="card p-6">
            <h2 className="font-display text-xl font-800 text-surface-900 dark:text-white">Overall feedback</h2>
            <p className="mt-3 text-sm leading-7 text-surface-600 dark:text-surface-400">{result.overallFeedback}</p>
          </section>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <section className="card p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">
              <CheckCircle2 size={15} />
              Strengths
            </h3>
            <div className="mt-4 space-y-3">
              {(result.strengths || []).length ? result.strengths.map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-800 dark:border-teal-700/40 dark:bg-teal-900/20 dark:text-teal-200">
                  {item}
                </div>
              )) : (
                <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4 text-sm text-surface-500 dark:border-surface-700 dark:bg-surface-900/70">
                  Keep practicing to surface stronger signal here.
                </div>
              )}
            </div>
          </section>

          <section className="card p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
              <TrendingUp size={15} />
              Improvement areas
            </h3>
            <div className="mt-4 space-y-3">
              {(result.improvements || []).length ? result.improvements.map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-200">
                  {item}
                </div>
              )) : (
                <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4 text-sm text-surface-500 dark:border-surface-700 dark:bg-surface-900/70">
                  No major weak spots were detected in this run.
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="card p-6">
          <h2 className="font-display text-xl font-800 text-surface-900 dark:text-white">Answer-by-answer review</h2>
          <div className="mt-5 space-y-4">
            {(result.answers || []).map((item, index) => {
              const tone = getScoreTone(item.aiScore || 0)
              return (
                <div key={`${item.questionText}-${index}`} className="rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-700 dark:bg-surface-900/70">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-surface-400">Question {index + 1}</div>
                      <h3 className="mt-2 text-sm font-semibold leading-6 text-surface-900 dark:text-white">{item.questionText}</h3>
                    </div>
                    <div className={clsx('font-display text-3xl font-800', tone.text)}>{item.aiScore}/10</div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                    <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-400">Your answer</div>
                      <p className="mt-3 text-sm leading-7 text-surface-600 dark:text-surface-400">
                        {item.userAnswer || 'No saved transcript for this answer.'}
                      </p>
                    </div>

                    <div className={clsx('rounded-2xl border p-4', tone.panel)}>
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-500">AI feedback</div>
                      <p className="mt-3 text-sm leading-7 text-surface-700 dark:text-surface-300">{item.aiFeedback}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={resetInterview} className="btn-outline flex-1 rounded-xl py-3">
            <RotateCcw size={15} />
            Start another interview
          </button>
          <a href="/chatbot" className="btn-primary flex-1 rounded-xl py-3 text-center">
            Ask the AI coach for improvement tips
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-64 items-center justify-center">
      <LoaderCircle size={28} className="animate-spin text-navy-600 dark:text-navy-300" />
    </div>
  )
}


