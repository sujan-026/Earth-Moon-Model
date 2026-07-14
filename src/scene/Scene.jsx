import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, OrbitControls, Line } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useSimulation } from '../state/SimulationContext'
import {
  RADIUS,
  ORBIT,
  createInitialState,
  stepBodies,
  moonPhaseAngle,
  orbitEllipsePoints,
} from '../physics/nbody'
import { Sun } from './Sun'
import { Earth } from './Earth'
import { Moon } from './Moon'
import { Planet } from './Planet'
import { Atmosphere } from './Atmosphere'
import { CameraRig } from './CameraRig'

const ORBIT_META = {
  mercury: { radius: ORBIT.mercury, color: '#b0aaa0', incline: 0 },
  venus: { radius: ORBIT.venus, color: '#d4b896', incline: 0 },
  earth: { radius: ORBIT.earth, color: '#c9a57a', incline: 0 },
  mars: { radius: ORBIT.mars, color: '#c4845c', incline: 0 },
  moon: {
    radius: ORBIT.moon,
    color: '#d8dce6',
    incline: ORBIT.moonInclination,
  },
}

function SunOrbitPath({ bodyId, activeId }) {
  const meta = ORBIT_META[bodyId]
  const active = activeId === bodyId
  const points = useMemo(
    () =>
      orbitEllipsePoints(meta.radius, meta.incline).map(
        (p) => new THREE.Vector3(...p),
      ),
    [meta.radius, meta.incline],
  )

  return (
    <Line
      points={points}
      color={active ? '#f0e6d2' : meta.color}
      transparent
      opacity={active ? 0.95 : activeId ? 0.06 : 0.16}
      lineWidth={active ? 2 : 1}
    />
  )
}

/** Moon orbit centered on Earth — follows Earth each frame. */
function MoonOrbitPath({ earthRef, active, dimmed }) {
  const groupRef = useRef()
  const points = useMemo(
    () =>
      orbitEllipsePoints(ORBIT.moon, ORBIT.moonInclination).map(
        (p) => new THREE.Vector3(...p),
      ),
    [],
  )

  useFrame(() => {
    if (!groupRef.current || !earthRef.current) return
    groupRef.current.position.copy(earthRef.current.position)
  })

  return (
    <group ref={groupRef}>
      <Line
        points={points}
        color={active ? '#f0e6d2' : '#a8b0c0'}
        transparent
        opacity={active ? 0.95 : dimmed ? 0.05 : 0.2}
        lineWidth={active ? 2 : 1}
      />
    </group>
  )
}

export function Scene() {
  const { paused, timeScale, setPhaseAngle, setSelected, setFocus, selected, focus } =
    useSimulation()
  const sunRef = useRef()
  const mercuryRef = useRef()
  const venusRef = useRef()
  const earthRef = useRef()
  const moonRef = useRef()
  const marsRef = useRef()
  const refs = {
    sun: sunRef,
    mercury: mercuryRef,
    venus: venusRef,
    earth: earthRef,
    moon: moonRef,
    mars: marsRef,
  }
  const stateRef = useRef(createInitialState())
  const phaseTick = useRef(0)
  const tmpLook = useMemo(() => new THREE.Vector3(), [])

  const activeOrbit =
    selected && selected !== 'sun'
      ? selected
      : focus !== 'system' && focus !== 'sun'
        ? focus
        : null

  useFrame((_, delta) => {
    if (paused) return

    const dt = Math.min(delta, 0.05) * timeScale
    const steps = Math.max(1, Math.ceil(timeScale * 2))
    const h = dt / steps
    for (let i = 0; i < steps; i++) {
      stepBodies(stateRef.current, h)
    }

    const { mercury, venus, earth, moon, mars } = stateRef.current

    if (mercuryRef.current) {
      mercuryRef.current.position.set(...mercury.position)
      mercuryRef.current.rotation.y += dt * 0.35
    }
    if (venusRef.current) {
      venusRef.current.position.set(...venus.position)
      venusRef.current.rotation.y += dt * 0.2
    }
    if (earthRef.current) {
      earthRef.current.position.set(...earth.position)
      earthRef.current.rotation.y += dt * 0.55
    }
    if (marsRef.current) {
      marsRef.current.position.set(...mars.position)
      marsRef.current.rotation.y += dt * 0.48
    }
    if (moonRef.current) {
      moonRef.current.position.set(...moon.position)
      tmpLook.set(...earth.position)
      moonRef.current.lookAt(tmpLook)
      moonRef.current.rotateY(Math.PI)
    }

    phaseTick.current += delta
    if (phaseTick.current > 0.35) {
      phaseTick.current = 0
      setPhaseAngle(moonPhaseAngle(earth.position, moon.position))
    }
  })

  return (
    <>
      <ambientLight intensity={0.035} color="#9eb6d4" />

      <Stars
        radius={220}
        depth={80}
        count={6500}
        factor={3.6}
        saturation={0}
        fade
        speed={0.15}
      />

      <group
        onPointerMissed={() => {
          setSelected(null)
          setFocus('system')
        }}
      >
        <SunOrbitPath bodyId="mercury" activeId={activeOrbit} />
        <SunOrbitPath bodyId="venus" activeId={activeOrbit} />
        <SunOrbitPath bodyId="earth" activeId={activeOrbit} />
        <SunOrbitPath bodyId="mars" activeId={activeOrbit} />
        <MoonOrbitPath
          earthRef={earthRef}
          active={activeOrbit === 'moon'}
          dimmed={Boolean(activeOrbit) && activeOrbit !== 'moon'}
        />

        <Sun ref={sunRef} radius={RADIUS.sun} />
        <Planet
          ref={mercuryRef}
          id="mercury"
          radius={RADIUS.mercury}
          textureUrl="/images/mercurytexture.png"
          roughness={0.92}
        />
        <Planet
          ref={venusRef}
          id="venus"
          radius={RADIUS.venus}
          textureUrl="/images/venustexture.png"
          roughness={0.7}
          atmosphere={<Atmosphere radius={RADIUS.venus * 1.04} color="#e8c89a" />}
        />
        <Earth ref={earthRef} radius={RADIUS.earth} />
        <Moon ref={moonRef} radius={RADIUS.moon} />
        <Planet
          ref={marsRef}
          id="mars"
          radius={RADIUS.mars}
          textureUrl="/images/marstexture.png"
          roughness={0.9}
        />
      </group>

      <CameraRig refs={refs} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={120}
        maxPolarAngle={Math.PI * 0.92}
        enableDamping
        dampingFactor={0.06}
      />

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
        <Vignette offset={0.28} darkness={0.5} />
      </EffectComposer>
    </>
  )
}
