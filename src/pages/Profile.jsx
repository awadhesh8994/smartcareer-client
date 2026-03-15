import { useState } from 'react'
import { useAuthStore } from '@store/authStore'
import { userService } from '@services/index'
import { Camera, Plus, X, Save, User, MapPin, Link2, Github, Linkedin, Building2, Briefcase, Target } from 'lucide-react'
import LocationInput from '@components/common/LocationInput'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ── Field-specific data ───────────────────────────────────────────

const FIELD_SKILLS = {
  'Technology': [
    'JavaScript','TypeScript','Python','Java','C++','Go','Rust',
    'React','Next.js','Vue.js','Angular','Node.js','Express','Django','Spring Boot',
    'AWS','Azure','GCP','Docker','Kubernetes','CI/CD',
    'SQL','MongoDB','PostgreSQL','Redis',
    'Machine Learning','Deep Learning','Data Science','NLP',
    'DSA','System Design','Microservices','REST APIs','GraphQL',
    'Git','Linux','DevOps','Cybersecurity','Mobile Development',
  ],
  'Business & Management': [
    'Product Management','Business Analysis','Strategy','Operations',
    'Project Management','Agile','Scrum','JIRA','Roadmapping',
    'Market Research','Competitive Analysis','Business Development',
    'Stakeholder Management','Leadership','Team Building',
    'Excel','PowerPoint','Tableau','SQL','Power BI',
    'OKRs','KPIs','P&L Management','Budgeting','Forecasting',
    'Consulting','Change Management','Process Improvement',
  ],
  'Finance & Accounting': [
    'Financial Modelling','Valuation','DCF Analysis','LBO Modelling',
    'Excel','VBA','Bloomberg Terminal','FactSet',
    'Financial Accounting','Management Accounting','Auditing','Taxation',
    'Risk Management','Derivatives','Fixed Income','Equity Research',
    'Investment Banking','Private Equity','Venture Capital',
    'IFRS','GAAP','Financial Reporting','Cost Accounting',
    'Portfolio Management','Asset Management','Corporate Finance',
    'CA','CFA','CPA','FRM',
  ],
  'Law & Legal': [
    'Contract Law','Corporate Law','Constitutional Law','Criminal Law',
    'Intellectual Property','Mergers & Acquisitions','Litigation',
    'Legal Research','Legal Drafting','Due Diligence','Compliance',
    'Arbitration','Mediation','Negotiation',
    'SEBI Regulations','Companies Act','IBC','Competition Law',
    'Data Privacy Law','Employment Law','Tax Law','Real Estate Law',
    'Westlaw','Manupatra','SCC Online',
  ],
  'Arts & Design': [
    'UI Design','UX Design','Figma','Adobe XD','Sketch',
    'Graphic Design','Adobe Illustrator','Adobe Photoshop','InDesign',
    'Motion Design','After Effects','Premiere Pro',
    'Brand Design','Typography','Colour Theory','Grid Systems',
    'User Research','Usability Testing','Wireframing','Prototyping',
    'Design Systems','Accessibility','Visual Storytelling',
    'Photography','Video Editing','3D Design','Blender',
    'Illustration','Animation',
  ],
  'Marketing & Media': [
    'Digital Marketing','SEO','SEM','Google Ads','Meta Ads',
    'Content Marketing','Copywriting','Content Strategy',
    'Social Media Marketing','Email Marketing','Marketing Automation',
    'Brand Management','PR','Crisis Communication',
    'Google Analytics','Data Studio','HubSpot','Salesforce',
    'Market Research','Consumer Behaviour','Brand Strategy',
    'Video Marketing','Podcast Production','Influencer Marketing',
    'Growth Hacking','A/B Testing','CRO','Performance Marketing',
  ],
  'Healthcare & Medicine': [
    'Clinical Skills','Patient Assessment','Diagnosis','Treatment Planning',
    'Medical Research','Clinical Trials','Evidence-Based Medicine',
    'Healthcare Management','Hospital Administration','Health Policy',
    'Pharmacology','Anatomy','Physiology','Pathology',
    'Public Health','Epidemiology','Biostatistics',
    'Electronic Health Records','HIPAA','Healthcare Analytics',
    'Medical Writing','Regulatory Affairs','Quality Assurance',
    'USMLE Prep','NEET PG','AIIMS Preparation',
  ],
  'Engineering (Non-CS)': [
    'AutoCAD','SolidWorks','CATIA','ANSYS','MATLAB',
    'Mechanical Design','Structural Analysis','FEA','CFD',
    'Manufacturing Processes','Quality Control','Six Sigma','Lean Manufacturing',
    'Circuit Design','PCB Design','PLC Programming','SCADA',
    'Civil Engineering','Structural Engineering','Construction Management',
    'Project Management','Cost Estimation','Safety Management',
    'ISO Standards','GD&T','Product Development','R&D',
  ],
  'Education': [
    'Curriculum Design','Lesson Planning','Assessment Design',
    'Teaching Pedagogy','Classroom Management','Student Engagement',
    'Instructional Design','E-learning','LMS Platforms','Moodle',
    'Educational Psychology','Learning Theory','Special Education',
    'EdTech','Articulate','Storyline','Video Production',
    'Research Methods','Academic Writing','Grant Writing',
    'Training & Development','Corporate Training','Coaching',
    'CBSE','IB','IGCSE','State Board Curriculum',
  ],
  'Science & Research': [
    'Research Methodology','Data Collection','Statistical Analysis',
    'R','Python','SPSS','MATLAB',
    'Lab Skills','PCR','Cell Culture','Western Blot',
    'Academic Writing','Scientific Communication','Literature Review',
    'Grant Writing','Peer Review','Scientific Publishing',
    'Bioinformatics','Genomics','Proteomics',
    'Chemistry','Biology','Physics','Environmental Science',
    'Field Research','Surveys','Qualitative Research','Quantitative Research',
  ],
  'Other': [
    'Communication','Leadership','Problem Solving','Critical Thinking',
    'Project Management','Data Analysis','Research','Writing',
    'Public Speaking','Negotiation','Team Management',
    'Microsoft Office','Google Workspace','Notion','Slack',
    'Entrepreneurship','Business Development','Networking',
    'Social Media','Content Creation','Community Management',
  ],
}

