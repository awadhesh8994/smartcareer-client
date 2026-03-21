import { useEffect, useState, useRef, useCallback } from 'react'
import {
  FileText, Plus, Trash2, Save, CheckCircle2, ChevronDown, ChevronUp,
  Sparkles, AlertCircle, Download, Eye, EyeOff, ArrowLeft
} from 'lucide-react'
import { useResumeStore } from '@store/index'
import { useAuthStore } from '@store/authStore'
import { resumeService } from '@services/index'
import api from '@services/axiosInstance'
import CollegeInput from '@components/common/CollegeInput'
import DatePicker from '@components/common/DatePicker'
import LocationInput from '@components/common/LocationInput'
import ResumePreview from '@components/resume/ResumePreview'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ── Debounce ───────────────────────────────────────────────────────
function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

// ── Accordion Section ──────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = false, badge }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span className="font-display text-base font-700 text-surface-900 dark:text-white">{title}</span>
          {badge && <span className="badge-accent text-xs">{badge}</span>}
        </div>
        {open ? <ChevronUp size={16} className="text-surface-400" /> : <ChevronDown size={16} className="text-surface-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-surface-100 dark:border-surface-700 pt-4">{children}</div>}
    </div>
  )
}

// ── Skill tag input ────────────────────────────────────────────────
function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('')
  const add = () => {
    const trimmed = input.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInput('')
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-8">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy-50 dark:bg-navy-900/40 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 text-xs rounded-full">
            {tag}
            <button type="button" onClick={() => onChange(value.filter(t => t !== tag))} className="hover:text-red-500">×</button>
          </span>
        ))}
        {value.length === 0 && <span className="text-xs text-surface-400 self-center">No skills added yet</span>}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } if (e.key === ',') { e.preventDefault(); add() } }}
          placeholder={placeholder || 'Type and press Enter to add...'}
          className="input text-sm flex-1 py-2"
        />
        <button type="button" onClick={add} className="btn-outline px-3 py-2 rounded-lg text-sm">Add</button>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────
