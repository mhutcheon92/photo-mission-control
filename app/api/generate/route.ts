import { NextRequest, NextResponse } from 'next/server'

interface ImageBlock {
  type: 'image'
  source: {
    type: 'base64'
    media_type: string
    data: string
  }
}

interface TextBlock {
  type: 'text'
  text: string
}

type ContentBlock = TextBlock | ImageBlock

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  const { brief, systemPrompt, attachments } = await req.json()

  // Build content array — text brief first, then any image attachments
  const content: ContentBlock[] = [{ type: 'text', text: brief }]

  if (Array.isArray(attachments)) {
    for (const att of attachments) {
      if (att.type === 'image' && att.base64 && att.mediaType) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: att.mediaType,
            data: att.base64,
          },
        })
      }
    }
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 32000,
      system: systemPrompt,
      messages: [{ role: 'user', content }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return NextResponse.json({ error: 'Anthropic API error', detail: err }, { status: 500 })
  }

  const data = await response.json()
  const stopReason: string = data.stop_reason ?? 'unknown'
  // Find the first text block — Sonnet 5 may prepend a thinking block before the text block
  const textBlock = (data.content ?? []).find((b: { type: string }) => b.type === 'text')
  const raw: string = textBlock?.text ?? ''

  console.log('[generate] stop_reason:', stopReason, '| blocks:', (data.content ?? []).map((b: { type: string }) => b.type).join(','), '| raw length:', raw.length, '| first 120:', raw.slice(0, 120))

  // Extract the outermost JSON object — works regardless of fences or preamble
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  const jsonStr = start !== -1 && end > start ? raw.slice(start, end + 1) : raw

  try {
    const project = JSON.parse(jsonStr)
    return NextResponse.json({ project })
  } catch (e) {
    if (stopReason === 'max_tokens') {
      console.log('[generate] max_tokens hit, JSON unparseable')
      return NextResponse.json(
        { error: 'The AI output was cut short. Try reducing your brief length or number of attachments.' },
        { status: 500 }
      )
    }
    console.log('[generate] parse error:', e, '| jsonStr first 200:', jsonStr.slice(0, 200), '| jsonStr last 200:', jsonStr.slice(-200))
    return NextResponse.json({ error: 'Failed to parse AI response', raw: raw.slice(0, 500) }, { status: 500 })
  }
}
