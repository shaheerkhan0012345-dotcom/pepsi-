import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Tunable Configuration for AboutSection Pinned Text Fill Animation
 */
export const ABOUT_CONFIG = {
  // Pinning settings
  pinLength: '+=200%',                  // Scroll distance to stay pinned (200% of viewport height)
  scrubAmount: 0.6,                     // Smooth scrub catch-up time in seconds

  // Text Fill Animation
  initialColor: '#3a3a44',              // Dim gray starting color for unilluminated letters
  fillColor: '#1E6BFF',                 // Vibrant electric blue color when illuminated
  glowColor: '0 0 24px rgba(30, 107, 255, 0.55)', // Electric blue glow/shadow
  charDuration: 0.04,                   // Duration of color transition per character
  charStagger: 0.027,                   // Stagger time between consecutive characters

  // Supporting Elements
  labelColor: '#9A9AA3',                // 'ABOUT PEPSI' label color
  paragraphColor: '#B8B8C0',            // 40-word brand narrative paragraph color
  paragraphFadeThreshold: 0.70,         // Scroll progress (70%) where paragraph begins fading in
  paragraphFadeDuration: 0.25,          // Fade-in duration of the paragraph

  // Background and Theming
  bgDark: '#0B0B0F',                    // Near-black section background
  bgLight: '#F2F0EB',                   // Off-white transition background
  grainOpacity: 0.04,                   // 4% film grain opacity
};

