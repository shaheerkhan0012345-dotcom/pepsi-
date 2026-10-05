import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Clean Raw Headline HTML (ensures exactly 1 copy of 3 lines on desktop)
 */
const RAW_HEADLINE_HTML = 'WELCOME TO PEPSI<br />WHERE COLD<br />MEETS ELECTRIC';

/**
 * Tunable Configuration for AboutSection Pinned Text Fill Animation
 */
export const ABOUT_CONFIG = {
  // Pinning settings
  pinLength: '+=200%',                  // Scroll distance to stay pinned (200% of viewport height)
  scrubAmount: 0.6,                     // Smooth scrub catch-up time in seconds

  // Text Fill Animation Timing (Normalized 0.0 -> 1.0 pinned duration)
  fillStart: 0.06,                      // Holds unilluminated at 0-6% so user sees section has stopped
  fillEnd: 0.65,                        // Text fill fully completes by 65% of the pinned scroll
  holdEnd: 0.85,                        // Holds completed electric blue state from 65% to 85%
  exitEnd: 1.00,                        // Content & dark background smoothly fade out from 85% to 100%

  // Colors & Aesthetics
  initialColor: '#3a3a44',              // Dim gray starting color for unilluminated letters
  fillColor: '#1E6BFF',                 // Vibrant electric blue color when illuminated
  glowColor: '0 0 24px rgba(30, 107, 255, 0.55)', // Electric blue glow/shadow

  // Supporting Elements
  labelColor: '#9A9AA3',                // 'ABOUT PEPSI' label color
  paragraphColor: '#B8B8C0',            // 40-word brand narrative paragraph color
  paragraphFadeStart: 0.40,             // Paragraph starts fading in at 40% of scroll
  paragraphFadeEnd: 0.65,               // Paragraph fully visible by 65% alongside headline

  // Background and Theming
  bgDark: '#0B0B0F',                    // Near-black section background
  bgLight: '#F2F0EB',                   // Off-white transition background
  grainOpacity: 0.04,                   // 4% film grain opacity
};

