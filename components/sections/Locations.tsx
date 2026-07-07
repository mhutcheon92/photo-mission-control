'use client'

import { useState } from 'react'
import { Project, Location, CheckItem } from '@/lib/types'
import { SectionHeader, Card, ChecklistItemRow, AddButton } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function Locations({ project, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const locs = project.candidateLocations ?? []
  const recce = project.recceItems ?? []

  const inputStyle = {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text)', padding: '6px 10px', fontSize: 13, width: '100%',
  }

  const addLoc = () => onChange({ candidateLocations: [...locs, { id: crypto.randomUUID(), name: '', address: '', notes: '' }] })
  const updateLoc = (id: string, updates: Partial<Location>) => onChange({ candidateLocations: locs.map(l => l.id === id ? { ...l, ...updates } : l) })
  const addRecce = () => onChange({ recceItems: [...recce, { id: crypto.randomUUID(), text: '', done: false }] })

  return (
    <section>
      <SectionHeader eyebrow="Locations" title="Candidate Locations" editing={editing} onToggleEdit={() => setEditing(e => !e)} />

      <div style={{ marginBottom: 24 }}>
        {locs.map(loc => (
          editing ? (
            <div key={loc.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input value={loc.name} placeholder="Location name" onChange={e => updateLoc(loc.id, { name: e.target.value })} style={inputStyle} />
                <input value={loc.address} placeholder="Address" onChange={e => updateLoc(loc.id, { address: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={loc.notes} placeholder="Notes" onChange={e => updateLoc(loc.id, { notes: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => onChange({ candidateLocations: locs.filter(l => l.id !== loc.id) })} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
              </div>
            </div>
          ) : (
            <Card key={loc.id} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{loc.name || '—'}</div>
              {loc.address && <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>{loc.address}</div>}
              {loc.notes && <p style={{ fontSize: 14, color: 'var(--text-2)' }}>{loc.notes}</p>}
            </Card>
          )
        ))}
        {editing && <AddButton onClick={addLoc} label="Add Location" />}
        {locs.length === 0 && !editing && <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No locations listed.</p>}
      </div>

      <div>
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Recce Checklist</div>
        {recce.map(item => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            editing={editing}
            onToggle={() => onChange({ recceItems: recce.map(r => r.id === item.id ? { ...r, done: !r.done } : r) })}
            onTextChange={text => onChange({ recceItems: recce.map(r => r.id === item.id ? { ...r, text } : r) })}
            onDelete={() => onChange({ recceItems: recce.filter(r => r.id !== item.id) })}
          />
        ))}
        {editing && <AddButton onClick={addRecce} label="Add Recce Item" />}
      </div>
    </section>
  )
}
