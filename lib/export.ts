import { Project, Shot, ChecklistGroup, Mission } from './types'

const MISSION_COLORS = ['#87AECC', '#4A7C3F', '#D4821A', '#C0392B']

export function exportMarkdown(project: Project): string {
  const lines: string[] = []

  lines.push(`# ${project.campaignName}`)
  lines.push(`**Client:** ${project.clientName}  `)
  lines.push(`**Shoot Date:** ${project.shootDate}  `)
  lines.push(`**Location:** ${project.shootLocation}  `)
  lines.push(`**My Role:** ${project.myRole}  `)
  lines.push(`**Deliverable:** ${project.deliverable}  `)
  lines.push(`**Director:** ${project.director}  `)
  lines.push(`**Producer:** ${project.producer}  `)
  lines.push(`**Capture Setup:** ${project.captureSetup}`)
  if (project.mood) lines.push(`**Mood:** ${project.mood}`)
  if (project.tone) lines.push(`**Tone:** ${project.tone}`)
  if (project.styleReferences) lines.push(`**Style References:** ${project.styleReferences}`)
  lines.push('')

  lines.push('## Story Foundation')
  lines.push(`**Campaign Sentence:** ${project.campaignSentence}`)
  lines.push(`**Character:** ${project.character}`)
  lines.push(`**Location:** ${project.location}`)
  lines.push(`**Event:** ${project.event}`)
  lines.push(`**Reveal Image:** ${project.revealImage}`)
  lines.push(`**Theme:** ${project.themeWord}`)
  lines.push('')

  lines.push('## Stills Missions')
  lines.push(`**Isolation Notes:** ${project.isolationNotes}`)
  const missions: Mission[] = project.missions ?? []
  missions.forEach((m, i) => {
    lines.push(`**Mission ${i + 1} — ${m.name}:** ${m.summary}`)
  })
  lines.push('')

  lines.push('## Shot List')
  missions.forEach((m, i) => {
    const mShots = project.shots.filter(s => s.mission === m.id)
    if (mShots.length) {
      lines.push(`### Mission ${i + 1} — ${m.name}`)
      mShots.forEach(s => {
        lines.push(`- **[${s.code}] ${s.name}** (${s.type}) — ${s.notes}`)
        lines.push(`  Lens: ${s.lens} | ${s.settings} | Priority: ${s.priority}`)
      })
    }
  })
  const unassigned = project.shots.filter(s => !missions.find(m => m.id === s.mission))
  if (unassigned.length) {
    lines.push('### Unassigned')
    unassigned.forEach(s => {
      lines.push(`- **[${s.code}] ${s.name}** (${s.type}) — ${s.notes}`)
      lines.push(`  Lens: ${s.lens} | ${s.settings} | Priority: ${s.priority}`)
    })
  }
  lines.push('')

  lines.push('## Light Strategy')
  lines.push(project.lightNotes)
  project.lightWindows.forEach(w => {
    lines.push(`### ${w.timeRange} — ${w.label}`)
    lines.push(w.notes)
  })
  lines.push('')

  lines.push('## Gear Plan')
  lines.push('### Confirmed')
  project.confirmedGear.forEach(g => lines.push(`- [${g.packed ? 'x' : ' '}] ${g.text}`))
  lines.push('### Rentals')
  project.rentalRecommendations.forEach(r =>
    lines.push(`- **${r.name}** (${r.recommendation}): ${r.rationale}`)
  )
  lines.push('')

  lines.push('## On-Set Monitoring')
  const setupSteps = project.workflowSteps?.filter(s => s.phase === 'setup') ?? []
  const onsetSteps = project.workflowSteps?.filter(s => s.phase === 'onset') ?? []
  if (setupSteps.length) {
    lines.push('### Setup')
    setupSteps.forEach(s => lines.push(`${s.number}. **${s.title}** — ${s.notes}`))
  }
  if (onsetSteps.length) {
    lines.push('### On Set')
    onsetSteps.forEach(s => lines.push(`${s.number}. **${s.title}** — ${s.notes}`))
  }
  lines.push('')

  lines.push('## Contacts')
  project.contacts.forEach(c => lines.push(`- **${c.name}** — ${c.role} — ${c.email}`))
  lines.push('')

  lines.push('## Checklist')
  project.checklistGroups.forEach(g => {
    lines.push(`### ${g.title}`)
    g.items.forEach(i => lines.push(`- [${i.done ? 'x' : ' '}] ${i.text}`))
  })

  return lines.join('\n')
}

