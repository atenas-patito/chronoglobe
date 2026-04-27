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
  { from: -3000, to: -1200, label: "Edad de Bronce", sub: "Primeras civilizaciones escritas", color: "#1a0e00" },
  { from: -1200, to: -500,  label: "Edad de Hierro", sub: "Grecia arcaica · Fenicios · Asiria", color: "#1a1500" },
  { from: -500,  to: -27,   label: "Antigüedad clásica", sub: "Grecia · Persia · República romana", color: "#0a1020" },
  { from: -27,   to: 476,   label: "Imperio Romano", sub: "Pax romana · Expansión del cristianismo", color: "#150a20" },
  { from: 476,   to: 1000,  label: "Alta Edad Media", sub: "Caída de Roma · Islam · Carolingios", color: "#001510" },
  { from: 1000,  to: 1300,  label: "Baja Edad Media", sub: "Cruzadas · Renacimiento urbano", color: "#101500" },
  { from: 1300,  to: 1500,  label: "Renacimiento", sub: "Peste negra · Humanismo · Imprenta", color: "#1a0a00" },
  { from: 1500,  to: 1650,  label: "Edad Moderna", sub: "América · Reforma · Imperios globales", color: "#1a0000" },
  { from: 1650,  to: 1750,  label: "Absolutismo", sub: "Revolución científica · Monarquías", color: "#00101a" },
  { from: 1750,  to: 1800,  label: "Ilustración", sub: "Razón · Enciclopedia · Independencias", color: "#00001a" },
  { from: 1800,  to: 1850,  label: "Revolución Industrial", sub: "Vapor · Romanticismo · Napoleón", color: "#0a0a1a" },
  { from: 1850,  to: 1914,  label: "Siglo XIX tardío", sub: "Imperialismo · Darwin · Marxismo", color: "#001a1a" },
  { from: 1914,  to: 1945,  label: "Era de las guerras", sub: "Guerras mundiales · Fascismo", color: "#1a0000" },
  { from: 1945,  to: 1991,  label: "Guerra Fría", sub: "Descolonización · Derechos civiles", color: "#00001a" },
  { from: 1991,  to: 2000,  label: "Mundo contemporáneo", sub: "Globalización · Internet", color: "#001a10" },
]

const MILESTONES = [
  { year: -3000, label: "Escritura" },
  { year: -500,  label: "Atenas" },
  { year: -44,   label: "César" },
  { year: 476,   label: "Caída Roma" },
  { year: 800,   label: "Bagdad" },
  { year: 1215,  label: "Magna Carta" },
  { year: 1440,  label: "Imprenta" },
  { year: 1492,  label: "América" },
  { year: 1687,  label: "Newton" },
  { year: 1789,  label: "Rev. Francesa" },
  { year: 1859,  label: "Darwin" },
  { year: 1914,  label: "1ª Guerra" },
  { year: 1969,  label: "Luna" },
]

const MIN_YEAR = -3000
const MAX_YEAR = 2000

function yearToPercent(year) {
  return ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100
}

function getEra(from, to) {
  const mid = (from + to) / 2
  return ERAS.find(e => mid >= e.from && mid < e.to) || ERAS[ERAS.length - 1]
}

function formatYear(y) {
  return y < 0 ? `${Math.abs(y)} a.C.` : `${y}`
}

