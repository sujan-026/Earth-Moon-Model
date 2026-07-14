import { forwardRef, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulation } from '../state/SimulationContext'

const coronaVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const coronaFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), uPower);
    gl_FragColor = vec4(uColor, fresnel * uIntensity);
  }
`

const surfaceVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const surfaceFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv + vec2(uTime * 0.008, sin(uTime * 0.05 + vUv.y * 6.0) * 0.002);
    vec3 base = texture2D(uMap, uv).rgb;
    // Hot ridge shimmer
    float pulse = 0.92 + 0.08 * sin(uTime * 1.4 + vUv.x * 40.0);
    vec3 color = base * pulse;
    color += vec3(0.25, 0.12, 0.02) * pow(base.r, 2.2);
    gl_FragColor = vec4(color, 1.0);
  }
`

function Corona({ radius, color, scale, power, intensity }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uPower: { value: power },
      uIntensity: { value: intensity },
    }),
    [color, power, intensity],
  )

  return (
    <mesh scale={scale}>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        vertexShader={coronaVertex}
        fragmentShader={coronaFragment}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export const Sun = forwardRef(function Sun({ radius = 3.2 }, ref) {
  const { setSelected, setFocus } = useSimulation()
  const matRef = useRef()
  const texture = useTexture('/images/suntexture.png')

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.anisotropy = 8
  }, [texture])

  const surfaceUniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uTime: { value: 0 },
    }),
    [texture],
  )

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta
    }
  })

  return (
    <group ref={ref}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          setSelected('sun')
          setFocus('sun')
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[radius, 96, 96]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={surfaceVertex}
          fragmentShader={surfaceFragment}
          uniforms={surfaceUniforms}
        />
      </mesh>

      {/* Photosphere rim */}
      <mesh scale={1.015}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial
          color="#ffb35a"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <Corona
        radius={radius}
        color="#ff9a3c"
        scale={1.12}
        power={2.4}
        intensity={0.55}
      />
      <Corona
        radius={radius}
        color="#ffd089"
        scale={1.35}
        power={3.2}
        intensity={0.28}
      />
      <Corona
        radius={radius}
        color="#fff6e0"
        scale={1.7}
        power={4.0}
        intensity={0.12}
      />

      <pointLight
        color="#fff1d0"
        intensity={85}
        distance={220}
        decay={2}
        castShadow={false}
      />
      <pointLight color="#ffb070" intensity={18} distance={60} decay={2} />
    </group>
  )
})
