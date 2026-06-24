import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'
import { hasWebGL, LOW_POWER, PREFERS_REDUCED_MOTION, useHeroScrollProgress } from './three-helpers'

const GOLD = '#d8ab54', CLAY = '#b9532a', IVORY = '#f3ecdf'
const CONCRETE = '#c9bca6', GLASS = '#181512'

// Shared standard materials (reflective tinted glass — NOT real-time transmission, for perf).
function useVillaMaterials() {
  return useMemo(() => ({
    concrete: new THREE.MeshStandardMaterial({ color: CONCRETE, roughness: 0.85, metalness: 0.0 }),
    glass: new THREE.MeshStandardMaterial({ color: GLASS, roughness: 0.12, metalness: 0.7, envMapIntensity: 1.5 }),
    brass: new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.32, metalness: 1.0, envMapIntensity: 1.7 }),
  }), [])
}

// In-code villa: low plinth, lower concrete volume, glass front, cantilevered
// upper box, brass roof line, slender columns. Three-space (Y up).
function ProceduralVilla() {
  const m = useVillaMaterials()
  return (
    <group>
      <mesh position={[0, -0.62, 0]} material={m.concrete}><boxGeometry args={[5.2, 0.24, 4.2]} /></mesh>
      <mesh position={[-0.6, 0, 0]} material={m.concrete}><boxGeometry args={[3.0, 1.0, 3.4]} /></mesh>
      <mesh position={[-0.6, 0, 1.72]} material={m.glass}><boxGeometry args={[2.8, 0.86, 0.04]} /></mesh>
      <mesh position={[0.5, 0.92, -0.1]} material={m.concrete}><boxGeometry args={[3.6, 0.84, 2.6]} /></mesh>
      <mesh position={[0.5, 1.36, 1.2]} material={m.brass}><boxGeometry args={[3.64, 0.06, 0.06]} /></mesh>
      {[-0.8, 0.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 0.0, 1.0]} material={m.concrete}>
          <cylinderGeometry args={[0.055, 0.055, 1.0, 12]} />
        </mesh>
      ))}
    </group>
  )
}

// Procedural studio rig — gives glass/brass real reflections without an external HDRI.
function Lighting() {
  return (
    <Environment resolution={LOW_POWER ? 64 : 128} background={false}>
      <Lightformer form="rect" intensity={3.0} color={IVORY} position={[3, 4, 3]} scale={[6, 6, 1]} />
      <Lightformer form="rect" intensity={1.3} color={GOLD} position={[-5, 2, 2]} scale={[3, 3, 1]} />
      <Lightformer form="circle" intensity={1.8} color={CLAY} position={[0, -2, 4]} scale={[3, 3, 1]} />
      <Lightformer form="rect" intensity={1.0} color={IVORY} position={[0, 5, -5]} scale={[8, 2, 1]} />
    </Environment>
  )
}

// Cinematic scroll camera (orbit + dolly + rise) + arcing "sun" (re-shades the
// concrete as it moves = "light moves") + subtle mouse parallax + idle float.
function Rig({ scrollRef, sunRef, children }) {
  const { camera, mouse } = useThree()
  const target = useMemo(() => new THREE.Vector3(0, 0.25, 0), [])
  // R3F animates the camera imperatively every frame — mutating camera.position in
  // useFrame is the idiomatic pattern (same as HeroScene.jsx). The experimental
  // react-hooks/immutability rule doesn't model this, so scope-disable it here.
  /* eslint-disable react-hooks/immutability */
  useFrame((state) => {
    const p = scrollRef.current
    const t = state.clock.elapsedTime
    const idle = PREFERS_REDUCED_MOTION ? 0 : Math.sin(t * 0.15) * 0.1
    const angle = 0.5 + p * 2.1 + idle           // ~120° orbit
    const radius = 8.6 - p * 2.4                  // dolly in
    const height = 2.6 + p * 2.8                  // rise
    const mx = PREFERS_REDUCED_MOTION ? 0 : mouse.x * 0.6
    const my = PREFERS_REDUCED_MOTION ? 0 : mouse.y * 0.4
    const L = 0.06
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(angle) * radius + mx, L)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, Math.cos(angle) * radius, L)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, height + my, L)
    camera.lookAt(target)
    if (sunRef.current) {
      const a = 0.7 + p * 1.3
      sunRef.current.position.set(Math.cos(a) * 6, 5.2 - p * 1.0, Math.sin(a) * 5 + 1)
    }
  })
  /* eslint-enable react-hooks/immutability */
  return children
}

export default function VillaHero() {
  const scrollRef = useHeroScrollProgress()   // hooks BEFORE any early return
  const sunRef = useRef()
  if (!hasWebGL()) return <div className="hero-scene-fallback" aria-hidden="true" />
  return (
    <Canvas
      dpr={LOW_POWER ? 1 : [1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop={PREFERS_REDUCED_MOTION ? 'demand' : 'always'}
      camera={{ position: [6.4, 2.8, 6.4], fov: 38 }}
      gl={{ antialias: !LOW_POWER, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.35} />
        <directionalLight ref={sunRef} intensity={2.2} color={IVORY} position={[4, 5, 3]} />
        <Lighting />
        <Rig scrollRef={scrollRef} sunRef={sunRef}>
          <Float speed={PREFERS_REDUCED_MOTION ? 0 : 0.8} rotationIntensity={0.06} floatIntensity={0.25}>
            <ProceduralVilla />
          </Float>
          <ContactShadows position={[0, -0.74, 0]} opacity={0.55} scale={12} blur={2.6} far={5} color="#000000" frames={1} />
        </Rig>
      </Suspense>
    </Canvas>
  )
}
