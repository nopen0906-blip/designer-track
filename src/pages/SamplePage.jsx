import { Suspense, lazy } from 'react'
import { content } from '../content'
import { useReveal, Statement, WorkShowcase, Practice, Studio, Contact } from '../sections'
import InteractiveText from '../components/InteractiveText'
import MagneticButton from '../components/MagneticButton'

const VillaHero = lazy(() => import('../components/VillaHero'))

function linkProps(href) {
  return href.startsWith('/') ? { to: href } : { href }
}

function SampleHero() {
  const { hero } = content
  const lines = hero.headline.split('/')
  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <p className="eyebrow reveal">{hero.eyebrow}</p>
        <InteractiveText lines={lines} />
        <div className="hero-foot reveal">
          <p className="hero-sub">{hero.sub}</p>
          <div className="hero-cta">
            <MagneticButton className="btn btn-solid" {...linkProps(hero.ctaPrimary.href)}>{hero.ctaPrimary.label}</MagneticButton>
            <MagneticButton className="btn btn-ghost" {...linkProps(hero.ctaSecondary.href)}>{hero.ctaSecondary.label}</MagneticButton>
          </div>
        </div>
      </div>
      <div className="hero-scene" aria-hidden="true">
        <Suspense fallback={null}>
          <VillaHero />
        </Suspense>
      </div>
    </section>
  )
}

export default function SamplePage() {
  useReveal()
  const all = content.work.projects
  const featured = all.filter((p) => p.featured)
  const sample = (featured.length ? featured : all.slice(0, 3))
  return (
    <>
      <SampleHero />
      <Statement />
      <WorkShowcase projects={sample} showViewAll />
      <Practice />
      <Studio />
      <Contact />
    </>
  )
}
