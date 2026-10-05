import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PourSequence.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * =============================================================================
 * TUNABLE CONFIGURATION FOR SECTION 4: "THE POUR"
 * Slow, calm, premium.
 * =============================================================================
 */
export const POUR_CONFIG = {
  // Temporary debug flag to see ScrollTrigger start and end lines
  markers: false,

  // Frame count & loading
  frameCount: 144,                    // Total WebP frames (144)
  initialBatchSize: 30,              // Preload first 30 frames before revealing section
  framePath: (index) => `/frames/frame_${String(index + 1).padStart(4, '0')}.webp`,
  frameWidth: 1280,
  frameHeight: 720,

  // Pin & Scroll settings
  pinLength: '+=500%',               // Weighty 500% pin length
  scrub: 1.5,                        // Weighty, smooth scrub (1.5)
  lerpSpeed: 0.1,                    // Frame easing lerp factor per tick (0.1)

  // Colors
  darkBg: '#0B0B0F',                 // Pinned dark About section background
  defaultVideoBg: '#D3D4D7',         // Sampled corner pixel color fallback

  // Timeline Progress Windows (Normalized 0.0 -> 1.0)
  // Background transition: dark #0B0B0F to video background over first 15%
  entryFadeEnd: 0.15,

  // Frame animation: holds first 10% (0.0 to 0.10), animates 0.10 to 0.85, holds last 15% (0.85 to 1.00)
  frameHoldStart: 0.10,
  frameHoldEnd: 0.85,

  // Text 1: Small label "THE POUR" fades in at about 10% progress
  labelFadeStart: 0.08,
  labelFadeEnd: 0.16,

  // Text 2: One line on the left at about 40% to 60% progress
  lineFadeInStart: 0.38,
  lineFadeInEnd: 0.48,
  lineFadeOutStart: 0.54,
  lineFadeOutEnd: 0.62,

  // Text 3: Centered "STAY COLD." headline masked line reveal & red button at about 85% progress
  headlineRevealStart: 0.82,
  headlineRevealEnd: 0.90,
  btnFadeStart: 0.85,
  btnFadeEnd: 0.92,
};

/**
 * Sample the exact corner pixel color from the first frame image.
 */
function sampleCornerColor(img) {
  try {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 4;
    sampleCanvas.height = 4;
    const sCtx = sampleCanvas.getContext('2d');
    sCtx.drawImage(img, 0, 0, 4, 4, 0, 0, 4, 4);
    const pixel = sCtx.getImageData(0, 0, 1, 1).data;
    return `#${[pixel[0], pixel[1], pixel[2]]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')}`;
  } catch (e) {
    return POUR_CONFIG.defaultVideoBg;
  }
}

/**
 * PourSequence Component
 * Section 4: "THE POUR"
 */