const FIELD_TARGET_ROLES = {
  'Technology':            ['Software Engineer','Full Stack Developer','Frontend Developer','Backend Developer','Data Scientist','ML Engineer','DevOps Engineer','Cloud Architect','Cybersecurity Analyst','Mobile Developer','QA Engineer','Data Engineer','Product Manager (Tech)','Solutions Architect'],
  'Business & Management': ['Product Manager','Business Analyst','Operations Manager','Strategy Consultant','Scrum Master','Project Manager','Management Consultant','Chief of Staff','Program Manager','General Manager'],
  'Finance & Accounting':  ['Financial Analyst','Investment Banker','Chartered Accountant','Risk Analyst','Portfolio Manager','Tax Consultant','Auditor','CFO','Equity Research Analyst','Credit Analyst'],
  'Law & Legal':           ['Corporate Lawyer','Legal Analyst','Compliance Officer','Legal Counsel','IP Attorney','Paralegal','In-house Counsel','Public Prosecutor','Judicial Officer'],
  'Arts & Design':         ['UX Designer','Graphic Designer','Art Director','Motion Designer','Illustrator','Photographer','Creative Director','Brand Designer','Product Designer','Visual Designer'],
  'Marketing & Media':     ['Marketing Manager','Content Strategist','Brand Manager','SEO Specialist','Social Media Manager','Copywriter','PR Manager','Growth Marketer','Performance Marketer','CMO'],
  'Healthcare & Medicine': ['Doctor','Healthcare Analyst','Medical Researcher','Pharmacist','Public Health Officer','Healthcare Manager','Clinical Research Associate','Nurse Practitioner','Hospital Administrator'],
  'Engineering (Non-CS)':  ['Mechanical Engineer','Civil Engineer','Electrical Engineer','Manufacturing Engineer','Quality Engineer','Structural Engineer','Process Engineer','Aerospace Engineer','Project Engineer'],
  'Education':             ['Teacher','Curriculum Designer','Education Consultant','School Principal','EdTech Specialist','Training Manager','Instructional Designer','Academic Counselor','Education Researcher'],
  'Science & Research':    ['Research Scientist','Lab Analyst','Data Analyst','Science Writer','R&D Engineer','Environmental Scientist','Biotech Researcher','Clinical Scientist','Postdoctoral Researcher'],
  'Other':                 ['Entrepreneur','Freelancer','Social Worker','NGO Manager','Government Officer','Journalist','Policy Analyst','Community Manager'],
}

