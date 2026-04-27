export async function POST(request) {
  const { name, year, region } = await request.json()

  const yearLabel = year < 0 ? `${Math.abs(year)} a.C.` : `${year}`

  // Busca en Wikipedia en español
  const searchRes = await fetch(
    `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
  )

  if (searchRes.ok) {
    const data = await searchRes.json()
    return Response.json({
      text: data.extract || 'No se encontró información para este evento.',
      url: data.content_urls?.desktop?.page || null
    })
  }

  // Si no encuentra por nombre exacto, intenta búsqueda
  const fallbackRes = await fetch(
    `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name + ' ' + yearLabel)}&format=json&origin=*`
  )
  const fallback = await fallbackRes.json()
  const firstResult = fallback.query?.search?.[0]

  if (firstResult) {
    const pageRes = await fetch(
      `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstResult.title)}`
    )
    const page = await pageRes.json()
    return Response.json({
      text: page.extract || 'No se encontró información.',
      url: page.content_urls?.desktop?.page || null
    })
  }

  return Response.json({ text: 'No se encontró información para este evento.', url: null })
}