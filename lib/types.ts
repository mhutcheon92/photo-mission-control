export interface PaletteColour {
  hex: string
  label: string
  meaning: string
}

export interface Alert {
  type: 'red' | 'amber' | 'blue' | 'green'
  text: string
}

export interface Shot {
  id: string
  mission: 'M1' | 'M2'
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

export interface Project {
  id: string
  createdAt: string
  updatedAt: string

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

  // Story foundation
  campaignSentence: string
  character: string
  location: string
  event: string
  revealImage: string
  themeWord: string
  colourPalette: PaletteColour[]
  alerts: Alert[]

  // Stills missions
  isolationNotes: string
  mission1Summary: string
  mission2Summary: string

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

  // Workflow
  workflowSteps: WorkflowStep[]

  // Competitive
  competitors: Competitor[]

  // Open items
  openItemGroups: OpenItemGroup[]

  // Contacts
  contacts: Contact[]

  // Checklist
  checklistGroups: ChecklistGroup[]
}
