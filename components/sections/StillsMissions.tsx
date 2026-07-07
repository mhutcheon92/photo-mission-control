'use client'

import { useState } from 'react'
import { Project } from '@/lib/types'
import { SectionHeader, Card, EditField } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function StillsMissions({ project, onChange }: Props) {
  const [editing, setEditing] = useState(false)

  return (
    <section>
      <SectionHeader eyebrow="Two-Mission Strategy" title="Stills Missions" editing={editing} onToggleEdit={() => setEditing(e => !e)} />

      {editing ? (
        <div>
          <EditField label="Isolation Notes" value={project.isolationNotes} onChange={v => onChange({ isolationNotes: v })} multiline />
          <EditField label="Mission 1 Summary" value={project.mission1Summary} onChange={v => onChange({ mission1Summary: v })} multiline />
          <EditField label="Mission 2 Summary" value={project.mission2Summary} onChange={v => onChange({ mission2Summary: v })} multiline />
        </div>
      ) : (
        <div>
          {project.isolationNotes && (
            <p style={{ color: 'var(--text-2)', marginBottom: 20, fontSize: 14 }}>{project.isolationNotes}</p>
          )}
          <Card style={{ borderLeft: '3px solid var(--blue)', marginBottom: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 8 }}>
              Mission 1 — Designed Graphic Units
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>{project.mission1Summary || '—'}</p>
          </Card>
          <Card style={{ borderLeft: '3px solid var(--green)' }}>
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>
              Mission 2 — Self-Contained Images
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>{project.mission2Summary || '—'}</p>
          </Card>
        </div>
      )}
    </section>
  )
}
