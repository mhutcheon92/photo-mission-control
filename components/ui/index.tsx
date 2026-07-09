'use client'

import React, { useRef, useEffect, useState, forwardRef, createContext, useContext, useCallback } from 'react'
import { Shot, CheckItem } from '@/lib/types'

// ── Eyebrow ──────────────────────────────────────────────────────────────────
export const EYEBROW_STYLE: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  fontWeight: 500,
}

export function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ ...EYEBROW_STYLE, marginBottom: 12, ...style }}>{children}</div>
}

// ── Shot code definitions ────────────────────────────────────────────────────
export const SHOT_CODE_LABELS: Record<string, { label: string; title: string }> = {
  C: { label: 'Cutaway', title: 'Cutaway — supporting detail or environmental frame' },
  E: { label: 'Establishing', title: 'Establishing — wide, scene-setting' },
  T: { label: 'Transition', title: 'Transition — movement or bridging moment between beats' },
  R: { label: 'Reveal', title: 'Reveal — the hero payoff frame' },
}

// ── Mission title helper ─────────────────────────────────────────────────────
export function stripMissionPrefix(name: string): string {
  return (name ?? '').replace(/^\s*mission\s+\d+\s*[—–\-:]\s*/i, '').trim()
}

// ── Prose-with-bullets renderer ──────────────────────────────────────────────
// Parses text where some lines begin with "- " or "* " into a mixed
// paragraph/list block. Non-bullet lines render as paragraphs; consecutive
// bullet lines group into a single <ul>. The raw text is preserved for editing
// (this only affects display mode).
export function renderProseBullets(text: string): React.ReactNode {
  if (!text) return null
  const lines = text.split('\n')
  const blocks: React.ReactNode[] = []
  let buffer: string[] = []
  let mode: 'para' | 'list' | null = null

  const flush = () => {
    if (buffer.length === 0) return
    if (mode === 'list') {
      blocks.push(
        <ul key={blocks.length} style={{ margin: '4px 0', paddingLeft: 20, listStyle: 'disc' }}>
          {buffer.map((item, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{item}</li>
          ))}
        </ul>
      )
    } else {
      blocks.push(
        <p key={blocks.length} style={{ margin: '0 0 8px', whiteSpace: 'pre-wrap' }}>
          {buffer.join('\n')}
        </p>
      )
    }
    buffer = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/)
    if (bulletMatch) {
      if (mode !== 'list') { flush(); mode = 'list' }
      buffer.push(bulletMatch[1])
    } else if (line.trim() === '') {
      flush()
      mode = null
    } else {
      if (mode !== 'para') { flush(); mode = 'para' }
      buffer.push(line)
    }
  }
  flush()
  return <>{blocks}</>
}

// ── InlineEdit context ───────────────────────────────────────────────────────
interface InlineEditCtx {
  editingKey: string | null
  setEditingKey: (key: string | null) => void
}
const InlineEditContext = createContext<InlineEditCtx>({
  editingKey: null,
  setEditingKey: () => {},
})

export function InlineEditProvider({ children }: { children: React.ReactNode }) {
  const [editingKey, setEditingKey] = useState<string | null>(null)
  return (
    <InlineEditContext.Provider value={{ editingKey, setEditingKey }}>
      {children}
    </InlineEditContext.Provider>
  )
}

function useInlineEdit(fieldKey: string) {
  const ctx = useContext(InlineEditContext)
  const isEditing = ctx.editingKey === fieldKey
  const start = useCallback(() => ctx.setEditingKey(fieldKey), [ctx, fieldKey])
  const stop = useCallback(() => {
    if (ctx.editingKey === fieldKey) ctx.setEditingKey(null)
  }, [ctx, fieldKey])
  return { isEditing, start, stop }
}

