import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY })

const PROMPT = (name, region, yearLabel, cat) =>
`Historiador conciso. Respondé SOLO con JSON válido, sin markdown, sin explicaciones.

Lugar: "${name}", ${region}, ${yearLabel}, tema: ${cat}.

JSON requerido:
{"local":"2 oraciones sobre este lugar en esa época.","regiones":[{"emoji":"🏛️","nombre":"Europa","texto":"1 oración."},{"emoji":"🌙","nombre":"Oriente Medio","texto":"1 oración."},{"emoji":"🌎","nombre":"América","texto":"1 oración."},{"emoji":"🌏","nombre":"Asia","texto":"1 oración."},{"emoji":"🌍","nombre":"África","texto":"1 oración."}]}`

async function tryGemini(prompt) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      thinkingConfig: { thinkingBudget: 0 }
    }
  })
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim()
  return JSON.parse(text)
}

async function tryGroq(prompt) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 400,
    messages: [
      { role: 'system', content: 'Respondés SOLO con JSON válido, sin markdown ni explicaciones.' },
      { role: 'user',   content: prompt }
    ]
  })
  const text = completion.choices[0]?.message?.content?.trim()
    .replace(/```json/g, '').replace(/```/g, '').trim()
  return JSON.parse(text)
}

export async function POST(request) {
  const { name, year, region, cat } = await request.json()
  const yearLabel = year < 0 ? `${Math.abs(year)} a.C.` : `año ${year}`
  const prompt = PROMPT(name, region, yearLabel, cat)

  // Intenta Gemini primero, cae a Groq si falla
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