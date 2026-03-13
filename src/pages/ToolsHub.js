import { useNavigate } from 'react-router-dom';

const TOOLS = [
  {
    slug: '/reportgen',
    icon: '📊',
    name: 'Report Generator',
    desc: 'Paste pivot data from Google Sheets. Auto-calculates Window Expired, tracks cumulative stats, color-codes by team average.',
    tag: 'Sales Ops',
    status: 'live',
  },
  {
    slug: 'https://www.scalerincentives.xyz/',
    icon: '💰',
    name: 'Incentive Calculator',
    desc: 'Calculate individual and team incentives based on performance tiers, sales targets, and custom payout structures.',
    tag: 'Finance',
    status: 'live',
    external: true,
  },
  {
    slug: '/resume',
    icon: '📄',
    name: 'Resume Generator',
    desc: '5 profiles × 5 ATS-approved templates. Fill in your details, preview instantly, download as PDF. No AI — just clean formatting.',
    tag: 'Career',
    status: 'live',
  },
  // Add more tools here as you build them
];

export default function ToolsHub() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0e1a0e', fontFamily: "'Georgia', serif", color: '#d4eab8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .tool-card {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 28px;
          cursor: pointer;
          transition: all 0.22s;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }
        .tool-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #f5a623, #e8831a);
          opacity: 0;
          transition: opacity 0.22s;
        }
        .tool-card:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(245,166,35,0.4);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .tool-card:hover::before { opacity: 1; }

        .live-dot {
          display: inline-block;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px #4ade80;
          animation: blink 2s infinite;
          margin-right: 5px;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .launch-btn {
          margin-top: auto;
          background: linear-gradient(135deg, #f5a623, #e8831a);
          color: #1a1a1a;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-family: 'Oswald', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.18s;
          align-self: flex-start;
        }
        .launch-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(245,166,35,0.45);
        }

        @media (max-width: 640px) {
          .tools-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg, #071407 0%, #0d2a0d 100%)', borderBottom: '3px solid #f5a623', padding: '0 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 4, height: 40, background: '#f5a623', borderRadius: 2 }} />
            <div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: '#f5a623', letterSpacing: '0.1em' }}>
                TOOLS.NILARGHA.WORK
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#5a8a42', marginTop: 3, letterSpacing: '0.08em' }}>
                PRODUCTIVITY TOOLS FOR SALES TEAMS
              </div>
            </div>
          </div>
          <a href="https://nilargha.work" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#5a8a42', textDecoration: 'none', letterSpacing: '0.06em' }}>
            ← nilargha.work
          </a>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 40px 40px' }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#4a7a32', letterSpacing: '0.15em', marginBottom: 12 }}>
          <span className="live-dot" /> {TOOLS.filter(t => t.status === 'live').length} TOOLS LIVE
        </div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 42, fontWeight: 700, color: '#a8d878', letterSpacing: '0.04em', lineHeight: 1.1, marginBottom: 14 }}>
          THE TOOLBOX
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#6a9a52', maxWidth: 480, lineHeight: 1.7 }}>
          Internal tools built to cut manual work for sales teams. Paste your data, get your report.
        </div>
      </div>

      {/* Tool Cards */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px 80px' }}>
        <div className="tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {TOOLS.map(tool => (
            <div key={tool.slug} className="tool-card" onClick={() => tool.external ? window.open(tool.slug, '_blank') : navigate(tool.slug)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 36, lineHeight: 1 }}>{tool.icon}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#4a7a32', background: 'rgba(74,122,50,0.15)', padding: '3px 8px', borderRadius: 4, letterSpacing: '0.06em' }}>
                    {tool.tag}
                  </span>
                  {tool.status === 'live' && (
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#4ade80', letterSpacing: '0.06em' }}>
                      <span className="live-dot" />LIVE
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700, color: '#d4eab8', letterSpacing: '0.04em' }}>
                {tool.name}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#6a9a52', lineHeight: 1.7 }}>
                {tool.desc}
              </div>
              <button className="launch-btn" onClick={(e) => { e.stopPropagation(); tool.external ? window.open(tool.slug, '_blank') : navigate(tool.slug); }}>
                LAUNCH TOOL →
              </button>
            </div>
          ))}

          {/* Coming Soon placeholder */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1.5px dashed rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.5 }}>
            <div style={{ fontSize: 36 }}>🔧</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, color: '#5a7a42', letterSpacing: '0.04em' }}>MORE COMING SOON</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#3a5a28', lineHeight: 1.7 }}>
              Got a tool idea? Build it and add it here.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '24px 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#3a5a28', letterSpacing: '0.08em' }}>
          BUILT BY <a href="https://nilargha.work" style={{ color: '#5a8a42', textDecoration: 'none' }}>NILARGHA</a> · TOOLS.NILARGHA.WORK
        </div>
      </div>
    </div>
  );
}
