'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Project, GearInventoryItem, ProjectType, GearCategory } from '@/lib/types'
import { getProjects, loadFromCloud, deleteProject, duplicateProject, calcChecklistProgress } from '@/lib/storage'
import { getGearInventory, loadGearFromCloud, saveGearInventory } from '@/lib/gearInventory'
import Header from '@/components/layout/Header'
import { ProgressBar } from '@/components/ui'

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  commercial: 'Commercial',
  elopement: 'Elopement',
  family: 'Family',
  portrait: 'Portrait',
}

const GEAR_CATEGORY_LABELS: Record<GearCategory, string> = {
  camera_body: 'Camera Body',
  lens: 'Lens',
  lighting: 'Lighting',
  support: 'Support',
  audio: 'Audio',
  accessory: 'Accessory',
  other: 'Other',
}

const GEAR_CATEGORIES: GearCategory[] = ['camera_body', 'lens', 'lighting', 'support', 'audio', 'accessory', 'other']

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [gearInventory, setGearInventory] = useState<GearInventoryItem[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showNewMenu, setShowNewMenu] = useState(false)
  const [showGear, setShowGear] = useState(false)

  // Gear add state
  const [addingGear, setAddingGear] = useState(false)
  const [newGearName, setNewGearName] = useState('')
  const [newGearCategory, setNewGearCategory] = useState<GearCategory>('camera_body')
  const [newGearNotes, setNewGearNotes] = useState('')

  const router = useRouter()

  useEffect(() => {
    setProjects(getProjects())
    loadFromCloud().then(setProjects)

    setGearInventory(getGearInventory())
    loadGearFromCloud().then(setGearInventory)
  }, [])

  const handleDelete = (id: string) => {
    deleteProject(id)
    setProjects(getProjects())
    setDeleteConfirm(null)
  }

  const handleDuplicate = (id: string) => {
    duplicateProject(id)
    setProjects(getProjects())
  }

  // Gear
  const handleAddGear = () => {
    if (!newGearName.trim()) return
    const item: GearInventoryItem = {
      id: crypto.randomUUID(),
      name: newGearName.trim(),
      category: newGearCategory,
      notes: newGearNotes.trim() || undefined,
    }
    const updated = [...gearInventory, item]
    setGearInventory(updated)
    saveGearInventory(updated)
    setNewGearName('')
    setNewGearNotes('')
    setAddingGear(false)
  }

  const handleDeleteGear = (id: string) => {
    const updated = gearInventory.filter(g => g.id !== id)
    setGearInventory(updated)
    saveGearInventory(updated)
  }

  const grouped = GEAR_CATEGORIES.reduce((acc, cat) => {
    const items = gearInventory.filter(g => g.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {} as Record<GearCategory, GearInventoryItem[]>)

  const inputStyle = {
    background: 'var(--bg3)', border: '1px solid var(--border-med)', borderRadius: 6,
    color: 'var(--text)', padding: '8px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style>{`
        @media (max-width: 767px) {
          .dashboard-header-row { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 28px !important; }
          .dashboard-title { font-size: 24px !important; }
          .project-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Header />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px, 5vw, 48px) clamp(16px, 4vw, 24px)' }}>
        {/* Header row */}
        <div className="dashboard-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <h1 className="dashboard-title" style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 'clamp(22px, 6vw, 36px)', color: 'var(--text)' }}>
              Photo Mission Control
            </h1>
          </div>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNewMenu(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: 'var(--red)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              + New Project ▾
            </button>
            {showNewMenu && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'var(--bg3)', border: '1px solid var(--border-med)', borderRadius: 8, overflow: 'hidden', minWidth: 220, zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                <Link href="/project/new?mode=scratch" onClick={() => setShowNewMenu(false)}
                  style={{ display: 'block', padding: '12px 18px', color: 'var(--text)', textDecoration: 'none', fontSize: 14 }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg4)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ fontWeight: 600 }}>Start from scratch</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Blank project form</div>
                </Link>
                <div style={{ height: 1, background: 'var(--border)' }} />
                <Link href="/project/new?mode=brief" onClick={() => setShowNewMenu(false)}
                  style={{ display: 'block', padding: '12px 18px', color: 'var(--text)', textDecoration: 'none', fontSize: 14 }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg4)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ fontWeight: 600 }}>Generate from brief</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>AI intake from brief or script</div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Projects ─────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            Projects
          </div>

          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'clamp(40px, 8vw, 80px) clamp(20px, 5vw, 40px)', border: '1px dashed var(--border-med)', borderRadius: 12 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📷</div>
              <h2 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 24, marginBottom: 12 }}>No projects yet</h2>
              <p style={{ color: 'var(--text-2)', marginBottom: 28, fontSize: 14 }}>Create your first pre-production plan to get started.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/project/new?mode=scratch"
                  style={{ padding: '10px 20px', background: 'var(--bg3)', border: '1px solid var(--border-med)', borderRadius: 8, color: 'var(--text)', textDecoration: 'none', fontSize: 14 }}>
                  Start from scratch
                </Link>
                <Link href="/project/new?mode=brief"
                  style={{ padding: '10px 20px', background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                  Generate from brief
                </Link>
              </div>
            </div>
          ) : (
            <div className="project-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {projects.map(project => {
                const progress = calcChecklistProgress(project)
                const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0
                return (
                  <div key={project.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'border-color .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-med)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                    <Link href={`/project/${project.id}`} style={{ display: 'block', padding: '20px 20px 16px', textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                          {project.clientName || 'Client TBD'}
                        </div>
                        {project.projectType && (
                          <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: 'var(--bg3)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
                            {PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType}
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 20, color: 'var(--text)', marginBottom: 10, lineHeight: 1.2 }}>
                        {project.campaignName || 'Untitled'}
                      </h2>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>
                        {project.shootDate && <span style={{ whiteSpace: 'nowrap' }}>{project.shootDate}</span>}
                        {project.shootLocation && <span style={{ whiteSpace: 'nowrap' }}>{project.shootLocation}</span>}
                      </div>
                      {progress.total > 0 && (
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{pct}% complete — {progress.done}/{progress.total} items</div>
                          <ProgressBar done={progress.done} total={progress.total} />
                        </div>
                      )}
                    </Link>

                    <div style={{ display: 'flex', borderTop: '1px solid var(--border)', padding: '10px 12px', gap: 6 }}>
                      <Link href={`/project/${project.id}`}
                        style={{ flex: 1, textAlign: 'center', padding: '6px', fontSize: 12, color: 'var(--text-2)', background: 'var(--bg3)', borderRadius: 6, textDecoration: 'none', border: '1px solid var(--border)' }}>
                        Open
                      </Link>
                      <button onClick={() => handleDuplicate(project.id)}
                        style={{ flex: 1, padding: '6px', fontSize: 12, color: 'var(--text-2)', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>
                        Duplicate
                      </button>
                      {deleteConfirm === project.id ? (
                        <>
                          <button onClick={() => handleDelete(project.id)}
                            style={{ flex: 1, padding: '6px', fontSize: 12, color: '#fff', background: 'var(--danger)', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                            Confirm
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            style={{ flex: 1, padding: '6px', fontSize: 12, color: 'var(--text-2)', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(project.id)}
                          style={{ flex: 1, padding: '6px', fontSize: 12, color: 'var(--text-3)', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── My Gear Section ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          <button
            onClick={() => setShowGear(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0', borderBottom: `1px solid var(--border)` }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>My Gear</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--bg3)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
              {gearInventory.length}
            </span>
            <span style={{ color: 'var(--text-3)', fontSize: 11, marginLeft: 'auto' }}>{showGear ? '▲ Hide' : '▼ Show'}</span>
          </button>

          {showGear && (
            <div style={{ paddingTop: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
                Your gear inventory. AI generation will reference this when building shot list lens assignments and gear plans.
              </p>

              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>
                    {GEAR_CATEGORY_LABELS[cat as GearCategory]}
                  </div>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ flex: 1, fontSize: 14 }}>{item.name}</span>
                      {item.notes && <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>{item.notes}</span>}
                      <button onClick={() => handleDeleteGear(item.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>×</button>
                    </div>
                  ))}
                </div>
              ))}

              {gearInventory.length === 0 && !addingGear && (
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>No gear in inventory yet.</p>
              )}

              {addingGear ? (
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-med)', borderRadius: 10, padding: 20, marginTop: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 10 }}>
                    <input value={newGearName} onChange={e => setNewGearName(e.target.value)} placeholder="Gear name (e.g. Sony A7 IV)" style={inputStyle}
                      onKeyDown={e => e.key === 'Enter' && handleAddGear()} autoFocus />
                    <select value={newGearCategory} onChange={e => setNewGearCategory(e.target.value as GearCategory)}
                      style={{ ...inputStyle, width: 'auto' }}>
                      {GEAR_CATEGORIES.map(c => <option key={c} value={c}>{GEAR_CATEGORY_LABELS[c]}</option>)}
                    </select>
                  </div>
                  <input value={newGearNotes} onChange={e => setNewGearNotes(e.target.value)} placeholder="Notes (optional, e.g. 24-70mm)" style={{ ...inputStyle, marginBottom: 12 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleAddGear}
                      style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#111', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Add
                    </button>
                    <button onClick={() => setAddingGear(false)}
                      style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-2)', fontSize: 13, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingGear(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--bg3)', border: '1px dashed var(--border-med)', borderRadius: 8, color: 'var(--text-2)', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                  <span style={{ fontSize: 16 }}>+</span> Add Gear Item
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {showNewMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setShowNewMenu(false)} />}
    </div>
  )
}
