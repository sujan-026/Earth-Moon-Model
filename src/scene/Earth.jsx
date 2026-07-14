import { forwardRef, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulation } from '../state/SimulationContext'
import { Atmosphere } from './Atmosphere'

export const Earth = forwardRef(function Earth({ radius = 1.35 }, ref) {
  const { setSelected, setFocus } = useSimulation()
  const texture = useTexture('/images/earthtexture.jpg')

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
  }, [texture])

  return (
    <group ref={ref}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          setSelected('earth')
          setFocus('earth')
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.72}
          metalness={0.05}
          emissive="#0a1520"
          emissiveIntensity={0.15}
        />
      </mesh>
      <Atmosphere radius={radius * 1.035} />
    </group>
  )
})
