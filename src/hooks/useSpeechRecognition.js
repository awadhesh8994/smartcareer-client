import { useCallback, useEffect, useRef, useState } from 'react'

const getRecognitionClass = () => {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

const mapRecognitionError = (errorCode) => {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone permission is blocked. Please allow mic access and try again.'
    case 'audio-capture':
      return 'No microphone was found. Please connect a mic and try again.'
    case 'network':
      return 'Speech recognition had a network issue. Please try again.'
    case 'no-speech':
      return 'No speech was detected. Try speaking a little louder.'
    case 'aborted':
      return ''
    default:
      return 'Voice capture could not start. Please try again.'
  }
}

export default function useSpeechRecognition(options = {}) {
  const {
    lang = 'en-US',
    interimResults = true,
    continuous = true,
    restartOnEnd = false,
  } = options

  const recognitionRef = useRef(null)
  const stopRequestedRef = useRef(false)
  const shouldRestartRef = useRef(false)

  const [isSupported, setIsSupported] = useState(Boolean(getRecognitionClass()))
  const [isListening, setIsListening] = useState(false)
  const [finalTranscript, setFinalTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const SpeechRecognition = getRecognitionClass()
    setIsSupported(Boolean(SpeechRecognition))

    if (!SpeechRecognition) return undefined

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.interimResults = interimResults
    recognition.continuous = continuous
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setError('')
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      let nextFinal = ''
      let nextInterim = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript?.trim()
        if (!transcript) continue

        if (event.results[index].isFinal) nextFinal += `${transcript} `
        else nextInterim += `${transcript} `
      }

      if (nextFinal.trim()) {
        setFinalTranscript((current) => `${current} ${nextFinal}`.trim())
      }

      setInterimTranscript(nextInterim.trim())
    }

    recognition.onerror = (event) => {
      if (event.error === 'aborted' && stopRequestedRef.current) return
      if (event.error === 'no-speech' && restartOnEnd && !stopRequestedRef.current) return

      const message = mapRecognitionError(event.error)
      if (message) setError(message)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
      const shouldRestart = shouldRestartRef.current && !stopRequestedRef.current
      stopRequestedRef.current = false

      if (shouldRestart) {
        window.setTimeout(() => {
          try {
            recognition.start()
          } catch {}
        }, 250)
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.onstart = null
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null

      try {
        recognition.stop()
      } catch {}

      recognitionRef.current = null
    }
  }, [continuous, interimResults, lang, restartOnEnd])

  const resetTranscript = useCallback(() => {
    setFinalTranscript('')
    setInterimTranscript('')
    setError('')
  }, [])

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current

    if (!recognition) {
      setError('Voice capture is not supported in this browser. Use Chrome or Edge for the best experience.')
      return false
    }

    setError('')
    stopRequestedRef.current = false
    shouldRestartRef.current = restartOnEnd

    try {
      recognition.start()
      return true
    } catch (errorObject) {
      if (String(errorObject?.message || '').toLowerCase().includes('already started')) {
        try {
          recognition.stop()
        } catch {}

        window.setTimeout(() => {
          try {
            recognition.start()
          } catch {}
        }, 160)
        return true
      }

      setError('Microphone could not start. Please allow mic access and try again.')
      return false
    }
  }, [restartOnEnd])

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    stopRequestedRef.current = true
    shouldRestartRef.current = false

    try {
      recognition.stop()
    } catch {}
  }, [])

  return {
    isSupported,
    isListening,
    finalTranscript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
