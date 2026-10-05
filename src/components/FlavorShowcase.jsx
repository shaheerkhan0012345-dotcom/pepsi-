import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './FlavorShowcase.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * =============================================================================
 * FLAVORS DATA ARRAY
 * Edit flavor names, taglines, colors, and image paths easily here.
 * =============================================================================
 */
export const FLAVORS_DATA = [
  {
    id: 'classic',
    number: '01',
    name: 'PEPSI CLASSIC',
    tagline: 'Bold, crisp, electric refreshment since 1898.',
    bgColor: '#0A4DA3',
    glowColor: 'rgba(30, 107, 255, 0.40)',
    image: '/flavors/classic.png',
  },
  {
    id: 'zero',
    number: '02',
    name: 'ZERO SUGAR',
    tagline: 'Maximum taste, zero sugar. The crisp electric edge.',
    bgColor: '#0B0B0F',
    glowColor: 'rgba(10, 77, 163, 0.35)',
    image: '/flavors/zero.png',
  },
  {
    id: 'cherry',
    number: '03',
    name: 'WILD CHERRY',
    tagline: 'A bold splash of cherry with iconic cola fizz.',
    bgColor: '#7A0F2B',
    glowColor: 'rgba(227, 41, 52, 0.45)',
    image: '/flavors/cherry.png',
  },
];

/**
 * Configuration settings for Section 5: FLAVORS
 */
export const FLAVOR_CONFIG = {
  // Temporary debug flag to see ScrollTrigger start and end lines
  markers: false,

  // Pinning settings
  pinLength: '+=400%',
  scrub: 1.2,
  anticipatePin: 1,

  // Can tilt transition angle (6 to 8 degrees)
  tiltAngle: 8,

  // Previous section background color (Section 4: The Pour sampled background)
  previousBgColor: '#D3D4D7',
};

/**
 * FlavorShowcase Component
 * Section 5: "FLAVORS"
 */
