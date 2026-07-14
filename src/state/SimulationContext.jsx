import { createContext, useContext, useMemo, useState } from 'react'

const SimulationContext = createContext(null)

export function SimulationProvider({ children }) {
  const [paused, setPaused] = useState(false)
  const [timeScale, setTimeScale] = useState(1)
  const [focus, setFocus] = useState('system')
  const [selected, setSelected] = useState(null)
  const [phaseAngle, setPhaseAngle] = useState(0)

  const value = useMemo(
    () => ({
      paused,
      setPaused,
      timeScale,
      setTimeScale,
      focus,
      setFocus,
      selected,
      setSelected,
      phaseAngle,
      setPhaseAngle,
    }),
    [paused, timeScale, focus, selected, phaseAngle],
  )

  return (
    <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
  )
}

export function useSimulation() {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider')
  return ctx
}

export const BODY_COPY = {
  earth: {
    kicker: 'Home world',
    title: 'Earth',
    copy: 'A living sphere wrapped in thin blue air. From here the Moon keeps one face turned toward us — a quiet companion in the dark.',
    meta: [
      ['Mean radius', '6,371 km'],
      ['Day length', '23.93 h'],
      ['Axial tilt', '23.4°'],
    ],
  },
  moon: {
    kicker: 'Companion',
    title: 'Moon',
    copy: 'Scarred highland and dark maria, locked in synchrony. Its orbit draws a silver thread around Earth — the rhythm behind our tides.',
    meta: [
      ['Mean radius', '1,737 km'],
      ['Orbital period', '27.3 d'],
      ['Distance', '~384,400 km'],
    ],
  },
}
