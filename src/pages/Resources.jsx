import { useState, useEffect } from 'react'
import { Search, Plus, ExternalLink, ThumbsUp, CheckCircle2, Pin, Filter, X, BookOpen, Sparkles } from 'lucide-react'
import api from '@services/axiosInstance'
import { useAuthStore } from '@store/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const CATEGORIES = ['All', 'Course', 'Book', 'YouTube', 'Tool', 'Article', 'Practice']
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced']
const FIELDS = ['All Fields', 'Technology', 'Business & Management', 'Finance & Accounting', 'Law & Legal', 'Arts & Design', 'Marketing & Media', 'Healthcare & Medicine', 'Engineering (Non-CS)', 'Education', 'Science & Research', 'Other']

const CATEGORY_ICONS = {
  Course:   '📚', Book: '📖', YouTube: '▶️',
  Tool:     '🛠️', Article: '📄', Practice: '🎯',
}
const CATEGORY_COLORS = {
  Course:   'bg-navy-50 dark:bg-navy-900/30 text-navy-600 dark:text-navy-300 border-navy-200 dark:border-navy-700',
  Book:     'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 border-violet-200 dark:border-violet-700',
  YouTube:  'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700',
  Tool:     'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700',
  Article:  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  Practice: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
}
const DIFF_COLORS = {
  Beginner:     'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  Intermediate: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
  Advanced:     'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
}

