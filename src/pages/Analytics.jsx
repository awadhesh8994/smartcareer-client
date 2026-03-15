import { useEffect, useState } from 'react'
import { BarChart2, TrendingUp, Target, Award } from 'lucide-react'
import { userService, assessmentService } from '@services/index'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell } from 'recharts'

export default function Analytics() {
  const [stats, setStats]     = useState(null)
  const [history, setHistory] = useState([])
  useEffect(() => {
    userService.getStats().then(r => setStats(r.data.data)).catch(()=>{})
    assessmentService.history().then(r => setHistory(r.data.data||[])).catch(()=>{})
  }, [])

  const domainScores = history.reduce((acc, a) => {
    if (!acc[a.domain]) acc[a.domain] = { domain: a.domain.split(' ')[0], score: a.score, count: 1 }
    else { acc[a.domain].score = Math.round((acc[a.domain].score + a.score)/2); acc[a.domain].count++ }
    return acc
  }, {})
  const chartData = Object.values(domainScores)

  const healthScore = stats ? Math.round((stats.profileScore * 0.3) + (stats.roadmapProgress * 0.4) + (Math.min(stats.totalAssessments * 10, 30))) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white mb-1">Career Analytics</h1>
        <p className="text-surface-500 text-sm">Track your growth, skill development, and career readiness.</p>
      </div>

      {/* Career health score */}
      <div className="card p-6 gradient-brand-bg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm mb-1">Career health score</p>
            <div className="font-display text-5xl font-800 mb-1">{healthScore}<span className="text-2xl text-white/70">/100</span></div>
            <p className="text-white/70 text-xs">{healthScore >= 70 ? 'Excellent — keep it up!' : healthScore >= 50 ? 'Good — room to grow' : 'Needs attention'}</p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center">
            <Award size={32} className="text-white"/>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[['Profile',`${stats?.profileScore||0}%`,'30%'],['Roadmap',`${stats?.roadmapProgress||0}%`,'40%'],['Assessments',`${Math.min((stats?.totalAssessments||0)*10,30)}pts`,'30%']].map(([l,v,w]) => (
            <div key={l} className="bg-white/15 rounded-xl p-3">
              <div className="text-white/60 text-xs mb-0.5">{l} ({w})</div>
              <div className="text-white font-700 text-base">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l:'Profile score',  v:`${stats?.profileScore||0}%`,     icon:Target,   c:'text-navy-600' },
          { l:'Avg score',      v:`${stats?.avgScore||0}%`,          icon:TrendingUp,c:'text-teal-600' },
          { l:'Assessments',    v:stats?.totalAssessments||0,        icon:BarChart2,c:'text-violet-600' },
          { l:'Roadmap',        v:`${stats?.roadmapProgress||0}%`,   icon:Award,    c:'text-amber-500' },
        ].map(({l,v,icon:Icon,c}) => (
          <div key={l} className="card p-4">
            <Icon size={18} className={`${c} mb-2`}/>
            <div className={`font-display text-2xl font-700 ${c}`}>{v}</div>
            <div className="text-xs text-surface-400 mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="font-display text-base font-700 text-surface-900 dark:text-white mb-4">Score by domain</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="domain" tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
                <YAxis hide domain={[0,100]}/>
                <Tooltip contentStyle={{fontSize:12,borderRadius:8,border:'0.5px solid #E2E8F0'}}/>
                <Bar dataKey="score" radius={[6,6,0,0]}>
                  {chartData.map((_,i) => <Cell key={i} fill={['#0F4C81','#00C9A7','#7C3AED','#F59E0B','#10B981','#EF4444'][i%6]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="font-display text-base font-700 text-surface-900 dark:text-white mb-4">Skill radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={chartData}>
                <PolarGrid stroke="#E2E8F0"/>
                <PolarAngleAxis dataKey="domain" tick={{fontSize:11,fill:'#64748B'}}/>
                <Radar dataKey="score" stroke="#0F4C81" fill="#0F4C81" fillOpacity={0.2} strokeWidth={2}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Assessment history table */}
      {history.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display text-base font-700 text-surface-900 dark:text-white mb-4">Assessment history</h3>
          <div className="space-y-2">
            {history.map((a,i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                <div className="w-8 h-8 rounded-lg gradient-brand-bg flex items-center justify-center text-white text-xs font-700 shrink-0">{a.score}%</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{a.domain}</p>
                  <p className="text-xs text-surface-400">{new Date(a.completedAt||a.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge text-xs ${a.skillLevel==='Advanced'?'badge-success':a.skillLevel==='Intermediate'?'badge-warning':'badge-danger'}`}>{a.skillLevel}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
