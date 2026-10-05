import React, { useState } from 'react';

/**
 * Navbar Component
 * Minimal, thin, translucent navigation bar with Pepsi logo mark,
 * navigation links, and a red "Buy Now" button.
 */
export default function Navbar({ navRef }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      ref={navRef}
      id="main-navbar"
      className="fixed top-0 left-0 w-full z-40 backdrop-blur-md bg-white/85 border-b border-[#0B0B0F]/10 transition-all duration-300 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Pepsi Globe / Brandmark */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            {/* Minimal Pepsi Globe Emblem */}
            <div className="w-8 h-8 rounded-full overflow-hidden relative shadow-sm border border-black/10 group-hover:rotate-12 transition-transform duration-300">
              <div className="absolute inset-0 bg-[#0A4DA3]" />
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#E32934] [clip-path:polygon(0_0,100%_0,100%_75%,0_95%)]" />
              <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-white -rotate-6 scale-x-125" />
            </div>
            <div className="flex flex-col">
              <span className="font-pixel font-bold text-lg md:text-xl tracking-wider text-[#0B0B0F] group-hover:text-[#0A4DA3] transition-colors">
                PEPSI<span className="text-[#E32934]">®</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#0B0B0F]/50 -mt-1 hidden sm:block">
                SINCE 1898 // ELECTRIC BLUE
              </span>
            </div>
          </a>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest text-[#0B0B0F]/70">
          {[
            { name: 'Home', href: '#home', active: true },
            { name: 'About', href: '#about' },
            { name: 'Flavors', href: '#flavors' },
            { name: 'FAQ', href: '#faq' },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`relative py-1 transition-colors hover:text-[#0A4DA3] group ${
                item.active ? 'text-[#0B0B0F] font-bold' : ''
              }`}
            >
              {item.name}
              <span
                className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-[#0A4DA3] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 ${
                  item.active ? 'scale-x-100' : ''
                }`}
              />
            </a>
          ))}
        </nav>

        {/* Right: Sound / Mode indicator + Buy Now Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#0B0B0F]/50 px-2.5 py-1 border border-[#0B0B0F]/10 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>COLD: 3.2°C</span>
          </div>

          <a
            href="#flavors"
            id="buy-now-btn"
            className="inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-full bg-[#E32934] hover:bg-[#c91e28] text-white font-mono text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow-lg hover:shadow-red-500/25 active:scale-95 transition-all duration-200"
          >
            Buy Now
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#0B0B0F] hover:text-[#0A4DA3] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#0B0B0F]/10 bg-[#F2F0EB]/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-4 font-mono text-xs uppercase tracking-widest text-[#0B0B0F]">
          <a
            href="#home"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 hover:text-[#0A4DA3]"
          >
            Home
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 hover:text-[#0A4DA3]"
          >
            About
          </a>
          <a
            href="#flavors"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 hover:text-[#0A4DA3]"
          >
            Flavors
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 hover:text-[#0A4DA3]"
          >
            FAQ
          </a>
        </div>
      )}
    </header>
  );
}
