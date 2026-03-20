'use client'
import { useState } from 'react'
import Link from 'next/link'
import { signOut } from '@/lib/supabase'

export default function Navbar({ user, onAuthOpen, onPostOpen, search, onSearch }) {
  const [userMenu, setUserMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    window.location.reload()
  }

  return (
    <nav className="nav">
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
        <div style={{
          width:'32px', height:'32px', borderRadius:'50%',
          background:'var(--orange)', display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:'16px', fontWeight:'900', color:'#fff',
        }}>R</div>
        <span style={{ fontWeight:'700', fontSize:'18px', color:'var(--text)' }}>
          rant<span style={{ color:'var(--orange)' }}>it</span>
        </span>
      </Link>

      <div className="nav-search" style={{ flex:1, position:'relative', maxWidth:'600px' }}>
        <span style={{
          position:'absolute', left:'10px', top:'50%',
          transform:'translateY(-50%)', color:'var(--text3)', fontSize:'13px', pointerEvents:'none',
        }}>🔍</span>
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search rants..."
          style={{ width:'100%', padding:'7px 14px 7px 30px', borderRadius:'20px' }}
        />
      </div>

      <div style={{ marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center', flexShrink:0 }}>
        {user ? (
          <div style={{ position:'relative' }}>
            <div
              onClick={() => setUserMenu(v => !v)}
              style={{
                width:'32px', height:'32px', borderRadius:'50%',
                background:'var(--border)', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:'13px', fontWeight:'700',
                color:'var(--orange)', cursor:'pointer', border:'1px solid #444',
                userSelect:'none', flexShrink:0,
              }}
            >
              {user.username?.[0]?.toUpperCase() || '?'}
            </div>

            {userMenu && (
              <div style={{
                position:'absolute', right:0, top:'40px',
                background:'var(--bg2)', border:'1px solid var(--border)',
                borderRadius:'var(--radius-lg)', width:'180px',
                boxShadow:'0 8px 24px rgba(0,0,0,0.4)', zIndex:99, overflow:'hidden',
              }}>
                <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', fontSize:'13px', color:'var(--text2)' }}>
                  u/{user.username}
                </div>
                <button
                  onClick={() => { onPostOpen(); setUserMenu(false) }}
                  style={{ width:'100%', background:'none', border:'none', textAlign:'left', padding:'10px 14px', color:'var(--text)', fontSize:'13px' }}
                >✏️ Post a Rant</button>
                <button
                  onClick={handleSignOut}
                  style={{ width:'100%', background:'none', border:'none', textAlign:'left', padding:'10px 14px', color:'#c0392b', fontSize:'13px' }}
                >🚪 Log Out</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button className="btn-outline" onClick={() => onAuthOpen('login')}>Log In</button>
            <button className="btn-solid"   onClick={() => onAuthOpen('signup')}>Sign Up</button>
          </>
        )}
        {user && (
          <button className="btn-solid hide-mobile" onClick={onPostOpen}>+ Post</button>
        )}
      </div>
    </nav>
  )
}
