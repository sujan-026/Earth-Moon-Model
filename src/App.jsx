import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { SimulationProvider } from './state/SimulationContext'
import { Scene } from './scene/Scene'
import { Hud } from './ui/Hud'

export default function App() {
  return (
    <SimulationProvider>
      <div className="app">
        <div className="scene">
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 18, 48], fov: 42, near: 0.1, far: 600 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <color attach="background" args={['#06070a']} />
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        </div>
        <Hud />
      </div>
    </SimulationProvider>
  )
}