export function exportHTML(project: Project): string {
  const missions: Mission[] = project.missions ?? []

  const shotRows = (shots: Shot[]) =>
    shots
      .map(s => {
        const typeColors: Record<string, string> = {
          E: '#87AECC',
          T: '#A8A49E',
          C: '#D4821A',
          R: '#C0392B',
        }
        const priorityColors: Record<string, string> = {
          Hero: '#C0392B',
          High: '#D4821A',
          Med: '#4A7C3F',
        }
        return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
          <td style="padding:10px 8px;white-space:nowrap">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:${typeColors[s.type] ?? '#6B6760'};color:#111110;font-weight:700;font-size:11px">${s.type}</span>
            <span style="margin-left:8px;font-size:11px;color:#6B6760;font-family:monospace">${s.code}</span>
          </td>
          <td style="padding:10px 8px">
            <div style="font-weight:600;color:#F0EDE8">${s.name}</div>
            <div style="font-size:12px;color:#A8A49E;margin-top:2px">${s.notes}</div>
          </td>
          <td style="padding:10px 8px;font-size:12px;color:#A8A49E">${s.lens}</td>
          <td style="padding:10px 8px;font-size:12px;color:#A8A49E">${s.settings}</td>
          <td style="padding:10px 8px;font-size:12px;color:#6B6760;font-family:monospace">${s.scriptRef}</td>
          <td style="padding:10px 8px">
            <span style="font-size:11px;font-weight:700;letter-spacing:.05em;padding:2px 8px;border-radius:4px;background:${priorityColors[s.priority] ?? '#6B6760'}20;color:${priorityColors[s.priority] ?? '#6B6760'};border:1px solid ${priorityColors[s.priority] ?? '#6B6760'}40">${s.priority}</span>
          </td>
        </tr>`
      })
      .join('')

  const checklistHtml = (groups: ChecklistGroup[]) =>
    groups
      .map(
        g => `
      <div style="margin-bottom:24px">
        <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6B6760;margin-bottom:12px">${g.title}</div>
        ${g.items
          .map(
            i => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
            <div style="width:16px;height:16px;border-radius:3px;border:1px solid ${i.done ? '#4A7C3F' : 'rgba(255,255,255,0.2)'};background:${i.done ? '#4A7C3F' : 'transparent'};flex-shrink:0;display:flex;align-items:center;justify-content:center">
              ${i.done ? '<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" stroke-width="1.5" fill="none"/></svg>' : ''}
            </div>
            <span style="color:${i.done ? '#6B6760' : '#F0EDE8'};text-decoration:${i.done ? 'line-through' : 'none'};font-size:14px">${i.text}</span>
          </div>`
          )
          .join('')}
      </div>`
      )
      .join('')

  const missionShotsHtml = missions.map((m, i) => {
    const mShots = project.shots.filter(s => s.mission === m.id)
    if (!mShots.length) return ''
    const color = MISSION_COLORS[i % MISSION_COLORS.length]
    return `
    <div style="background:${color}20;border:1px solid ${color}40;border-radius:6px;padding:10px 16px;margin-bottom:16px;color:${color};font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:600">Mission ${i + 1} — ${m.name}</div>
    <table style="margin-bottom:24px"><tbody>${shotRows(mShots)}</tbody></table>`
  }).join('')

  const unassigned = project.shots.filter(s => !missions.find(m => m.id === s.mission))
  const unassignedHtml = unassigned.length ? `
    <div style="background:#A8A49E20;border:1px solid #A8A49E40;border-radius:6px;padding:10px 16px;margin-bottom:16px;color:#A8A49E;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:600">Unassigned Shots</div>
    <table style="margin-bottom:24px"><tbody>${shotRows(unassigned)}</tbody></table>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${project.campaignName} — Pre-Production</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#111110;--bg2:#1A1A18;--bg3:#222220;--bg4:#2A2A28;--red:#C0392B;--text:#F0EDE8;--text-2:#A8A49E;--text-3:#6B6760;--border:rgba(255,255,255,0.08);--amber:#D4821A;--green:#4A7C3F;--blue:#87AECC}
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;line-height:1.6;padding:40px 24px;max-width:960px;margin:0 auto}
h1,h2,h3{font-family:'DM Serif Display',serif}
.eyebrow{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-3)}
.section{margin-bottom:48px;padding-bottom:48px;border-bottom:1px solid var(--border)}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;margin-bottom:16px}
table{width:100%;border-collapse:collapse}
</style>
</head>
<body>
  <header style="margin-bottom:48px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
      <div style="width:32px;height:32px;background:#C0392B;border-radius:4px;display:flex;align-items:center;justify-content:center">
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><rect x="0" y="0" width="20" height="2" fill="white"/><rect x="0" y="6" width="14" height="2" fill="white"/><rect x="0" y="12" width="20" height="2" fill="white"/></svg>
      </div>
      <span style="font-size:12px;letter-spacing:.08em;color:#A8A49E">BIG SLATE MEDIA</span>
      <span style="margin-left:auto;font-size:11px;letter-spacing:.08em;background:#C0392B20;color:#C0392B;border:1px solid #C0392B40;padding:3px 10px;border-radius:4px">PRE-PRODUCTION</span>
    </div>
    <h1 style="font-size:48px;line-height:1.1;margin-bottom:8px">${project.campaignName}</h1>
    <p style="color:#A8A49E;margin-bottom:16px">${project.campaignSentence}</p>
    <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:#A8A49E">
      <span><strong style="color:#F0EDE8">Date</strong> ${project.shootDate}</span>
      <span><strong style="color:#F0EDE8">Role</strong> ${project.myRole}</span>
      <span><strong style="color:#F0EDE8">Deliverable</strong> ${project.deliverable}</span>
      <span><strong style="color:#F0EDE8">Director</strong> ${project.director}</span>
      <span><strong style="color:#F0EDE8">Producer</strong> ${project.producer}</span>
      ${project.mood ? `<span><strong style="color:#F0EDE8">Mood</strong> ${project.mood}</span>` : ''}
      ${project.tone ? `<span><strong style="color:#F0EDE8">Tone</strong> ${project.tone}</span>` : ''}
    </div>
  </header>

  <section class="section">
    <div class="eyebrow" style="margin-bottom:8px">Story Foundation</div>
    <h2 style="font-size:28px;margin-bottom:20px">Brief</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div class="card"><div class="eyebrow" style="margin-bottom:6px">Character</div><p>${project.character}</p></div>
      <div class="card"><div class="eyebrow" style="margin-bottom:6px">Location</div><p>${project.location}</p></div>
      <div class="card"><div class="eyebrow" style="margin-bottom:6px">Event</div><p>${project.event}</p></div>
      <div class="card"><div class="eyebrow" style="margin-bottom:6px">Reveal Image</div><p>${project.revealImage}</p></div>
    </div>
    ${project.alerts.map(a => {
      const colors: Record<string, [string, string]> = {
        red: ['#C0392B', '#C0392B20'],
        amber: ['#D4821A', '#D4821A20'],
        blue: ['#87AECC', '#87AECC20'],
        green: ['#4A7C3F', '#4A7C3F20'],
      }
      const [c, bg] = colors[a.type] ?? ['#A8A49E', '#A8A49E20']
      return `<div style="background:${bg};border:1px solid ${c}40;border-radius:6px;padding:12px 16px;margin-bottom:8px;color:${c}">${a.text}</div>`
    }).join('')}
  </section>

  <section class="section">
    <div class="eyebrow" style="margin-bottom:8px">Missions Strategy</div>
    <h2 style="font-size:28px;margin-bottom:16px">Stills Missions</h2>
    <p style="color:#A8A49E;margin-bottom:20px">${project.isolationNotes}</p>
    ${missions.map((m, i) => {
      const color = MISSION_COLORS[i % MISSION_COLORS.length]
      return `<div class="card" style="border-left:3px solid ${color};margin-bottom:12px">
      <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${color};margin-bottom:6px">Mission ${i + 1} — ${m.name}</div>
      <p>${m.summary}</p>
    </div>`
    }).join('')}
  </section>

  <section class="section">
    <div class="eyebrow" style="margin-bottom:8px">Shot List</div>
    <h2 style="font-size:28px;margin-bottom:20px">Shots</h2>
    ${missionShotsHtml}
    ${unassignedHtml}
  </section>

  <section class="section">
    <div class="eyebrow" style="margin-bottom:8px">Light Strategy</div>
    <h2 style="font-size:28px;margin-bottom:16px">Light Windows</h2>
    <p style="color:#A8A49E;margin-bottom:20px">${project.lightNotes}</p>
    ${project.lightWindows.map(w => `
    <div class="card" style="margin-bottom:12px">
      <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:6px">
        <span style="color:#C0392B;font-weight:700">${w.timeRange}</span>
        <span style="font-weight:600">${w.label}</span>
      </div>
      <p style="color:#A8A49E;font-size:14px">${w.notes}</p>
    </div>`).join('')}
  </section>

  <section class="section">
    <div class="eyebrow" style="margin-bottom:8px">Checklist</div>
    <h2 style="font-size:28px;margin-bottom:20px">Master Checklist</h2>
    ${checklistHtml(project.checklistGroups)}
  </section>

  <section class="section" style="border:none">
    <div class="eyebrow" style="margin-bottom:8px">Contacts</div>
    <h2 style="font-size:28px;margin-bottom:20px">Team</h2>
    <table>
      <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
        <th style="text-align:left;padding:8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6B6760">Name</th>
        <th style="text-align:left;padding:8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6B6760">Role</th>
        <th style="text-align:left;padding:8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6B6760">Email</th>
      </tr></thead>
      <tbody>
        ${project.contacts.map(c => `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
          <td style="padding:10px 8px;font-weight:600">${c.name}</td>
          <td style="padding:10px 8px;color:#A8A49E">${c.role}</td>
          <td style="padding:10px 8px;font-family:monospace;font-size:12px;color:#A8A49E">${c.email}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </section>

  <footer style="margin-top:48px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);color:#6B6760;font-size:12px">
    Generated by Photo Mission Control — Big Slate Media — ${new Date().toLocaleDateString()}
  </footer>
</body>
</html>`
}