// ── InlineField ──────────────────────────────────────────────────────────────
interface InlineFieldProps {
  fieldKey: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  textStyle?: React.CSSProperties
  inputStyle?: React.CSSProperties
  ariaLabel?: string
}
export function InlineField({ fieldKey, value, onChange, placeholder, textStyle, inputStyle, ariaLabel }: InlineFieldProps) {
  const { isEditing, start, stop } = useInlineEdit(fieldKey)
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (isEditing) {
      setDraft(value)
      // focus on next tick so React finishes render
      queueMicrotask(() => inputRef.current?.focus())
    }
  }, [isEditing, value])

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { onChange(draft); stop() }}
        onKeyDown={e => {
          if (e.key === 'Enter') { onChange(draft); stop() }
          if (e.key === 'Escape') { setDraft(value); stop() }
        }}
        aria-label={ariaLabel}
        style={{
          width: '100%',
          background: 'var(--input-bg)',
          border: '1px solid var(--gold)',
          borderRadius: 3,
          color: 'var(--text)',
          fontSize: 14,
          fontFamily: 'inherit',
          padding: '4px 8px',
          outline: 'none',
          boxSizing: 'border-box',
          ...inputStyle,
        }}
      />
    )
  }

  const hasBullets = /(^|\n)\s*[-*]\s+/.test(value)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={start}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start() } }}
      aria-label={ariaLabel ? `Edit ${ariaLabel}` : 'Edit field'}
      className="inline-field-display"
      style={{
        fontSize: 14,
        color: value ? 'var(--text)' : 'var(--text-3)',
        cursor: 'text',
        borderBottom: '1px dashed transparent',
        display: hasBullets ? 'block' : 'inline-block',
        minWidth: 40,
        padding: '2px 0',
        transition: 'border-bottom-color .15s',
        ...textStyle,
      }}
    >
      {value ? (hasBullets ? renderProseBullets(value) : value) : (placeholder || '—')}
    </div>
  )
}

