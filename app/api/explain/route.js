import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY })

function buildPrompt({ name, region, year, cat, isEra, eraFrom, eraTo, eraSub }) {
  const yearLabel = year < 0 ? `${Math.abs(year)} a.C.` : `año ${year}`

  if (isEra) {
    const fromLabel = eraFrom < 0 ? `${Math.abs(eraFrom)} a.C.` : eraFrom
    const toLabel   = eraTo   < 0 ? `${Math.abs(eraTo)} a.C.`   : eraTo
    return `Historiador conciso. Respondé SOLO con JSON válido, sin markdown.

Era histórica global: "${name}" (${fromLabel} – ${toLabel})
Subtítulo: ${eraSub}

JSON requerido:
{"local":"3 oraciones describiendo la transformación más importante de esta era a nivel mundial.","regiones":[{"emoji":"🏛️","nombre":"Europa","texto":"1 oración sobre qué pasaba en Europa en esta era."},{"emoji":"🌙","nombre":"Oriente Medio","texto":"1 oración."},{"emoji":"🌎","nombre":"América","texto":"1 oración."},{"emoji":"🌏","nombre":"Asia","texto":"1 oración."},{"emoji":"🌍","nombre":"África","texto":"1 oración."}]}`
  }

  return `Historiador conciso. Respondé SOLO con JSON válido, sin markdown.

Lugar: "${name}", ${region}, ${yearLabel}, tema: ${cat}.

JSON requerido:
{"local":"2 oraciones sobre este lugar en esa época.","regiones":[{"emoji":"🏛️","nombre":"Europa","texto":"1 oración."},{"emoji":"🌙","nombre":"Oriente Medio","texto":"1 oración."},{"emoji":"🌎","nombre":"América","texto":"1 oración."},{"emoji":"🌏","nombre":"Asia","texto":"1 oración."},{"emoji":"🌍","nombre":"África","texto":"1 oración."}]}`
}

async function tryGemini(prompt) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { thinkingConfig: { thinkingBudget: 0 } }
  })
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim()
  return JSON.parse(text)
}

async function tryGroq(prompt) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 600,
    temperature: 0.3,
    messages: [
      { role: 'system', content: 'Respondés SOLO con JSON válido y completo, sin markdown. Nunca cortés el JSON a la mitad. Cada texto debe ser muy breve, máximo 20 palabras por campo.' },
      { role: 'user', content: prompt }
    ]
  })
  let text = completion.choices[0]?.message?.content?.trim()
    .replace(/```json/g, '').replace(/```/g, '').trim()
  
  // Intenta reparar JSON cortado agregando el cierre
  try {
    return JSON.parse(text)
  } catch {
    // Si falla, intenta cerrar el JSON manualmente
    if (!text.endsWith('}')) {
      text = text + '"}]}' 
    }
    return JSON.parse(text)
  }
}

export async function POST(request) {
  const body = await request.json()
  const prompt = buildPrompt(body)

  try {
    const parsed = await tryGemini(prompt)
    console.log('✓ Gemini')
    return Response.json({ parsed, url: null })
  } catch (errGemini) {
    console.warn('Gemini falló, usando Groq:', errGemini.message)
    try {
      const parsed = await tryGroq(prompt)
      console.log('✓ Groq')
      return Response.json({ parsed, url: null })
    } catch (errGroq) {
      console.error('Groq también falló:', errGroq.message)
      return Response.json({ parsed: null, text: 'No se pudo generar la información.', url: null })
    }
  }
}