const FIELD_CERTIFICATIONS = {
  'Technology':            ['AWS Certified','Google Cloud Certified','Azure Certified','PMP','CKA','CISSP','CompTIA Security+'],
  'Business & Management': ['PMP','Agile Certified','Scrum Master','Six Sigma','MBA','CFA Level 1'],
  'Finance & Accounting':  ['CA (ICAI)','CFA','CPA','FRM','CAIA','CFP','ACCA'],
  'Law & Legal':           ['Bar Council Enrollment','LLM','AIBE','NCLT Certification'],
  'Arts & Design':         ['Google UX Design Certificate','Figma Certification','Adobe Certified Expert'],
  'Healthcare & Medicine': ['USMLE','NEET PG','PLAB','MCI Registration','CPR Certification'],
  'Engineering (Non-CS)':  ['PE License','Six Sigma','PMP','AutoCAD Certified','SOLIDWORKS Certified'],
  'Education':             ['B.Ed','CTET','TET','Cambridge Teaching Certificate','Instructional Design Certificate'],
  'Science & Research':    ['GRE','GATE','CSIR NET','DBT JRF','PhD'],
  'Marketing & Media':     ['Google Ads Certified','HubSpot Certified','Meta Blueprint','Google Analytics Certified'],
  'Other':                 ['PMP','Six Sigma','Google Workspace Certified'],
}

