import { Project } from './types'

const STORAGE_KEY = 'preproapp_projects'

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Project[]
  } catch {
    return []
  }
}

// Load from cloud, update localStorage, return result
export async function loadFromCloud(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects')
    if (!res.ok) return getProjects()
    const { projects } = await res.json()
    if (Array.isArray(projects)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
      return projects
    }
  } catch {}
  return getProjects()
}

// Fire-and-forget cloud sync
export function syncToCloud(projects: Project[]): void {
  fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projects }),
  }).catch(() => {})
}

export function getProject(id: string): Project | null {
  try {
    const projects = getProjects()
    return projects.find(p => p.id === id) ?? null
  } catch {
    return null
  }
}

export function saveProject(project: Project): void {
  try {
    const projects = getProjects()
    const idx = projects.findIndex(p => p.id === project.id)
    const updated = { ...project, updatedAt: new Date().toISOString() }
    if (idx >= 0) {
      projects[idx] = updated
    } else {
      projects.push(updated)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    syncToCloud(projects)
  } catch {
    // silent fail
  }
}

export function deleteProject(id: string): void {
  try {
    const projects = getProjects().filter(p => p.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    syncToCloud(projects)
  } catch {
    // silent fail
  }
}

export function duplicateProject(id: string): Project | null {
  try {
    const source = getProject(id)
    if (!source) return null
    const copy: Project = {
      ...JSON.parse(JSON.stringify(source)),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      campaignName: source.campaignName + ' (Copy)',
    }
    saveProject(copy) // saveProject already calls syncToCloud
    return copy
  } catch {
    return null
  }
}

export function calcChecklistProgress(project: Project): { done: number; total: number } {
  let done = 0
  let total = 0
  for (const group of project.checklistGroups ?? []) {
    for (const item of group.items ?? []) {
      total++
      if (item.done) done++
    }
  }
  return { done, total }
}
