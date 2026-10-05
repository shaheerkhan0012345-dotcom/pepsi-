import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * AboutSection Component
 * Full-viewport dark "About" statement directly after Section 2.
 * - Scrubbed background transition: #F2F0EB -> #0B0B0F -> #F2F0EB
 * - Floating navbar adapts smoothly to dark mode
 * - "ABOUT PEPSI" label in Space Grotesk
 * - "WELCOME TO PEPSI WHERE COLD MEETS ELECTRIC" pixel headline with SplitText masked reveal & pixel glyph flicker
 * - 40-word brand story paragraph
 * - Subtle parallax & faint film grain overlay
 * - Full support for prefers-reduced-motion
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
          y: isMobile ? 35 : 75,
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
      // 3. HEADLINE SPLITTEXT & REVEAL ANIMATION
      // =====================================================================
      if (headlineRef.current) {
        // Use SplitText on the headline
        const split = new SplitText(headlineRef.current, {
          type: 'lines,chars',
          linesClass: 'split-line overflow-hidden leading-[1.05]',
          charsClass: 'split-char inline-block',
        });

        // Trigger entrance when section enters view
        const enterTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        });

        // Masked slide-up for characters
        enterTl.from(split.chars, {
          yPercent: 120,
          opacity: 0,
          duration: prefersReducedMotion ? 0.4 : 0.75,
          stagger: prefersReducedMotion ? 0 : 0.015,
          ease: 'power3.out',
        });

        // Optional Pixel Flicker Effect (skipped on reduced motion)
        if (!prefersReducedMotion) {
          const pixelGlyphs = ['█', '░', '▒', '▓', '#', '$', '%', '*', '+', '?', '0', '1', 'X', 'Z'];

          split.chars.forEach((charEl, idx) => {
            const originalChar = charEl.textContent;
            if (originalChar === ' ' || !originalChar.trim()) return;

            // Trigger flicker slightly before or as character slides in
            const flickerDelay = 0.1 + idx * 0.014;
            const flickerDuration = 0.38; // ~0.4s
            let step = 0;
            const maxSteps = 4;

            enterTl.add(() => {
              const interval = setInterval(() => {
                step++;
                if (step >= maxSteps) {
                  clearInterval(interval);
                  charEl.textContent = originalChar;
                } else {
                  charEl.textContent =
                    pixelGlyphs[Math.floor(Math.random() * pixelGlyphs.length)];
                }
              }, (flickerDuration * 1000) / maxSteps);
            }, flickerDelay);
          });
        }

        // 4. Label and paragraph fade in after the headline with upward move
        enterTl.fromTo(
          [labelRef.current, paragraphRef.current],
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
          },
          '-=0.4'
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-24 px-6 sm:px-12 select-none"
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

        {/* Subtle Ambient Brand Glows */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#0A4DA3]/[0.05] blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[#E32934]/[0.04] blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Container (Centered single column with subtle parallax) */}
      <div
        ref={contentWrapperRef}
        className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center px-4"
      >
        {/* Top Label */}
        <div
          ref={labelRef}
          className="mb-6 opacity-0"
        >
          <span
            className="font-sans font-medium uppercase text-xs sm:text-sm tracking-[0.2em] text-[#9A9AA3] inline-flex items-center gap-2.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A4DA3]" />
            ABOUT PEPSI
            <span className="w-1.5 h-1.5 rounded-full bg-[#E32934]" />
          </span>
        </div>

        {/* Big Pixel Headline (Fits in 3 lines on desktop, clamp(2.5rem, 6vw, 6rem), line-height 1.05) */}
        <div className="w-full mb-8">
          <h2
            ref={headlineRef}
            className="font-pixel font-bold text-[#F2F0EB] text-center uppercase tracking-tight"
            style={{
              fontSize: 'clamp(2.5rem, 5.8vw, 6rem)',
              lineHeight: 1.05,
              wordBreak: 'break-word',
            }}
          >
            WELCOME TO PEPSI <br className="hidden sm:inline" />
            WHERE COLD <br className="hidden sm:inline" />
            MEETS ELECTRIC
          </h2>
        </div>

        {/* Brand Story Paragraph (max-width 560px, centered, Space Grotesk, color #B8B8C0, ~40 words) */}
        <div
          ref={paragraphRef}
          className="max-w-[560px] opacity-0 mx-auto"
        >
          <p className="font-sans text-sm sm:text-base md:text-lg text-[#B8B8C0] leading-relaxed font-normal">
            Born in 1898 from a bold North Carolina apothecary, Pepsi revolutionized
            modern refreshment. Today, we push boundaries at the intersection of raw
            sonic energy, street culture, and ice-cold fizz—engineered for those who
            refuse to stay still and thirst for what's next.
          </p>
        </div>

        {/* Small Bottom Accent Pill */}
        <div className="mt-10 inline-flex items-center gap-4 text-[10px] font-mono tracking-widest text-[#9A9AA3]/60 uppercase border-t border-white/10 pt-4">
          <span>SINCE 1898</span>
          <span>•</span>
          <span>ELECTRIC REFRESHMENT</span>
          <span>•</span>
          <span>COLD AT CORE</span>
        </div>
      </div>
    </section>
  );
}