// ── InlineTextarea ───────────────────────────────────────────────────────────
interface InlineTextareaProps {
  fieldKey: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  minRows?: number
  textStyle?: React.CSSProperties
  inputStyle?: React.CSSProperties
  ariaLabel?: string
}
export function InlineTextarea({ fieldKey, value, onChange, placeholder, minRows = 2, textStyle, inputStyle, ariaLabel }: InlineTextareaProps) {
  const { isEditing, start, stop } = useInlineEdit(fieldKey)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (isEditing) {
      setDraft(value)
      queueMicrotask(() => inputRef.current?.focus())
    }
  }, [isEditing, value])

  if (isEditing) {
    return (
      <AutoTextarea
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { onChange(draft); stop() }}
        onKeyDown={e => {
          if (e.key === 'Escape') { setDraft(value); stop() }
        }}
        rows={minRows}
        aria-label={ariaLabel}
        style={{
          width: '100%',
          background: 'var(--input-bg)',
          border: '1px solid var(--gold)',
          borderRadius: 3,
          color: 'var(--text)',
          fontSize: 14,
          fontFamily: 'inherit',
          padding: '6px 8px',
          outline: 'none',
          boxSizing: 'border-box',
          lineHeight: 1.65,
          ...inputStyle,
        }}
      />
    )
  }

  const hasBullets = /(^|\n)\s*[-*]\s+/.test(value)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={start}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start() } }}
      aria-label={ariaLabel ? `Edit ${ariaLabel}` : 'Edit field'}
      className="inline-field-display"
      style={{
        fontSize: 14,
        lineHeight: 1.65,
        color: value ? 'var(--text)' : 'var(--text-3)',
        cursor: 'text',
        borderBottom: '1px dashed transparent',
        padding: '2px 0',
        whiteSpace: hasBullets ? 'normal' : 'pre-wrap',
        transition: 'border-bottom-color .15s',
        ...textStyle,
      }}
    >
      {value ? (hasBullets ? renderProseBullets(value) : value) : (placeholder || '—')}
    </div>
  )
}

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
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
      <div>
        <div style={{ ...EYEBROW_STYLE, marginBottom: 6 }}>
          {eyebrow}
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif, serif)', fontWeight: 500, fontSize: 'clamp(20px, 5vw, 28px)', color: 'var(--text)', lineHeight: 1.2 }}>
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
          aria-label={editing ? 'Finish editing' : 'Edit section'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            background: editing ? 'rgba(200,169,110,0.15)' : 'var(--surface)',
            border: `1px solid ${editing ? 'var(--gold)' : 'var(--border)'}`,
            color: editing ? 'var(--gold)' : 'var(--text-2)',
            fontSize: 12, cursor: 'pointer', flexShrink: 0,
          }}
        >
          {editing ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6l3 3 7-7" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
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
  priority?: 'red' | 'amber' | 'green' | 'rust' | 'gold'
  style?: React.CSSProperties
  className?: string
}
export function Card({ children, priority, style, className }: CardProps) {
  const priorityColor: Record<string, string> = {
    red: 'var(--danger)',
    amber: 'var(--amber)',
    green: 'var(--green)',
    rust: 'var(--rust)',
    gold: 'var(--gold)',
  }
  const borderLeft = priority ? `2px solid ${priorityColor[priority]}` : undefined
  return (
    <div
      className={className}
      style={{
        background: 'var(--surface)',
        border: '1px solid rgba(74,66,60,0.6)',
        borderLeft: borderLeft ?? '1px solid rgba(74,66,60,0.6)',
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Alert Banner ─────────────────────────────────────────────────────────────
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
      padding: '12px 16px',
      color, fontSize: 14, marginBottom: 8,
    }}>
      {text}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const badgeColors: Record<string, [string, string]> = {
  Hero: ['var(--urgent-fg)', 'var(--urgent-bg)'],
  High: ['var(--flag-fg)', 'var(--flag-bg)'],
  Med: ['#4A7C3F', 'rgba(74,124,63,0.15)'],
  Info: ['#87AECC', 'rgba(135,174,204,0.15)'],
}
export function Badge({ label }: { label: string }) {
  const [color, bg] = badgeColors[label] ?? badgeColors.Info
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
      padding: '3px 9px',
      background: bg, color,
      textTransform: 'uppercase' as const,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

// ── MissionBar ────────────────────────────────────────────────────────────────
const MISSION_PALETTE = ['#c8a96e', '#87AECC', '#4A7C3F', '#D4821A', '#C0392B', '#A8A49E']

export function MissionBar({ name, index = 0 }: { name: string; index?: number }) {
  const color = MISSION_PALETTE[index % MISSION_PALETTE.length]
  return (
    <div style={{
      padding: '10px 16px', marginBottom: 16,
      background: `${color}1A`,
      border: `1px solid ${color}4D`,
      color,
      fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' as const,
    }}>
      {name}
    </div>
  )
}

export { MISSION_PALETTE }

// ── ShotRow ───────────────────────────────────────────────────────────────────
export function ShotRow({ shot }: { shot: Shot }) {
  const meta = [shot.lens, shot.settings, shot.scriptRef].filter(Boolean).join(' · ')
  const codeInfo = SHOT_CODE_LABELS[shot.code] ?? SHOT_CODE_LABELS[shot.type] ?? { label: '', title: '' }
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '10px 16px', alignItems: 'flex-start',
      padding: '14px 16px', background: 'var(--surface)',
      border: '1px solid rgba(74,66,60,0.6)',
    }}>
      <span
        title={codeInfo.title}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11, fontWeight: 600,
          width: 24, height: 24, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#241f1c', color: 'var(--text)',
        }}
      >
        {shot.code || shot.type}
      </span>
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontSize: 13.5, color: 'var(--text)', marginBottom: 4 }}>{shot.name}</div>
        {shot.notes && <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>{shot.notes}</div>}
        {meta && (
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{meta}</div>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {shot.mission && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{shot.mission}</div>
        )}
        <Badge label={shot.priority} />
      </div>
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
        aria-label={item.done ? 'Mark as not done' : 'Mark as done'}
        style={{
          width: 18, height: 18, borderRadius: 3, flexShrink: 0,
          border: `1px solid ${item.done ? 'var(--gold)' : 'var(--border-med)'}`,
          background: item.done ? 'var(--gold)' : 'transparent',
          cursor: onToggle ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {item.done && (
          <svg width="10" height="10" viewBox="0 0 10 10">
            <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="var(--gold-on)" strokeWidth="1.5" fill="none" />
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
        <button
          onClick={onDelete}
          aria-label="Delete item"
          style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', fontSize: 16, lineHeight: 1 }}
        >×</button>
      )}
    </div>
  )
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: 'var(--bg4)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold)', transition: 'width .3s' }} />
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
      <div style={{ width: 48, height: 48, background: hex, border: '1px solid var(--border)' }} />
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
  function AutoTextarea({ value, style, onKeyDown, ...props }, ref) {
    const localRef = useRef<HTMLTextAreaElement>(null)
    const resolvedRef = (ref as React.RefObject<HTMLTextAreaElement>) || localRef

    useEffect(() => {
      const el = resolvedRef.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [value, resolvedRef])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e)
      if (e.key === 'Enter' && !e.shiftKey && !e.defaultPrevented) {
        e.preventDefault()
        e.currentTarget.blur()
      }
    }

    return (
      <textarea
        ref={resolvedRef}
        value={value}
        rows={1}
        onKeyDown={handleKeyDown}
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
// Kept for the New Project review screen — labeled input pattern.
interface EditFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
}
export function EditField({ label, value, onChange, multiline }: EditFieldProps) {
  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--input-bg)',
    border: '1px solid var(--border-med)',
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
        padding: '6px 12px',
        background: 'var(--surface)', border: '1px dashed var(--border-med)',
        color: 'var(--text-2)', fontSize: 12, cursor: 'pointer',
        marginTop: 8,
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> {label}
    </button>
  )
}
