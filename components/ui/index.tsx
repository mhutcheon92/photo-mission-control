'use client'

import React, { useRef, useEffect, forwardRef } from 'react'
import { Shot, CheckItem } from '@/lib/types'

// ── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  eyebrow: string
  title: string
  editing?: boolean
  onToggleEdit?: () => void
  progress?: { done: number; total: number }
}
export function SectionHeader({ eyebrow, title, editing, onToggleEdit, progress }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 }}>
          {eyebrow}
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif, DM Serif Display, serif)', fontSize: 28, color: 'var(--text)', lineHeight: 1.2 }}>
          {title}
        </h2>
        {progress && progress.total > 0 && (
          <div style={{ marginTop: 8 }}>
            <ProgressBar done={progress.done} total={progress.total} />
          </div>
        )}
      </div>
      {onToggleEdit && (
        <button
          onClick={onToggleEdit}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 6,
            background: editing ? 'var(--red-light)' : 'var(--bg3)',
            border: `1px solid ${editing ? 'rgba(192,57,43,0.3)' : 'var(--border)'}`,
            color: editing ? 'var(--red)' : 'var(--text-2)',
            fontSize: 12, cursor: 'pointer', flexShrink: 0,
          }}
        >
          {editing ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 11l2.5-1 7-7-1.5-1.5-7 7L1 11z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
              Done
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 11l2.5-1 7-7-1.5-1.5-7 7L1 11z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
              Edit
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  priority?: 'red' | 'amber' | 'green'
  style?: React.CSSProperties
  className?: string
}
export function Card({ children, priority, style, className }: CardProps) {
  const borderLeft = priority
    ? `3px solid ${priority === 'red' ? 'var(--red)' : priority === 'amber' ? 'var(--amber)' : 'var(--green)'}`
    : undefined
  return (
    <div
      className={className}
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderLeft: borderLeft ?? '1px solid var(--border)',
        borderRadius: 8,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Alert ─────────────────────────────────────────────────────────────────────
const alertColors: Record<string, [string, string]> = {
  red: ['#C0392B', 'rgba(192,57,43,0.12)'],
  amber: ['#D4821A', 'rgba(212,130,26,0.12)'],
  blue: ['#87AECC', 'rgba(135,174,204,0.12)'],
  green: ['#4A7C3F', 'rgba(74,124,63,0.12)'],
}
interface AlertProps {
  type: 'red' | 'amber' | 'blue' | 'green'
  text: string
}
export function AlertBanner({ type, text }: AlertProps) {
  const [color, bg] = alertColors[type] ?? alertColors.blue
  return (
    <div style={{
      background: bg, border: `1px solid ${color}40`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 6, padding: '12px 16px',
      color, fontSize: 14, marginBottom: 8,
    }}>
      {text}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const badgeColors: Record<string, [string, string]> = {
  Hero: ['#C0392B', 'rgba(192,57,43,0.15)'],
  High: ['#D4821A', 'rgba(212,130,26,0.15)'],
  Med: ['#4A7C3F', 'rgba(74,124,63,0.15)'],
  Info: ['#87AECC', 'rgba(135,174,204,0.15)'],
}
export function Badge({ label }: { label: string }) {
  const [color, bg] = badgeColors[label] ?? badgeColors.Info
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
      padding: '2px 8px', borderRadius: 4,
      background: bg, color,
      border: `1px solid ${color}40`,
      textTransform: 'uppercase' as const,
    }}>
      {label}
    </span>
  )
}

// ── MissionBar ────────────────────────────────────────────────────────────────
export function MissionBar({ mission }: { mission: 'M1' | 'M2' }) {
  const isM1 = mission === 'M1'
  return (
    <div style={{
      padding: '10px 16px', borderRadius: 6, marginBottom: 16,
      background: isM1 ? 'rgba(135,174,204,0.1)' : 'rgba(74,124,63,0.1)',
      border: `1px solid ${isM1 ? 'rgba(135,174,204,0.3)' : 'rgba(74,124,63,0.3)'}`,
      color: isM1 ? 'var(--blue)' : 'var(--green)',
      fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' as const,
    }}>
      {isM1 ? 'Mission 1 — Designed Graphic Units' : 'Mission 2 — Self-Contained Images'}
    </div>
  )
}

// ── ShotRow ───────────────────────────────────────────────────────────────────
const shotTypeColors: Record<string, string> = {
  E: '#87AECC', T: '#A8A49E', C: '#D4821A', R: '#C0392B',
}
export function ShotRow({ shot }: { shot: Shot }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '48px 1fr 100px 120px 80px 64px',
      gap: 8, alignItems: 'center',
      padding: '10px 12px',
      borderBottom: '1px solid var(--border)',
      fontSize: 13,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{
          width: 32, height: 32, borderRadius: '50%',
          background: shotTypeColors[shot.type] ?? '#6B6760',
          color: '#111110', fontWeight: 700, fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{shot.type}</span>
        <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'monospace' }}>{shot.code}</span>
      </div>
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{shot.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{shot.notes}</div>
      </div>
      <div style={{ color: 'var(--text-2)', fontSize: 12 }}>{shot.lens}</div>
      <div style={{ color: 'var(--text-2)', fontSize: 12 }}>{shot.settings}</div>
      <div style={{ color: 'var(--text-3)', fontSize: 11, fontFamily: 'monospace' }}>{shot.scriptRef}</div>
      <div><Badge label={shot.priority} /></div>
    </div>
  )
}

