import { Link } from 'react-router-dom'
import {
  Sparkles, ArrowRight, BrainCircuit, Map, FileText,
  BarChart3, MessageSquare, Users, CheckCircle2, Star,
  Zap, Target, TrendingUp, BookOpen, Award, ChevronRight
} from 'lucide-react'
import clsx from 'clsx'

// ── Data ──────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: BrainCircuit,
    color: 'navy',
    title: 'AI Skill Assessment',
    desc: 'Adaptive MCQ engine identifies your strengths and gaps across DSA, Web Dev, ML, and more — with personalized recommendations.',
  },
  {
    icon: Map,
    color: 'teal',
    title: 'Career Roadmap Generator',
    desc: 'Tell us your dream role. Our AI builds a step-by-step milestone roadmap with curated resources and realistic timelines.',
  },
  {
    icon: FileText,
    color: 'violet',
    title: 'AI Resume Builder',
    desc: 'ATS score checker, bullet-point improver, keyword optimizer, and one-click PDF export — all in a beautiful drag-and-drop editor.',
  },
  {
    icon: BarChart3,
    color: 'teal',
    title: 'Career Analytics',
    desc: 'Track skill growth, application funnels, career health score, and peer benchmarking — all in one powerful dashboard.',
  },
  {
    icon: MessageSquare,
    color: 'violet',
    title: 'AI Career Chatbot',
    desc: 'Your always-on career advisor. Ask anything — resume reviews, interview tips, course suggestions, career switches.',
  },
  {
    icon: Users,
    color: 'navy',
    title: 'Peer & Mentor Network',
    desc: 'Connect with verified mentors, join study groups, and engage in domain-specific forums. Learning is better together.',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Create your profile', desc: 'Add your education, skills, and career goals. Takes under 3 minutes.' },
  { step: '02', title: 'Take skill assessment', desc: 'Our adaptive AI quiz identifies exactly where you stand in your chosen domain.' },
  { step: '03', title: 'Get your roadmap', desc: 'Claude AI generates a personalised milestone-based learning path just for you.' },
  { step: '04', title: 'Build & apply', desc: 'Create ATS-optimised resumes, track applications, and land your dream role.' },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'SDE @ Google',
    avatar: 'PS',
    color: 'navy',
    text: 'CareerAI\'s roadmap and mock assessments helped me crack Google in 4 months. The AI chatbot felt like having a personal career coach.',
    stars: 5,
  },
  {
    name: 'Rahul Verma',
    role: 'Data Analyst @ Flipkart',
    avatar: 'RV',
    color: 'teal',
    text: 'The resume ATS scorer was a game-changer. My shortlist rate jumped from 10% to 65% after optimising with CareerAI.',
    stars: 5,
  },
  {
    name: 'Ananya Singh',
    role: 'ML Engineer @ Microsoft',
    avatar: 'AS',
    color: 'violet',
    text: 'I loved the skill gap analysis. It told me exactly what to learn, in what order, with the best free resources. Absolutely brilliant.',
    stars: 5,
  },
]

const STATS = [
  { value: '10,000+', label: 'Users guided', icon: Users },
  { value: '95%',     label: 'Placement rate',  icon: Target },
  { value: '50+',     label: 'Career paths',    icon: Map },
  { value: '4.9/5',   label: 'Average rating',  icon: Star },
]

// ── Sub-components ────────────────────────────────────────────────

