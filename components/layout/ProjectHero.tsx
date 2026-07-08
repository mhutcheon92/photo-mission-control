import { Project } from '@/lib/types'

interface Props {
  project: Project
}

export default function ProjectHero({ project }: Props) {
  return (
    <div className="hero-wrap" style={{
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      padding: 'clamp(20px, 5vw, 40px) clamp(20px, 6vw, 48px)',
    }}>
      <style>{`
        @media (max-width: 767px) {
          .hero-wrap     { padding: 14px 16px 12px !important; }
          .hero-title    { font-size: 20px !important; margin-bottom: 6px !important; }
          .hero-sentence { font-size: 13px !important; line-height: 1.5 !important; margin-bottom: 12px !important; }
          .hero-meta     { font-size: 11px !important; gap: 10px !important; }
        }
      `}</style>
      <h1 className="hero-title" style={{
        fontFamily: 'var(--font-serif, Cormorant Garamond, serif)',
        fontSize: 'clamp(26px, 7vw, 48px)', lineHeight: 1.05,
        color: 'var(--text)', marginBottom: 10,
      }}>
        {project.campaignName || 'Untitled Campaign'}
      </h1>
      {project.campaignSentence && (
        <p className="hero-sentence" style={{ color: 'var(--text-2)', fontSize: 16, marginBottom: 20 }}>
          {project.campaignSentence}
        </p>
      )}
      <div className="hero-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 13 }}>
        {[
          { label: 'Date', value: project.shootDate },
          { label: 'Role', value: project.myRole },
          { label: 'Deliverable', value: project.deliverable },
          { label: 'Director', value: project.director },
          { label: 'Producer', value: project.producer },
          { label: 'Location', value: project.shootLocation },
        ].filter(m => m.value).map(m => (
          <span key={m.label}>
            <span style={{ color: 'var(--text-3)', marginRight: 4 }}>{m.label}</span>
            <span style={{ color: 'var(--text)' }}>{m.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
