import { Link } from 'react-router-dom'
import {
  Sparkles, ArrowRight, BrainCircuit, Map, FileText,
  BarChart3, MessageSquare, Users, CheckCircle2, Star,
  Zap, Target, TrendingUp, BookOpen, Award, ChevronRight,
  Briefcase, Mic, Building2
} from 'lucide-react'
import clsx from 'clsx'

// ── Data ──────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: BrainCircuit,
    color: 'navy',
    title: 'AI Skill Assessment',
    desc: 'Adaptive quizzes across 12+ domains — from DSA and Finance to Law, Design, and Healthcare. Know exactly where you stand.',
  },
  {
    icon: Map,
    color: 'teal',
    title: 'Personalised Roadmap',
    desc: 'Tell us your target role. AI builds a milestone-based learning path with curated resources — for any field, any level.',
  },
  {
    icon: FileText,
    color: 'violet',
    title: 'AI Resume Builder',
    desc: 'ATS scorer, bullet-point improver, and keyword optimiser. Whether you are a lawyer, designer, or engineer — we have you covered.',
  },
  {
    icon: Briefcase,
    color: 'teal',
    title: 'Job Matching Engine',
    desc: 'AI scores every job against your profile and skills. Browse matched opportunities and track all applications in one place.',
  },
  {
    icon: Mic,
    color: 'violet',
    title: 'AI Mock Interview',
    desc: 'Role-specific interview practice with real-time AI feedback on every answer. Build confidence before the real thing.',
  },
  {
    icon: MessageSquare,
    color: 'navy',
    title: 'AI Career Advisor',
    desc: 'Your always-on career advisor — specialised for your field. Ask anything about career switches, certifications, or growth paths.',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Sign up and choose your field', desc: 'Tell us who you are — student, professional, or career switcher. Pick from Technology, Law, Finance, Design, Healthcare, and 7 more fields.' },
  { step: '02', title: 'Complete your 4-step onboarding', desc: 'Set your goal, target role, and experience level. Takes under 2 minutes and personalises everything just for you.' },
  { step: '03', title: 'Take your first skill assessment', desc: 'Our AI quiz — or a custom topic you type in — identifies exactly where you stand and what to focus on.' },
  { step: '04', title: 'Get your roadmap and grow', desc: 'AI generates your personalised learning path. Track progress, build your resume, practise interviews, and land your dream role.' },
]

const FIELDS = [
  { icon: '💻', label: 'Technology',            roles: 'SDE · Data Scientist · DevOps' },
  { icon: '⚖️', label: 'Law & Legal',           roles: 'Corporate Lawyer · IP Attorney' },
  { icon: '💰', label: 'Finance & Accounting',  roles: 'CA · Investment Banker · CFA' },
  { icon: '🎨', label: 'Arts & Design',         roles: 'UX Designer · Art Director' },
  { icon: '📊', label: 'Business & Management', roles: 'Product Manager · Consultant' },
  { icon: '🏥', label: 'Healthcare & Medicine', roles: 'Doctor · Clinical Researcher' },
  { icon: '📢', label: 'Marketing & Media',     roles: 'Brand Manager · Growth Marketer' },
  { icon: '🔬', label: 'Science & Research',    roles: 'Research Scientist · Lab Analyst' },
  { icon: '⚙️', label: 'Engineering (Non-CS)',  roles: 'Mechanical · Civil · Electrical' },
  { icon: '📚', label: 'Education',             roles: 'Curriculum Designer · EdTech' },
]

const TESTIMONIALS = [
  {
    name:   'Priya Sharma',
    role:   'Software Engineer @ Google',
    avatar: 'PS',
    color:  'navy',
    field:  'Technology',
    text:   'The AI roadmap and mock assessments helped me crack Google in 4 months. Felt like having a personal career coach available 24/7.',
    stars:  5,
  },
  {
    name:   'Rohan Mehta',
    role:   'Associate @ Trilegal',
    avatar: 'RM',
    color:  'violet',
    field:  'Law & Legal',
    text:   'First platform I found that actually understands law careers. The interview prep for corporate law roles was spot-on and incredibly useful.',
    stars:  5,
  },
  {
    name:   'Ananya Singh',
    role:   'Financial Analyst @ Goldman Sachs',
    avatar: 'AS',
    color:  'teal',
    field:  'Finance',
    text:   'The skill gap analysis for my CFA prep was brilliant. It told me exactly what to study, in what order, with the best free resources.',
    stars:  5,
  },
]

const HIGHLIGHTS = [
  { icon: '🆓', value: 'Free forever',   label: 'No credit card needed' },
  { icon: '🌍', value: '10+ Fields',     label: 'Tech, Law, Finance, Design & more' },
  { icon: '🤖', value: 'AI-powered',     label: 'Groq AI for every feature' },
  { icon: '🎯', value: 'Personalised',   label: 'Adapts to your field & goals' },
]

