import { forwardRef, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulation } from '../state/SimulationContext'

export const Planet = forwardRef(function Planet(
  {
    id,
    radius = 0.4,
    textureUrl,
    roughness = 0.85,
    metalness = 0.04,
    atmosphere = null,
  },
  ref,
) {
  const { setSelected, setFocus } = useSimulation()
  const texture = useTexture(textureUrl)

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
  }, [texture])

  return (
    <group ref={ref}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          setSelected(id)
          setFocus(id)
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
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>
      {atmosphere}
    </group>
  )
})
