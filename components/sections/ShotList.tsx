'use client'

import { useState } from 'react'
import { Project, Shot, Mission } from '@/lib/types'
import {
  Eyebrow, ShotRow, MissionBar, AddButton,
  SHOT_CODE_LABELS, stripMissionPrefix,
} from '@/components/ui'

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
  background: 'var(--input-bg)', border: '1px solid var(--border-med)',
  color: 'var(--text)', padding: '6px 10px', fontSize: 13, width: '100%',
  fontFamily: 'inherit',
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
    <div style={{ background: 'var(--surface)', border: '1px solid rgba(74,66,60,0.6)', padding: 16, marginBottom: 10 }}>
      <div className="shot-ed-row1">
        <div>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Name</label>
          <input value={shot.name} onChange={e => onChange({ ...shot, name: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Code</label>
          <input value={shot.code} onChange={e => onChange({ ...shot, code: e.target.value })} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
        </div>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Type</label>
          <select value={shot.type} onChange={e => onChange({ ...shot, type: e.target.value as Shot['type'] })} style={inputStyle}>
            <option value="C">C — Cutaway</option>
            <option value="E">E — Establishing</option>
            <option value="T">T — Transition</option>
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
          <input value={shot.lens} onChange={e => onChange({ ...shot, lens: e.target.value })} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
        </div>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Settings</label>
          <input value={shot.settings} onChange={e => onChange({ ...shot, settings: e.target.value })} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
        </div>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Script Ref</label>
          <input value={shot.scriptRef} onChange={e => onChange({ ...shot, scriptRef: e.target.value })} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
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
              <option key={m.id} value={m.id}>Mission {i + 1} — {stripMissionPrefix(m.name)}</option>
            ))}
          </select>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 200, marginRight: 12 }}>
          <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Notes</label>
          <input value={shot.notes} onChange={e => onChange({ ...shot, notes: e.target.value })} style={inputStyle} />
        </div>
        <button
          onClick={onDelete}
          aria-label="Remove shot"
          style={{
            background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)',
            color: 'var(--danger)', padding: '6px 12px', fontSize: 12, cursor: 'pointer',
            marginTop: 20, flexShrink: 0, fontFamily: 'inherit',
          }}
        >
          Remove
        </button>
      </div>
    </div>
  )
}

function ShotCodeLegend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {['C', 'E', 'T', 'R'].map(code => {
        const info = SHOT_CODE_LABELS[code]
        return (
          <div key={code} title={info.title} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'default' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10, fontWeight: 600,
                width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--input-bg)', color: 'var(--text-2)',
              }}
            >
              {code}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{info.label}</span>
          </div>
        )
      })}
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

  const missionGroups = missions.length > 0 ? missions : []
  const assignedIds = new Set(missions.map(m => m.id))
  const unassigned = shots.filter(s => !assignedIds.has(s.mission))

  return (
    <section>
      <style>{`
        .shot-ed-row1 { display: grid; grid-template-columns: 1fr 1fr 100px 100px; gap: 10px; margin-bottom: 10px; }
        .shot-ed-row2 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        @media (max-width: 767px) {
          .shot-ed-row1 { grid-template-columns: 1fr 1fr; }
          .shot-ed-row2 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <Eyebrow style={{ marginBottom: 0 }}>Shot List</Eyebrow>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <ShotCodeLegend />
          <button
            onClick={() => setEditing(e => !e)}
            aria-label={editing ? 'Finish editing shots' : 'Edit shots'}
            style={{
              padding: '6px 12px',
              background: editing ? 'var(--accent-light)' : 'var(--surface)',
              border: `1px solid ${editing ? 'var(--gold)' : 'var(--border-med)'}`,
              color: editing ? 'var(--gold)' : 'var(--text-2)',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {editing ? (
        <div>
          {missionGroups.map((m, i) => {
            const mShots = shots.filter(s => s.mission === m.id)
            return (
              <div key={m.id} style={{ marginBottom: 24 }}>
                <MissionBar name={`Mission ${i + 1} — ${stripMissionPrefix(m.name)}`} index={i} />
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
                <MissionBar name={`Mission ${i + 1} — ${stripMissionPrefix(m.name)}`} index={i} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mShots.map(shot => <ShotRow key={shot.id} shot={shot} />)}
                </div>
              </div>
            )
          })}
          {unassigned.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <MissionBar name="Unassigned Shots" index={4} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