export default function AboutSection({ isMobile }) {
  const sectionRef = useRef(null);
  const bgLayerRef = useRef(null);
  const contentWrapperRef = useRef(null);
  const labelRef = useRef(null);
  const headlineRef = useRef(null);
  const paragraphRef = useRef(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let splitInstance = null;

    const ctx = gsap.context((self) => {
      // =====================================================================
      // 1. BACKGROUND SCRUB TRANSITIONS & NAVBAR THEME
      // =====================================================================
      // Entry: scrub from off-white (#F2F0EB) to near-black (#0B0B0F)
      gsap.fromTo(
        bgLayerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        }
      );

      // Exit: scrub back from near-black (#0B0B0F) to off-white (#F2F0EB)
      gsap.to(bgLayerRef.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'bottom bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Navbar theme toggle: switch to dark mode while inside this section
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 35%',
        end: 'bottom 20%',
        onEnter: () => document.getElementById('main-navbar')?.classList.add('nav-dark'),
        onLeave: () => document.getElementById('main-navbar')?.classList.remove('nav-dark'),
        onEnterBack: () => document.getElementById('main-navbar')?.classList.add('nav-dark'),
        onLeaveBack: () => document.getElementById('main-navbar')?.classList.remove('nav-dark'),
      });

      // =====================================================================
      // 2. PREFERS-REDUCED-MOTION HANDLING
      // =====================================================================
      if (prefersReducedMotion) {
        // Show headline fully blue with no pin or scroll animations
        if (headlineRef.current) {
          gsap.set(headlineRef.current, {
            color: ABOUT_CONFIG.fillColor,
            textShadow: ABOUT_CONFIG.glowColor,
          });
        }
        if (labelRef.current) gsap.set(labelRef.current, { opacity: 1, y: 0 });
        if (paragraphRef.current) gsap.set(paragraphRef.current, { opacity: 1, y: 0 });
        if (bgLayerRef.current) gsap.set(bgLayerRef.current, { opacity: 1 });
        return;
      }

      // =====================================================================
      // 3. SUPPORTING LABEL ENTRANCE ANIMATION
      // =====================================================================
      if (labelRef.current) {
        gsap.fromTo(
          labelRef.current,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // =====================================================================
      // 4. FONT-READY SPLITTEXT & PINNED BLUE FILL ANIMATION
      // =====================================================================
      document.fonts.ready.then(() => {
        // Guard against race conditions if unmounted while fonts were loading
        if (self.isReverted || !headlineRef.current || !sectionRef.current) return;

        self.add(() => {
          // Split each line into words and characters to strictly preserve 3 desktop lines
          const lineElements = headlineRef.current.querySelectorAll('.headline-line');
          splitInstance = new SplitText(lineElements, {
            type: 'words,chars',
            charsClass: 'split-char inline-block select-none',
            wordsClass: 'split-word inline-block whitespace-nowrap',
          });

          const validChars = splitInstance.chars.filter(
            (c) => c && c.textContent && c.textContent.trim() !== ''
          );

          // All letters start in dim gray (#3a3a44)
          gsap.set(validChars, {
            color: ABOUT_CONFIG.initialColor,
            textShadow: 'none',
          });

          // Master Pinned Timeline: pins for +=200% of viewport height
          const pinTl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: ABOUT_CONFIG.pinLength,
              pin: true,
              pinSpacing: true,
              scrub: ABOUT_CONFIG.scrubAmount,
              invalidateOnRefresh: true,
            },
          });

          // Calculate stagger dynamically so by the time the pin ends (at 1.0), every letter is blue
          const totalDuration = 1.0;
          const charDuration = ABOUT_CONFIG.charDuration;
          const calculatedStagger =
            (totalDuration - charDuration) / Math.max(1, validChars.length - 1);

          // Sequential character fill from first to last (fully reversible)
          pinTl.to(
            validChars,
            {
              color: ABOUT_CONFIG.fillColor,
              textShadow: ABOUT_CONFIG.glowColor,
              duration: charDuration,
              stagger: calculatedStagger,
              ease: 'none',
            },
            0
          );

          // Supporting paragraph fades in around 70% of the pinned scroll
          if (paragraphRef.current) {
            pinTl.fromTo(
              paragraphRef.current,
              {
                opacity: 0,
                y: 18,
              },
              {
                opacity: 1,
                y: 0,
                duration: ABOUT_CONFIG.paragraphFadeDuration,
                ease: 'power2.out',
              },
              ABOUT_CONFIG.paragraphFadeThreshold
            );
          }

          // Recalculate ScrollTrigger measurements with exact rendered typography
          ScrollTrigger.refresh();

          // SplitText cleanup hook
          return () => {
            if (splitInstance) {
              splitInstance.revert();
              splitInstance = null;
            }
          };
        });
      });
    }, sectionRef);

    return () => {
      if (splitInstance) {
        splitInstance.revert();
        splitInstance = null;
      }
      ctx.revert();
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full h-screen min-h-screen flex flex-col justify-center items-center overflow-hidden px-4 sm:px-8 md:px-12 select-none"
      style={{ backgroundColor: ABOUT_CONFIG.bgLight }}
    >
      {/* Background Transition Layer (Scrubbed to #0B0B0F with scroll) */}
      <div
        ref={bgLayerRef}
        id="about-bg-layer"
        className="absolute inset-0 z-0 pointer-events-none opacity-0"
        style={{ backgroundColor: ABOUT_CONFIG.bgDark }}
      >
        {/* Faint Film Grain Overlay at 4% opacity over dark background */}
        <div
          className="absolute inset-0 bg-grain pointer-events-none"
          style={{ opacity: ABOUT_CONFIG.grainOpacity }}
        />

        {/* Subtle Electric Blue Ambient Light behind headline */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[520px] rounded-full bg-[#1E6BFF]/[0.07] blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Container (Centered in 100vh) */}
      <div
        ref={contentWrapperRef}
        className="relative z-10 max-w-5xl w-full mx-auto flex flex-col items-center text-center"
      >
        {/* Small Label above headline */}
        <div ref={labelRef} className="mb-5 sm:mb-7 opacity-0">
          <span
            className="font-sans font-semibold uppercase text-xs sm:text-sm tracking-[0.2em] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ color: ABOUT_CONFIG.labelColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E6BFF] animate-pulse" />
            ABOUT PEPSI
            <span className="w-1.5 h-1.5 rounded-full bg-[#E32934]" />
          </span>
        </div>

        {/* Monumental Pixel Headline (3 lines on desktop) */}
        <div className="w-full mb-6 sm:mb-8">
          <h2
            ref={headlineRef}
            className="font-pixel font-black text-center uppercase tracking-tight select-none"
            style={{
              fontSize: isMobile
                ? 'clamp(1.75rem, 6.4vw, 2.5rem)'
                : 'clamp(2.5rem, 5.2vw, 5.2rem)',
              lineHeight: 1.02,
              wordBreak: 'break-word',
            }}
          >
            <span className="headline-line block">WELCOME TO PEPSI</span>
            <span className="headline-line block">WHERE COLD</span>
            <span className="headline-line block">MEETS ELECTRIC</span>
          </h2>
        </div>

        {/* Supporting Paragraph (~40 words, max-width 560px, color #B8B8C0) */}
        <div
          ref={paragraphRef}
          className="max-w-[560px] mx-auto px-4 opacity-0"
        >
          <p
            className="font-sans text-sm sm:text-base md:text-lg leading-relaxed font-normal text-center"
            style={{ color: ABOUT_CONFIG.paragraphColor }}
          >
            Born in 1898 from a bold apothecary, Pepsi revolutionized modern refreshment.
            Today, we stand at the vibrant intersection of raw sonic energy, street culture,
            and ice-cold fizz—engineered for those who refuse to stay still and thirst for what's next.
          </p>
        </div>
      </div>
    </section>
  );
}

