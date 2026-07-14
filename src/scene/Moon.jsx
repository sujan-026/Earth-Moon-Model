import { forwardRef, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulation } from '../state/SimulationContext'

export const Moon = forwardRef(function Moon({ radius = 0.37 }, ref) {
  const { setSelected, setFocus } = useSimulation()
  const texture = useTexture('/images/moontexture.jpg')

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
  }, [texture])

  return (
    <mesh
      ref={ref}
      onClick={(e) => {
        e.stopPropagation()
        setSelected('moon')
        setFocus('moon')
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial map={texture} roughness={0.96} metalness={0.02} />
    </mesh>
  )
})