const EXP_LEVELS = ['Student (Fresher)', '0-1 years', '1-3 years', '3-5 years', '5-8 years', '8+ years']
const LOOKING_FOR = ['New job', 'Promotion', 'Career switch', 'Upskilling only', 'Networking']
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function Profile() {
  const { user, updateUser }   = useAuthStore()
  const [saving, setSaving]    = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [form, setForm] = useState({
    name:            user?.name           || '',
    bio:             user?.bio            || '',
    location:        user?.location       || '',
    phone:           user?.phone          || '',
    careerGoal:      user?.careerGoal     || '',
    targetRole:      user?.targetRole     || '',
    experienceLevel: user?.experienceLevel || 'Student (Fresher)',
    currentCompany:  user?.currentCompany  || '',
    currentTitle:    user?.currentTitle    || '',
    industry:        user?.industry        || '',
    lookingFor:      user?.lookingFor      || 'New job',
    linkedinUrl:     user?.linkedinUrl     || '',
    githubUsername:  user?.githubUsername  || '',
    portfolioUrl:    user?.portfolioUrl    || '',
    skills:          user?.skills          || [],
  })
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Beginner' })

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Get field-specific data
  const userField      = user?.field || 'Technology'
  const fieldSkills    = FIELD_SKILLS[userField]    || FIELD_SKILLS['Other']
  const fieldRoles     = FIELD_TARGET_ROLES[userField] || FIELD_TARGET_ROLES['Other']
  const fieldCerts     = FIELD_CERTIFICATIONS[userField] || []
  const isProfessional = form.experienceLevel !== 'Student (Fresher)'

  const addSkill = () => {
    if (!newSkill.name.trim()) return
    if (form.skills.find(s => s.name === newSkill.name)) return toast.error('Skill already added')
    f('skills', [...form.skills, { ...newSkill }])
    setNewSkill({ name: '', level: 'Beginner' })
  }

  const removeSkill = (name) => f('skills', form.skills.filter(s => s.name !== name))

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await userService.updateProfile(form)
      updateUser(data.data)
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    setAvatarLoading(true)
    try {
      const { data } = await userService.uploadAvatar(fd)
      updateUser({ avatar: data.data.avatar })
      toast.success('Avatar updated!')
    } catch { toast.error('Upload failed') }
    finally { setAvatarLoading(false) }
  }

  const score = user?.profileCompletionScore || 0

  const TABS = [
    { id: 'basic',    label: 'Basic Info' },
    { id: 'career',   label: 'Career' },
    { id: 'skills',   label: 'Skills' },
    { id: 'links',    label: 'Links' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            <span className="font-medium text-navy-600 dark:text-navy-300">{userField}</span>
            {user?.userType && <> · {user.userType}</>}
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-60">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
          Save changes
        </button>
      </div>

      {/* Completion bar */}
      <div className="card p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Profile completion</span>
            <span className="text-sm font-700 text-navy-600">{score}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${score}%` }} /></div>
        </div>
        {score >= 70
          ? <span className="badge-accent text-xs shrink-0">Complete ✓</span>
          : <span className="badge-warning text-xs shrink-0">Add more to unlock AI features</span>
        }
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === id ? 'bg-white dark:bg-surface-700 shadow-card text-surface-900 dark:text-white' : 'text-surface-500 hover:text-surface-700'
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Basic Info ──────────────────────────────────────────── */}
      {activeTab === 'basic' && (
        <div className="space-y-5">
          <div className="card p-6">
            <h2 className="font-display text-base font-700 text-surface-900 dark:text-white mb-5">Personal information</h2>

            {/* Avatar */}
            <div className="flex items-start gap-6 mb-6">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-navy-600 to-teal-600 flex items-center justify-center">
                  {user?.avatar
                    ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-white font-display text-2xl font-700">{user?.name?.charAt(0)}</span>
                  }
                </div>
                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-brand-bg flex items-center justify-center cursor-pointer border-2 border-white dark:border-surface-800">
                  {avatarLoading ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={12} className="text-white" />}
                  <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{user?.name}</p>
                <p className="text-xs text-surface-500 mt-0.5">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge-primary text-xs">{userField}</span>
                  {user?.userType && <span className="badge-accent text-xs">{user.userType}</span>}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Full name</label>
                <div className="relative"><User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" /><input className="input pl-8" value={form.name} onChange={e => f('name', e.target.value)} /></div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Phone</label>
                <input className="input" placeholder="+91 9999999999" value={form.phone} onChange={e => f('phone', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Location</label>
                <LocationInput
                  value={form.location}
                  onChange={val => f('location', val)}
                  placeholder="Start typing your city..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Experience level</label>
                <select className="input" value={form.experienceLevel} onChange={e => f('experienceLevel', e.target.value)}>
                  {EXP_LEVELS.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Bio</label>
                <textarea className="input resize-none h-20"
                  placeholder={userField === 'Law & Legal' ? 'e.g. Final year law student at NLU Delhi, interested in corporate law and M&A...' :
                    userField === 'Healthcare & Medicine' ? 'e.g. MBBS graduate with interest in clinical research and public health...' :
                    userField === 'Arts & Design' ? 'e.g. UX designer with 2 years of experience in product design and user research...' :
                    'Tell us about your background, interests, and what you bring to the table...'}
                  value={form.bio} onChange={e => f('bio', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Career ─────────────────────────────────────────────── */}
      {activeTab === 'career' && (
        <div className="space-y-5">
          {/* Current role — shown for non-freshers */}
          {isProfessional && (
            <div className="card p-6">
              <h2 className="font-display text-base font-700 text-surface-900 dark:text-white mb-5">Current role</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1.5">Current company / organisation</label>
                  <div className="relative"><Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" /><input className="input pl-8" placeholder="e.g. Tata Consultancy, Apollo Hospital..." value={form.currentCompany} onChange={e => f('currentCompany', e.target.value)} /></div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1.5">Current job title</label>
                  <div className="relative"><Briefcase size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" /><input className="input pl-8" placeholder={fieldRoles[1] || 'Your current role'} value={form.currentTitle} onChange={e => f('currentTitle', e.target.value)} /></div>
                </div>
              </div>
            </div>
          )}

          {/* Career goals */}
          <div className="card p-6">
            <h2 className="font-display text-base font-700 text-surface-900 dark:text-white mb-5">Career goals</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Target role <span className="text-surface-400">(for {userField})</span>
                </label>
                <select className="input" value={form.targetRole} onChange={e => f('targetRole', e.target.value)}>
                  <option value="">Select target role...</option>
                  {fieldRoles.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">I am looking for</label>
                <select className="input" value={form.lookingFor} onChange={e => f('lookingFor', e.target.value)}>
                  {LOOKING_FOR.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Career goal</label>
                <input className="input"
                  placeholder={
                    userField === 'Law & Legal'           ? 'e.g. Become a partner at a top law firm within 5 years...' :
                    userField === 'Finance & Accounting'  ? 'e.g. Clear CA exams and join an investment bank...' :
                    userField === 'Healthcare & Medicine' ? 'e.g. Specialise in cardiology and research...' :
                    userField === 'Arts & Design'         ? 'e.g. Lead design at a product-first startup...' :
                    'e.g. Land a senior role at a top company in my field...'
                  }
                  value={form.careerGoal} onChange={e => f('careerGoal', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Relevant certifications for field */}
          {fieldCerts.length > 0 && (
            <div className="card p-5 bg-navy-50 dark:bg-navy-900/20 border border-navy-200 dark:border-navy-700/50">
              <h3 className="font-display text-sm font-700 text-navy-700 dark:text-navy-300 mb-2 flex items-center gap-2">
                <Target size={14} /> Recommended certifications for {userField}
              </h3>
              <div className="flex flex-wrap gap-2">
                {fieldCerts.map(c => (
                  <span key={c} className="badge-primary text-xs">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Skills ─────────────────────────────────────────────── */}
      {activeTab === 'skills' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-base font-700 text-surface-900 dark:text-white">Skills</h2>
            <span className="text-xs text-surface-400">Showing skills for <strong className="text-navy-600 dark:text-navy-300">{userField}</strong></span>
          </div>

          {/* Current skills */}
          <div className="flex flex-wrap gap-2 mb-6 min-h-12">
            {form.skills.length === 0 && (
              <p className="text-xs text-surface-400 self-center">No skills added yet. Add your top skills below.</p>
            )}
            {form.skills.map(s => (
              <div key={s.name} className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
                s.level === 'Advanced'     ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/30 dark:border-teal-700 dark:text-teal-300' :
                s.level === 'Intermediate' ? 'bg-navy-50 border-navy-200 text-navy-600 dark:bg-navy-900/30 dark:border-navy-700 dark:text-navy-300' :
                'bg-surface-100 border-surface-200 text-surface-600 dark:bg-surface-800 dark:border-surface-600 dark:text-surface-400'
              )}>
                {s.name} · {s.level}
                <button onClick={() => removeSkill(s.name)} className="hover:text-red-500 transition-colors ml-0.5">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>

          {/* Add skill */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                className="input flex-1"
                value={newSkill.name}
                onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))}
              >
                <option value="">Select a skill for {userField}...</option>
                {fieldSkills
                  .filter(d => !form.skills.find(s => s.name === d))
                  .map(d => <option key={d}>{d}</option>)
                }
              </select>
              <select
                className="input w-36"
                value={newSkill.level}
                onChange={e => setNewSkill(p => ({ ...p, level: e.target.value }))}
              >
                {SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
              <button onClick={addSkill} disabled={!newSkill.name} className="btn-primary px-4 rounded-xl disabled:opacity-40">
                <Plus size={16} />
              </button>
            </div>

            {/* Or type custom */}
            <div className="flex gap-2">
              <input
                className="input flex-1 text-sm"
                placeholder="Or type a custom skill..."
                value={!fieldSkills.includes(newSkill.name) ? newSkill.name : ''}
                onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addSkill()}
              />
              <span className="text-xs text-surface-400 self-center shrink-0">Press Enter to add</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Links ──────────────────────────────────────────────── */}
      {activeTab === 'links' && (
        <div className="card p-6">
          <h2 className="font-display text-base font-700 text-surface-900 dark:text-white mb-5">Links & social</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">LinkedIn</label>
              <div className="relative"><Linkedin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" /><input className="input pl-8" placeholder="linkedin.com/in/yourprofile" value={form.linkedinUrl} onChange={e => f('linkedinUrl', e.target.value)} /></div>
            </div>

            {/* GitHub — only for tech users */}
            {['Technology', 'Engineering (Non-CS)'].includes(userField) && (
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">GitHub</label>
                <div className="relative"><Github size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" /><input className="input pl-8" placeholder="github.com/yourusername" value={form.githubUsername} onChange={e => f('githubUsername', e.target.value)} /></div>
              </div>
            )}

            {/* Portfolio — label changes by field */}
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">
                {userField === 'Arts & Design'       ? 'Portfolio / Behance / Dribbble' :
                 userField === 'Technology'           ? 'Portfolio / Personal website' :
                 userField === 'Marketing & Media'    ? 'Portfolio / Case studies link' :
                 userField === 'Law & Legal'          ? 'Bar Council profile / Publications' :
                 userField === 'Science & Research'   ? 'Google Scholar / ResearchGate' :
                 userField === 'Healthcare & Medicine'? 'Research publications / Profile' :
                 'Portfolio / Personal website'}
              </label>
              <div className="relative"><Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" /><input className="input pl-8"
                placeholder={
                  userField === 'Arts & Design'       ? 'behance.net/yourprofile' :
                  userField === 'Science & Research'  ? 'scholar.google.com/...' :
                  userField === 'Healthcare & Medicine'? 'pubmed.ncbi.nlm.nih.gov/...' :
                  'yourwebsite.com'
                }
                value={form.portfolioUrl} onChange={e => f('portfolioUrl', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}