import { Project, ProjectType, Resource, GearInventoryItem } from './types'
import { Attachment } from './attachments'

const MAX_RESOURCE_CHARS = 8_000

const BASE_SYSTEM_PROMPT = `You are a photography pre-production assistant for Michael Hutcheon, a photographer at Big Slate Media in Knoxville, Tennessee.

Your job is to extract structured pre-production data from a creative brief, AV script, pitch deck, or project overview and return it as a JSON object.

Apply these frameworks to every extraction:

STORY FOUNDATION: Apply Beales's Character / Location / Event framework.
- Character: who the story is about and what they want most
- Location: what the location communicates about the brand
- Event: what happens that creates stakes, and what the reveal image is
- Theme: one or two words that every creative decision filters through

MISSIONS STRATEGY: Build a missions list appropriate for the project type.
- Each mission should have a clear name and summary of its intent
- Missions should be distinct — each with its own visual logic or storytelling function
- The missions array can have 1–4 missions depending on what the brief calls for

SHOT TYPES: E=Establishing (wide, environment prominent), T=Transition (movement, connective tissue), C=Cutaway/Detail (shoot these first, not last), R=Reveal (the ending the whole day builds toward)

LIGHT STRATEGY: For each identified setup, assign it to a light window. June shoots in Knoxville TN: sunrise ~6:07am, golden hour ~7:50pm, sunset ~8:25pm, harsh midday 10am–5pm.

COLOUR PSYCHOLOGY: Use these mappings when building the palette. Yellow=optimism/creativity, Red=energy/passion, Blue=calm/trust, Green=harmony/nature, Orange=warmth/comfort, Amber/Gold=energy/safety.

CREATIVE APPROACH: Extract or infer the mood (emotional quality, e.g. "intimate, golden, cinematic"), tone (communication style, e.g. "documentary, editorial, playful"), and any style references mentioned.

Return ONLY a valid JSON object matching this TypeScript interface. No preamble, no markdown, no explanation. JSON only.

TypeScript interface reference:
{
  id: string, createdAt: string, updatedAt: string,
  projectType: "commercial"|"elopement"|"family"|"portrait",
  clientName: string, campaignName: string, shootDate: string, shootLocation: string,
  myRole: string, deliverable: string, director: string, producer: string, captureSetup: string,
  mood: string, tone: string, styleReferences: string,
  campaignSentence: string, character: string, location: string, event: string,
  revealImage: string, themeWord: string,
  colourPalette: [{hex: string, label: string, meaning: string}],
  alerts: [{type: "red"|"amber"|"blue"|"green", text: string}],
  isolationNotes: string,
  missions: [{id: string, name: string, summary: string}],
  shots: [{id: string, mission: string, code: string, type: "E"|"T"|"C"|"R",
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
  checklistGroups: [{id: string, title: string, items: [{id: string, text: string, done: boolean}]}],
  shareToken: null, sharedSections: []
}`

const TYPE_INSTRUCTIONS: Record<ProjectType, string> = {
  commercial: `
PROJECT TYPE: Commercial / Advertising
Apply the full two-mission stills strategy:
- Mission 1 (designed graphic units): shots requiring composite or sequence design. Use 50mm, matched ambient, consistent background depth. Code shots M1-1, M1-2, etc.
- Mission 2 (self-contained images): each frame communicates the complete brand promise alone. Every M2 shot must pass the stranger test. Code shots M2-1, M2-2, etc.
Build a comprehensive shot list, detailed workflow steps, gear plan, and competitive analysis.`,

  elopement: `
PROJECT TYPE: Elopement / Intimate Wedding
Focus on storytelling and emotional authenticity over production structure.
- Missions should reflect the day's emotional arc (e.g. "Getting Ready", "Ceremony", "Portraits", "Celebration")
- Shot types: prioritise R (Reveal) and E (Establishing) over heavy C (Cutaway) lists
- Light strategy is critical — golden hour timing anchors the whole day
- Workflow steps should reflect ceremony timing, not studio setup
- Gear plan should be light and mobile — no heavy lighting rigs
- Competitive section can be minimal or empty`,

  family: `
PROJECT TYPE: Family / Lifestyle Portrait
Focus on natural connection and candid storytelling.
- Missions typically: 1 or 2 (e.g. "Group Portraits" and "Individual/Candid Moments")
- Shot list should include interaction shots, not just posed frames
- Include kid-friendly timing considerations in workflow steps
- Light strategy: favour open shade and golden hour for flattering, soft light
- Keep gear plan minimal — fast primes, natural light preferred
- Competitive and detailed workflow sections can be brief`,

  portrait: `
PROJECT TYPE: Portrait / Personal Branding
Focus on the individual's character, brand presence, and visual identity.
- Missions typically 1–2 (e.g. "Hero Portraits" and "Environmental/Lifestyle")
- Shots should include variety of framing (tight, mid, environmental)
- Style references and tone are especially important — extract carefully
- Gear plan: prime lenses, off-camera flash or beauty dish where appropriate
- Workflow: location scout, wardrobe changes, and lighting setup notes
- Competitive section can be minimal`,
}

function buildSystemPrompt(
  projectType: ProjectType,
  resources: Resource[],
  gearInventory: GearInventoryItem[]
): string {
  const parts: string[] = [BASE_SYSTEM_PROMPT]

  parts.push(TYPE_INSTRUCTIONS[projectType])

  const relevantResources = resources.filter(
    r => r.projectTypes === 'all' || (Array.isArray(r.projectTypes) && r.projectTypes.includes(projectType))
  )

  if (relevantResources.length > 0) {
    parts.push('\nREFERENCE FRAMEWORKS (apply these to your extraction):')
    for (const r of relevantResources) {
      const content = r.content.length > MAX_RESOURCE_CHARS
        ? r.content.slice(0, MAX_RESOURCE_CHARS) + '\n[...truncated]'
        : r.content
      parts.push(`\n=== ${r.name} ===\n${content}`)
    }
  }

  if (gearInventory.length > 0) {
    parts.push('\nAVAILABLE GEAR INVENTORY (reference when building shot list lens assignments and gear plan):')
    for (const item of gearInventory) {
      parts.push(`- ${item.name} (${item.category})${item.notes ? `: ${item.notes}` : ''}`)
    }
    parts.push('Prefer referencing gear from this inventory in the shot list and confirmedGear array.')
  }

  return parts.join('\n')
}

export async function generateProjectFromBrief(
  brief: string,
  additionalContext: string,
  attachments: Attachment[] = [],
  options: {
    projectType?: ProjectType
    resources?: Resource[]
    gearInventory?: GearInventoryItem[]
  } = {}
): Promise<Partial<Project>> {
  const {
    projectType = 'commercial',
    resources = [],
    gearInventory = [],
  } = options

  const systemPrompt = buildSystemPrompt(projectType, resources, gearInventory)

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
      systemPrompt,
      attachments: imageAttachments,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    let detail = data?.detail
    if (typeof detail === 'string') {
      try { detail = JSON.parse(detail).error?.message } catch { /* use raw */ }
    }
    throw new Error(detail ?? data?.error ?? 'Generation failed')
  }

  return data.project as Partial<Project>
}
