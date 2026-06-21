import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { content } from './content';
import InteractiveText from './components/InteractiveText';
import ParallaxImage from './components/ParallaxImage';
import MagneticButton from './components/MagneticButton';
import CountUp from './components/CountUp';

/* Reveal-on-scroll: adds .is-visible when an element enters the viewport.
   Call this inside each page so freshly-mounted .reveal elements get observed. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.is-visible)');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* A link starting with "/" is an in-app route; anything else (#hash, http) is a plain anchor. */
function linkProps(href) {
  return href.startsWith('/') ? { to: href } : { href };
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <Link to="/" className="brand">
        <span className="brand-mark">DT</span>
        <span className="brand-name">{content.brand.name}</span>
      </Link>

      <nav className={`site-nav ${open ? 'is-open' : ''}`}>
        {content.nav.map((item) => {
          const isHash = item.href.startsWith('#');
          const to = isHash ? { pathname: '/', hash: item.href } : item.href;
          return (
            <Link key={item.href} to={to} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        className="nav-toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span /><span />
      </button>
    </header>
  );
}

export function Hero() {
  const { hero } = content;
  const lines = hero.headline.split('/');
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

      <figure className="hero-figure reveal">
        <div className="hero-media media-frame">
          <ParallaxImage src={hero.image} alt={hero.imageCaption} imgClass="hero-img" range={10} eager />
        </div>
        <figcaption>
          <span className="sheet">SHT. 01</span>
          {hero.imageCaption}
        </figcaption>
      </figure>
    </section>
  );
}

export function Statement() {
  const { statement } = content;
  return (
    <section className="statement reveal">
      <span className="section-label">{statement.label}</span>
      <p className="statement-text">{statement.text}</p>
    </section>
  );
}

/* Big alternating feature blocks. Used on the homepage with a few featured
   projects, and reused for any list of projects passed in. */
export function WorkShowcase({ projects, showViewAll = false }) {
  const { work } = content;
  return (
    <section className="work" id="work">
      <div className="section-head reveal">
        <span className="section-label">{work.label}</span>
        <h2 className="section-title">{work.title}</h2>
      </div>

      <div className="features">
        {projects.map((p, i) => (
          <article className={`feature reveal ${i % 2 ? 'feature--flip' : ''}`} key={p.no}>
            <figure className="feature-img media-frame">
              <ParallaxImage src={p.image} alt={p.name} hover range={7} />
            </figure>
            <div className="feature-body">
              <span className="feature-no">{p.no}</span>
              <h3 className="feature-name">{p.name}</h3>
              <p className="feature-blurb">{p.blurb}</p>
            </div>
          </article>
        ))}
      </div>

      {showViewAll && (
        <div className="work-viewall reveal">
          <MagneticButton className="btn btn-solid" to="/work">
            {work.viewAllLabel}
          </MagneticButton>
        </div>
      )}
    </section>
  );
}

export function Practice() {
  const { practice } = content;
  return (
    <section className="practice" id="practice">
      <div className="practice-head reveal">
        <span className="section-label">{practice.label}</span>
        <h2 className="section-title">{practice.title}</h2>
        {practice.intro && <p className="practice-intro">{practice.intro}</p>}
      </div>
      <div className="practice-grid">
        {practice.items.map((s) => (
          <article className="practice-item reveal" key={s.no}>
            <span className="practice-no">{s.no}</span>
            <h3 className="practice-name">{s.name}</h3>
            <p className="practice-text">{s.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Studio() {
  const { studio } = content;
  return (
    <section className="studio" id="studio">
      <figure className="studio-img media-frame reveal">
        <ParallaxImage src={studio.image} alt="Inside the studio's work" imgClass="studio-media" range={9} />
      </figure>
      <div className="studio-body reveal">
        <span className="section-label">{studio.label}</span>
        <h2 className="studio-title">{studio.title}</h2>
        <p className="studio-text">{studio.body}</p>
        <div className="stats">
          {studio.stats.map((st) => (
            <div className="stat" key={st.label}>
              <span className="stat-value"><CountUp value={st.value} /></span>
              <span className="stat-label">{st.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const { contact } = content;
  return (
    <section className="contact" id="contact">
      <div className="contact-grid reveal">
        <div className="contact-lead">
          <span className="section-label">{contact.label}</span>
          <h2 className="contact-title">{contact.title}</h2>
          <p className="contact-text">{contact.text}</p>
        </div>
        <div className="contact-details">
          <a className="contact-email" href={`mailto:${contact.email}`}>{contact.email}</a>
          <a className="contact-line" href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
          <p className="contact-addr">{contact.address}</p>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { footer, brand } = content;
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <span className="footer-brand">{brand.name}</span>
        <nav className="footer-socials">
          {footer.socials.map((s) => (
            <a key={s.label} href={s.href}>{s.label}</a>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {year} {brand.architect}, {brand.role}</span>
        <span>{footer.note}</span>
      </div>
    </footer>
  );
}
