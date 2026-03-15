import { useEffect, useState } from 'react'
import { Users, MessageSquare, Trophy, Plus, ThumbsUp, Send } from 'lucide-react'
import { networkService } from '@services/index'
import { useAuthStore } from '@store/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function Network() {
  const [tab, setTab]         = useState('mentors')
  const [mentors, setMentors] = useState([])
  const [posts, setPosts]     = useState([])
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState({ show:false, title:'', body:'', domain:'General' })
  const [reply, setReply]     = useState({})
  const { user }              = useAuthStore()

  useEffect(() => {
    Promise.all([
      networkService.getMentors().then(r => setMentors(r.data.data||[])),
      networkService.getForumPosts().then(r => setPosts(r.data.data||[])),
      networkService.getLeaderboard().then(r => setLeaders(r.data.data||[])),
    ]).finally(() => setLoading(false))
  }, [])

  const sendRequest = async (mentorId, domain) => {
    try {
      await networkService.sendMentorRequest({ mentorId, domain, message: `Hi, I'd like you to mentor me in ${domain}` })
      toast.success('Mentorship request sent!')
    } catch { toast.error('Already sent or failed') }
  }

  const createPost = async () => {
    if (!newPost.title.trim()) return toast.error('Enter a title')
    try {
      const r = await networkService.createForumPost({ title: newPost.title, body: newPost.body, domain: newPost.domain })
      setPosts(p => [r.data.data, ...p])
      setNewPost({ show:false, title:'', body:'', domain:'General' })
      toast.success('Post created!')
    } catch { toast.error('Failed to post') }
  }

  const likePost = async (id) => {
    try {
      await networkService.likePost(id)
      setPosts(p => p.map(post => post._id===id ? {...post, likes: post.likes+1} : post))
    } catch {}
  }

  const replyPost = async (id) => {
    if (!reply[id]?.trim()) return
    try {
      const r = await networkService.replyToPost(id, reply[id])
      setPosts(p => p.map(post => post._id===id ? r.data.data : post))
      setReply(r => ({...r, [id]: ''}))
    } catch { toast.error('Failed to reply') }
  }

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white">Network</h1>
        <p className="text-surface-500 text-sm mt-1">Connect with mentors, engage in forums, and climb the leaderboard</p>
      </div>

      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl w-fit">
        {[['mentors','Mentors',Users],['forum','Forum',MessageSquare],['leaderboard','Leaderboard',Trophy]].map(([t,l,Icon]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab===t?'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm':'text-surface-500'}`}>
            <Icon size={14}/> {l}
          </button>
        ))}
      </div>

      {tab === 'mentors' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.length === 0 && <p className="text-surface-400 text-sm col-span-3">No mentors found. Complete your profile to see mentor matches.</p>}
          {mentors.map(m => (
            <div key={m._id} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                {m.avatar ? <img src={m.avatar} className="w-10 h-10 rounded-full object-cover" alt={m.name}/> :
                  <div className="w-10 h-10 rounded-full gradient-brand-bg flex items-center justify-center text-white font-700">{m.name?.charAt(0)}</div>}
                <div>
                  <p className="font-medium text-sm text-surface-900 dark:text-white">{m.name}</p>
                  <p className="text-xs text-surface-400">{m.location||'India'}</p>
                </div>
              </div>
              {m.bio && <p className="text-xs text-surface-500 mb-3 line-clamp-2">{m.bio}</p>}
              <div className="flex flex-wrap gap-1 mb-3">
                {m.skills?.slice(0,3).map(s => <span key={s.name} className="badge-primary text-xs">{s.name}</span>)}
              </div>
              <button onClick={() => sendRequest(m._id, m.skills?.[0]?.name||'General')} className="w-full btn-outline text-xs py-2">Request mentorship</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'forum' && (
        <div className="space-y-4">
          <button onClick={() => setNewPost({...newPost,show:true})} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14}/> New post</button>
          {posts.map(p => (
            <div key={p._id} className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full gradient-brand-bg flex items-center justify-center text-white text-xs font-600">{p.authorId?.name?.charAt(0)||'U'}</div>
                <span className="text-xs font-medium text-surface-700 dark:text-surface-300">{p.authorId?.name||'User'}</span>
                <span className="badge-accent text-xs ml-auto">{p.domain}</span>
              </div>
              <h3 className="font-display text-base font-700 text-surface-900 dark:text-white mb-1">{p.title}</h3>
              <p className="text-sm text-surface-500 mb-3 leading-relaxed">{p.body}</p>
              <div className="flex items-center gap-3 text-xs text-surface-400 mb-3">
                <button onClick={() => likePost(p._id)} className="flex items-center gap-1 hover:text-navy-600 transition-colors"><ThumbsUp size={12}/> {p.likes||0}</button>
                <span>{p.replies?.length||0} replies</span>
              </div>
              {p.replies?.slice(-2).map((r,i) => (
                <div key={i} className="pl-4 border-l-2 border-surface-200 dark:border-surface-700 text-xs text-surface-500 mb-1.5">
                  <span className="font-medium text-surface-700 dark:text-surface-300">{r.userId?.name||'User'}: </span>{r.content}
                </div>
              ))}
              <div className="flex gap-2 mt-3">
                <input value={reply[p._id]||''} onChange={e => setReply({...reply,[p._id]:e.target.value})} placeholder="Write a reply..." className="input text-xs py-1.5 flex-1"/>
                <button onClick={() => replyPost(p._id)} className="btn-primary px-3 py-1.5 text-xs"><Send size={12}/></button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <div className="card p-10 text-center"><MessageSquare size={36} className="text-surface-300 mx-auto mb-2"/><p className="text-surface-400 text-sm">No posts yet. Be the first to start a discussion!</p></div>}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="card p-5">
          <h3 className="font-display text-base font-700 text-surface-900 dark:text-white mb-4">Top students</h3>
          <div className="space-y-3">
            {leaders.map((u,i) => (
              <div key={u._id} className={clsx('flex items-center gap-3 p-3 rounded-xl', i<3?'bg-gradient-to-r from-amber-50 dark:from-amber-900/20 to-transparent':'bg-surface-50 dark:bg-surface-800')}>
                <span className={clsx('font-display text-lg font-700 w-7 text-center', i===0?'text-amber-500':i===1?'text-surface-400':i===2?'text-amber-700':'text-surface-300')}>
                  {i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}
                </span>
                {u.avatar ? <img src={u.avatar} className="w-9 h-9 rounded-full object-cover" alt={u.name}/> :
                  <div className="w-9 h-9 rounded-full gradient-brand-bg flex items-center justify-center text-white text-sm font-700">{u.name?.charAt(0)}</div>}
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{u.name} {u._id===user?._id&&<span className="text-navy-600 text-xs">(you)</span>}</p>
                  <p className="text-xs text-surface-400">{u.skills?.length||0} skills · {u.profileCompletionScore||0}% profile</p>
                </div>
                <span className="text-xs font-600 text-amber-500">🔥 {u.streak?.longest||0}d</span>
              </div>
            ))}
            {leaders.length === 0 && <p className="text-surface-400 text-sm text-center">No data yet. Complete assessments to appear here!</p>}
          </div>
        </div>
      )}

      {/* New post modal */}
      {newPost.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card p-6 w-full max-w-lg">
            <h3 className="font-display text-lg font-700 text-surface-900 dark:text-white mb-4">Create a post</h3>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium mb-1.5">Title</label><input value={newPost.title} onChange={e=>setNewPost({...newPost,title:e.target.value})} placeholder="What's on your mind?" className="input"/></div>
              <div><label className="block text-sm font-medium mb-1.5">Domain</label>
                <select value={newPost.domain} onChange={e=>setNewPost({...newPost,domain:e.target.value})} className="input">
                  {['General','DSA','Web Development','Machine Learning','Career Advice','Resume','Interview'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1.5">Body</label><textarea value={newPost.body} onChange={e=>setNewPost({...newPost,body:e.target.value})} rows={4} placeholder="Write your post..." className="input resize-none"/></div>
              <div className="flex gap-2">
                <button onClick={() => setNewPost({...newPost,show:false})} className="flex-1 btn-outline py-2.5">Cancel</button>
                <button onClick={createPost} className="flex-1 btn-primary py-2.5">Post</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
