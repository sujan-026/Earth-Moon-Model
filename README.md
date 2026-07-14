# Selene

A cinematic Earth–Moon observatory built with React 19, Vite, Three.js, and React Three Fiber.

## Run

```bash
npm install
npm run dev
```

## Stack

- **three** — WebGL scene, materials, lighting
- **@react-three/fiber** — declarative React renderer for Three.js
- **@react-three/drei** — Stars, OrbitControls, textures
- **@react-three/postprocessing** — soft bloom + vignette

## Controls

- Drag to orbit the camera
- Click Earth or Moon for a focused view and reading
- Use the dock to switch views, pause time, or change orbit speed