export default function AboutSection({ isLoaded = true, isMobile }) {
  const sectionRef = useRef(null);
  const bgLayerRef = useRef(null);
  const contentWrapperRef = useRef(null);
  const labelRef = useRef(null);
  const headlineRef = useRef(null);
  const paragraphRef = useRef(null);

  useLayoutEffect(() => {
    // Wait until loader finishes so Hero pin measurements are in place
    if (isLoaded === false) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let splitInstance = null;
    let isCancelled = false;

    // Ensure DOM is in pristine, single-copy state before GSAP runs
    if (headlineRef.current) {
      headlineRef.current.innerHTML = RAW_HEADLINE_HTML;
    }

    const ctx = gsap.context((self) => {
      // =====================================================================
      // 1. BACKGROUND ENTRY SCRUB & NAVBAR THEME
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

      // Navbar theme toggle: switch to dark mode while inside this section
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 35%',
        end: () => `+=${window.innerHeight * 2.85}`,
        onEnter: () => document.getElementById('main-navbar')?.classList.add('nav-dark'),
        onLeave: () => document.getElementById('main-navbar')?.classList.remove('nav-dark'),
        onEnterBack: () => document.getElementById('main-navbar')?.classList.add('nav-dark'),
        onLeaveBack: () => document.getElementById('main-navbar')?.classList.remove('nav-dark'),
      });

      // =====================================================================
      // 2. PREFERS-REDUCED-MOTION HANDLING
      // =====================================================================
      if (prefersReducedMotion) {
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
        if (isCancelled || self.isReverted || !headlineRef.current || !sectionRef.current) return;

        self.add(() => {
          // Re-verify pristine innerHTML so exactly 1 instance exists (no duplicate text)
          headlineRef.current.innerHTML = RAW_HEADLINE_HTML;

          // Split directly on headlineRef.current with deepSlice: false to prevent duplicate cloning
          splitInstance = new SplitText(headlineRef.current, {
            type: 'words,chars',
            charsClass: 'split-char inline-block select-none',
            wordsClass: 'split-word inline-block whitespace-nowrap',
            deepSlice: false,
          });

          const validChars = splitInstance.chars.filter(
            (c) => c && c.textContent && c.textContent.trim() !== ''
          );

          // All letters start in dim gray (#3a3a44)
          gsap.set(validChars, {
            color: ABOUT_CONFIG.initialColor,
            textShadow: 'none',
          });

          // Master Pinned Timeline: pins when reaching top of viewport
          const pinTl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: ABOUT_CONFIG.pinLength,
              pin: true,
              pinSpacing: true,
              scrub: ABOUT_CONFIG.scrubAmount,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // PHASE A (0.06 -> 0.65): Text animation runs while section is STOPPED (pinned)
          const fillDuration = ABOUT_CONFIG.fillEnd - ABOUT_CONFIG.fillStart;
          const charDuration = 0.035;
          const charStagger = (fillDuration - charDuration) / Math.max(1, validChars.length - 1);

          // Sequential character fill from first to last (fully reversible)
          pinTl.to(
            validChars,
            {
              color: ABOUT_CONFIG.fillColor,
              textShadow: ABOUT_CONFIG.glowColor,
              duration: charDuration,
              stagger: charStagger,
              ease: 'none',
            },
            ABOUT_CONFIG.fillStart
          );

          // Supporting paragraph fades in smoothly alongside headline (0.40 -> 0.65)
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
                duration: ABOUT_CONFIG.paragraphFadeEnd - ABOUT_CONFIG.paragraphFadeStart,
                ease: 'power2.out',
              },
              ABOUT_CONFIG.paragraphFadeStart
            );
          }

          // PHASE B (0.65 -> 0.85): Generous hold buffer:
          // The section STAYS STOPPED (pinned) so the user can clearly see and admire
          // the completed electric blue statement ("it should be seen properly completed")
          pinTl.to({}, { duration: 0.01 }, ABOUT_CONFIG.holdEnd);

          // PHASE C (0.85 -> 1.00): Clean Exit Dissolve:
          // As the pin completes, contentWrapper and bgLayer smoothly fade out to 0.
          // This guarantees that when the section unpins, NO TEXT remains visible or
          // reappears after the section ends!
          if (contentWrapperRef.current) {
            pinTl.to(
              contentWrapperRef.current,
              {
                opacity: 0,
                y: -24,
                duration: ABOUT_CONFIG.exitEnd - ABOUT_CONFIG.holdEnd,
                ease: 'power2.inOut',
              },
              ABOUT_CONFIG.holdEnd
            );
          }

          if (bgLayerRef.current) {
            pinTl.to(
              bgLayerRef.current,
              {
                opacity: 0,
                duration: ABOUT_CONFIG.exitEnd - ABOUT_CONFIG.holdEnd,
                ease: 'power2.inOut',
              },
              ABOUT_CONFIG.holdEnd
            );
          }

          // Recalculate ScrollTrigger measurements with exact rendered typography
          ScrollTrigger.refresh();

          return () => {
            if (splitInstance) {
              splitInstance.revert();
              splitInstance = null;
            }
          };
        });
      });
    }, sectionRef);

    // Refresh ScrollTrigger after Hero pin spacing settles
    const refreshTimer1 = setTimeout(() => ScrollTrigger.refresh(), 150);
    const refreshTimer2 = setTimeout(() => ScrollTrigger.refresh(), 600);

    return () => {
      isCancelled = true;
      clearTimeout(refreshTimer1);
      clearTimeout(refreshTimer2);
      if (splitInstance) {
        splitInstance.revert();
        splitInstance = null;
      }
      if (headlineRef.current) {
        headlineRef.current.innerHTML = RAW_HEADLINE_HTML;
      }
      ctx.revert();
    };
  }, [isLoaded, isMobile]);

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

        {/* Monumental Pixel Headline (Single clean element, strictly 3 lines on desktop) */}
        <div className="w-full mb-6 sm:mb-8">
          <h2
            ref={headlineRef}
            className="font-pixel font-black text-center uppercase tracking-tight select-none w-full max-w-5xl mx-auto"
            style={{
              fontSize: isMobile
                ? 'clamp(1.75rem, 6.4vw, 2.5rem)'
                : 'clamp(2.5rem, 5.2vw, 5.2rem)',
              lineHeight: 1.04,
              wordBreak: 'break-word',
            }}
            dangerouslySetInnerHTML={{ __html: RAW_HEADLINE_HTML }}
          />
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