export default function ResumeBuilder() {
  const { resumes, activeResume, fetchResumes, createResume, deleteResume, setActiveResume, isLoading } = useResumeStore()
  const { user } = useAuthStore()

  const [form, setForm]         = useState(null)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [view, setView]         = useState('edit')   // 'edit' | 'preview'
  const [atsJD, setAtsJD]       = useState('')
  const [atsResult, setAtsResult] = useState(null)
  const [atsLoading, setAtsLoading] = useState(false)
  const [bullet, setBullet]     = useState('')
  const [improved, setImproved] = useState(null)
  const [bulletLoading, setBulletLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => { fetchResumes() }, [])

  useEffect(() => {
    if (activeResume) {
      setForm(JSON.parse(JSON.stringify(activeResume)))
      setAtsResult(null)
    }
  }, [activeResume?._id])

  // ── Auto-save ─────────────────────────────────────────────────
  const saveToServer = async (data) => {
    if (!data?._id) return
    setSaving(true)
    try {
      await api.patch(`/resumes/${data._id}`, data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    finally { setSaving(false) }
  }

  const debouncedSave = useDebounce(saveToServer, 1500)

  const updateField = (path, value) => {
    setForm(prev => {
      if (!prev) return prev
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      debouncedSave(next)
      return next
    })
  }

  const handleManualSave = async () => {
    if (!form?._id) return
    setSaving(true)
    try {
      await api.patch(`/resumes/${form._id}`, form)
      toast.success('Resume saved!')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  // ── New resume pre-filled from profile ─────────────────────────
  const newResume = async () => {
    const prefill = {
      title: `${user?.name?.split(' ')[0] || 'My'}'s Resume`,
      personalInfo: {
        name:      user?.name      || '',
        email:     user?.email     || '',
        phone:     user?.phone     || '',
        location:  user?.location  || '',
        linkedin:  user?.linkedinUrl   || '',
        github:    user?.githubUsername || '',
        portfolio: user?.portfolioUrl  || '',
        summary:   user?.bio      || '',
      },
      experience:     [],
      education:      [],
      skills:         { technical: user?.skills?.map(s => s.name) || [], soft: [], tools: [], languages: [] },
      projects:       [],
      certifications: [],
    }
    await createResume(prefill)
    toast.success('Resume created with your profile data!')
  }

  // ── Download PDF ───────────────────────────────────────────────
  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const element = document.getElementById('resume-preview')
      if (!element) { toast.error('Please switch to Preview first'); setDownloading(false); return }

      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin:      [10, 10, 10, 10],
        filename:    `${form?.personalInfo?.name || 'resume'}_resume.pdf`,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }
      await html2pdf().set(opt).from(element).save()
      toast.success('Resume downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('Download failed — try the print option instead (Ctrl+P)')
    } finally { setDownloading(false) }
  }

  // ── ATS Check ─────────────────────────────────────────────────
  const checkATS = async () => {
    if (!atsJD.trim() || !form?._id) return toast.error('Select a resume and paste a job description')
    setAtsLoading(true)
    try {
      const r = await resumeService.checkATS(form._id, atsJD)
      setAtsResult(r.data.data)
    } catch { toast.error('ATS check failed') }
    finally { setAtsLoading(false) }
  }

  const improveBulletPoint = async () => {
    if (!bullet.trim()) return toast.error('Enter a bullet point')
    setBulletLoading(true)
    try {
      const r = await resumeService.improveBullet(bullet, form?.personalInfo?.name)
      setImproved(r.data.data)
    } catch { toast.error('Failed to improve bullet') }
    finally { setBulletLoading(false) }
  }

  const fi = (key) => form?.personalInfo?.[key] || ''

  // ── No resume selected ─────────────────────────────────────────
  if (!form) return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white">Resume Builder</h1>
          <p className="text-surface-500 text-sm mt-1">Build ATS-optimised resumes with AI assistance</p>
        </div>
        <button onClick={newResume} disabled={isLoading} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Create Resume
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumes.map(r => (
          <div key={r._id} onClick={() => setActiveResume(r)} className="card p-5 cursor-pointer hover:shadow-lifted hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl gradient-brand-bg flex items-center justify-center">
                <FileText size={18} className="text-white" />
              </div>
              <button onClick={e => { e.stopPropagation(); deleteResume(r._id); toast.success('Deleted') }} className="text-surface-300 hover:text-red-500 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
            <p className="font-display text-base font-700 text-surface-900 dark:text-white mb-1">{r.title}</p>
            <p className="text-xs text-surface-400">Version {r.version} · ATS {r.atsScore || 0}%</p>
            <div className="mt-3 progress-bar h-1.5">
              <div className="progress-fill h-1.5" style={{ width: `${r.atsScore || 0}%` }} />
            </div>
          </div>
        ))}

        {/* Create new card */}
        <button onClick={newResume} className="card p-5 border-dashed border-2 border-surface-300 dark:border-surface-600 hover:border-navy-400 transition-all flex flex-col items-center justify-center gap-3 min-h-36 text-surface-400 hover:text-navy-600">
          <Plus size={24} />
          <span className="text-sm font-medium">Create new resume</span>
          <span className="text-xs">Pre-filled from your profile</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => { setActiveResume(null); setForm(null) }} className="btn-ghost p-2 rounded-lg">
          <ArrowLeft size={16} />
        </button>
        <input
          value={form.title || ''}
          onChange={e => updateField('title', e.target.value)}
          className="font-display text-xl font-700 text-surface-900 dark:text-white bg-transparent border-none outline-none focus:underline min-w-0 flex-1"
        />
        <div className="flex items-center gap-2 ml-auto">
          {/* Save status */}
          <span className={clsx('text-xs flex items-center gap-1 transition-all',
            saved ? 'text-teal-500' : saving ? 'text-amber-500' : 'text-surface-400'
          )}>
            {saved ? <><CheckCircle2 size={12} /> Saved</> : saving ? <>Saving...</> : <>Auto-save on</>}
          </span>

          <button onClick={handleManualSave} disabled={saving} className="btn-outline text-xs px-3 py-2 rounded-lg flex items-center gap-1.5">
            <Save size={13} /> Save
          </button>

          <button
            onClick={() => setView(view === 'edit' ? 'preview' : 'edit')}
            className={clsx('text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all', view === 'preview' ? 'btn-primary' : 'btn-outline')}
          >
            {view === 'preview' ? <><EyeOff size={13} /> Edit</> : <><Eye size={13} /> Preview</>}
          </button>

          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="btn-primary text-xs px-3 py-2 rounded-lg flex items-center gap-1.5"
            title="Switch to Preview first, then download"
          >
            {downloading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={13} />}
            Download PDF
          </button>
        </div>
      </div>

      {/* Preview mode */}
      {view === 'preview' && (
        <div className="overflow-x-auto">
          <div className="shadow-2xl rounded-lg overflow-hidden">
            <ResumePreview resume={form} />
          </div>
          <p className="text-center text-xs text-surface-400 mt-3">
            This is how your resume will look when downloaded. Click "Edit" to make changes.
          </p>
        </div>
      )}

      {/* Edit mode */}
      {view === 'edit' && (
        <div className="space-y-3">

          {/* Personal Info */}
          <Section title="Personal Information" icon="👤" defaultOpen={true}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Full name *</label>
                <input value={fi('name')} onChange={e => updateField('personalInfo.name', e.target.value)} className="input text-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Email *</label>
                <input value={fi('email')} onChange={e => updateField('personalInfo.email', e.target.value)} className="input text-sm" placeholder="john@example.com" type="email" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Phone</label>
                <input value={fi('phone')} onChange={e => updateField('personalInfo.phone', e.target.value)} className="input text-sm" placeholder="+91 9999999999" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Location</label>
                <LocationInput value={fi('location')} onChange={val => updateField('personalInfo.location', val)} placeholder="City, Country" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">LinkedIn URL</label>
                <input value={fi('linkedin')} onChange={e => updateField('personalInfo.linkedin', e.target.value)} className="input text-sm" placeholder="linkedin.com/in/yourname" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">GitHub / Portfolio URL</label>
                <input value={fi('github')} onChange={e => updateField('personalInfo.github', e.target.value)} className="input text-sm" placeholder="github.com/yourname" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Professional Summary</label>
                <textarea
                  value={fi('summary')}
                  onChange={e => updateField('personalInfo.summary', e.target.value)}
                  rows={4}
                  placeholder="Write 2-4 sentences summarising your experience, key skills, and career goals. Tailor this to your target role."
                  className="input resize-none text-sm"
                />
              </div>
            </div>
          </Section>

          {/* Experience */}
          <Section title="Work Experience" icon="💼" badge={form.experience?.filter(e => e.role).length > 0 ? `${form.experience.filter(e => e.role).length} added` : null}>
            <div className="space-y-4">
              {form.experience?.map((exp, i) => (
                <div key={i} className="border border-surface-200 dark:border-surface-700 rounded-xl p-4 space-y-3 bg-surface-50 dark:bg-surface-800/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-600 text-surface-800 dark:text-surface-200">{exp.role || exp.company || `Experience ${i + 1}`}</p>
                    <button type="button" onClick={() => updateField('experience', form.experience.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">Job Title *</label>
                      <input value={exp.role || ''} onChange={e => { const arr = [...form.experience]; arr[i] = { ...arr[i], role: e.target.value }; updateField('experience', arr) }} className="input text-sm py-2" placeholder="Software Engineer" />
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">Company *</label>
                      <input value={exp.company || ''} onChange={e => { const arr = [...form.experience]; arr[i] = { ...arr[i], company: e.target.value }; updateField('experience', arr) }} className="input text-sm py-2" placeholder="Google" />
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">Location</label>
                      <LocationInput value={exp.location || ''} onChange={val => { const arr = [...form.experience]; arr[i] = { ...arr[i], location: val }; updateField('experience', arr) }} placeholder="City, Country" />
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">Employment Type</label>
                      <select value={exp.type || 'full-time'} onChange={e => { const arr = [...form.experience]; arr[i] = { ...arr[i], type: e.target.value }; updateField('experience', arr) }} className="input text-sm py-2">
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="internship">Internship</option>
                        <option value="contract">Contract</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">Start Date</label>
                      <DatePicker value={exp.startDate} onChange={val => { const arr = [...form.experience]; arr[i] = { ...arr[i], startDate: val }; updateField('experience', arr) }} placeholder="Select start date" />
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">End Date</label>
                      {exp.isCurrently ? (
                        <div className="input py-2 text-sm text-surface-400 flex items-center gap-2 cursor-not-allowed">Present</div>
                      ) : (
                        <DatePicker value={exp.endDate} onChange={val => { const arr = [...form.experience]; arr[i] = { ...arr[i], endDate: val }; updateField('experience', arr) }} placeholder="Select end date" />
                      )}
                      <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                        <input type="checkbox" checked={exp.isCurrently || false} onChange={e => { const arr = [...form.experience]; arr[i] = { ...arr[i], isCurrently: e.target.checked, endDate: '' }; updateField('experience', arr) }} className="w-3.5 h-3.5 rounded" />
                        <span className="text-2xs text-surface-400">Currently working here</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-2xs text-surface-400 mb-1.5">Key achievements (use numbers wherever possible)</label>
                    {(exp.bullets || ['']).map((b, bi) => (
                      <div key={bi} className="flex gap-2 mb-1.5">
                        <span className="text-navy-400 mt-2.5 text-xs shrink-0">•</span>
                        <input
                          value={b}
                          onChange={e => { const arr = [...form.experience]; arr[i].bullets[bi] = e.target.value; updateField('experience', arr) }}
                          className="input text-xs py-1.5 flex-1"
                          placeholder="Increased API response time by 40% by implementing Redis caching..."
                        />
                        <button type="button" onClick={() => { const arr = [...form.experience]; arr[i].bullets = arr[i].bullets.filter((_, j) => j !== bi); updateField('experience', arr) }} className="text-surface-300 hover:text-red-400 shrink-0 mt-1.5">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => { const arr = [...form.experience]; arr[i].bullets = [...(arr[i].bullets || []), '']; updateField('experience', arr) }} className="text-xs text-navy-600 hover:underline mt-1">
                      + Add bullet point
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateField('experience', [...(form.experience || []), { role: '', company: '', location: '', startDate: '', endDate: '', isCurrently: false, bullets: [''], type: 'full-time' }])}
                className="w-full border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl py-3 text-sm text-surface-400 hover:border-navy-400 hover:text-navy-600 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={15} /> Add work experience
              </button>
            </div>
          </Section>

          {/* Education */}
          <Section title="Education" icon="🎓" badge={form.education?.filter(e => e.institution).length > 0 ? `${form.education.filter(e => e.institution).length} added` : null}>
            <div className="space-y-4">
              {form.education?.map((edu, i) => (
                <div key={i} className="border border-surface-200 dark:border-surface-700 rounded-xl p-4 space-y-3 bg-surface-50 dark:bg-surface-800/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-600 text-surface-800 dark:text-surface-200">{edu.institution || `Education ${i + 1}`}</p>
                    <button type="button" onClick={() => updateField('education', form.education.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">Institution *</label>
                      <CollegeInput value={edu.institution || ''} onChange={val => { const arr = [...form.education]; arr[i] = { ...arr[i], institution: val }; updateField('education', arr) }} placeholder="Start typing college name..." />
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">Degree</label>
                      <select value={edu.degree || ''} onChange={e => { const arr = [...form.education]; arr[i] = { ...arr[i], degree: e.target.value }; updateField('education', arr) }} className="input text-sm py-2">
                        <option value="">Select degree...</option>
                        {['High School','Diploma','B.Tech / B.E.','B.Sc','B.Com','B.A.','B.B.A.','B.Arch','MBBS','LLB','M.Tech / M.E.','M.Sc','M.A.','MBA','LLM','Ph.D','Other'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">Field of Study</label>
                      <input value={edu.fieldOfStudy || ''} onChange={e => { const arr = [...form.education]; arr[i] = { ...arr[i], fieldOfStudy: e.target.value }; updateField('education', arr) }} className="input text-sm py-2" placeholder="Computer Science, Law, Finance..." />
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">CGPA / Percentage</label>
                      <input value={edu.cgpa || ''} onChange={e => { const arr = [...form.education]; arr[i] = { ...arr[i], cgpa: e.target.value }; updateField('education', arr) }} className="input text-sm py-2" placeholder="8.5 / 10  or  85%" />
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">Start Year</label>
                      <DatePicker value={edu.startYear} onChange={val => { const arr = [...form.education]; arr[i] = { ...arr[i], startYear: val }; updateField('education', arr) }} placeholder="Select year" yearOnly />
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">End Year (or Expected)</label>
                      <DatePicker value={edu.endYear} onChange={val => { const arr = [...form.education]; arr[i] = { ...arr[i], endYear: val }; updateField('education', arr) }} placeholder="Select year" yearOnly />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateField('education', [...(form.education || []), { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', cgpa: '' }])}
                className="w-full border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl py-3 text-sm text-surface-400 hover:border-navy-400 hover:text-navy-600 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={15} /> Add education
              </button>
            </div>
          </Section>

          {/* Skills */}
          <Section title="Skills" icon="⚡" badge={Object.values(form.skills || {}).flat().length > 0 ? `${Object.values(form.skills || {}).flat().length} skills` : null}>
            <div className="space-y-4">
              {[
                ['technical', 'Technical Skills', 'React, Python, SQL, Machine Learning...'],
                ['tools',     'Tools & Software', 'VS Code, Figma, Excel, AutoCAD...'],
                ['soft',      'Soft Skills',      'Leadership, Communication, Problem Solving...'],
                ['languages', 'Languages',        'English, Hindi, French...'],
              ].map(([key, label, placeholder]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-2">{label}</label>
                  <TagInput
                    value={form.skills?.[key] || []}
                    onChange={val => updateField(`skills.${key}`, val)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* Projects */}
          <Section title="Projects" icon="🚀" badge={form.projects?.filter(p => p.name).length > 0 ? `${form.projects.filter(p => p.name).length} added` : null}>
            <div className="space-y-4">
              {form.projects?.map((proj, i) => (
                <div key={i} className="border border-surface-200 dark:border-surface-700 rounded-xl p-4 space-y-3 bg-surface-50 dark:bg-surface-800/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-600 text-surface-800 dark:text-surface-200">{proj.name || `Project ${i + 1}`}</p>
                    <button type="button" onClick={() => updateField('projects', form.projects.filter((_, j) => j !== i))} className="text-red-400"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">Project Name *</label>
                      <input value={proj.name || ''} onChange={e => { const arr = [...form.projects]; arr[i] = { ...arr[i], name: e.target.value }; updateField('projects', arr) }} className="input text-sm py-2" placeholder="CareerAI Platform" />
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">Live URL</label>
                      <input value={proj.liveLink || ''} onChange={e => { const arr = [...form.projects]; arr[i] = { ...arr[i], liveLink: e.target.value }; updateField('projects', arr) }} className="input text-sm py-2" placeholder="https://yourproject.com" />
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">GitHub URL</label>
                      <input value={proj.githubLink || ''} onChange={e => { const arr = [...form.projects]; arr[i] = { ...arr[i], githubLink: e.target.value }; updateField('projects', arr) }} className="input text-sm py-2" placeholder="github.com/you/project" />
                    </div>
                    <div>
                      <label className="block text-2xs text-surface-400 mb-1">Tech Stack</label>
                      <input value={(proj.techStack || []).join(', ')} onChange={e => { const arr = [...form.projects]; arr[i] = { ...arr[i], techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }; updateField('projects', arr) }} className="input text-sm py-2" placeholder="React, Node.js, MongoDB" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-2xs text-surface-400 mb-1">Description</label>
                      <textarea value={proj.description || ''} onChange={e => { const arr = [...form.projects]; arr[i] = { ...arr[i], description: e.target.value }; updateField('projects', arr) }} rows={2} className="input text-sm resize-none" placeholder="Brief description of what this project does and its impact..." />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateField('projects', [...(form.projects || []), { name: '', description: '', techStack: [], liveLink: '', githubLink: '' }])}
                className="w-full border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl py-3 text-sm text-surface-400 hover:border-navy-400 hover:text-navy-600 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={15} /> Add project
              </button>
            </div>
          </Section>

          {/* Certifications */}
          <Section title="Certifications" icon="🏆" badge={form.certifications?.filter(c => c.name).length > 0 ? `${form.certifications.filter(c => c.name).length} added` : null}>
            <div className="space-y-3">
              {form.certifications?.map((cert, i) => (
                <div key={i} className="grid sm:grid-cols-4 gap-3 items-end border border-surface-200 dark:border-surface-700 rounded-xl p-3 bg-surface-50 dark:bg-surface-800/50">
                  <div className="sm:col-span-2">
                    <label className="block text-2xs text-surface-400 mb-1">Certification Name *</label>
                    <input value={cert.name || ''} onChange={e => { const arr = [...form.certifications]; arr[i] = { ...arr[i], name: e.target.value }; updateField('certifications', arr) }} className="input text-sm py-2" placeholder="AWS Certified Developer" />
                  </div>
                  <div>
                    <label className="block text-2xs text-surface-400 mb-1">Issuer</label>
                    <input value={cert.issuer || ''} onChange={e => { const arr = [...form.certifications]; arr[i] = { ...arr[i], issuer: e.target.value }; updateField('certifications', arr) }} className="input text-sm py-2" placeholder="Amazon" />
                  </div>
                  <div>
                    <label className="block text-2xs text-surface-400 mb-1">Date</label>
                    <div className="flex gap-2">
                      <DatePicker value={cert.date} onChange={val => { const arr = [...form.certifications]; arr[i] = { ...arr[i], date: val }; updateField('certifications', arr) }} placeholder="Month, Year" />
                      <button type="button" onClick={() => updateField('certifications', form.certifications.filter((_, j) => j !== i))} className="text-red-400 shrink-0"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateField('certifications', [...(form.certifications || []), { name: '', issuer: '', date: '', credentialUrl: '' }])}
                className="w-full border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl py-3 text-sm text-surface-400 hover:border-navy-400 hover:text-navy-600 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={15} /> Add certification
              </button>
            </div>
          </Section>

          {/* ATS Checker */}
          <Section title="ATS Score Checker" icon="🎯">
            <p className="text-sm text-surface-500 mb-4">Paste a job description to see how well your resume matches it. AI will suggest keywords to add.</p>
            {atsResult && (
              <div className={clsx('p-4 rounded-xl border mb-4', atsResult.score >= 70 ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700' : atsResult.score >= 50 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200')}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-700 text-surface-900 dark:text-white">ATS Score</span>
                  <span className={clsx('font-display text-3xl font-800', atsResult.score >= 70 ? 'text-teal-600' : atsResult.score >= 50 ? 'text-amber-500' : 'text-red-500')}>{atsResult.score}<span className="text-sm">/100</span></span>
                </div>
                <div className="progress-bar mb-3 h-2">
                  <div className={clsx('h-full rounded-full transition-all', atsResult.score >= 70 ? 'bg-teal-500' : atsResult.score >= 50 ? 'bg-amber-400' : 'bg-red-400')} style={{ width: `${atsResult.score}%` }} />
                </div>
                {atsResult.missingKeywords?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-600 text-red-500 mb-1.5 flex items-center gap-1"><AlertCircle size={12} /> Missing keywords — add these to your resume</p>
                    <div className="flex flex-wrap gap-1.5">{atsResult.missingKeywords.map(k => <span key={k} className="badge-danger text-xs">{k}</span>)}</div>
                  </div>
                )}
                {atsResult.suggestions?.length > 0 && (
                  <div>
                    <p className="text-xs font-600 text-surface-600 dark:text-surface-400 mb-1.5">Suggestions</p>
                    <ul className="space-y-1">{atsResult.suggestions.map((s, i) => <li key={i} className="text-xs text-surface-600 dark:text-surface-400 flex items-start gap-1.5"><CheckCircle2 size={11} className="text-teal-500 mt-0.5 shrink-0" />{s}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
            <textarea value={atsJD} onChange={e => setAtsJD(e.target.value)} rows={6} placeholder="Paste the full job description here..." className="input resize-none text-sm mb-3" />
            <button onClick={checkATS} disabled={atsLoading} className="btn-primary flex items-center gap-2 py-2.5 px-5 rounded-xl">
              {atsLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing...</> : <><Sparkles size={15} /> Check ATS Score</>}
            </button>
          </Section>

          {/* AI Bullet Improver */}
          <Section title="AI Bullet Point Improver" icon="✨">
            <p className="text-xs text-surface-400 mb-3">Paste a weak bullet point — get 3 stronger, achievement-focused versions powered by AI.</p>
            <textarea value={bullet} onChange={e => setBullet(e.target.value)} rows={3} placeholder="e.g. Worked on the backend and fixed some bugs in the API" className="input resize-none text-sm mb-3" />
            <button onClick={improveBulletPoint} disabled={bulletLoading} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 rounded-xl">
              {bulletLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={14} />}
              Improve with AI
            </button>
            {improved && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-600 text-surface-600 dark:text-surface-400">Click any version to copy it:</p>
                {improved.improved?.map((v, i) => (
                  <div key={i} onClick={() => { navigator.clipboard.writeText(v); toast.success('Copied to clipboard!') }}
                    className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700/50 text-sm text-surface-700 dark:text-surface-300 cursor-pointer hover:shadow-card transition-all">
                    <span className="text-teal-600 font-600 mr-2">{i + 1}.</span>{v}
                  </div>
                ))}
                {improved.tips && <p className="text-xs text-surface-400 mt-2 italic">💡 {improved.tips}</p>}
              </div>
            )}
          </Section>

        </div>
      )}
    </div>
  )
}