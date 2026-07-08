'use client'

import { useState } from 'react'
import { Project, PaletteColour, Alert } from '@/lib/types'
import { SectionHeader, Card, AlertBanner, PaletteSwatch, EditField, AddButton } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function Brief({ project, onChange }: Props) {
  const [editing, setEditing] = useState(false)

  const addAlert = () => {
    const newAlert: Alert = { type: 'blue', text: '' }
    onChange({ alerts: [...(project.alerts ?? []), newAlert] })
  }

  const addPalette = () => {
    const newSwatch: PaletteColour = { hex: '#888888', label: '', meaning: '' }
    onChange({ colourPalette: [...(project.colourPalette ?? []), newSwatch] })
  }

  return (
    <section>
      <style>{`
        .brief-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .brief-grid-mb { margin-bottom: 24px; }
        @media (max-width: 767px) {
          .brief-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <SectionHeader eyebrow="Story Foundation" title="Brief" editing={editing} onToggleEdit={() => setEditing(e => !e)} />

      {editing ? (
        <div>
          <div className="brief-grid brief-grid-mb">
            <EditField label="Client Name" value={project.clientName} onChange={v => onChange({ clientName: v })} />
            <EditField label="Campaign Name" value={project.campaignName} onChange={v => onChange({ campaignName: v })} />
            <EditField label="Shoot Date" value={project.shootDate} onChange={v => onChange({ shootDate: v })} />
            <EditField label="Shoot Location" value={project.shootLocation} onChange={v => onChange({ shootLocation: v })} />
            <EditField label="My Role" value={project.myRole} onChange={v => onChange({ myRole: v })} />
            <EditField label="Deliverable" value={project.deliverable} onChange={v => onChange({ deliverable: v })} />
            <EditField label="Director" value={project.director} onChange={v => onChange({ director: v })} />
            <EditField label="Producer" value={project.producer} onChange={v => onChange({ producer: v })} />
          </div>
          <EditField label="Capture Setup" value={project.captureSetup} onChange={v => onChange({ captureSetup: v })} />
          <EditField label="Campaign Sentence" value={project.campaignSentence} onChange={v => onChange({ campaignSentence: v })} multiline />
          <div className="brief-grid">
            <EditField label="Character" value={project.character} onChange={v => onChange({ character: v })} multiline />
            <EditField label="Location" value={project.location} onChange={v => onChange({ location: v })} multiline />
            <EditField label="Event" value={project.event} onChange={v => onChange({ event: v })} multiline />
            <EditField label="Reveal Image" value={project.revealImage} onChange={v => onChange({ revealImage: v })} multiline />
          </div>
          <EditField label="Theme Word" value={project.themeWord} onChange={v => onChange({ themeWord: v })} />

          <div style={{ margin: '8px 0 20px', padding: '16px 20px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>Creative Approach</div>
            <EditField label="Mood" value={project.mood ?? ''} onChange={v => onChange({ mood: v })} />
            <EditField label="Tone" value={project.tone ?? ''} onChange={v => onChange({ tone: v })} />
            <EditField label="Style References" value={project.styleReferences ?? ''} onChange={v => onChange({ styleReferences: v })} multiline />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Colour Palette</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
              {(project.colourPalette ?? []).map((swatch, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
                  <input type="color" value={swatch.hex} onChange={e => {
                    const p = [...(project.colourPalette ?? [])]
                    p[i] = { ...p[i], hex: e.target.value }
                    onChange({ colourPalette: p })
                  }} style={{ width: 48, height: 48, borderRadius: 6, border: 'none', cursor: 'pointer', padding: 2, background: 'transparent' }} />
                  <input value={swatch.label} placeholder="Label" onChange={e => {
                    const p = [...(project.colourPalette ?? [])]
                    p[i] = { ...p[i], label: e.target.value }
                    onChange({ colourPalette: p })
                  }} style={{ width: 80, fontSize: 11, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', padding: '3px 6px' }} />
                  <input value={swatch.meaning} placeholder="Meaning" onChange={e => {
                    const p = [...(project.colourPalette ?? [])]
                    p[i] = { ...p[i], meaning: e.target.value }
                    onChange({ colourPalette: p })
                  }} style={{ width: 80, fontSize: 11, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', padding: '3px 6px' }} />
                  <button onClick={() => {
                    const p = (project.colourPalette ?? []).filter((_, idx) => idx !== i)
                    onChange({ colourPalette: p })
                  }} style={{ position: 'absolute', top: -8, right: -8, width: 18, height: 18, borderRadius: '50%', background: 'var(--red)', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ))}
            </div>
            <AddButton onClick={addPalette} label="Add Colour" />
          </div>

          <div>
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Alerts</div>
            {(project.alerts ?? []).map((alert, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <select value={alert.type} onChange={e => {
                  const a = [...(project.alerts ?? [])]
                  a[i] = { ...a[i], type: e.target.value as Alert['type'] }
                  onChange({ alerts: a })
                }} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: '8px 10px', fontSize: 13 }}>
                  <option value="red">Red</option>
                  <option value="amber">Amber</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                </select>
                <input value={alert.text} onChange={e => {
                  const a = [...(project.alerts ?? [])]
                  a[i] = { ...a[i], text: e.target.value }
                  onChange({ alerts: a })
                }} style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: '8px 12px', fontSize: 14 }} />
                <button onClick={() => onChange({ alerts: (project.alerts ?? []).filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, padding: '6px' }}>×</button>
              </div>
            ))}
            <AddButton onClick={addAlert} label="Add Alert" />
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Character', value: project.character },
              { label: 'Location', value: project.location },
              { label: 'Event', value: project.event },
              { label: 'Reveal Image', value: project.revealImage },
            ].map(item => (
              <Card key={item.label}>
                <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>{item.label}</div>
                <p style={{ fontSize: 14, color: 'var(--text-2)' }}>{item.value || '—'}</p>
              </Card>
            ))}
          </div>

          {project.themeWord && (
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginRight: 8 }}>Theme</span>
              <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 22 }}>{project.themeWord}</span>
            </div>
          )}

          {(project.mood || project.tone || project.styleReferences) && (
            <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>Creative Approach</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {project.mood && (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--text-3)', marginRight: 8 }}>Mood</span>
                    <span style={{ color: 'var(--text-2)' }}>{project.mood}</span>
                  </div>
                )}
                {project.tone && (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--text-3)', marginRight: 8 }}>Tone</span>
                    <span style={{ color: 'var(--text-2)' }}>{project.tone}</span>
                  </div>
                )}
                {project.styleReferences && (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--text-3)', marginRight: 8 }}>References</span>
                    <span style={{ color: 'var(--text-2)' }}>{project.styleReferences}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {(project.colourPalette ?? []).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Colour Palette</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                {project.colourPalette.map((s, i) => <PaletteSwatch key={i} {...s} />)}
              </div>
            </div>
          )}

          {(project.alerts ?? []).map((alert, i) => <AlertBanner key={i} {...alert} />)}
        </div>
      )}
    </section>
  )
}
