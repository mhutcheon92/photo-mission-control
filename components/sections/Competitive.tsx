'use client'

import { useState } from 'react'
import { Project, Competitor } from '@/lib/types'
import { SectionHeader, Card, AddButton } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function Competitive({ project, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const competitors = project.competitors ?? []

  const inputStyle = {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text)', padding: '6px 10px', fontSize: 13, width: '100%',
  }

  const addComp = () => onChange({ competitors: [...competitors, { id: crypto.randomUUID(), name: '', category: '', borrow: '', difference: '' }] })
  const update = (id: string, updates: Partial<Competitor>) =>
    onChange({ competitors: competitors.map(c => c.id === id ? { ...c, ...updates } : c) })

  return (
    <section>
      <SectionHeader eyebrow="Competitive" title="Competitive Analysis" editing={editing} onToggleEdit={() => setEditing(e => !e)} />

      {competitors.map(c => (
        editing ? (
          <div key={c.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <input value={c.name} placeholder="Brand name" onChange={e => update(c.id, { name: e.target.value })} style={inputStyle} />
              <input value={c.category} placeholder="Category" onChange={e => update(c.id, { category: e.target.value })} style={inputStyle} />
            </div>
            <input value={c.borrow} placeholder="What to borrow from them" onChange={e => update(c.id, { borrow: e.target.value })} style={{ ...inputStyle, marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={c.difference} placeholder="How we differ" onChange={e => update(c.id, { difference: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => onChange({ competitors: competitors.filter(x => x.id !== c.id) })} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
            </div>
          </div>
        ) : (
          <Card key={c.id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{c.name || '—'}</span>
              {c.category && <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{c.category}</span>}
            </div>
            {c.borrow && (
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>BORROW — </span>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{c.borrow}</span>
              </div>
            )}
            {c.difference && (
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>DIFFERENCE — </span>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{c.difference}</span>
              </div>
            )}
          </Card>
        )
      ))}
      {editing && <AddButton onClick={addComp} label="Add Competitor" />}
      {competitors.length === 0 && !editing && <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No competitors added.</p>}
    </section>
  )
}
