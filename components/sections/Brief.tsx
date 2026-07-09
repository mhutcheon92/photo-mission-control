'use client'

import { Project, PaletteColour } from '@/lib/types'
import { Eyebrow, InlineField, InlineTextarea, PaletteSwatch, AddButton } from '@/components/ui'
import AlertStrip from './AlertStrip'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

const STORY_FIELDS: Array<{ key: 'character' | 'location' | 'event' | 'revealImage'; label: string; ariaLabel: string }> = [
  { key: 'character', label: 'Character', ariaLabel: 'Character' },
  { key: 'location', label: 'Location', ariaLabel: 'Location' },
  { key: 'event', label: 'Event', ariaLabel: 'Event' },
  { key: 'revealImage', label: 'Reveal Image', ariaLabel: 'Reveal image' },
]

export default function Brief({ project, onChange }: Props) {
  const addPalette = () => {
    const newSwatch: PaletteColour = { hex: '#888888', label: '', meaning: '' }
    onChange({ colourPalette: [...(project.colourPalette ?? []), newSwatch] })
  }

  return (
    <section>
      <AlertStrip project={project} onChange={onChange} />

      {/* Story Foundation */}
      <div style={{ marginBottom: 40 }}>
        <Eyebrow>Story Foundation</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STORY_FIELDS.map(f => (
            <div
              key={f.key}
              style={{
                padding: '18px 0 20px',
                borderBottom: '1px solid rgba(74,66,60,0.6)',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--gold)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '.16em',
                  fontWeight: 500,
                }}
              >
                {f.label}
              </div>
              <InlineTextarea
                fieldKey={`story.${f.key}`}
                value={project[f.key] ?? ''}
                onChange={v => onChange({ [f.key]: v } as Partial<Project>)}
                placeholder="—"
                ariaLabel={f.ariaLabel}
                textStyle={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text)' }}
              />
            </div>
          ))}
          <div style={{ padding: '18px 0 20px' }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--gold)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '.16em',
                fontWeight: 500,
              }}
            >
              Theme
            </div>
            <InlineField
              fieldKey="story.themeWord"
              value={project.themeWord ?? ''}
              onChange={v => onChange({ themeWord: v })}
              placeholder="—"
              ariaLabel="Theme word"
              textStyle={{
                fontFamily: 'var(--font-serif, serif)',
                fontStyle: 'italic',
                fontSize: 24,
                color: 'var(--text)',
              }}
              inputStyle={{
                fontFamily: 'var(--font-serif, serif)',
                fontStyle: 'italic',
                fontSize: 20,
              }}
            />
          </div>
        </div>
      </div>

      {/* Campaign sentence */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Campaign Sentence
        </div>
        <InlineTextarea
          fieldKey="brief.campaignSentence"
          value={project.campaignSentence ?? ''}
          onChange={v => onChange({ campaignSentence: v })}
          placeholder="This campaign needs to make [audience] feel [emotion] so that they [action]."
          ariaLabel="Campaign sentence"
          textStyle={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 18,
            lineHeight: 1.5,
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Creative Approach */}
      {(project.mood || project.tone || project.styleReferences) !== undefined && (
        <div style={{ marginBottom: 32 }}>
          <Eyebrow>Creative Approach</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.08em' }}>Mood</div>
              <InlineField fieldKey="brief.mood" value={project.mood ?? ''} onChange={v => onChange({ mood: v })} placeholder="—" ariaLabel="Mood" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.08em' }}>Tone</div>
              <InlineField fieldKey="brief.tone" value={project.tone ?? ''} onChange={v => onChange({ tone: v })} placeholder="—" ariaLabel="Tone" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.08em' }}>Style References</div>
              <InlineTextarea fieldKey="brief.styleReferences" value={project.styleReferences ?? ''} onChange={v => onChange({ styleReferences: v })} placeholder="—" ariaLabel="Style references" />
            </div>
          </div>
        </div>
      )}

      {/* Colour Palette */}
      {(project.colourPalette ?? []).length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Eyebrow>Colour Palette</Eyebrow>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {project.colourPalette.map((s, i) => <PaletteSwatch key={i} {...s} />)}
          </div>
          <div style={{ marginTop: 12 }}>
            <AddButton onClick={addPalette} label="Add Colour" />
          </div>
        </div>
      )}

      {/* Constraints & Alerts — its own labeled section */}
      {(project.alerts ?? []).length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Eyebrow style={{ marginBottom: 0 }}>Constraints &amp; Alerts</Eyebrow>
            <span style={{ fontSize: 10, padding: '1px 8px', background: 'rgba(138,74,58,0.2)', color: 'var(--rust)', fontWeight: 600 }}>
              {project.alerts.length} {project.alerts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {project.alerts.map((a, i) => (
              <div
                key={a.id ?? i}
                style={{
                  padding: '16px 18px',
                  background: 'var(--surface)',
                  border: '1px solid rgba(74,66,60,0.6)',
                  borderLeft: '2px solid var(--rust)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--rust)', marginBottom: 6 }}>
                  {a.severity ?? (a.type === 'red' ? 'urgent' : 'flag')}
                </div>
                <InlineTextarea
                  fieldKey={`alert.${a.id ?? i}.text`}
                  value={a.text}
                  onChange={v => {
                    const arr = [...(project.alerts ?? [])]
                    arr[i] = { ...arr[i], text: v }
                    onChange({ alerts: arr })
                  }}
                  placeholder="Constraint or alert text…"
                  ariaLabel="Alert text"
                  textStyle={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-2)' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
