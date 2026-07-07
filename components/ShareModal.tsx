'use client'

import { useState } from 'react'
import { Project } from '@/lib/types'

const ALL_SECTIONS = [
  { id: 'brief', label: 'Brief' },
  { id: 'missions', label: 'Stills Missions' },
  { id: 'shots', label: 'Shot List' },
  { id: 'light', label: 'Light Strategy' },
  { id: 'gear', label: 'Gear Plan' },
  { id: 'locations', label: 'Locations' },
  { id: 'workflow', label: 'On-Set Monitoring' },
  { id: 'competitive', label: 'Competitive' },
  { id: 'openitems', label: 'Open Items' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'checklist', label: 'Checklist' },
]

const DEFAULT_SHARED = ALL_SECTIONS.filter(s => s.id !== 'competitive').map(s => s.id)

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
  onClose: () => void
}

export default function ShareModal({ project, onChange, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const isSharing = !!project.shareToken
  const sharedSections = project.sharedSections ?? DEFAULT_SHARED

  const shareUrl = typeof window !== 'undefined' && project.shareToken
    ? `${window.location.origin}/share/${project.shareToken}`
    : ''

  const enableSharing = () => {
    const token = crypto.randomUUID()
    onChange({ shareToken: token, sharedSections: DEFAULT_SHARED })
  }

  const disableSharing = () => {
    onChange({ shareToken: null, sharedSections: [] })
  }

  const toggleSection = (id: string) => {
    const next = sharedSections.includes(id)
      ? sharedSections.filter(s => s !== id)
      : [...sharedSections, id]
    onChange({ sharedSections: next })
  }

  const copyLink = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 400, background: 'var(--bg2)', border: '1px solid var(--border-med)',
        borderRadius: 12, padding: 28, width: 'min(480px, calc(100vw - 32px))',
        maxHeight: 'calc(100vh - 64px)', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 22 }}>Share Project</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                {isSharing ? 'Sharing enabled' : 'Sharing disabled'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {isSharing ? 'Anyone with the link can view selected sections' : 'Project is private'}
              </div>
            </div>
            <button
              onClick={isSharing ? disableSharing : enableSharing}
              style={{
                padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                background: isSharing ? 'var(--bg4)' : 'var(--accent)',
                border: `1px solid ${isSharing ? 'var(--border-med)' : 'transparent'}`,
                color: isSharing ? 'var(--text-2)' : '#111',
              }}
            >
              {isSharing ? 'Disable' : 'Enable sharing'}
            </button>
          </div>

          {isSharing && shareUrl && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                readOnly
                value={shareUrl}
                style={{
                  flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6,
                  color: 'var(--text-2)', fontSize: 12, padding: '8px 12px', outline: 'none', fontFamily: 'monospace',
                }}
              />
              <button
                onClick={copyLink}
                style={{
                  padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                  background: copied ? 'var(--green)' : 'var(--bg3)',
                  border: '1px solid var(--border-med)', color: copied ? '#fff' : 'var(--text-2)',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {isSharing && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Visible sections</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {ALL_SECTIONS.map(s => {
                const active = sharedSections.includes(s.id)
                return (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, cursor: 'pointer', background: active ? 'var(--bg3)' : 'transparent' }}>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleSection(s.id)}
                      style={{ accentColor: 'var(--accent)', width: 15, height: 15, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: active ? 'var(--text)' : 'var(--text-3)' }}>{s.label}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
