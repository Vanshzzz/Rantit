'use client'

const TAG_COLORS = {
  Windows:'#0078d4', JavaScript:'#c9a80a', Apple:'#aaa',
  Cloud:'#0ea5e9', Git:'#f05032', Android:'#3ddc84',
  Linux:'#e8651a', Gaming:'#8b5cf6', AI:'#ec4899', Other:'#6b7280',
}
const TRENDING = [
  { tag:'Windows', count:'4.2k rants' },
  { tag:'JavaScript', count:'3.8k rants' },
  { tag:'Apple', count:'3.1k rants' },
  { tag:'Git', count:'2.9k rants' },
  { tag:'Cloud', count:'1.7k rants' },
]
const RULES = [
  'Tech rage only — no personal attacks',
  'One account per human (yes we can tell)',
  'Title your pain clearly',
  'No doxxing or illegal content',
  'Upvote rants that hit different',
]

export default function Sidebar({ rantCount, totalVotes, activeTag, onTagChange, onPostOpen }) {
  return (
    <aside className="sidebar-col">
      <div className="s-card">
        <div style={{ height:'56px', background:'linear-gradient(135deg, var(--orange) 0%, var(--orange2) 100%)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(0,0,0,0.06) 8px,rgba(0,0,0,0.06) 16px)' }}/>
        </div>
        <div style={{ padding:'10px 12px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'-22px', marginBottom:'8px' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'var(--orange)', border:'3px solid var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'900', color:'#fff' }}>R!</div>
          </div>
          <div style={{ fontWeight:'700', fontSize:'14px', marginBottom:'4px' }}>r/rantit</div>
          <p style={{ fontSize:'12px', color:'var(--text2)', lineHeight:'1.5', marginBottom:'10px' }}>
            The internet screaming room for tech horrors. Post your rage. Be heard.
          </p>
          <div style={{ display:'flex', gap:'20px', marginBottom:'12px' }}>
            <div>
              <div style={{ fontWeight:'700', fontSize:'14px' }}>{totalVotes >= 1000 ? `${(totalVotes/1000).toFixed(1)}k` : totalVotes}</div>
              <div style={{ fontSize:'11px', color:'var(--text2)' }}>Rage Votes</div>
            </div>
            <div>
              <div style={{ fontWeight:'700', fontSize:'14px' }}>{rantCount}</div>
              <div style={{ fontSize:'11px', color:'var(--text2)' }}>Rants</div>
            </div>
            <div>
              <div style={{ fontWeight:'700', fontSize:'13px', color:'var(--green)' }}>● Online</div>
              <div style={{ fontSize:'11px', color:'var(--text2)' }}>Always angry</div>
            </div>
          </div>
          <button className="btn-solid btn-full" onClick={onPostOpen}>Create Rant</button>
        </div>
      </div>

      <div className="s-card s-card-pad">
        <div className="s-title">🔥 TRENDING</div>
        {TRENDING.map((t, i) => {
          const tc = TAG_COLORS[t.tag] || 'var(--orange)'
          return (
            <div key={t.tag} onClick={() => onTagChange(t.tag)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 6px', borderRadius:'var(--radius)', cursor:'pointer', transition:'background 0.15s', background: activeTag === t.tag ? 'var(--bg3)' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'11px', color:'var(--text3)', width:'14px' }}>#{i+1}</span>
                <span style={{ fontSize:'12px', padding:'2px 8px', borderRadius:'3px', background:`${tc}18`, color:tc, fontWeight:'600' }}>{t.tag}</span>
              </div>
              <span style={{ fontSize:'11px', color:'var(--text3)' }}>{t.count}</span>
            </div>
          )
        })}
      </div>

      <div className="s-card s-card-pad">
        <div className="s-title">📋 RANTIT RULES</div>
        {RULES.map((rule, i) => (
          <div key={i} style={{ display:'flex', gap:'8px', padding:'7px 0', borderBottom: i < RULES.length - 1 ? '1px solid var(--border2)' : 'none', fontSize:'12px', color:'var(--text2)', lineHeight:'1.4' }}>
            <span style={{ color:'var(--orange)', fontWeight:'700', flexShrink:0 }}>{i+1}.</span>
            {rule}
          </div>
        ))}
      </div>

      <div className="s-card" style={{ border:'1px dashed var(--border2)' }}>
        <div style={{ padding:'16px 12px', textAlign:'center' }}>
          <div style={{ fontSize:'10px', color:'var(--text3)', marginBottom:'8px', letterSpacing:'1px' }}>ADVERTISEMENT</div>
          <div style={{ height:'90px', background:'var(--bg3)', borderRadius:'var(--radius)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:'var(--border)' }}>
            Carbon Ads will live here 🤝
          </div>
        </div>
      </div>
    </aside>
  )
}
