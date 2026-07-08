'use client'

import { useState } from 'react'
import { Project, Shot, Mission } from '@/lib/types'
import { SectionHeader, ShotRow, MissionBar, Badge, AddButton, MISSION_PALETTE } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

function newShot(missionId: string, missionIndex: number, shots: Shot[]): Shot {
  const mShots = shots.filter(s => s.mission === missionId)
  const num = mShots.length + 1
  const prefix = `M${missionIndex + 1}`
  return {
    id: crypto.randomUUID(),
    mission: missionId,
    code: `${prefix}-${num}`,
    type: 'E',
    name: '',
    notes: '',
    lens: '',
    settings: '',
    scriptRef: '',
    priority: 'Med',
  }
}

const inputStyle = {
  background: 'var(--bg3)', border: '1px solid var(--border)',
  borderRadius: 6, color: 'var(--text)', padding: '6px 10px', fontSize: 13, width: '100%',
}

function ShotEditor({
  shot, missions, onChange, onDelete,
}: {
  shot: Shot
  missions: Mission[]
  onChange: (s: Shot) => void
  onDelete: () => void
}) {
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border-med)', borderRadius: 8, padding: 16, marginBottom: 10 }}>
      <div className="shot-ed-row1">
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
      <div className="shot-ed-row2">
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
      {missions.length > 1 && (
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Mission</label>
          <select
            value={shot.mission}
            onChange={e => onChange({ ...shot, mission: e.target.value })}
            style={inputStyle}
          >
            {missions.map((m, i) => (
              <option key={m.id} value={m.id}>Mission {i + 1} — {m.name}</option>
            ))}
          </select>
        </div>
      )}
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
  const missions: Mission[] = project.missions ?? []

  const updateShot = (updated: Shot) =>
    onChange({ shots: shots.map(s => s.id === updated.id ? updated : s) })
  const deleteShot = (id: string) =>
    onChange({ shots: shots.filter(s => s.id !== id) })

  // If no missions defined, show a flat list with a generic group
  const missionGroups = missions.length > 0 ? missions : []
  const assignedIds = new Set(missions.map(m => m.id))
  const unassigned = shots.filter(s => !assignedIds.has(s.mission))

  return (
    <section>
      <style>{`
        .shot-ed-row1 { display: grid; grid-template-columns: 1fr 1fr 80px 80px; gap: 10px; margin-bottom: 10px; }
        .shot-ed-row2 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        @media (max-width: 767px) {
          .shot-ed-row1 { grid-template-columns: 1fr 1fr; }
          .shot-ed-row2 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
      <SectionHeader eyebrow="Shot List" title="Shots" editing={editing} onToggleEdit={() => setEditing(e => !e)} />

      {editing ? (
        <div>
          {missionGroups.map((m, i) => {
            const mShots = shots.filter(s => s.mission === m.id)
            return (
              <div key={m.id} style={{ marginBottom: 24 }}>
                <MissionBar name={`Mission ${i + 1} — ${m.name}`} index={i} />
                {mShots.map(shot => (
                  <ShotEditor key={shot.id} shot={shot} missions={missions} onChange={updateShot} onDelete={() => deleteShot(shot.id)} />
                ))}
                <AddButton onClick={() => onChange({ shots: [...shots, newShot(m.id, i, shots)] })} label={`Add Shot to Mission ${i + 1}`} />
              </div>
            )
          })}

          {missions.length === 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 12 }}>
                No missions defined. Define missions in the Stills Missions section first, or add shots below.
              </p>
            </div>
          )}

          {unassigned.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <MissionBar name="Unassigned Shots" index={4} />
              {unassigned.map(shot => (
                <ShotEditor key={shot.id} shot={shot} missions={missions} onChange={updateShot} onDelete={() => deleteShot(shot.id)} />
              ))}
            </div>
          )}

          {missions.length === 0 && (
            <AddButton
              onClick={() => {
                const s: Shot = { id: crypto.randomUUID(), mission: '', code: `S-${shots.length + 1}`, type: 'E', name: '', notes: '', lens: '', settings: '', scriptRef: '', priority: 'Med' }
                onChange({ shots: [...shots, s] })
              }}
              label="Add Shot"
            />
          )}
        </div>
      ) : (
        <div>
          {missionGroups.map((m, i) => {
            const mShots = shots.filter(s => s.mission === m.id)
            if (!mShots.length) return null
            return (
              <div key={m.id} style={{ marginBottom: 24 }}>
                <MissionBar name={`Mission ${i + 1} — ${m.name}`} index={i} />
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  {mShots.map(shot => <ShotRow key={shot.id} shot={shot} />)}
                </div>
              </div>
            )
          })}
          {unassigned.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <MissionBar name="Unassigned Shots" index={4} />
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                {unassigned.map(shot => <ShotRow key={shot.id} shot={shot} />)}
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
