import { useEffect, useState } from 'react'
import { BookOpen, Sparkles, Bookmark, Plus, CheckCircle2, X, ExternalLink } from 'lucide-react'
import { learningService } from '@services/index'
import toast from 'react-hot-toast'

export default function Learning() {
  const [plan, setPlan]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [genForm, setGenForm] = useState({ topic:'', days:30, show:false })
  const [generating, setGen]  = useState(false)
  const [bmForm, setBmForm]   = useState({ title:'', url:'', show:false })
  const [tab, setTab]         = useState('plans')

  useEffect(() => {
    learningService.getPlan()
      .then(r => setPlan(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const generatePlan = async () => {
    if (!genForm.topic.trim()) return toast.error('Enter a topic')
    setGen(true)
    try {
      const r = await learningService.generateStudyPlan({ topic: genForm.topic, daysAvailable: genForm.days })
      setPlan(p => ({ ...p, studyPlans: [...(p?.studyPlans||[]), r.data.data] }))
      setGenForm({ topic:'', days:30, show:false })
      toast.success('Study plan created!')
    } catch { toast.error('Failed to generate plan') }
    finally { setGen(false) }
  }

  const markDay = async (planId, day) => {
    try {
      const r = await learningService.markDailyGoal(planId, day)
      toast.success('Day marked complete!')
    } catch { toast.error('Failed to update') }
  }

  const addBookmark = async () => {
    if (!bmForm.url.trim()) return toast.error('Enter URL')
    try {
      const r = await learningService.addBookmark({ title: bmForm.title||bmForm.url, url: bmForm.url })
      setPlan(p => ({ ...p, bookmarks: r.data.data }))
      setBmForm({ title:'', url:'', show:false })
      toast.success('Bookmark saved!')
    } catch { toast.error('Failed to save') }
  }

  const removeBookmark = async (id) => {
    const r = await learningService.removeBookmark(id)
    setPlan(p => ({ ...p, bookmarks: r.data.data }))
  }

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white">Learning Hub</h1>
          <p className="text-surface-500 text-sm mt-1">AI study plans, bookmarks, and streak tracking</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBmForm({...bmForm,show:true})} className="btn-outline text-sm flex items-center gap-2"><Bookmark size={14}/> Bookmark</button>
          <button onClick={() => setGenForm({...genForm,show:true})} className="btn-primary text-sm flex items-center gap-2"><Sparkles size={14}/> New plan</button>
        </div>
      </div>

      {/* Streak */}
      <div className="card p-4 flex items-center gap-4">
        <div className="text-3xl">🔥</div>
        <div className="flex-1">
          <p className="font-700 text-surface-900 dark:text-white">{plan?.totalLearningDays || 0} total learning days</p>
          <p className="text-xs text-surface-400">Keep going every day to build your streak!</p>
        </div>
        <button onClick={() => learningService.updateStreak().then(() => toast.success('Streak updated!'))} className="btn-accent text-xs px-3 py-2">Log today</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl w-fit">
        {['plans','bookmarks'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab===t?'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm':'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <div className="space-y-4">
          {plan?.studyPlans?.filter(p=>p.isActive).length === 0 && !genForm.show && (
            <div className="card p-10 text-center">
              <BookOpen size={40} className="text-surface-300 mx-auto mb-3"/>
              <p className="font-display text-lg font-700 text-surface-900 dark:text-white mb-1">No study plans yet</p>
              <p className="text-surface-400 text-sm mb-4">Generate an AI study plan for any topic</p>
              <button onClick={() => setGenForm({...genForm,show:true})} className="btn-primary inline-flex gap-2"><Sparkles size={14}/> Create your first plan</button>
            </div>
          )}
          {plan?.studyPlans?.filter(p=>p.isActive).map(sp => (
            <div key={sp._id} className="card p-5">
              <h3 className="font-display text-base font-700 text-surface-900 dark:text-white mb-1">{sp.planTitle}</h3>
              <p className="text-xs text-surface-400 mb-4">{sp.daysAvailable} days · {sp.dailyGoals?.filter(g=>g.completed).length||0} of {sp.dailyGoals?.length||0} days complete</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sp.dailyGoals?.slice(0,7).map(g => (
                  <div key={g.day} className={`p-3 rounded-xl border text-sm ${g.completed?'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800':'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-surface-700 dark:text-surface-300">Day {g.day}</span>
                      {!g.completed && <button onClick={() => markDay(sp._id, g.day)} className="text-xs text-navy-600 hover:underline flex items-center gap-1"><CheckCircle2 size={12}/> Done</button>}
                      {g.completed && <CheckCircle2 size={14} className="text-green-500"/>}
                    </div>
                    <ul className="text-xs text-surface-500 space-y-0.5">
                      {g.tasks?.map((t,ti) => <li key={ti}>• {t}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'bookmarks' && (
        <div className="space-y-3">
          {plan?.bookmarks?.length === 0 && <div className="card p-10 text-center"><Bookmark size={36} className="text-surface-300 mx-auto mb-3"/><p className="text-surface-400 text-sm">No bookmarks yet. Save useful resources here.</p></div>}
          {plan?.bookmarks?.map(b => (
            <div key={b._id} className="card p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center shrink-0"><Bookmark size={15} className="text-navy-600"/></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{b.title}</p>
                <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-xs text-navy-600 hover:underline flex items-center gap-1 truncate"><ExternalLink size={10}/>{b.url}</a>
              </div>
              <button onClick={() => removeBookmark(b._id)} className="text-surface-300 hover:text-red-500 shrink-0"><X size={16}/></button>
            </div>
          ))}
        </div>
      )}

      {/* Gen form modal */}
      {genForm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-display text-lg font-700 text-surface-900 dark:text-white mb-4">Generate study plan</h3>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium mb-1.5">Topic</label><input value={genForm.topic} onChange={e=>setGenForm({...genForm,topic:e.target.value})} placeholder="e.g. React, Python, DSA" className="input"/></div>
              <div><label className="block text-sm font-medium mb-1.5">Days available: {genForm.days}</label><input type="range" min={7} max={90} value={genForm.days} onChange={e=>setGenForm({...genForm,days:+e.target.value})} className="w-full"/></div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setGenForm({...genForm,show:false})} className="flex-1 btn-outline py-2.5">Cancel</button>
                <button onClick={generatePlan} disabled={generating} className="flex-1 btn-primary py-2.5">{generating?'Generating...':'Generate'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookmark form modal */}
      {bmForm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-display text-lg font-700 text-surface-900 dark:text-white mb-4">Add bookmark</h3>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium mb-1.5">Title</label><input value={bmForm.title} onChange={e=>setBmForm({...bmForm,title:e.target.value})} placeholder="Resource name" className="input"/></div>
              <div><label className="block text-sm font-medium mb-1.5">URL</label><input value={bmForm.url} onChange={e=>setBmForm({...bmForm,url:e.target.value})} placeholder="https://..." className="input"/></div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setBmForm({...bmForm,show:false})} className="flex-1 btn-outline py-2.5">Cancel</button>
                <button onClick={addBookmark} className="flex-1 btn-primary py-2.5">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
