'use client'

import Link from 'next/link'

interface HeaderProps {
  campaignName?: string
  shootDate?: string
  onExportHTML?: () => void
  onExportMarkdown?: () => void
  onShare?: () => void
}

export default function Header({ campaignName, shootDate, onExportHTML, onExportMarkdown, onShare }: HeaderProps) {
  return (
    <>
    <style>{`
      @media (max-width: 767px) {
        .header-date, .header-badge, .header-campaign, .header-sep { display: none; }
        .main-content { padding: 24px 16px !important; }
      }
    `}</style>
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: 52,
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <span style={{
          fontFamily: 'var(--font-serif, Cormorant Garamond, serif)',
          fontSize: '1.1rem', fontWeight: 400, letterSpacing: '0.08em',
          color: 'var(--text-2)',
        }}>
          Michael Hutcheon
        </span>
      </Link>

      {campaignName && (
        <>
          <span className="header-sep" style={{ color: 'var(--border-med)', fontSize: 16 }}>/</span>
          <span className="header-campaign" style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {campaignName}
          </span>
          {shootDate && (
            <span className="header-date" style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>{shootDate}</span>
          )}
          <span className="header-badge" style={{ fontSize: 10, letterSpacing: '.08em', background: 'var(--red-light)', color: 'var(--red)', border: '1px solid rgba(200,169,110,0.3)', padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>
            PRE-PRODUCTION
          </span>
        </>
      )}

      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
        {onShare && (
          <button
            onClick={onShare}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 6,
              background: 'var(--bg3)', border: '1px solid var(--border)',
              color: 'var(--text-2)', fontSize: 12, cursor: 'pointer',
            }}
          >
            Share
          </button>
        )}

        {(onExportHTML || onExportMarkdown) && (
          <div style={{ position: 'relative' }} className="export-menu">
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 6,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text-2)', fontSize: 12, cursor: 'pointer',
              }}
              onClick={() => {
                const menu = document.getElementById('export-dropdown')
                if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none'
              }}
            >
              Export ▾
            </button>
            <div
              id="export-dropdown"
              style={{
                display: 'none', position: 'absolute', right: 0, top: '100%', marginTop: 4,
                background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                overflow: 'hidden', minWidth: 180, zIndex: 200,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {onExportHTML && (
                <button onClick={() => { onExportHTML(); const m = document.getElementById('export-dropdown'); if (m) m.style.display = 'none' }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg4)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  Download HTML
                </button>
              )}
              {onExportMarkdown && (
                <button onClick={() => { onExportMarkdown(); const m = document.getElementById('export-dropdown'); if (m) m.style.display = 'none' }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg4)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  Download Markdown
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
    </>
  )
}
