'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar    from '@/components/Navbar'
import RantCard  from '@/components/RantCard'
import Sidebar   from '@/components/Sidebar'
import PostModal from '@/components/PostModal'
import AuthModal from '@/components/AuthModal'
import { getRants, getSession, getProfile } from '@/lib/supabase'
import { getBulkVoteCounts, getUserVote } from '@/lib/upstash'

const TAGS = ['All','Windows','JavaScript','Apple','Cloud','Git','Android','Linux','Gaming','AI','Other']
const TAG_COLORS = {
  Windows:'#0078d4', JavaScript:'#c9a80a', Apple:'#aaa',
  Cloud:'#0ea5e9', Git:'#f05032', Android:'#3ddc84',
  Linux:'#e8651a', Gaming:'#8b5cf6', AI:'#ec4899', Other:'#6b7280',
}
const AV_COLORS = ['#e8651a','#d4a017','#3a8a6e','#8b5cf6','#c0392b','#0ea5e9']

function timeAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

export default function Home() {
  const [rants, setRants]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [user, setUser]           = useState(null)
  const [search, setSearch]       = useState('')
  const [activeTag, setActiveTag] = useState('All')
  const [sort, setSort]           = useState('hot')
  const [saved, setSaved]         = useState([])
  const [showPost, setShowPost]   = useState(false)
  const [showAuth, setShowAuth]   = useState(false)
  const [authMode, setAuthMode]   = useState('login')

  useEffect(() => {
    getSession().then(async session => {
      if (!session) return
      const { data: profile } = await getProfile(session.user.id)
      setUser({ id: session.user.id, email: session.user.email, username: profile?.username || '' })
    })
  }, [])

  const loadRants = useCallback(async () => {
    setLoading(true)
    const { data, error } = await getRants({ tag: activeTag, sort })
    if (error || !data) { setLoading(false); return }

    const ids = data.map(r => r.id)
    const counts = await getBulkVoteCounts(ids)

    let userVotes = {}
    if (user) {
      await Promise.all(ids.map(async id => {
        userVotes[id] = await getUserVote(id, user.id)
      }))
    }

    setRants(data.map(r => ({
      ...r,
      username:    r.profiles?.username || r.username || 'anonymous',
      upvotes:     counts[r.id] ?? r.upvotes ?? 0,
      userVote:    userVotes[r.id] || null,
      timeAgo:     timeAgo(r.created_at),
      avatarColor: AV_COLORS[r.username?.charCodeAt(0) % AV_COLORS.length] || AV_COLORS[0],
    })))
    setLoading(false)
  }, [activeTag, sort, user])

  useEffect(() => { loadRants() }, [loadRants])

  const handleVote = async (rantId, direction) => {
    setRants(prev => prev.map(r => {
      if (r.id !== rantId) return r
      const wasUp = r.userVote === 'up', wasDown = r.userVote === 'down'
      const toggling = r.userVote === direction
      let delta = 0
      if (toggling) { delta = direction === 'up' ? -1 : 1 }
      else {
        if (wasUp)   delta -= 1
        if (wasDown) delta += 1
        delta += direction === 'up' ? 1 : -1
      }
      return { ...r, upvotes: r.upvotes + delta, userVote: toggling ? null : direction }
    }))
    try {
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rantId, direction }),
      })
    } catch { loadRants() }
  }

  const handleSave    = id => setSaved(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const handlePosted  = rant => setRants(p => [{ ...rant, username: user.username, upvotes: 1, userVote: 'up', timeAgo: 'just now', avatarColor: AV_COLORS[user.username?.charCodeAt(0) % AV_COLORS.length] }, ...p])
  const openAuth      = mode => { setAuthMode(mode); setShowAuth(true) }
  const openPost      = () => { if (!user) { openAuth('login'); return } setShowPost(true) }

  const filtered = rants.filter(r =>
    !search ||
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.body?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Navbar user={user} onAuthOpen={openAuth} onPostOpen={openPost} search={search} onSearch={setSearch} />

      <div className="mobile-tags">
        {TAGS.map(t => {
          const tc = TAG_COLORS[t] || 'var(--orange)'
          const active = activeTag === t
          return (
            <button key={t} onClick={() => setActiveTag(t)} style={{ background: active ? `${tc}20` : 'var(--bg3)', border: active ? `1px solid ${tc}66` : '1px solid var(--border)', color: active ? tc : 'var(--text2)', borderRadius:'20px', padding:'5px 12px', fontSize:'12px', fontWeight: active ? '700' : '400', whiteSpace:'nowrap', flexShrink:0 }}>
              {t}
            </button>
          )
        })}
      </div>

      <div className="layout-body">
        <main className="main-feed">
          <div className="sort-bar">
            {[['hot','🔥 Hot'],['new','✨ New'],['rage','😤 Rage']].map(([v,l]) => (
              <button key={v} className={`sort-btn ${sort===v?'active':''}`} onClick={() => setSort(v)}>{l}</button>
            ))}
            <div className="bar-divider"/>
            <div className="tag-wrap hide-mobile">
              {TAGS.map(t => {
                const tc = TAG_COLORS[t] || 'var(--orange)'
                const active = activeTag === t
                return (
                  <button key={t} className={`tag-chip ${active?'active':''}`} onClick={() => setActiveTag(t)} style={{ background: active ? `${tc}20` : 'none', border: active ? `1px solid ${tc}55` : '1px solid transparent', color: active ? tc : 'var(--text2)' }}>
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {loading && <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text3)' }}>Loading rants...</div>}

          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <div className="emoji">🤷</div>
              <p>No rants here. Either everyone is happy or nobody found this tab.</p>
            </div>
          )}

          {!loading && filtered.map((r, i) => (
            <RantCard key={r.id} rant={r} user={user} onVote={handleVote} saved={saved.includes(r.id)} onSave={handleSave} onAuthOpen={openAuth} index={i} />
          ))}
        </main>

        <Sidebar rantCount={rants.length} totalVotes={rants.reduce((a,b) => a + (b.upvotes||0), 0)} activeTag={activeTag} onTagChange={setActiveTag} onPostOpen={openPost} />
      </div>

      {showPost && <PostModal user={user} onClose={() => setShowPost(false)} onPosted={handlePosted} />}
      {showAuth && <AuthModal mode={authMode} onClose={() => setShowAuth(false)} onAuthed={u => { setUser(u); setShowAuth(false) }} />}
    </>
  )
}
