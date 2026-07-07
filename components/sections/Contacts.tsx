'use client'

import { useState } from 'react'
import { Project, Contact } from '@/lib/types'
import { SectionHeader, AddButton } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function Contacts({ project, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const contacts = project.contacts ?? []

  const inputStyle = {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text)', padding: '6px 10px', fontSize: 13, width: '100%',
  }

  const addContact = () => onChange({ contacts: [...contacts, { id: crypto.randomUUID(), name: '', role: '', email: '' }] })
  const update = (id: string, updates: Partial<Contact>) =>
    onChange({ contacts: contacts.map(c => c.id === id ? { ...c, ...updates } : c) })

  return (
    <section>
      <SectionHeader eyebrow="Contacts" title="Team" editing={editing} onToggleEdit={() => setEditing(e => !e)} />

      {editing ? (
        <div>
          {contacts.map(c => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'center' }}>
              <input value={c.name} placeholder="Name" onChange={e => update(c.id, { name: e.target.value })} style={inputStyle} />
              <input value={c.role} placeholder="Role" onChange={e => update(c.id, { role: e.target.value })} style={inputStyle} />
              <input value={c.email} placeholder="Email" type="email" onChange={e => update(c.id, { email: e.target.value })} style={inputStyle} />
              <button onClick={() => onChange({ contacts: contacts.filter(x => x.id !== c.id) })} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
            </div>
          ))}
          <AddButton onClick={addContact} label="Add Contact" />
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-med)' }}>
              {['Name', 'Role', 'Email'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-2)', fontSize: 13 }}>{c.role}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-2)' }}>{c.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {contacts.length === 0 && !editing && <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No contacts added.</p>}
    </section>
  )
}
