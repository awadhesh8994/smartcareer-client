import { useEffect, useState } from 'react'
import { FileText, Plus, Sparkles, Download, Trash2, Edit3 } from 'lucide-react'
import { useResumeStore } from '@store/index'
import { resumeService } from '@services/index'
import toast from 'react-hot-toast'

export default function ResumeBuilder() {
  const { resumes, activeResume, fetchResumes, createResume, updateResume, deleteResume, setActiveResume, isLoading } = useResumeStore()
  const [tab, setTab]         = useState('edit')
  const [atsJD, setAtsJD]     = useState('')
  const [atsResult, setAtsResult] = useState(null)
  const [atsLoading, setAtsLoading] = useState(false)
  const [bullet, setBullet]   = useState('')
  const [improved, setImproved] = useState(null)
  const [bulletLoading, setBulletLoading] = useState(false)

  useEffect(() => { fetchResumes() }, [])

  const newResume = async () => {
    const r = await createResume({ title: 'My Resume', personalInfo: {}, experience: [], education: [], skills: {}, projects: [], certifications: [] })
    toast.success('New resume created!')
  }

  const checkATS = async () => {
    if (!atsJD.trim() || !activeResume?._id) return toast.error('Select a resume and paste a job description')
    setAtsLoading(true)
    try {
      const r = await resumeService.checkATS(activeResume._id, atsJD)
      setAtsResult(r.data.data)
    } catch { toast.error('ATS check failed') }
    finally { setAtsLoading(false) }
  }

  const improveBulletPoint = async () => {
    if (!bullet.trim()) return toast.error('Enter a bullet point')
    setBulletLoading(true)
    try {
      const r = await resumeService.improveBullet(bullet, activeResume?.personalInfo?.name)
      setImproved(r.data.data)
    } catch { toast.error('Failed to improve bullet') }
    finally { setBulletLoading(false) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white">Resume Builder</h1>
          <p className="text-surface-500 text-sm mt-1">Create ATS-optimised resumes with AI assistance</p>
        </div>
        <button onClick={newResume} disabled={isLoading} className="btn-primary flex items-center gap-2"><Plus size={15}/> New resume</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Resume list */}
        <div className="space-y-3">
          <h3 className="font-display text-sm font-700 text-surface-600 dark:text-surface-400 uppercase tracking-wider">My resumes</h3>
          {resumes.length === 0 && (
            <div className="card p-6 text-center">
              <FileText size={32} className="text-surface-300 mx-auto mb-2"/>
              <p className="text-sm text-surface-400">No resumes yet</p>
              <button onClick={newResume} className="text-navy-600 text-xs hover:underline mt-1">Create one →</button>
            </div>
          )}
          {resumes.map(r => (
            <div key={r._id} onClick={() => setActiveResume(r)}
              className={`card p-4 cursor-pointer transition-all hover:shadow-lifted ${activeResume?._id===r._id?'border-navy-600 dark:border-navy-400 bg-navy-50 dark:bg-navy-900/20':''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg gradient-brand-bg flex items-center justify-center"><FileText size={14} className="text-white"/></div>
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{r.title}</p>
                    <p className="text-xs text-surface-400">v{r.version} · ATS: {r.atsScore||0}%</p>
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();deleteResume(r._id);toast.success('Deleted')}} className="text-surface-300 hover:text-red-500"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* Main editor area */}
        <div className="lg:col-span-2 space-y-4">
          {!activeResume ? (
            <div className="card p-16 text-center">
              <FileText size={48} className="text-surface-200 mx-auto mb-4"/>
              <p className="font-display text-lg font-700 text-surface-900 dark:text-white mb-1">Select a resume to edit</p>
              <p className="text-surface-400 text-sm">Or create a new one to get started</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl w-fit">
                {['edit','ats','ai-tools'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab===t?'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm':'text-surface-500'}`}>
                    {t === 'ai-tools' ? 'AI tools' : t.toUpperCase()}
                  </button>
                ))}
              </div>

              {tab === 'edit' && (
                <div className="card p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-700 text-surface-900 dark:text-white">{activeResume.title}</h3>
                    <button className="btn-ghost text-xs flex items-center gap-1"><Edit3 size={12}/> Rename</button>
                  </div>

                  {/* Personal info */}
                  <div>
                    <h4 className="text-sm font-600 text-surface-600 dark:text-surface-400 mb-3">Personal information</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[['name','Full name'],['email','Email'],['phone','Phone'],['location','Location'],['linkedin','LinkedIn'],['github','GitHub']].map(([k,l]) => (
                        <div key={k}>
                          <label className="block text-xs text-surface-500 mb-1">{l}</label>
                          <input value={activeResume.personalInfo?.[k]||''} onChange={e => updateResume(activeResume._id,{personalInfo:{...activeResume.personalInfo,[k]:e.target.value}})} className="input text-sm py-2" placeholder={l}/>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-600 text-surface-600 dark:text-surface-400 mb-1.5">Professional summary</label>
                    <textarea value={activeResume.personalInfo?.summary||''} onChange={e => updateResume(activeResume._id,{personalInfo:{...activeResume.personalInfo,summary:e.target.value}})} rows={3} placeholder="Write a compelling professional summary..." className="input resize-none text-sm"/>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-outline text-sm flex items-center gap-2"><Download size={14}/> Export PDF</button>
                  </div>
                </div>
              )}

              {tab === 'ats' && (
                <div className="card p-5 space-y-4">
                  {atsResult && (
                    <div className={`p-4 rounded-xl ${atsResult.score>=70?'bg-green-50 dark:bg-green-900/20 border border-green-200':'bg-amber-50 dark:bg-amber-900/20 border border-amber-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-700 text-surface-900 dark:text-white">ATS Score</span>
                        <span className={`font-display text-2xl font-800 ${atsResult.score>=70?'text-green-500':'text-amber-500'}`}>{atsResult.score}/100</span>
                      </div>
                      {atsResult.missingKeywords?.length > 0 && (
                        <div className="mt-3"><p className="text-xs font-600 text-red-500 mb-1.5">Missing keywords:</p><div className="flex flex-wrap gap-1">{atsResult.missingKeywords.map(k => <span key={k} className="badge-danger text-xs">{k}</span>)}</div></div>
                      )}
                      {atsResult.suggestions?.length > 0 && (
                        <div className="mt-3"><p className="text-xs font-600 text-surface-600 dark:text-surface-400 mb-1.5">Suggestions:</p><ul className="space-y-1">{atsResult.suggestions.map((s,i) => <li key={i} className="text-xs text-surface-600 dark:text-surface-400">• {s}</li>)}</ul></div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Paste job description</label>
                    <textarea value={atsJD} onChange={e => setAtsJD(e.target.value)} rows={8} placeholder="Paste the job description here..." className="input resize-none text-sm"/>
                  </div>
                  <button onClick={checkATS} disabled={atsLoading} className="w-full btn-primary flex items-center justify-center gap-2 py-2.5">
                    {atsLoading?<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Analysing...</>:<><Sparkles size={15}/> Check ATS score</>}
                  </button>
                </div>
              )}

              {tab === 'ai-tools' && (
                <div className="card p-5 space-y-5">
                  <div>
                    <h4 className="font-display text-base font-700 text-surface-900 dark:text-white mb-1">Bullet point improver</h4>
                    <p className="text-xs text-surface-400 mb-3">Paste a weak bullet point and get 3 improved versions</p>
                    <textarea value={bullet} onChange={e => setBullet(e.target.value)} rows={3} placeholder="e.g. Worked on the backend code and fixed bugs" className="input resize-none text-sm mb-3"/>
                    <button onClick={improveBulletPoint} disabled={bulletLoading} className="btn-primary flex items-center gap-2 text-sm">
                      {bulletLoading?<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Sparkles size={14}/>} Improve bullet
                    </button>
                    {improved && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-600 text-surface-600 dark:text-surface-400">Improved versions:</p>
                        {improved.improved?.map((v,i) => (
                          <div key={i} className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-700 dark:text-surface-300 cursor-pointer hover:border-navy-400 transition-all" onClick={() => { navigator.clipboard.writeText(v); toast.success('Copied!') }}>
                            {i+1}. {v}
                          </div>
                        ))}
                        {improved.tips && <p className="text-xs text-surface-400 mt-2">💡 {improved.tips}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
