/**
 * Scaled inner solar system gravity.
 * Distances compressed for visibility; mass ratios + circular-orbit
 * velocities follow Newtonian gravity.
 */

export const AU = 28

// Solar masses (Sun = 1)
export const MASS = {
  sun: 1,
  mercury: 1.66e-7,
  venus: 2.447e-6,
  earth: 3.003e-6,
  moon: 3.694e-8,
  mars: 3.227e-7,
}

// Visual radii (not true scale)
export const RADIUS = {
  sun: 3.2,
  mercury: 0.16,
  venus: 0.4,
  earth: 0.42,
  moon: 0.115,
  mars: 0.23,
}

// Semi-major axes in AU (true ratios)
export const ORBIT_AU = {
  mercury: 0.387,
  venus: 0.723,
  earth: 1,
  mars: 1.524,
}

export const ORBIT = {
  earth: AU,
  moon: 2.65,
  moonInclination: (5.145 * Math.PI) / 180,
  mercury: ORBIT_AU.mercury * AU,
  venus: ORBIT_AU.venus * AU,
  mars: ORBIT_AU.mars * AU,
}

export const EARTH_YEAR_SECONDS = 100
export const MU_SUN =
  (4 * Math.PI ** 2 * ORBIT.earth ** 3) / EARTH_YEAR_SECONDS ** 2
export const G = MU_SUN / MASS.sun

export const PLANET_IDS = ['mercury', 'venus', 'earth', 'mars']

export function circularSpeed(centralMass, radius) {
  return Math.sqrt((G * centralMass) / radius)
}

function createOrbitingBody(id, mass, radius, angle) {
  const v = circularSpeed(MASS.sun, radius)
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return {
    id,
    mass,
    position: [c * radius, 0, s * radius],
    velocity: [-s * v, 0, c * v],
  }
}

export function createInitialState() {
  const sun = {
    id: 'sun',
    mass: MASS.sun,
    position: [0, 0, 0],
    velocity: [0, 0, 0],
    fixed: true,
  }

  // Stagger starting longitudes so bodies aren't stacked
  const mercury = createOrbitingBody('mercury', MASS.mercury, ORBIT.mercury, 0.9)
  const venus = createOrbitingBody('venus', MASS.venus, ORBIT.venus, 2.4)
  const earth = createOrbitingBody('earth', MASS.earth, ORBIT.earth, 0.2)
  const mars = createOrbitingBody('mars', MASS.mars, ORBIT.mars, 4.1)

  const moonR = ORBIT.moon
  const moonV = circularSpeed(MASS.earth, moonR)
  const inc = ORBIT.moonInclination
  const relPos = [moonR, 0, 0]
  const relVel = [0, moonV * Math.sin(inc), moonV * Math.cos(inc)]

  const moon = {
    id: 'moon',
    mass: MASS.moon,
    position: [
      earth.position[0] + relPos[0],
      earth.position[1] + relPos[1],
      earth.position[2] + relPos[2],
    ],
    velocity: [
      earth.velocity[0] + relVel[0],
      earth.velocity[1] + relVel[1],
      earth.velocity[2] + relVel[2],
    ],
  }

  return { sun, mercury, venus, earth, moon, mars }
}

function accelOn(target, others) {
  let ax = 0
  let ay = 0
  let az = 0
  const soft = 0.08

  for (const other of others) {
    if (other === target) continue
    const dx = other.position[0] - target.position[0]
    const dy = other.position[1] - target.position[1]
    const dz = other.position[2] - target.position[2]
    const r2 = dx * dx + dy * dy + dz * dz + soft * soft
    const inv = 1 / Math.sqrt(r2)
    const inv3 = inv * inv * inv
    const s = G * other.mass * inv3
    ax += dx * s
    ay += dy * s
    az += dz * s
  }
  return [ax, ay, az]
}

export function stepBodies(bodies, dt) {
  const mobile = [
    bodies.mercury,
    bodies.venus,
    bodies.earth,
    bodies.moon,
    bodies.mars,
  ]
  const all = [bodies.sun, ...mobile]

  const acc0 = mobile.map((b) => accelOn(b, all))

  for (let i = 0; i < mobile.length; i++) {
    const b = mobile[i]
    const a = acc0[i]
    b.position[0] += b.velocity[0] * dt + 0.5 * a[0] * dt * dt
    b.position[1] += b.velocity[1] * dt + 0.5 * a[1] * dt * dt
    b.position[2] += b.velocity[2] * dt + 0.5 * a[2] * dt * dt
  }

  const acc1 = mobile.map((b) => accelOn(b, all))

  for (let i = 0; i < mobile.length; i++) {
    const b = mobile[i]
    const a0 = acc0[i]
    const a1 = acc1[i]
    b.velocity[0] += 0.5 * (a0[0] + a1[0]) * dt
    b.velocity[1] += 0.5 * (a0[1] + a1[1]) * dt
    b.velocity[2] += 0.5 * (a0[2] + a1[2]) * dt
  }
}

export function moonPhaseAngle(earthPos, moonPos, sunPos = [0, 0, 0]) {
  const ex = earthPos[0] - sunPos[0]
  const ey = earthPos[1] - sunPos[1]
  const ez = earthPos[2] - sunPos[2]
  const mx = moonPos[0] - earthPos[0]
  const my = moonPos[1] - earthPos[1]
  const mz = moonPos[2] - earthPos[2]

  const eLen = Math.hypot(ex, ey, ez) || 1
  const mLen = Math.hypot(mx, my, mz) || 1
  const se = [-ex / eLen, -ey / eLen, -ez / eLen]
  const em = [mx / mLen, my / mLen, mz / mLen]
  const cos = Math.min(1, Math.max(-1, se[0] * em[0] + se[1] * em[1] + se[2] * em[2]))
  let angle = Math.acos(cos)
  const crossY = se[0] * em[2] - se[2] * em[0]
  if (crossY < 0) angle = Math.PI * 2 - angle
  return angle
}

export function orbitEllipsePoints(radius, inclination = 0, segments = 160) {
  const pts = []
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2
    pts.push([
      Math.cos(t) * radius,
      Math.sin(t) * radius * Math.sin(inclination) * 0.35,
      Math.sin(t) * radius * Math.cos(inclination),
    ])
  }
  return pts
}
