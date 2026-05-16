const API_URL = 'https://api.anthropic.com/v1/messages'

async function callClaude(prompt) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key) {
    throw new Error(
      'No API key found. Add VITE_ANTHROPIC_API_KEY to your .env.local file and restart the dev server.'
    )
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `API error ${res.status}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''

  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('Could not parse suggestions from response.')

  return JSON.parse(match[0])
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function libraryLines(products) {
  if (!products.length) return 'None saved yet.'
  return products
    .map((p) => `- ${p.name}${p.price != null ? ` ($${p.price})` : ''}${p.description ? ': ' + p.description : ''}`)
    .join('\n')
}

function pastGiftLines(gifts) {
  if (!gifts.length) return 'None recorded.'
  return gifts
    .map((g) => `- ${g.name}${g.reception_notes ? ` — Reaction: "${g.reception_notes}"` : ''}`)
    .join('\n')
}

const JSON_SCHEMA = `[{"name":"...","description":"1–2 sentences on why this fits them","price_estimate":"$XX","in_library":false}]`
const JSON_NOTE = `If a suggestion matches a product already in the library above, set "in_library": true and use that exact product name. Return only the JSON array, no other text.`

// ── Exported functions ────────────────────────────────────────────────

export async function suggestForGift({ recipient, occasion, libraryProducts, pastGifts }) {
  const prompt = `You are a thoughtful gift advisor. Suggest 4 specific, buyable gift ideas.

RECIPIENT: ${recipient.name}
About them: ${recipient.gift_prompt || 'No notes provided.'}
Budget: ${recipient.budget || 'Open.'}

OCCASION: ${occasion.name} on ${fmtDate(occasion.date)}

PRODUCT LIBRARY (already saved by the user):
${libraryLines(libraryProducts)}

PAST GIFTS TO ${recipient.name}:
${pastGiftLines(pastGifts)}

Prioritize ideas that fit their personality and budget. Mix specific products from the library with new ideas.
Return exactly 4 suggestions as a JSON array: ${JSON_SCHEMA}
${JSON_NOTE}`

  return callClaude(prompt)
}

export async function suggestForRecipient({ recipient, libraryProducts, pastGifts }) {
  const prompt = `You are a thoughtful gift advisor. Suggest 4 specific, buyable gift ideas for this person.

RECIPIENT: ${recipient.name}
About them: ${recipient.gift_prompt || 'No notes provided.'}
Budget: ${recipient.budget || 'Open.'}

PRODUCT LIBRARY (already saved by the user):
${libraryLines(libraryProducts)}

PAST GIFTS TO ${recipient.name}:
${pastGiftLines(pastGifts)}

Prioritize ideas that fit their personality and budget. Avoid gifts they've already received.
Return exactly 4 suggestions as a JSON array: ${JSON_SCHEMA}
${JSON_NOTE}`

  return callClaude(prompt)
}
