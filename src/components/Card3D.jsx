import { useRef, useCallback } from 'react'

export default function Card3D({ children, className }) {
  const ref = useRef()

  const onMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = ((e.clientX - r.left) / r.width  - 0.5) * 2   // -1 to 1
    const dy = ((e.clientY - r.top)  / r.height - 0.5) * 2   // -1 to 1
    el.style.transform = `perspective(1000px) rotateY(${dx * 7}deg) rotateX(${-dy * 4}deg) translateZ(10px) scale(1.01)`
    el.style.boxShadow = `${-dx * 12}px ${dy * 12}px 40px rgba(22,17,13,0.25), 0 30px 60px -20px rgba(22,17,13,0.35)`
  }, [])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0) scale(1)'
    el.style.boxShadow = ''
  }, [])

  return (
    <article
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transition: 'transform 0.25s ease, box-shadow 0.25s ease', willChange: 'transform' }}
    >
      {children}
    </article>
  )
}
