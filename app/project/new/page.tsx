'use client'

import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Project } from '@/lib/types'
import { saveProject } from '@/lib/storage'
import { generateProjectFromBrief } from '@/lib/generate'
import { parseFile, Attachment } from '@/lib/attachments'
import Header from '@/components/layout/Header'
import { EditField } from '@/components/ui'

function emptyProject(): Project {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientName: '', campaignName: '', shootDate: '', shootLocation: '',
    myRole: 'Lead Photographer', deliverable: '', director: '', producer: '',
    captureSetup: 'Capture One tethered → client monitor',
    campaignSentence: '', character: '', location: '', event: '',
    revealImage: '', themeWord: '',
    colourPalette: [], alerts: [],
    isolationNotes: '', mission1Summary: '', mission2Summary: '',
    shots: [],
    lightNotes: '', lightWindows: [], scenarioResponses: [],
    confirmedGear: [], rentalRecommendations: [],
    candidateLocations: [], recceItems: [],
    workflowSteps: [],
    competitors: [],
    openItemGroups: [],
    contacts: [],
    checklistGroups: [],
  }
}

const LOADING_MESSAGES = [
  'Reading the brief...',
  'Analysing attachments...',
  'Mapping the story framework...',
  'Building the shot list...',
  'Planning the light strategy...',
  'Finalising pre-production data...',
]

const ACCEPTED_TYPES = '.pdf,.txt,.md,.jpg,.jpeg,.png,.gif,.webp'

function AttachmentChip({
  att,
  onRemove,
}: {
  att: Attachment
  onRemove: () => void
}) {
  const icon = att.type === 'image' ? '🖼' : '📄'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px', borderRadius: 20,
      background: att.truncated ? 'rgba(212,130,26,0.1)' : 'var(--bg3)',
      border: `1px solid ${att.truncated ? 'rgba(212,130,26,0.4)' : 'var(--border-med)'}`,
      fontSize: 12, color: 'var(--text-2)',
    }}
      title={att.truncated ? 'File was truncated to fit the context window' : undefined}
    >
      <span>{icon}</span>
      <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {att.name}
      </span>
      {att.truncated && <span style={{ color: 'var(--amber)', fontSize: 10, fontWeight: 600 }}>truncated</span>}
      <span style={{ color: 'var(--text-3)', fontSize: 10 }}>{att.sizeKB}KB</span>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '0 2px', fontSize: 14, lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  )
}

