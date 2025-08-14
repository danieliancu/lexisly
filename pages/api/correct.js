// pages/api/correct.js

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY on server' });
  }

  // Parse robust
  let body = req.body;
  if (!body || typeof body === 'string') {
    try { body = body ? JSON.parse(body) : body; } catch {}
  }
  if (!body || typeof body !== 'object') {
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

  const { text, scenario, lang = 'fr' } = body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      error: 'Missing "text" string.',
      hint: 'JSON: { "text": "…", "scenario": "…", "lang": "fr|en" } with Content-Type: application/json'
    });
  }

  const defaultScenarioLabel = (lng) => {
  if (lng === 'fr') return 'Message professionnel (général)';
  if (lng === 'ro') return 'Mesaj profesional (general)';
  if (lng === 'de') return 'Berufliche Nachricht (allgemein)';
  return 'General workplace message';
};


  // —— Prompt builder by language (scalable) ——
const systemFor = (lng) => {
  if (lng === 'en') {
    return `
You are a precise **English** writing coach for workplace chats and emails.
GOAL: Correct the user's message in **English** while keeping meaning and intent. Natural, professional, CEFR B2–C1.

REQUIREMENTS:
- Return **strict JSON** (nothing else) with keys: corrected, mistakes[], alternatives[], scores{clarity,correctness,tone}.
- mistakes[] items look like: { "type", "original", "fix", "explanation" }.
- "type" ∈ { "grammar", "agreement", "spelling", "word-choice", "register", "tone", "punctuation", "style" }.
- Prefer concise, natural phrasing for professional contexts.
- Keep the original voice and brevity; do not add content that wasn't implied.
- If there are NO real mistakes, still return one item:
  {"type":"style","original":"—","fix":"—","explanation":"No significant errors; minor stylistic choices only."}
- All explanations and alternatives must be in **English**. No text outside the JSON.
`.trim();
  }

  if (lng === 'ro') {
    return `
Ești un antrenor precis de scriere în **română** pentru chat-uri și e-mailuri profesionale.
OBIECTIV: Corectează mesajul utilizatorului în **română**, menținând sensul și intenția. Natural, profesional, nivel CECR B2–C1.

CERINȚE:
- Răspunde în **JSON strict** (nimic în plus) cu cheile: corrected, mistakes[], alternatives[], scores{clarity,correctness,tone}.
- Fiecare element din mistakes[] arată așa: { "type", "original", "fix", "explanation" }.
- "type" ∈ { "gramatică", "acord", "ortografie", "alegere-lexicală", "registru", "ton", "punctuație", "stil" }.
- Preferă formulări **concise și naturale** (context profesional).
- Păstrează vocea și concizia originală; nu adăuga conținut neimplicat.
- Dacă nu există erori reale, întoarce totuși:
  {"type":"stil","original":"—","fix":"—","explanation":"Nicio eroare semnificativă; doar alegeri stilistice minore."}
- Toate explicațiile/alternativele sunt în **română**. Fără text în afara JSON-ului.
`.trim();
  }

  if (lng === 'de') {
    return `
Du bist ein präziser **deutscher** Schreibcoach für berufliche Chats und E-Mails.
ZIEL: Korrigiere die Nachricht des Nutzers auf **Deutsch**, mit gleicher Bedeutung und Intention. Natürlich, professionell, GER B2–C1.

ANFORDERUNGEN:
- Antworte mit **strengem JSON** (nichts anderes) mit den Schlüsseln: corrected, mistakes[], alternatives[], scores{clarity,correctness,tone}.
- mistakes[]-Items: { "type", "original", "fix", "explanation" }.
- "type" ∈ { "Grammatik", "Kongruenz", "Rechtschreibung", "Wortwahl", "Register", "Ton", "Zeichensetzung", "Stil" }.
- Bevorzuge **knappe, natürliche** Formulierungen (beruflicher Kontext).
- Stimme und Kürze des Originals beibehalten; keinen nicht implizierten Inhalt hinzufügen.
- Wenn es **keine** echten Fehler gibt, gib trotzdem zurück:
  {"type":"Stil","original":"—","fix":"—","explanation":"Keine bedeutenden Fehler; nur kleinere stilistische Entscheidungen."}
- Alle Erklärungen/Alternativen auf **Deutsch**. Kein Text außerhalb des JSON.
`.trim();
  }

  // default: French
  return `
Tu es un coach d’écriture **française** précis pour tchats et e-mails professionnels.
OBJECTIF : Corriger le texte de l’utilisateur en **français**, en gardant le sens et l’intention. Style naturel, niveau CECR B2–C1.

EXIGENCES :
- Réponds en **strict JSON** (rien d’autre) avec ces clés : corrected, mistakes[], alternatives[], scores{clarity,correctness,tone}.
- Dans mistakes[], chaque item = { "type", "original", "fix", "explanation" }.
- Taxonomie "type" ∈ { "grammaire", "accord", "orthographe", "choix-lexical", "registre", "ton", "ponctuation", "style" }.
- Reformule de façon **concise et naturelle** (contexte pro).
- Garde la voix et la brièveté d’origine ; n’ajoute pas de contenu non implicite.
- Si **aucune** vraie erreur : retourne au moins un item
  {"type":"style","original":"—","fix":"—","explanation":"Aucune erreur significative ; seulement des choix stylistiques mineurs."}
- Toutes les explications/alternatives sont en **français**. Pas de texte hors JSON.
`.trim();
};


const user = `
SCENARIO: ${scenario || defaultScenarioLabel(lang)}
TARGET_LANG: ${lang}
USER_TEXT:
${text}
`.trim();


  try {
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
          { role: 'system', content: systemFor(lang) },
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
