import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import clsx from 'clsx'

export default function DatePicker({ value, onChange, placeholder = 'Select date', yearOnly = false, className = '' }) {
  const [open, setOpen]       = useState(false)
  const [view, setView]       = useState(value ? new Date(value) : new Date())
  const wrapperRef            = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const displayValue = value
    ? yearOnly
      ? new Date(value).getFullYear().toString()
      : format(new Date(value), 'MMM yyyy')
    : ''

  // Year-only mode — just show a year grid
  if (yearOnly) {
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 30 }, (_, i) => currentYear - 25 + i)
    return (
      <div ref={wrapperRef} className="relative">
        <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none z-10" />
        <input
          readOnly
          value={displayValue}
          onClick={() => setOpen(!open)}
          placeholder={placeholder}
          className={clsx('input pl-8 cursor-pointer', className)}
        />
        {open && (
          <div className="absolute z-50 top-full left-0 mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lifted p-3 w-52">
            <div className="grid grid-cols-4 gap-1">
              {years.map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => { onChange(new Date(y, 0).toISOString()); setOpen(false) }}
                  className={clsx('py-1.5 rounded-lg text-xs font-medium transition-all',
                    value && new Date(value).getFullYear() === y
                      ? 'gradient-brand-bg text-white'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Month picker mode
  const days = eachDayOfInterval({ start: startOfMonth(view), end: endOfMonth(view) })
  const startDay = startOfMonth(view).getDay()

  return (
    <div ref={wrapperRef} className="relative">
      <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none z-10" />
      <input
        readOnly
        value={displayValue}
        onClick={() => setOpen(!open)}
        placeholder={placeholder}
        className={clsx('input pl-8 cursor-pointer', className)}
      />
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lifted p-4 w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setView(subMonths(view, 1))} className="btn-icon p-1"><ChevronLeft size={15} /></button>
            <span className="text-sm font-600 text-surface-900 dark:text-white">{format(view, 'MMMM yyyy')}</span>
            <button type="button" onClick={() => setView(addMonths(view, 1))} className="btn-icon p-1"><ChevronRight size={15} /></button>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-2xs text-surface-400 py-1">{d}</div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => { onChange(day.toISOString()); setOpen(false) }}
                className={clsx('py-1.5 rounded-lg text-xs font-medium transition-all',
                  value && isSameDay(new Date(value), day)
                    ? 'gradient-brand-bg text-white'
                    : isToday(day)
                      ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                )}
              >
                {format(day, 'd')}
              </button>
            ))}
          </div>
          {/* Clear */}
          {value && (
            <button type="button" onClick={() => { onChange(''); setOpen(false) }} className="w-full mt-3 text-xs text-red-500 hover:underline">
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  )
}