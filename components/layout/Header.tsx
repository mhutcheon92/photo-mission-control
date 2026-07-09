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
      }
      .header-menu-item:hover { background: var(--bg4); }
    `}</style>
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--bg)',
      borderBottom: '1px solid rgba(74,66,60,0.6)',
      padding: '0 24px',
      height: 56,
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--font-serif, Cormorant Garamond, serif)',
          fontSize: '1.15rem', fontWeight: 500, letterSpacing: '.02em',
          color: 'var(--text)',
        }}>
          Photo Mission Control
        </span>
      </Link>

      {campaignName && (
        <>
          <span className="header-sep" aria-hidden style={{ color: 'var(--border-med)', fontSize: 16 }}>/</span>
          <span className="header-campaign" style={{ color: 'var(--text-2)', fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {campaignName}
          </span>
          {shootDate && (
            <span className="header-date" style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>{shootDate}</span>
          )}
          <span
            className="header-badge"
            style={{
              fontSize: 11, letterSpacing: '.08em',
              background: 'var(--accent-light)', color: 'var(--gold)',
              border: '1px solid rgba(200,169,110,0.35)',
              padding: '3px 10px', flexShrink: 0, textTransform: 'uppercase',
            }}
          >
            Pre-Production
          </span>
        </>
      )}

      <div style={{ display: 'flex', gap: 8, marginLeft: campaignName ? 0 : 'auto', flexShrink: 0 }}>
        {onShare && (
          <button
            onClick={onShare}
            aria-label="Share project"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px',
              background: 'var(--surface)', border: '1px solid var(--border-med)',
              color: 'var(--text-2)', fontSize: 12, cursor: 'pointer',
            }}
          >
            Share
          </button>
        )}

        {(onExportHTML || onExportMarkdown) && (
          <div style={{ position: 'relative' }} className="export-menu">
            <button
              aria-label="Export project"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px',
                background: 'var(--surface)', border: '1px solid var(--border-med)',
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
                background: 'var(--surface)', border: '1px solid var(--border-med)',
                overflow: 'hidden', minWidth: 'min(220px, calc(100vw - 32px))', zIndex: 200,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              {onExportHTML && (
                <button
                  className="header-menu-item"
                  onClick={() => { onExportHTML(); const m = document.getElementById('export-dropdown'); if (m) m.style.display = 'none' }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Download HTML
                </button>
              )}
              {onExportMarkdown && (
                <button
                  className="header-menu-item"
                  onClick={() => { onExportMarkdown(); const m = document.getElementById('export-dropdown'); if (m) m.style.display = 'none' }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                >
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
