"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { churchInfo } from "@/lib/data";
import { isSermonLive } from "@/lib/api";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/ministries", label: "Ministries" },
  { href: "/sermons", label: "Sermons" },
  { href: "/live", label: "Live" },
  { href: "/events", label: "Events" },
  { href: "/donations", label: "Giving" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLiveNow, setIsLiveNow] = useState(false);

  // Check for live sermon every 2 minutes
  useEffect(() => {
    function checkLive() {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      fetch(`${API}/sermons`)
        .then((r) => r.json())
        .then((sermons: Array<{ id: string; date: string; isLive?: boolean }>) => {
          if (!Array.isArray(sermons)) return;
          const live = sermons.some((s) => isSermonLive(s));
          setIsLiveNow(live);
        })
        .catch(() => { });
    }
    checkLive();
    const interval = setInterval(checkLive, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(255,255,255,0.97)"
          : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        boxShadow: scrolled
          ? "0 1px 0 rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)"
          : "0 1px 0 rgba(0,0,0,0.04)",
      }}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Dunwell Methodist Church Logo"
              className="h-14 w-14 object-contain transition-all duration-200 group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <p
                className="font-serif text-lg font-semibold leading-tight"
                style={{ color: "hsl(212,51%,24%)" }}
              >
                {churchInfo.name}
              </p>
              <p className="text-xs text-stone-400 leading-tight">{churchInfo.tagline}</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5"
                  style={{
                    color: active ? "hsl(212,51%,24%)" : "hsl(24,5%,38%)",
                    background: active ? "hsl(212,51%,96%)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "hsl(212,51%,24%)";
                      (e.currentTarget as HTMLElement).style.background = "hsl(30,5%,95%)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "hsl(24,5%,38%)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  {link.label}
                  {link.href === "/live" && isLiveNow && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                    </span>
                  )}
                  {active && (
                    <span
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                      style={{ background: "#c9a227" }}
                    />
                  )}
                </Link>
              );
            })}
            <Link
              href={isLoggedIn ? "/members/profile" : "/members/login"}
              className="ml-3 btn-gold text-sm px-5 py-2"
              style={{ borderRadius: "9999px", fontSize: "0.875rem" }}
            >
              {isLoggedIn ? "My Portal" : "Member Portal"}
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-3 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            style={{ color: "hsl(24,5%,38%)" }}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg
              className="h-6 w-6 transition-transform duration-200"
              style={{ transform: mobileOpen ? "rotate(45deg)" : "rotate(0)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 pt-2 border-t animate-slide-down" style={{ borderColor: "hsl(30,5%,90%)" }}>
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5 min-h-[44px] touch-manipulation"
                  style={{
                    color: active ? "hsl(212,51%,24%)" : "hsl(24,5%,38%)",
                    background: active ? "hsl(212,51%,96%)" : "transparent",
                  }}
                >
                  {active && (
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0"
                      style={{ background: "#c9a227" }}
                    />
                  )}
                  {link.label}
                  {link.href === "/live" && isLiveNow && (
                    <span className="ml-2 relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                    </span>
                  )}
                </Link>
              );
            })}
            <Link
              href={isLoggedIn ? "/members/profile" : "/members/login"}
              onClick={() => setMobileOpen(false)}
              className="mt-3 w-full btn-gold text-sm min-h-[48px] touch-manipulation"
              style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              {isLoggedIn ? "My Portal" : "Member Portal"}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
