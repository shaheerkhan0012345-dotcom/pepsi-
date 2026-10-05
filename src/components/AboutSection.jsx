import React, { useEffect, useRef } from 'react';
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
  // Temporary debug flag to see ScrollTrigger start and end lines
  markers: false,

  // Pinning settings
  pinLength: '+=250%',                  // Pinned scroll distance (250% of viewport height)
  scrubAmount: 1,                       // Smooth scrub catch-up time in seconds (scrub: 1)

  // Text Fill Animation Timing (Normalized 0.0 -> 1.0 pinned duration)
  fillStart: 0.05,                      // Blue fill begins at 5% of pinned scroll
  fillEnd: 0.80,                        // Blue fill completes fully by 80% of the pin
  holdEnd: 1.00,                        // Empty hold from 80% to 100% so fully blue headline stays on screen for ~20% of scroll before release

  // Colors & Aesthetics on White Background
  initialColor: '#C4C4CD',              // Soft dim gray starting color for unilluminated letters on white
  fillColor: '#1E6BFF',                 // Vibrant electric blue color when illuminated
  glowColor: '0 0 24px rgba(30, 107, 255, 0.40)', // Electric blue luminous aura

  // Supporting Elements
  labelColor: '#6B6B78',                // 'ABOUT PEPSI' label color
  paragraphColor: '#383844',            // Crisp readable brand narrative paragraph color
  paragraphFadeStart: 0.35,             // Paragraph starts fading in at 35% of scroll
  paragraphFadeEnd: 0.75,               // Paragraph fully visible by 75% alongside headline

  // Background Settings
  bgColor: '#F2F0EB',                   // Warm off-white / white background matching site
  grainOpacity: 0.03,                   // 3% subtle film grain
};

export default function AboutSection({ isLoaded = true, isMobile }) {
  const sectionRef = useRef(null);
  const contentWrapperRef = useRef(null);
  const labelRef = useRef(null);
  const headlineRef = useRef(null);
  const paragraphRef = useRef(null);

  useEffect(() => {
    if (!isLoaded) return;
    let splitInstance = null;

    const ctx = gsap.context(() => {
      if (!headlineRef.current || !sectionRef.current) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 1. Reset inner HTML to clean text
      headlineRef.current.innerHTML = RAW_HEADLINE_HTML;

      // 2. Reduce motion handling: show fully blue with no pin
      if (prefersReducedMotion) {
        gsap.set(headlineRef.current, {
          color: ABOUT_CONFIG.fillColor,
          textShadow: ABOUT_CONFIG.glowColor,
        });
        if (labelRef.current) gsap.set(labelRef.current, { opacity: 1, y: 0 });
        if (paragraphRef.current) gsap.set(paragraphRef.current, { opacity: 1, y: 0 });
        return;
      }

      // 3. Create SplitText cleanly on headline
      splitInstance = new SplitText(headlineRef.current, {
        type: 'words,chars',
        charsClass: 'split-char inline-block select-none',
        wordsClass: 'split-word inline-block whitespace-nowrap',
        deepSlice: false,
      });

      const validChars = splitInstance.chars.filter(
        (c) => c && c.textContent && c.textContent.trim() !== ''
      );

      // Start all characters in soft unilluminated gray on white (#C4C4CD)
      gsap.set(validChars, {
        color: ABOUT_CONFIG.initialColor,
        textShadow: 'none',
      });

      // 4. MASTER PINNED TIMELINE: SECTION FIRMLY STICKS (PINS) AT TOP TOP!
      // Created synchronously in page order, with pinSpacing: true, anticipatePin: 1
      const pinTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: ABOUT_CONFIG.pinLength,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: ABOUT_CONFIG.scrubAmount,
          invalidateOnRefresh: true,
          markers: ABOUT_CONFIG.markers,
        },
      });

      // Supporting label entrance as section pins
      if (labelRef.current) {
        pinTl.fromTo(
          labelRef.current,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.08,
            ease: 'power2.out',
          },
          0
        );
      }

      // PHASE A (0.05 -> 0.80): Letters fill with electric blue (#1E6BFF) while section is stuck
      const fillDuration = ABOUT_CONFIG.fillEnd - ABOUT_CONFIG.fillStart;
      const charDuration = 0.04;
      const charStagger = (fillDuration - charDuration) / Math.max(1, validChars.length - 1);

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

      // Supporting paragraph fades in smoothly alongside headline (0.35 -> 0.75)
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

      // PHASE B (0.80 -> 1.00): EMPTY HOLD (~20% of the pinned scroll)
      // Fully blue headline stays firmly on screen before the pin releases
      pinTl.to({}, { duration: ABOUT_CONFIG.holdEnd - ABOUT_CONFIG.fillEnd }, ABOUT_CONFIG.fillEnd);
    }, sectionRef);

    // Refresh ScrollTrigger after fonts load and on window load
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
      style={{ backgroundColor: ABOUT_CONFIG.bgColor }}
    >
      {/* Background Ambience: Faint noise grain + soft radial electric blue glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 bg-grain pointer-events-none"
          style={{ opacity: ABOUT_CONFIG.grainOpacity }}
        />
        {/* Soft atmospheric Pepsi blue glow centered behind headline */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[520px] rounded-full bg-[#1E6BFF]/[0.06] blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Container (Centered in 100vh) */}
      <div
        ref={contentWrapperRef}
        className="relative z-10 max-w-5xl w-full mx-auto flex flex-col items-center text-center"
      >
        {/* Small Label above headline */}
        <div ref={labelRef} className="mb-5 sm:mb-7 opacity-0">
          <span
            className="font-sans font-semibold uppercase text-xs sm:text-sm tracking-[0.2em] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/10 bg-black/[0.03] backdrop-blur-sm"
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

        {/* Supporting Paragraph (~40 words, max-width 560px, crisp readable dark text on white) */}
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



