import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Footer.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * =============================================================================
 * TUNABLE CONFIGURATION FOR SECTION 7: FOOTER
 * All visual settings, animation speeds, colors, and wave dimensions in one place.
 * =============================================================================
 */
export const FOOTER_CONFIG = {
  // Debug flag to view ScrollTrigger markers
  markers: false,

  // Colors
  previousBgColor: '#F2F0EB', // Background of Section 6 (Moments)
  bgColor: '#0B0B0F',         // Near-black footer background
  colaColorDark: '#120603',   // Deep dark cola body
  colaColorMid: '#2a120b',    // Rich dark cola center
  colaColorLight: '#4e2012',  // Warmer amber/caramel top liquid edge
  foamColor: '#F2F0EB',       // Pale foam line
  strokeColor: '#F2F0EB',     // Wordmark letter outline
  strokeWidth: 1.5,           // Letter outline thickness

  // Wave dynamics
  waveSpeed1: 1.8,            // Primary wave horizontal drift
  waveSpeed2: 2.7,            // Secondary wave interference drift
  waveHeight1: 7.5,           // Primary wave amplitude (px in SVG space)
  waveHeight2: 4.5,           // Secondary wave amplitude (px in SVG space)

  // Bubble settings
  bubbleCountDesktop: 22,
  bubbleCountMobile: 10,

  // Scroll scrub smoothness
  scrubDuration: 1.5,
};

