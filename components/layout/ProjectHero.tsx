'use client'

import { Project } from '@/lib/types'
import { InlineField, InlineTextarea } from '@/components/ui'

interface Props {
  project: Project
  onChange?: (updates: Partial<Project>) => void
}

const META_FIELDS: Array<{ label: string; key: keyof Project; ariaLabel: string; multiline?: boolean }> = [
  { label: 'Shoot Date', key: 'shootDate', ariaLabel: 'Shoot date' },
  { label: 'Role', key: 'myRole', ariaLabel: 'Your role', multiline: true },
  { label: 'Deliverable', key: 'deliverable', ariaLabel: 'Deliverable', multiline: true },
  { label: 'Location', key: 'shootLocation', ariaLabel: 'Shoot location', multiline: true },
  { label: 'Director', key: 'director', ariaLabel: 'Director' },
  { label: 'Producer', key: 'producer', ariaLabel: 'Producer' },
]

export default function ProjectHero({ project, onChange }: Props) {
  const editable = Boolean(onChange)

  return (
    <div
      className="hero-wrap"
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid rgba(74,66,60,0.6)',
        padding: 'clamp(24px, 5vw, 40px) clamp(20px, 6vw, 48px) clamp(12px, 3vw, 20px)',
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          .hero-wrap     { padding: 20px 16px 8px !important; }
          .hero-eyebrow  { margin-bottom: 6px !important; font-size: 10px !important; }
          .hero-title    { font-size: 22px !important; }
          .hero-sentence { font-size: 13px !important; line-height: 1.55 !important; margin-bottom: 12px !important; }
        }
      `}</style>

      {project.clientName && (
        <div
          className="hero-eyebrow"
          style={{
            fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: 10,
          }}
        >
          {project.clientName}
        </div>
      )}

      <h1
        className="hero-title"
        style={{
          fontFamily: 'var(--font-serif, Cormorant Garamond, serif)',
          fontWeight: 500,
          fontSize: 'clamp(24px, 6vw, 36px)',
          lineHeight: 1.2,
          color: 'var(--text)',
          marginBottom: 8,
        }}
      >
        {project.campaignName || 'Untitled Campaign'}
      </h1>

      {project.campaignSentence && (
        <p
          className="hero-sentence"
          style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 18, lineHeight: 1.55 }}
        >
          {project.campaignSentence}
        </p>
      )}

      {editable && (
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 18 }}>
          Click any field below to edit it
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderTop: '1px solid rgba(74,66,60,0.6)',
        }}
      >
        {META_FIELDS.map((f) => {
          const value = (project[f.key] as string) ?? ''
          return (
            <div
              key={f.key as string}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '18px 0 20px',
                borderBottom: '1px solid rgba(74,66,60,0.6)',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '.16em',
                  color: 'var(--gold)',
                  fontWeight: 500,
                }}
              >
                {f.label}
              </span>
              {editable && onChange ? (
                f.multiline ? (
                  <InlineTextarea
                    fieldKey={`hero.${String(f.key)}`}
                    value={value}
                    onChange={v => onChange({ [f.key]: v } as Partial<Project>)}
                    placeholder="—"
                    ariaLabel={f.ariaLabel}
                    textStyle={{ fontSize: 16, lineHeight: 1.55, color: 'var(--text)' }}
                  />
                ) : (
                  <InlineField
                    fieldKey={`hero.${String(f.key)}`}
                    value={value}
                    onChange={v => onChange({ [f.key]: v } as Partial<Project>)}
                    placeholder="—"
                    ariaLabel={f.ariaLabel}
                    textStyle={{ fontSize: 16, lineHeight: 1.5 }}
                  />
                )
              ) : (
                <span style={{ fontSize: 16, lineHeight: 1.5, color: value ? 'var(--text)' : 'var(--text-3)', whiteSpace: 'pre-wrap' }}>
                  {value || '—'}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