// ── ChecklistItem ─────────────────────────────────────────────────────────────
interface ChecklistItemProps {
  item: CheckItem
  onToggle?: () => void
  onDelete?: () => void
  onTextChange?: (text: string) => void
  editing?: boolean
}
export function ChecklistItemRow({ item, onToggle, onDelete, onTextChange, editing }: ChecklistItemProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 0', borderBottom: '1px solid var(--border)',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: 18, height: 18, borderRadius: 3, flexShrink: 0,
          border: `1px solid ${item.done ? 'var(--green)' : 'var(--border-med)'}`,
          background: item.done ? 'var(--green)' : 'transparent',
          cursor: onToggle ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {item.done && (
          <svg width="10" height="10" viewBox="0 0 10 10">
            <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        )}
      </button>
      {editing && onTextChange ? (
        <AutoTextarea
          value={item.text}
          onChange={e => onTextChange(e.target.value)}
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: item.done ? 'var(--text-3)' : 'var(--text)',
            fontSize: 14, outline: 'none', padding: 0,
          }}
        />
      ) : (
        <span style={{
          flex: 1, fontSize: 14,
          color: item.done ? 'var(--text-3)' : 'var(--text)',
          textDecoration: item.done ? 'line-through' : 'none',
        }}>
          {item.text}
        </span>
      )}
      {editing && onDelete && (
        <button onClick={onDelete} style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', fontSize: 16, lineHeight: 1 }}>×</button>
      )}
    </div>
  )
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--red)', borderRadius: 2, transition: 'width .3s' }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{done}/{total}</span>
    </div>
  )
}

// ── PaletteSwatch ─────────────────────────────────────────────────────────────
interface PaletteSwatchProps {
  hex: string
  label: string
  meaning: string
}
export function PaletteSwatch({ hex, label, meaning }: PaletteSwatchProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
      <div style={{ width: 48, height: 48, borderRadius: 6, background: hex, border: '1px solid var(--border)' }} />
      <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{meaning}</div>
    </div>
  )
}

// ── AutoTextarea ──────────────────────────────────────────────────────────────
interface AutoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
}
export const AutoTextarea = forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  function AutoTextarea({ value, style, ...props }, ref) {
    const localRef = useRef<HTMLTextAreaElement>(null)
    const resolvedRef = (ref as React.RefObject<HTMLTextAreaElement>) || localRef

    useEffect(() => {
      const el = resolvedRef.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [value, resolvedRef])

    return (
      <textarea
        ref={resolvedRef}
        value={value}
        rows={1}
        style={{
          resize: 'none',
          overflow: 'hidden',
          lineHeight: 1.6,
          ...style,
        }}
        {...props}
      />
    )
  }
)

// ── EditField ─────────────────────────────────────────────────────────────────
interface EditFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
}
export function EditField({ label, value, onChange, multiline }: EditFieldProps) {
  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg3)',
    border: '1px solid var(--border-med)', borderRadius: 6,
    color: 'var(--text)', fontSize: 14, padding: '8px 12px',
    outline: 'none',
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {multiline ? (
        <AutoTextarea value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  )
}

// ── AddButton ─────────────────────────────────────────────────────────────────
export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 6,
        background: 'var(--bg3)', border: '1px dashed var(--border-med)',
        color: 'var(--text-2)', fontSize: 12, cursor: 'pointer',
        marginTop: 8,
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> {label}
    </button>
  )
}
