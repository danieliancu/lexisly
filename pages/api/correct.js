// ✅ Forțează bodyParser doar pe această rută (indiferent ce ai global)
export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY on server' });
  }
  
    console.log('[correct] CT:', req.headers['content-type'], 'BODY_TYPE:', typeof req.body);

  // --- Citește corpul în mod robust (object / string / stream) ---
  let body = req.body;
  if (!body || typeof body === 'string') {
    try { body = body ? JSON.parse(body) : body; } catch {}
  }
  if (!body || typeof body !== 'object') {
    // Fallback: citește stream-ul (dacă bodyParser e off global)
    body = await new Promise((resolve) => {
      let raw = '';
      req.setEncoding('utf8');
      req.on('data', chunk => raw += chunk);
      req.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { resolve(null); }
      });
    });
  }


 // 👇 LOG 3: după ce ai un body (sau nu), vezi cheile primite
  console.log('[correct] PARSED_BODY_TYPE:', typeof body, 'KEYS:', body && Object.keys(body));


  const { text, scenario } = body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      error: 'Missing "text" string.',
      hint: 'Trimite JSON: { "text": "…", "scenario": "…" } cu Content-Type: application/json'
    });
  }

// ... restul codului tău rămâne identic, doar schimbă textul `system`:

const system = `You are a precise English writing coach for workplace chats and emails.
GOAL: Correct the user's message while keeping meaning and intent. Make it natural and professional at CEFR B2–C1.
REQUIREMENTS:
- Return strict JSON with keys: corrected, mistakes[], alternatives[], scores{clarity,correctness,tone}.
- In "mistakes", classify type ∈ {grammar, agreement, spelling, word-choice, register, tone, punctuation, style}.
- Keep the original voice and brevity; do not add content that wasn't implied.
- Prefer concise, natural phrasing over literal translations.
- If there are NO real mistakes, still return one item in mistakes with:
  {"type":"style","original":"—","fix":"—","explanation":"No significant errors; minor stylistic choices only."}
- Never include extra commentary outside the JSON.`;


  const user = `SCENARIO: ${scenario || 'General workplace message'}
USER_TEXT:
${text}
`;

  try {
    // Timeout defensiv
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
                model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(t);

    if (!response.ok) {
      let details = null;
      try { details = await response.json(); } catch { details = await response.text(); }
      return res.status(response.status).json({ error: 'OpenAI error', details });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() ?? '{}';

    let parsed;
    try { parsed = JSON.parse(raw); }
    catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed || typeof parsed !== 'object') {
      return res.status(502).json({ error: 'Bad AI response', raw });
    }

    if (!Array.isArray(parsed.mistakes)) parsed.mistakes = [];
    if (!Array.isArray(parsed.alternatives)) parsed.alternatives = [];
    const s = parsed.scores || {};
    parsed.scores = {
      clarity: Math.max(0, Math.min(10, Number(s.clarity) || 0)),
      correctness: Math.max(0, Math.min(10, Number(s.correctness) || 0)),
      tone: Math.max(0, Math.min(10, Number(s.tone) || 0))
    };

    return res.status(200).json(parsed);
  } catch (e) {
    if (e.name === 'AbortError') {
      return res.status(504).json({ error: 'Upstream timeout' });
    }
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
