import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

/**
 * Pixel-style Minimal Loader
 * Displays 0-100% counter in dot-matrix font with status messages.
 */
export default function Loader({ onLoaded }) {
  const { active, progress, total, loaded } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Smoothly step up the progress counter
    const target = active ? Math.min(progress, 99) : 100;
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < target) {
          const step = Math.max(1, Math.floor((target - prev) / 4));
          return Math.min(prev + step, target);
        }
        return prev;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [progress, active]);

  useEffect(() => {
    if (displayProgress >= 100) {
      const timeout = setTimeout(() => {
        setIsDone(true);
        if (onLoaded) onLoaded();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [displayProgress, onLoaded]);

  if (isDone) return null;

  // Generate pixel-like block indicator
  const totalBlocks = 20;
  const filledBlocks = Math.round((displayProgress / 100) * totalBlocks);

  return (
    <div
      id="site-loader"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 md:p-14 bg-[#F2F0EB] text-[#0B0B0F] select-none transition-transform duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${
        displayProgress >= 100 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Top Header */}
      <div className="w-full flex items-center justify-between text-xs tracking-widest uppercase font-mono text-[#0B0B0F]/60">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#E32934] animate-ping" />
          <span>PEPSI ARCHIVE // PROTOCOL 2026</span>
        </div>
        <div>SYS_CAN_V2.4</div>
      </div>

      {/* Center Counter */}
      <div className="flex flex-col items-center justify-center my-auto text-center">
        <div className="font-pixel text-8xl md:text-9xl font-bold tracking-tighter text-[#0B0B0F] leading-none mb-4 tabular-nums">
          {String(Math.floor(displayProgress)).padStart(2, '0')}
          <span className="text-4xl md:text-5xl text-[#0A4DA3]">%</span>
        </div>

        {/* Pixel Block Bar */}
        <div className="flex items-center gap-1.5 p-1 border border-[#0B0B0F]/20 bg-white/50 backdrop-blur-sm rounded-sm">
          {Array.from({ length: totalBlocks }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2.5 h-4 transition-colors duration-150 rounded-2xs ${
                idx < filledBlocks
                  ? idx % 2 === 0
                    ? 'bg-[#0A4DA3]'
                    : 'bg-[#E32934]'
                  : 'bg-[#0B0B0F]/10'
              }`}
            />
          ))}
        </div>

        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-[#0B0B0F]/50">
          {displayProgress < 40 && 'INITIALIZING THREE.JS ENGINE...'}
          {displayProgress >= 40 && displayProgress < 80 && 'STREAMING PEPSI_CAN.GLB ASSETS...'}
          {displayProgress >= 80 && displayProgress < 100 && 'CALCULATING BOUNDING BOX & SHADERS...'}
          {displayProgress >= 100 && 'SYSTEM READY. REFRESHING FUTURE.'}
        </p>
      </div>

      {/* Footer Info */}
      <div className="w-full flex items-center justify-between text-[10px] md:text-xs tracking-wider uppercase font-mono text-[#0B0B0F]/40 border-t border-[#0B0B0F]/10 pt-4">
        <span>MEM: OK // 60FPS TARGET</span>
        <span>ICE-COLD // ELECTRIC // PEPSI</span>
      </div>
    </div>
  );
}
