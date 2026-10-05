import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { canAnimState } from '../state/canState';

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ isLoaded, isMobile, navRef }) {
  const containerRef = useRef(null);
  const heroSectionRef = useRef(null);
  const headlineLine1Ref = useRef(null);
  const headlineLine2Ref = useRef(null);
  const subtextRef = useRef(null);
  const partnerStripRef = useRef(null);
  const letterSpans1Ref = useRef([]);
  const letterSpans2Ref = useRef([]);

  // Line 1: "REFRESH"
  const line1Text = "REFRESH";
  // Line 2: "THE FUTURE"
  const line2Text = "THE FUTURE";

  // =========================================================================
  // ENTRANCE ANIMATION (Triggered once loader completes)
  // =========================================================================
  useEffect(() => {
    if (!isLoaded) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Headline reveal line-by-line (masked slide-up)
      tl.fromTo(
        [headlineLine1Ref.current, headlineLine2Ref.current],
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.15, ease: 'power4.out' }
      );

      // 2. 3D Can drops in from above directly to center (0, -0.1)
      tl.fromTo(
        canAnimState,
        {
          dropY: 2.2,
          entranceScale: 0.85,
        },
        {
          dropY: 0,
          entranceScale: 1.0,
          duration: 1.3,
          ease: 'bounce.out',
        },
        '-=0.7'
      );

      // 3. Navbar and partner logo strip fade in
      if (navRef?.current) {
        tl.fromTo(
          navRef.current,
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.8'
        );
      }

      tl.fromTo(
        [subtextRef.current, partnerStripRef.current],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12 },
        '-=0.6'
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isLoaded, navRef]);

  // =========================================================================
  // SCROLL ANIMATION (GSAP ScrollTrigger: Hero -> Dock into 2nd Section Card)
  // =========================================================================
  useEffect(() => {
    if (!isLoaded) return;

    const ctx = gsap.context(() => {
      // Pin the hero section for a clean scroll journey
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 1.0,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // PHASE 1 (0 -> 45%): Spin & Parallax in Hero
      // - Can spins ~360 deg on Y, tilts ~25 deg on Z, scales up slightly
      // - Headline letters shift apart
      // - Subtext & logo strip fade out
      scrollTl.to(
        canAnimState,
        {
          scrollRotY: Math.PI * 2,
          scrollRotZ: 25 * (Math.PI / 180),
          scrollScaleBonus: 0.15,
          duration: 0.45,
          ease: 'power1.inOut',
        },
        0
      );

      // Parallax headline letter split
      if (letterSpans1Ref.current.length > 0) {
        letterSpans1Ref.current.forEach((span, idx) => {
          if (!span) return;
          const factor = (idx - 3) * (isMobile ? 14 : 28);
          scrollTl.to(span, { x: factor, opacity: 0.2, ease: 'none', duration: 0.45 }, 0);
        });
      }

      if (letterSpans2Ref.current.length > 0) {
        letterSpans2Ref.current.forEach((span, idx) => {
          if (!span) return;
          const factor = (idx - 4.5) * (isMobile ? 16 : 32);
          scrollTl.to(span, { x: factor, opacity: 0.2, ease: 'none', duration: 0.45 }, 0);
        });
      }

      // Subtext and partner logo strip fade out
      scrollTl.to(
        [subtextRef.current, partnerStripRef.current],
        { opacity: 0, y: -30, ease: 'power2.in', duration: 0.35 },
        0
      );

      // PHASE 2 (45% -> 100%): Seamless Transition & Docking into 2nd Section Card
      // - dockProgress animates from 0 to 1 (locking coordinates to card DOM rect)
      // - tilt returns to upright (rotZ -> 0)
      // - spins another revolution (Math.PI * 4) so front logo faces the user upon docking
      scrollTl.to(
        canAnimState,
        {
          dockProgress: 1.0, // Docks right into #card-pedestal-anchor
          scrollRotZ: 0,
          scrollRotY: Math.PI * 4,
          scrollScaleBonus: 0,
          duration: 0.55,
          ease: 'power2.inOut',
        },
        0.45
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isLoaded, isMobile]);

  return (
    <div ref={containerRef} id="page-content-wrapper" className="relative w-full bg-[#F2F0EB]">
      
      {/* ===================================================================== */}
      {/* 1. PINNED HERO SECTION                                               */}
      {/* ===================================================================== */}
      <section
        ref={heroSectionRef}
        id="hero-pinned-section"
        className="relative w-full h-screen overflow-hidden flex flex-col justify-between pt-20 pb-4 sm:pb-6 select-none cursor-grab active:cursor-grabbing"
      >
        {/* Soft Background Accents */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full bg-[#0A4DA3]/[0.045] blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#E32934]/[0.035] blur-3xl pointer-events-none" />
        </div>

        {/* Giant Headline (Z-10, sits BEHIND the 3D can) */}
        <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center text-center px-4 my-auto">
          {/* Top Line: REFRESH */}
          <div className="overflow-hidden leading-[0.84]">
            <h1
              ref={headlineLine1Ref}
              className="font-pixel text-[14.5vw] md:text-[13vw] font-black tracking-tighter text-[#0B0B0F] uppercase flex items-center justify-center select-none"
              style={{ willChange: 'transform' }}
            >
              {line1Text.split('').map((char, i) => (
                <span
                  key={i}
                  ref={(el) => (letterSpans1Ref.current[i] = el)}
                  className="inline-block transition-transform duration-75 hover:text-[#0A4DA3]"
                >
                  {char}
                </span>
              ))}
            </h1>
          </div>

          {/* Bottom Line: THE FUTURE */}
          <div className="overflow-hidden leading-[0.84] -mt-1 sm:-mt-3 md:-mt-5">
            <h2
              ref={headlineLine2Ref}
              className="font-pixel text-[14.5vw] md:text-[13vw] font-black tracking-tighter text-[#0B0B0F] uppercase flex items-center justify-center select-none"
              style={{ willChange: 'transform' }}
            >
              {line2Text.split('').map((char, i) => (
                <span
                  key={i}
                  ref={(el) => (letterSpans2Ref.current[i] = el)}
                  className={`inline-block transition-transform duration-75 hover:text-[#E32934] ${
                    char === ' ' ? 'w-[3vw]' : ''
                  }`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h2>
          </div>

          {/* Subtext under headline */}
          <div
            ref={subtextRef}
            className="mt-6 md:mt-8 z-10 max-w-lg mx-auto flex flex-col items-center gap-2 px-4"
          >
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono tracking-widest text-[#0B0B0F]/80 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A4DA3]" />
              <p className="font-medium">Ice-cold. Electric. Unmistakably Pepsi.</p>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E32934]" />
            </div>
            
            {/* Interactive mouse drag guide */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B0B0F]/5 border border-[#0B0B0F]/10 text-[9px] sm:text-[10px] font-mono tracking-widest text-[#0B0B0F]/60 uppercase">
              <span>✦</span>
              <span>CLICK & DRAG TO ROTATE 360° // SCROLL TO DOCK</span>
              <span>✦</span>
            </div>
          </div>
        </div>

        {/* Partner Logo Strip (Bottom of hero) */}
        <div
          ref={partnerStripRef}
          id="partner-strip"
          className="relative z-10 w-full px-4 sm:px-8 max-w-7xl mx-auto"
        >
          <div className="border-t border-b border-[#0B0B0F]/15 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-[#0B0B0F]/45 whitespace-nowrap">
              OFFICIAL PARTNERS // 2026
            </span>

            {/* 4–5 Grayscale Partner Placeholders */}
            <div className="w-full sm:w-auto flex items-center justify-around sm:justify-end gap-6 sm:gap-10 md:gap-14 text-xs font-mono uppercase tracking-wider text-[#0B0B0F]/45">
              <span className="hover:text-[#0B0B0F] transition-colors flex items-center gap-1.5 cursor-default">
                <span className="font-bold tracking-tighter">UEFA</span> CHAMPIONS
              </span>
              <span className="hover:text-[#0B0B0F] transition-colors flex items-center gap-1.5 cursor-default font-bold">
                NBA
              </span>
              <span className="hover:text-[#0B0B0F] transition-colors flex items-center gap-1.5 cursor-default font-extrabold tracking-widest">
                F1®
              </span>
              <span className="hover:text-[#0B0B0F] transition-colors flex items-center gap-1.5 cursor-default">
                SUPER BOWL
              </span>
              <span className="hover:text-[#0B0B0F] transition-colors flex items-center gap-1.5 cursor-default hidden md:inline">
                SPOTIFY
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. SECOND SECTION: PRODUCT SHOWCASE & 3D PIVOT CARD                   */}
      {/* ===================================================================== */}
      <section
        id="flavors"
        className="relative z-10 min-h-screen bg-[#EBE8E1] border-t border-[#0B0B0F]/10 px-6 sm:px-12 lg:px-20 py-24 flex items-center"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Product Specifications & Story */}
          <div className="flex flex-col gap-6 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A4DA3]/10 border border-[#0A4DA3]/20 text-[#0A4DA3] font-mono text-xs uppercase tracking-widest w-fit">
              <span className="w-2 h-2 rounded-full bg-[#0A4DA3] animate-pulse" />
              PEPSI MATTE // 330ML EDITION
            </div>

            <h3 className="font-pixel text-4xl sm:text-5xl md:text-6xl font-black text-[#0B0B0F] tracking-tight uppercase leading-[0.95]">
              ELECTRIC CHILL. <br />
              <span className="text-[#0A4DA3]">PEAK FIZZ.</span>
            </h3>

            <p className="text-sm sm:text-base text-[#0B0B0F]/70 leading-relaxed font-sans">
              Engineered with crisp carbonation and precision balanced cola aroma.
              The all-new tactile finish can retains ultra-cold temperature
              up to 40% longer for uninterrupted crisp taste.
            </p>

            {/* Flavor Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-[#0B0B0F]/10 pt-6">
              <div className="flex flex-col p-3 rounded-xl bg-white/40 border border-black/5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B0B0F]/50">CALORIES</span>
                <span className="font-pixel text-xl sm:text-2xl font-bold text-[#0B0B0F]">150 KCAL</span>
              </div>
              <div className="flex flex-col p-3 rounded-xl bg-white/40 border border-black/5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B0B0F]/50">TEMP SERVE</span>
                <span className="font-pixel text-xl sm:text-2xl font-bold text-[#0A4DA3]">3.2 °C</span>
              </div>
              <div className="flex flex-col p-3 rounded-xl bg-white/40 border border-black/5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B0B0F]/50">RECYCLABLE</span>
                <span className="font-pixel text-xl sm:text-2xl font-bold text-[#E32934]">100% ALU</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                data-no-drag
                className="px-7 py-3 rounded-full bg-[#0B0B0F] hover:bg-[#0A4DA3] text-white font-mono text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
              >
                Claim Cold Pack
              </button>
              <button
                data-no-drag
                className="px-6 py-3 rounded-full border border-[#0B0B0F]/20 hover:border-[#0B0B0F] font-mono text-xs uppercase tracking-widest transition-all duration-200"
              >
                Nutritional Specs
              </button>
            </div>
          </div>

          {/* Right Column: 3D PIVOT CARD (The Can Docks Here on Scroll & Stays on Card!) */}
          <div
            id="pivot-card-target"
            className="relative h-[480px] sm:h-[560px] w-full rounded-3xl border border-[#0B0B0F]/15 bg-gradient-to-b from-white/60 via-white/30 to-white/10 backdrop-blur-md shadow-2xl flex flex-col justify-between p-6 sm:p-8 cursor-grab active:cursor-grabbing"
          >
            {/* Card Header Readout */}
            <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-[#0B0B0F]/60 border-b border-black/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0A4DA3] animate-ping" />
                <span>3D PIVOT MATRIX</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0A4DA3]/10 text-[#0A4DA3] font-bold text-[10px]">
                DOCKED // INTERACTIVE
              </span>
            </div>

            {/* TARGET DOCKING ANCHOR (CanScene calculates this exact DOM center every frame!) */}
            <div
              id="card-pedestal-anchor"
              className="relative my-auto w-full h-64 flex items-center justify-center pointer-events-none select-none"
            >
              {/* Outer Pulse Ring */}
              <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-[#0A4DA3]/25 animate-pulse flex items-center justify-center">
                {/* Middle Rotating Dash Ring */}
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-[#0A4DA3]/35 animate-[spin_25s_linear_infinite] flex items-center justify-center" />
              </div>
              
              {/* Radial Base Holographic Glow */}
              <div className="absolute bottom-6 w-44 h-12 rounded-full bg-[#0A4DA3]/25 blur-xl" />
            </div>

            {/* Card Footer Info */}
            <div className="w-full flex items-center justify-between text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-[#0B0B0F]/50 border-t border-black/5 pt-3">
              <span>DRAG TO ROTATE 360°</span>
              <span className="text-[#0A4DA3] font-bold">STATE: LOCKED TO CARD</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
