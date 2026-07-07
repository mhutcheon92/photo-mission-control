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
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 16000,
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
  const raw: string = data.content?.[0]?.text ?? ''

  console.log('[generate] stop_reason:', stopReason, '| raw length:', raw.length, '| first 80:', raw.slice(0, 80), '| last 80:', raw.slice(-80))

  if (stopReason === 'max_tokens') {
    return NextResponse.json({ error: 'Response was cut off — output was too long. Try a shorter brief.' }, { status: 500 })
  }

  // Extract the outermost JSON object — works regardless of fences or preamble
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  const jsonStr = start !== -1 && end > start ? raw.slice(start, end + 1) : raw

  try {
    const project = JSON.parse(jsonStr)
    return NextResponse.json({ project })
  } catch (e) {
    console.log('[generate] parse error:', e, '| jsonStr first 200:', jsonStr.slice(0, 200), '| jsonStr last 200:', jsonStr.slice(-200))
    return NextResponse.json({ error: 'Failed to parse AI response', raw: raw.slice(0, 500) }, { status: 500 })
  }
}
