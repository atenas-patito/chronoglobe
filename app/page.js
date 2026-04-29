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

const CAT_ICONS = {
  filosofia: '✒️',
  derecho:   '⚖️',
  ciencia:   '⚙️',
  politica:  '🏛️',
  arte:      '🎨',
  economia:  '⚖️'
}

const ERAS = [
  { from: -10000, to: -3500, label: "Revolución del Neolítico", sub: "Agricultura · Aldeas · Domesticación", color: "#1a1208",
    icons: ["🌾", "🐄", "🏕️"] },
  { from: -3500, to: -1200, label: "Primeras civilizaciones", sub: "Escritura · Ciudades · Estados", color: "#1a0e00",
    icons: ["🏺", "📜", "🏛️"] },
  { from: -1200, to: -200, label: "Edad Axial", sub: "Buda · Confucio · Sócrates · Zoroastro", color: "#0e1520",
    icons: ["☯️", "🕊️", "📖"] },
  { from: -200, to: 600, label: "Imperios clásicos", sub: "Roma · Han · Parta · Maurya", color: "#150a20",
    icons: ["🏟️", "⚔️", "🛣️"] },
  { from: 600, to: 1000, label: "Expansión religiosa", sub: "Islam · Budismo · Cristianismo · Hinduismo", color: "#0e1f18",
    icons: ["🕌", "☸️", "✝️"] },
  { from: 1000, to: 1400, label: "Mundo pre-moderno conectado", sub: "Ruta de la Seda · Mongoles · Intercambio global", color: "#1a1500",
    icons: ["🗺️", "🐪", "⚖️"] },
  { from: 1400, to: 1700, label: "Ruptura y conexión global", sub: "Imprenta · América · Reforma · Sistema-mundo", color: "#1a0a00",
    icons: ["⛵", "🖨️", "🌎"] },
  { from: 1700, to: 1800, label: "Era de la razón", sub: "Ilustración · Revolución científica · Independencias", color: "#0e0e2a",
    icons: ["💡", "📚", "⚖️"] },
  { from: 1800, to: 1914, label: "Era industrial", sub: "Vapor · Capitalismo · Imperialismo · Nacionalismo", color: "#0a0a1a",
    icons: ["⚙️", "🚂", "🌍"] },
  { from: 1914, to: 1945, label: "Era de las crisis globales", sub: "Guerras mundiales · Fascismo · Gran Depresión", color: "#20080a",
    icons: ["✈️", "☢️", "🕊️"] },
  { from: 1945, to: 1991, label: "Era de la descolonización", sub: "Guerra Fría · Independencias · Derechos civiles", color: "#080820",
    icons: ["🚀", "✊", "🌐"] },
  { from: 1991, to: 2000, label: "Era digital", sub: "Internet · Globalización · Fin de la Guerra Fría", color: "#081a10",
    icons: ["💻", "📱", "🌱"] },
]

const MIN_YEAR = -10000
const MAX_YEAR = 2000

