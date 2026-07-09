'use client'

import { Project, Mission } from '@/lib/types'
import { Eyebrow, InlineField, RichTextEditor, AddButton, stripMissionPrefix } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function StillsMissions({ project, onChange }: Props) {
  const missions: Mission[] = project.missions ?? []

  const addMission = () => {
    const m: Mission = {
      id: crypto.randomUUID(),
      name: '',
      summary: '',
    }
    onChange({ missions: [...missions, m] })
  }

  const updateMission = (id: string, updates: Partial<Mission>) =>
    onChange({ missions: missions.map(m => m.id === id ? { ...m, ...updates } : m) })

  const deleteMission = (id: string) =>
    onChange({ missions: missions.filter(m => m.id !== id) })

  return (
    <section>
      <Eyebrow>Missions Strategy</Eyebrow>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Isolation Notes
        </div>
        <RichTextEditor
          fieldKey="missions.isolationNotes"
          value={project.isolationNotes ?? ''}
          onChange={v => onChange({ isolationNotes: v })}
          placeholder="Add isolation notes…"
          ariaLabel="Isolation notes"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        {missions.length === 0 && (
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No missions defined yet.</p>
        )}
        {missions.map((m, i) => {
          const cleanName = stripMissionPrefix(m.name)
          return (
            <div
              key={m.id}
              style={{
                position: 'relative',
                padding: '20px 22px',
                background: 'var(--surface)',
                border: '1px solid rgba(74,66,60,0.6)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-serif, serif)',
                  fontWeight: 500,
                  fontSize: 20,
                  marginBottom: 10,
                  color: 'var(--text)',
                }}
              >
                Mission {i + 1} —{' '}
                <InlineField
                  fieldKey={`mission.${m.id}.name`}
                  value={cleanName}
                  onChange={v => updateMission(m.id, { name: stripMissionPrefix(v) })}
                  placeholder="Mission title…"
                  ariaLabel={`Mission ${i + 1} name`}
                  textStyle={{ fontFamily: 'var(--font-serif, serif)', fontSize: 20, color: 'var(--text)' }}
                  inputStyle={{ fontFamily: 'var(--font-serif, serif)', fontSize: 20 }}
                />
              </div>
              <RichTextEditor
                fieldKey={`mission.${m.id}.summary`}
                value={m.summary}
                onChange={v => updateMission(m.id, { summary: v })}
                placeholder="Describe the visual intent, approach, and key shots for this mission…"
                textStyle={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}
                ariaLabel={`Mission ${i + 1} summary`}
              />
              {missions.length > 1 && (
                <button
                  onClick={() => deleteMission(m.id)}
                  aria-label={`Delete Mission ${i + 1}`}
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'none', border: 'none',
                    color: 'var(--text-3)', cursor: 'pointer',
                    fontSize: 18, padding: '0 4px', lineHeight: 1,
                  }}
                >×</button>
              )}
            </div>
          )
        })}
      </div>

      <AddButton onClick={addMission} label="Add Mission" />
    </section>
  )
}
