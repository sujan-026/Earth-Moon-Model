import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulation } from '../state/SimulationContext'

const SYSTEM_POS = new THREE.Vector3(0, 1.35, 8.2)
const INTRO_FROM = new THREE.Vector3(0, 3.4, 15)

export function CameraRig({ earthRef, moonRef }) {
  const { focus } = useSimulation()
  const { camera, controls } = useThree()
  const intro = useRef(true)
  const introT = useRef(0)
  const desired = useRef(new THREE.Vector3().copy(INTRO_FROM))
  const lookAt = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    if (intro.current) {
      introT.current = Math.min(1, introT.current + delta * 0.38)
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

    if (focus === 'earth' && earthRef.current) {
      const p = new THREE.Vector3()
      earthRef.current.getWorldPosition(p)
      desired.current.set(p.x + 2.4, p.y + 0.9, p.z + 3.1)
      lookAt.current.copy(p)
    } else if (focus === 'moon' && moonRef.current) {
      const p = new THREE.Vector3()
      moonRef.current.getWorldPosition(p)
      desired.current.set(p.x + 1.15, p.y + 0.5, p.z + 1.55)
      lookAt.current.copy(p)
    }

    camera.position.lerp(desired.current, 1 - Math.exp(-2.4 * delta))
    camera.lookAt(lookAt.current)
    if (controls) controls.target.lerp(lookAt.current, 1 - Math.exp(-2.6 * delta))
  })

  return null
}