export default function Footer({ isLoaded = true, isMobile = false }) {
  const footerRef = useRef(null);
  const topAreaRef = useRef(null);
  const svgRef = useRef(null);
  const liquidPathRef = useRef(null);
  const foamPathRef = useRef(null);
  const bubblesGroupRef = useRef(null);

  const [reducedMotion, setReducedMotion] = useState(false);

  // Animated values
  const fillProgressRef = useRef({ value: 0 });
  const hasRevealedTopRef = useRef(false);
  const isInViewRef = useRef(false);
  const rafIdRef = useRef(null);

  // Mouse ripple state (desktop only)
  const rippleRef = useRef({
    x: 500,
    strength: 0,
    phase: 0,
  });

  // Bubbles array
  const bubblesRef = useRef([]);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize bubbles
  useEffect(() => {
    const count = isMobile ? FOOTER_CONFIG.bubbleCountMobile : FOOTER_CONFIG.bubbleCountDesktop;
    const bubbles = [];

    for (let i = 0; i < count; i++) {
      bubbles.push({
        x: 80 + Math.random() * 840,
        y: 220 + Math.random() * 80,
        radius: 2 + Math.random() * 4, // 2 to 6px
        speed: 0.5 + Math.random() * 1.3,
        wobbleSpeed: 2 + Math.random() * 3,
        wobblePhase: Math.random() * Math.PI * 2,
        baseOpacity: 0.2 + Math.random() * 0.35,
      });
    }

    bubblesRef.current = bubbles;
  }, [isMobile]);

  // Master GSAP ScrollTrigger Setup
  useEffect(() => {
    if (!isLoaded) return;

    let scrollTl = null;

    const ctx = gsap.context(() => {
      if (!footerRef.current) return;

      // In reduced motion mode, show fully filled and reveal top area
      if (reducedMotion) {
        fillProgressRef.current.value = 1;
        if (topAreaRef.current) {
          gsap.set(topAreaRef.current, { opacity: 1, y: 0 });
        }
        return;
      }

      // 1. Master ScrollTrigger Timeline
      // Start as wordmark approaches viewport, finish before hitting the absolute bottom
      scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 70%',
          end: 'bottom bottom',
          scrub: FOOTER_CONFIG.scrubDuration,
          invalidateOnRefresh: true,
          markers: FOOTER_CONFIG.markers,
          onEnter: () => {
            isInViewRef.current = true;
          },
          onLeave: () => {
            isInViewRef.current = false;
          },
          onEnterBack: () => {
            isInViewRef.current = true;
          },
          onLeaveBack: () => {
            isInViewRef.current = false;
          },
          onUpdate: (self) => {
            const currentProgress = fillProgressRef.current.value;

            // When liquid fill reaches ~100%, trigger top area reveal
            if (currentProgress >= 0.94 && !hasRevealedTopRef.current) {
              hasRevealedTopRef.current = true;
              if (topAreaRef.current) {
                gsap.to(topAreaRef.current, {
                  opacity: 1,
                  y: 0,
                  duration: 1.2,
                  ease: 'power2.out',
                  overwrite: 'auto',
                });
              }
            } else if (currentProgress < 0.85 && hasRevealedTopRef.current) {
              hasRevealedTopRef.current = false;
              if (topAreaRef.current) {
                gsap.to(topAreaRef.current, {
                  opacity: 0,
                  y: 20,
                  duration: 0.8,
                  ease: 'power2.out',
                  overwrite: 'auto',
                });
              }
            }
          },
        },
      });

      // A. Smooth background fade from previous section (#F2F0EB) to #0B0B0F over the first 10%
      scrollTl.fromTo(
        footerRef.current,
        { backgroundColor: FOOTER_CONFIG.previousBgColor },
        {
          backgroundColor: FOOTER_CONFIG.bgColor,
          duration: 0.1,
          ease: 'power2.out',
        },
        0
      );

      // B. Liquid fill rises from 0% to 100% of letter height over 0% -> 85% of scroll,
      // with a short hold at 100% from 85% -> 100% before the user hits the bottom.
      scrollTl.fromTo(
        fillProgressRef.current,
        { value: 0 },
        {
          value: 1,
          duration: 0.85,
          ease: 'none',
        },
        0
      );

      // Empty hold for the remaining 15% of scroll
      scrollTl.to({}, { duration: 0.15 }, 0.85);
    }, footerRef);

    // Refresh ScrollTrigger once fonts are ready
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      ctx.revert();
    };
  }, [isLoaded, reducedMotion]);

  // RequestAnimationFrame Animation Loop (Only active while footer is in view)
  useEffect(() => {
    if (reducedMotion) {
      // Draw static full fill
      if (liquidPathRef.current) {
        liquidPathRef.current.setAttribute('d', 'M 0 280 L 0 30 L 1000 30 L 1000 280 Z');
      }
      if (foamPathRef.current) {
        foamPathRef.current.setAttribute('d', 'M 0 30 L 1000 30');
      }
      return;
    }

    let isRunning = true;
    let startTime = performance.now();

    const animate = (currentTime) => {
      if (!isRunning) return;

      if (isInViewRef.current) {
        const time = (currentTime - startTime) * 0.001;
        const progress = fillProgressRef.current.value;

        // Letter bounds in SVG viewBox (0 0 1000 240)
        // Baseline y = 185, font-size 210
        // Bottom of letters ≈ 205, Top of letters ≈ 40
        const bottomY = 220;
        const topY = 25;
        const currentFillY = bottomY - progress * (bottomY - topY);

        // Update Mouse Ripple decay
        if (!isMobile && rippleRef.current.strength > 0.01) {
          rippleRef.current.strength *= 0.94;
          rippleRef.current.phase += 0.2;
        } else {
          rippleRef.current.strength = 0;
        }

        // Generate Wavy Path using two sine waves + mouse ripple
        const points = [];
        const step = 12;
        const width = 1000;

        for (let x = 0; x <= width; x += step) {
          const w1 = Math.sin(x * 0.014 + time * FOOTER_CONFIG.waveSpeed1) * FOOTER_CONFIG.waveHeight1;
          const w2 = Math.sin(x * 0.026 + time * FOOTER_CONFIG.waveSpeed2) * FOOTER_CONFIG.waveHeight2;

          let rip = 0;
          if (!isMobile && rippleRef.current.strength > 0.05) {
            const dx = x - rippleRef.current.x;
            const spread = 85;
            rip =
              rippleRef.current.strength *
              Math.exp(-(dx * dx) / (2 * spread * spread)) *
              Math.cos(dx * 0.08 - rippleRef.current.phase);
          }

          const y = currentFillY + w1 + w2 + rip;
          points.push({ x, y });
        }

        // Build SVG Liquid and Foam Path commands
        let liquidD = `M 0 260 L 0 ${points[0].y.toFixed(1)}`;
        let foamD = `M 0 ${points[0].y.toFixed(1)}`;

        for (let i = 1; i < points.length; i++) {
          liquidD += ` L ${points[i].x} ${points[i].y.toFixed(1)}`;
          foamD += ` L ${points[i].x} ${points[i].y.toFixed(1)}`;
        }

        liquidD += ` L ${width} 260 Z`;

        if (liquidPathRef.current) {
          liquidPathRef.current.setAttribute('d', liquidD);
        }

        if (foamPathRef.current) {
          foamPathRef.current.setAttribute('d', foamD);
          // Only show foam line if liquid has started filling
          foamPathRef.current.style.opacity = progress > 0.02 ? FOOTER_CONFIG.foamOpacity : 0;
        }

        // Update Bubbles (rising, clipped to text, and only visible in liquid)
        if (bubblesGroupRef.current) {
          const bubbleElements = bubblesGroupRef.current.children;
          const bubbles = bubblesRef.current;

          for (let i = 0; i < bubbles.length; i++) {
            const b = bubbles[i];
            const el = bubbleElements[i];
            if (!el) continue;

            // Rise upwards
            b.y -= b.speed;
            const wobble = Math.sin(time * b.wobbleSpeed + b.wobblePhase) * 0.6;
            const currentX = b.x + wobble;

            // If bubble reaches surface wave, recycle to bottom
            if (b.y < currentFillY + 6) {
              b.y = 220 + Math.random() * 40;
              b.x = 80 + Math.random() * 840;
            }

            el.setAttribute('cx', currentX.toFixed(1));
            el.setAttribute('cy', b.y.toFixed(1));

            // Only show bubbles if they are below the current liquid line and liquid is present
            const isSubmerged = b.y > currentFillY + 2 && progress > 0.05;
            el.setAttribute('opacity', isSubmerged ? b.baseOpacity : 0);
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [reducedMotion, isMobile]);

  // Handle Desktop Mouse Interaction (creates soft wave ripple)
  const handleWordmarkMouseMove = (e) => {
    if (isMobile || reducedMotion || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const svgX = Math.max(0, Math.min(1000, relX * 1000));

    rippleRef.current.x = svgX;
    rippleRef.current.strength = Math.min(rippleRef.current.strength + 3.5, 16);
  };

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="pepsi-footer"
      style={{ backgroundColor: FOOTER_CONFIG.bgColor }}
    >
      <div className="footer-grain" />

      {/* ===================================================================== */}
      {/* TOP AREA: Label, Pixel Headline, and Red Pill Button                   */}
      {/* ===================================================================== */}
      <div ref={topAreaRef} className="footer-top-area">
        <span className="footer-label">NEXT SIP</span>
        <h2 className="footer-headline">REFRESH THE FUTURE.</h2>
        <a href="#flavors" className="footer-cta-btn">
          FIND YOUR FLAVOR
        </a>
      </div>

      {/* ===================================================================== */}
      {/* MIDDLE AREA: Navigation and Social Placeholders                        */}
      {/* ===================================================================== */}
      <div className="footer-middle-area">
        <nav className="footer-links-row">
          <a href="#home" className="footer-link">Home</a>
          <a href="#about" className="footer-link">About</a>
          <a href="#flavors" className="footer-link">Flavors</a>
          <a href="#moments" className="footer-link">Moments</a>
        </nav>

        <div className="footer-social-row">
          <a href="#" className="footer-social-link" aria-label="Instagram">INSTAGRAM</a>
          <span className="text-[#9A9AA3]/30 text-xs">//</span>
          <a href="#" className="footer-social-link" aria-label="TikTok">TIKTOK</a>
          <span className="text-[#9A9AA3]/30 text-xs">//</span>
          <a href="#" className="footer-social-link" aria-label="X Twitter">X / TWITTER</a>
          <span className="text-[#9A9AA3]/30 text-xs">//</span>
          <a href="#" className="footer-social-link" aria-label="YouTube">YOUTUBE</a>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BOTTOM AREA: Giant SVG Wordmark with Cola Liquid Fill Effect          */}
      {/* ===================================================================== */}
      <div className="footer-wordmark-area">
        <svg
          ref={svgRef}
          viewBox="0 0 1000 240"
          className="pepsi-wordmark-svg"
          onMouseMove={handleWordmarkMouseMove}
        >
          <defs>
            {/* SVG ClipPath made from "PEPSI" text in pixel font */}
            <clipPath id="pepsi-text-clip">
              <text
                x="500"
                y="185"
                textAnchor="middle"
                fontFamily="'Pixelify Sans', 'Doto', monospace"
                fontSize="215"
                fontWeight="700"
                letterSpacing="0.04em"
              >
                PEPSI
              </text>
            </clipPath>

            {/* Rich Cola Gradient: Dark cola base with lighter caramel top edge */}
            <linearGradient id="cola-liquid-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={FOOTER_CONFIG.colaColorLight} />
              <stop offset="12%" stopColor={FOOTER_CONFIG.colaColorMid} />
              <stop offset="100%" stopColor={FOOTER_CONFIG.colaColorDark} />
            </linearGradient>
          </defs>

          {/* Letter outline only: 1.5px stroke, transparent fill */}
          <text
            x="500"
            y="185"
            textAnchor="middle"
            fontFamily="'Pixelify Sans', 'Doto', monospace"
            fontSize="215"
            fontWeight="700"
            letterSpacing="0.04em"
            fill="transparent"
            stroke={FOOTER_CONFIG.strokeColor}
            strokeWidth={FOOTER_CONFIG.strokeWidth}
          >
            PEPSI
          </text>

          {/* Liquid Fill, Foam Line, and Rising Bubbles: Clipped to text */}
          <g clipPath="url(#pepsi-text-clip)">
            {/* Liquid Wavy Body */}
            <path ref={liquidPathRef} fill="url(#cola-liquid-grad)" />

            {/* Foam line right at wave crest */}
            <path
              ref={foamPathRef}
              fill="none"
              stroke={FOOTER_CONFIG.foamColor}
              strokeWidth="2.5"
              strokeOpacity={FOOTER_CONFIG.foamOpacity}
              strokeLinecap="round"
            />

            {/* Bubbles */}
            <g ref={bubblesGroupRef}>
              {bubblesRef.current.map((b, idx) => (
                <circle
                  key={idx}
                  cx={b.x}
                  cy={b.y}
                  r={b.radius}
                  fill="#F2F0EB"
                  opacity={0}
                />
              ))}
            </g>
          </g>
        </svg>
      </div>

      {/* ===================================================================== */}
      {/* VERY BOTTOM: Mandatory Attribution Credits                            */}
      {/* ===================================================================== */}
      <p className="footer-credits">
        Concept project, not affiliated with PepsiCo. Pepsi can model by ForevereQ (Sketchfab), CC-BY-4.0.
      </p>
    </footer>
  );
}
