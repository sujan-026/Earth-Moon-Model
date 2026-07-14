import { BODY_COPY, useSimulation } from '../state/SimulationContext'

const VIEW_BUTTONS = [
  { id: 'system', label: 'System' },
  { id: 'sun', label: 'Sun' },
  { id: 'mercury', label: 'Mercury' },
  { id: 'venus', label: 'Venus' },
  { id: 'earth', label: 'Earth' },
  { id: 'moon', label: 'Moon' },
  { id: 'mars', label: 'Mars' },
]

function formatPhase(angle) {
  const turns = ((angle / (Math.PI * 2)) % 1 + 1) % 1
  if (turns < 0.03 || turns > 0.97) return 'New'
  if (turns < 0.22) return 'Waxing crescent'
  if (turns < 0.28) return 'First quarter'
  if (turns < 0.47) return 'Waxing gibbous'
  if (turns < 0.53) return 'Full'
  if (turns < 0.72) return 'Waning gibbous'
  if (turns < 0.78) return 'Last quarter'
  return 'Waning crescent'
}

export function Hud() {
  const {
    paused,
    setPaused,
    timeScale,
    setTimeScale,
    focus,
    setFocus,
    selected,
    setSelected,
    phaseAngle,
  } = useSimulation()

  const detail = selected ? BODY_COPY[selected] : null

  return (
    <div className="hud">
      <header className="brand">
        <h1 className="brand__mark">Selene</h1>
        <p className="brand__line">
          The inner solar system under real gravity — Mercury to Mars, with Earth's
          Moon still in tow.
        </p>
      </header>

      <aside className={`detail${detail ? ' is-open' : ''}`} aria-live="polite">
        {detail && (
          <>
            <p className="detail__kicker">{detail.kicker}</p>
            <h2 className="detail__title">{detail.title}</h2>
            <p className="detail__copy">{detail.copy}</p>
            <ul className="detail__meta">
              {detail.meta.map(([label, value]) => (
                <li key={label}>
                  <span>{label}</span>
                  <span>{value}</span>
                </li>
              ))}
              {selected === 'moon' && (
                <li>
                  <span>Phase</span>
                  <span>{formatPhase(phaseAngle)}</span>
                </li>
              )}
            </ul>
          </>
        )}
      </aside>

      <p className="hint">Drag to orbit · Click a body</p>

      <div className="dock" role="toolbar" aria-label="Orbit controls">
        <div className="dock__group dock__group--views">
          <span className="dock__label">View</span>
          {VIEW_BUTTONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className="dock__btn"
              aria-pressed={focus === id}
              onClick={() => {
                setFocus(id)
                setSelected(id === 'system' ? null : id)
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="dock__divider" />

        <div className="dock__group">
          <span className="dock__label">Time</span>
          <button
            type="button"
            className="dock__btn"
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <input
            className="dock__slider"
            type="range"
            min="0.15"
            max="8"
            step="0.05"
            value={timeScale}
            aria-label="Orbit speed"
            onChange={(e) => setTimeScale(Number(e.target.value))}
          />
        </div>
      </div>

      <p className="credit">
        <span>Crafted by Sujan</span>
        <a href="https://github.com/sujan-026" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/sujan-p-443745244/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
      </p>
    </div>
  )
}
