import { Project } from './types'

export interface ContactSuggestion {
  name: string
  inferredRole: string
  mentions: number
}

// Reasonably conservative first-name-Last-name matcher — capitalised token(s).
const NAME_RE = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/g

// Role hints: word(s) preceding or trailing the name in the item text.
const ROLE_HINTS: Array<{ re: RegExp; role: string }> = [
  { re: /\b(client|clients)\b/i, role: 'Client' },
  { re: /\b(producer|production coordination|producing)\b/i, role: 'Producer' },
  { re: /\b(director|creative director)\b/i, role: 'Director' },
  { re: /\b(DP|cinematographer|camera op)\b/i, role: 'DP / Cinematographer' },
  { re: /\b(gaffer|grip|electrics)\b/i, role: 'Gaffer' },
  { re: /\b(stylist|wardrobe)\b/i, role: 'Stylist' },
  { re: /\b(makeup|hair|HMU)\b/i, role: 'HMU' },
  { re: /\b(agency|account)\b/i, role: 'Agency' },
  { re: /\b(talent|model|subject)\b/i, role: 'Talent' },
  { re: /\b(assistant|1st AC|2nd AC|1st AD|2nd AD)\b/i, role: 'Assistant' },
]

// Common non-name words that Capitalize but aren't people names.
const NAME_BLOCKLIST = new Set([
  'Open Items', 'Open Item', 'Mission', 'Mission 1', 'Mission 2', 'Mission 3',
  'Camera', 'Client', 'Producer', 'Director', 'Photographer', 'Photography',
  'Full Circle', 'Golden Hour', 'Blue Hour', 'Story Foundation', 'Shot List',
  'Light Strategy', 'Gear Plan', 'Locations', 'Contacts', 'Checklist',
  'AI', 'PDF', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
])

function inferRole(text: string): string {
  for (const { re, role } of ROLE_HINTS) {
    if (re.test(text)) return role
  }
  return 'Mentioned in Open Items'
}

export function suggestContacts(project: Project): ContactSuggestion[] {
  const groups = project.openItemGroups ?? []
  const contacts = project.contacts ?? []
  const confirmedNames = new Set(contacts.map(c => c.name.toLowerCase()))

  const counts = new Map<string, { name: string; role: string; mentions: number }>()

  for (const group of groups) {
    for (const item of group.items ?? []) {
      const text = item.text ?? ''
      // Prefer explicit "Owner: NAME" style — first
      const ownerMatch = text.match(/(?:^|\b)Owner:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/)
      if (ownerMatch) {
        const name = ownerMatch[1].trim()
        if (!NAME_BLOCKLIST.has(name) && !confirmedNames.has(name.toLowerCase())) {
          const key = name.toLowerCase()
          const role = inferRole(text)
          const existing = counts.get(key)
          if (existing) existing.mentions++
          else counts.set(key, { name, role, mentions: 1 })
        }
      }
      // General capitalised name matches — deduped case-insensitively
      const matches = new Set<string>()
      let m: RegExpExecArray | null
      NAME_RE.lastIndex = 0
      while ((m = NAME_RE.exec(text)) !== null) {
        const raw = m[1].trim()
        if (NAME_BLOCKLIST.has(raw)) continue
        if (confirmedNames.has(raw.toLowerCase())) continue
        matches.add(raw)
      }
      for (const name of matches) {
        const key = name.toLowerCase()
        const role = inferRole(text)
        const existing = counts.get(key)
        if (existing) existing.mentions++
        else counts.set(key, { name, role, mentions: 1 })
      }
    }
  }

  return Array.from(counts.values())
    .filter(v => v.mentions >= 1)
    .sort((a, b) => b.mentions - a.mentions || a.name.localeCompare(b.name))
    .map(v => ({ name: v.name, inferredRole: v.role, mentions: v.mentions }))
}
