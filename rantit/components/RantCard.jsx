'use client'
import { useState } from 'react'
import Link from 'next/link'

const RAGE_EMOJI = ['😐','😤','😠','🤬','💀']
const TAG_COLORS = {
  Windows:'#0078d4', JavaScript:'#c9a80a', Apple:'#aaa',
  Cloud:'#0ea5e9', Git:'#f05032', Android:'#3ddc84',
  Linux:'#e8651a', Gaming:'#8b5cf6', AI:'#ec4899', Other:'#6b7280',
}
const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n)

export default function RantCard({ rant, user, onVote, saved, onSave, onAuthOpen, index = 0 }) {
  const [expanded, setExpanded] = useState(false)
  const tc = TAG_COLORS[rant.tag] || 'var(--orange)'

  const handleVote = (dir, e) => {
    e.stopPropagation()
    if (!user) { onAuthOpen('login'); return }
    onVote(rant.id, dir)
  }

  const handleSave = (e) => {
    e.stopPropagation()
    if (!user) { onAuthOpen('login'); return }
    onSave(rant.id)
  }

  return (
    <div
      className={`rant-card fade-up ${expanded ? 'expanded' : ''}`}
      style={{ animationDelay:`${index * 0.04}s` }}
      onClick={() => setExpanded(v => !v)}
    >
      <div className="vote-col">
        <button className={`vote-btn up ${rant.userVote === 'up' ? 'active' : ''}`} onClick={e => handleVote('up', e)}>▲</button>
        <span className={`vote-count ${rant.userVote === 'up' ? 'up' : rant.userVote === 'down' ? 'down' : ''}`}>
          {fmt(rant.upvotes)}
        </span>
        <button className={`vote-btn down ${rant.userVote === 'down' ? 'active' : ''}`} onClick={e => handleVote('down', e)}>▼</button>
      </div>

      <div style={{ flex:1, padding:'10px 12px', minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginBottom:'5px' }}>
          <div style={{
            width:'18px', height:'18px', borderRadius:'50%',
            background: rant.avatarColor || 'var(--orange)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'9px', fontWeight:'800', color:'#fff', flexShrink:0,
          }}>{rant.username?.[0]?.toUpperCase() || '?'}</div>
          <span style={{ fontSize:'12px', color:'var(--text2)' }}>
            <span style={{ color:'var(--orange)', fontWeight:'600' }}>r/{rant.tag?.toLowerCase()}</span>
            {' · u/'}{rant.username || 'anonymous'}
          </span>
          <span style={{ fontSize:'11px', color:'var(--text3)', flexShrink:0 }}>{rant.timeAgo}</span>
          <span className="tag-badge" style={{ marginLeft:'auto', background:`${tc}18`, color:tc, border:`1px solid ${tc}30` }}>
            {rant.tag}
          </span>
        </div>

        <div style={{ fontSize:'17px', fontWeight:'600', lineHeight:'1.35', color:'var(--text)', marginBottom:'8px' }}>
          {rant.title}
        </div>

        {expanded && <div className="expanded-body">{rant.body}</div>}

        <div className="action-row">
          <Link
            href={`/r/${rant.id}`}
            onClick={e => e.stopPropagation()}
            style={{ background:'none', border:'none', color:'var(--text2)', padding:'5px 8px', borderRadius:'2px', fontSize:'12px', fontWeight:'600', display:'flex', alignItems:'center', gap:'4px' }}
          >
            💬 {fmt(rant.comment_count || 0)} Comments
          </Link>
          <button className={`action-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
            {saved ? '🔖 Saved' : '🔖 Save'}
          </button>
          <button className="action-btn" onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(`${window.location.origin}/r/${rant.id}`) }}>
            ↗ Share
          </button>
          <span style={{ marginLeft:'4px', fontSize:'14px' }} title={`Rage ${rant.rage}/5`}>
            {RAGE_EMOJI[(rant.rage || 1) - 1]}
          </span>
          {!expanded && <span style={{ fontSize:'11px', color:'var(--text3)', marginLeft:'4px' }}>click to read →</span>}
        </div>
      </div>
    </div>
  )
}
