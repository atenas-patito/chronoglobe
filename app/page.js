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
  { from: -3000, to: -1200, label: "Edad de Bronce", color: "#2c1f0e",
    summary: "Las primeras ciudades y escrituras emergen en Mesopotamia, Egipto, el Valle del Indo y China. Se inventan el bronce, la rueda y el calendario.",
    icons: ["🏺", "📜", "🛞"] },
  { from: -1200, to: -500, label: "Edad de Hierro", color: "#2a1e0a",
    summary: "El hierro democratiza las armas. Los fenicios difunden el alfabeto. Surge la épica homérica. Asiria construye el primer gran imperio multicultural.",
    icons: ["⚔️", "🚢", "📖"] },
  { from: -500, to: -27, label: "Antigüedad clásica", color: "#1e1e2a",
    summary: "Atenas inventa la democracia y la filosofía occidental. Alejandro conecta Oriente y Occidente. En Asia, Buda y Confucio transforman el pensamiento.",
    icons: ["🏛️", "⚖️", "🎭"] },
  { from: -27, to: 476, label: "Imperio Romano", color: "#20132a",
    summary: "Roma unifica el mundo con carreteras, leyes y un idioma común. El cristianismo se expande desde Palestina. En China, la dinastía Han florece en paralelo.",
    icons: ["🏟️", "✝️", "🛣️"] },
  { from: 476, to: 1000, label: "Alta Edad Media", color: "#0e1f18",
    summary: "Roma cae y Europa se fragmenta. El Islam surge y llega desde España hasta India. Bagdad se convierte en el centro del saber mundial.",
    icons: ["🕌", "📿", "🌙"] },
  { from: 1000, to: 1300, label: "Baja Edad Media", color: "#1a1f0a",
    summary: "Las ciudades europeas renacen. Las Cruzadas conectan Oriente y Occidente. Las universidades nacen en Bolonia y París. El Imperio Mongol unifica Asia.",
    icons: ["🏰", "🎓", "🗺️"] },
  { from: 1300, to: 1500, label: "Renacimiento", color: "#2a1500",
    summary: "La Peste Negra sacude el orden medieval. El humanismo italiano redescubre la Antigüedad. Gutenberg inventa la imprenta. Los aztecas e incas alcanzan su apogeo.",
    icons: ["🖨️", "🎨", "🔭"] },
  { from: 1500, to: 1650, label: "Edad Moderna", color: "#2a0e00",
    summary: "Europa llega a América. Lutero desafía a la Iglesia. El Imperio Otomano domina desde Viena hasta Persia. China bajo los Ming es la mayor economía del planeta.",
    icons: ["⛵", "🌎", "📿"] },
  { from: 1650, to: 1750, label: "Absolutismo", color: "#0a1520",
    summary: "Newton describe las leyes del universo. Los reyes absolutos centralizan el poder. En Japón, el período Edo produce una cultura urbana sofisticada.",
    icons: ["👑", "🔬", "🌐"] },
  { from: 1750, to: 1800, label: "Ilustración", color: "#0e0e2a",
    summary: "La razón desafía la tradición. Voltaire, Rousseau y Montesquieu reinventan la política. América del Norte se independiza. La Revolución Francesa sacude el mundo.",
    icons: ["💡", "📚", "🗽"] },
  { from: 1800, to: 1850, label: "Revolución Industrial", color: "#141420",
    summary: "La máquina de vapor transforma la producción. Napoleón redibuja Europa. Nace el proletariado industrial. Latinoamérica se independiza en una generación.",
    icons: ["⚙️", "🚂", "🏭"] },
  { from: 1850, to: 1914, label: "Siglo XIX tardío", color: "#0a1f1f",
    summary: "Europa divide África. Darwin publica El origen de las especies. Marx diagnostica el capitalismo. El telégrafo y el ferrocarril achican el mundo.",
    icons: ["🧬", "🌍", "📡"] },
  { from: 1914, to: 1945, label: "Era de las guerras", color: "#20080a",
    summary: "Dos guerras mundiales matan a cien millones. El fascismo y el comunismo compiten. Einstein revoluciona la física. El Holocausto sacude la conciencia moral.",
    icons: ["✈️", "☢️", "🕊️"] },
  { from: 1945, to: 1991, label: "Guerra Fría", color: "#080820",
    summary: "EEUU y la URSS dividen el mundo. África y Asia se descolonizan. Martin Luther King transforma la democracia. El hombre llega a la Luna.",
    icons: ["🚀", "💻", "✊"] },
  { from: 1991, to: 2000, label: "Mundo contemporáneo", color: "#081a10",
    summary: "La URSS colapsa. Internet conecta a la humanidad. La globalización acelera el comercio. El cambio climático emerge como la gran amenaza del siglo.",
    icons: ["🌐", "📱", "🌱"] },
]

