import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function LocationInput({ value, onChange, placeholder = 'City, Country', className = '' }) {
  const [query, setQuery]         = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]     = useState(false)
  const [open, setOpen]           = useState(false)
  const [active, setActive]       = useState(-1)
  const debounceRef               = useRef(null)
  const wrapperRef                = useRef(null)

  // Sync external value changes
  useEffect(() => { setQuery(value || '') }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = async (q) => {
    if (q.length < 2) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      // Nominatim — free OpenStreetMap geocoding, no API key needed
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'CareerAI-App' } }
      )
      const data = await res.json()
      // Build clean city/country display names
      const places = data
        .map(item => {
          const a    = item.address
          const city = a.city || a.town || a.village || a.county || a.state_district || ''
          const state = a.state || ''
          const country = a.country || ''
          // Build label: "City, State, Country" or "City, Country"
          const parts = [city, state !== city ? state : '', country].filter(Boolean)
          const label = [...new Set(parts)].join(', ')
          return { label, lat: item.lat, lon: item.lon }
        })
        .filter(p => p.label)
        // Remove duplicates
        .filter((p, i, arr) => arr.findIndex(x => x.label === p.label) === i)
        .slice(0, 6)

      setSuggestions(places)
      setOpen(places.length > 0)
    } catch {
      setSuggestions([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setActive(-1)
    // Debounce 350ms
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 350)
  }

  const handleSelect = (place) => {
    setQuery(place.label)
    onChange(place.label)
    setSuggestions([])
    setOpen(false)
    setActive(-1)
  }

  const handleKeyDown = (e) => {
    if (!open || !suggestions.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(a => Math.min(a + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(a => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      handleSelect(suggestions[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const handleBlur = () => {
    // Small delay so click on suggestion registers first
    setTimeout(() => {
      onChange(query)
      setOpen(false)
    }, 150)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10 pointer-events-none" />
      {loading && (
        <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 animate-spin pointer-events-none" />
      )}
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        className={clsx('input pl-8', loading && 'pr-8', className)}
      />

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lifted overflow-hidden">
          {suggestions.map((place, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => handleSelect(place)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                active === i
                  ? 'bg-navy-50 dark:bg-navy-900/40'
                  : 'hover:bg-surface-50 dark:hover:bg-surface-700'
              )}
            >
              <MapPin size={13} className="text-navy-500 shrink-0" />
              <span className="text-sm text-surface-700 dark:text-surface-300 truncate">{place.label}</span>
            </button>
          ))}
          <div className="px-4 py-2 border-t border-surface-100 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50">
            <p className="text-2xs text-surface-400">Powered by OpenStreetMap</p>
          </div>
        </div>
      )}
    </div>
  )
}