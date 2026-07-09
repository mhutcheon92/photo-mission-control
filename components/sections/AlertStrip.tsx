'use client'

import { useState } from 'react'
import { Project, Alert } from '@/lib/types'
import { requestAlertResolution } from '@/lib/resolveAlert'
import { AutoTextarea } from '@/components/ui'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

function severityBadge(a: Alert): { label: string; bg: string; fg: string } {
  const sev = a.severity ?? (a.type === 'red' ? 'urgent' : 'flag')
  if (sev === 'urgent') return { label: 'URGENT', bg: 'var(--urgent-bg)', fg: 'var(--urgent-fg)' }
  return { label: 'FLAG', bg: 'var(--flag-bg)', fg: 'var(--flag-fg)' }
}

export default function AlertStrip({ project, onChange }: Props) {
  const [alertsOpen, setAlertsOpen] = useState(true)
  const [resolvedOpen, setResolvedOpen] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)

  const alerts = project.alerts ?? []
  const openAlerts = alerts.filter(a => a.status !== 'resolved')
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved')

  if (alerts.length === 0) return null

  const updateAlert = (id: string | undefined, updates: Partial<Alert>) => {
    if (!id) return
    const next = alerts.map(a => (a.id === id ? { ...a, ...updates } : a))
    onChange({ alerts: next })
  }

  const startResolve = async (alert: Alert) => {
    if (!alert.id) return
    setBusyId(alert.id)
    setErrorId(null)
    try {
      const cached = alert.suggestions ?? []
      let suggestions = cached
      if (suggestions.length < 2) {
        const res = await requestAlertResolution(alert, project)
        suggestions = res.suggestions
      }
      updateAlert(alert.id, {
        status: 'drafting',
        suggestions,
        draftIndex: 0,
        draftText: suggestions[0] ?? '',
      })
    } catch {
      setErrorId(alert.id)
    } finally {
      setBusyId(null)
    }
  }

  const regenerate = async (alert: Alert) => {
    if (!alert.id) return
    const cached = alert.suggestions ?? []
    const currentIdx = alert.draftIndex ?? 0
    // If we already have another cached variant, cycle to it
    if (cached.length > 1 && currentIdx + 1 < cached.length) {
      const nextIdx = currentIdx + 1
      updateAlert(alert.id, { draftIndex: nextIdx, draftText: cached[nextIdx] })
      return
    }
    // Otherwise fetch a fresh pair
    setBusyId(alert.id)
    setErrorId(null)
    try {
      const res = await requestAlertResolution(alert, project)
      updateAlert(alert.id, {
        suggestions: res.suggestions,
        draftIndex: 0,
        draftText: res.suggestions[0] ?? '',
      })
    } catch {
      setErrorId(alert.id)
    } finally {
      setBusyId(null)
    }
  }

  const accept = (alert: Alert) => {
    updateAlert(alert.id, {
      status: 'resolved',
      resolutionText: alert.draftText ?? '',
    })
  }

  const cancel = (alert: Alert) => {
    updateAlert(alert.id, {
      status: 'open',
      draftText: '',
    })
  }

  const reopen = (alert: Alert) => {
    updateAlert(alert.id, {
      status: 'open',
      draftText: '',
      resolutionText: '',
    })
  }

  return (
    <div
      style={{
        background: 'rgba(60, 30, 22, 0.28)',
        border: '1px solid #8A4A3A66',
        marginBottom: 28,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setAlertsOpen(v => !v)}
        aria-expanded={alertsOpen}
        aria-label={`${alertsOpen ? 'Collapse' : 'Expand'} needs attention alerts`}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text)', fontFamily: 'inherit',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, fontSize: 13, letterSpacing: '.03em' }}>
          <span style={{ color: 'var(--urgent-fg)' }}>⚠</span>
          Needs attention — {openAlerts.length} unresolved
        </span>
        <span aria-hidden style={{ color: 'var(--text-3)', fontSize: 12 }}>{alertsOpen ? '▲' : '▼'}</span>
      </button>

      {alertsOpen && (
        <div style={{ padding: '0 20px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {openAlerts.map((a) => {
            const badge = severityBadge(a)
            const isDrafting = a.status === 'drafting'
            const isBusy = busyId === a.id
            const hadError = errorId === a.id
            return (
              <div
                key={a.id}
                style={{
                  padding: '14px',
                  background: 'var(--surface-alt)',
                  border: '1px solid rgba(74,66,60,0.6)',
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: 10, fontWeight: 600, letterSpacing: '.06em',
                      padding: '2px 8px',
                      background: badge.bg, color: badge.fg,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {badge.label}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.6 }}>{a.text}</div>
                    {a.owner && (
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 5 }}>
                        Owner: {a.owner}
                      </div>
                    )}
                  </div>
                </div>

                {!isDrafting && (
                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={() => startResolve(a)}
                      disabled={isBusy}
                      style={{
                        padding: '10px 16px',
                        background: 'var(--gold)', border: 'none',
                        color: 'var(--gold-on)',
                        fontSize: 11.5, letterSpacing: '.05em', textTransform: 'uppercase',
                        fontWeight: 600, cursor: isBusy ? 'wait' : 'pointer',
                      }}
                    >
                      {isBusy ? 'Drafting…' : '✦ Resolve with AI'}
                    </button>
                    {hadError && (
                      <span style={{ marginLeft: 10, fontSize: 11.5, color: 'var(--danger)' }}>
                        Couldn&apos;t draft — try again.
                      </span>
                    )}
                  </div>
                )}

                {isDrafting && (
                  <div style={{ marginTop: 14, padding: 14, background: 'var(--surface)', border: '1px solid #C9A87655' }}>
                    <div style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
                      AI-suggested resolution — edit before accepting
                    </div>
                    <AutoTextarea
                      value={a.draftText ?? ''}
                      onChange={e => updateAlert(a.id, { draftText: e.target.value })}
                      aria-label="Resolution draft"
                      style={{
                        width: '100%', minHeight: 90,
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border-med)',
                        color: 'var(--text)', fontSize: 12.5,
                        fontFamily: 'inherit',
                        padding: '9px 10px', outline: 'none', lineHeight: 1.55,
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                      <button
                        onClick={() => accept(a)}
                        style={{
                          padding: '10px 16px',
                          background: 'var(--gold)', border: 'none',
                          color: 'var(--gold-on)',
                          fontSize: 11.5, letterSpacing: '.05em', textTransform: 'uppercase',
                          fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Accept &amp; resolve
                      </button>
                      <button
                        onClick={() => regenerate(a)}
                        disabled={isBusy}
                        style={{
                          padding: '10px 16px', background: 'none',
                          border: '1px solid var(--border-med)',
                          color: 'var(--text-2)',
                          fontSize: 11.5, letterSpacing: '.05em', textTransform: 'uppercase',
                          cursor: isBusy ? 'wait' : 'pointer',
                        }}
                      >
                        {isBusy ? 'Regenerating…' : '↻ Regenerate'}
                      </button>
                      <button
                        onClick={() => cancel(a)}
                        style={{
                          padding: '10px 16px', background: 'none', border: 'none',
                          color: 'var(--text-3)',
                          fontSize: 11.5, letterSpacing: '.05em', textTransform: 'uppercase',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {resolvedAlerts.length > 0 && (
            <div>
              <button
                onClick={() => setResolvedOpen(v => !v)}
                aria-expanded={resolvedOpen}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-3)', fontSize: 12,
                  cursor: 'pointer', padding: '4px 0',
                  fontFamily: 'inherit',
                }}
              >
                {resolvedOpen ? '▾' : '▸'} Resolved ({resolvedAlerts.length})
              </button>
              {resolvedOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {resolvedAlerts.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(25, 22, 20, 0.5)',
                        border: '1px solid rgba(74,66,60,0.6)',
                      }}
                    >
                      <div style={{ fontSize: 12.5, color: 'var(--text-3)', textDecoration: 'line-through', marginBottom: 5 }}>
                        {a.text}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
                        ✓ Resolution: {a.resolutionText || '—'}
                      </div>
                      <button
                        onClick={() => reopen(a)}
                        style={{
                          background: 'none', border: 'none',
                          color: 'var(--text-3)', fontSize: 11,
                          cursor: 'pointer', padding: 0, textDecoration: 'underline',
                          fontFamily: 'inherit',
                        }}
                      >
                        Reopen
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
