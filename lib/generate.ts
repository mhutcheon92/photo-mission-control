import { Project } from './types'
import { Attachment } from './attachments'

const SYSTEM_PROMPT = `You are a commercial photography pre-production assistant for Michael Hutcheon, a photographer at Big Slate Media in Knoxville, Tennessee.

Your job is to extract structured pre-production data from a creative brief, AV script, pitch deck, or project overview and return it as a JSON object.

Apply these frameworks to every extraction:

STORY FOUNDATION: Apply Beales's Character / Location / Event framework.
- Character: who the story is about and what they want most
- Location: what the location communicates about the brand
- Event: what happens that creates stakes, and what the reveal image is
- Theme: one or two words that every creative decision filters through

TWO-MISSION STILLS STRATEGY:
- Mission 1 (designed graphic units): shots that must be designed as a composite or sequence. The triptych (all characters side-by-side) is the canonical example. Specify 50mm, matched ambient exposure, consistent background depth for composite-ready source frames.
- Mission 2 (self-contained images): shots that communicate the complete brand promise in a single frame with no context required. Every M2 shot must pass the stranger test: a person with no campaign context looks at it and understands the product, the benefit, and the emotion.

SHOT TYPES: E=Establishing (24mm, wide, environment prominent), T=Transition (movement, connective tissue), C=Cutaway/Detail (shoot these first, not last), R=Reveal (the ending the whole day builds toward)

LIGHT STRATEGY: For each identified setup, assign it to a light window. June shoots in Knoxville TN: sunrise ~6:07am, golden hour ~7:50pm, sunset ~8:25pm, harsh midday 10am–5pm.

COLOUR PSYCHOLOGY: Use these mappings when building the palette. Yellow=optimism/creativity, Red=energy/passion, Blue=calm/trust, Green=harmony/nature, Orange=warmth/comfort, Amber/Gold=energy/safety.

Return ONLY a valid JSON object matching this TypeScript interface. No preamble, no markdown, no explanation. JSON only.

TypeScript interface reference:
{
  id: string, createdAt: string, updatedAt: string,
  clientName: string, campaignName: string, shootDate: string, shootLocation: string,
  myRole: string, deliverable: string, director: string, producer: string, captureSetup: string,
  campaignSentence: string, character: string, location: string, event: string,
  revealImage: string, themeWord: string,
  colourPalette: [{hex: string, label: string, meaning: string}],
  alerts: [{type: "red"|"amber"|"blue"|"green", text: string}],
  isolationNotes: string, mission1Summary: string, mission2Summary: string,
  shots: [{id: string, mission: "M1"|"M2", code: string, type: "E"|"T"|"C"|"R",
    name: string, notes: string, lens: string, settings: string, scriptRef: string,
    priority: "Hero"|"High"|"Med"}],
  lightNotes: string,
  lightWindows: [{id: string, timeRange: string, label: string, notes: string}],
  scenarioResponses: [{id: string, title: string, notes: string}],
  confirmedGear: [{id: string, text: string, packed: boolean}],
  rentalRecommendations: [{id: string, name: string, recommendation: "recommend"|"optional", rationale: string}],
  candidateLocations: [{id: string, name: string, address: string, notes: string}],
  recceItems: [{id: string, text: string, done: boolean}],
  workflowSteps: [{id: string, phase: "setup"|"onset", number: number, title: string, notes: string}],
  competitors: [{id: string, name: string, category: string, borrow: string, difference: string}],
  openItemGroups: [{id: string, title: string, items: [{id: string, text: string, done: boolean}]}],
  contacts: [{id: string, name: string, role: string, email: string}],
  checklistGroups: [{id: string, title: string, items: [{id: string, text: string, done: boolean}]}]
}`

export async function generateProjectFromBrief(
  brief: string,
  additionalContext: string,
  attachments: Attachment[] = []
): Promise<Partial<Project>> {
  // Build the text portion — include extracted text from non-image attachments
  const textAttachments = attachments.filter(a => a.type === 'text')
  const imageAttachments = attachments.filter(a => a.type === 'image')

  const parts: string[] = []
  if (brief.trim()) parts.push(`BRIEF:\n${brief}`)
  if (additionalContext.trim()) parts.push(`ADDITIONAL CONTEXT:\n${additionalContext}`)
  for (const att of textAttachments) {
    parts.push(`ATTACHMENT — ${att.name}:\n${att.content}`)
  }
  const userContent = parts.join('\n\n')

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brief: userContent,
      systemPrompt: SYSTEM_PROMPT,
      // Only pass image attachments to the API route (text already inlined above)
      attachments: imageAttachments,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    // Try to surface a useful message from the API error
    let detail = data?.detail
    if (typeof detail === 'string') {
      try { detail = JSON.parse(detail).error?.message } catch { /* use raw */ }
    }
    throw new Error(detail ?? data?.error ?? 'Generation failed')
  }

  return data.project as Partial<Project>
}
