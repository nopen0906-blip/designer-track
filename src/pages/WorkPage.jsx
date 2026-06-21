import { useState } from 'react';
import { content } from '../content';
import { useReveal } from '../sections';
import ParallaxImage from '../components/ParallaxImage';
import Lightbox from '../components/Lightbox';

export default function WorkPage() {
  useReveal();
  const { workPage, work } = content;
  const projects = work.projects;
  const [lightboxImg, setLightboxImg] = useState(null);

  return (
    <section className="workpage">
      <header className="workpage-head">
        <span className="section-label reveal">{workPage.label}</span>
        <h1 className="workpage-title reveal">{workPage.title}</h1>
        <p className="workpage-intro reveal">{workPage.intro}</p>
      </header>

      <div className="work-grid">
        {projects.map((p) => (
          <article className="card reveal" key={p.no}>
            <figure className="card-img media-frame">
              <ParallaxImage src={p.image} alt={p.name} hover range={6} onClick={() => setLightboxImg(p.image)} />
              <span className="card-no">{p.no}</span>
            </figure>
            <div className="card-body">
              <h2 className="card-name">{p.name}</h2>
              <p className="card-blurb">{p.blurb}</p>
            </div>
          </article>
        ))}
      </div>
      <Lightbox image={lightboxImg} onClose={() => setLightboxImg(null)} />
    </section>
  );
}
