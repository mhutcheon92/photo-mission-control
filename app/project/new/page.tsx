'use client'

import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Project, ProjectType, Mission } from '@/lib/types'
import { saveProject } from '@/lib/storage'
import { generateProjectFromBrief } from '@/lib/generate'
import { parseFile, Attachment } from '@/lib/attachments'
import { getGearInventory } from '@/lib/gearInventory'
import Header from '@/components/layout/Header'
import { EditField } from '@/components/ui'

const PROJECT_TYPES: { id: ProjectType; label: string; description: string; color: string }[] = [
  { id: 'commercial', label: 'Commercial', description: 'Advertising, product, branded content', color: '#C0392B' },
  { id: 'elopement', label: 'Elopement', description: 'Intimate ceremonies, destination weddings', color: '#87AECC' },
  { id: 'family', label: 'Family', description: 'Family portraits, children, lifestyle', color: '#4A7C3F' },
  { id: 'portrait', label: 'Portrait', description: 'Individual, branding, headshots', color: '#D4821A' },
]

function emptyProject(projectType: ProjectType = 'commercial'): Project {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectType,
    clientName: '', campaignName: '', shootDate: '', shootLocation: '',
    myRole: 'Lead Photographer', deliverable: '', director: '', producer: '',
    captureSetup: 'Capture One tethered → client monitor',
    mood: '', tone: '', styleReferences: '',
    campaignSentence: '', character: '', location: '', event: '',
    revealImage: '', themeWord: '',
    colourPalette: [], alerts: [],
    isolationNotes: '', missions: [],
    shots: [],
    lightNotes: '', lightWindows: [], scenarioResponses: [],
    confirmedGear: [], rentalRecommendations: [],
    candidateLocations: [], recceItems: [],
    workflowSteps: [],
    competitors: [],
    openItemGroups: [],
    contacts: [],
    checklistGroups: [],
    shareToken: null, sharedSections: [],
  }
}

const LOADING_MESSAGES = [
  'Reading the brief...',
  'Applying frameworks...',
  'Mapping the story structure...',
  'Building the shot list...',
  'Planning the light strategy...',
  'Finalising pre-production data...',
]

const ACCEPTED_TYPES = '.pdf,.txt,.md,.jpg,.jpeg,.png,.gif,.webp'

function AttachmentChip({ att, onRemove }: { att: Attachment; onRemove: () => void }) {
  const icon = att.type === 'image' ? '🖼' : '📄'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px', borderRadius: 20,
      background: att.truncated ? 'rgba(212,130,26,0.1)' : 'var(--bg3)',
      border: `1px solid ${att.truncated ? 'rgba(212,130,26,0.4)' : 'var(--border-med)'}`,
      fontSize: 12, color: 'var(--text-2)',
    }} title={att.truncated ? 'File was truncated to fit the context window' : undefined}>
      <span>{icon}</span>
      <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
      {att.truncated && <span style={{ color: 'var(--amber)', fontSize: 10, fontWeight: 600 }}>truncated</span>}
      <span style={{ color: 'var(--text-3)', fontSize: 10 }}>{att.sizeKB}KB</span>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '0 2px', fontSize: 14, lineHeight: 1 }}>×</button>
    </div>
  )
}

type Step = 'typeselect' | 'intake' | 'loading' | 'review'