const MIN_YEAR = -3000
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

  const [yearFrom,  setYearFrom]  = useState(-500)
  const [yearTo,    setYearTo]    = useState(1800)
  const [filter,    setFilter]    = useState('all')
  const [panel,     setPanel]     = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [leftOpen,  setLeftOpen]  = useState(true)
  const [rightOpen, setRightOpen] = useState(false)
  const [rotating,  setRotating]  = useState(true)

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

      world.controls().autoRotate = true
      world.controls().autoRotateSpeed = 0.4

      // Click en el globo: toggle rotación
      globeEl.current.addEventListener('click', () => {
        setRotating(r => {
          const next = !r
          world.controls().autoRotate = next
          return next
        })
      })

      worldRef.current = world

      const handleResize = () => {
        if (globeEl.current) {
          world.width(globeEl.current.offsetWidth)
          world.height(globeEl.current.offsetHeight)
        }
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    })
  }, [])

  useEffect(() => {
    if (worldRef.current) worldRef.current.pointsData(visibleEvents)
  }, [yearFrom, yearTo, filter])

  const leftPct  = yearToPercent(yearFrom)
  const rightPct = yearToPercent(yearTo)
  const categories = ['all','filosofia','derecho','ciencia','politica','arte','economia']

  const PANEL_W = 320

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
          <div style={{ fontSize: 9, color: THEME.textFaint, marginBottom: 20, letterSpacing: 2 }}>
            ATLAS HISTÓRICO INTERACTIVO
          </div>

          {/* Era actual */}
          <div style={{
            background: 'rgba(200,164,90,0.06)',
            borderRadius: 8, padding: 12, marginBottom: 16,
            borderLeft: `2px solid ${THEME.accentDim}`
          }}>
            <div style={{ fontSize: 10, color: THEME.textFaint, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
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
          <div style={{ fontSize: 12, color: THEME.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8 }}>
            Categorías
          </div>
          {Object.entries(CAT_COLORS).map(([cat, color]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}
              onClick={() => setFilter(filter === cat ? 'all' : cat)}>
              <span style={{ fontSize: 13 }}>{CAT_ICONS[cat]}</span>
              <span style={{ fontSize: 12, color: filter === cat ? THEME.accent : THEME.textDim, fontFamily: 'sans-serif', textTransform: 'capitalize' }}>{cat}</span>
              {filter === cat && <span style={{ fontSize: 9, color: THEME.accentDim }}>✓</span>}
            </div>
          ))}

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
        cursor: 'pointer', fontSize: 10,
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
          <div style={{ display: 'flex', gap: 3, overflowX: 'auto', marginBottom: 4, paddingBottom: 4, scrollbarWidth: 'none' }}>
            {ERAS.map(e => {
              const active = yearFrom === e.from && yearTo === e.to
              const inRange = yearFrom <= e.to && yearTo >= e.from
              return (
                <button key={e.from}
                  onClick={() => { setYearFrom(e.from); setYearTo(e.to) }}
                  style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 20,
                    border: `1px solid ${active ? THEME.accent : THEME.border}`,
                    background: active ? 'rgba(200,164,90,0.2)' : inRange ? 'rgba(200,164,90,0.06)' : 'transparent',
                    color: active ? THEME.accent : inRange ? THEME.text : THEME.textFaint,
                    cursor: 'pointer', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}>
                  {e.label}
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

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
              {['all','filosofia','derecho','ciencia','politica','arte','economia'].map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} style={{
                  fontSize: 10, padding: '2px 7px', borderRadius: 20,
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

      {/* Toggle derecho */}
     <button onClick={() => setRightOpen(o => !o)} style={{
        alignSelf: 'center',
        background: THEME.panel,
        border: `1px solid ${THEME.border}`,
        borderRight: rightOpen ? 'none' : `1px solid ${THEME.border}`,
        color: THEME.accent,
        width: 18, height: 44,
        borderRadius: rightOpen ? '6px 0 0 6px' : '6px',
        cursor: 'pointer', fontSize: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, zIndex: 11
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
        zIndex: 10,
        flexShrink: 0
      }}>
         {panel && (
          <div style={{ width: PANEL_W, padding: '20px 16px', overflowY: 'auto', height: '100%' }}>
            <button onClick={() => { setPanel(null); setRightOpen(false) }} style={{
              float: 'right', background: 'none', border: 'none',
              color: THEME.textDim, fontSize: 18, cursor: 'pointer'
            }}>×</button>

            <div style={{ fontSize: 10, color: THEME.textFaint, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'sans-serif' }}>
              {panel.region}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: THEME.accent, marginBottom: 4 }}>
              {CAT_ICONS[panel.cat]} {panel.name}
            </div>
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
                {/* Texto local */}
                <div style={{
                  background: 'rgba(139,94,26,0.08)',
                  borderRadius: 8, padding: '10px 12px', marginBottom: 16,
                  borderLeft: `2px solid ${THEME.accentDim}`
                }}>
                  <div style={{ fontSize: 10, color: THEME.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                    En este lugar
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: THEME.text, margin: 0 }}>
                    {panel.parsed.local}
                  </p>
                </div>

                {/* Regiones */}
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
  )
}