'use client'

import { Project, Contact } from '@/lib/types'
import { Eyebrow, InlineField, AddButton } from '@/components/ui'
import { suggestContacts } from '@/lib/suggestContacts'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function Contacts({ project, onChange }: Props) {
  const contacts = project.contacts ?? []
  const suggestions = suggestContacts(project)

  const addContact = () =>
    onChange({ contacts: [...contacts, { id: crypto.randomUUID(), name: '', role: '', email: '' }] })

  const update = (id: string, updates: Partial<Contact>) =>
    onChange({ contacts: contacts.map(c => c.id === id ? { ...c, ...updates } : c) })

  const remove = (id: string) =>
    onChange({ contacts: contacts.filter(c => c.id !== id) })

  const confirmSuggestion = (name: string, role: string) => {
    onChange({
      contacts: [
        ...contacts,
        { id: crypto.randomUUID(), name, role, email: '' },
      ],
    })
  }

  return (
    <section>
      <Eyebrow>Team</Eyebrow>

      {contacts.length === 0 ? (
        <div style={{ padding: 18, border: '1px dashed var(--border-med)', color: 'var(--text-3)', fontSize: 13, marginBottom: 32 }}>
          No contacts confirmed yet — add from the suggestions below or use “Add Contact”.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {contacts.map(c => (
            <div
              key={c.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                padding: '14px 18px',
                background: 'var(--surface)',
                border: '1px solid rgba(74,66,60,0.6)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 2 }}>
                  <InlineField
                    fieldKey={`contact.${c.id}.name`}
                    value={c.name}
                    onChange={v => update(c.id, { name: v })}
                    placeholder="Name…"
                    ariaLabel="Contact name"
                    textStyle={{ fontSize: 13.5, fontWeight: 500 }}
                  />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <InlineField
                    fieldKey={`contact.${c.id}.role`}
                    value={c.role}
                    onChange={v => update(c.id, { role: v })}
                    placeholder="Role…"
                    ariaLabel="Contact role"
                    textStyle={{ fontSize: 12, color: 'var(--text-3)' }}
                  />
                  <InlineField
                    fieldKey={`contact.${c.id}.email`}
                    value={c.email}
                    onChange={v => update(c.id, { email: v })}
                    placeholder="email@example.com"
                    ariaLabel="Contact email"
                    textStyle={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>
              <button
                onClick={() => remove(c.id)}
                aria-label={`Remove contact ${c.name || 'unnamed'}`}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, padding: '0 4px', flexShrink: 0 }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <AddButton onClick={addContact} label="Add Contact" />
      </div>

      {suggestions.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Eyebrow style={{ marginBottom: 0 }}>Suggested from this brief</Eyebrow>
            <span style={{ fontSize: 10, padding: '1px 8px', background: 'rgba(200,169,110,0.14)', color: 'var(--gold)', fontWeight: 600 }}>
              auto-detected
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {suggestions.map(s => (
              <div
                key={s.name}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '14px 18px',
                  background: 'var(--surface-alt)',
                  border: '1px solid rgba(74,66,60,0.5)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: 'var(--text)' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    {s.inferredRole} · mentioned {s.mentions}x in Open Items
                  </div>
                </div>
                <button
                  onClick={() => confirmSuggestion(s.name, s.inferredRole)}
                  style={{
                    padding: '10px 18px', background: 'none',
                    border: '1px solid var(--gold)',
                    color: 'var(--gold)',
                    fontSize: 11.5, letterSpacing: '.05em', textTransform: 'uppercase',
                    fontWeight: 500, cursor: 'pointer', flexShrink: 0,
                    fontFamily: 'inherit',
                  }}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
