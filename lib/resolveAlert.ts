import { Project, Alert } from './types'

interface ResolveResult {
  suggestions: string[]
}

export async function requestAlertResolution(alert: Alert, project: Project): Promise<ResolveResult> {
  const constraints = (project.alerts ?? [])
    .filter(a => a.id !== alert.id)
    .map(a => a.text)

  const res = await fetch('/api/alerts/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      alert: {
        text: alert.text,
        severity: alert.severity,
        owner: alert.owner,
      },
      projectContext: {
        clientName: project.clientName,
        campaignName: project.campaignName,
        character: project.character,
        location: project.location,
        event: project.event,
        shootDate: project.shootDate,
        constraints,
      },
    }),
  })

  if (!res.ok) {
    let detail = ''
    try {
      const data = await res.json()
      detail = data?.error ?? ''
    } catch {}
    throw new Error(detail || `Resolve API failed (${res.status})`)
  }

  const data = await res.json()
  const suggestions = Array.isArray(data.suggestions) ? data.suggestions.filter((s: unknown) => typeof s === 'string') : []
  if (suggestions.length === 0) {
    throw new Error('No suggestions returned')
  }
  return { suggestions }
}
