'use client'

import { useState } from 'react'
import { Project, LightWindow, ScenarioResponse } from '@/lib/types'
import { SectionHeader, Card, EditField, AddButton } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function LightStrategy({ project, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const windows = project.lightWindows ?? []
  const scenarios = project.scenarioResponses ?? []

  const addWindow = () => {
    const w: LightWindow = { id: crypto.randomUUID(), timeRange: '', label: '', notes: '' }
    onChange({ lightWindows: [...windows, w] })
  }
  const updateWindow = (id: string, updates: Partial<LightWindow>) => {
    onChange({ lightWindows: windows.map(w => w.id === id ? { ...w, ...updates } : w) })
  }
  const addScenario = () => {
    const s: ScenarioResponse = { id: crypto.randomUUID(), title: '', notes: '' }
    onChange({ scenarioResponses: [...scenarios, s] })
  }
  const updateScenario = (id: string, updates: Partial<ScenarioResponse>) => {
    onChange({ scenarioResponses: scenarios.map(s => s.id === id ? { ...s, ...updates } : s) })
  }

  const inputStyle = {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text)', padding: '6px 10px', fontSize: 13, width: '100%',
  }

  return (
    <section>
      <SectionHeader eyebrow="Light Strategy" title="Light Windows" editing={editing} onToggleEdit={() => setEditing(e => !e)} />

      {editing ? (
        <div>
          <EditField label="Light Notes" value={project.lightNotes} onChange={v => onChange({ lightNotes: v })} multiline />

          <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Windows</div>
          {windows.map(w => (
            <div key={w.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Time Range</label>
                  <input value={w.timeRange} onChange={e => updateWindow(w.id, { timeRange: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Label</label>
                  <input value={w.label} onChange={e => updateWindow(w.id, { label: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Notes</label>
                  <input value={w.notes} onChange={e => updateWindow(w.id, { notes: e.target.value })} style={inputStyle} />
                </div>
                <button onClick={() => onChange({ lightWindows: windows.filter(x => x.id !== w.id) })} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, marginTop: 20, padding: '0 4px' }}>×</button>
              </div>
            </div>
          ))}
          <AddButton onClick={addWindow} label="Add Light Window" />

          <div style={{ marginTop: 24, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Scenario Responses</div>
          {scenarios.map(s => (
            <div key={s.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <input value={s.title} placeholder="Scenario title" onChange={e => updateScenario(s.id, { title: e.target.value })} style={{ ...inputStyle, marginBottom: 8 }} />
                  <input value={s.notes} placeholder="Response / notes" onChange={e => updateScenario(s.id, { notes: e.target.value })} style={inputStyle} />
                </div>
                <button onClick={() => onChange({ scenarioResponses: scenarios.filter(x => x.id !== s.id) })} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
              </div>
            </div>
          ))}
          <AddButton onClick={addScenario} label="Add Scenario" />
        </div>
      ) : (
        <div>
          {project.lightNotes && <p style={{ color: 'var(--text-2)', marginBottom: 20, fontSize: 14 }}>{project.lightNotes}</p>}
          {windows.length === 0 && <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No light windows defined.</p>}
          {windows.map(w => (
            <Card key={w.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                <span style={{ color: 'var(--red)', fontWeight: 700 }}>{w.timeRange}</span>
                <span style={{ fontWeight: 600 }}>{w.label}</span>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{w.notes}</p>
            </Card>
          ))}
          {scenarios.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Scenario Responses</div>
              {scenarios.map(s => (
                <Card key={s.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                  <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{s.notes}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
