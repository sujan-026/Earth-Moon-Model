import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulation } from '../state/SimulationContext'
import { ORBIT } from '../physics/nbody'

const SYSTEM_POS = new THREE.Vector3(0, ORBIT.mars * 0.38, ORBIT.mars * 1.05)
const INTRO_FROM = new THREE.Vector3(0, ORBIT.mars * 0.65, ORBIT.mars * 1.55)

const FOCUS_OFFSET = {
  sun: [7, 2.8, 9],
  mercury: [0.7, 0.3, 0.95],
  venus: [1.3, 0.5, 1.7],
  earth: [1.4, 0.55, 1.8],
  moon: [0.55, 0.22, 0.7],
  mars: [0.95, 0.4, 1.2],
}

export function CameraRig({ refs }) {
  const { focus } = useSimulation()
  const { camera, controls } = useThree()
  const intro = useRef(true)
  const introT = useRef(0)
  const desired = useRef(new THREE.Vector3().copy(INTRO_FROM))
  const lookAt = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    if (intro.current) {
      introT.current = Math.min(1, introT.current + delta * 0.3)
      const t = 1 - (1 - introT.current) ** 3
      camera.position.lerpVectors(INTRO_FROM, SYSTEM_POS, t)
      camera.lookAt(0, 0, 0)
      if (controls) {
        controls.target.set(0, 0, 0)
        controls.enabled = false
      }
      if (introT.current >= 1) intro.current = false
      return
    }

    if (controls) controls.enabled = focus === 'system'

    if (focus === 'system') {
      lookAt.current.set(0, 0, 0)
      if (controls) controls.target.lerp(lookAt.current, 1 - Math.exp(-3 * delta))
      return
    }

    const bodyRef = refs[focus]
    const offset = FOCUS_OFFSET[focus]
    if (bodyRef?.current && offset) {
      const p = new THREE.Vector3()
      bodyRef.current.getWorldPosition(p)
      desired.current.set(p.x + offset[0], p.y + offset[1], p.z + offset[2])
      lookAt.current.copy(p)
    }

    camera.position.lerp(desired.current, 1 - Math.exp(-2.2 * delta))
    camera.lookAt(lookAt.current)
    if (controls) controls.target.lerp(lookAt.current, 1 - Math.exp(-2.4 * delta))
  })

  return null
}
