'use client'

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
  return (
    <>
      {/* Desktop side nav */}
      <nav style={{
        width: 200, flexShrink: 0, position: 'sticky', top: 52,
        height: 'calc(100vh - 52px)', overflowY: 'auto',
        borderRight: '1px solid var(--border)',
        padding: '24px 0',
      }} className="hidden-mobile">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '8px 20px',
                background: isActive ? 'var(--red-light)' : 'none',
                border: 'none', cursor: 'pointer',
                color: isActive ? 'var(--text)' : 'var(--text-2)',
                fontSize: 13, textAlign: 'left',
                transition: 'background .15s',
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: isActive ? 'var(--red)' : 'transparent',
                border: isActive ? 'none' : '1px solid var(--text-3)',
              }} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Mobile horizontal nav */}
      <nav style={{
        display: 'flex', overflowX: 'auto', gap: 4,
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        scrollbarWidth: 'none',
      }} className="show-mobile">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                padding: '6px 14px', borderRadius: 20, flexShrink: 0,
                background: isActive ? 'var(--red-light)' : 'var(--bg3)',
                border: `1px solid ${isActive ? 'rgba(200,169,110,0.4)' : 'var(--border)'}`,
                color: isActive ? 'var(--accent)' : 'var(--text-2)',
                fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: block !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .project-layout { flex-direction: column !important; }
          .project-layout .show-mobile { width: 100%; border-right: none; border-bottom: 1px solid var(--border); }
        }
      `}</style>
    </>
  )
}