export default function PourSequence({ isLoaded = true, isMobile = false }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const labelRef = useRef(null);
  const lineRef = useRef(null);
  const headlineWrapperRef = useRef(null);
  const headlineRef = useRef(null);
  const buttonRef = useRef(null);

  // Background color dynamically sampled from video corner pixel
  const [bgColor, setBgColor] = useState(POUR_CONFIG.defaultVideoBg);
  const videoBgColorRef = useRef(POUR_CONFIG.defaultVideoBg);

  // Preloading state
  const [initialReady, setInitialReady] = useState(false);
  const imagesRef = useRef(new Array(POUR_CONFIG.frameCount));

  // Lerp frame tracking
  const targetFrameRef = useRef(0);
  const displayedFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);

  // ===========================================================================
  // 1. PRELOAD FRAMES (First 30 in order, then background stream the rest)
  // ===========================================================================
  useEffect(() => {
    let isCancelled = false;

    const loadFrame = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = POUR_CONFIG.framePath(index);
        img.onload = () => {
          if (!isCancelled) {
            imagesRef.current[index] = img;
          }
          resolve(img);
        };
        img.onerror = () => {
          resolve(null);
        };
      });
    };

    const preloadSequence = async () => {
      // Preload first 30 frames
      const initialBatch = [];
      for (let i = 0; i < POUR_CONFIG.initialBatchSize; i++) {
        initialBatch.push(loadFrame(i));
      }
      await Promise.all(initialBatch);

      if (!isCancelled) {
        // Sample exact background color from corner pixel of frame 0
        if (imagesRef.current[0]) {
          const sampled = sampleCornerColor(imagesRef.current[0]);
          videoBgColorRef.current = sampled;
          setBgColor(sampled);
        }

        setInitialReady(true);

        requestAnimationFrame(() => {
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        });

        // Load remaining frames in background
        for (let i = POUR_CONFIG.initialBatchSize; i < POUR_CONFIG.frameCount; i++) {
          if (isCancelled) break;
          await loadFrame(i);
        }
      }
    };

    preloadSequence();

    return () => {
      isCancelled = true;
    };
  }, []);

  // ===========================================================================
  // 2. CANVAS DRAWING (Cover scaling, high quality image smoothing, DPR)
  // ===========================================================================
  const drawCanvas = (frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Find requested frame or fallback to nearest loaded frame
    let img = imagesRef.current[frameIdx];
    if (!img || !img.complete) {
      for (let offset = 1; offset < POUR_CONFIG.frameCount; offset++) {
        if (frameIdx - offset >= 0 && imagesRef.current[frameIdx - offset]?.complete) {
          img = imagesRef.current[frameIdx - offset];
          break;
        }
        if (frameIdx + offset < POUR_CONFIG.frameCount && imagesRef.current[frameIdx + offset]?.complete) {
          img = imagesRef.current[frameIdx + offset];
          break;
        }
      }
    }

    if (!img || !img.complete) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || POUR_CONFIG.frameWidth;
    const ih = img.naturalHeight || POUR_CONFIG.frameHeight;

    const canvasRatio = cw / ch;
    const imageRatio = iw / ih;

    let dw, dh, dx, dy;
    if (canvasRatio > imageRatio) {
      dw = cw;
      dh = cw / imageRatio;
      dx = 0;
      dy = (ch - dh) / 2;
    } else {
      dh = ch;
      dw = ch * imageRatio;
      dx = (cw - dw) / 2;
      dy = 0;
    }

    // Match exact sampled video background color with no visible box
    ctx.fillStyle = videoBgColorRef.current;
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    const currentFrame = Math.max(0, Math.round(displayedFrameRef.current));
    drawCanvas(currentFrame);
  };

  useEffect(() => {
    if (!initialReady) return;
    handleResize();
    drawCanvas(0);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initialReady]);

  // ===========================================================================
  // 3. MASTER GSAP PINNED TIMELINE & LERP TICKER
  // ===========================================================================
  useEffect(() => {
    if (!initialReady) return;

    let tickerHandler = null;

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // -----------------------------------------------------------------------
      // REDUCED MOTION: show last frame, all text visible, no pin
      // -----------------------------------------------------------------------
      if (prefersReducedMotion) {
        targetFrameRef.current = POUR_CONFIG.frameCount - 1;
        displayedFrameRef.current = POUR_CONFIG.frameCount - 1;
        drawCanvas(POUR_CONFIG.frameCount - 1);
        if (sectionRef.current) gsap.set(sectionRef.current, { backgroundColor: videoBgColorRef.current });
        if (canvasRef.current) gsap.set(canvasRef.current, { opacity: 1 });
        if (labelRef.current) gsap.set(labelRef.current, { opacity: 1 });
        if (lineRef.current) gsap.set(lineRef.current, { opacity: 1, y: 0 });
        if (headlineRef.current) gsap.set(headlineRef.current, { yPercent: 0 });
        if (buttonRef.current) gsap.set(buttonRef.current, { opacity: 1 });
        return;
      }

      // -----------------------------------------------------------------------
      // PINNED MASTER TIMELINE (start: "top top", end: "+=500%", scrub: 1.5)
      // -----------------------------------------------------------------------
      const pinTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: POUR_CONFIG.pinLength,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: POUR_CONFIG.scrub,
          invalidateOnRefresh: true,
          markers: POUR_CONFIG.markers,
        },
      });

      // 1. Long smooth background fade from #0B0B0F to video background over first 15%
      pinTl.fromTo(
        sectionRef.current,
        { backgroundColor: POUR_CONFIG.darkBg },
        {
          backgroundColor: videoBgColorRef.current,
          duration: POUR_CONFIG.entryFadeEnd,
          ease: 'power2.out',
        },
        0
      );

      pinTl.fromTo(
        canvasRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: POUR_CONFIG.entryFadeEnd,
          ease: 'power2.out',
        },
        0
      );

      // 2. Animate target frame with scroll:
      // Holds frame 0 for first 10% (0.0 -> 0.10)
      // Animates frame 0 -> 143 over 0.10 -> 0.85
      // Holds frame 143 for last 15% (0.85 -> 1.00)
      const frameTracker = { frame: 0 };
      pinTl.to(
        frameTracker,
        {
          frame: POUR_CONFIG.frameCount - 1,
          ease: 'none',
          duration: POUR_CONFIG.frameHoldEnd - POUR_CONFIG.frameHoldStart,
          onUpdate: () => {
            targetFrameRef.current = frameTracker.frame;
          },
        },
        POUR_CONFIG.frameHoldStart
      );

      // 3. TEXT ELEMENT 1: Small label "THE POUR" at top left, fading in at about 10% progress
      if (labelRef.current) {
        pinTl.fromTo(
          labelRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: POUR_CONFIG.labelFadeEnd - POUR_CONFIG.labelFadeStart,
            ease: 'power2.out',
          },
          POUR_CONFIG.labelFadeStart
        );
      }

      // 4. TEXT ELEMENT 2: One line on left in clean sans at 40% to 60% progress
      // Fading up 20px over a long ease, holding, then fading out
      if (lineRef.current) {
        pinTl.fromTo(
          lineRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: POUR_CONFIG.lineFadeInEnd - POUR_CONFIG.lineFadeInStart,
            ease: 'power2.out',
          },
          POUR_CONFIG.lineFadeInStart
        );

        pinTl.to(
          lineRef.current,
          {
            opacity: 0,
            y: -20,
            duration: POUR_CONFIG.lineFadeOutEnd - POUR_CONFIG.lineFadeOutStart,
            ease: 'power2.out',
          },
          POUR_CONFIG.lineFadeOutStart
        );
      }

      // 5. TEXT ELEMENT 3: Centered "STAY COLD." masked line reveal & red button at about 85% progress
      // Both hold until the pin releases at 100%
      if (headlineRef.current) {
        pinTl.fromTo(
          headlineRef.current,
          { yPercent: 120 },
          {
            yPercent: 0,
            duration: POUR_CONFIG.headlineRevealEnd - POUR_CONFIG.headlineRevealStart,
            ease: 'power2.out',
          },
          POUR_CONFIG.headlineRevealStart
        );
      }

      if (buttonRef.current) {
        pinTl.fromTo(
          buttonRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: POUR_CONFIG.btnFadeEnd - POUR_CONFIG.btnFadeStart,
            ease: 'power2.out',
          },
          POUR_CONFIG.btnFadeStart
        );
      }

      // -----------------------------------------------------------------------
      // 60FPS LERP TICKER: Eases displayed frame toward target frame (lerp: 0.1)
      // Only redraws the canvas when the displayed integer frame changes
      // -----------------------------------------------------------------------
      tickerHandler = () => {
        const diff = targetFrameRef.current - displayedFrameRef.current;
        if (Math.abs(diff) > 0.001) {
          displayedFrameRef.current += diff * POUR_CONFIG.lerpSpeed;
        } else {
          displayedFrameRef.current = targetFrameRef.current;
        }

        const roundedFrame = Math.min(
          POUR_CONFIG.frameCount - 1,
          Math.max(0, Math.round(displayedFrameRef.current))
        );

        if (roundedFrame !== lastDrawnFrameRef.current) {
          lastDrawnFrameRef.current = roundedFrame;
          drawCanvas(roundedFrame);
        }
      };

      gsap.ticker.add(tickerHandler);
    }, sectionRef);

    // Refresh triggers on font load and window load
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
      if (tickerHandler) gsap.ticker.remove(tickerHandler);
      ctx.revert();
    };
  }, [initialReady, isMobile]);

  return (
    <section
      ref={sectionRef}
      id="the-pour"
      className="pour-section"
      style={{ backgroundColor: bgColor }}
    >
      {/* Full-viewport Canvas: Cover scaling, high-quality smoothing, DPR support */}
      <canvas
        ref={canvasRef}
        id="pour-canvas"
        className="pour-canvas"
        style={{ backgroundColor: bgColor }}
      />

      {/* Text Layers: Calm, high-contrast, strictly 3 elements */}
      <div className="pour-text-layer">
        {/* 1. Small label top left: "THE POUR" */}
        <div
          ref={labelRef}
          className="absolute top-24 sm:top-28 left-8 sm:left-14 md:left-20 z-20 pointer-events-none opacity-0"
        >
          <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#0B0B0F]/70 font-semibold">
            THE POUR
          </span>
        </div>

        {/* 2. Left line: "Poured over ice. Ready in a second." (Never overlaps glass) */}
        <div
          ref={lineRef}
          className="absolute left-8 sm:left-14 md:left-20 top-1/2 -translate-y-1/2 z-20 pointer-events-none max-w-[260px] sm:max-w-xs md:max-w-sm opacity-0"
        >
          <p className="font-sans text-xl sm:text-2xl md:text-3xl font-medium text-[#0B0B0F]/85 leading-snug tracking-tight">
            Poured over ice. <br className="hidden sm:inline" />
            Ready in a second.
          </p>
        </div>

        {/* 3. Centered headline: "STAY COLD." & red pill button "FIND YOUR FLAVOR" */}
        <div
          ref={headlineWrapperRef}
          className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-center px-4 w-full max-w-2xl"
        >
          {/* Masked reveal */}
          <div className="pour-masked-wrapper">
            <h2
              ref={headlineRef}
              className="font-pixel text-4xl sm:text-6xl md:text-7xl font-black text-[#0B0B0F] tracking-tight uppercase select-none"
              style={{ transform: 'translateY(120%)' }}
            >
              STAY COLD.
            </h2>
          </div>

          {/* Small red pill button */}
          <a
            ref={buttonRef}
            href="#flavors"
            data-no-drag
            className="pour-interactive mt-4 sm:mt-5 px-7 sm:px-8 py-2.5 sm:py-3 rounded-full bg-[#E32934] hover:bg-[#c91e28] text-white font-mono text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 opacity-0 cursor-pointer"
          >
            FIND YOUR FLAVOR
          </a>
        </div>
      </div>
    </section>
  );
}
