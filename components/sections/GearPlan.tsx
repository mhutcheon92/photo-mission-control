'use client'

import { useState, useEffect } from 'react'
import { Project, GearItem, RentalItem, GearInventoryItem } from '@/lib/types'
import { SectionHeader, Card, Badge, AddButton } from '@/components/ui'
import { getGearInventory, loadGearFromCloud } from '@/lib/gearInventory'

interface Props {
  project: Project
  onChange: (updates: Partial<Project>) => void
}

export default function GearPlan({ project, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [inventory, setInventory] = useState<GearInventoryItem[]>([])
  const gear = project.confirmedGear ?? []
  const rentals = project.rentalRecommendations ?? []

  useEffect(() => {
    setInventory(getGearInventory())
    loadGearFromCloud().then(setInventory)
  }, [])

  const inputStyle = {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text)', padding: '6px 10px', fontSize: 13, width: '100%',
  }

  const addGear = () => onChange({ confirmedGear: [...gear, { id: crypto.randomUUID(), text: '', packed: false }] })
  const addRental = () => onChange({ rentalRecommendations: [...rentals, { id: crypto.randomUUID(), name: '', recommendation: 'recommend', rationale: '' }] })

  const addFromInventory = (item: GearInventoryItem) => {
    const alreadyAdded = gear.some(g => g.text === item.name)
    if (alreadyAdded) return
    onChange({ confirmedGear: [...gear, { id: crypto.randomUUID(), text: item.name, packed: false }] })
  }

  const isInGear = (item: GearInventoryItem) => gear.some(g => g.text === item.name)

  return (
    <section>
      <SectionHeader eyebrow="Gear Plan" title="Equipment" editing={editing} onToggleEdit={() => setEditing(e => !e)} />

      {inventory.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => setShowInventory(v => !v)}
            style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 8 }}
          >
            {showInventory ? '▾' : '▸'} Add from My Gear inventory
          </button>
          {showInventory && (
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>Click to add to Confirmed Gear</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {inventory.map(item => {
                  const added = isInGear(item)
                  return (
                    <button
                      key={item.id}
                      onClick={() => addFromInventory(item)}
                      disabled={added}
                      style={{
                        padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: added ? 'default' : 'pointer',
                        background: added ? 'var(--bg4)' : 'var(--bg2)',
                        border: `1px solid ${added ? 'var(--border)' : 'var(--border-med)'}`,
                        color: added ? 'var(--text-3)' : 'var(--text-2)',
                      }}
                    >
                      {item.name}{added ? ' ✓' : ''}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Confirmed Gear</div>
        {gear.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => onChange({ confirmedGear: gear.map(g => g.id === item.id ? { ...g, packed: !g.packed } : g) })}
              style={{
                width: 18, height: 18, borderRadius: 3, flexShrink: 0,
                border: `1px solid ${item.packed ? 'var(--green)' : 'var(--border-med)'}`,
                background: item.packed ? 'var(--green)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {item.packed && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.5" fill="none" /></svg>}
            </button>
            {editing ? (
              <>
                <input value={item.text} onChange={e => onChange({ confirmedGear: gear.map(g => g.id === item.id ? { ...g, text: e.target.value } : g) })}
                  style={{ ...inputStyle, flex: 1 }} placeholder="Gear item" />
                <button onClick={() => onChange({ confirmedGear: gear.filter(g => g.id !== item.id) })}
                  style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
              </>
            ) : (
              <span style={{ flex: 1, fontSize: 14, color: item.packed ? 'var(--text-3)' : 'var(--text)', textDecoration: item.packed ? 'line-through' : 'none' }}>
                {item.text}
              </span>
            )}
          </div>
        ))}
        {editing && <AddButton onClick={addGear} label="Add Gear Item" />}
        {gear.length === 0 && !editing && <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No gear listed.</p>}
      </div>

      <div>
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Rental Recommendations</div>
        {rentals.map(r => (
          editing ? (
            <div key={r.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 8 }}>
                <input value={r.name} placeholder="Equipment name" onChange={e => onChange({ rentalRecommendations: rentals.map(x => x.id === r.id ? { ...x, name: e.target.value } : x) })} style={inputStyle} />
                <select value={r.recommendation} onChange={e => onChange({ rentalRecommendations: rentals.map(x => x.id === r.id ? { ...x, recommendation: e.target.value as RentalItem['recommendation'] } : x) })}
                  style={{ ...inputStyle, width: 'auto' }}>
                  <option value="recommend">Recommend</option>
                  <option value="optional">Optional</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={r.rationale} placeholder="Rationale" onChange={e => onChange({ rentalRecommendations: rentals.map(x => x.id === r.id ? { ...x, rationale: e.target.value } : x) })} style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => onChange({ rentalRecommendations: rentals.filter(x => x.id !== r.id) })} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
              </div>
            </div>
          ) : (
            <Card key={r.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>{r.name}</span>
                <Badge label={r.recommendation === 'recommend' ? 'Hero' : 'Med'} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.rationale}</p>
            </Card>
          )
        ))}
        {editing && <AddButton onClick={addRental} label="Add Rental" />}
        {rentals.length === 0 && !editing && <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No rentals listed.</p>}
      </div>
    </section>
  )
}