// ── Sub-components ────────────────────────────────────────────────

function FeatureCard({ icon: Icon, color, title, desc }) {
  const colorMap = {
    navy:   'bg-navy-50 dark:bg-navy-900/30 text-navy-600 dark:text-navy-300',
    teal:   'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300',
  }
  return (
    <div className="card p-6 hover:shadow-lifted hover:-translate-y-1 transition-all duration-300 cursor-default">
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center mb-4', colorMap[color])}>
        <Icon size={22} />
      </div>
      <h3 className="font-display text-lg font-700 text-surface-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{desc}</p>
    </div>
  )
}

function StepCard({ step, title, desc, isLast }) {
  return (
    <div className="flex gap-4 relative">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl gradient-brand-bg flex items-center justify-center text-white font-display font-700 text-base shrink-0 shadow-glow">
          {step}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-navy-600/50 to-transparent mt-2" />}
      </div>
      <div className="pb-10">
        <h3 className="font-display text-lg font-700 text-surface-900 dark:text-white mb-1.5">{title}</h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function TestimonialCard({ name, role, avatar, color, field, text, stars }) {
  const colorMap = { navy: 'bg-navy-600', teal: 'bg-teal-600', violet: 'bg-violet-600' }
  return (
    <div className="card p-6 hover:shadow-lifted transition-all duration-300">
      <div className="flex items-start gap-3 mb-4">
        <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-600 shrink-0', colorMap[color])}>
          {avatar}
        </div>
        <div>
          <div className="font-medium text-sm text-surface-900 dark:text-white">{name}</div>
          <div className="text-xs text-surface-500">{role}</div>
          <span className="text-2xs bg-surface-100 dark:bg-surface-700 text-surface-500 px-2 py-0.5 rounded-full mt-1 inline-block">{field}</span>
        </div>
        <div className="ml-auto flex gap-0.5">
          {[...Array(stars)].map((_, i) => (
            <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
      <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">"{text}"</p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="overflow-hidden">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 bg-gradient-to-br from-surface-50 via-white to-blue-50/50 dark:from-surface-900 dark:via-surface-900 dark:to-navy-900/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-navy-600/10 to-teal-600/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-violet-600/10 to-navy-600/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-surface-200/50 dark:border-surface-700/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-surface-200/50 dark:border-surface-700/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full px-4 py-2 text-xs font-medium text-navy-600 dark:text-navy-300 mb-8 shadow-card">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <Sparkles size={12} />
                Powered by Groq AI · Free for everyone
              </div>

              <h1 className="font-display text-5xl lg:text-6xl font-800 leading-tight text-surface-900 dark:text-white mb-6 text-balance">
                Your AI career companion —{' '}
                <span className="gradient-text">every field,</span>{' '}
                every goal
              </h1>

              <p className="text-lg text-surface-500 dark:text-surface-400 leading-relaxed mb-6 max-w-xl">
                Whether you're a law student, a medical professional, a tech engineer, or a finance analyst — CareerAI gives you a personalised roadmap, skill assessments, AI interview practice, and a career advisor tailored to <strong className="text-surface-700 dark:text-surface-300">your</strong> field.
              </p>

              {/* Field pills */}
              <div className="flex flex-wrap gap-2 mb-10">
                {['💻 Tech', '⚖️ Law', '💰 Finance', '🎨 Design', '🏥 Healthcare', '📊 Business', '+ more'].map(f => (
                  <span key={f} className="px-3 py-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full text-xs text-surface-600 dark:text-surface-400 font-medium shadow-card">
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand-bg text-white font-medium text-base shadow-glow hover:opacity-90 hover:scale-105 transition-all duration-200">
                  Start for free <ArrowRight size={18} />
                </Link>
                <a href="#how-it-works" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-medium text-base hover:bg-surface-50 dark:hover:bg-surface-700 transition-all duration-200 shadow-card">
                  See how it works <ChevronRight size={16} />
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {['💻', '⚖️', '💰', '🎨', '🏥'].map((emoji, i) => (
                    <span key={i} className="w-8 h-8 rounded-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-sm shadow-card">
                      {emoji}
                    </span>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-700 dark:text-surface-300">For every career field</p>
                  <p className="text-xs text-surface-400">Tech · Law · Finance · Design · Healthcare & more</p>
                </div>
              </div>
            </div>

            {/* Right — Dashboard mockup */}
            <div className="hidden lg:block animate-fade-up animate-delay-200">
              <div className="relative">
                <div className="absolute -top-6 -left-6 animate-float" style={{ animationDelay: '0s' }}>
                  <div className="card px-4 py-3 shadow-lifted flex items-center gap-3 whitespace-nowrap">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                      <Map size={16} className="text-teal-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-surface-900 dark:text-white">AI Roadmap</div>
                      <div className="text-xs text-teal-600 font-600">Generated in seconds</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="card px-4 py-3 shadow-lifted flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                      <Mic size={16} className="text-violet-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-surface-900 dark:text-white">Mock Interview</div>
                      <div className="text-xs text-violet-600 font-600">AI feedback on every answer</div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 -right-8 -translate-y-1/2 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="card px-4 py-3 shadow-lifted">
                    <div className="text-xs font-medium text-surface-900 dark:text-white mb-1">✦ All fields supported</div>
                    <div className="flex gap-1 flex-wrap max-w-28">
                      {['💻', '⚖️', '💰', '🎨', '🏥'].map((e, i) => (
                        <span key={i} className="text-sm">{e}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card rounded-2xl shadow-lifted overflow-hidden">
                  <div className="h-10 bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex items-center px-4 gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <div className="flex-1 bg-white dark:bg-surface-700 rounded-md h-5 mx-6 flex items-center px-2">
                      <span className="text-2xs text-surface-400">careerai.vercel.app/dashboard</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Welcome — dynamic greeting */}
                    <div className="gradient-brand-bg rounded-xl p-4 text-white">
                      <div className="text-sm font-600 mb-1">
                        {(() => {
                          const h = new Date().getHours()
                          return h < 12 ? 'Good morning! 👋' : h < 17 ? 'Good afternoon! 👋' : 'Good evening! 👋'
                        })()}
                      </div>
                      <div className="text-xs opacity-80">Your roadmap is 45% complete — keep going!</div>
                    </div>

                    {/* Feature highlights instead of fake numbers */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Skill Assessment', icon: '🧠', color: 'text-navy-600' },
                        { label: 'AI Roadmap',       icon: '🗺️', color: 'text-teal-600' },
                        { label: 'Mock Interview',   icon: '🎤', color: 'text-violet-600' },
                      ].map(({ label, icon, color }) => (
                        <div key={label} className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3 text-center">
                          <div className="text-lg mb-1">{icon}</div>
                          <div className={clsx('text-2xs font-600', color)}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Roadmap — generic role */}
                    <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-surface-700 dark:text-surface-300">Your Career Roadmap</div>
                        <div className="text-xs text-navy-600 font-medium">45%</div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '45%' }} />
                      </div>
                      <div className="text-2xs text-surface-400 mt-1.5">4 of 9 milestones complete</div>
                    </div>

                    {/* Field tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {['💻 Tech', '⚖️ Law', '💰 Finance', '🎨 Design'].map(f => (
                        <span key={f} className="text-2xs px-2 py-1 bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-full text-surface-500">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS ────────────────────────────────────────── */}
      <section className="bg-white dark:bg-surface-800 border-y border-surface-200 dark:border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {HIGHLIGHTS.map(({ icon, value, label }) => (
              <div key={value} className="text-center group">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="font-display text-xl font-800 text-surface-900 dark:text-white mb-0.5">{value}</div>
                <div className="text-xs text-surface-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FIELDS GRID ───────────────────────────────────────── */}
      <section className="section bg-surface-50 dark:bg-surface-900">
        <div className="container-app">
          <div className="text-center mb-12">
            <div className="badge-primary inline-flex mb-4">
              <Target size={12} /> For every professional
            </div>
            <h2 className="font-display text-4xl font-800 text-surface-900 dark:text-white mb-4 text-balance">
              Built for <span className="gradient-text">all careers,</span> not just tech
            </h2>
            <p className="text-base text-surface-500 max-w-2xl mx-auto">
              CareerAI adapts entirely to your field — different assessments, different roadmaps, different interview questions, different advice.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {FIELDS.map(({ icon, label, roles }) => (
              <div key={label} className="card p-4 text-center hover:shadow-lifted hover:-translate-y-1 transition-all duration-200 cursor-default group">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="font-display text-sm font-700 text-surface-900 dark:text-white mb-1">{label}</div>
                <div className="text-2xs text-surface-400 leading-relaxed">{roles}</div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-surface-400 mt-6">
            + Engineering, Science & Research, and more — all fully supported
          </p>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section id="features" className="section bg-white dark:bg-surface-800">
        <div className="container-app">
          <div className="text-center mb-14">
            <div className="badge-accent inline-flex mb-4">
              <Zap size={12} /> Everything you need
            </div>
            <h2 className="font-display text-4xl font-800 text-surface-900 dark:text-white mb-4 text-balance">
              One platform. Every tool to{' '}
              <span className="gradient-text">launch your career</span>
            </h2>
            <p className="text-base text-surface-500 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
              From knowing where you stand today to landing your dream role — CareerAI covers every step with intelligent, personalised guidance for your field.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how-it-works" className="section bg-surface-50 dark:bg-surface-900">
        <div className="container-app">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="badge-primary inline-flex mb-4">
                <Target size={12} /> Simple process
              </div>
              <h2 className="font-display text-4xl font-800 text-surface-900 dark:text-white mb-6 text-balance">
                Personalised from{' '}
                <span className="gradient-text">day one</span>
              </h2>
              <p className="text-base text-surface-500 dark:text-surface-400 leading-relaxed mb-10">
                Unlike generic career platforms — CareerAI asks about your field first, then tailors every feature: assessments, roadmaps, interview questions, and AI advice all adapt to you.
              </p>
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand-bg text-white font-medium shadow-glow hover:opacity-90 transition-all">
                Begin your journey <ArrowRight size={18} />
              </Link>
            </div>

            <div className="space-y-0">
              {HOW_IT_WORKS.map((step, i) => (
                <StepCard key={step.step} {...step} isLast={i === HOW_IT_WORKS.length - 1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────── */}
      <section id="about" className="section bg-surface-900 dark:bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-navy-600/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-600/10 blur-3xl" />
        </div>

        <div className="container-app relative">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs font-medium text-teal-300 mb-6">
              <BookOpen size={12} /> Our story
            </div>
            <h2 className="font-display text-4xl font-800 mb-4 text-balance">
              Built for everyone,{' '}
              <span className="gradient-text">not just coders</span>
            </h2>
            <p className="text-base text-surface-300 max-w-2xl mx-auto leading-relaxed">
              CareerAI was built on one belief — great career guidance shouldn't be limited to people in tech. Every professional deserves a personalised AI companion that understands their field.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: '🎯',
                title: 'Our Mission',
                text: 'To make world-class, personalised career guidance accessible to everyone — from law students to medical professionals, from artists to engineers — regardless of background.',
                color: 'border-navy-500/40 bg-navy-600/10',
              },
              {
                icon: '🔭',
                title: 'Our Vision',
                text: 'A world where every professional has an AI-powered career companion that truly understands their field and grows with them — from first job to dream career.',
                color: 'border-teal-500/40 bg-teal-600/10',
              },
              {
                icon: '💡',
                title: 'Our Values',
                text: 'Inclusivity, personalisation, continuous learning, and field-first design. We build tools relevant to every career — not just the ones that get the most attention.',
                color: 'border-violet-500/40 bg-violet-600/10',
              },
            ].map(({ icon, title, text, color }) => (
              <div key={title} className={clsx('rounded-2xl border p-7', color)}>
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-display text-xl font-700 text-white mb-3">{title}</h3>
                <p className="text-sm text-surface-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="border border-surface-700 rounded-2xl p-8 text-center">
            <div className="text-sm text-surface-400 mb-5 font-medium">Powered by cutting-edge technology</div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {['React', 'Node.js', 'MongoDB', 'Groq AI', 'Tailwind CSS', 'Express', 'Cloudinary'].map((tech) => (
                <span key={tech} className="px-4 py-2 bg-surface-800 border border-surface-700 rounded-full text-sm text-surface-300 font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="section bg-surface-50 dark:bg-surface-900">
        <div className="container-app">
          <div className="text-center mb-14">
            <div className="badge-accent inline-flex mb-4">
              <Star size={12} /> Real stories
            </div>
            <h2 className="font-display text-4xl font-800 text-surface-900 dark:text-white mb-4 text-balance">
              What our users say
            </h2>
            <p className="text-sm text-surface-500 max-w-xl mx-auto">
              From tech to law to finance — CareerAI helps professionals across all fields grow their careers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => <TestimonialCard key={t.name} {...t} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="section bg-white dark:bg-surface-800">
        <div className="container-app">
          <div className="gradient-brand-bg rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-2 text-xs font-medium mb-6">
                <CheckCircle2 size={12} /> Free to get started · No credit card required
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-800 mb-4 text-balance">
                Your career breakthrough starts here
              </h2>
              <p className="text-base opacity-85 mb-10 max-w-xl mx-auto leading-relaxed">
                Join thousands of students and professionals across all fields already using CareerAI to build skills, nail interviews, and land their dream roles.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-600 font-600 rounded-xl text-base hover:bg-surface-50 hover:scale-105 transition-all shadow-xl">
                  Get started free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 border border-white/30 text-white font-medium rounded-xl text-base hover:bg-white/25 transition-all">
                  Already have an account? Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}