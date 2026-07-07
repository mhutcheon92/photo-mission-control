'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/lib/types'
import { getProject, saveProject } from '@/lib/storage'
import { exportHTML, exportMarkdown } from '@/lib/export'
import Header from '@/components/layout/Header'
import ProjectHero from '@/components/layout/ProjectHero'
import SideNav from '@/components/layout/SideNav'
import Brief from '@/components/sections/Brief'
import StillsMissions from '@/components/sections/StillsMissions'
import ShotList from '@/components/sections/ShotList'
import LightStrategy from '@/components/sections/LightStrategy'
import GearPlan from '@/components/sections/GearPlan'
import Locations from '@/components/sections/Locations'
import C1Workflow from '@/components/sections/C1Workflow'
import Competitive from '@/components/sections/Competitive'
import OpenItems from '@/components/sections/OpenItems'
import Contacts from '@/components/sections/Contacts'
import Checklist from '@/components/sections/Checklist'

let saveTimer: ReturnType<typeof setTimeout> | null = null

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [activeSection, setActiveSection] = useState('brief')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const p = getProject(id)
    if (!p) { setNotFound(true); return }
    setProject(p)
  }, [id])

  const handleChange = useCallback((updates: Partial<Project>) => {
    setProject(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => saveProject(updated), 500)
      return updated
    })
  }, [])

  const handleExportHTML = () => {
    if (!project) return
    const html = exportHTML(project)
    const slug = (project.campaignName || 'project').toLowerCase().replace(/\s+/g, '-')
    downloadFile(html, `${slug}-preproduction.html`, 'text/html')
  }

  const handleExportMarkdown = () => {
    if (!project) return
    const md = exportMarkdown(project)
    const slug = (project.campaignName || 'project').toLowerCase().replace(/\s+/g, '-')
    downloadFile(md, `${slug}-preproduction.md`, 'text/markdown')
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-2)', marginBottom: 16 }}>Project not found.</p>
          <button onClick={() => router.push('/')} style={{ background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', padding: '10px 20px', cursor: 'pointer' }}>
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!project) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />
  }

  const sectionProps = { project, onChange: handleChange }

  const sections: Record<string, React.ReactNode> = {
    brief: <Brief {...sectionProps} />,
    missions: <StillsMissions {...sectionProps} />,
    shots: <ShotList {...sectionProps} />,
    light: <LightStrategy {...sectionProps} />,
    gear: <GearPlan {...sectionProps} />,
    locations: <Locations {...sectionProps} />,
    workflow: <C1Workflow {...sectionProps} />,
    competitive: <Competitive {...sectionProps} />,
    openitems: <OpenItems {...sectionProps} />,
    contacts: <Contacts {...sectionProps} />,
    checklist: <Checklist {...sectionProps} />,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        campaignName={project.campaignName}
        shootDate={project.shootDate}
        onExportHTML={handleExportHTML}
        onExportMarkdown={handleExportMarkdown}
      />
      <ProjectHero project={project} />

      <div className="project-layout" style={{ display: 'flex', alignItems: 'flex-start' }}>
        <SideNav active={activeSection} onSelect={setActiveSection} />
        <main style={{ flex: 1, padding: 'clamp(20px, 4vw, 40px) clamp(16px, 5vw, 48px)', minWidth: 0, maxWidth: '100%' }}>
          {sections[activeSection]}
        </main>
      </div>
    </div>
  )
}
