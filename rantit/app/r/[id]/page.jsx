'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AuthModal from '@/components/AuthModal'
import { getRant, getComments, createComment, getSession, getProfile } from '@/lib/supabase'
import { getVoteCount, getUserVote } from '@/lib/upstash'

const RAGE_EMOJI = ['😐','😤','😠','🤬','💀']
const TAG_COLORS = {
  Windows:'#0078d4', JavaScript:'#c9a80a', Apple:'#aaa',
  Cloud:'#0ea5e9', Git:'#f05032', Android:'#3ddc84',
  Linux:'#e8651a', Gaming:'#8b5cf6', AI:'#ec4899', Other:'#6b7280',
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

export default function RantPage() {
  const { id } = useParams()
  const [rant, setRant]             = useState(null)
  const [comments, setComments]     = useState([])
  const [user, setUser]             = useState(null)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting]       = useState(false)
  const [showAuth, setShowAuth]     = useState(false)
  const [authMode, setAuthMode]     = useState('login')
  const [upvotes, setUpvotes]       = useState(0)
  const [userVote, setUserVote]     = useState(null)

  useEffect(() => {
    getSession().then(async session => {
      if (!session) return
      const { data: profile } = await getProfile(session.user.id)
      setUser({ id: session.user.id, email: session.user.email, username: profile?.username || '' })
    })
  }, [])

  useEffect(() => {
    if (!id) return
    Promise.all([getRant(id), getComments(id), getVoteCount(id)]).then(([rantRes, commentsRes, count]) => {
      if (rantRes.data) setRant({ ...rantRes.data, username: rantRes.data.profiles?.username || rantRes.data.username })
      if (commentsRes.data) setComments(commentsRes.data.map(c => ({ ...c, username: c.profiles?.username || c.username })))
      setUpvotes(count)
    })
  }, [id])

  useEffect(() => {
    if (user && id) getUserVote(id, user.id).then(setUserVote)
  }, [user, id])

  const handleVote = async (dir) => {
    if (!user) { setAuthMode('login'); setShowAuth(true); return }
    const wasThis = userVote === dir
    const wasOpp  = userVote === (dir === 'up' ? 'down' : 'up')
    let delta = wasThis ? (dir==='up'?-1:1) : (dir==='up'?1:-1)
    if (wasOpp) delta += dir==='up'?1:-1
    setUpvotes(v => v + delta)
    setUserVote(wasThis ? null : dir)
    await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rantId: id, direction: dir }),
    })
  }

  const handleComment = async () => {
    if (!user) { setAuthMode('login'); setShowAuth(true); return }
    if (!newComment.trim() || posting) return
    setPosting(true)
    const { data, error } = await createComment({ rantId: id, userId: user.id, username: user.username, body: newComment.trim() })
    setPosting(false)
    if (!error && data) {
      setComments(p => [...p, { ...data, username: user.username, timeAgo: 'just now' }])
      setNewComment('')
    }
  }

  if (!rant) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)' }}>
      Loading...
    </div>
  )

  const tc = TAG_COLORS[rant.tag] || 'var(--orange)'

  return (
    <>
      <Navbar user={user} onAuthOpen={(m) => { setAuthMode(m); setShowAuth(true) }} onPostOpen={() => {}} search="" onSearch={() => {}} />

      <div className="rant-page">
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'var(--text2)', marginBottom:'16px' }}>
          ← Back to feed
        </Link>

        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', display:'flex', overflow:'hidden', marginBottom:'20px' }}>
          <div className="vote-col">
            <button className={`vote-btn up ${userVote==='up'?'active':''}`} onClick={() => handleVote('up')}>▲</button>
            <span className={`vote-count ${userVote==='up'?'up':userVote==='down'?'down':''}`}>
              {upvotes >= 1000 ? `${(upvotes/1000).toFixed(1)}k` : upvotes}
            </span>
            <button className={`vote-btn down ${userVote==='down'?'active':''}`} onClick={() => handleVote('down')}>▼</button>
          </div>
          <div style={{ flex:1, padding:'14px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
              <span style={{ fontSize:'12px', color:'var(--text2)' }}>
                <span style={{ color:'var(--orange)', fontWeight:'600' }}>r/{rant.tag?.toLowerCase()}</span>
                {' · u/'}{rant.username}
              </span>
              <span style={{ fontSize:'11px', color:'var(--text3)' }}>{timeAgo(rant.created_at)}</span>
              <span className="tag-badge" style={{ marginLeft:'auto', background:`${tc}18`, color:tc }}>{rant.tag}</span>
            </div>
            <h1 style={{ fontSize:'20px', fontWeight:'700', lineHeight:'1.35', marginBottom:'12px', color:'var(--text)' }}>
              {rant.title}
            </h1>
            <div className="rant-full-body">{rant.body}</div>
            <div style={{ fontSize:'13px', color:'var(--text2)', display:'flex', alignItems:'center', gap:'6px' }}>
              Rage: <span style={{ fontSize:'16px' }}>{RAGE_EMOJI[(rant.rage||1)-1]}</span> {rant.rage}/5
            </div>
          </div>
        </div>

        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px', marginBottom:'16px' }}>
          {user ? (
            <>
              <div style={{ fontSize:'12px', color:'var(--text2)', marginBottom:'8px' }}>
                Commenting as <span style={{ color:'var(--orange)', fontWeight:'600' }}>u/{user.username}</span>
              </div>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add your own rage..."
                rows={3}
                style={{ width:'100%', padding:'10px 12px', resize:'vertical', lineHeight:'1.6', marginBottom:'8px' }}
              />
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button className="btn-submit" onClick={handleComment} disabled={!newComment.trim() || posting} style={{ padding:'7px 18px', borderRadius:'20px' }}>
                  {posting ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'12px 0', fontSize:'13px', color:'var(--text2)' }}>
              <button className="btn-solid" onClick={() => { setAuthMode('login'); setShowAuth(true) }} style={{ marginRight:'8px' }}>Log in</button>
              or
              <button className="btn-outline" onClick={() => { setAuthMode('signup'); setShowAuth(true) }} style={{ marginLeft:'8px' }}>Sign up</button>
              {' '}to comment
            </div>
          )}
        </div>

        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px' }}>
          <div style={{ fontWeight:'700', fontSize:'14px', marginBottom:'12px' }}>
            💬 {comments.length} Comment{comments.length !== 1 ? 's' : ''}
          </div>
          {comments.length === 0 && (
            <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text3)', fontSize:'13px' }}>
              No comments yet. Be the first to add your rage.
            </div>
          )}
          {comments.map(c => (
            <div key={c.id} className="comment">
              <div className="comment-meta">
                <span className="uname">u/{c.username}</span>
                <span>{c.timeAgo || timeAgo(c.created_at)}</span>
              </div>
              <div className="comment-body">{c.body}</div>
            </div>
          ))}
        </div>
      </div>

      {showAuth && <AuthModal mode={authMode} onClose={() => setShowAuth(false)} onAuthed={u => { setUser(u); setShowAuth(false) }} />}
    </>
  )
}
