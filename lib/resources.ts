import { Resource } from './types'

const STORAGE_KEY = 'preproapp_resources'

export function getResources(): Resource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Resource[]
  } catch {
    return []
  }
}

export async function loadResourcesFromCloud(): Promise<Resource[]> {
  try {
    const res = await fetch('/api/resources')
    if (!res.ok) return getResources()
    const { resources } = await res.json()
    if (Array.isArray(resources)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resources))
      return resources
    }
  } catch {}
  return getResources()
}

function syncResourcesToCloud(resources: Resource[]): void {
  fetch('/api/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resources }),
  }).catch(() => {})
}

export function saveResource(resource: Resource): void {
  try {
    const resources = getResources()
    const idx = resources.findIndex(r => r.id === resource.id)
    if (idx >= 0) {
      resources[idx] = resource
    } else {
      resources.push(resource)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources))
    syncResourcesToCloud(resources)
  } catch {}
}

export function deleteResource(id: string): void {
  try {
    const resources = getResources().filter(r => r.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources))
    syncResourcesToCloud(resources)
  } catch {}
}