export default function Home() {
  const globeEl  = useRef(null)
  const worldRef = useRef(null)
  const fromRef  = useRef(null)
  const toRef    = useRef(null)

  const [yearFrom, setYearFrom] = useState(-500)
  const [yearTo,   setYearTo]   = useState(1800)
  const [filter,   setFilter]   = useState('all')
  const [panel,    setPanel]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  const visibleEvents = EVENTS.filter(e => {
    const inTime = e.year >= yearFrom && e.year <= yearTo
    const inCat  = filter === 'all' || e.cat === filter
    return inTime && inCat
  })

  const era = getEra(yearFrom, yearTo)

  async function handlePointClick(event) {
    setPanel({ name: event.name, region: event.region, year: event.year, text: null })
    setLoading(true)
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: event.name, year: event.year, region: event.region, cat: event.cat })
      })
      const data = await res.json()
      setPanel({ name: event.name, region: event.region, year: event.year, text: data.text, url: data.url, wikiTitle: data.title })
    } catch {
      setPanel(p => ({ ...p, text: 'No se pudo cargar la información.' }))
    }
    setLoading(false)
  }

  // Dual range: maneja cuál thumb mover según posición del click
  function handleRangeClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    const year = Math.round(MIN_YEAR + pct * (MAX_YEAR - MIN_YEAR))
    const midpoint = (yearFrom + yearTo) / 2
    if (year < midpoint) setYearFrom(Math.min(year, yearTo - 1))
    else setYearTo(Math.max(year, yearFrom + 1))
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
        .pointLabel(e => `<div style="background:#000;color:#fff;padding:6px 10px;border-radius:6px;font-size:13px">${e.name}<br/><span style="opacity:0.6;font-size:11px">${formatYear(e.year)}</span></div>`)
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
    if (worldRef.current) worldRef.current.pointsData(visibleEvents)
  }, [yearFrom, yearTo, filter])

  const categories = ['all','filosofia','derecho','ciencia','politica','arte','economia']

  const leftPct  = yearToPercent(yearFrom)
  const rightPct = yearToPercent(yearTo)

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: era.color, transition: 'background 1.2s ease' }}>
      <div ref={globeEl} style={{ width: '100%', height: '100%' }} />

      {/* Era watermark */}
      <div style={{
        position: 'absolute', bottom: 120, left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center', pointerEvents: 'none', userSelect: 'none'
      }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: 'rgba(255,255,255,0.12)', letterSpacing: 3, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          {era.label}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.08)', marginTop: 4, whiteSpace: 'nowrap' }}>
          {era.sub}
        </div>
      </div>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '10px 16px 12px',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(10px)',
        display: 'flex', flexDirection: 'column', gap: 8
      }}>

        {/* Row 1: brand + year inputs + filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 15, letterSpacing: 1 }}>Chronoglobe</span>

          {/* Year inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="number" value={yearFrom}
              onChange={e => {
                const v = Number(e.target.value)
                if (v >= MIN_YEAR && v < yearTo) setYearFrom(v)
              }}
              style={{ width: 76, padding: '3px 6px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, textAlign: 'center', fontFamily: 'inherit' }}
            />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>—</span>
            <input type="number" value={yearTo}
              onChange={e => {
                const v = Number(e.target.value)
                if (v <= MAX_YEAR && v > yearFrom) setYearTo(v)
              }}
              style={{ width: 76, padding: '3px 6px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, textAlign: 'center', fontFamily: 'inherit' }}
            />
          </div>

          {/* Era pill */}
          <span style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 20,
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap'
          }}>{era.label}</span>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginLeft: 'auto' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.25)',
                background: filter === cat ? '#fff' : 'transparent',
                color: filter === cat ? '#000' : 'rgba(255,255,255,0.8)',
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
                {cat === 'all' ? 'Todo' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Era buttons */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {ERAS.map(e => (
            <button key={e.from} onClick={() => { setYearFrom(e.from); setYearTo(e.to) }}
              style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.2)',
                background: (yearFrom === e.from && yearTo === e.to) ? 'rgba(255,255,255,0.25)' : 'transparent',
                color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap'
              }}>
              {e.label}
            </button>
          ))}
        </div>

        {/* Row 3: Timeline */}
        <div style={{ position: 'relative' }}>

          {/* Milestone markers */}
          <div style={{ position: 'relative', height: 22, marginBottom: 2 }}>
            {MILESTONES.map((m, i) => {
              const pct = yearToPercent(m.year)
              const inRange = m.year >= yearFrom && m.year <= yearTo
              // Skip if too close to neighbors to avoid overlap
              const prev = MILESTONES[i - 1]
              if (prev && yearToPercent(m.year) - yearToPercent(prev.year) < 6) return null
              return (
                <button key={m.year}
                  onClick={() => {
                    const era = ERAS.find(e => m.year >= e.from && m.year < e.to)
                    if (era) { setYearFrom(era.from); setYearTo(era.to) }
                  }}
                  style={{
                    position: 'absolute', left: `${pct}%`,
                    transform: 'translateX(-50%)',
                    background: 'none', border: 'none', padding: 0,
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center'
                  }}>
                  <span style={{ fontSize: 9, color: inRange ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', transition: 'color 0.3s' }}>
                    {m.label}
                  </span>
                  <span style={{ width: 1, height: 5, background: inRange ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', display: 'block', transition: 'background 0.3s' }} />
                </button>
              )
            })}
          </div>

          {/* Track visual */}
          <div style={{ position: 'relative', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', cursor: 'pointer' }}
            onClick={handleRangeClick}>
            <div style={{
              position: 'absolute', top: 0, height: '100%', borderRadius: 2,
              background: 'rgba(255,255,255,0.7)',
              left: `${leftPct}%`, width: `${rightPct - leftPct}%`
            }} />
            {/* Left thumb */}
            <div style={{
              position: 'absolute', top: '50%', left: `${leftPct}%`,
              transform: 'translate(-50%, -50%)',
              width: 14, height: 14, borderRadius: '50%',
              background: '#fff', border: '2px solid rgba(0,0,0,0.3)',
              cursor: 'ew-resize', zIndex: 2
            }}
              onMouseDown={e => {
                e.preventDefault()
                const track = e.currentTarget.parentElement
                const move = ev => {
                  const rect = track.getBoundingClientRect()
                  const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
                  const y = Math.round(MIN_YEAR + pct * (MAX_YEAR - MIN_YEAR))
                  if (y < yearTo) setYearFrom(y)
                }
                const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
                window.addEventListener('mousemove', move)
                window.addEventListener('mouseup', up)
              }}
            />
            {/* Right thumb */}
            <div style={{
              position: 'absolute', top: '50%', left: `${rightPct}%`,
              transform: 'translate(-50%, -50%)',
              width: 14, height: 14, borderRadius: '50%',
              background: '#fff', border: '2px solid rgba(0,0,0,0.3)',
              cursor: 'ew-resize', zIndex: 2
            }}
              onMouseDown={e => {
                e.preventDefault()
                const track = e.currentTarget.parentElement
                const move = ev => {
                  const rect = track.getBoundingClientRect()
                  const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
                  const y = Math.round(MIN_YEAR + pct * (MAX_YEAR - MIN_YEAR))
                  if (y > yearFrom) setYearTo(y)
                }
                const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
                window.addEventListener('mousemove', move)
                window.addEventListener('mouseup', up)
              }}
            />
          </div>

          {/* Year labels below track */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>3000 a.C.</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              {formatYear(yearFrom)} — {formatYear(yearTo)}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>2000</span>
          </div>
        </div>
      </div>

      {/* Panel lateral */}
      {panel && (
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 300, height: '100%',
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          padding: '20px 16px', overflowY: 'auto', color: '#fff'
        }}>
          <button onClick={() => setPanel(null)} style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', color: '#fff',
            fontSize: 20, cursor: 'pointer'
          }}>×</button>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>{panel.region}</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{panel.name}</div>
          {panel.wikiTitle && panel.wikiTitle !== panel.name && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
              Wikipedia: {panel.wikiTitle}
            </div>
          )}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>{formatYear(panel.year)}</div>
          {loading && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Buscando información...</div>}
          {panel.text && (
            <>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: 'rgba(255,255,255,0.82)' }}>{panel.text}</p>
              {panel.url && (
                <a href={panel.url} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-block', marginTop: 16, fontSize: 12, color: '#7F77DD' }}>
                  Ver en Wikipedia →
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}