function FeatureCard({ icon: Icon, color, title, desc }) {
  const colorMap = {
    navy:   'bg-navy-50 dark:bg-navy-900/30 text-navy-600 dark:text-navy-300',
    teal:   'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300',
  }
  return (
    <div className="card p-6 hover:shadow-lifted hover:-translate-y-1 transition-all duration-300 group cursor-default">
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

function TestimonialCard({ name, role, avatar, color, text, stars }) {
  const colorMap = {
    navy:   'bg-navy-600',
    teal:   'bg-teal-600',
    violet: 'bg-violet-600',
  }
  return (
    <div className="card p-6 hover:shadow-lifted transition-all duration-300">
      <div className="flex items-start gap-3 mb-4">
        <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-600 shrink-0', colorMap[color])}>
          {avatar}
        </div>
        <div>
          <div className="font-medium text-sm text-surface-900 dark:text-white">{name}</div>
          <div className="text-xs text-surface-500">{role}</div>
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

// ── Main Landing Page ─────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="overflow-hidden">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 bg-gradient-to-br from-surface-50 via-white to-blue-50/50 dark:from-surface-900 dark:via-surface-900 dark:to-navy-900/30">

        {/* Background geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-navy-600/10 to-teal-600/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-violet-600/10 to-navy-600/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-surface-200/50 dark:border-surface-700/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-surface-200/50 dark:border-surface-700/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Text */}
            <div className="animate-fade-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full px-4 py-2 text-xs font-medium text-navy-600 dark:text-navy-300 mb-8 shadow-card">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <Sparkles size={12} />
                Powered by Groq AI · Free for everyone
              </div>

              {/* Headline */}
              <h1 className="font-display text-5xl lg:text-6xl font-800 leading-tight text-surface-900 dark:text-white mb-6 text-balance">
                Your AI-powered{' '}
                <span className="gradient-text">career companion</span>{' '}
                from college to career
              </h1>

              {/* Subtext */}
              <p className="text-lg text-surface-500 dark:text-surface-400 leading-relaxed mb-10 max-w-xl">
                Assess your skills, generate a personalised roadmap, build ATS-beating resumes, and get AI career guidance — whether you're a fresher or a 10-year veteran switching careers.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand-bg text-white font-medium text-base shadow-glow hover:opacity-90 hover:scale-105 transition-all duration-200"
                >
                  Start for free
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-medium text-base hover:bg-surface-50 dark:hover:bg-surface-700 transition-all duration-200 shadow-card"
                >
                  See how it works
                  <ChevronRight size={16} />
                </a>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['PS', 'RV', 'AS', 'MK', 'NT'].map((init, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-900 gradient-brand-bg flex items-center justify-center text-white text-xs font-600"
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-surface-500">Trusted by 10,000+ users</p>
                </div>
              </div>
            </div>

            {/* Right: Dashboard preview card */}
            <div className="hidden lg:block animate-fade-up animate-delay-200">
              <div className="relative">
                {/* Floating cards around main */}
                <div className="absolute -top-6 -left-6 animate-float" style={{ animationDelay: '0s' }}>
                  <div className="card px-4 py-3 shadow-lifted flex items-center gap-3 whitespace-nowrap">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                      <TrendingUp size={16} className="text-teal-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-surface-900 dark:text-white">Career score</div>
                      <div className="text-xs text-teal-600 font-600">↑ 78% this month</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="card px-4 py-3 shadow-lifted flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                      <Award size={16} className="text-violet-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-surface-900 dark:text-white">ATS score</div>
                      <div className="text-xs text-violet-600 font-600">92/100 — Excellent</div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 -right-8 -translate-y-1/2 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="card px-4 py-3 shadow-lifted">
                    <div className="text-xs font-medium text-surface-900 dark:text-white mb-1">🔥 14-day streak</div>
                    <div className="flex gap-1">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className={clsx('w-4 h-4 rounded-sm', i < 5 ? 'gradient-brand-bg' : 'bg-surface-200 dark:bg-surface-700')} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main dashboard mockup */}
                <div className="card rounded-2xl shadow-lifted overflow-hidden border-surface-200 dark:border-surface-700">
                  {/* Topbar */}
                  <div className="h-10 bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex items-center px-4 gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <div className="flex-1 bg-white dark:bg-surface-700 rounded-md h-5 mx-6 flex items-center px-2">
                      <span className="text-2xs text-surface-400">careerai.dev/dashboard</span>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div className="p-5 space-y-4">
                    {/* Welcome */}
                    <div className="gradient-brand-bg rounded-xl p-4 text-white">
                      <div className="text-sm font-600 mb-1">Good morning, Awadhesh! 👋</div>
                      <div className="text-xs opacity-80">You have 2 milestones due this week</div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Career score', value: '78%', color: 'text-navy-600' },
                        { label: 'Roadmap', value: '45%', color: 'text-teal-600' },
                        { label: 'Skills', value: '12', color: 'text-violet-600' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3">
                          <div className="text-2xs text-surface-400 mb-1">{label}</div>
                          <div className={clsx('text-lg font-700 font-display', color)}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Roadmap progress */}
                    <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-surface-700 dark:text-surface-300">Full Stack Developer</div>
                        <div className="text-xs text-navy-600 font-medium">45%</div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '45%' }} />
                      </div>
                      <div className="text-2xs text-surface-400 mt-1.5">4 of 9 milestones complete</div>
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button className="text-left bg-navy-50 dark:bg-navy-900/30 border border-navy-200/50 dark:border-navy-700/50 rounded-lg p-3 text-xs font-medium text-navy-600 dark:text-navy-300 hover:bg-navy-100 transition-colors">
                        ◈ Take assessment
                      </button>
                      <button className="text-left bg-violet-50 dark:bg-violet-900/20 border border-violet-200/50 dark:border-violet-700/50 rounded-lg p-3 text-xs font-medium text-violet-600 dark:text-violet-300 hover:bg-violet-100 transition-colors">
                        ✦ AI advisor chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-surface-800 border-y border-surface-200 dark:border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center group">
                <div className="w-10 h-10 rounded-xl gradient-brand-bg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Icon size={18} className="text-white" />
                </div>
                <div className="font-display text-3xl font-800 gradient-text mb-1">{value}</div>
                <div className="text-sm text-surface-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section id="features" className="section bg-surface-50 dark:bg-surface-900">
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
              From understanding where you are today to landing your dream job — CareerAI covers every step with intelligent, personalised guidance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how-it-works" className="section bg-white dark:bg-surface-800">
        <div className="container-app">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="badge-primary inline-flex mb-4">
                <Target size={12} /> Simple process
              </div>
              <h2 className="font-display text-4xl font-800 text-surface-900 dark:text-white mb-6 text-balance">
                Go from student to{' '}
                <span className="gradient-text">hired professional</span>{' '}
                in 4 steps
              </h2>
              <p className="text-base text-surface-500 dark:text-surface-400 leading-relaxed mb-10">
                Our AI guides you at every stage. No guessing, no generic advice — just a clear, personalised path tailored to your goals.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand-bg text-white font-medium shadow-glow hover:opacity-90 transition-all"
              >
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

      {/* ── ABOUT / VISION / MISSION ──────────────────────────────── */}
      <section id="about" className="section bg-surface-900 dark:bg-black text-white relative overflow-hidden">
        {/* bg accent */}
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
              Built by students,{' '}
              <span className="gradient-text">for students</span>
            </h2>
            <p className="text-base text-surface-300 max-w-2xl mx-auto leading-relaxed">
              CareerAI was born from a simple observation — most people have the potential to succeed in their career, but lack the right guidance at the right time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: '🎯',
                title: 'Our Mission',
                text: 'To make world-class, personalised career guidance accessible to everyone — from students to working professionals, regardless of background or experience level.',
                color: 'border-navy-500/40 bg-navy-600/10',
              },
              {
                icon: '🔭',
                title: 'Our Vision',
                text: 'A world where every professional has an AI-powered career companion that grows with them — from day one to the corner office.',
                color: 'border-teal-500/40 bg-teal-600/10',
              },
              {
                icon: '💡',
                title: 'Our Values',
                text: 'Accessibility, transparency, continuous learning, and student-first design. We build tools we wish we had at every stage of our careers.',
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

          {/* Tech stack */}
          <div className="border border-surface-700 rounded-2xl p-8 text-center">
            <div className="text-sm text-surface-400 mb-5 font-medium">Powered by cutting-edge technology</div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {['React', 'Node.js', 'MongoDB', 'Claude AI', 'Tailwind CSS', 'Express', 'Cloudinary'].map((tech) => (
                <span key={tech} className="px-4 py-2 bg-surface-800 border border-surface-700 rounded-full text-sm text-surface-300 font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="section bg-surface-50 dark:bg-surface-900">
        <div className="container-app">
          <div className="text-center mb-14">
            <div className="badge-accent inline-flex mb-4">
              <Star size={12} /> Student stories
            </div>
            <h2 className="font-display text-4xl font-800 text-surface-900 dark:text-white mb-4 text-balance">
              Real students,{' '}
              <span className="gradient-text">real results</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => <TestimonialCard key={t.name} {...t} />)}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────── */}
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
                Ready to unlock your career potential?
              </h2>
              <p className="text-base opacity-85 mb-10 max-w-xl mx-auto leading-relaxed">
                Join thousands of students and professionals already using CareerAI to build skills, craft perfect resumes, and land dream jobs.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-600 font-600 rounded-xl text-base hover:bg-surface-50 hover:scale-105 transition-all shadow-xl"
                >
                  Get started free today
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 border border-white/30 text-white font-medium rounded-xl text-base hover:bg-white/25 transition-all"
                >
                  Already have account? Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}