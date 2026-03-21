import { useState, useEffect, useRef } from 'react'
import { GraduationCap, Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function CollegeInput({ value, onChange, placeholder = 'Start typing college name...', className = '' }) {
  const [query, setQuery]           = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]       = useState(false)
  const [open, setOpen]             = useState(false)
  const [active, setActive]         = useState(-1)
  const debounceRef                 = useRef(null)
  const wrapperRef                  = useRef(null)

  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = async (q) => {
    if (q.length < 3) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(
        `http://universities.hipolabs.com/search?name=${encodeURIComponent(q)}&limit=8`,
        { headers: { 'Accept': 'application/json' } }
      )
      const data = await res.json()
      const places = data
        .map(u => ({ name: u.name, country: u.country, domain: u.domains?.[0] || '' }))
        .filter((u, i, arr) => arr.findIndex(x => x.name === u.name) === i)
        .slice(0, 8)
      setSuggestions(places)
      setOpen(places.length > 0)
    } catch {
      setSuggestions([])
      setOpen(false)
    } finally { setLoading(false) }
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setActive(-1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 400)
  }

  const handleSelect = (college) => {
    setQuery(college.name)
    onChange(college.name)
    setSuggestions([])
    setOpen(false)
    setActive(-1)
  }

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); handleSelect(suggestions[active]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <GraduationCap size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10 pointer-events-none" />
      {loading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 animate-spin pointer-events-none" />}
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => { onChange(query); setOpen(false) }, 150)}
        placeholder={placeholder}
        autoComplete="off"
        className={clsx('input pl-8', loading && 'pr-8', className)}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lifted overflow-hidden">
          {suggestions.map((c, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => handleSelect(c)}
              className={clsx('w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors',
                active === i ? 'bg-navy-50 dark:bg-navy-900/40' : 'hover:bg-surface-50 dark:hover:bg-surface-700'
              )}
            >
              <GraduationCap size={13} className="text-navy-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-surface-800 dark:text-surface-200">{c.name}</p>
                <p className="text-2xs text-surface-400">{c.country}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}