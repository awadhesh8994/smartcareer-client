import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

// ── useAsync — wraps any async function with loading/error state ──
export function useAsync(asyncFn, immediate = false) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFn(...args)
      setData(result)
      return result
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [asyncFn])

  useEffect(() => { if (immediate) execute() }, [])

  return { data, loading, error, execute }
}

// ── useDebounce ───────────────────────────────────────────────────
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ── useLocalStorage ───────────────────────────────────────────────
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch { return initialValue }
  })

  const setItem = (newValue) => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  return [value, setItem]
}

// ── useClickOutside ───────────────────────────────────────────────
export function useClickOutside(callback) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) callback() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [callback])
  return ref
}

// ── useCountUp — animates a number from 0 to target ──────────────
export function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

// ── useWindowSize ─────────────────────────────────────────────────
export function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return size
}

// ── useIsMobile ───────────────────────────────────────────────────
export function useIsMobile() {
  const { width } = useWindowSize()
  return width < 768
}
