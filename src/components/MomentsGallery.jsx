import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './MomentsGallery.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * =============================================================================
 * MOMENTS DATA ARRAY
 * Titles, numbers, and image paths easily editable here.
 * =============================================================================
 */
export const MOMENTS_DATA = [
  { id: '1', number: '01', title: 'Game night', image: '/moments/m1.jpg' },
  { id: '2', number: '02', title: 'Road trip', image: '/moments/m2.jpg' },
  { id: '3', number: '03', title: 'Rooftop summer', image: '/moments/m3.jpg' },
  { id: '4', number: '04', title: 'Late study session', image: '/moments/m4.jpg' },
  { id: '5', number: '05', title: 'Beach day', image: '/moments/m5.jpg' },
];

/**
 * Configuration settings for Section 6: MOMENTS
 */
export const MOMENTS_CONFIG = {
  // Temporary debug flag to see ScrollTrigger start and end lines
  markers: false,

  // Scrub smoothness
  scrub: 1.2,
  anticipatePin: 1,

  // Image parallax percentage inside each frame (about 8%)
  parallaxPercent: 8,

  // Colors
  previousBgColor: '#7A0F2B', // Previous section (Wild Cherry) background
  sectionBgColor: '#F2F0EB',  // Off-white base
};

/**
 * MomentsGallery Component
 * Section 6: "MOMENTS"
 * Pinned horizontal gallery with 5 cards, subtle parallax,
 * center-weighted card opacity (0.6 -> 1.0 with power2.out),
 * and smooth background entrance fade.
 */
export default function MomentsGallery({ isLoaded = true, isMobile = false }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const cardsRef = useRef([]);
  const imagesRef = useRef([]);

  const [imagesReady, setImagesReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 1. Preload all 5 images before creating the trigger
  useEffect(() => {
    let isCancelled = false;

    const preloadMoments = async () => {
      const promises = MOMENTS_DATA.map((item) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = item.image;
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

    preloadMoments();

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Master GSAP ScrollTrigger Horizontal Pinned Animation
  useEffect(() => {
    if (!isLoaded || !imagesReady || reducedMotion || isMobile) return;

    let pinTl = null;

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !trackRef.current) return;

      // Power2.out ease curve for smooth center opacity fade
      const power2Out = gsap.parseEase('power2.out');

      // Function to dynamically calculate the full horizontal travel distance
      const getScrollDistance = () => {
        return trackRef.current ? Math.max(0, trackRef.current.scrollWidth - window.innerWidth) : 0;
      };

      // Master Pinned Timeline
      pinTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => '+=' + getScrollDistance(),
          pin: true,
          pinSpacing: true,
          anticipatePin: MOMENTS_CONFIG.anticipatePin,
          scrub: MOMENTS_CONFIG.scrub,
          invalidateOnRefresh: true,
          markers: MOMENTS_CONFIG.markers,
          onUpdate: () => {
            // Cards fade smoothly from 0.6 to 1 opacity as they reach the viewport center
            const viewCenter = window.innerWidth / 2;
            const threshold = window.innerWidth * 0.45;

            cardsRef.current.forEach((card) => {
              if (!card) return;
              const rect = card.getBoundingClientRect();
              const cardCenter = rect.left + rect.width / 2;
              const dist = Math.abs(cardCenter - viewCenter) / threshold;
              const normalizedRatio = Math.max(0, Math.min(1, 1 - dist));
              const eased = power2Out(normalizedRatio);
              const opacity = 0.6 + 0.4 * eased;
              card.style.opacity = opacity;
            });
          },
        },
      });

      // A. Smooth background fade from previous section's color (#7A0F2B) to #F2F0EB over first 10%
      pinTl.fromTo(
        sectionRef.current,
        { backgroundColor: MOMENTS_CONFIG.previousBgColor },
        {
          backgroundColor: MOMENTS_CONFIG.sectionBgColor,
          duration: 0.1,
          ease: 'power2.out',
        },
        0
      );

      // B. Horizontal scroll of the card track
      pinTl.fromTo(
        trackRef.current,
        { x: 0 },
        {
          x: () => -getScrollDistance(),
          ease: 'none',
          duration: 1,
        },
        0
      );

      // C. Subtle image parallax (about 8%) inside each card frame as it passes
      imagesRef.current.forEach((img) => {
        if (!img) return;
        pinTl.fromTo(
          img,
          { xPercent: -MOMENTS_CONFIG.parallaxPercent },
          {
            xPercent: MOMENTS_CONFIG.parallaxPercent,
            ease: 'none',
            duration: 1,
          },
          0
        );
      });
    }, sectionRef);

    // Refresh ScrollTrigger so all positions and track widths calculate accurately
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [isLoaded, imagesReady, reducedMotion, isMobile]);

  return (
    <section
      ref={sectionRef}
      id="moments"
      className="moments-section"
      style={{ backgroundColor: MOMENTS_CONFIG.sectionBgColor }}
    >
      {/* ===================================================================== */}
      {/* SECTION HEADER: Small label & Pixel headline at top left             */}
      {/* ===================================================================== */}
      <div className="moments-header absolute top-10 sm:top-14 left-6 sm:left-12 lg:left-16 z-20 pointer-events-none flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#0B0B0F]/60 font-semibold">
          MOMENTS
        </span>
        <h2 className="font-pixel text-3xl sm:text-5xl md:text-6xl font-black text-[#0B0B0F] tracking-tight uppercase select-none leading-[0.95]">
          MADE FOR EVERY MOMENT.
        </h2>
      </div>

      {/* ===================================================================== */}
      {/* HORIZONTAL TRACK: 5 Moments Cards                                     */}
      {/* ===================================================================== */}
      <div className="moments-track-wrapper">
        <div ref={trackRef} className="moments-track">
          {MOMENTS_DATA.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => (cardsRef.current[index] = el)}
              className="moment-card"
            >
              {/* Image Frame with rounded corners and hidden overflow */}
              <div className="moment-image-frame">
                <img
                  ref={(el) => (imagesRef.current[index] = el)}
                  src={item.image}
                  alt={item.title}
                  className="moment-image select-none pointer-events-none"
                  loading="eager"
                />
              </div>

              {/* Number and Title below image in small clean sans text */}
              <div className="moment-meta">
                <span className="moment-number">{item.number}</span>
                <span className="text-[#0B0B0F]/30 text-xs">//</span>
                <h3 className="moment-title">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
