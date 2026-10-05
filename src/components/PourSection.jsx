import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pourState } from '../state/canState';

gsap.registerPlugin(ScrollTrigger);

/**
 * PourSection Component
 * Pinned section (~300vh scroll) directly following Section 2.
 * Background transitions seamlessly from #EBE8E1 to deep blue-black (#06142e to #000).
 * GSAP ScrollTrigger timeline orchestrates the 4 pouring phases:
 * 1. 0–20%: Can lifts upper-right and tilts 110° toward the glass
 * 2. 20–30%: Cola stream flows from mouth into glass
 * 3. 30–85%: Liquid rises to 85%, ice cubes float and bob, bubbles rise, foam forms
 * 4. 85–100%: Stream thins/stops, can returns upright, glass glows, "POUR THE COLD" reveals
 */
export default function PourSection({ isMobile }) {
  const sectionRef = useRef(null);
  const bgOverlayRef = useRef(null);
  const headlineRef = useRef(null);
  const subtextRef = useRef(null);
  const floorRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1.0,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Keep pourState.progress in sync with scroll
            pourState.progress = self.progress;
          },
          onLeaveBack: () => {
            pourState.progress = 0;
            pourState.canLift = 0;
            pourState.canTilt = 0;
            pourState.streamProgress = 0;
            pourState.streamWidth = 0;
            pourState.liquidLevel = 0;
            pourState.foamOpacity = 0;
            pourState.canReturn = 0;
            pourState.glassGlow = 0;
          },
        },
      });

      // 0. Smooth background transition: #EBE8E1 -> #06142e to #000
      tl.to(
        bgOverlayRef.current,
        {
          opacity: 1,
          duration: 0.25,
          ease: 'power1.inOut',
        },
        0
      );

      // Floor reflection and soft light beams reveal
      if (floorRef.current) {
        tl.to(floorRef.current, { opacity: 0.85, duration: 0.25, ease: 'power1.out' }, 0);
      }

      // PHASE 1: 0% – 20%
      // The can lifts to the upper right and tilts ~110° toward the glass at lower center
      tl.to(
        pourState,
        {
          canLift: 1.0,
          canTilt: 1.0,
          duration: 0.20,
          ease: 'power2.inOut',
        },
        0
      );

      // PHASE 2: 20% – 30%
      // Cola stream emerges from can mouth and falls into the glass
      tl.to(
        pourState,
        {
          streamProgress: 1.0,
          streamWidth: 1.0,
          duration: 0.10,
          ease: 'power1.in',
        },
        0.20
      );

      // PHASE 3: 30% – 85%
      // Liquid rises in the glass to 85%, foam forms on top, ice bobs
      tl.to(
        pourState,
        {
          liquidLevel: 0.85,
          foamOpacity: 0.95,
          duration: 0.55,
          ease: 'none',
        },
        0.30
      );

      // PHASE 4: 85% – 100%
      // Stream thins and stops, can returns upright and drifts to the side,
      // glass glows softly, headline fades in
      tl.to(
        pourState,
        {
          streamWidth: 0,
          streamProgress: 0,
          canTilt: 0,
          canReturn: 1.0,
          glassGlow: 1.0,
          duration: 0.15,
          ease: 'power2.inOut',
        },
        0.85
      );

      // Headline and subtext fade & slide in beside the glass
      if (headlineRef.current && subtextRef.current) {
        tl.fromTo(
          [headlineRef.current, subtextRef.current],
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.14, stagger: 0.04, ease: 'power2.out' },
          0.86
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      id="pour-section"
      className="relative w-full h-screen overflow-hidden select-none"
      style={{ backgroundColor: '#EBE8E1' }}
    >
      {/* Deep Blue-Black Gradient Background Overlay (transitions from #EBE8E1 to #06142e -> #000) */}
      <div
        ref={bgOverlayRef}
        id="pour-bg-overlay"
        className="absolute inset-0 z-0 pointer-events-none opacity-0 transition-opacity duration-100"
        style={{
          background: 'linear-gradient(180deg, #06142e 0%, #030a17 50%, #000000 100%)',
        }}
      />

      {/* Atmospheric Lighting: Soft Blue Light Beams from above */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top radial spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-gradient-to-b from-[#0A4DA3]/25 via-[#0A4DA3]/5 to-transparent blur-3xl rounded-full" />
        
        {/* Soft cyan accent rim beam */}
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-[#38bdf8]/10 blur-3xl rounded-full" />
      </div>

      {/* Glossy Reflective Floor under the glass */}
      <div
        ref={floorRef}
        className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 w-[340px] sm:w-[480px] h-28 pointer-events-none opacity-0 z-0 flex items-center justify-center"
      >
        {/* Radial floor glow */}
        <div className="w-full h-full rounded-full bg-gradient-to-r from-transparent via-[#0A4DA3]/30 to-transparent blur-2xl" />
        {/* Crisp reflective floor ellipse */}
        <div className="absolute bottom-4 w-48 sm:w-64 h-8 rounded-full bg-white/10 blur-md border border-white/10" />
      </div>

      {/* UI Content Layer: "POUR THE COLD" pixel headline beside the glass */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-between py-16 pointer-events-none">
        
        {/* Top Badge: Section Label */}
        <div className="flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-white/50 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0A4DA3] animate-ping" />
            <span className="text-white/80">SECTION 03 // THE POUR</span>
          </div>
          <span className="text-[#38bdf8] font-bold">ICE-COLD RITUAL</span>
        </div>

        {/* Center/Left Content: Headline reveals in Phase 4 (85%–100%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
          
          {/* Left Column: Pixel Headline & Narrative */}
          <div className="lg:col-span-6 flex flex-col gap-4 text-left">
            <div
              ref={headlineRef}
              className="opacity-0 flex flex-col gap-1 select-none"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-[#38bdf8] flex items-center gap-2">
                <span className="w-2 h-0.5 bg-[#38bdf8]" />
                MAXIMUM CHILL // 3.2°C
              </span>

              <h2 className="font-pixel text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight uppercase leading-[0.88] drop-shadow-2xl">
                POUR <br />
                <span className="text-[#0A4DA3] text-transparent bg-clip-text bg-gradient-to-r from-[#0A4DA3] via-[#38bdf8] to-white">
                  THE COLD.
                </span>
              </h2>
            </div>

            <div
              ref={subtextRef}
              className="opacity-0 max-w-md flex flex-col gap-4 mt-2"
            >
              <p className="font-sans text-sm sm:text-base text-white/70 leading-relaxed">
                Watch crisp carbonation cascade over dense frosted ice. Every bubble
                unlocks electric citrus notes and uninterrupted refreshment.
              </p>

              <div className="flex items-center gap-4 text-xs font-mono text-white/50 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>DENSE ICE: 6 BLOCKS</span>
                </div>
                <div>•</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E32934]" />
                  <span>SERVE: 85% GLASS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transparent spacer allowing 3D Glass & Can to take center stage */}
          <div className="lg:col-span-6 h-64 lg:h-96 pointer-events-none" />
        </div>

        {/* Bottom Status Readout */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-white/40 border-t border-white/10 pt-4">
          <span>PEPSI COLA RITUAL // ZERO RESETS</span>
          <span className="hidden sm:inline">[ SCROLL TO CONTROL STREAM DYNAMICS ]</span>
          <span>60 FPS // THREE.JS PHYSICAL SHADERS</span>
        </div>

      </div>
    </section>
  );
}
