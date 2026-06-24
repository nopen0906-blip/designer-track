import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { Header, Footer } from './sections';
import Home from './pages/Home';
import WorkPage from './pages/WorkPage';

const SamplePage = lazy(() => import('./pages/SamplePage'));

/* On navigation: scroll to a #hash target if present, otherwise jump to top. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // wait a frame so the target section is mounted before scrolling
      requestAnimationFrame(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      return;
    }
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <div className="page">
      <div className="ambient" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <ScrollManager />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/sample" element={<Suspense fallback={null}><SamplePage /></Suspense>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