export default function FlavorShowcase({ isLoaded = true, isMobile = false }) {
  const sectionRef = useRef(null);
  const glowRef = useRef(null);
  const counterRef = useRef(null);
  const progressBarRef = useRef(null);
  const buttonRef = useRef(null);

  // References for cans and text elements
  const cansRef = useRef([]);
  const titlesRef = useRef([]);
  const descsRef = useRef([]);
  const blocksRef = useRef([]);

  const [imagesReady, setImagesReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 1. Preload all three can images completely before creating the timeline
  useEffect(() => {
    let isCancelled = false;

    const preloadImages = async () => {
      const promises = FLAVORS_DATA.map((flavor) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = flavor.image;
          if (img.complete) {
            resolve(img);
          } else {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
          }
        });
      });

      await Promise.all(promises);

      if (!isCancelled) {
        setImagesReady(true);
      }
    };

    preloadImages();

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Master GSAP ScrollTrigger timeline with explicit fromTo values & states
  useEffect(() => {
    if (!imagesReady || reducedMotion) return;

    let pinTl = null;

    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      // -----------------------------------------------------------------------
      // INITIAL STATES (Explicit gsap.set before timeline creation)
      // - waiting: yPercent: 120, rotation: 8, opacity: 0
      // - active:  yPercent: 0,   rotation: 0, opacity: 1
      // - leaving: yPercent: -120, rotation: -8, opacity: 0
      // -----------------------------------------------------------------------
      gsap.set(cansRef.current[0], { yPercent: 0, rotation: 0, opacity: 1 });
      gsap.set(cansRef.current[1], { yPercent: 120, rotation: 8, opacity: 0 });
      gsap.set(cansRef.current[2], { yPercent: 120, rotation: 8, opacity: 0 });

      // Initial Text States
      gsap.set(blocksRef.current[0], { opacity: 1, pointerEvents: 'auto' });
      gsap.set(titlesRef.current[0], { yPercent: 0 });
      gsap.set(descsRef.current[0], { opacity: 1, y: 0 });

      gsap.set(blocksRef.current[1], { opacity: 0, pointerEvents: 'none' });
      gsap.set(titlesRef.current[1], { yPercent: 120 });
      gsap.set(descsRef.current[1], { opacity: 0, y: 20 });

      gsap.set(blocksRef.current[2], { opacity: 0, pointerEvents: 'none' });
      gsap.set(titlesRef.current[2], { yPercent: 120 });
      gsap.set(descsRef.current[2], { opacity: 0, y: 20 });

      if (buttonRef.current) {
        gsap.set(buttonRef.current, { opacity: 0, y: 15 });
      }

      if (counterRef.current) {
        counterRef.current.textContent = '01 / 03';
      }

      // -----------------------------------------------------------------------
      // MASTER PINNED TIMELINE (start: "top top", end: "+=400%", scrub: 1.2)
      // -----------------------------------------------------------------------
      pinTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: FLAVOR_CONFIG.pinLength,
          pin: true,
          pinSpacing: true,
          anticipatePin: FLAVOR_CONFIG.anticipatePin,
          scrub: FLAVOR_CONFIG.scrub,
          invalidateOnRefresh: true,
          markers: FLAVOR_CONFIG.markers,
          onUpdate: (self) => {
            if (progressBarRef.current) {
              progressBarRef.current.style.height = `${self.progress * 100}%`;
            }
          },
        },
      });

      // =======================================================================
      // STEP 0: ENTRANCE FADE (0.0s -> 0.8s in timeline)
      // Fade in from Section 4 background to Classic #0A4DA3
      // =======================================================================
      pinTl.addLabel('entrance', 0);
      pinTl.fromTo(
        sectionRef.current,
        { backgroundColor: FLAVOR_CONFIG.previousBgColor },
        {
          backgroundColor: FLAVORS_DATA[0].bgColor,
          duration: 0.8,
          ease: 'power2.out',
        },
        'entrance'
      );

      // =======================================================================
      // STEP 1: FLAVOR 1 HOLD (~30% hold so can stays fully centered)
      // =======================================================================
      pinTl.addLabel('flavor1_hold', 0.8);
      pinTl.to({}, { duration: 1.4 }, 'flavor1_hold');

      // =======================================================================
      // STEP 2: TRANSITION 1 -> 2 (CLASSIC TO ZERO SUGAR)
      // Outgoing Can 0: active -> leaving (yPercent: -120, rotation: -8, opacity: 0)
      // Incoming Can 1: waiting -> active (yPercent: 0, rotation: 0, opacity: 1)
      // =======================================================================
      pinTl.addLabel('trans1to2', '>');

      // Cans Transition (exact simultaneous power2.inOut)
      pinTl.fromTo(
        cansRef.current[0],
        { yPercent: 0, rotation: 0, opacity: 1 },
        {
          yPercent: -120,
          rotation: -FLAVOR_CONFIG.tiltAngle,
          opacity: 0,
          duration: 1.2,
          ease: 'power2.inOut',
        },
        'trans1to2'
      );

      pinTl.fromTo(
        cansRef.current[1],
        { yPercent: 120, rotation: FLAVOR_CONFIG.tiltAngle, opacity: 0 },
        {
          yPercent: 0,
          rotation: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power2.inOut',
        },
        'trans1to2'
      );

      // Section Background & Glow
      pinTl.fromTo(
        sectionRef.current,
        { backgroundColor: FLAVORS_DATA[0].bgColor },
        {
          backgroundColor: FLAVORS_DATA[1].bgColor,
          duration: 1.2,
          ease: 'power2.inOut',
        },
        'trans1to2'
      );

      if (glowRef.current) {
        pinTl.fromTo(
          glowRef.current,
          { background: `radial-gradient(circle, ${FLAVORS_DATA[0].glowColor} 0%, rgba(0,0,0,0) 70%)` },
          {
            background: `radial-gradient(circle, ${FLAVORS_DATA[1].glowColor} 0%, rgba(0,0,0,0) 70%)`,
            duration: 1.2,
            ease: 'power2.inOut',
          },
          'trans1to2'
        );
      }

      // Text 0 Exits
      pinTl.fromTo(
        titlesRef.current[0],
        { yPercent: 0 },
        { yPercent: -120, duration: 0.9, ease: 'power2.inOut' },
        'trans1to2'
      );
      pinTl.fromTo(
        descsRef.current[0],
        { opacity: 1, y: 0 },
        { opacity: 0, y: -20, duration: 0.9, ease: 'power2.inOut' },
        'trans1to2'
      );
      pinTl.set(blocksRef.current[0], { opacity: 0, pointerEvents: 'none' }, 'trans1to2+=0.8');

      // Text 1 Enters
      pinTl.set(blocksRef.current[1], { opacity: 1, pointerEvents: 'auto' }, 'trans1to2+=0.3');
      pinTl.fromTo(
        titlesRef.current[1],
        { yPercent: 120 },
        { yPercent: 0, duration: 1.0, ease: 'power2.inOut' },
        'trans1to2+=0.3'
      );
      pinTl.fromTo(
        descsRef.current[1],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'power2.inOut' },
        'trans1to2+=0.3'
      );

      // Counter Switch
      pinTl.set(counterRef.current, { textContent: '02 / 03' }, 'trans1to2+=0.6');

      // =======================================================================
      // STEP 3: FLAVOR 2 HOLD (~30% hold so Can 2 stays fully centered)
      // =======================================================================
      pinTl.addLabel('flavor2_hold', '>');
      pinTl.to({}, { duration: 1.4 }, 'flavor2_hold');

      // =======================================================================
      // STEP 4: TRANSITION 2 -> 3 (ZERO SUGAR TO WILD CHERRY)
      // Outgoing Can 1: active -> leaving (yPercent: -120, rotation: -8, opacity: 0)
      // Incoming Can 2: waiting -> active (yPercent: 0, rotation: 0, opacity: 1)
      // =======================================================================
      pinTl.addLabel('trans2to3', '>');

      pinTl.fromTo(
        cansRef.current[1],
        { yPercent: 0, rotation: 0, opacity: 1 },
        {
          yPercent: -120,
          rotation: -FLAVOR_CONFIG.tiltAngle,
          opacity: 0,
          duration: 1.2,
          ease: 'power2.inOut',
        },
        'trans2to3'
      );

      pinTl.fromTo(
        cansRef.current[2],
        { yPercent: 120, rotation: FLAVOR_CONFIG.tiltAngle, opacity: 0 },
        {
          yPercent: 0,
          rotation: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power2.inOut',
        },
        'trans2to3'
      );

      // Section Background & Glow
      pinTl.fromTo(
        sectionRef.current,
        { backgroundColor: FLAVORS_DATA[1].bgColor },
        {
          backgroundColor: FLAVORS_DATA[2].bgColor,
          duration: 1.2,
          ease: 'power2.inOut',
        },
        'trans2to3'
      );

      if (glowRef.current) {
        pinTl.fromTo(
          glowRef.current,
          { background: `radial-gradient(circle, ${FLAVORS_DATA[1].glowColor} 0%, rgba(0,0,0,0) 70%)` },
          {
            background: `radial-gradient(circle, ${FLAVORS_DATA[2].glowColor} 0%, rgba(0,0,0,0) 70%)`,
            duration: 1.2,
            ease: 'power2.inOut',
          },
          'trans2to3'
        );
      }

      // Text 1 Exits
      pinTl.fromTo(
        titlesRef.current[1],
        { yPercent: 0 },
        { yPercent: -120, duration: 0.9, ease: 'power2.inOut' },
        'trans2to3'
      );
      pinTl.fromTo(
        descsRef.current[1],
        { opacity: 1, y: 0 },
        { opacity: 0, y: -20, duration: 0.9, ease: 'power2.inOut' },
        'trans2to3'
      );
      pinTl.set(blocksRef.current[1], { opacity: 0, pointerEvents: 'none' }, 'trans2to3+=0.8');

      // Text 2 Enters
      pinTl.set(blocksRef.current[2], { opacity: 1, pointerEvents: 'auto' }, 'trans2to3+=0.3');
      pinTl.fromTo(
        titlesRef.current[2],
        { yPercent: 120 },
        { yPercent: 0, duration: 1.0, ease: 'power2.inOut' },
        'trans2to3+=0.3'
      );
      pinTl.fromTo(
        descsRef.current[2],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'power2.inOut' },
        'trans2to3+=0.3'
      );

      // Red Pill Button on last flavor only
      if (buttonRef.current) {
        pinTl.fromTo(
          buttonRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          'trans2to3+=0.5'
        );
      }

      // Counter Switch
      pinTl.set(counterRef.current, { textContent: '03 / 03' }, 'trans2to3+=0.6');

      // =======================================================================
      // STEP 5: FLAVOR 3 HOLD (~30% hold so Can 3 stays fully centered)
      // =======================================================================
      pinTl.addLabel('flavor3_hold', '>');
      pinTl.to({}, { duration: 1.4 }, 'flavor3_hold');

      // =======================================================================
      // STEP 6: FINAL RELEASE HOLD (Hold for 10% after last flavor, then release)
      // =======================================================================
      pinTl.addLabel('final_hold', '>');
      pinTl.to({}, { duration: 1.0 }, 'final_hold');
    }, sectionRef);

    // Call ScrollTrigger.refresh() after images load and timeline is built
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [imagesReady, reducedMotion]);

  // ---------------------------------------------------------------------------
  // REDUCED MOTION RENDER: All three flavors stacked in natural flow, no pin
  // ---------------------------------------------------------------------------
  if (reducedMotion) {
    return (
      <section
        id="flavors"
        className="w-full py-24 px-6 flex flex-col gap-24 items-center bg-[#0B0B0F] text-white"
      >
        {FLAVORS_DATA.map((flavor) => (
          <div
            key={flavor.id}
            className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-5xl mx-auto w-full p-8 rounded-3xl"
            style={{ backgroundColor: flavor.bgColor }}
          >
            <div className="h-[50vh] max-h-[420px] flex items-center justify-center">
              <img
                src={flavor.image}
                alt={flavor.name}
                className="h-full w-auto object-contain drop-shadow-2xl"
              />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-md">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/60 mb-2">
                {flavor.number} // FLAVOR
              </span>
              <h2 className="font-pixel text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mb-3">
                {flavor.name}
              </h2>
              <p className="font-sans text-base text-white/80 leading-relaxed font-normal">
                {flavor.tagline}
              </p>
            </div>
          </div>
        ))}
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // STANDARD INTERACTIVE PINNED RENDER
  // ---------------------------------------------------------------------------
  return (
    <section
      ref={sectionRef}
      id="flavors-showcase"
      className="flavor-section"
      style={{ backgroundColor: FLAVORS_DATA[0].bgColor }}
    >
      {/* ===================================================================== */}
      {/* 1. CAN STAGE: 100vh by 100% of container, overflow visible, never clips */}
      {/* ===================================================================== */}
      <div className="flavor-can-stage">
        {/* Ambient Glow behind the centered can */}
        <div
          ref={glowRef}
          className="flavor-ambient-glow"
          style={{
            background: `radial-gradient(circle, ${FLAVORS_DATA[0].glowColor} 0%, rgba(0,0,0,0) 70%)`,
          }}
        />

        {/* Soft ground contact shadow beneath active can position */}
        <div className="flavor-ground-shadow" />

        {/* 3 Can slots: exactly top 50%, left 50%, translate(-50%, -50%) */}
        {FLAVORS_DATA.map((flavor, index) => (
          <div
            key={flavor.id}
            className="flavor-can-item pointer-events-none"
            style={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img
              ref={(el) => (cansRef.current[index] = el)}
              src={flavor.image}
              alt={flavor.name}
              className="h-full w-auto object-contain pointer-events-none select-none"
              style={{
                willChange: 'transform, opacity',
              }}
            />
          </div>
        ))}
      </div>

      {/* ===================================================================== */}
      {/* 2. UI LAYER: Left counter/line & Right flavor copy (sits above stage)  */}
      {/* ===================================================================== */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 h-full flex flex-col md:flex-row items-center justify-between py-12 md:py-0 pointer-events-none">
        
        {/* LEFT SIDE: Counter "01 / 03" & thin vertical progress line */}
        <div className="w-full md:w-1/4 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-6 pointer-events-none order-1">
          <div className="flex items-center gap-2">
            <span
              ref={counterRef}
              className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white/80 font-bold"
            >
              01 / 03
            </span>
          </div>

          <div className="flavor-progress-track hidden md:block">
            <div
              ref={progressBarRef}
              className="flavor-progress-bar"
              style={{ height: '0%' }}
            />
          </div>
        </div>

        {/* CENTER SPACER: Keeps center clear for 70vh can */}
        <div className="w-full md:w-2/4 pointer-events-none order-2 h-[45vh] md:h-auto" />

        {/* RIGHT SIDE: Flavor name in pixel font and description in clean sans */}
        <div className="w-full md:w-1/4 flex flex-col items-center md:items-start text-center md:text-left order-3 relative min-h-[160px] sm:min-h-[180px] justify-center pointer-events-auto">
          {FLAVORS_DATA.map((flavor, index) => (
            <div
              key={flavor.id}
              ref={(el) => (blocksRef.current[index] = el)}
              className="absolute inset-0 flex flex-col justify-center items-center md:items-start"
              style={{
                opacity: index === 0 ? 1 : 0,
                pointerEvents: index === 0 ? 'auto' : 'none',
              }}
            >
              {/* Masked Headline Reveal */}
              <div className="flavor-mask">
                <h2
                  ref={(el) => (titlesRef.current[index] = el)}
                  className="font-pixel text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase select-none leading-[0.95]"
                >
                  {flavor.name}
                </h2>
              </div>

              {/* Description line in clean sans */}
              <p
                ref={(el) => (descsRef.current[index] = el)}
                className="font-sans text-xs sm:text-sm md:text-base text-white/75 font-normal max-w-xs mt-3 leading-relaxed"
              >
                {flavor.tagline}
              </p>

              {/* Red pill button on last flavor only */}
              {index === FLAVORS_DATA.length - 1 && (
                <div className="mt-5 sm:mt-6 overflow-visible">
                  <a
                    ref={buttonRef}
                    href="#flavors"
                    data-no-drag
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#E32934] hover:bg-[#c91e28] text-white font-mono text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 cursor-pointer opacity-0"
                  >
                    <span>FIND YOUR FLAVOR</span>
                    <span>→</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
