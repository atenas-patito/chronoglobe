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
  economia:  '💰'
}

const ERAS = [
  { from: -10000, to: -3500, label: "Revolución del Neolítico", sub: "Agricultura · Aldeas · Domesticación", icons: ["🌾", "🐄", "🏕️"] },
  { from: -3500,  to: -1200, label: "Primeras civilizaciones",  sub: "Escritura · Ciudades · Estados",       icons: ["🏺", "📜", "🏛️"] },
  { from: -1200,  to: -200,  label: "Edad Axial",               sub: "Buda · Confucio · Sócrates · Zoroastro", icons: ["☯️", "🕊️", "📖"] },
  { from: -200,   to: 600,   label: "Imperios clásicos",        sub: "Roma · Han · Parta · Maurya",           icons: ["🏟️", "⚔️", "🛣️"] },
  { from: 600,    to: 1000,  label: "Expansión religiosa",      sub: "Islam · Budismo · Cristianismo",        icons: ["🕌", "☸️", "✝️"] },
  { from: 1000,   to: 1400,  label: "Mundo pre-moderno",        sub: "Ruta de la Seda · Mongoles",            icons: ["🗺️", "🐪", "⚖️"] },
  { from: 1400,   to: 1700,  label: "Conexión global",          sub: "Imprenta · América · Reforma",          icons: ["⛵", "🖨️", "🌎"] },
  { from: 1700,   to: 1800,  label: "Era de la razón",          sub: "Ilustración · Revolución científica",   icons: ["💡", "📚", "⚖️"] },
  { from: 1800,   to: 1914,  label: "Era industrial",           sub: "Vapor · Capitalismo · Imperialismo",    icons: ["⚙️", "🚂", "🌍"] },
  { from: 1914,   to: 1945,  label: "Crisis globales",          sub: "Guerras mundiales · Fascismo",          icons: ["✈️", "☢️", "🕊️"] },
  { from: 1945,   to: 1991,  label: "Descolonización",          sub: "Guerra Fría · Independencias",          icons: ["🚀", "✊", "🌐"] },
  { from: 1991,   to: 2000,  label: "Era digital",              sub: "Internet · Globalización",              icons: ["💻", "📱", "🌱"] },
]

const MIN_YEAR = -10000
const MAX_YEAR = 2000
const PANEL_W  = 300

const T = {
  bg:        '#f2f2f2',
  panel:     '#ffffff',
  panelAlt:  '#f8f8f8',
  border:    'rgba(0,0,0,0.07)',
  borderMed: 'rgba(0,0,0,0.12)',
  accent:    '#111111',
  accentSub: 'rgba(17,17,17,0.45)',
  accentFaint:'rgba(17,17,17,0.22)',
  shadow:    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd:  '0 4px 12px rgba(0,0,0,0.08)',
}

