import { content } from '../content';
import {
  useReveal, Hero, Statement, WorkShowcase, Practice, Studio, Contact,
} from '../sections';

export default function Home() {
  useReveal();

  // Show only projects flagged `featured: true` (fallback: first 3).
  const all = content.work.projects;
  const featured = all.filter((p) => p.featured);
  const sample = (featured.length ? featured : all.slice(0, 3));

  return (
    <>
      <Hero />
      <Statement />
      <WorkShowcase projects={sample} showViewAll />
      <Practice />
      <Studio />
      <Contact />
    </>
  );
}
