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
            {/* Social icons — real brand SVGs */}
            <div className="flex gap-2.5">
              {/* Facebook */}
              <a
                href={churchInfo.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-110"
                style={{ background: "#1877F2", border: "1px solid #1877F2" }}
              >
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href={churchInfo.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-110"
                style={{ background: "#FF0000", border: "1px solid #FF0000" }}
              >
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href={churchInfo.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-110"
                style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)", border: "1px solid #d6249f" }}
              >
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a
                href={churchInfo.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-125"
                style={{ background: "#010101", border: "1px solid #69C9D0" }}
              >
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                </svg>
              </a>
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
