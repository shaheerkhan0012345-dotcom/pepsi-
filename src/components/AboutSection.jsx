import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * AboutSection Component
 * Full-viewport dark "About" statement with scroll-driven electric blue wave animation:
 * - Scrubbed background transition: #F2F0EB -> #0B0B0F -> #F2F0EB
 * - Giant monumental pixel headline positioned high for maximum impact
 * - Scroll-driven hover effect: as the user scrolls, a vibrant electric Pepsi blue light wave
 *   sweeps across the letters, illuminating each character into glowing cyan-blue with scale
 *   before settling into brilliant pure white
 * - Interactive cursor hover: hovering any character triggers an instant electric blue glow pop
 * - Supporting label & brand story paragraph
 */
export default function AboutSection({ isMobile }) {
  const sectionRef = useRef(null);
  const bgLayerRef = useRef(null);
  const contentWrapperRef = useRef(null);
  const labelRef = useRef(null);
  const headlineRef = useRef(null);
  const paragraphRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // =====================================================================
      // 1. BACKGROUND TRANSITION & NAVBAR COLOR ADAPTATION
      // =====================================================================
      // As the section enters: scrub from #F2F0EB to near-black #0B0B0F
      gsap.fromTo(
        bgLayerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'top 20%',
            scrub: true,
          },
        }
      );

      // As the section leaves: scrub back from #0B0B0F to off-white #F2F0EB
      gsap.to(bgLayerRef.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'bottom 80%',
          end: 'bottom 15%',
          scrub: true,
        },
      });

      // Navbar theme toggle: add 'nav-dark' class when inside the dark section
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 30%',
        end: 'bottom 30%',
        onEnter: () => document.getElementById('main-navbar')?.classList.add('nav-dark'),
        onLeave: () => document.getElementById('main-navbar')?.classList.remove('nav-dark'),
        onEnterBack: () => document.getElementById('main-navbar')?.classList.add('nav-dark'),
        onLeaveBack: () => document.getElementById('main-navbar')?.classList.remove('nav-dark'),
      });

      // =====================================================================
      // 2. PARALLAX EFFECT
      // =====================================================================
      if (!prefersReducedMotion && contentWrapperRef.current) {
        gsap.to(contentWrapperRef.current, {
          y: isMobile ? 25 : 55,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // =====================================================================
      // 3. HEADLINE SPLITTEXT + SCROLL-DRIVEN BLUE WAVE HOVER EFFECT
      // =====================================================================
      if (headlineRef.current) {
        const split = new SplitText(headlineRef.current, {
          type: 'lines,words,chars',
          linesClass: 'split-line overflow-visible leading-[0.94] pb-1',
          wordsClass: 'split-word inline-block whitespace-nowrap',
          charsClass: 'split-char inline-block transition-transform duration-100 cursor-pointer select-none',
        });

        // 3A. Initial Reveal: characters slide up as section enters
        const enterTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        });

        // Start characters in dim tone (ready for the scroll wave)
        gsap.set(split.chars, {
          color: 'rgba(255, 255, 255, 0.22)',
          textShadow: '0 0 0px rgba(0,0,0,0)',
        });

        enterTl.from(split.chars, {
          yPercent: 110,
          opacity: 0,
          duration: prefersReducedMotion ? 0.35 : 0.65,
          stagger: prefersReducedMotion ? 0 : 0.012,
          ease: 'power3.out',
        });

        // Label and paragraph fade in
        enterTl.fromTo(
          [labelRef.current, paragraphRef.current],
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power2.out',
          },
          '-=0.3'
        );

        // 3B. SCROLL-DRIVEN BLUE WAVE HOVER ANIMATION (Moves with Scroll!)
        // As user scrolls through the section, an electric blue wave travels letter-by-letter
        const validChars = split.chars.filter(
          (c) => c.textContent && c.textContent.trim() !== ''
        );

        const scrollWaveTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 55%',
            end: 'bottom 45%',
            scrub: 1.0,
          },
        });

        validChars.forEach((charEl, idx) => {
          const stepTime = idx * 0.05;

          // 1. Blue Wave Hits: Character illuminates in bright electric blue with intense glow
          scrollWaveTl.to(
            charEl,
            {
              color: '#38bdf8', // Vibrant electric blue
              textShadow:
                '0 0 25px rgba(56, 189, 248, 1), 0 0 50px rgba(10, 77, 163, 0.9), 0 0 80px rgba(10, 77, 163, 0.6)',
              scale: 1.08,
              y: -5,
              duration: 0.35,
              ease: 'power1.inOut',
            },
            stepTime
          );

          // 2. Wave Passes: Settles into crisp brilliant white with soft lingering blue aura
          scrollWaveTl.to(
            charEl,
            {
              color: '#FFFFFF',
              textShadow:
                '0 0 18px rgba(10, 77, 163, 0.45), 0 8px 30px rgba(0, 0, 0, 0.9)',
              scale: 1.0,
              y: 0,
              duration: 0.35,
              ease: 'power1.out',
            },
            stepTime + 0.3
          );
        });

        // 3C. INTERACTIVE MOUSE HOVER EFFECT IN ELECTRIC BLUE
        // Hovering over characters pops them with neon electric blue glow and subtle lift
        validChars.forEach((charEl) => {
          const handleMouseEnter = () => {
            gsap.to(charEl, {
              color: '#38bdf8',
              textShadow:
                '0 0 30px #38bdf8, 0 0 60px #0A4DA3, 0 0 100px #0A4DA3',
              y: -8,
              scale: 1.16,
              duration: 0.2,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          };

          const handleMouseLeave = () => {
            gsap.to(charEl, {
              y: 0,
              scale: 1.0,
              duration: 0.35,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          };

          charEl.addEventListener('mouseenter', handleMouseEnter);
          charEl.addEventListener('mouseleave', handleMouseLeave);
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full min-h-screen flex flex-col justify-start items-center overflow-hidden pt-28 sm:pt-32 md:pt-36 pb-20 px-4 sm:px-8 md:px-12 select-none"
      style={{ backgroundColor: '#F2F0EB' }}
    >
      {/* Background Transition Layer (Scrubbed to #0B0B0F with scroll) */}
      <div
        ref={bgLayerRef}
        id="about-bg-layer"
        className="absolute inset-0 z-0 pointer-events-none opacity-0"
        style={{ backgroundColor: '#0B0B0F' }}
      >
        {/* Faint Film Grain Overlay at 4% opacity over dark background */}
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />

        {/* Dynamic Blue Glow Pulsing behind headline */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[600px] rounded-full bg-[#0A4DA3]/[0.12] blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#38bdf8]/[0.06] blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Container (Shifted high up in viewport for maximum visibility) */}
      <div
        ref={contentWrapperRef}
        className="relative z-10 max-w-6xl w-full mx-auto flex flex-col items-center text-center -translate-y-2 sm:-translate-y-4 md:-translate-y-6"
      >
        {/* Top Label */}
        <div
          ref={labelRef}
          className="mb-4 sm:mb-6 opacity-0"
        >
          <span
            className="font-sans font-semibold uppercase text-xs sm:text-sm tracking-[0.22em] text-[#9A9AA3] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#0A4DA3] animate-pulse" />
            ABOUT PEPSI
            <span className="w-2 h-2 rounded-full bg-[#E32934]" />
          </span>
        </div>

        {/* Monumental Pixel Headline with Scroll-driven Blue Hover Wave */}
        <div className="w-full mb-6 sm:mb-8">
          <h2
            ref={headlineRef}
            className="font-pixel font-black text-center uppercase tracking-tight"
            style={{
              fontSize: 'clamp(3.2rem, 7.8vw, 8.2rem)',
              lineHeight: 0.94,
              wordBreak: 'break-word',
            }}
          >
            WELCOME TO PEPSI <br className="hidden sm:inline" />
            WHERE COLD <br className="hidden sm:inline" />
            MEETS ELECTRIC
          </h2>
        </div>

        {/* Brand Story Paragraph */}
        <div
          ref={paragraphRef}
          className="max-w-[640px] opacity-0 mx-auto px-4"
        >
          <p className="font-sans text-base sm:text-lg md:text-xl text-[#C8C8D2] leading-relaxed font-normal">
            Born in 1898 from a bold North Carolina apothecary, Pepsi revolutionized
            modern refreshment. Today, we push boundaries at the intersection of raw
            sonic energy, street culture, and ice-cold fizz—engineered for those who
            refuse to stay still and thirst for what's next.
          </p>
        </div>

        {/* Bottom Feature Pill */}
        <div className="mt-8 sm:mt-12 inline-flex items-center gap-4 text-xs font-mono tracking-widest text-[#9A9AA3] uppercase border-t border-white/10 pt-4">
          <span className="text-[#38bdf8] font-bold">EST. 1898</span>
          <span>•</span>
          <span>SCROLL TO ILLUMINATE</span>
          <span>•</span>
          <span className="text-[#E32934] font-bold">ICE-COLD CORE</span>
        </div>
      </div>
    </section>
  );
}
