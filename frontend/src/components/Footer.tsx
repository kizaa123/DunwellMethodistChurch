"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { churchInfo } from "@/lib/data";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer
      className="text-white mt-auto relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, hsl(212,51%,16%) 0%, hsl(212,51%,20%) 60%, hsl(220,40%,18%) 100%)",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Ambient glow */}
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-[0.06] pointer-events-none"
        style={{ background: "hsl(41,74%,47%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        {/* Top divider */}
        <div
          className="h-px w-full mb-12 opacity-10"
          style={{ background: "white" }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/logo.png"
                alt="Dunwell Methodist Church Logo"
                className="h-11 w-11 object-contain rounded-full bg-white p-0.5 shadow-lg"
              />
              <h3 className="font-serif text-lg font-semibold leading-tight">{churchInfo.name}</h3>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(212,40%,75%)" }}>
              {churchInfo.tagline}. A community of faith, hope, and love serving our neighbors.
            </p>
            {/* Social icons */}
            <div className="flex gap-2">
              {Object.entries(churchInfo.social).map(([platform]) => (
                <a
                  key={platform}
                  href={churchInfo.social[platform as keyof typeof churchInfo.social]}
                  className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "hsl(212,40%,75%)",
                  }}
                  aria-label={platform}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "hsl(41,74%,47%)";
                    (e.currentTarget as HTMLElement).style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.color = "hsl(212,40%,75%)";
                  }}
                >
                  {platform[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-semibold text-sm uppercase tracking-wider mb-5"
              style={{ color: "hsl(41,74%,60%)" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/about", label: "About Us" },
                { href: "/sermons", label: "Sermons" },
                { href: "/events", label: "Events" },
                { href: "/ministries", label: "Ministries" },
                { href: "/donations", label: "Give Online" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors duration-150"
                    style={{ color: "hsl(212,40%,75%)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "hsl(212,40%,75%)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h4
              className="font-semibold text-sm uppercase tracking-wider mb-5"
              style={{ color: "hsl(41,74%,60%)" }}
            >
              Service Times
            </h4>
            <ul className="space-y-4 text-sm">
              {churchInfo.serviceTimes.map((service) => (
                <li key={service.day}>
                  <span className="font-semibold text-white block">{service.day}</span>
                  <span style={{ color: "hsl(212,40%,75%)" }}>
                    {service.time} — {service.type}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-semibold text-sm uppercase tracking-wider mb-5"
              style={{ color: "hsl(41,74%,60%)" }}
            >
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm" style={{ color: "hsl(212,40%,75%)" }}>
              <li className="flex gap-2">
                <svg className="h-4 w-4 mt-0.5 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{churchInfo.address}</span>
              </li>
              <li>
                <a
                  href={`tel:${churchInfo.phone}`}
                  className="flex gap-2 transition-colors duration-150"
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "hsl(212,40%,75%)")}
                >
                  <svg className="h-4 w-4 mt-0.5 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {churchInfo.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${churchInfo.email}`}
                  className="flex gap-2 transition-colors duration-150"
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "hsl(212,40%,75%)")}
                >
                  <svg className="h-4 w-4 mt-0.5 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {churchInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            color: "hsl(212,40%,60%)",
          }}
        >
          <p>&copy; {new Date().getFullYear()} {churchInfo.name}. All rights reserved.</p>
          <p>Made with ❤️ for our community</p>
        </div>
      </div>
    </footer>
  );
}
