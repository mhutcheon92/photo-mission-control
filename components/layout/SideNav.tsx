'use client'

import { useEffect } from 'react'

const NAV_ITEMS = [
  { id: 'brief', label: 'Brief' },
  { id: 'missions', label: 'Stills Missions' },
  { id: 'shots', label: 'Shot List' },
  { id: 'light', label: 'Light Strategy' },
  { id: 'gear', label: 'Gear Plan' },
  { id: 'locations', label: 'Locations' },
  { id: 'workflow', label: 'On-Set Monitoring' },
  { id: 'competitive', label: 'Competitive' },
  { id: 'openitems', label: 'Open Items' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'checklist', label: 'Checklist' },
]

interface SideNavProps {
  active: string
  onSelect: (id: string) => void
}

export default function SideNav({ active, onSelect }: SideNavProps) {
  useEffect(() => {
    const btn = document.querySelector<HTMLElement>(`[data-nav-id="${active}"]`)
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [active])

  return (
    <>
      {/* Desktop side nav */}
      <nav
        className="hidden-mobile"
        style={{
          width: 220, flexShrink: 0, position: 'sticky', top: 56,
          height: 'calc(100vh - 56px)', overflowY: 'auto',
          borderRight: '1px solid rgba(74,66,60,0.6)',
          padding: '24px 0',
        }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 20px',
                background: isActive ? 'var(--accent-light)' : 'none',
                border: 'none', cursor: 'pointer',
                color: isActive ? 'var(--gold)' : 'var(--text-2)',
                fontSize: 13, textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'background .15s, color .15s',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: isActive ? 'var(--gold)' : 'transparent',
                  border: isActive ? 'none' : '1px solid var(--text-3)',
                }}
              />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Mobile horizontal nav — pill row with fade affordance */}
      <div className="show-mobile mobile-nav-wrap" style={{ position: 'relative', width: '100%' }}>
        <nav
          className="mobile-nav-scroll"
          style={{
            display: 'flex', overflowX: 'auto', gap: 6,
            padding: '10px 16px', borderBottom: '1px solid rgba(74,66,60,0.6)',
            scrollbarWidth: 'none',
          }}
        >
          {NAV_ITEMS.map(item => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                data-nav-id={item.id}
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  padding: '10px 16px', flexShrink: 0,
                  background: isActive ? 'var(--accent-light)' : 'var(--surface)',
                  border: `1px solid ${isActive ? 'rgba(200,169,110,0.5)' : 'var(--border)'}`,
                  color: isActive ? 'var(--gold)' : 'var(--text-2)',
                  fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
        <div
          aria-hidden
          className="mobile-nav-fade-left"
          style={{
            position: 'absolute', top: 0, bottom: 0, left: 0, width: 24,
            background: 'linear-gradient(to right, var(--bg), transparent)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          className="mobile-nav-fade-right"
          style={{
            position: 'absolute', top: 0, bottom: 0, right: 0, width: 24,
            background: 'linear-gradient(to left, var(--bg), transparent)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <style>{`
        .mobile-nav-scroll::-webkit-scrollbar { display: none; }
        @media (min-width: 768px) {
          .hidden-mobile { display: block !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .project-layout { flex-direction: column !important; }
          .project-layout .show-mobile { width: 100%; border-right: none; }
        }
      `}</style>
    </>
  )
}