function yearToPercent(y) {
  return ((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100
}

function formatYear(y) {
  return y < 0 ? `${Math.abs(y).toLocaleString()} a.C.` : `${y}`
}

function getEra(from, to) {
  const mid = (from + to) / 2
  const found = ERAS.find(e => mid >= e.from && mid < e.to)
  if (found) return found
  const spanning = ERAS.filter(e => from <= e.to && to >= e.from)
  if (spanning.length > 1) return {
    ...spanning[Math.floor(spanning.length / 2)],
    label: 'Múltiples eras',
    sub: `${formatYear(from)} — ${formatYear(to)}`,
    icons: ['🌍', '⏳', '🗺️']
  }
  return ERAS[ERAS.length - 1]
}

export default function Home() {
  const globeEl   = useRef(null)
  const worldRef  = useRef(null)
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

  const visibleEvents = EVENTS.filter(e =>
    e.year >= yearFrom && e.year <= yearTo &&
    (filter === 'all' || e.cat === filter)
  )

  async function fetchExplain(body) {
    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return res.json()
  }

  async function handlePointClick(event) {
    event.stopPropagation?.()
    setPanel({ name: event.name, region: event.region, year: event.year, cat: event.cat, parsed: null, isEra: false })
    setRightOpen(true)
    setLoading(true)
    try {
      const data = await fetchExplain({ name: event.name, year: event.year, region: event.region, cat: event.cat })
      setPanel(p => ({ ...p, parsed: data.parsed, text: data.text }))
    } catch {
      setPanel(p => ({ ...p, text: 'No se pudo cargar la información.' }))
    }
    setLoading(false)
  }

  async function handleEraClick(selectedEra) {
    setPanel({ name: selectedEra.label, region: 'Mundo', year: selectedEra.from, cat: 'era', isEra: true, eraData: selectedEra, parsed: null })
    setRightOpen(true)
    setLoading(true)
    try {
      const data = await fetchExplain({ name: selectedEra.label, year: selectedEra.from, region: 'Global', cat: 'era', isEra: true, eraFrom: selectedEra.from, eraTo: selectedEra.to, eraSub: selectedEra.sub })
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
      const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
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
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .backgroundImageUrl(null)
        .backgroundColor('rgba(0,0,0,0)')
        .width(globeEl.current.offsetWidth)
        .height(globeEl.current.offsetHeight)
        .pointsData(visibleEvents)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor(e => CAT_COLORS[e.cat] || '#888')
        .pointRadius(0.5)
        .pointAltitude(0.01)
        .pointLabel(e => `
          <div style="background:#111;color:#fff;padding:8px 12px;border-radius:8px;font-size:12px;font-family:sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.3)">
            <div style="font-weight:600;margin-bottom:2px">${e.name}</div>
            <div style="opacity:0.5;font-size:11px">${formatYear(e.year)} · ${e.region}</div>
          </div>`)
        .onPointClick(e => handlePointClick(e))

      world.controls().autoRotate = false
      world.controls().autoRotateSpeed = 0.4
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

  // Sección label reutilizable
  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: T.accentFaint, marginBottom: 8 }}>
      {children}
    </div>
  )

  return (
    <div style={{ width: '100vw', height: '100vh', background: T.bg, display: 'flex', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* Iconos de era flotantes */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {era.icons.map((icon, i) => (
          <div key={`${era.label}-${i}`} style={{
            position: 'absolute',
            fontSize: [160, 110, 85][i],
            opacity: 0.05,
            top: ['10%', '50%', '22%'][i],
            left: ['15%', '60%', '77%'][i],
            transition: 'all 2s ease',
            userSelect: 'none',
            filter: 'grayscale(100%)'
          }}>{icon}</div>
        ))}
      </div>

      {/* ── PANEL IZQUIERDO ── */}
      <div style={{
        width: leftOpen ? PANEL_W : 0,
        minWidth: leftOpen ? PANEL_W : 0,
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden', flexShrink: 0, zIndex: 10,
        background: T.panel,
        borderRight: `1px solid ${T.border}`,
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ width: PANEL_W, padding: '20px 16px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Logo */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, letterSpacing: -0.5 }}>Chronoglobe</div>
            <div style={{ fontSize: 10, color: T.accentFaint, marginTop: 2, letterSpacing: 0.3 }}>Atlas histórico interactivo</div>
          </div>

          {/* Era seleccionada */}
          <div style={{ background: T.panelAlt, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
            <SectionLabel>Período seleccionado</SectionLabel>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, letterSpacing: -0.3, marginBottom: 2 }}>{era.label}</div>
            <div style={{ fontSize: 11, color: T.accentSub, marginBottom: 8 }}>{formatYear(yearFrom)} — {formatYear(yearTo)}</div>
            <div style={{ fontSize: 12, color: T.accentSub, lineHeight: 1.6 }}>{era.sub}</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              {era.icons.map((icon, i) => <span key={i} style={{ fontSize: 18 }}>{icon}</span>)}
            </div>
          </div>

          {/* Categorías */}
          <div>
            <SectionLabel>Categorías</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {Object.entries(CAT_COLORS).map(([cat, color]) => (
                <button key={cat}
                  onClick={() => setFilter(filter === cat ? 'all' : cat)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 10px', borderRadius: 8,
                    border: `1px solid ${filter === cat ? T.accent : T.border}`,
                    background: filter === cat ? T.accent : T.panel,
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'all 0.15s', fontFamily: 'inherit'
                  }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: filter === cat ? '#fff' : color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12 }}>{CAT_ICONS[cat]}</span>
                  <span style={{ fontSize: 12, color: filter === cat ? '#fff' : T.accentSub, textTransform: 'capitalize', fontWeight: filter === cat ? 600 : 400 }}>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cómo explorar */}
          <div>
            <SectionLabel>Cómo explorar</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '⏳', text: 'Hacé click en una era de la barra inferior para ver qué pasaba en el mundo en ese período.' },
                { icon: '📍', text: 'Tocá un punto del globo para ver el contexto histórico de ese lugar.' },
                { icon: '🌍', text: 'Cada era muestra eventos en todos los continentes, no solo Europa.' },
                { icon: '🏷️', text: 'Filtrá por categoría con los botones de arriba.' },
                { icon: '🖱️', text: 'Arrastrá el globo para rotarlo. Rueda del mouse para zoom.' },
                { icon: '📅', text: 'Ajustá el rango con el slider o escribiendo los años directamente.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <span style={{ fontSize: 11, color: T.accentSub, lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Toggle izquierdo */}
      <button onClick={() => setLeftOpen(o => !o)} style={{
        position: 'absolute', left: leftOpen ? PANEL_W : 0,
        top: '50%', transform: 'translateY(-50%)',
        transition: 'left 0.25s ease', zIndex: 11,
        background: T.panel, border: `1px solid ${T.border}`,
        boxShadow: T.shadow, color: T.accentSub,
        width: 20, height: 40, borderRadius: '0 8px 8px 0',
        cursor: 'pointer', fontSize: 11,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {leftOpen ? '‹' : '›'}
      </button>

      {/* ── CENTRO ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, overflow: 'hidden' }}>

        {/* Globo */}
        <div ref={globeEl} style={{ flex: 1, width: '100%', minHeight: 0 }} />

        {/* Watermark */}
        <div style={{ position: 'absolute', bottom: 110, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'rgba(0,0,0,0.04)', letterSpacing: 4, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {era.label}
          </div>
        </div>

        {/* ── TIMELINE ── */}
        <div style={{ background: T.panel, borderTop: `1px solid ${T.border}`, boxShadow: '0 -2px 8px rgba(0,0,0,0.04)', padding: '8px 16px 10px', zIndex: 5 }}>

          {/* Barra de eras con scroll drag */}
          <div
            ref={eraBarRef}
            style={{ display: 'flex', gap: 0, overflowX: 'auto', marginBottom: 8, scrollbarWidth: 'none', cursor: 'grab', userSelect: 'none' }}
            onMouseDown={e => {
              const el = eraBarRef.current
              el.style.cursor = 'grabbing'
              const startX = e.pageX - el.offsetLeft
              const scrollLeft = el.scrollLeft
              const onMove = ev => { el.scrollLeft = scrollLeft - (ev.pageX - el.offsetLeft - startX) }
              const onUp = () => { el.style.cursor = 'grab'; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}
          >
            {ERAS.map((e, i) => {
              const active   = yearFrom === e.from && yearTo === e.to
              const inRange  = yearFrom <= e.to && yearTo >= e.from
              const isLast   = i === ERAS.length - 1
              return (
                <button key={e.from}
                  onClick={() => { setYearFrom(e.from); setYearTo(e.to); handleEraClick(e) }}
                  style={{
                    fontSize: 11, padding: '5px 14px',
                    border: 'none',
                    borderRight: isLast ? 'none' : `1px solid ${T.border}`,
                    background: active ? T.accent : 'transparent',
                    color: active ? '#fff' : inRange ? T.accent : T.accentFaint,
                    cursor: 'pointer', fontFamily: 'inherit',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    fontWeight: active ? 600 : 400,
                    transition: 'all 0.15s',
                    position: 'relative'
                  }}>
                  {e.label}
                  {!isLast && (
                    <span style={{ position: 'absolute', right: -7, top: '50%', transform: 'translateY(-50%)', color: T.accentFaint, fontSize: 9, pointerEvents: 'none' }}>›</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Slider dual */}
          <div style={{ position: 'relative', height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.07)', cursor: 'pointer', marginBottom: 8 }}
            onClick={handleTrackClick}>
            <div style={{ position: 'absolute', top: 0, height: '100%', borderRadius: 2, background: T.accent, opacity: 0.3, left: `${leftPct}%`, width: `${rightPct - leftPct}%` }} />
            <div style={{ position: 'absolute', top: '50%', left: `${leftPct}%`, transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: T.accent, cursor: 'ew-resize', zIndex: 2, boxShadow: T.shadow }} onMouseDown={makeDraggable('left')} />
            <div style={{ position: 'absolute', top: '50%', left: `${rightPct}%`, transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: T.accent, cursor: 'ew-resize', zIndex: 2, boxShadow: T.shadow }} onMouseDown={makeDraggable('right')} />
          </div>

          {/* Controles de año */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" value={yearFrom}
              onChange={e => { const v = Number(e.target.value); if (v >= MIN_YEAR && v < yearTo) setYearFrom(v) }}
              style={{ width: 80, padding: '3px 8px', borderRadius: 6, border: `1px solid ${T.border}`, background: T.panelAlt, color: T.accent, fontSize: 12, textAlign: 'center', fontFamily: 'inherit', boxShadow: T.shadow }} />
            <span style={{ color: T.accentFaint, fontSize: 11 }}>—</span>
            <input type="number" value={yearTo}
              onChange={e => { const v = Number(e.target.value); if (v <= MAX_YEAR && v > yearFrom) setYearTo(v) }}
              style={{ width: 80, padding: '3px 8px', borderRadius: 6, border: `1px solid ${T.border}`, background: T.panelAlt, color: T.accent, fontSize: 12, textAlign: 'center', fontFamily: 'inherit', boxShadow: T.shadow }} />

            <span style={{ fontSize: 11, color: T.accentSub, marginLeft: 4 }}>{era.label}</span>

            <button onClick={() => { const next = !rotating; setRotating(next); if (worldRef.current) worldRef.current.controls().autoRotate = next }}
              style={{ marginLeft: 4, fontSize: 11, padding: '3px 10px', borderRadius: 20, border: `1px solid ${T.border}`, background: rotating ? T.accent : T.panelAlt, color: rotating ? '#fff' : T.accentSub, cursor: 'pointer', fontFamily: 'inherit', boxShadow: T.shadow }}>
              {rotating ? '⏸ Pausar' : '▶ Girar'}
            </button>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
              {['all', ...Object.keys(CAT_COLORS)].map(cat => (
                <button key={cat} onClick={() => setFilter(cat)}
                  style={{ fontSize: cat === 'all' ? 11 : 13, padding: cat === 'all' ? '3px 8px' : '2px 6px', borderRadius: 6, border: `1px solid ${filter === cat ? T.accent : T.border}`, background: filter === cat ? T.accent : T.panelAlt, color: filter === cat ? '#fff' : T.accentSub, cursor: 'pointer', fontFamily: 'inherit', boxShadow: T.shadow, title: cat }}>
                  {cat === 'all' ? 'Todo' : CAT_ICONS[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO + TOGGLE ── */}
      <div style={{ display: 'flex', flexShrink: 0, zIndex: 10 }}>
        <button onClick={() => setRightOpen(o => !o)} style={{
          alignSelf: 'center', background: T.panel,
          border: `1px solid ${T.border}`, boxShadow: T.shadow,
          color: T.accentSub, width: 20, height: 40,
          borderRadius: '8px 0 0 8px', cursor: 'pointer', fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {rightOpen ? '›' : '‹'}
        </button>

        <div style={{ width: rightOpen ? PANEL_W : 0, minWidth: rightOpen ? PANEL_W : 0, transition: 'width 0.25s ease, min-width 0.25s ease', overflow: 'hidden', background: T.panel, borderLeft: `1px solid ${T.border}`, boxShadow: '-2px 0 8px rgba(0,0,0,0.04)', flexShrink: 0 }}>

          {/* Estado vacío */}
          {!panel && (
            <div style={{ width: PANEL_W, padding: '40px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 16, opacity: 0.3 }}>🌍</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.accent, marginBottom: 8 }}>Explorá el mundo</div>
              <div style={{ fontSize: 12, color: T.accentSub, lineHeight: 1.7 }}>
                Tocá un punto del globo o hacé click en una era para ver qué estaba pasando en ese momento histórico.
              </div>
            </div>
          )}

          {/* Panel con info */}
          {panel && (
            <div style={{ width: PANEL_W, padding: '20px 16px', overflowY: 'auto', height: '100%' }}>
              <button onClick={() => setPanel(null)} style={{ float: 'right', background: 'none', border: 'none', color: T.accentFaint, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>

              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: T.accentFaint, marginBottom: 6 }}>{panel.region}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.accent, marginBottom: 2, letterSpacing: -0.3 }}>
                {panel.isEra ? '⏳' : CAT_ICONS[panel.cat]} {panel.name}
              </div>
              {panel.isEra && panel.eraData && (
                <div style={{ fontSize: 11, color: T.accentSub, marginBottom: 4, fontStyle: 'italic' }}>{panel.eraData.sub}</div>
              )}
              <div style={{ fontSize: 11, color: T.accentFaint, marginBottom: 20 }}>{formatYear(panel.year)}</div>

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.accentSub, fontSize: 12 }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  Consultando fuentes históricas...
                </div>
              )}

              {panel.parsed && panel.parsed.regiones && (
                <div>
                  <div style={{ background: T.panelAlt, borderRadius: 8, padding: '12px 14px', marginBottom: 16, border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: T.accentFaint, marginBottom: 6 }}>
                      {panel.isEra ? 'Transformación global' : 'En este lugar'}
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: T.accent, margin: 0 }}>{panel.parsed.local}</p>
                  </div>

                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: T.accentFaint, marginBottom: 12 }}>
                    Mientras tanto en el mundo
                  </div>
                  {panel.parsed.regiones.map((r, i) => (
                    <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < panel.parsed.regiones.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.accent, marginBottom: 4 }}>{r.emoji} {r.nombre}</div>
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: T.accentSub, margin: 0 }}>{r.texto}</p>
                    </div>
                  ))}
                </div>
              )}

              {!panel.parsed && panel.text && (
                <p style={{ fontSize: 13, lineHeight: 1.8, color: T.accentSub }}>{panel.text}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}