function yearToPercent(y) {
  return ((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100
}

function getEra(from, to) {
  const mid = (from + to) / 2
  return ERAS.find(e => mid >= e.from && mid < e.to) || ERAS[ERAS.length - 1]
}

function formatYear(y) {
  return y < 0 ? `${Math.abs(y)} a.C.` : `${y}`
}

// Colores del tema histórico
const THEME = {
  bg: '#f5ead6',
  panel: 'rgba(245,234,210,0.97)',
  border: 'rgba(160,120,60,0.25)',
  accent: '#8b5e1a',
  accentDim: 'rgba(139,94,26,0.4)',
  text: '#2c1f0a',
  textDim: 'rgba(44,31,10,0.55)',
  textFaint: 'rgba(44,31,10,0.3)',
}

export default function Home() {
  const globeEl  = useRef(null)
  const worldRef = useRef(null)
  const eraBarRef = useRef(null)

  const [yearFrom,  setYearFrom]  = useState(-500)
  const [yearTo,    setYearTo]    = useState(1800)
  const [filter,    setFilter]    = useState('all')
  const [panel,     setPanel]     = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [leftOpen,  setLeftOpen]  = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [rotating,  setRotating]  = useState(false)

  const era = getEra(yearFrom, yearTo)

  const visibleEvents = EVENTS.filter(e => {
    const inTime = e.year >= yearFrom && e.year <= yearTo
    const inCat  = filter === 'all' || e.cat === filter
    return inTime && inCat
  })

  async function handlePointClick(event) {
    event.stopPropagation?.()
    setPanel({ name: event.name, region: event.region, year: event.year, cat: event.cat, parsed: null })
    setRightOpen(true)
    setLoading(true)
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: event.name, year: event.year, region: event.region, cat: event.cat })
      })
      const data = await res.json()
      setPanel(p => ({ ...p, parsed: data.parsed, text: data.text }))
    } catch {
      setPanel(p => ({ ...p, text: 'No se pudo cargar la información.' }))
    }
    setLoading(false)
  }

