import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const atmosphereFragment = /* glsl */ `
  uniform vec3 uGlowColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 2.6);
    float alpha = fresnel * uIntensity;
    gl_FragColor = vec4(uGlowColor, alpha);
  }
`

export function Atmosphere({ radius, color = '#7eb6ff', intensity = 0.85 }) {
  const uniforms = useMemo(
    () => ({
      uGlowColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    }),
    [color, intensity],
  )

  useFrame(({ clock }) => {
    uniforms.uIntensity.value = intensity * 0.92 + Math.sin(clock.elapsedTime * 0.4) * 0.06
  })

  return (
    <mesh scale={[1.01, 1.01, 1.01]}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        uniforms={uniforms}
      />
    </mesh>
  )
}
