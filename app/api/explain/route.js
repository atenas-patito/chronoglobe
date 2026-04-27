import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  const { name, year, region, cat } = await request.json()
  const yearLabel = year < 0 ? `${Math.abs(year)} a.C.` : `año ${year}`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `Sos un historiador que explica el estado del mundo en distintas épocas de forma accesible y apasionante.
    
Explicá qué estaba pasando en "${name}" (${region}) alrededor del ${yearLabel}, con foco en ${cat}.

Requisitos:
- 2 párrafos cortos y concretos
- En español, tono curioso y accesible, sin ser condescendiente
- Contextualizá con qué pasaba en el resto del mundo en ese mismo momento
- Sin títulos, sin bullets, solo texto fluido
- Máximo 150 palabras en total`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return Response.json({ text, url: null })
  } catch (err) {
    console.error(err)
    return Response.json({ text: 'No se pudo generar la información.', url: null })
  }
}