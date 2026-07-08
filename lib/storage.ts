import { Project, Mission } from './types'

const STORAGE_KEY = 'preproapp_projects'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateProject(raw: any): Project {
  // Forward migration: mission1Summary/mission2Summary → missions[]
  if (raw.mission1Summary !== undefined || raw.mission2Summary !== undefined) {
    const missions: Mission[] = []
    if (raw.mission1Summary) {
      missions.push({ id: 'M1', name: 'Designed Graphic Units', summary: raw.mission1Summary })
    }
    if (raw.mission2Summary) {
      missions.push({ id: 'M2', name: 'Self-Contained Images', summary: raw.mission2Summary })
    }
    const { mission1Summary: _m1, mission2Summary: _m2, ...rest } = raw
    raw = { ...rest, missions: missions.length > 0 ? missions : (raw.missions ?? []) }
  }

  // Fill defaults for fields added after initial release
  return {
    ...raw,
    projectType: raw.projectType ?? 'commercial',
    mood: raw.mood ?? '',
    tone: raw.tone ?? '',
    styleReferences: raw.styleReferences ?? '',
    missions: raw.missions ?? [],
    shareToken: raw.shareToken ?? null,
    sharedSections: raw.sharedSections ?? [],
  }
}

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown[]
    return parsed.map(migrateProject)
  } catch {
    return []
  }
}

// Load from cloud and merge with localStorage — local wins for any project that's newer locally or absent from cloud
export async function loadFromCloud(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects')
    if (!res.ok) return getProjects()
    const { projects: cloudRaw } = await res.json()
    if (!Array.isArray(cloudRaw)) return getProjects()

    const cloud = cloudRaw.map(migrateProject) as Project[]
    const local = getProjects()

    const merged = new Map<string, Project>()
    for (const p of cloud) merged.set(p.id, p)
    for (const p of local) {
      const inCloud = merged.get(p.id)
      if (!inCloud || new Date(p.updatedAt) > new Date(inCloud.updatedAt)) {
        merged.set(p.id, p)
      }
    }

    const result = Array.from(merged.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result))

    // Push any local-only projects up to cloud
    const hasLocalOnly = local.some(p => !cloud.find(c => c.id === p.id))
    if (hasLocalOnly) syncToCloud(result)

    return result
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
      shareToken: null,
      sharedSections: [],
    }
    saveProject(copy)
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
