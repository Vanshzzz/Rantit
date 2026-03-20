'use client'
import { useState } from 'react'
import { createRant } from '@/lib/supabase'

const POST_TAGS = ['Windows','JavaScript','Apple','Cloud','Git','Android','Linux','Gaming','AI','Other']
const TAG_COLORS = {
  Windows:'#0078d4', JavaScript:'#c9a80a', Apple:'#aaa',
  Cloud:'#0ea5e9', Git:'#f05032', Android:'#3ddc84',
  Linux:'#e8651a', Gaming:'#8b5cf6', AI:'#ec4899', Other:'#6b7280',
}

export default function PostModal({ user, onClose, onPosted }) {
  const [form, setForm]       = useState({ title:'', body:'', tag:'Windows' })
  const [loading, setLoading] = useState(false)
  const [posted, setPosted]   = useState(false)
  const [error, setError]     = useState('')

  const rage = Math.min(5, Math.max(1, Math.ceil(form.body.length / 80)))
  const canPost = form.title.trim() && form.body.trim()

  const handlePost = async () => {
    if (!canPost || loading) return
    setLoading(true)
    setError('')
    const { data, error } = await createRant({
      userId: user.id, username: user.username,
      title: form.title.trim(), body: form.body.trim(),
      tag: form.tag, rage,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setPosted(true)
    setTimeout(() => { onClose(); onPosted(data) }, 1400)
  }

  return (
    <div className="backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal fade-up">
        <div className="modal-header">
          <span className="modal-title">Create a Rant</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {posted ? (
          <div style={{ padding:'48px 20px', textAlign:'center' }}>
            <div style={{ fontSize:'44px', marginBottom:'12px' }}>😤</div>
            <div style={{ fontWeight:'700', color:'var(--orange)', fontSize:'16px' }}>Rant posted.</div>
            <div style={{ color:'var(--text3)', fontSize:'13px', marginTop:'4px' }}>The internet now knows your pain.</div>
          </div>
        ) : (
          <div className="modal-body">
            <div style={{ marginBottom:'14px' }}>
              <div style={{ fontSize:'12px', color:'var(--text2)', marginBottom:'8px', fontWeight:'600', letterSpacing:'0.5px' }}>PICK A CATEGORY</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {POST_TAGS.map(t => {
                  const tc = TAG_COLORS[t] || 'var(--orange)'
                  const active = form.tag === t
                  return (
                    <button key={t} onClick={() => setForm(f => ({...f, tag:t}))} style={{ background: active ? `${tc}22` : 'var(--bg2)', border: active ? `1px solid ${tc}88` : '1px solid var(--border)', color: active ? tc : 'var(--text2)', borderRadius:'20px', padding:'5px 12px', fontSize:'12px', fontWeight: active ? '700' : '400' }}>
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <input
                placeholder="What broke your soul today?"
                value={form.title}
                onChange={e => setForm(f => ({...f, title:e.target.value}))}
                maxLength={200}
                style={{ padding:'11px 12px', fontWeight:'600', fontSize:'15px' }}
              />
              <textarea
                placeholder="Go full rage. Don't hold back. We've all been there."
                value={form.body}
                onChange={e => setForm(f => ({...f, body:e.target.value}))}
                rows={7}
                style={{ padding:'11px 12px', resize:'vertical', lineHeight:'1.7' }}
              />
              {error && <div style={{ fontSize:'13px', color:'#c0392b', padding:'8px 12px', background:'#c039191a', borderRadius:'4px' }}>{error}</div>}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:'12px', color:'var(--text2)', display:'flex', alignItems:'center', gap:'6px' }}>
                  Rage: <span style={{ fontSize:'16px' }}>{'😤'.repeat(rage)}</span>
                </div>
                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                  <span style={{ fontSize:'12px', color:'var(--text3)' }}>{form.title.length}/200</span>
                  <button className="btn-outline" onClick={onClose} style={{ padding:'7px 14px' }}>Cancel</button>
                  <button className="btn-submit" onClick={handlePost} disabled={!canPost || loading} style={{ padding:'8px 18px', borderRadius:'20px' }}>
                    {loading ? 'Posting...' : 'Post Rant 😤'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
