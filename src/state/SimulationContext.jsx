import { createContext, useContext, useMemo, useState } from 'react'
import { BODY_COPY } from './bodies'

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

export { BODY_COPY }
