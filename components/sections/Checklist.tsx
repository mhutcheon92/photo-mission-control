'use client'

import { useState } from 'react'
import { Project } from '@/lib/types'
import { SectionHeader, ChecklistItemRow, ProgressBar, AddButton } from '@/components/ui'
import { calcChecklistProgress } from '@/lib/storage'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function Checklist({ project, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const groups = project.checklistGroups ?? []
  const progress = calcChecklistProgress(project)

  const addGroup = () => onChange({ checklistGroups: [...groups, { id: crypto.randomUUID(), title: 'New Group', items: [] }] })
  const updateGroupTitle = (id: string, title: string) => onChange({ checklistGroups: groups.map(g => g.id === id ? { ...g, title } : g) })
  const addItem = (groupId: string) => onChange({
    checklistGroups: groups.map(g => g.id === groupId
      ? { ...g, items: [...g.items, { id: crypto.randomUUID(), text: '', done: false }] }
      : g)
  })
  const toggleItem = (groupId: string, itemId: string) => onChange({
    checklistGroups: groups.map(g => g.id === groupId
      ? { ...g, items: g.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) }
      : g)
  })
  const updateItem = (groupId: string, itemId: string, text: string) => onChange({
    checklistGroups: groups.map(g => g.id === groupId
      ? { ...g, items: g.items.map(i => i.id === itemId ? { ...i, text } : i) }
      : g)
  })
  const deleteItem = (groupId: string, itemId: string) => onChange({
    checklistGroups: groups.map(g => g.id === groupId
      ? { ...g, items: g.items.filter(i => i.id !== itemId) }
      : g)
  })

  return (
    <section>
      <SectionHeader
        eyebrow="Master Checklist"
        title="Checklist"
        editing={editing}
        onToggleEdit={() => setEditing(e => !e)}
        progress={progress}
      />

      {groups.map(group => (
        <div key={group.id} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {editing ? (
              <>
                <input value={group.title} onChange={e => updateGroupTitle(group.id, e.target.value)}
                  style={{ fontSize: 13, fontWeight: 600, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: '4px 8px', flex: 1 }} />
                <button onClick={() => onChange({ checklistGroups: groups.filter(g => g.id !== group.id) })}
                  style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16 }}>×</button>
              </>
            ) : (
              <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{group.title}</span>
            )}
          </div>
          {group.items.map(item => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              editing={editing}
              onToggle={() => toggleItem(group.id, item.id)}
              onTextChange={text => updateItem(group.id, item.id, text)}
              onDelete={() => deleteItem(group.id, item.id)}
            />
          ))}
          {editing && <AddButton onClick={() => addItem(group.id)} label="Add Item" />}
        </div>
      ))}
      {editing && <AddButton onClick={addGroup} label="Add Group" />}
      {groups.length === 0 && !editing && <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No checklist groups yet.</p>}
    </section>
  )
}
