'use client'

import { useState } from 'react'
import { Project, WorkflowStep } from '@/lib/types'
import { SectionHeader, AddButton } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function C1Workflow({ project, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const steps = project.workflowSteps ?? []

  const inputStyle = {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text)', padding: '6px 10px', fontSize: 13, width: '100%',
  }

  const addStep = (phase: 'setup' | 'onset') => {
    const phaseSteps = steps.filter(s => s.phase === phase)
    const s: WorkflowStep = {
      id: crypto.randomUUID(),
      phase,
      number: phaseSteps.length + 1,
      title: '',
      notes: '',
    }
    onChange({ workflowSteps: [...steps, s] })
  }
  const updateStep = (id: string, updates: Partial<WorkflowStep>) =>
    onChange({ workflowSteps: steps.map(s => s.id === id ? { ...s, ...updates } : s) })

  const renderPhase = (phase: 'setup' | 'onset', label: string) => {
    const phaseSteps = steps.filter(s => s.phase === phase).sort((a, b) => a.number - b.number)
    return (
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>{label}</div>
        {phaseSteps.map((step, i) => (
          editing ? (
            <div key={step.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <input type="number" value={step.number} onChange={e => updateStep(step.id, { number: parseInt(e.target.value) || 1 })}
                  style={{ ...inputStyle, width: 60 }} />
                <input value={step.title} placeholder="Step title" onChange={e => updateStep(step.id, { title: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => onChange({ workflowSteps: steps.filter(s => s.id !== step.id) })}
                  style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
              </div>
              <input value={step.notes} placeholder="Notes" onChange={e => updateStep(step.id, { notes: e.target.value })} style={inputStyle} />
            </div>
          ) : (
            <div key={step.id} style={{ display: 'flex', gap: 16, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--red)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>
                {step.number}
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{step.title}</div>
                {step.notes && <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{step.notes}</p>}
              </div>
            </div>
          )
        ))}
        {editing && <AddButton onClick={() => addStep(phase)} label={`Add ${label} Step`} />}
        {phaseSteps.length === 0 && !editing && <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No steps defined.</p>}
      </div>
    )
  }

  return (
    <section>
      <SectionHeader eyebrow="C1 Workflow" title="Capture One Workflow" editing={editing} onToggleEdit={() => setEditing(e => !e)} />
      {renderPhase('setup', 'Setup')}
      {renderPhase('onset', 'On Set')}
    </section>
  )
}
