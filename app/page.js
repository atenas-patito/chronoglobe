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
  { from: -3000, to: -1200, label: "Edad de Bronce", sub: "Primeras civilizaciones escritas", color: "#1a0e00",
    summary: "Las primeras ciudades y escrituras emergen en Mesopotamia, Egipto, el Valle del Indo y China. La humanidad pasa de aldeas a imperios. Se inventan el bronce, la rueda y el calendario.",
    icons: ["🏺", "📜", "⚱️"] },
  { from: -1200, to: -500, label: "Edad de Hierro", sub: "Grecia arcaica · Fenicios · Asiria", color: "#1a1500",
    summary: "El hierro democratiza las herramientas y las armas. Los fenicios difunden el alfabeto por el Mediterráneo. Surge la épica homérica. Asiria construye el primer gran imperio multicultural.",
    icons: ["⚔️", "🚢", "📖"] },
  { from: -500, to: -27, label: "Antigüedad clásica", sub: "Grecia · Persia · República romana", color: "#0a1020",
    summary: "Atenas inventa la democracia y la filosofía occidental. Alejandro Magno conecta Oriente y Occidente. Roma construye una república que domina el Mediterráneo. En Asia, Buda y Confucio transforman el pensamiento.",
    icons: ["🏛️", "⚖️", "🎭"] },
  { from: -27, to: 476, label: "Imperio Romano", sub: "Pax romana · Expansión del cristianismo", color: "#150a20",
    summary: "Roma unifica el mundo conocido con carreteras, leyes y un idioma común. El cristianismo se expande desde Palestina hasta los confines del Imperio. En China, la dinastía Han florece en paralelo.",
    icons: ["🏟️", "✝️", "🛣️"] },
  { from: 476, to: 1000, label: "Alta Edad Media", sub: "Caída de Roma · Islam · Carolingios", color: "#001510",
    summary: "Roma cae y Europa se fragmenta en reinos bárbaros. El Islam surge en Arabia y en un siglo llega desde España hasta India. Carlomagno intenta reunificar Occidente. Bagdad se convierte en el centro del saber mundial.",
    icons: ["🕌", "⚔️", "📿"] },
  { from: 1000, to: 1300, label: "Baja Edad Media", sub: "Cruzadas · Renacimiento urbano", color: "#101500",
    summary: "Las ciudades europeas renacen como centros de comercio. Las Cruzadas conectan violentamente Oriente y Occidente. Las universidades nacen en Bolonia, París y Oxford. El Imperio Mongol unifica Asia en el mayor estado continental de la historia.",
    icons: ["🏰", "🎓", "🗺️"] },
  { from: 1300, to: 1500, label: "Renacimiento", sub: "Peste negra · Humanismo · Imprenta", color: "#1a0a00",
    summary: "La Peste Negra mata a un tercio de Europa y sacude el orden medieval. El humanismo italiano redescubre la Antigüedad clásica. Gutenberg inventa la imprenta y democratiza el conocimiento. Los imperios azteca e inca alcanzan su apogeo en América.",
    icons: ["🖨️", "🎨", "🔭"] },
  { from: 1500, to: 1650, label: "Edad Moderna", sub: "América · Reforma · Imperios globales", color: "#1a0000",
    summary: "Europa 'descubre' América y comienza el intercambio colombino que transforma ambos mundos. Lutero desafía a la Iglesia. El Imperio Otomano domina desde Viena hasta Persia. China bajo los Ming es la economía más grande del planeta.",
    icons: ["⛵", "🌎", "✝️"] },
  { from: 1650, to: 1750, label: "Absolutismo", sub: "Revolución científica · Monarquías", color: "#00101a",
    summary: "Newton describe las leyes del universo. Los reyes absolutos como Luis XIV centralizan el poder. La Compañía de las Indias Orientales convierte el comercio en geopolítica. En Japón, el período Edo produce una cultura urbana sofisticada.",
    icons: ["👑", "🔬", "🌐"] },
  { from: 1750, to: 1800, label: "Ilustración", sub: "Razón · Enciclopedia · Independencias", color: "#00001a",
    summary: "La razón desafía a la tradición. Voltaire, Rousseau y Montesquieu reinventan la política. Beccaria abolirá la tortura con su pluma. América del Norte se independiza. La Revolución Francesa sacude el orden mundial.",
    icons: ["💡", "📚", "🗽"] },
  { from: 1800, to: 1850, label: "Revolución Industrial", sub: "Vapor · Romanticismo · Napoleón", color: "#0a0a1a",
    summary: "La máquina de vapor transforma la producción. Napoleón redibuja el mapa de Europa. Nace el proletariado industrial. El Romanticismo reacciona contra la razón fría. Latinoamérica se independiza en una generación.",
    icons: ["⚙️", "🚂", "🏭"] },
  { from: 1850, to: 1914, label: "Siglo XIX tardío", sub: "Imperialismo · Darwin · Marxismo", color: "#001a1a",
    summary: "Europa divide África en la Conferencia de Berlín. Darwin publica El origen de las especies. Marx diagnostica el capitalismo. Japón se moderniza en décadas. El telégrafo y el ferrocarril achican el mundo.",
    icons: ["🧬", "🌍", "📡"] },
  { from: 1914, to: 1945, label: "Era de las guerras", sub: "Guerras mundiales · Fascismo", color: "#1a0000",
    summary: "Dos guerras mundiales matan a cien millones de personas. El fascismo y el comunismo compiten como alternativas al liberalismo. Einstein revoluciona la física. El Holocausto sacude la conciencia moral de la humanidad.",
    icons: ["✈️", "☢️", "🕊️"] },
  { from: 1945, to: 1991, label: "Guerra Fría", sub: "Descolonización · Derechos civiles", color: "#00001a",
    summary: "EEUU y la URSS dividen el mundo en dos bloques. África y Asia se descolonizan. Martin Luther King y el movimiento por los derechos civiles transforman la democracia. El hombre llega a la Luna. Internet nace como proyecto militar.",
    icons: ["🚀", "💻", "✊"] },
  { from: 1991, to: 2000, label: "Mundo contemporáneo", sub: "Globalización · Internet", color: "#001a10",
    summary: "La URSS colapsa y el mundo se reorganiza. Internet conecta a la humanidad como nunca antes. La globalización acelera el comercio pero también la desigualdad. El cambio climático emerge como la gran amenaza del siglo.",
    icons: ["🌐", "📱", "🌱"] },
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

  const [yearFrom,     setYearFrom]     = useState(-500)
  const [yearTo,       setYearTo]       = useState(1800)
  const [filter,       setFilter]       = useState('all')
  const [panel,        setPanel]        = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [leftOpen,     setLeftOpen]     = useState(true)
  const [firstTime,    setFirstTime]    = useState(true)

  const visibleEvents = EVENTS.filter(e => {
    const inTime = e.year >= yearFrom && e.year <= yearTo
    const inCat  = filter === 'all' || e.cat === filter
    return inTime && inCat
  })

  const era = getEra(yearFrom, yearTo)

  async function handlePointClick(event) {
    setFirstTime(false)
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

  function handleRangeClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    const year = Math.round(MIN_YEAR + pct * (MAX_YEAR - MIN_YEAR))
    const midpoint = (yearFrom + yearTo) / 2
    if (year < midpoint) setYearFrom(Math.min(year, yearTo - 1))
    else setYearTo(Math.max(year, yearFrom + 1))
  }

  function makeDraggable(side) {
    return function(e) {
      e.preventDefault()
      const track = e.currentTarget.parentElement
      const move = ev => {
        const rect = track.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
        const y = Math.round(MIN_YEAR + pct * (MAX_YEAR - MIN_YEAR))
        if (side === 'left' && y < yearTo) setYearFrom(y)
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
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: era.color, transition: 'background 1.2s ease', overflow: 'hidden' }}>

      {/* Fondo: iconos de época flotantes */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {era.icons.map((icon, i) => (
          <div key={`${era.label}-${i}`} style={{
            position: 'absolute',
            fontSize: i === 0 ? 120 : i === 1 ? 90 : 70,
            opacity: 0.04,
            top: i === 0 ? '15%' : i === 1 ? '55%' : '30%',
            left: i === 0 ? '20%' : i === 1 ? '65%' : '80%',
            transition: 'all 1.5s ease',
            userSelect: 'none',
            filter: 'grayscale(100%)'
          }}>
            {icon}
          </div>
        ))}
      </div>

      {/* Globo */}
      <div ref={globeEl} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

      {/* Watermark era */}
      <div style={{
        position: 'absolute', bottom: 110, left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center', pointerEvents: 'none', zIndex: 2
      }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.1)', letterSpacing: 3, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          {era.label}
        </div>
      </div>

      {/* Panel izquierdo */}
      <div style={{
        position: 'absolute', top: 0, left: 0, height: '100%', zIndex: 10,
        display: 'flex', flexDirection: 'row'
      }}>
        <div style={{
          width: leftOpen ? 260 : 0,
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '20px 16px', overflowY: 'auto', flex: 1 }}>

            {/* Logo */}
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: 2, marginBottom: 4 }}>
              CHRONOGLOBE
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 20, letterSpacing: 1 }}>
              ATLAS HISTÓRICO INTERACTIVO
            </div>

            {/* Era actual */}
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 8, padding: '12px', marginBottom: 16,
              borderLeft: '2px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                Período seleccionado
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
                {era.label}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                {formatYear(yearFrom)} — {formatYear(yearTo)}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                {era.summary}
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                {era.icons.map((icon, i) => (
                  <span key={i} style={{ fontSize: 18 }}>{icon}</span>
                ))}
              </div>
            </div>

            {/* Cómo usar */}
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Cómo explorar
            </div>
            {[
              { icon: '🖱️', text: 'Arrastrá el globo para rotarlo' },
              { icon: '🔍', text: 'Usá la rueda del mouse para hacer zoom' },
              { icon: '📍', text: 'Tocá un punto para ver qué pasaba en ese lugar' },
              { icon: '📅', text: 'Mové el slider o escribí los años para cambiar el período' },
              { icon: '🏷️', text: 'Filtrá por categoría: filosofía, ciencia, política...' },
              { icon: '⏳', text: 'Hacé click en una era para saltar a ese período' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}

            {/* Leyenda colores */}
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8 }}>
              Categorías
            </div>
            {Object.entries(CAT_COLORS).map(([cat, color]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}
                onClick={() => setFilter(filter === cat ? 'all' : cat)}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: filter === cat ? '#fff' : 'rgba(255,255,255,0.45)', textTransform: 'capitalize' }}>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle button */}
        <button onClick={() => setLeftOpen(o => !o)} style={{
          alignSelf: 'center',
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderLeft: leftOpen ? 'none' : '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.7)',
          width: 20, height: 48,
          borderRadius: leftOpen ? '0 6px 6px 0' : '6px',
          cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {leftOpen ? '‹' : '›'}
        </button>
      </div>

      {/* Top bar (timeline) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
        padding: '8px 16px 10px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        display: 'flex', flexDirection: 'column', gap: 6,
        pointerEvents: 'none'
      }}>
        {/* Era pills */}
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', pointerEvents: 'all' }}>
          {ERAS.map(e => (
            <button key={e.from} onClick={() => { setYearFrom(e.from); setYearTo(e.to) }}
              style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.15)',
                background: (yearFrom === e.from && yearTo === e.to) ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'rgba(255,255,255,0.65)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap'
              }}>
              {e.label}
            </button>
          ))}
        </div>

        {/* Milestones */}
        <div style={{ position: 'relative', height: 20, pointerEvents: 'all' }}>
          {MILESTONES.map((m, i) => {
            const pct = yearToPercent(m.year)
            const inRange = m.year >= yearFrom && m.year <= yearTo
            const prev = MILESTONES[i - 1]
            if (prev && yearToPercent(m.year) - yearToPercent(prev.year) < 6) return null
            return (
              <button key={m.year}
                onClick={() => {
                  const found = ERAS.find(e => m.year >= e.from && m.year < e.to)
                  if (found) { setYearFrom(found.from); setYearTo(found.to) }
                }}
                style={{
                  position: 'absolute', left: `${pct}%`,
                  transform: 'translateX(-50%)',
                  background: 'none', border: 'none', padding: 0,
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                <span style={{ fontSize: 9, color: inRange ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', transition: 'color 0.3s' }}>
                  {m.label}
                </span>
                <span style={{ width: 1, height: 4, background: inRange ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)', display: 'block' }} />
              </button>
            )
          })}
        </div>

        {/* Slider */}
        <div style={{ position: 'relative', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', cursor: 'pointer', pointerEvents: 'all' }}
          onClick={handleRangeClick}>
          <div style={{
            position: 'absolute', top: 0, height: '100%', borderRadius: 2,
            background: 'rgba(255,255,255,0.6)',
            left: `${leftPct}%`, width: `${rightPct - leftPct}%`
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: `${leftPct}%`,
            transform: 'translate(-50%, -50%)',
            width: 14, height: 14, borderRadius: '50%',
            background: '#fff', border: '2px solid rgba(0,0,0,0.3)', cursor: 'ew-resize'
          }} onMouseDown={makeDraggable('left')} />
          <div style={{
            position: 'absolute', top: '50%', left: `${rightPct}%`,
            transform: 'translate(-50%, -50%)',
            width: 14, height: 14, borderRadius: '50%',
            background: '#fff', border: '2px solid rgba(0,0,0,0.3)', cursor: 'ew-resize'
          }} onMouseDown={makeDraggable('right')} />
        </div>

        {/* Year inputs + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'all' }}>
          <input type="number" value={yearFrom}
            onChange={e => { const v = Number(e.target.value); if (v >= MIN_YEAR && v < yearTo) setYearFrom(v) }}
            style={{ width: 72, padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, textAlign: 'center', fontFamily: 'inherit' }}
          />
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>—</span>
          <input type="number" value={yearTo}
            onChange={e => { const v = Number(e.target.value); if (v <= MAX_YEAR && v > yearFrom) setYearTo(v) }}
            style={{ width: 72, padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, textAlign: 'center', fontFamily: 'inherit' }}
          />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>{era.label}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.2)',
                background: filter === cat ? '#fff' : 'transparent',
                color: filter === cat ? '#000' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
                {cat === 'all' ? 'Todo' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      {panel && (
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 300, height: '100%', zIndex: 10,
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 16px', overflowY: 'auto', color: '#fff'
        }}>
          <button onClick={() => setPanel(null)} style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
            fontSize: 20, cursor: 'pointer'
          }}>×</button>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{panel.region}</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#fff' }}>{panel.name}</div>
          {panel.wikiTitle && panel.wikiTitle !== panel.name && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>vía Wikipedia: {panel.wikiTitle}</div>
          )}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>{formatYear(panel.year)}</div>

          {loading && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Buscando información...</div>
          )}
          {panel.text && (
            <>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: 'rgba(255,255,255,0.8)' }}>{panel.text}</p>
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