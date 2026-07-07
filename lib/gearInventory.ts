import { GearInventoryItem } from './types'

const STORAGE_KEY = 'preproapp_gear_inventory'

export function getGearInventory(): GearInventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as GearInventoryItem[]
  } catch {
    return []
  }
}

export async function loadGearFromCloud(): Promise<GearInventoryItem[]> {
  try {
    const res = await fetch('/api/gear')
    if (!res.ok) return getGearInventory()
    const { inventory } = await res.json()
    if (Array.isArray(inventory)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory))
      return inventory
    }
  } catch {}
  return getGearInventory()
}

function syncGearToCloud(inventory: GearInventoryItem[]): void {
  fetch('/api/gear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inventory }),
  }).catch(() => {})
}

export function saveGearInventory(inventory: GearInventoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory))
    syncGearToCloud(inventory)
  } catch {}
}
