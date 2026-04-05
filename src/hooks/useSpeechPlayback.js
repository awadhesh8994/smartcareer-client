import { useCallback, useEffect, useMemo, useState } from 'react'

const getSynth = () => {
  if (typeof window === 'undefined') return null
  return window.speechSynthesis || null
}

const selectVoice = (voices, lang) => {
  if (!voices?.length) return null

  const normalizedLang = lang.toLowerCase()
  const baseLanguage = normalizedLang.split('-')[0]
  const exactLanguageVoices = voices.filter((voice) => voice.lang?.toLowerCase() === normalizedLang)
  const languageFamilyVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith(baseLanguage))
  const preferredPatterns = [
    /microsoft aria/i,
    /microsoft jenny/i,
    /google uk english female/i,
    /google us english/i,
    /samantha/i,
    /zira/i,
    /female/i,
    /natural/i,
    /neural/i,
  ]

  for (const group of [exactLanguageVoices, languageFamilyVoices, voices]) {
    if (!group?.length) continue

    for (const pattern of preferredPatterns) {
      const preferredVoice = group.find((voice) => pattern.test(voice.name))
      if (preferredVoice) return preferredVoice
    }

    if (group[0]) return group[0]
  }

  return voices[0]
}

export default function useSpeechPlayback(defaultOptions = {}) {
  const {
    lang = 'en-US',
    rate = 1,
    pitch = 1,
    volume = 1,
  } = defaultOptions

  const synth = useMemo(() => getSynth(), [])

  const [voices, setVoices] = useState([])
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    if (!synth) return undefined

    const loadVoices = () => setVoices(synth.getVoices())

    loadVoices()
    synth.addEventListener?.('voiceschanged', loadVoices)

    return () => {
      synth.removeEventListener?.('voiceschanged', loadVoices)
      synth.cancel()
    }
  }, [synth])

  const stop = useCallback(() => {
    if (!synth) return
    synth.cancel()
    setIsSpeaking(false)
  }, [synth])

  const speak = useCallback((text, overrideOptions = {}) => {
    if (!synth || !text?.trim()) return Promise.resolve(false)

    const utterance = new SpeechSynthesisUtterance(text)
    const finalLang = overrideOptions.lang || lang

    utterance.lang = finalLang
    utterance.rate = overrideOptions.rate ?? rate
    utterance.pitch = overrideOptions.pitch ?? pitch
    utterance.volume = overrideOptions.volume ?? volume

    const chosenVoice = selectVoice(voices, finalLang)
    if (chosenVoice) utterance.voice = chosenVoice

    return new Promise((resolve) => {
      let settled = false
      let started = false
      let fallbackTimer = null
      let startGuardTimer = null

      const finish = (value) => {
        if (settled) return
        settled = true
        if (startGuardTimer) window.clearTimeout(startGuardTimer)
        if (fallbackTimer) window.clearTimeout(fallbackTimer)
        setIsSpeaking(false)
        resolve(value)
      }

      const wordCount = text.trim().split(/\s+/).length
      const fallbackDuration = Math.min(30000, Math.max(6000, wordCount * 420 + 2500))

      const waitForIdleAndFinish = (attemptsLeft = 8) => {
        if (settled) return

        if (synth.speaking || synth.pending) {
          fallbackTimer = window.setTimeout(() => waitForIdleAndFinish(attemptsLeft - 1), 900)
          return
        }

        finish(started || attemptsLeft < 8)
      }

      startGuardTimer = window.setTimeout(() => {
        if (settled || started) return

        if (synth.speaking || synth.pending) {
          setIsSpeaking(true)
          startGuardTimer = window.setTimeout(() => {
            if (!settled && !started && !synth.speaking && !synth.pending) finish(false)
          }, 1200)
          return
        }

        finish(false)
      }, 2200)

      fallbackTimer = window.setTimeout(() => {
        waitForIdleAndFinish()
      }, fallbackDuration)

      utterance.onstart = () => {
        started = true
        setIsSpeaking(true)
      }
      utterance.onend = () => {
        finish(true)
      }
      utterance.onerror = () => {
        finish(false)
      }

      synth.cancel()
      synth.resume?.()

      window.setTimeout(() => {
        try {
          synth.cancel()
          synth.speak(utterance)
        } catch {
          finish(false)
        }
      }, 40)
    })
  }, [lang, pitch, rate, synth, voices, volume])

  return {
    isSupported: Boolean(synth),
    isSpeaking,
    speak,
    stop,
    voices,
  }
}
