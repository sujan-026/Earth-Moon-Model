import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, OrbitControls, Line } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useSimulation } from '../state/SimulationContext'
import { Earth } from './Earth'
import { Moon } from './Moon'
import { CameraRig } from './CameraRig'

const EARTH_RADIUS = 1.35
const MOON_RADIUS = 0.37
const ORBIT_RADIUS = 4.2
const ORBIT_INCLINATION = 0.09

export function Scene() {
  const { paused, timeScale, setPhaseAngle, setSelected, setFocus } = useSimulation()
  const groupRef = useRef()
  const moonRef = useRef()
  const earthRef = useRef()
  const angleRef = useRef(0.8)
  const phaseTick = useRef(0)

  const orbitPoints = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 128; i++) {
      const t = (i / 128) * Math.PI * 2
      pts.push(
        new THREE.Vector3(
          Math.cos(t) * ORBIT_RADIUS,
          Math.sin(t) * ORBIT_RADIUS * ORBIT_INCLINATION,
          Math.sin(t) * ORBIT_RADIUS,
        ),
      )
    }
    return pts
  }, [])

  useFrame((_, delta) => {
    if (paused) return
    const speed = 0.18 * timeScale
    angleRef.current += delta * speed
    phaseTick.current += delta
    if (phaseTick.current > 0.4) {
      phaseTick.current = 0
      setPhaseAngle(angleRef.current)
    }

    const a = angleRef.current
    if (moonRef.current) {
      moonRef.current.position.set(
        Math.cos(a) * ORBIT_RADIUS,
        Math.sin(a) * ORBIT_RADIUS * ORBIT_INCLINATION,
        Math.sin(a) * ORBIT_RADIUS,
      )
      moonRef.current.lookAt(0, 0, 0)
      moonRef.current.rotateY(Math.PI)
    }

    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.12 * timeScale
    }
  })

  return (
    <>
      <ambientLight intensity={0.08} color="#c9d4e8" />
      <directionalLight
        castShadow
        intensity={2.4}
        position={[12, 4, 6]}
        color="#fff4e5"
      />
      <directionalLight intensity={0.25} position={[-8, -2, -4]} color="#6b7c9c" />

      <mesh position={[18, 6, 10]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color="#ffe9c4" />
      </mesh>
      <mesh position={[18, 6, 10]}>
        <sphereGeometry args={[1.4, 24, 24]} />
        <meshBasicMaterial color="#ffd7a0" transparent opacity={0.12} depthWrite={false} />
      </mesh>

      <Stars
        radius={90}
        depth={50}
        count={4500}
        factor={3.2}
        saturation={0}
        fade
        speed={0.2}
      />

      <group
        ref={groupRef}
        onPointerMissed={() => {
          setSelected(null)
          setFocus('system')
        }}
      >
        <Line
          points={orbitPoints}
          color="#c9a57a"
          transparent
          opacity={0.22}
          lineWidth={1}
        />
        <Earth ref={earthRef} radius={EARTH_RADIUS} />
        <Moon ref={moonRef} radius={MOON_RADIUS} />
      </group>

      <CameraRig earthRef={earthRef} moonRef={moonRef} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2.2}
        maxDistance={16}
        maxPolarAngle={Math.PI * 0.9}
        enableDamping
        dampingFactor={0.06}
      />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.35}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        <Vignette offset={0.25} darkness={0.55} />
      </EffectComposer>
    </>
  )
}
