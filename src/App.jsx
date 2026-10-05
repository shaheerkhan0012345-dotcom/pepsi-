import React, { useState, useEffect, useRef, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import PourSequence from './components/PourSequence';
import FlavorShowcase from './components/FlavorShowcase';
import MomentsGallery from './components/MomentsGallery';
import Footer from './components/Footer';
import CanScene from './components/CanScene';
import Loader from './components/Loader';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navRef = useRef(null);

  // 1. Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 2. Initialize Lenis Smooth Scrolling and synchronize with GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    // Synchronize Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  // 3. Global ScrollTrigger sort and refresh after fonts load and on window load
  useEffect(() => {
    const handleSortAndRefresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(handleSortAndRefresh);
    }
    window.addEventListener('load', handleSortAndRefresh);

    return () => {
      window.removeEventListener('load', handleSortAndRefresh);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F2F0EB] text-[#0B0B0F] selection:bg-[#E32934] selection:text-white">
      {/* Background Noise / Film Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-grain opacity-70" />

      {/* Pixel-style 0-100% Counter Loader */}
      <Loader onLoaded={() => setIsLoaded(true)} />

      {/* Main Navigation Bar */}
      <Navbar navRef={navRef} />

      {/* Persistent Fixed 3D Can Scene Canvas (stays active across all sections) */}
      <div
        id="can-canvas-fixed-wrapper"
        className="fixed inset-0 z-20 pointer-events-none select-none overflow-hidden"
      >
        <Suspense fallback={null}>
          <CanScene isMobile={isMobile} />
        </Suspense>
      </div>

      {/* Hero, Product, About, Pour, and Flavors Sections */}
      <main className="relative z-10">
        <Suspense fallback={null}>
          <Hero isLoaded={isLoaded} isMobile={isMobile} navRef={navRef} />
          <AboutSection isLoaded={isLoaded} isMobile={isMobile} />
          <PourSequence isLoaded={isLoaded} isMobile={isMobile} />
          <FlavorShowcase isLoaded={isLoaded} isMobile={isMobile} />
          <MomentsGallery isLoaded={isLoaded} isMobile={isMobile} />
        </Suspense>
      </main>

      {/* Final Section 7: Interactive Footer with Cola Liquid Wordmark */}
      <Footer isLoaded={isLoaded} isMobile={isMobile} />
    </div>
  );
}
