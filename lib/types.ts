export interface PaletteColour {
  hex: string
  label: string
  meaning: string
}

export type AlertStatus = 'open' | 'drafting' | 'resolved'

export interface Alert {
  id?: string
  type: 'red' | 'amber' | 'blue' | 'green'
  text: string
  severity?: 'urgent' | 'flag'
  owner?: string
  status?: AlertStatus
  resolutionText?: string
  draftText?: string
  draftIndex?: number
  suggestions?: string[]
}

export interface Mission {
  id: string
  name: string
  summary: string
}

export interface Shot {
  id: string
  mission: string  // mission id (legacy: 'M1' | 'M2')
  code: string
  type: 'E' | 'T' | 'C' | 'R'
  name: string
  notes: string
  lens: string
  settings: string
  scriptRef: string
  priority: 'Hero' | 'High' | 'Med'
}

export interface LightWindow {
  id: string
  timeRange: string
  label: string
  notes: string
}

export interface CheckItem {
  id: string
  text: string
  done: boolean
}

export interface ChecklistGroup {
  id: string
  title: string
  items: CheckItem[]
}

export interface OpenItemGroup {
  id: string
  title: string
  items: CheckItem[]
}

export interface GearItem {
  id: string
  text: string
  packed: boolean
}

export interface RentalItem {
  id: string
  name: string
  recommendation: 'recommend' | 'optional'
  rationale: string
}

export interface Location {
  id: string
  name: string
  address: string
  notes: string
}

export interface WorkflowStep {
  id: string
  phase: 'setup' | 'onset'
  number: number
  title: string
  notes: string
}

export interface Competitor {
  id: string
  name: string
  category: string
  borrow: string
  difference: string
}

export interface Contact {
  id: string
  name: string
  role: string
  email: string
}

export interface ScenarioResponse {
  id: string
  title: string
  notes: string
}

export type ProjectType = 'commercial' | 'elopement' | 'family' | 'portrait'

export type GearCategory = 'camera_body' | 'lens' | 'lighting' | 'support' | 'audio' | 'accessory' | 'other'

export interface GearInventoryItem {
  id: string
  name: string
  category: GearCategory
  notes?: string
}

export interface Resource {
  id: string
  name: string
  content: string
  projectTypes: ProjectType[] | 'all'
  createdAt: string
}

export interface Project {
  id: string
  createdAt: string
  updatedAt: string

  projectType: ProjectType

  // Brief
  clientName: string
  campaignName: string
  shootDate: string
  shootLocation: string
  myRole: string
  deliverable: string
  director: string
  producer: string
  captureSetup: string

  // Creative approach
  mood: string
  tone: string
  styleReferences: string

  // Story foundation
  campaignSentence: string
  character: string
  location: string
  event: string
  revealImage: string
  themeWord: string
  colourPalette: PaletteColour[]
  alerts: Alert[]

  // Stills missions (dynamic)
  isolationNotes: string
  missions: Mission[]

  // Shot list
  shots: Shot[]

  // Light strategy
  lightNotes: string
  lightWindows: LightWindow[]
  scenarioResponses: ScenarioResponse[]

  // Gear
  confirmedGear: GearItem[]
  rentalRecommendations: RentalItem[]

  // Locations
  candidateLocations: Location[]
  recceItems: CheckItem[]

  // On-Set Monitoring (formerly C1 Workflow)
  workflowSteps: WorkflowStep[]

  // Competitive
  competitors: Competitor[]

  // Open items
  openItemGroups: OpenItemGroup[]

  // Contacts
  contacts: Contact[]

  // Checklist
  checklistGroups: ChecklistGroup[]

  // Sharing
  shareToken: string | null
  sharedSections: string[]
}
