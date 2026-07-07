'use client'

import { useState } from 'react'
import { Project, Shot } from '@/lib/types'
import { SectionHeader, ShotRow, MissionBar, Badge, EditField, AddButton } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

function newShot(mission: 'M1' | 'M2', shots: Shot[]): Shot {
  const mShots = shots.filter(s => s.mission === mission)
  const num = mShots.length + 1
  return {
    id: crypto.randomUUID(),
    mission,
    code: `${mission}-${num}`,
    type: 'E',
    name: '',
    notes: '',
    lens: '',
    settings: '',
    scriptRef: '',
    priority: 'Med',
  }
}

function ShotEditor({ shot, onChange, onDelete }: { shot: Shot; onChange: (s: Shot) => void; onDelete: () => void }) {
  const inputStyle = {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text)', padding: '6px 10px', fontSize: 13, width: '100%',
  }
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border-med)', borderRadius: 8, padding: 16, marginBottom: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Name</label>
          <input value={shot.name} onChange={e => onChange({ ...shot, name: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Code</label>
          <input value={shot.code} onChange={e => onChange({ ...shot, code: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Type</label>
          <select value={shot.type} onChange={e => onChange({ ...shot, type: e.target.value as Shot['type'] })} style={inputStyle}>
            <option value="E">E — Establishing</option>
            <option value="T">T — Transition</option>
            <option value="C">C — Cutaway</option>
            <option value="R">R — Reveal</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Priority</label>
          <select value={shot.priority} onChange={e => onChange({ ...shot, priority: e.target.value as Shot['priority'] })} style={inputStyle}>
            <option value="Hero">Hero</option>
            <option value="High">High</option>
            <option value="Med">Med</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Lens</label>
          <input value={shot.lens} onChange={e => onChange({ ...shot, lens: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Settings</label>
          <input value={shot.settings} onChange={e => onChange({ ...shot, settings: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Script Ref</label>
          <input value={shot.scriptRef} onChange={e => onChange({ ...shot, scriptRef: e.target.value })} style={inputStyle} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, marginRight: 12 }}>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Notes</label>
          <input value={shot.notes} onChange={e => onChange({ ...shot, notes: e.target.value })} style={inputStyle} />
        </div>
        <button onClick={onDelete} style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 6, color: 'var(--red)', padding: '6px 12px', fontSize: 12, cursor: 'pointer', marginTop: 20, flexShrink: 0 }}>
          Remove
        </button>
      </div>
    </div>
  )
}

export default function ShotList({ project, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const shots = project.shots ?? []
  const m1 = shots.filter(s => s.mission === 'M1')
  const m2 = shots.filter(s => s.mission === 'M2')

  const updateShot = (updated: Shot) => {
    onChange({ shots: shots.map(s => s.id === updated.id ? updated : s) })
  }
  const deleteShot = (id: string) => {
    onChange({ shots: shots.filter(s => s.id !== id) })
  }

  return (
    <section>
      <SectionHeader eyebrow="Shot List" title="Shots" editing={editing} onToggleEdit={() => setEditing(e => !e)} />

      {editing ? (
        <div>
          <MissionBar mission="M1" />
          {m1.map(shot => (
            <ShotEditor key={shot.id} shot={shot} onChange={updateShot} onDelete={() => deleteShot(shot.id)} />
          ))}
          <AddButton onClick={() => onChange({ shots: [...shots, newShot('M1', shots)] })} label="Add M1 Shot" />

          <div style={{ marginTop: 24 }}>
            <MissionBar mission="M2" />
            {m2.map(shot => (
              <ShotEditor key={shot.id} shot={shot} onChange={updateShot} onDelete={() => deleteShot(shot.id)} />
            ))}
            <AddButton onClick={() => onChange({ shots: [...shots, newShot('M2', shots)] })} label="Add M2 Shot" />
          </div>
        </div>
      ) : (
        <div>
          {m1.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <MissionBar mission="M1" />
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                {m1.map(shot => <ShotRow key={shot.id} shot={shot} />)}
              </div>
            </div>
          )}
          {m2.length > 0 && (
            <div>
              <MissionBar mission="M2" />
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                {m2.map(shot => <ShotRow key={shot.id} shot={shot} />)}
              </div>
            </div>
          )}
          {shots.length === 0 && (
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No shots yet. Toggle edit mode to add shots.</p>
          )}
        </div>
      )}
    </section>
  )
}
