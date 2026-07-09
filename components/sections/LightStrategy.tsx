'use client'

import { Project, LightWindow, ScenarioResponse } from '@/lib/types'
import { Eyebrow, InlineField, RichTextEditor, AddButton } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function LightStrategy({ project, onChange }: Props) {
  const windows = project.lightWindows ?? []
  const scenarios = project.scenarioResponses ?? []

  const addWindow = () => {
    const w: LightWindow = { id: crypto.randomUUID(), timeRange: '', label: '', notes: '' }
    onChange({ lightWindows: [...windows, w] })
  }
  const updateWindow = (id: string, updates: Partial<LightWindow>) => {
    onChange({ lightWindows: windows.map(w => w.id === id ? { ...w, ...updates } : w) })
  }
  const deleteWindow = (id: string) =>
    onChange({ lightWindows: windows.filter(w => w.id !== id) })

  const addScenario = () => {
    const s: ScenarioResponse = { id: crypto.randomUUID(), title: '', notes: '' }
    onChange({ scenarioResponses: [...scenarios, s] })
  }
  const updateScenario = (id: string, updates: Partial<ScenarioResponse>) => {
    onChange({ scenarioResponses: scenarios.map(s => s.id === id ? { ...s, ...updates } : s) })
  }
  const deleteScenario = (id: string) =>
    onChange({ scenarioResponses: scenarios.filter(s => s.id !== id) })

  return (
    <section>
      <Eyebrow>Light Strategy</Eyebrow>

      {/* Light Notes */}
      <div
        style={{
          padding: '18px 0 24px',
          borderBottom: '1px solid rgba(74,66,60,0.6)',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: 'var(--gold)',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '.16em',
            fontWeight: 500,
          }}
        >
          Light Notes
        </div>
        <RichTextEditor
          fieldKey="light.notes"
          value={project.lightNotes ?? ''}
          onChange={v => onChange({ lightNotes: v })}
          placeholder="—"
          ariaLabel="Light notes"
          textStyle={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text)' }}
        />
      </div>

      {/* Light Windows */}
      <div style={{ marginBottom: 40 }}>
        <Eyebrow>Light Windows</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
          {windows.length === 0 && (
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No light windows defined.</p>
          )}
          {windows.map(w => (
            <div
              key={w.id}
              style={{
                position: 'relative',
                padding: '18px 20px',
                background: 'var(--surface)',
                border: '1px solid rgba(74,66,60,0.6)',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 12, marginBottom: 10, paddingRight: 24 }}>
                <InlineField
                  fieldKey={`window.${w.id}.timeRange`}
                  value={w.timeRange}
                  onChange={v => updateWindow(w.id, { timeRange: v })}
                  placeholder="Time range…"
                  ariaLabel="Time range"
                  textStyle={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--gold)',
                  }}
                  inputStyle={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}
                />
                <InlineField
                  fieldKey={`window.${w.id}.label`}
                  value={w.label}
                  onChange={v => updateWindow(w.id, { label: v })}
                  placeholder="Window label…"
                  ariaLabel="Window label"
                  textStyle={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}
                />
              </div>
              <RichTextEditor
                fieldKey={`window.${w.id}.notes`}
                value={w.notes}
                onChange={v => updateWindow(w.id, { notes: v })}
                placeholder="Notes…"
                ariaLabel="Window notes"
                textStyle={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-2)' }}
              />
              <button
                onClick={() => deleteWindow(w.id)}
                aria-label="Delete light window"
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'none', border: 'none',
                  color: 'var(--text-3)', cursor: 'pointer',
                  fontSize: 18, padding: '0 4px', lineHeight: 1,
                }}
              >×</button>
            </div>
          ))}
        </div>
        <AddButton onClick={addWindow} label="Add Light Window" />
      </div>

      {/* Scenario Responses */}
      <div>
        <Eyebrow>Scenario Responses</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
          {scenarios.length === 0 && (
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No scenario responses defined.</p>
          )}
          {scenarios.map(s => (
            <div
              key={s.id}
              style={{
                position: 'relative',
                padding: '18px 20px',
                background: 'var(--surface)',
                border: '1px solid rgba(74,66,60,0.6)',
              }}
            >
              <div style={{ marginBottom: 8, paddingRight: 24 }}>
                <InlineField
                  fieldKey={`scenario.${s.id}.title`}
                  value={s.title}
                  onChange={v => updateScenario(s.id, { title: v })}
                  placeholder="Scenario title…"
                  ariaLabel="Scenario title"
                  textStyle={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}
                />
              </div>
              <RichTextEditor
                fieldKey={`scenario.${s.id}.notes`}
                value={s.notes}
                onChange={v => updateScenario(s.id, { notes: v })}
                placeholder="Response / notes…"
                ariaLabel="Scenario notes"
                textStyle={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-2)' }}
              />
              <button
                onClick={() => deleteScenario(s.id)}
                aria-label="Delete scenario response"
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'none', border: 'none',
                  color: 'var(--text-3)', cursor: 'pointer',
                  fontSize: 18, padding: '0 4px', lineHeight: 1,
                }}
              >×</button>
            </div>
          ))}
        </div>
        <AddButton onClick={addScenario} label="Add Scenario" />
      </div>
    </section>
  )
}
