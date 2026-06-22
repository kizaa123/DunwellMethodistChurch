"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { churchInfo } from "@/lib/data";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await api.sendContact(form);
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to send message");
    }
  }

  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="We'd love to hear from you. Reach out anytime."
      />

      <section className="py-16 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-6">Get in Touch</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
                    label: "Address",
                    value: churchInfo.address,
                  },
                  {
                    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
                    label: "Phone",
                    value: churchInfo.phone,
                  },
                  {
                    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                    label: "Email",
                    value: churchInfo.email,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-[#1e3a5f]">{item.label}</p>
                      <p className="text-stone-600">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Google Maps Embed */}
              <div className="mt-8 rounded-2xl overflow-hidden shadow-md border border-stone-200">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(churchInfo.address)}&output=embed&z=15`}
                  width="100%"
                  height="300"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Church Location Map"
                />
              </div>

              {/* Service Times */}
              <div className="mt-8 bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Service Times
                </h3>
                <div className="space-y-3">
                  {churchInfo.serviceTimes.map((s) => (
                    <div key={s.day} className="flex items-start justify-between gap-4 pb-3 border-b border-stone-100 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-[#1e3a5f] text-sm">{s.day}</p>
                        <p className="text-xs text-stone-500">{s.type}</p>
                      </div>
                      <span className="text-sm font-bold text-amber-600 shrink-0">{s.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
              <h2 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-6">Send a Message</h2>
              {status === "success" ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-[#1e3a5f] font-medium">Message sent successfully!</p>
                  <p className="text-stone-500 text-sm mt-1">We&apos;ll get back to you soon.</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-4 text-sm text-[#c9a227] hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] resize-none"
                    />
                  </div>
                  {status === "error" && (
                    <p className="text-red-600 text-sm">{errorMsg}</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3 rounded-lg bg-[#1e3a5f] text-white font-medium hover:bg-[#2a5082] transition-colors disabled:opacity-60"
                  >
                    {status === "loading" ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
