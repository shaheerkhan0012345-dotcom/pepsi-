import React, { useState, useEffect, useRef, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
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

      {/* Hero and Product Sections */}
      <main className="relative z-10">
        <Suspense fallback={null}>
          <Hero isLoaded={isLoaded} isMobile={isMobile} navRef={navRef} />
        </Suspense>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-30 border-t border-[#0B0B0F]/10 py-8 px-6 bg-[#E3DFD7] text-[#0B0B0F]/50 font-mono text-xs text-center flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-4">
        <span>PEPSI® IS A REGISTERED TRADEMARK OF PEPSICO, INC.</span>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[#0B0B0F]">PRIVACY</a>
          <a href="#" className="hover:text-[#0B0B0F]">TERMS</a>
          <a href="#" className="hover:text-[#0B0B0F]">PRESS ROOM</a>
        </div>
      </footer>
    </div>
  );
}
