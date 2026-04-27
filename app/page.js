'use client'
import { useEffect, useRef, useState } from 'react'
import EVENTS from './events'

const CAT_COLORS = {
  filosofia: '#7F77DD',
  derecho:   '#1D9E75',
  ciencia:   '#378ADD',
  politica:  '#D85A30',
  arte:      '#D4537E',
  economia:  '#BA7517'
}

export default function Home() {
  const globeEl = useRef(null)
  const worldRef = useRef(null)
  const [yearFrom, setYearFrom] = useState(-500)
  const [yearTo, setYearTo]     = useState(2000)
  const [filter, setFilter]     = useState('all')
  const [panel, setPanel]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const visibleEvents = EVENTS.filter(e => {
    const inTime = e.year >= yearFrom && e.year <= yearTo
    const inCat  = filter === 'all' || e.cat === filter
    return inTime && inCat
  })

  async function handlePointClick(event) {
    setPanel({ name: event.name, region: event.region, year: event.year, text: null })
    setLoading(true)
    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: event.name, year: event.year, region: event.region, cat: event.cat })
    })
    const data = await res.json()
    setPanel({ name: event.name, region: event.region, year: event.year, text: data.text, url: data.url })
    setLoading(false)
  }

  useEffect(() => {
    import('globe.gl').then(({ default: Globe }) => {
      const world = Globe()(globeEl.current)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .width(window.innerWidth)
        .height(window.innerHeight)
        .pointsData(visibleEvents)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor(e => CAT_COLORS[e.cat] || '#ffffff')
        .pointRadius(0.6)
        .pointAltitude(0.01)
        .pointLabel(e => `<div style="background:#000;color:#fff;padding:6px 10px;border-radius:6px;font-size:13px">${e.name}<br/><span style="opacity:0.6;font-size:11px">${e.year < 0 ? Math.abs(e.year) + ' a.C.' : e.year}</span></div>`)
        .onPointClick(e => handlePointClick(e))

      world.controls().autoRotate = true
      world.controls().autoRotateSpeed = 0.5

      let autoRotateTimeout
      globeEl.current.addEventListener('pointerdown', () => {
        world.controls().autoRotate = false
        clearTimeout(autoRotateTimeout)
      })
      globeEl.current.addEventListener('pointerup', () => {
        autoRotateTimeout = setTimeout(() => {
          world.controls().autoRotate = true
        }, 4000)
      })

      worldRef.current = world
    })
  }, [])

  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.pointsData(visibleEvents)
    }
  }, [yearFrom, yearTo, filter])

  const categories = ['all','filosofia','derecho','ciencia','politica','arte','economia']

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
      <div ref={globeEl} style={{ width: '100%', height: '100%' }} />

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ color: '#fff', fontWeight: 500, fontSize: 14 }}>Chronoglobe</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="number" value={yearFrom}
              onChange={e => setYearFrom(Number(e.target.value))}
              style={{ width: 72, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, textAlign: 'center' }}
            />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>—</span>
            <input type="number" value={yearTo}
              onChange={e => setYearTo(Number(e.target.value))}
              style={{ width: 72, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, textAlign: 'center' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: filter === cat ? '#fff' : 'transparent',
                  color: filter === cat ? '#000' : '#fff',
                  cursor: 'pointer'
                }}>
                {cat === 'all' ? 'Todo' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {panel && (
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 320, height: '100%',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          padding: '20px 16px', overflowY: 'auto', color: '#fff'
        }}>
          <button onClick={() => setPanel(null)} style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', color: '#fff',
            fontSize: 20, cursor: 'pointer'
          }}>×</button>

          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{panel.region}</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{panel.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
            {panel.year < 0 ? `${Math.abs(panel.year)} a.C.` : panel.year}
          </div>

          {loading && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Buscando información...</div>
          )}

          {panel.text && (
            <>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>{panel.text}</p>
              {panel.url && (
                <a href={panel.url} target="_blank" rel="noreferrer" style={{
                  display: 'inline-block', marginTop: 16,
                  fontSize: 12, color: '#7F77DD'
                }}>Ver en Wikipedia →</a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}