import { useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, Float, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

const GOLD = '#d8ab54', CLAY = '#b9532a', IVORY = '#f3ecdf'

const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

// Phones / small / low-core / low-memory devices get a much cheaper material
// path (no real-time transmission buffer) so the hero stays smooth. Real glass
// transmission is extremely GPU-heavy and is the main perf cost here.
const LOW_POWER = (() => {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia?.('(pointer: coarse)')?.matches
  const small = window.innerWidth < 900
  const fewCores = (navigator.hardwareConcurrency || 8) <= 4
  const lowMem = (navigator.deviceMemory || 8) <= 4
  return !!(coarse || small || fewCores || lowMem)
})()

function hasWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch { return false }
}

// Scroll progress 0..1 across the hero's pinned scroll range. Measuring the
// hero element (not a fixed viewport multiple) makes the camera complete its
// full cinematic sweep exactly while the 3D is pinned in view, and auto-adapts
// to the hero height / sticky range on any screen.
function useScrollProgress() {
  const ref = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById('top')
      if (!hero) { ref.current = 0; return }
      const rect = hero.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) { ref.current = 0; return }      // mobile / unpinned: stay at start
      const scrolled = Math.min(Math.max(-rect.top, 0), total)
      ref.current = scrolled / total
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return ref
}

// One glass slab + its glowing gold edges
function GlassSlab({ args, position }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...args)), [args[0], args[1], args[2]])
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={args} />
        {LOW_POWER ? (
          // Cheap reflective translucent material — no transmission render pass.
          <meshStandardMaterial
            color={IVORY} transparent opacity={0.18}
            roughness={0.15} metalness={0.6} envMapIntensity={1.5}
          />
        ) : (
          // transmissionSampler = share ONE transmission buffer across all slabs
          // (instead of a full scene re-render per slab). Lower res/samples too.
          <MeshTransmissionMaterial
            transmissionSampler
            transmission={1} thickness={1.1} roughness={0.16} ior={1.45}
            chromaticAberration={0.03} anisotropy={0.2} distortion={0.08}
            color={IVORY} attenuationColor={GOLD} attenuationDistance={4}
            samples={4} resolution={128} background={null}
          />
        )}
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={GOLD} transparent opacity={0.9} />
      </lineSegments>
    </group>
  )
}

function Massing({ scrollRef }) {
  const { camera, mouse } = useThree()
  const target = useMemo(() => new THREE.Vector3(0, 0.1, 0), [])
  useFrame(() => {
    const p = scrollRef.current
    const angle  = 0.55 + p * Math.PI * 0.85          // orbit sweep with scroll
    const radius = 7.2 - p * 1.6                       // dolly in
    const height = 2.3 + p * 2.4                       // rise
    const mx = PREFERS_REDUCED_MOTION ? 0 : mouse.x * 0.7
    const my = PREFERS_REDUCED_MOTION ? 0 : mouse.y * 0.5
    const L = 0.06
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(angle) * radius + mx, L)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, Math.cos(angle) * radius, L)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, height + my, L)
    camera.lookAt(target)
  })

  // Abstract offset massing — tune freely
  const slabs = [
    { args: [2.4, 0.45, 2.4], position: [0,    -1.15, 0]    },
    { args: [1.85, 0.45, 1.85], position: [0.28, -0.45, -0.12] },
    { args: [1.35, 0.45, 1.35], position: [-0.18, 0.28, 0.14] },
    { args: [0.85, 0.6, 0.85], position: [0.12, 1.05, -0.06] },
  ]
  return (
    <Float speed={PREFERS_REDUCED_MOTION ? 0 : 1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group rotation={[0, 0.3, 0]}>
        {slabs.map((s, i) => <GlassSlab key={i} {...s} />)}
        {/* frames={1} renders the contact shadow once (it floats with the group) */}
        <ContactShadows position={[0, -1.45, 0]} opacity={0.5} scale={11} blur={2.6} far={4.5} color="#000000" frames={1} />
      </group>
    </Float>
  )
}

function Lighting() {
  // Procedural studio rig — gives glass real reflections without an external HDRI.
  return (
    <Environment resolution={LOW_POWER ? 64 : 128} background={false}>
      <Lightformer form="rect"   intensity={3.0} color={IVORY} position={[ 3, 3,  3]} scale={[5, 5, 1]} />
      <Lightformer form="rect"   intensity={1.4} color={GOLD}  position={[-4, 1,  2]} scale={[3, 3, 1]} />
      <Lightformer form="circle" intensity={2.2} color={CLAY}  position={[ 0,-2,  3]} scale={[3, 3, 1]} />
      <Lightformer form="rect"   intensity={1.0} color={IVORY} position={[ 0, 4, -4]} scale={[6, 2, 1]} />
    </Environment>
  )
}

export default function HeroScene() {
  const scrollRef = useScrollProgress()        // hooks BEFORE any early return
  if (!hasWebGL()) return <div className="hero-scene-fallback" aria-hidden="true" />
  return (
    <Canvas
      dpr={LOW_POWER ? 1 : [1, 1.5]}            // cap pixel count (was [1,2] = 4x on retina)
      performance={{ min: 0.5 }}
      frameloop={PREFERS_REDUCED_MOTION ? 'demand' : 'always'}
      camera={{ position: [4.2, 2.6, 5.4], fov: 40 }}
      gl={{ antialias: !LOW_POWER, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.35} />
        <Lighting />
        <Massing scrollRef={scrollRef} />
        {/* EffectComposer/Bloom intentionally omitted — preserves alpha transparency and saves a pass */}
      </Suspense>
    </Canvas>
  )
}
