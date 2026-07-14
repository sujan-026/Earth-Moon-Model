# Selene

A cinematic Sun–Earth–Moon observatory with Newtonian n-body gravity, built with React 19, Vite, Three.js, and React Three Fiber.

## Run

```bash
npm install
npm run dev
```

## Physics

- **Sun fixed** at the origin (dominant mass)
- **Earth & Moon** integrated with velocity Verlet
- **Mass ratios** match the real solar system (Sun = 1)
- **Distances compressed** so bodies stay visible; lunar distance is exaggerated vs true AU scale
- One Earth year ≈ 100s at time scale 1; moon phases follow Sun–Earth–Moon geometry

## Stack

- **three** / **@react-three/fiber** / **@react-three/drei** / **@react-three/postprocessing**
