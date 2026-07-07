'use client'

import { useState } from 'react'
import { Project, Mission } from '@/lib/types'
import { SectionHeader, Card, EditField, AddButton, MISSION_PALETTE } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function StillsMissions({ project, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const missions: Mission[] = project.missions ?? []

  const addMission = () => {
    const m: Mission = {
      id: crypto.randomUUID(),
      name: `Mission ${missions.length + 1}`,
      summary: '',
    }
    onChange({ missions: [...missions, m] })
  }

  const updateMission = (id: string, updates: Partial<Mission>) =>
    onChange({ missions: missions.map(m => m.id === id ? { ...m, ...updates } : m) })

  const deleteMission = (id: string) =>
    onChange({ missions: missions.filter(m => m.id !== id) })

  return (
    <section>
      <SectionHeader eyebrow="Missions Strategy" title="Stills Missions" editing={editing} onToggleEdit={() => setEditing(e => !e)} />

      <EditField
        label="Isolation Notes"
        value={project.isolationNotes ?? ''}
        onChange={v => onChange({ isolationNotes: v })}
        multiline
      />

      {editing ? (
        <div>
          {missions.map((m, i) => {
            const color = MISSION_PALETTE[i % MISSION_PALETTE.length]
            return (
              <div key={m.id} style={{ background: 'var(--bg3)', border: `1px solid ${color}4D`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, flexShrink: 0 }}>
                    Mission {i + 1}
                  </div>
                  <input
                    value={m.name}
                    onChange={e => updateMission(m.id, { name: e.target.value })}
                    placeholder="Mission name"
                    style={{ flex: 1, background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: '6px 10px', fontSize: 13 }}
                  />
                  {missions.length > 1 && (
                    <button
                      onClick={() => deleteMission(m.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, padding: '0 4px', flexShrink: 0 }}
                    >×</button>
                  )}
                </div>
                <textarea
                  value={m.summary}
                  onChange={e => updateMission(m.id, { summary: e.target.value })}
                  placeholder="Describe the visual intent, approach, and key shots for this mission..."
                  rows={3}
                  style={{ width: '100%', background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: '8px 10px', fontSize: 13, resize: 'vertical' }}
                />
              </div>
            )
          })}
          <AddButton onClick={addMission} label="Add Mission" />
        </div>
      ) : (
        <div>
          {missions.length === 0 && (
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No missions defined. Toggle edit to add missions.</p>
          )}
          {missions.map((m, i) => {
            const color = MISSION_PALETTE[i % MISSION_PALETTE.length]
            return (
              <Card key={m.id} style={{ borderLeft: `3px solid ${color}`, marginBottom: 12 }}>
                <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color, marginBottom: 8 }}>
                  {/^mission\s+\d+/i.test(m.name) ? m.name : `Mission ${i + 1} — ${m.name}`}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-2)' }}>{m.summary || '—'}</p>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
