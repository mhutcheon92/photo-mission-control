'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Project } from '@/lib/types'
import { getProjects, deleteProject, duplicateProject, calcChecklistProgress } from '@/lib/storage'
import Header from '@/components/layout/Header'
import { ProgressBar } from '@/components/ui'

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showNewMenu, setShowNewMenu] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setProjects(getProjects())
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style>{`
        @media (max-width: 767px) {
          .dashboard-header-row { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
          .dashboard-title { font-size: 24px; }
        }
      `}</style>
      <Header />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <div className="dashboard-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <h1 className="dashboard-title" style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 'clamp(22px, 6vw, 36px)', color: 'var(--text)' }}>
              Photo Mission Control
            </h1>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNewMenu(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 8,
                background: 'var(--red)', border: 'none',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              + New Project ▾
            </button>
            {showNewMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 6,
                background: 'var(--bg3)', border: '1px solid var(--border-med)',
                borderRadius: 8, overflow: 'hidden', minWidth: 220, zIndex: 200,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}>
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

        {projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            border: '1px dashed var(--border-med)', borderRadius: 12,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📷</div>
            <h2 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 24, marginBottom: 12 }}>No projects yet</h2>
            <p style={{ color: 'var(--text-2)', marginBottom: 28, fontSize: 14 }}>
              Create your first pre-production plan to get started.
            </p>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {projects.map(project => {
              const progress = calcChecklistProgress(project)
              const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0
              return (
                <div key={project.id} style={{
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 10, overflow: 'hidden',
                  transition: 'border-color .15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-med)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <Link href={`/project/${project.id}`} style={{ display: 'block', padding: '20px 20px 16px', textDecoration: 'none' }}>
                    <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>
                      {project.clientName || 'Client TBD'}
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
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
                          {pct}% complete — {progress.done}/{progress.total} items
                        </div>
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
      </main>

      {showNewMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100 }}
          onClick={() => setShowNewMenu(false)}
        />
      )}
    </div>
  )
}
