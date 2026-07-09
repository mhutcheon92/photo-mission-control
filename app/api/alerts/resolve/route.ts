import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest): boolean {
  const auth = req.cookies.get('portal_auth')?.value
  const password = process.env.PORTAL_PASSWORD
  if (!password) return true
  return auth === password
}

interface ResolveBody {
  alert: {
    text: string
    severity?: 'urgent' | 'flag'
    owner?: string
  }
  projectContext: {
    clientName?: string
    campaignName?: string
    character?: string
    location?: string
    event?: string
    shootDate?: string
    constraints?: string[]
  }
}

const SYSTEM = `You are the production assistant on a professional photography pre-production plan.

You will be given a single unresolved issue (an "alert") that surfaced during planning, along with the surrounding project context. Your job is to draft two SHORT, distinct, actionable resolutions the photographer can send to the responsible person or execute themselves.

Each resolution must:
- Be one clear paragraph, 2–4 sentences maximum.
- Name a concrete next step (who does what, by when).
- Be different in approach from the other suggestion. Suggestion 1 should be the "confirm and correct" path (verify the assumption is wrong, then act). Suggestion 2 should be the "assume the worst and hedge" path (treat the issue as real, plan a contingency).
- Not repeat the alert text back verbatim.
- Not add any preamble like "Here is a resolution:" — write the resolution text directly.

Respond ONLY with valid JSON of the form:
{"suggestions": ["<first suggestion text>", "<second suggestion text>"]}
No prose outside the JSON.`

function buildUserPrompt(body: ResolveBody): string {
  const c = body.projectContext ?? {}
  const parts: string[] = []
  parts.push('## Alert to resolve')
  parts.push(`Severity: ${body.alert.severity ?? 'flag'}`)
  if (body.alert.owner) parts.push(`Owner: ${body.alert.owner}`)
  parts.push(`Issue: ${body.alert.text}`)
  parts.push('')
  parts.push('## Project context')
  if (c.clientName) parts.push(`Client: ${c.clientName}`)
  if (c.campaignName) parts.push(`Campaign: ${c.campaignName}`)
  if (c.shootDate) parts.push(`Shoot date: ${c.shootDate}`)
  if (c.character) parts.push(`Character: ${c.character}`)
  if (c.location) parts.push(`Location: ${c.location}`)
  if (c.event) parts.push(`Event: ${c.event}`)
  if (c.constraints?.length) {
    parts.push(`Other open items on this project:`)
    for (const t of c.constraints.slice(0, 8)) parts.push(`- ${t}`)
  }
  parts.push('')
  parts.push('Draft two distinct resolution paragraphs per the system instructions.')
  return parts.join('\n')
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  let body: ResolveBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body?.alert?.text) {
    return NextResponse.json({ error: 'alert.text is required' }, { status: 400 })
  }

  const userPrompt = buildUserPrompt(body)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 1500,
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return NextResponse.json({ error: 'Anthropic API error', detail: err }, { status: 500 })
  }

  const data = await response.json()
  // Sonnet 5 may prepend a thinking block — find the text block explicitly
  const textBlock = (data.content ?? []).find((b: { type: string }) => b.type === 'text')
  const raw: string = textBlock?.text ?? ''

  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  const jsonStr = start !== -1 && end > start ? raw.slice(start, end + 1) : raw

  try {
    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length < 2) {
      throw new Error('Malformed suggestions')
    }
    return NextResponse.json({ suggestions: parsed.suggestions.slice(0, 2) as string[] })
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: raw.slice(0, 300) }, { status: 500 })
  }
}
