import { useRef, useEffect } from 'react'

export const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

// Phones / small / low-core / low-memory devices get the cheap render path.
export const LOW_POWER = (() => {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia?.('(pointer: coarse)')?.matches
  const small = window.innerWidth < 900
  const fewCores = (navigator.hardwareConcurrency || 8) <= 4
  const lowMem = (navigator.deviceMemory || 8) <= 4
  return !!(coarse || small || fewCores || lowMem)
})()

export function hasWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch { return false }
}

// Scroll progress 0..1 across the pinned hero (#top) scroll range. Measuring the
// hero element (not a fixed viewport multiple) makes the camera complete its full
// cinematic sweep exactly while the 3D is pinned, on any screen height.
export function useHeroScrollProgress() {
  const ref = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById('top')
      if (!hero) { ref.current = 0; return }
      const rect = hero.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) { ref.current = 0; return }   // mobile / unpinned: stay at start
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
