'use client'
import { useState } from 'react'
import { signUp, signIn, createProfile, usernameExists, getProfile } from '@/lib/supabase'

export default function AuthModal({ mode: initMode = 'login', onClose, onAuthed }) {
  const [mode, setMode]       = useState(initMode)
  const [step, setStep]       = useState('form')
  const [form, setForm]       = useState({ email:'', password:'', username:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const f = (k, v) => setForm(p => ({...p, [k]:v}))

  const handleSubmit = async () => {
    setError('')
    if (!form.email.trim() || !form.password.trim()) { setError('Email and password are required.'); return }
    setLoading(true)

    if (mode === 'signup') {
      if (step === 'form') { setLoading(false); setStep('pick_username'); return }

      if (!form.username.trim()) { setError('Pick a username.'); setLoading(false); return }
      const taken = await usernameExists(form.username.trim())
      if (taken) { setError('That username is taken. Try another.'); setLoading(false); return }

      const { data, error } = await signUp(form.email, form.password)
      if (error) { setError(error.message); setLoading(false); return }

      const { error: profileError } = await createProfile(data.user.id, form.username.trim())
      if (profileError) { setError(profileError.message); setLoading(false); return }

      setLoading(false)
      onAuthed({ id: data.user.id, email: form.email, username: form.username.trim() })
      onClose()
    } else {
      const { data, error } = await signIn(form.email, form.password)
      if (error) { setError('Invalid email or password.'); setLoading(false); return }

      const { data: profile } = await getProfile(data.user.id)
      setLoading(false)
      onAuthed({ id: data.user.id, email: form.email, username: profile?.username || '' })
      onClose()
    }
  }

  return (
    <div className="backdrop" onClick={e => { if (e.target === e.currentTarget) { onClose(); setStep('form') } }}>
      <div className="modal modal-sm fade-up">
        {step === 'pick_username' ? (
          <>
            <div className="modal-header">
              <span className="modal-title">Pick your handle</span>
              <button className="close-btn" onClick={() => { setStep('form'); onClose() }}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'16px', lineHeight:'1.5' }}>
                This is <strong style={{ color:'var(--orange)' }}>permanent</strong> — stuck with it forever. Choose wisely.
              </p>
              <input
                placeholder="your_rage_username"
                value={form.username}
                onChange={e => f('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))}
                style={{ padding:'11px 12px', marginBottom:'10px', width:'100%' }}
                maxLength={30}
              />
              <p style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'12px' }}>Lowercase, numbers, underscores only. Max 30 chars.</p>
              {error && <div style={{ fontSize:'13px', color:'#c0392b', marginBottom:'10px' }}>{error}</div>}
              <button className="btn-submit btn-full" onClick={handleSubmit} disabled={!form.username.trim() || loading}>
                {loading ? 'Creating account...' : 'Claim Username 🔥'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ paddingTop:'4px' }}>
              <div className="auth-tabs">
                <button className={`auth-tab ${mode==='login'?'active':''}`} onClick={() => { setMode('login'); setError('') }}>Log In</button>
                <button className={`auth-tab ${mode==='signup'?'active':''}`} onClick={() => { setMode('signup'); setError('') }}>Sign Up</button>
              </div>
            </div>
            <div className="modal-body" style={{ paddingTop:'4px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <input type="email" placeholder="Email address" value={form.email} onChange={e => f('email', e.target.value)} style={{ padding:'11px 12px' }} />
                <input type="password" placeholder="Password" value={form.password} onChange={e => f('password', e.target.value)} style={{ padding:'11px 12px' }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                {error && <div style={{ fontSize:'13px', color:'#c0392b', padding:'8px 12px', background:'#c039191a', borderRadius:'4px' }}>{error}</div>}
                <button className="btn-submit btn-full" onClick={handleSubmit} disabled={!form.email.trim() || !form.password.trim() || loading}>
                  {loading ? '...' : mode === 'login' ? 'Log In' : 'Continue →'}
                </button>
                <p style={{ textAlign:'center', fontSize:'12px', color:'var(--text3)', marginTop:'4px' }}>
                  {mode === 'login' ? 'New here? ' : 'Already ranting? '}
                  <span style={{ color:'var(--orange)', cursor:'pointer', fontWeight:'600' }} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>
                    {mode === 'login' ? 'Sign up' : 'Log in'}
                  </span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