function NewProjectContent() {
  const router = useRouter()
  const params = useSearchParams()
  const mode = params.get('mode') ?? 'scratch'

  const [step, setStep] = useState<Step>('typeselect')
  const [projectType, setProjectType] = useState<ProjectType>('commercial')
  const [brief, setBrief] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [showContext, setShowContext] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [dragging, setDragging] = useState(false)
  const [parseError, setParseError] = useState('')
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
  const [project, setProject] = useState<Project>(emptyProject())
  const [error, setError] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('details')
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
      const gearInventory = getGearInventory()
      const generated = await generateProjectFromBrief(brief, additionalContext, attachments, {
        projectType,
        gearInventory,
      })
      const base = emptyProject(projectType)
      const merged: Project = {
        ...base,
        ...generated,
        id: base.id,
        createdAt: base.createdAt,
        updatedAt: base.updatedAt,
        projectType,
        colourPalette: generated.colourPalette ?? [],
        alerts: generated.alerts ?? [],
        missions: generated.missions ?? [],
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
        shareToken: null,
        sharedSections: [],
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
    const finalProject = { ...project, projectType }
    saveProject(finalProject)
    router.push(`/project/${finalProject.id}`)
  }

  const update = (updates: Partial<Project>) => setProject(p => ({ ...p, ...updates }))

  const typeConfig = PROJECT_TYPES.find(t => t.id === projectType)!

  // ── Type Select ────────────────────────────────────────────────────────────
  if (step === 'typeselect') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Header />
        <main style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(32px, 6vw, 56px) clamp(16px, 5vw, 24px)' }}>
          <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>New Project</div>
          <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: 8 }}>What type of shoot?</h1>
          <p style={{ color: 'var(--text-2)', marginBottom: 32, fontSize: 14 }}>
            Selecting a project type applies the right frameworks and resources to the AI generation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 32 }}>
            {PROJECT_TYPES.map(type => {
              const selected = projectType === type.id
              return (
                <button
                  key={type.id}
                  onClick={() => setProjectType(type.id)}
                  style={{
                    textAlign: 'left', padding: '18px 20px', borderRadius: 10, cursor: 'pointer',
                    background: selected ? `${type.color}18` : 'var(--bg2)',
                    border: `2px solid ${selected ? type.color : 'var(--border)'}`,
                    transition: 'border-color .15s, background .15s',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, color: selected ? type.color : 'var(--text)', marginBottom: 4 }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{type.description}</div>
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                setProject(emptyProject(projectType))
                if (mode === 'brief') {
                  setStep('intake')
                } else {
                  setStep('review')
                }
              }}
              style={{ padding: '12px 28px', background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              {mode === 'brief' ? 'Continue to Brief →' : 'Continue →'}
            </button>
          </div>
        </main>
      </div>
    )
  }

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
        <main style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(32px, 6vw, 56px) clamp(16px, 5vw, 24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <button onClick={() => setStep('typeselect')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13, padding: 0 }}>← Back</button>
            <span style={{ color: 'var(--border)', fontSize: 12 }}>|</span>
            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: `${typeConfig.color}18`, color: typeConfig.color, fontWeight: 600 }}>
              {typeConfig.label}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: 8 }}>Generate from brief</h1>
          <p style={{ color: 'var(--text-2)', marginBottom: 32, fontSize: 14 }}>
            Paste a brief, drop in attachments, or both. PDFs, images, and text files all work.
          </p>

          {error && (
            <div style={{ background: 'var(--danger-light)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, padding: '12px 16px', color: 'var(--danger)', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

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
                boxSizing: 'border-box',
              }}
            />
          </div>

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
            <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES} multiple style={{ display: 'none' }}
              onChange={e => e.target.files && addFiles(e.target.files)} />
            <div style={{ fontSize: 22, marginBottom: 6 }}>📎</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 2 }}>Drop files here or click to browse</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>PDF, TXT, MD, JPG, PNG, WEBP</div>
          </div>

          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {attachments.map((att, i) => (
                <AttachmentChip key={i} att={att} onRemove={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} />
              ))}
            </div>
          )}

          {parseError && <div style={{ fontSize: 12, color: 'var(--amber)', marginBottom: 12 }}>{parseError}</div>}

          <button onClick={() => setShowContext(v => !v)}
            style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12, padding: 0 }}>
            {showContext ? '▾' : '▸'} Additional context (optional)
          </button>

          {showContext && (
            <div style={{ marginBottom: 16 }}>
              <textarea value={additionalContext} onChange={e => setAdditionalContext(e.target.value)}
                placeholder="Anything not in the brief — shoot date, your role, deliverable count, location candidates, rental budget."
                style={{
                  width: '100%', minHeight: 100,
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text)', fontSize: 14,
                  padding: '14px 16px', resize: 'vertical', outline: 'none', lineHeight: 1.6,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={handleGenerate} disabled={!canGenerate}
              style={{
                padding: '12px 28px', background: canGenerate ? 'var(--red)' : 'var(--bg4)',
                border: 'none', borderRadius: 8, color: canGenerate ? '#fff' : 'var(--text-3)',
                fontSize: 14, fontWeight: 600, cursor: canGenerate ? 'pointer' : 'not-allowed',
              }}>
              Generate
            </button>
            <button onClick={() => { setProject(emptyProject(projectType)); setStep('review') }}
              style={{ padding: '12px 20px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-2)', fontSize: 14, cursor: 'pointer' }}>
              Skip — blank project
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ── Review ─────────────────────────────────────────────────────────────────
  const sectionToggle = (id: string) => setExpandedSection(s => s === id ? null : id)
  const missions: Mission[] = project.missions ?? []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(32px, 6vw, 56px) clamp(16px, 5vw, 24px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                {mode === 'brief' ? 'Review Generated Project' : 'New Project'}
              </span>
              <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: `${typeConfig.color}18`, color: typeConfig.color, fontWeight: 600 }}>
                {typeConfig.label}
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 'clamp(22px, 5vw, 28px)' }}>
              {mode === 'brief' ? 'Confirm details' : 'Start from scratch'}
            </h1>
          </div>
          <button onClick={handleCreate}
            style={{ padding: '10px 24px', background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
            Create Project →
          </button>
        </div>

        {/* Campaign Details */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
          <button onClick={() => sectionToggle('details')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Campaign Details</span>
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{expandedSection === 'details' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'details' && (
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 0 }}>
                <EditField label="Client Name" value={project.clientName} onChange={v => update({ clientName: v })} />
                <EditField label="Campaign Name" value={project.campaignName} onChange={v => update({ campaignName: v })} />
                <EditField label="Shoot Date" value={project.shootDate} onChange={v => update({ shootDate: v })} />
                <EditField label="Shoot Location" value={project.shootLocation} onChange={v => update({ shootLocation: v })} />
                <EditField label="My Role" value={project.myRole} onChange={v => update({ myRole: v })} />
                <EditField label="Deliverable" value={project.deliverable} onChange={v => update({ deliverable: v })} />
                <EditField label="Director" value={project.director} onChange={v => update({ director: v })} />
                <EditField label="Producer" value={project.producer} onChange={v => update({ producer: v })} />
              </div>
            </div>
          )}
        </div>

        {/* Creative Approach */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
          <button onClick={() => sectionToggle('creative')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Creative Approach</span>
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{expandedSection === 'creative' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'creative' && (
            <div style={{ padding: '0 20px 20px' }}>
              <EditField label="Mood" value={project.mood ?? ''} onChange={v => update({ mood: v })} />
              <EditField label="Tone" value={project.tone ?? ''} onChange={v => update({ tone: v })} />
              <EditField label="Style References" value={project.styleReferences ?? ''} onChange={v => update({ styleReferences: v })} multiline />
            </div>
          )}
        </div>

        {/* Story Foundation */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
          <button onClick={() => sectionToggle('story')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Story Foundation</span>
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{expandedSection === 'story' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'story' && (
            <div style={{ padding: '0 20px 20px' }}>
              <EditField label="Campaign Sentence" value={project.campaignSentence} onChange={v => update({ campaignSentence: v })} multiline />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 0 }}>
                <EditField label="Character" value={project.character} onChange={v => update({ character: v })} multiline />
                <EditField label="Location" value={project.location} onChange={v => update({ location: v })} multiline />
                <EditField label="Event" value={project.event} onChange={v => update({ event: v })} multiline />
                <EditField label="Reveal Image" value={project.revealImage} onChange={v => update({ revealImage: v })} multiline />
              </div>
              <EditField label="Theme Word" value={project.themeWord} onChange={v => update({ themeWord: v })} />
            </div>
          )}
        </div>

        {/* Generated Content Summary */}
        {mode === 'brief' && (missions.length > 0 || project.shots.length > 0 || project.checklistGroups.length > 0) && (
          <div style={{ padding: '16px 20px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>Generated content</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontSize: 13 }}>
              {missions.length > 0 && (
                <span style={{ color: 'var(--text-2)' }}>
                  <strong style={{ color: 'var(--text)' }}>{missions.length}</strong> {missions.length === 1 ? 'mission' : 'missions'}
                  {missions.length <= 3 && `: ${missions.map(m => m.name).join(', ')}`}
                </span>
              )}
              {project.shots.length > 0 && (
                <span style={{ color: 'var(--text-2)' }}>
                  <strong style={{ color: 'var(--text)' }}>{project.shots.length}</strong> shots
                </span>
              )}
              {project.checklistGroups.length > 0 && (
                <span style={{ color: 'var(--text-2)' }}>
                  <strong style={{ color: 'var(--text)' }}>{project.checklistGroups.length}</strong> checklist groups
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
              All sections pre-filled — edit everything after creating the project.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={handleCreate}
            style={{ padding: '12px 32px', background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
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
