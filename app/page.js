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

const ERAS = [
  { from: -3000, to: -1200, label: "Edad de Bronce", sub: "Primeras civilizaciones", color: "#2a1a0a" },
  { from: -1200, to: -500, label: "Edad de Hierro", sub: "Grecia arcaica · Fenicios · Asiria", color: "#1a1a0a" },
  { from: -500, to: -27, label: "Antigüedad clásica", sub: "Grecia · Persia · República romana", color: "#0a1a2a" },
  { from: -27, to: 476, label: "Imperio Romano", sub: "Pax romana · Expansión del cristianismo", color: "#1a0a2a" },
  { from: 476, to: 1000, label: "Alta Edad Media", sub: "Caída de Roma · Islam · Carolingios", color: "#0a2a1a" },
  { from: 1000, to: 1300, label: "Baja Edad Media", sub: "Cruzadas · Renacimiento urbano", color: "#1a2a0a" },
  { from: 1300, to: 1500, label: "Crisis medieval · Renacimiento", sub: "Peste negra · Humanismo italiano", color: "#2a1a00" },
  { from: 1500, to: 1650, label: "Edad Moderna temprana", sub: "América · Reforma · Imperios globales", color: "#2a0a0a" },
  { from: 1650, to: 1750, label: "Absolutismo · Barroco", sub: "Revolución científica · Monarquías", color: "#0a1a2a" },
  { from: 1750, to: 1800, label: "Ilustración", sub: "Razón · Enciclopedia · Independencias", color: "#0a0a2a" },
  { from: 1800, to: 1850, label: "Revolución Industrial", sub: "Vapor · Romanticismo · Napoleón", color: "#1a1a2a" },
  { from: 1850, to: 1914, label: "Siglo XIX tardío", sub: "Imperialismo · Darwin · Marxismo", color: "#0a2a2a" },
  { from: 1914, to: 1945, label: "Era de las guerras", sub: "Guerras mundiales · Fascismo · Crisis", color: "#2a0a0a" },
  { from: 1945, to: 1991, label: "Guerra Fría", sub: "Descolonización · Space race · Derechos civiles", color: "#0a0a1a" },
  { from: 1991, to: 2000, label: "Mundo contemporáneo", sub: "Globalización · Internet · Fin de la URSS", color: "#001a1a" },
]

const MILESTONES = [
  { year: -3000, label: "Escritura" },
  { year: -776,  label: "Olimpiadas" },
  { year: -44,   label: "César" },
  { year: 570,   label: "Mahoma" },
  { year: 1066,  label: "Normandos" },
  { year: 1215,  label: "Magna Carta" },
  { year: 1347,  label: "Peste negra" },
  { year: 1440,  label: "Imprenta" },
  { year: 1492,  label: "América" },
  { year: 1543,  label: "Copérnico" },
  { year: 1687,  label: "Newton" },
  { year: 1776,  label: "Independencia" },
  { year: 1789,  label: "Rev. Francesa" },
  { year: 1859,  label: "Darwin" },
  { year: 1914,  label: "1ª Guerra" },
  { year: 1969,  label: "Luna" },
]

function getEra(from, to) {
  const mid = (from + to) / 2
  return ERAS.find(e => mid >= e.from && mid < e.to) || ERAS[ERAS.length - 1]
}

function yearToPercent(year) {
  return ((year - (-3000)) / (2000 - (-3000))) * 100
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

 const era = getEra(yearFrom, yearTo)

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: era.color, transition: 'background 1s ease' }}>
      <div ref={globeEl} style={{ width: '100%', height: '100%' }} />

      {/* Era display */}
      <div style={{
        position: 'absolute', bottom: 100, left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center', pointerEvents: 'none'
      }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.15)', letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          {era.label}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.1)', marginTop: 4 }}>
          {era.sub}
        </div>
      </div>

      {/* Top bar */}
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

        {/* Slider con hitos */}
        <div style={{ position: 'relative', padding: '0 4px' }}>

          {/* Hitos */}
          <div style={{ position: 'relative', height: 20, marginBottom: 2 }}>
            {MILESTONES.map(m => {
              const pct = yearToPercent(m.year)
              if (pct < 0 || pct > 100) return null
              const inRange = m.year >= yearFrom && m.year <= yearTo
              return (
                <div key={m.year} style={{
                  position: 'absolute',
                  left: `${pct}%`,
                  transform: 'translateX(-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  opacity: inRange ? 1 : 0.3,
                  transition: 'opacity 0.3s'
                }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{m.label}</span>
                  <span style={{ width: 1, height: 4, background: 'rgba(255,255,255,0.4)', display: 'block' }} />
                </div>
              )
            })}
          </div>

          {/* Sliders duales */}
          <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
            <div style={{
              position: 'absolute', left: 0, right: 0, height: 3,
              background: 'rgba(255,255,255,0.2)', borderRadius: 2
            }} />
            <div style={{
              position: 'absolute', height: 3,
              left: `${yearToPercent(yearFrom)}%`,
              width: `${yearToPercent(yearTo) - yearToPercent(yearFrom)}%`,
              background: '#fff', borderRadius: 2
            }} />
            <input type="range" min={-3000} max={2000} value={yearFrom} step={1}
              onChange={e => {
                const v = Number(e.target.value)
                if (v < yearTo) setYearFrom(v)
              }}
              style={{ position: 'absolute', width: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }}
            />
            <input type="range" min={-3000} max={2000} value={yearTo} step={1}
              onChange={e => {
                const v = Number(e.target.value)
                if (v > yearFrom) setYearTo(v)
              }}
              style={{ position: 'absolute', width: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>3000 a.C.</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              {era.label} · {yearFrom < 0 ? `${Math.abs(yearFrom)} a.C.` : yearFrom} — {yearTo < 0 ? `${Math.abs(yearTo)} a.C.` : yearTo}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>2000</span>
          </div>
        </div>
      </div>

      {/* Panel lateral */}
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