function NewProjectContent() {
  const router = useRouter()
  const params = useSearchParams()
  const mode = params.get('mode') ?? 'scratch'

  const [step, setStep] = useState<'intake' | 'loading' | 'review'>(mode === 'brief' ? 'intake' : 'review')
  const [brief, setBrief] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [showContext, setShowContext] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [dragging, setDragging] = useState(false)
  const [parseError, setParseError] = useState('')
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
  const [project, setProject] = useState<Project>(emptyProject())
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canGenerate = brief.trim().length > 0 || attachments.length > 0

  const addFiles = async (files: FileList | File[]) => {
    setParseError('')
    const arr = Array.from(files)
    const results: Attachment[] = []
    for (const file of arr) {
      try {
        const att = await parseFile(file)
        results.push(att)
      } catch (e) {
        setParseError(`Could not read "${file.name}": ${(e as Error).message}`)
      }
    }
    setAttachments(prev => [...prev, ...results])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  const handleGenerate = async () => {
    if (!canGenerate) return
    setStep('loading')
    setError('')

    let msgIdx = 0
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[msgIdx])
    }, 1200)

    try {
      const generated = await generateProjectFromBrief(brief, additionalContext, attachments)
      const base = emptyProject()
      const merged: Project = {
        ...base,
        ...generated,
        id: base.id,
        createdAt: base.createdAt,
        updatedAt: base.updatedAt,
        colourPalette: generated.colourPalette ?? [],
        alerts: generated.alerts ?? [],
        shots: generated.shots ?? [],
        lightWindows: generated.lightWindows ?? [],
        scenarioResponses: generated.scenarioResponses ?? [],
        confirmedGear: generated.confirmedGear ?? [],
        rentalRecommendations: generated.rentalRecommendations ?? [],
        candidateLocations: generated.candidateLocations ?? [],
        recceItems: generated.recceItems ?? [],
        workflowSteps: generated.workflowSteps ?? [],
        competitors: generated.competitors ?? [],
        openItemGroups: generated.openItemGroups ?? [],
        contacts: generated.contacts ?? [],
        checklistGroups: generated.checklistGroups ?? [],
      }
      setProject(merged)
      setStep('review')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Generation failed'
      setError(msg)
      setStep('intake')
    } finally {
      clearInterval(interval)
    }
  }

  const handleCreate = () => {
    saveProject(project)
    router.push(`/project/${project.id}`)
  }

  const update = (updates: Partial<Project>) => setProject(p => ({ ...p, ...updates }))

  // ── Loading ────────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid var(--bg4)', borderTopColor: 'var(--red)',
            animation: 'spin 1s linear infinite', margin: '0 auto 24px',
          }} />
          <p style={{ color: 'var(--text-2)', fontSize: 16 }}>{loadingMsg}</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Intake ─────────────────────────────────────────────────────────────────
  if (step === 'intake') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Header />
        <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>
            New Project
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 32, marginBottom: 8 }}>Generate from brief</h1>
          <p style={{ color: 'var(--text-2)', marginBottom: 32, fontSize: 14 }}>
            Paste a brief, drop in attachments, or both. PDFs, images, and text files all work.
          </p>

          {error && (
            <div style={{ background: 'var(--danger-light)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, padding: '12px 16px', color: 'var(--danger)', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          {/* Brief textarea */}
          <div style={{ marginBottom: 16 }}>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              placeholder="Paste your creative brief, AV script, pitch deck text, project overview, or any combination. The more context, the better."
              style={{
                width: '100%', minHeight: 200,
                background: 'var(--bg2)', border: '1px solid var(--border-med)',
                borderRadius: 8, color: 'var(--text)', fontSize: 14,
                padding: '16px', resize: 'vertical', outline: 'none', lineHeight: 1.6,
              }}
            />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `1px dashed ${dragging ? 'var(--red)' : 'var(--border-med)'}`,
              borderRadius: 8, padding: '20px 24px', marginBottom: 16,
              background: dragging ? 'var(--red-light)' : 'var(--bg2)',
              cursor: 'pointer', transition: 'background .15s, border-color .15s',
              textAlign: 'center',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              style={{ display: 'none' }}
              onChange={e => e.target.files && addFiles(e.target.files)}
            />
            <div style={{ fontSize: 22, marginBottom: 6 }}>📎</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 2 }}>
              Drop files here or click to browse
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
              PDF, TXT, MD, JPG, PNG, WEBP
            </div>
          </div>

          {/* Attachment chips */}
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {attachments.map((att, i) => (
                <AttachmentChip
                  key={i}
                  att={att}
                  onRemove={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </div>
          )}

          {parseError && (
            <div style={{ fontSize: 12, color: 'var(--amber)', marginBottom: 12 }}>{parseError}</div>
          )}

          {/* Additional context */}
          <button
            onClick={() => setShowContext(v => !v)}
            style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12, padding: 0 }}
          >
            {showContext ? '▾' : '▸'} Additional context (optional)
          </button>

          {showContext && (
            <div style={{ marginBottom: 16 }}>
              <textarea
                value={additionalContext}
                onChange={e => setAdditionalContext(e.target.value)}
                placeholder="Anything not in the brief — shoot date, your role, deliverable count, location candidates, rental budget."
                style={{
                  width: '100%', minHeight: 100,
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text)', fontSize: 14,
                  padding: '14px 16px', resize: 'vertical', outline: 'none', lineHeight: 1.6,
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              style={{
                padding: '12px 28px',
                background: canGenerate ? 'var(--red)' : 'var(--bg4)',
                border: 'none', borderRadius: 8,
                color: canGenerate ? '#fff' : 'var(--text-3)',
                fontSize: 14, fontWeight: 600,
                cursor: canGenerate ? 'pointer' : 'not-allowed',
              }}
            >
              Generate
            </button>
            <button
              onClick={() => setStep('review')}
              style={{ padding: '12px 20px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-2)', fontSize: 14, cursor: 'pointer' }}
            >
              Skip — blank project
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ── Review / scratch ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>
              {mode === 'brief' ? 'Review Generated Project' : 'New Project'}
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 28 }}>
              {mode === 'brief' ? 'Confirm details' : 'Start from scratch'}
            </h1>
          </div>
          <button
            onClick={handleCreate}
            style={{ padding: '10px 24px', background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Create Project →
          </button>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
            <EditField label="Client Name" value={project.clientName} onChange={v => update({ clientName: v })} />
            <EditField label="Campaign Name" value={project.campaignName} onChange={v => update({ campaignName: v })} />
            <EditField label="Shoot Date" value={project.shootDate} onChange={v => update({ shootDate: v })} />
            <EditField label="Shoot Location" value={project.shootLocation} onChange={v => update({ shootLocation: v })} />
            <EditField label="My Role" value={project.myRole} onChange={v => update({ myRole: v })} />
            <EditField label="Deliverable" value={project.deliverable} onChange={v => update({ deliverable: v })} />
            <EditField label="Director" value={project.director} onChange={v => update({ director: v })} />
            <EditField label="Producer" value={project.producer} onChange={v => update({ producer: v })} />
          </div>
          <EditField label="Campaign Sentence" value={project.campaignSentence} onChange={v => update({ campaignSentence: v })} multiline />
          <EditField label="Theme Word" value={project.themeWord} onChange={v => update({ themeWord: v })} />

          {(project.shots?.length ?? 0) > 0 && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>
                {project.shots.length} shots generated · {project.checklistGroups?.length ?? 0} checklist groups
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                All sections pre-filled — you can edit everything after creating the project.
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            onClick={handleCreate}
            style={{ padding: '12px 32px', background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Create Project →
          </button>
        </div>
      </main>
    </div>
  )
}

export default function NewProjectPage() {
  return (
    <Suspense>
      <NewProjectContent />
    </Suspense>
  )
}