async function handleEraClick(selectedEra) {
    setPanel({ 
      name: selectedEra.label, 
      region: 'Mundo', 
      year: selectedEra.from,
      cat: 'era',
      isEra: true,
      eraData: selectedEra,
      text: null,
      parsed: null
    })
    setRightOpen(true)
    setLoading(true)
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: selectedEra.label,
          year: selectedEra.from,
          region: 'Global',
          cat: 'era',
          isEra: true,
          eraFrom: selectedEra.from,
          eraTo: selectedEra.to,
          eraSub: selectedEra.sub
        })
      })
      const data = await res.json()
      setPanel(p => ({ ...p, parsed: data.parsed, text: data.text }))
    } catch {
      setPanel(p => ({ ...p, text: 'No se pudo generar la información.' }))
    }
    setLoading(false)
  }

  function makeDraggable(side) {
    return function(e) {
      e.preventDefault()
      e.stopPropagation()
      const track = e.currentTarget.parentElement
      const move = ev => {
        const rect = track.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
        const y = Math.round(MIN_YEAR + pct * (MAX_YEAR - MIN_YEAR))
        if (side === 'left'  && y < yearTo)   setYearFrom(y)
        if (side === 'right' && y > yearFrom) setYearTo(y)
      }
      const up = () => {
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', up)
      }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
    }
  }

  function handleTrackClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    const y    = Math.round(MIN_YEAR + pct * (MAX_YEAR - MIN_YEAR))
    const mid  = (yearFrom + yearTo) / 2
    if (y < mid) setYearFrom(Math.min(y, yearTo - 1))
    else setYearTo(Math.max(y, yearFrom + 1))
  }

  useEffect(() => {
    import('globe.gl').then(({ default: Globe }) => {
      const world = Globe()(globeEl.current)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg')
        .backgroundImageUrl(null)
        .backgroundColor('rgba(0,0,0,0)')
        .width(globeEl.current.offsetWidth)
        .height(globeEl.current.offsetHeight)
        .pointsData(visibleEvents)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor(e => CAT_COLORS[e.cat] || '#c8a45a')
        .pointRadius(0.5)
        .pointAltitude(0.01)
        .pointLabel(e => `
          <div style="background:rgba(20,14,4,0.95);color:#e8d9b8;padding:8px 12px;border-radius:6px;font-size:13px;border:1px solid rgba(200,164,90,0.4)">
            <span style="font-size:16px">${CAT_ICONS[e.cat] || '📍'}</span>&nbsp;${e.name}
            <br/><span style="opacity:0.5;font-size:11px">${formatYear(e.year)} · ${e.region}</span>
          </div>`)
        .onPointClick(e => handlePointClick(e))

      world.controls().autoRotate = false
      world.controls().autoRotateSpeed = 0.4

      // Click en el globo: toggle rotación
      globeEl.current.addEventListener('click', () => {
        setRotating(r => {
          const next = !r
          world.controls().autoRotate = false
          return next
        })
      })

      worldRef.current = world

      const ro = new ResizeObserver(() => {
        if (globeEl.current) {
          world.width(globeEl.current.offsetWidth)
          world.height(globeEl.current.offsetHeight)
        }
      })
      ro.observe(globeEl.current)
      return () => ro.disconnect()
    })
  }, [])

  useEffect(() => {
    if (worldRef.current) worldRef.current.pointsData(visibleEvents)
  }, [yearFrom, yearTo, filter])

  const leftPct  = yearToPercent(yearFrom)
  const rightPct = yearToPercent(yearTo)
  const categories = ['all','filosofia','derecho','ciencia','politica','arte','economia']

  const PANEL_W = 300

  return (
    <div style={{ width: '100vw', height: '100vh', background: era.color, transition: 'background 1.5s ease', display: 'flex', overflow: 'hidden', fontFamily: 'Georgia, serif' }}>

      {/* Iconos de era en fondo */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {era.icons.map((icon, i) => (
          <div key={`${era.label}-${i}`} style={{
            position: 'absolute',
            fontSize: [140, 100, 80][i],
            opacity: 0.18,
            top: ['12%', '52%', '25%'][i],
            left: ['18%', '62%', '78%'][i],
            transition: 'all 1.8s ease',
            userSelect: 'none',
            filter: 'sepia(100%) brightness(0.6)'
          }}>{icon}</div>
        ))}
      </div>

      {/* Panel izquierdo */}
      <div style={{
        width: leftOpen ? PANEL_W : 0,
        minWidth: leftOpen ? PANEL_W : 0,
        transition: 'width 0.3s ease, min-width 0.3s ease',
        overflow: 'hidden',
        background: THEME.panel,
        borderRight: `1px solid ${THEME.border}`,
        zIndex: 10,
        display: 'flex', flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{ width: PANEL_W, padding: '20px 16px', overflowY: 'auto', flex: 1 }}>

          {/* Logo */}
          <div style={{ fontSize: 18, fontWeight: 700, color: THEME.accent, letterSpacing: 2, marginBottom: 2 }}>
            CHRONOGLOBE
          </div>
          <div style={{ fontSize: 11, color: THEME.textFaint, marginBottom: 20, letterSpacing: 2 }}>
            ATLAS HISTÓRICO INTERACTIVO
          </div>

          {/* Era actual */}
          <div style={{
            background: 'rgba(200,164,90,0.06)',
            borderRadius: 8, padding: 12, marginBottom: 16,
            borderLeft: `2px solid ${THEME.accentDim}`
          }}>
            <div style={{ fontSize: 12, color: THEME.textFaint, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              Período seleccionado
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: THEME.accent, marginBottom: 4 }}>
              {era.label}
            </div>
            <div style={{ fontSize: 12, color: THEME.textDim, marginBottom: 8 }}>
              {formatYear(yearFrom)} — {formatYear(yearTo)}
            </div>
            <div style={{ fontSize: 14, color: THEME.text, lineHeight: 1.65 }}>
              {era.summary}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              {era.icons.map((icon, i) => (
                <span key={i} style={{ fontSize: 20 }}>{icon}</span>
              ))}
            </div>
          </div>

      {/* Leyenda */}
          <div style={{ fontSize: 11, color: THEME.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8 }}>
            Categorías
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {Object.entries(CAT_COLORS).map(([cat, color]) => (
              <button key={cat}
                onClick={() => setFilter(filter === cat ? 'all' : cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 8,
                  border: `1px solid ${filter === cat ? color : THEME.border}`,
                  background: filter === cat ? `${color}22` : 'transparent',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'all 0.15s', fontFamily: 'sans-serif'
                }}>
                <span style={{ fontSize: 14 }}>{CAT_ICONS[cat]}</span>
                <span style={{ fontSize: 12, color: filter === cat ? color : THEME.textDim, textTransform: 'capitalize', fontWeight: filter === cat ? 600 : 400 }}>{cat}</span>
              </button>
            ))}
          </div>

<div style={{ marginBottom: 16 }} />
          {/* Cómo usar */}
          <div style={{ fontSize: 12, color: THEME.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Cómo explorar
          </div>
          {[
            { icon: '🖱️', text: 'Arrastrá el globo para rotarlo' },
            { icon: '🔍', text: 'Rueda del mouse para zoom' },
            { icon: '📍', text: 'Tocá un punto para ver el contexto histórico' },
            { icon: '⏸️', text: 'Click en el globo pausa/reanuda la rotación' },
            { icon: '📅', text: 'Arrastrá el slider o escribí los años' },
            { icon: '⏳', text: 'Click en una era para saltar a ese período' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: THEME.textDim, lineHeight: 1.5, fontFamily: 'sans-serif' }}>{item.text}</span>
            </div>
          ))}

          {/* Estado rotación */}
          <div style={{ marginTop: 20, fontSize: 11, color: THEME.textFaint, fontFamily: 'sans-serif' }}>
            {rotating ? '⟳ Rotando — click para pausar' : '⏸ Pausado — click para reanudar'}
          </div>
        </div>
      </div>

      {/* Toggle izquierdo */}
      <button onClick={() => setLeftOpen(o => !o)} style={{
        position: 'absolute', left: leftOpen ? PANEL_W : 0,
        top: '50%', transform: 'translateY(-50%)',
        transition: 'left 0.3s ease',
        zIndex: 11,
        background: THEME.panel,
        border: `1px solid ${THEME.border}`,
        color: THEME.accent,
        width: 18, height: 44,
        borderRadius: '0 6px 6px 0',
        cursor: 'pointer', fontSize: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {leftOpen ? '‹' : '›'}
      </button>

      {/* Centro: globo + timeline abajo */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, overflow: 'hidden' }}>

        {/* Globo */}
        <div ref={globeEl} style={{ flex: 1, width: '100%', minHeight: 0 }} />

        {/* Watermark era */}
        <div style={{
          position: 'absolute', bottom: 120, left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none', textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'rgba(200,164,90,0.08)', letterSpacing: 4, textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: 'Georgia, serif' }}>
            {era.label}
          </div>
        </div>

        {/* Timeline abajo */}
        <div style={{
          background: THEME.panel,
          borderTop: `1px solid ${THEME.border}`,
          padding: '4px 12px 6px',
          zIndex: 5
        }}>
          {/* Eras clickeables */}
          <div 
            style={{ 
              display: 'flex', 
              gap: 0,
              overflowX: 'auto', 
              marginBottom: 6,
              scrollbarWidth: 'none',
              cursor: 'grab',
              userSelect: 'none'
            }}
            ref={eraBarRef}
            onMouseDown={e => {
              const el = eraBarRef.current
              el.style.cursor = 'grabbing'
              const startX = e.pageX - el.offsetLeft
              const scrollLeft = el.scrollLeft
              const onMove = ev => { el.scrollLeft = scrollLeft - (ev.pageX - el.offsetLeft - startX) }
              const onUp = () => {
                el.style.cursor = 'grab'
                window.removeEventListener('mousemove', onMove)
                window.removeEventListener('mouseup', onUp)
              }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}
          >
            {ERAS.map((e, i) => {
              const active = yearFrom === e.from && yearTo === e.to
              const inRange = yearFrom <= e.to && yearTo >= e.from
              const isLast = i === ERAS.length - 1
              return (
                <button key={e.from}
                  onClick={() => { setYearFrom(e.from); setYearTo(e.to); handleEraClick(e) }}
                  style={{
                    fontSize: 11, padding: '4px 12px',
                    border: 'none',
                    borderRight: isLast ? 'none' : `1px solid ${THEME.border}`,
                    background: active ? 'rgba(139,94,26,0.25)' : inRange ? 'rgba(139,94,26,0.08)' : 'transparent',
                    color: active ? THEME.accent : inRange ? THEME.text : THEME.textFaint,
                    cursor: 'pointer', fontFamily: 'Georgia, serif',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    position: 'relative',
                    flexShrink: 0
                  }}>
                  {e.label}
                  {i < ERAS.length - 1 && (
                    <span style={{
                      position: 'absolute', right: -8, top: '50%',
                      transform: 'translateY(-50%)',
                      color: THEME.textFaint, fontSize: 10, zIndex: 1,
                      pointerEvents: 'none'
                    }}>›</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Slider dual */}
          <div style={{ position: 'relative', height: 6, borderRadius: 3, background: 'rgba(200,164,90,0.15)', cursor: 'pointer', marginBottom: 3 }}
            onClick={handleTrackClick}>
            <div style={{
              position: 'absolute', top: 0, height: '100%', borderRadius: 3,
              background: THEME.accentDim,
              left: `${leftPct}%`, width: `${rightPct - leftPct}%`
            }} />
            {/* Thumb izquierdo */}
            <div style={{
              position: 'absolute', top: '50%', left: `${leftPct}%`,
              transform: 'translate(-50%, -50%)',
              width: 16, height: 16, borderRadius: '50%',
              background: THEME.accent, cursor: 'ew-resize', zIndex: 2,
              boxShadow: '0 0 0 3px rgba(200,164,90,0.2)'
            }} onMouseDown={makeDraggable('left')} />
            {/* Thumb derecho */}
            <div style={{
              position: 'absolute', top: '50%', left: `${rightPct}%`,
              transform: 'translate(-50%, -50%)',
              width: 16, height: 16, borderRadius: '50%',
              background: THEME.accent, cursor: 'ew-resize', zIndex: 2,
              boxShadow: '0 0 0 3px rgba(200,164,90,0.2)'
            }} onMouseDown={makeDraggable('right')} />
          </div>

          {/* Año inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" value={yearFrom}
              onChange={e => { const v = Number(e.target.value); if (v >= MIN_YEAR && v < yearTo) setYearFrom(v) }}
              style={{ width: 76, padding: '3px 6px', borderRadius: 6, border: `1px solid ${THEME.border}`, background: 'rgba(200,164,90,0.08)', color: THEME.text, fontSize: 12, textAlign: 'center', fontFamily: 'Georgia, serif' }}
            />
            <span style={{ color: THEME.textFaint, fontSize: 11 }}>—</span>
            <input type="number" value={yearTo}
              onChange={e => { const v = Number(e.target.value); if (v <= MAX_YEAR && v > yearFrom) setYearTo(v) }}
              style={{ width: 76, padding: '3px 6px', borderRadius: 6, border: `1px solid ${THEME.border}`, background: 'rgba(200,164,90,0.08)', color: THEME.text, fontSize: 12, textAlign: 'center', fontFamily: 'Georgia, serif' }}
            />
            <span style={{ fontSize: 11, color: THEME.accent, marginLeft: 4, fontStyle: 'italic' }}>{era.label}</span>
            <button onClick={() => {
              const next = !rotating
              setRotating(next)
              if (worldRef.current) worldRef.current.controls().autoRotate = next
            }} style={{
              marginLeft: 8,
              fontSize: 11, padding: '3px 10px', borderRadius: 20,
              border: `1px solid ${THEME.border}`,
              background: rotating ? 'rgba(139,94,26,0.15)' : 'transparent',
              color: rotating ? THEME.accent : THEME.textDim,
              cursor: 'pointer', fontFamily: 'sans-serif'
            }}>
              {rotating ? '⏸ Pausar' : '▶ Girar'}
            </button>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
              {['all','filosofia','derecho','ciencia','politica','arte','economia'].map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} style={{
                  fontSize: 12, padding: '3px 9px', borderRadius: 20,
                  border: `1px solid ${filter === cat ? THEME.accent : THEME.border}`,
                  background: filter === cat ? 'rgba(200,164,90,0.2)' : 'transparent',
                  color: filter === cat ? THEME.accent : THEME.textDim,
                  cursor: 'pointer', fontFamily: 'sans-serif'
                }}>
                  {cat === 'all' ? 'Todo' : CAT_ICONS[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho + toggle */}
      <div style={{ display: 'flex', flexShrink: 0, zIndex: 10 }}>
        {/* Toggle derecho */}
        <button onClick={() => setRightOpen(o => !o)} style={{
          alignSelf: 'center',
          background: THEME.panel,
          border: `1px solid ${THEME.border}`,
          borderRight: 'none',
          color: THEME.accent,
          width: 18, height: 44,
          borderRadius: '6px 0 0 6px',
          cursor: 'pointer', fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          {rightOpen ? '›' : '‹'}
        </button>

        {/* Panel derecho */}
        <div style={{
          width: rightOpen ? PANEL_W : 0,
          minWidth: rightOpen ? PANEL_W : 0,
          transition: 'width 0.3s ease, min-width 0.3s ease',
          overflow: 'hidden',
          background: THEME.panel,
          borderLeft: `1px solid ${THEME.border}`,
          flexShrink: 0
        }}>
          {!panel && (
            <div style={{ width: PANEL_W, padding: '20px 16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>📍</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: THEME.accent, marginBottom: 8 }}>
                Explorá el mundo
              </div>
              <div style={{ fontSize: 12, color: THEME.textDim, lineHeight: 1.7, fontFamily: 'sans-serif' }}>
                Tocá cualquier punto del globo para ver qué estaba pasando en ese lugar y momento histórico.
              </div>
            </div>
          )}
          {panel && (
            <div style={{ width: PANEL_W, padding: '20px 16px', overflowY: 'auto', height: '100%' }}>
              <button onClick={() => { setPanel(null); setRightOpen(true) }} style={{
                float: 'right', background: 'none', border: 'none',
                color: THEME.textDim, fontSize: 18, cursor: 'pointer'
              }}>×</button>

              <div style={{ fontSize: 10, color: THEME.textFaint, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'sans-serif' }}>
                {panel.region}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: THEME.accent, marginBottom: 4 }}>
              {panel.isEra ? '⏳' : CAT_ICONS[panel.cat]} {panel.name}
            </div>
            {panel.isEra && panel.eraData && (
              <div style={{ fontSize: 11, color: THEME.textDim, marginBottom: 4, fontFamily: 'sans-serif', fontStyle: 'italic' }}>
                {panel.eraData.sub}
              </div>
            )}
              <div style={{ fontSize: 11, color: THEME.textDim, marginBottom: 16, fontFamily: 'sans-serif' }}>
                {formatYear(panel.year)}
              </div>

              {loading && (
                <div style={{ fontSize: 12, color: THEME.textDim, fontStyle: 'italic', fontFamily: 'sans-serif' }}>
                  Consultando fuentes históricas...
                </div>
              )}

              {panel.parsed && (
                <div style={{ fontFamily: 'sans-serif' }}>
                  <div style={{
                    background: 'rgba(139,94,26,0.08)',
                    borderRadius: 8, padding: '10px 12px', marginBottom: 16,
                    borderLeft: `2px solid ${THEME.accentDim}`
                  }}>
                    <div style={{ fontSize: 10, color: THEME.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                      {panel.isEra ? 'Transformación global' : 'En este lugar'}
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: THEME.text, margin: 0 }}>
                      {panel.parsed.local}
                    </p>
                  </div>

                  <div style={{ fontSize: 10, color: THEME.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    Mientras tanto en el mundo
                  </div>
                  {panel.parsed.regiones.map((r, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: THEME.accent, marginBottom: 3 }}>
                        {r.emoji} {r.nombre}
                      </div>
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: THEME.textDim, margin: 0 }}>
                        {r.texto}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {!panel.parsed && panel.text && (
                <p style={{ fontSize: 13, lineHeight: 1.8, color: THEME.text, fontFamily: 'sans-serif' }}>
                  {panel.text}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}