import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { HashRouter, Route, Routes, useLocation, useParams } from "react-router-dom";
import { ContentProvider } from "./context/ContentContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SmoothScrollProvider, useSmoothScroll } from "./context/SmoothScrollContext";
import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AmbientBackground from "./components/AmbientBackground";
import ScrollProgress from "./components/ScrollProgress";
import ErrorBoundary from "./components/ErrorBoundary";
import Hero from "./sections/Hero";
import About from "./sections/About";
import TechStack from "./sections/TechStack";
import Bento from "./sections/Bento";
import TerminalSection from "./sections/TerminalSection";
import { initAnalytics } from "./utils/analytics";

// ── Route-level code splitting ────────────────────────────────────────────
const Projects = lazy(() => import("./sections/Projects"));
const GitHubShowcase = lazy(() => import("./sections/GitHubShowcase"));
const Contact = lazy(() => import("./sections/Contact"));
const CaseStudy = lazy(() => import("./sections/CaseStudy"));
const AdminApp = lazy(() => import("./admin/AdminApp"));

const SectionFallback = () => (
  <div className="min-h-[60vh]" aria-hidden="true">
    <span className="sr-only">Loading section</span>
  </div>
);

/** Reads :projectId and hands it to the case study page. */
function CaseStudyRoute() {
  const { projectId } = useParams();
  return (
    <ErrorBoundary>
      <Suspense fallback={<SectionFallback />}>
        <CaseStudy projectId={projectId} />
      </Suspense>
    </ErrorBoundary>
  );
}

function Home() {
  const [ready, setReady] = useState(false);
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    stop();
    return () => start();
  }, [start, stop]);

  const handleLoaded = useCallback(() => {
    setReady(true);
    start();
  }, [start]);

  return (
    <>
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero ready={ready} />
        <About />
        <TechStack />
        <Bento />
        <TerminalSection />
        <Suspense fallback={<SectionFallback />}>
          <Projects />
          <GitHubShowcase />
          <Contact />
        </Suspense>
      </main>
      <Preloader duration={1050} onComplete={handleLoaded} />
    </>
  );
}

function NotFound() {
  const { pathname } = useLocation();

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[12px] tracking-[0.24em] text-accent uppercase">404</p>
      <h1 className="mt-5 text-[clamp(2.4rem,7vw,4.5rem)] leading-[1] font-semibold tracking-[-0.04em] text-gradient">
        This page doesn&rsquo;t exist.
      </h1>
      <p className="mt-5 max-w-md text-[17px] text-muted">
        The path <code className="font-mono text-[14px] text-ink">{pathname}</code> isn&rsquo;t part of the site.
      </p>
      <a
        href="#/"
        className="mt-9 inline-flex h-12 items-center rounded-full bg-accent px-6 text-[14.5px] font-medium text-white elevate-2 transition-shadow hover:elevate-3"
      >
        Back to home
      </a>
    </main>
  );
}

/** Scrolls to the top on route change. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const isCaseStudy = pathname.startsWith("/work/");

  return (
    <>
      <AmbientBackground />

      {isAdmin ? (
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-[100svh] bg-bg" aria-busy="true" />}>
            <AdminApp />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <>
          <Cursor />
          <ScrollProgress />
          <ScrollToTop />
          {isCaseStudy ? null : <Navbar />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work/:projectId" element={<CaseStudyRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </>
      )}
    </>
  );
}

export default function App() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <ThemeProvider>
      <ContentProvider>
        <SmoothScrollProvider>
          <HashRouter>
            <Shell />
          </HashRouter>
        </SmoothScrollProvider>
      </ContentProvider>
    </ThemeProvider>
  );
}
