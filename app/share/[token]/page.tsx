'use client'

import { useState, useEffect, use } from 'react'
import { Project } from '@/lib/types'
import Brief from '@/components/sections/Brief'
import StillsMissions from '@/components/sections/StillsMissions'
import ShotList from '@/components/sections/ShotList'
import LightStrategy from '@/components/sections/LightStrategy'
import GearPlan from '@/components/sections/GearPlan'
import Locations from '@/components/sections/Locations'
import C1Workflow from '@/components/sections/C1Workflow'
import Competitive from '@/components/sections/Competitive'
import OpenItems from '@/components/sections/OpenItems'
import Contacts from '@/components/sections/Contacts'
import Checklist from '@/components/sections/Checklist'

const SECTION_LABELS: Record<string, string> = {
  brief: 'Brief',
  missions: 'Stills Missions',
  shots: 'Shot List',
  light: 'Light Strategy',
  gear: 'Gear Plan',
  locations: 'Locations',
  workflow: 'On-Set Monitoring',
  competitive: 'Competitive',
  openitems: 'Open Items',
  contacts: 'Contacts',
  checklist: 'Checklist',
}

const SECTION_ORDER = ['brief', 'missions', 'shots', 'light', 'gear', 'locations', 'workflow', 'competitive', 'openitems', 'contacts', 'checklist']

function noop() {}

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'not-found' : 'error')
        return r.json()
      })
      .then(data => setProject(data.project))
      .catch(err => setError(err.message))
  }, [token])

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 28, marginBottom: 12, color: 'var(--text)' }}>
            {error === 'not-found' ? 'Link not found' : 'Something went wrong'}
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 15 }}>
            {error === 'not-found'
              ? 'This link may have been deactivated or never existed.'
              : 'Could not load the shared project. Try again later.'}
          </p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid var(--border-med)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const visibleSections = SECTION_ORDER.filter(id => (project.sharedSections ?? []).includes(id))
  const sectionProps = { project, onChange: noop }

  const sectionComponents: Record<string, React.ReactNode> = {
    brief: <Brief {...sectionProps} />,
    missions: <StillsMissions {...sectionProps} />,
    shots: <ShotList {...sectionProps} />,
    light: <LightStrategy {...sectionProps} />,
    gear: <GearPlan {...sectionProps} />,
    locations: <Locations {...sectionProps} />,
    workflow: <C1Workflow {...sectionProps} />,
    competitive: <Competitive {...sectionProps} />,
    openitems: <OpenItems {...sectionProps} />,
    contacts: <Contacts {...sectionProps} />,
    checklist: <Checklist {...sectionProps} />,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style>{`
        @media (max-width: 767px) {
          .share-hero { padding: 32px 20px !important; }
          .share-hero h1 { font-size: clamp(24px, 8vw, 40px) !important; }
          .share-main { padding: 0 16px !important; }
        }
        /* Hide edit buttons on share view — sections are always read-only */
        .share-main .flex.items-start.justify-between > button,
        .share-main .flex.items-start.justify-between > button { display: none !important; }
      `}</style>

      {/* Minimal header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 48,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: '1rem', color: 'var(--text-3)', letterSpacing: '.06em' }}>
          Michael Hutcheon
        </span>
        <span style={{ color: 'var(--border-med)' }}>/</span>
        <span style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {project.campaignName || 'Pre-Production'}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, letterSpacing: '.08em', color: 'var(--text-3)', background: 'var(--bg3)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>
          VIEW ONLY
        </span>
      </header>

      {/* Hero */}
      <div className="share-hero" style={{ padding: 'clamp(40px, 6vw, 72px) clamp(24px, 6vw, 64px)', borderBottom: '1px solid var(--border)' }}>
        {project.clientName && (
          <div style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
            {project.clientName}
          </div>
        )}
        <h1 className="share-hero" style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 'clamp(28px, 6vw, 52px)', lineHeight: 1.1, color: 'var(--text)', marginBottom: 16 }}>
          {project.campaignName || 'Pre-Production Plan'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 24px', fontSize: 13, color: 'var(--text-3)' }}>
          {project.shootDate && <span>{project.shootDate}</span>}
          {project.shootLocation && <span>{project.shootLocation}</span>}
          {project.myRole && <span>{project.myRole}</span>}
          {project.deliverable && <span>{project.deliverable}</span>}
        </div>
      </div>

      {/* Section navigation chips */}
      {visibleSections.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '16px clamp(24px, 6vw, 64px)', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {visibleSections.map(id => (
            <a key={id} href={`#section-${id}`}
              style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text-2)', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {SECTION_LABELS[id]}
            </a>
          ))}
        </div>
      )}

      {/* Sections */}
      <main className="share-main" style={{ maxWidth: 900, margin: '0 auto', padding: '0 clamp(24px, 6vw, 64px)' }}>
        {visibleSections.map((id, i) => (
          <div key={id} id={`section-${id}`} style={{ borderBottom: i < visibleSections.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: 8 }}>
            {sectionComponents[id]}
          </div>
        ))}

        <div style={{ height: 80 }} />

        <div style={{ textAlign: 'center', padding: '40px 0', borderTop: '1px solid var(--border)', color: 'var(--text-3)', fontSize: 12 }}>
          Shared via Photo Mission Control · Michael Hutcheon
        </div>
      </main>
    </div>
  )
}
