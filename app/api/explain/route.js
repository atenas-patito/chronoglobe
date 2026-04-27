export async function POST(request) {
  const { name, year, region, cat } = await request.json()

  const yearLabel = year < 0 ? `${Math.abs(year)} a.C.` : `${year}`

  // Construye términos de búsqueda más específicos
  // Extrae palabras clave del nombre del evento, descartando palabras genéricas
  const stopWords = ['de', 'del', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'un', 'una', 'por', 'con', 'su', 'al']
  const keywords = name.split(' ')
    .filter(w => !stopWords.includes(w.toLowerCase()) && w.length > 2)
    .slice(0, 4)
    .join(' ')

  const country = region.split('·')[1]?.trim() || region

  // Intentos de búsqueda en orden de especificidad
  const searches = [
    keywords,
    `${keywords} ${country}`,
    name,
  ]

  for (const query of searches) {
    try {
      // Primero busca en Wikipedia
      const searchRes = await fetch(
        `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=3`
      )
      const searchData = await searchRes.json()
      const results = searchData.query?.search || []

      // Filtrá resultados que sean siglos o fechas genéricas
      const filtered = results.filter(r => {
        const t = r.title.toLowerCase()
        return !t.startsWith('siglo') && !t.startsWith('año') && !t.match(/^\d/)
      })

      if (filtered.length === 0) continue

      // Trae el resumen del primer resultado relevante
      const pageRes = await fetch(
        `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(filtered[0].title)}`
      )

      if (!pageRes.ok) continue

      const page = await pageRes.json()

      if (!page.extract || page.extract.length < 100) continue

      // Trunca si es muy largo
      const text = page.extract.length > 800
        ? page.extract.substring(0, 800) + '...'
        : page.extract

      return Response.json({
        title: page.title,
        text,
        url: page.content_urls?.desktop?.page || null
      })

    } catch {
      continue
    }
  }

  // Si no encontró nada útil
  return Response.json({
    title: name,
    text: `No se encontró información específica sobre este evento en Wikipedia. Podés buscarlo directamente como "${name}" (${yearLabel}, ${region}).`,
    url: `https://es.wikipedia.org/w/index.php?search=${encodeURIComponent(name)}`
  })
}