function ResourceCard({ resource, onUpvote, onComplete, userField }) {
  const [upvotes, setUpvotes]       = useState(resource.upvotes)
  const [isUpvoted, setIsUpvoted]   = useState(resource.isUpvoted)
  const [isCompleted, setIsCompleted] = useState(resource.isCompleted)

  const handleUpvote = async (e) => {
    e.preventDefault()
    const { data } = await onUpvote(resource._id)
    setUpvotes(data.upvotes)
    setIsUpvoted(data.isUpvoted)
  }

  const handleComplete = async (e) => {
    e.preventDefault()
    const { data } = await onComplete(resource._id)
    setIsCompleted(data.isCompleted)
    if (data.isCompleted) toast.success('Marked as completed! Added to your Learning Hub.')
  }

  return (
    <div className={clsx('card p-5 flex flex-col gap-3 hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-200 relative', resource.isPinned && 'border-amber-300 dark:border-amber-600')}>
      {resource.isPinned && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-amber-500">
          <Pin size={12} className="fill-amber-500" />
          <span className="text-2xs font-600">Pinned</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pr-8">
        <div className="text-2xl shrink-0">{CATEGORY_ICONS[resource.category]}</div>
        <div className="flex-1 min-w-0">
          <a href={resource.url} target="_blank" rel="noreferrer" className="font-display text-base font-700 text-surface-900 dark:text-white hover:text-navy-600 dark:hover:text-navy-300 flex items-center gap-1.5 group">
            <span className="truncate">{resource.title}</span>
            <ExternalLink size={12} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={clsx('text-2xs px-2 py-0.5 rounded-full border font-medium', CATEGORY_COLORS[resource.category])}>
              {resource.category}
            </span>
            <span className={clsx('text-2xs px-2 py-0.5 rounded-full font-medium', DIFF_COLORS[resource.difficulty])}>
              {resource.difficulty}
            </span>
            {resource.isFree
              ? <span className="text-2xs px-2 py-0.5 rounded-full bg-teal-500 text-white font-600">Free</span>
              : <span className="text-2xs px-2 py-0.5 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400 font-medium">{resource.cost || 'Paid'}</span>
            }
            {resource.field !== userField && (
              <span className="text-2xs text-surface-400">{resource.field}</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed line-clamp-2">{resource.description}</p>

      {/* Tags */}
      {resource.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {resource.tags.slice(0, 4).map(t => (
            <span key={t} className="text-2xs px-2 py-0.5 bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400 rounded-full">{t}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-surface-100 dark:border-surface-700">
        <button
          onClick={handleUpvote}
          className={clsx('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all', isUpvoted ? 'bg-navy-50 dark:bg-navy-900/40 text-navy-600 dark:text-navy-300' : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700')}
        >
          <ThumbsUp size={13} className={isUpvoted ? 'fill-navy-600 dark:fill-navy-300' : ''} />
          {upvotes}
        </button>

        <button
          onClick={handleComplete}
          className={clsx('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all', isCompleted ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300' : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700')}
        >
          <CheckCircle2 size={13} className={isCompleted ? 'fill-teal-600 dark:fill-teal-300' : ''} />
          {isCompleted ? 'Completed' : 'Mark done'}
        </button>

        <a href={resource.url} target="_blank" rel="noreferrer" className="ml-auto btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          Open <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}

function SubmitModal({ onClose, onSubmit, userField }) {
  const [form, setForm] = useState({ title: '', url: '', description: '', field: userField || 'Technology', category: 'Course', difficulty: 'Beginner', isFree: true, cost: '', tags: '' })
  const [loading, setLoading] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.url || !form.description) return toast.error('Title, URL and description are required')
    setLoading(true)
    try {
      await onSubmit(form)
      toast.success('Resource submitted for review! Admin will approve it shortly.')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
          <h2 className="font-display text-lg font-700 text-surface-900 dark:text-white">Submit a Resource</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Title *</label>
            <input value={form.title} onChange={e => f('title', e.target.value)} className="input" placeholder="e.g. CS50 by Harvard" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">URL *</label>
            <input value={form.url} onChange={e => f('url', e.target.value)} className="input" placeholder="https://..." type="url" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Description * (why is this good?)</label>
            <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={3} className="input resize-none" placeholder="Explain what this resource covers and why it's valuable..." required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">Field *</label>
              <select value={form.field} onChange={e => f('field', e.target.value)} className="input">
                {FIELDS.filter(f => f !== 'All Fields').map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => f('category', e.target.value)} className="input">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={e => f('difficulty', e.target.value)} className="input">
                {DIFFICULTIES.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">Pricing</label>
              <select value={form.isFree ? 'free' : 'paid'} onChange={e => f('isFree', e.target.value === 'free')} className="input">
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          {!form.isFree && (
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">Cost (e.g. ₹499, $29/month)</label>
              <input value={form.cost} onChange={e => f('cost', e.target.value)} className="input" placeholder="₹499" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => f('tags', e.target.value)} className="input" placeholder="React, Beginner, Frontend..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={15} />}
              Submit for Review
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Resources() {
  const { user }                    = useAuthStore()
  const [resources, setResources]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [showModal, setShowModal]   = useState(false)
  const [search, setSearch]         = useState('')
  const [activeField, setActiveField] = useState('All Fields')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeDiff, setActiveDiff] = useState('All')
  const [freeOnly, setFreeOnly]     = useState(false)
  const [sort, setSort]             = useState('top')
  const [showFilters, setShowFilters] = useState(false)

  const userField = user?.field || 'Technology'

  useEffect(() => { load() }, [activeField, activeCategory, activeDiff, freeOnly, sort])

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ sort })
      if (activeField !== 'All Fields') params.set('field', activeField)
      if (activeCategory !== 'All')     params.set('category', activeCategory)
      if (activeDiff !== 'All')         params.set('difficulty', activeDiff)
      if (freeOnly)                     params.set('isFree', 'true')
      if (search)                       params.set('search', search)
      const { data } = await api.get(`/resources?${params}`)
      setResources(data.data)
      setTotal(data.total)
    } catch { toast.error('Failed to load resources') }
    finally { setLoading(false) }
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter') load()
  }

  const handleUpvote = async (id) => {
    const { data } = await api.post(`/resources/${id}/upvote`)
    return data
  }

  const handleComplete = async (id) => {
    const { data } = await api.post(`/resources/${id}/complete`)
    return data
  }

  const handleSubmit = async (form) => {
    await api.post('/resources', form)
    load()
  }

  const clearFilters = () => {
    setActiveField('All Fields')
    setActiveCategory('All')
    setActiveDiff('All')
    setFreeOnly(false)
    setSearch('')
  }

  const hasFilters = activeField !== 'All Fields' || activeCategory !== 'All' || activeDiff !== 'All' || freeOnly || search

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white mb-1">Resource Library</h1>
          <p className="text-surface-500 text-sm">
            Curated courses, books, tools and more — filtered for{' '}
            <strong className="text-navy-600 dark:text-navy-300">{userField}</strong>
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Submit Resource
        </button>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search resources... (press Enter)"
              className="input pl-9"
            />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="input w-36">
            <option value="top">Top rated</option>
            <option value="newest">Newest</option>
            <option value="free">Free first</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className={clsx('btn-outline flex items-center gap-2', showFilters && 'bg-navy-50 dark:bg-navy-900/30 border-navy-400')}>
            <Filter size={14} /> Filters {hasFilters && <span className="w-2 h-2 rounded-full bg-navy-600" />}
          </button>
        </div>

        {showFilters && (
          <div className="card p-4 space-y-3">
            {/* Field filter */}
            <div>
              <p className="text-xs font-medium text-surface-500 mb-2">Field</p>
              <div className="flex flex-wrap gap-1.5">
                {FIELDS.map(f => (
                  <button key={f} onClick={() => setActiveField(f)}
                    className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-all border',
                      activeField === f ? 'gradient-brand-bg text-white border-transparent' : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-navy-400'
                    )}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <p className="text-xs font-medium text-surface-500 mb-2">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setActiveCategory(c)}
                    className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-all border',
                      activeCategory === c ? 'gradient-brand-bg text-white border-transparent' : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-navy-400'
                    )}>
                    {c !== 'All' && CATEGORY_ICONS[c]} {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Difficulty */}
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-surface-500">Difficulty:</p>
                <div className="flex gap-1">
                  {DIFFICULTIES.map(d => (
                    <button key={d} onClick={() => setActiveDiff(d)}
                      className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                        activeDiff === d ? 'bg-navy-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200'
                      )}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free only */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setFreeOnly(!freeOnly)} className={clsx('w-9 h-5 rounded-full transition-all relative', freeOnly ? 'bg-teal-500' : 'bg-surface-300 dark:bg-surface-600')}>
                  <div className={clsx('w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all', freeOnly ? 'left-4' : 'left-0.5')} />
                </div>
                <span className="text-xs font-medium text-surface-600 dark:text-surface-400">Free only</span>
              </label>

              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category quick pills */}
        {!showFilters && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={clsx('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
                  activeCategory === c ? 'gradient-brand-bg text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200'
                )}>
                {c !== 'All' && CATEGORY_ICONS[c]} {c}
              </button>
            ))}
            {!freeOnly && (
              <button onClick={() => setFreeOnly(true)} className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100">
                🆓 Free only
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-500">
          {loading ? 'Loading...' : `${total} resource${total !== 1 ? 's' : ''} found`}
          {activeField !== 'All Fields' && <> in <strong className="text-surface-700 dark:text-surface-300">{activeField}</strong></>}
        </p>
      </div>

      {/* Resources grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen size={40} className="text-surface-300 mx-auto mb-4" />
          <h3 className="font-display text-lg font-700 text-surface-900 dark:text-white mb-2">No resources found</h3>
          <p className="text-surface-500 text-sm mb-4">
            {hasFilters ? 'Try adjusting your filters.' : 'Be the first to submit a resource for this field!'}
          </p>
          <div className="flex gap-3 justify-center">
            {hasFilters && <button onClick={clearFilters} className="btn-outline px-4 py-2 rounded-xl text-sm">Clear filters</button>}
            <button onClick={() => setShowModal(true)} className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2"><Plus size={14} /> Submit resource</button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(r => (
            <ResourceCard
              key={r._id}
              resource={r}
              onUpvote={handleUpvote}
              onComplete={handleComplete}
              userField={userField}
            />
          ))}
        </div>
      )}

      {/* Submit modal */}
      {showModal && <SubmitModal onClose={() => setShowModal(false)} onSubmit={handleSubmit} userField={userField} />}
    </div>
  )
}