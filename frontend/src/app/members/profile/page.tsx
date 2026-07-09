"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { User, Announcement, EventRegistration } from "@/types";
import { api } from "@/lib/api";
import { ministries } from "@/lib/data";

export default function MemberProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnn, setLoadingAnn] = useState(true);

  // Registered ministries list state
  const [joinedMinistryIds, setJoinedMinistryIds] = useState<string[]>([]);

  // Prayer Request Form State
  const [prayerRequest, setPrayerRequest] = useState("");
  const [prayerStatus, setPrayerStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Testimony Form State
  const [testimony, setTestimony] = useState("");
  const [testimonyImage, setTestimonyImage] = useState<string | null>(null);
  const [testimonyImagePreview, setTestimonyImagePreview] = useState<string | null>(null);
  const [testimonyStatus, setTestimonyStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "giving" | "interact" | "history">("overview");

  // Giving Form State
  const [givingAmount, setGivingAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [givingStatus, setGivingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Giving History State
  const [donations, setDonations] = useState<Array<{ id: string; amount: number; paymentMethod: string; date: string }>>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  function handleTestimonyImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setTestimonyImage(base64);
      setTestimonyImagePreview(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleTestimonySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!testimony.trim() || !user) return;
    setTestimonyStatus("loading");
    try {
      let imageUrl: string | undefined;
      if (testimonyImage) {
        const uploadResult = await api.admin.uploadFile(testimonyImage, "testimony.jpg");
        imageUrl = uploadResult.url;
      }
      await api.createTestimony({
        memberName: user.name,
        testimony: testimony,
        imageUrl,
      });
      setTestimonyStatus("success");
      setTestimony("");
      setTestimonyImage(null);
      setTestimonyImagePreview(null);
      setTimeout(() => setTestimonyStatus("idle"), 4000);
    } catch (err) {
      console.error(err);
      setTestimonyStatus("error");
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) {
      router.push("/members/login");
      return;
    }
    setUser(JSON.parse(stored));

    // Load registered ministries from local storage
    const savedMinistries = localStorage.getItem("joined-ministries");
    if (savedMinistries) {
      setJoinedMinistryIds(JSON.parse(savedMinistries));
    }

    // Fetch announcements
    api.getAnnouncements()
      .then((data) => setAnnouncements(data))
      .catch(console.error)
      .finally(() => setLoadingAnn(false));

    // Fetch giving history
    setLoadingDonations(true);
    api.getMyDonations()
      .then(setDonations)
      .catch(console.error)
      .finally(() => setLoadingDonations(false));

    api.getMyEventRegistrations()
      .then(setEventRegistrations)
      .catch(console.error)
      .finally(() => setLoadingEvents(false));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/members/login");
  }

  async function handlePrayerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prayerRequest.trim() || !user) return;
    setPrayerStatus("loading");
    try {
      await api.createPrayerRequest({
        memberName: user.name,
        email: user.email,
        request: prayerRequest,
      });
      setPrayerStatus("success");
      setPrayerRequest("");
      setTimeout(() => setPrayerStatus("idle"), 4000);
    } catch (err) {
      console.error(err);
      setPrayerStatus("error");
    }
  }

  async function handleGivingSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(givingAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    setGivingStatus("loading");
    try {
      await api.createDonation({
        amount,
        paymentMethod,
      });
      setGivingStatus("success");
      setGivingAmount("");
      setTimeout(() => setGivingStatus("idle"), 4000);
      
      // Reload giving history
      api.getMyDonations()
        .then(setDonations)
        .catch(console.error);
    } catch (err) {
      console.error(err);
      setGivingStatus("error");
    }
  }

  if (!user) return null;

  // Filter ministries that the member has registered/joined
  const memberMinistries = ministries.filter((m) => joinedMinistryIds.includes(m.id));

  return (
    <>
      <PageHeader title="Member Portal" subtitle={`Welcome back, ${user.name}`} />

      <section className="py-8 sm:py-12 bg-stone-50 min-h-[70vh]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 animate-fade-in">
          
          {/* Header Banner Card */}
          <div
            className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-[#1e3a5f]/10"
            style={{
              background: "linear-gradient(135deg, hsl(212,51%,18%) 0%, hsl(212,51%,28%) 50%, hsl(220,40%,22%) 100%)"
            }}
          >
            {/* Watermark grid */}
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                backgroundSize: "24px 24px"
              }}
            />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-5 text-center md:text-left w-full md:w-auto">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 font-serif text-3xl sm:text-4xl shrink-0 shadow-inner">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold break-words">{user.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#c9a227]/20 border border-[#c9a227]/40 text-[#e8cc66] text-[10px] font-bold tracking-wider uppercase">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-1 break-all">{user.email}</p>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={handleLogout}
                  className="w-full md:w-auto px-5 py-3 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm hover:shadow min-h-[44px]"
                >
                  🚪 Logout
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="relative z-10 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
              {[
                { id: "overview",  label: "🏠 Dashboard",          desc: "Announcements & Groups" },
                { id: "giving",    label: "💝 Give Offering",       desc: "Tithes & Support" },
                { id: "interact",  label: "📝 Prayer & Testimony",  desc: "Share & Request" },
                { id: "history",   label: "📋 Giving History",      desc: "Past donations" },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "overview" | "giving" | "interact" | "history")}
                    className={`px-3 sm:px-5 py-3 rounded-xl text-left transition-all duration-150 cursor-pointer sm:flex-1 sm:min-w-[140px] min-h-[44px] touch-manipulation ${
                      active
                        ? "bg-[#c9a227] text-white shadow-md"
                        : "bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/80 hover:text-white"
                    }`}
                  >
                    <p className="font-bold text-[11px] sm:text-xs leading-tight">{tab.label}</p>
                    <p className="text-[9px] opacity-75 mt-0.5 hidden sm:block">{tab.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ──────────────── TAB CONTENT ──────────────── */}
          <div className="transition-all duration-300">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-start">
                {/* Left Columns (wider): Announcements */}
                <div className="md:col-span-2 space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-stone-200">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-stone-100">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 shrink-0 border border-amber-100">
                        📢
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#1e3a5f]">Church Announcements</h3>
                        <p className="text-xs text-stone-500">Latest updates from church leadership</p>
                      </div>
                    </div>

                    {loadingAnn ? (
                      <div className="text-center py-10 text-stone-400 text-sm">Loading announcements...</div>
                    ) : announcements.length === 0 ? (
                      <div className="text-center py-10 text-stone-400 text-sm">
                        <p className="text-2xl mb-2">🔔</p>
                        No announcements at this time.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {announcements.map((ann, i) => (
                          <div key={ann.id} className="relative rounded-2xl border border-stone-150 p-5 bg-stone-50/40">
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                              style={{ background: i === 0 ? "#c9a227" : "hsl(212,51%,35%)" }}
                            />
                            <div className="pl-3">
                              <div className="flex items-start justify-between gap-3 mb-1.5">
                                <h4 className="font-bold text-[#1e3a5f] text-sm leading-snug">{ann.title}</h4>
                                {i === 0 && (
                                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">{ann.content}</p>
                              <p className="text-[10px] text-stone-400 mt-3 font-semibold">
                                Posted {new Date(ann.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Joined Ministries & Events */}
                <div className="md:col-span-1 space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-stone-200">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-100">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-700 shrink-0 border border-indigo-100">
                        📅
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#1e3a5f]">My Events</h3>
                        <p className="text-xs text-stone-500">Events you&apos;ve registered for</p>
                      </div>
                    </div>

                    {loadingEvents ? (
                      <div className="text-center py-6 text-stone-400 text-xs">Loading...</div>
                    ) : eventRegistrations.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-stone-500">
                        <p className="text-xs leading-relaxed">You haven&apos;t registered for any events yet.</p>
                        <Link
                          href="/events"
                          className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 mt-3 text-xs font-bold text-[#c9a227] hover:underline rounded-xl bg-amber-50 border border-amber-100 touch-manipulation"
                        >
                          Browse Events
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {eventRegistrations.map((reg) => (
                          <Link
                            key={reg.id}
                            href={reg.event ? `/events/${reg.event.id}` : "/events"}
                            className="block p-4 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-stone-50 active:bg-stone-100 transition-colors min-h-[44px] touch-manipulation"
                          >
                            <h4 className="font-serif text-sm font-bold text-[#1e3a5f]">
                              {reg.event?.title ?? "Event"}
                            </h4>
                            {reg.event && (
                              <p className="text-[10px] text-stone-500 mt-1">
                                {new Date(reg.event.eventDate).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}{" "}
                                · {reg.guests} {reg.guests === 1 ? "guest" : "guests"}
                              </p>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-stone-200">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-100">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-blue-50 text-[#1e3a5f] shrink-0 border border-blue-100">
                        ⛪
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#1e3a5f]">My Ministries</h3>
                        <p className="text-xs text-stone-500">Your registered groups</p>
                      </div>
                    </div>

                    {memberMinistries.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-stone-500">
                        <p className="text-xs leading-relaxed text-stone-500">You haven&apos;t joined any ministries yet.</p>
                        <Link
                          href="/ministries"
                          className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 mt-3 text-xs font-bold text-[#c9a227] hover:underline rounded-xl bg-amber-50 border border-amber-100 touch-manipulation"
                        >
                          Find a Ministry
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {memberMinistries.map((ministry) => (
                          <div key={ministry.id} className="p-4 rounded-2xl border border-stone-100 bg-stone-50/50">
                            <h4 className="font-serif text-sm font-bold text-[#1e3a5f]">{ministry.name}</h4>
                            <p className="text-[9px] text-[#c9a227] font-semibold mt-0.5">Leader: {ministry.leader}</p>
                            <Link
                              href="/ministries"
                              className="inline-flex items-center gap-1 mt-3 min-h-[44px] px-3 py-2 text-[10px] font-bold text-[#1e3a5f] hover:underline rounded-lg bg-white border border-stone-200 touch-manipulation"
                            >
                              Go to Ministry
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 💝 GIVING TAB */}
            {activeTab === "giving" && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-stone-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 text-xl border border-amber-100 shadow-inner">
                      💝
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1e3a5f]">Give Offering &amp; Tithes</h3>
                      <p className="text-xs text-stone-500">Support the ministry and church programs safely</p>
                    </div>
                  </div>

                  <form onSubmit={handleGivingSubmit} className="space-y-6">
                    {givingStatus === "success" && (
                      <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                        ✓ Thank you! Your offering has been received. God bless your giving.
                      </div>
                    )}
                    {givingStatus === "error" && (
                      <div className="p-4 rounded-xl bg-red-50 text-red-800 text-xs font-semibold border border-red-200">
                        ❌ Failed to process donation. Please check details and try again.
                      </div>
                    )}

                    {/* Amount field */}
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                        Offering Amount (GHS)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">GHS</span>
                        <input
                          type="number"
                          required
                          min="1"
                          step="0.01"
                          value={givingAmount}
                          onChange={(e) => setGivingAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-14 pr-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] text-base font-medium text-stone-800"
                        />
                      </div>

                      {/* Presets */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[10, 20, 50, 100, 250, 500].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setGivingAmount(amt.toString())}
                            className="flex-1 min-w-[calc(33%-0.5rem)] sm:flex-none sm:min-w-0 px-3 sm:px-4 py-2.5 sm:py-2 text-xs font-bold rounded-lg border border-stone-200 hover:border-[#1e3a5f] hover:bg-stone-50 active:bg-stone-100 text-stone-600 transition-colors cursor-pointer min-h-[44px] touch-manipulation"
                          >
                            GHS {amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method field */}
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] text-sm text-stone-700 bg-white"
                      >
                        {["Credit Card", "Mobile Money", "Bank Transfer", "PayPal"].map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-stone-500 text-[11px]">
                      <span>🔒</span>
                      <span>Your offering is processed securely. All contributions are tax-deductible.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={givingStatus === "loading"}
                      className="w-full py-3.5 rounded-xl bg-[#1e3a5f] hover:bg-[#2a5082] text-white text-sm font-bold tracking-wide transition-colors cursor-pointer shadow-md disabled:opacity-60 min-h-[48px] touch-manipulation"
                    >
                      {givingStatus === "loading" ? "Processing Offering..." : "Submit Offering"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 📝 INTERACT TAB (PRAYER & TESTIMONY) */}
            {activeTab === "interact" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-start">
                {/* Prayer Request Form */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-stone-200 flex flex-col">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-100">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 text-xl border border-blue-100 shadow-inner">
                      🙏
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#1e3a5f]">Request Prayer</h3>
                      <p className="text-xs text-stone-500">Submit requests directly to pastors</p>
                    </div>
                  </div>

                  <form onSubmit={handlePrayerSubmit} className="flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs text-stone-500 leading-relaxed mb-4">
                        We believe in the power of prayer. Submit your request and our leadership will pray over it. All requests are kept strictly confidential.
                      </p>
                      <textarea
                        required
                        rows={5}
                        value={prayerRequest}
                        onChange={(e) => setPrayerRequest(e.target.value)}
                        placeholder="Write your request here..."
                        className="w-full px-4 py-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 resize-none text-stone-700 leading-relaxed"
                      />
                    </div>
                    <div>
                      {prayerStatus === "success" && (
                        <p className="text-emerald-600 text-xs font-semibold mb-2">✓ Prayer request submitted successfully!</p>
                      )}
                      {prayerStatus === "error" && (
                        <p className="text-red-600 text-xs font-semibold mb-2">❌ Failed to submit request. Please try again.</p>
                      )}
                      <button
                        type="submit"
                        disabled={prayerStatus === "loading"}
                        className="w-full py-3 rounded-xl bg-[#1e3a5f] text-white text-xs font-semibold hover:bg-[#2a5082] transition-colors disabled:opacity-60 cursor-pointer shadow-sm min-h-[48px] touch-manipulation"
                      >
                        {prayerStatus === "loading" ? "Submitting..." : "Submit Prayer Request"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Share Testimony Form */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-stone-200 flex flex-col">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-100">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 text-xl border border-amber-100 shadow-inner">
                      ✨
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#1e3a5f]">Share Testimony</h3>
                      <p className="text-xs text-stone-500">Inspire the church community</p>
                    </div>
                  </div>

                  <form onSubmit={handleTestimonySubmit} className="flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs text-stone-500 leading-relaxed mb-4">
                        Share how God has worked in your life! Approved testimonies will be shown on the live screens to inspire others.
                      </p>
                      <textarea
                        required
                        rows={4}
                        value={testimony}
                        onChange={(e) => setTestimony(e.target.value)}
                        placeholder="Write your testimony here..."
                        className="w-full px-4 py-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 resize-none text-stone-700 leading-relaxed"
                      />
                      
                      {/* Image upload */}
                      <div className="mt-4">
                        <label className="block text-[10px] font-bold text-stone-500 mb-2 uppercase tracking-wider">
                          Attach a Photo (optional, max 5MB)
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl border border-dashed border-stone-300 hover:border-[#c9a227] hover:bg-[#fdf8ec]/10 active:bg-[#fdf8ec]/20 transition-colors group min-h-[48px] touch-manipulation">
                          <span className="text-xl">🖼️</span>
                          <span className="text-xs text-stone-500 group-hover:text-[#c9a227] transition-colors">
                            {testimonyImage ? "Change attached photo" : "Select photo file..."}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleTestimonyImageChange}
                          />
                        </label>
                        {testimonyImagePreview && (
                          <div className="mt-3 relative border border-stone-200 rounded-xl overflow-hidden shadow-inner bg-stone-50">
                            <img
                              src={testimonyImagePreview}
                              alt="Testimony upload preview"
                              className="w-full h-24 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => { setTestimonyImage(null); setTestimonyImagePreview(null); }}
                              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 hover:bg-black/80 text-white text-sm flex items-center justify-center transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      {testimonyStatus === "success" && (
                        <p className="text-emerald-600 text-xs font-semibold mb-2">✓ Testimony shared for approval!</p>
                      )}
                      {testimonyStatus === "error" && (
                        <p className="text-red-600 text-xs font-semibold mb-2">❌ Failed to submit testimony. Please try again.</p>
                      )}
                      <button
                        type="submit"
                        disabled={testimonyStatus === "loading"}
                        className="w-full py-3 rounded-xl bg-[#c9a227] hover:bg-[#b8911f] text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer shadow-sm min-h-[48px] touch-manipulation"
                      >
                        {testimonyStatus === "loading" ? "Sharing..." : "Share Testimony"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 📋 GIVING HISTORY TAB */}
            {activeTab === "history" && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-stone-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 text-xl border border-amber-100 shadow-inner shrink-0">
                      📋
                    </div>
                    <div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#1e3a5f]">Giving History</h3>
                      <p className="text-xs text-stone-500">Your faithful financial stewardship</p>
                    </div>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-2xl flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                    <span className="text-xs text-stone-500 font-semibold">Total Contributed:</span>
                    <span className="font-serif text-base font-bold text-[#1e3a5f]">
                      GHS {donations.reduce((acc, d) => acc + d.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {loadingDonations ? (
                  <div className="text-center py-10 text-stone-400 text-sm">Loading giving history...</div>
                ) : donations.length === 0 ? (
                  <div className="text-center py-10 sm:py-12 text-stone-400 text-sm">
                    <p className="text-3xl mb-3">💝</p>
                    <p className="font-semibold text-stone-600">No giving history found.</p>
                    <p className="text-stone-400 text-[11px] mt-1">Thank you for considering supporting the church.</p>
                    <button
                      onClick={() => setActiveTab("giving")}
                      className="mt-4 px-4 py-3 rounded-xl bg-[#1e3a5f] hover:bg-[#2a5082] text-white text-xs font-semibold transition-colors cursor-pointer min-h-[44px] touch-manipulation"
                    >
                      Make a Contribution
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                      {donations.map((d) => (
                        <div key={d.id} className="rounded-xl border border-stone-200 p-4 bg-stone-50/50">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <p className="font-serif font-bold text-[#1e3a5f]">GHS {d.amount.toFixed(2)}</p>
                            <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-[10px] font-medium">
                              {d.paymentMethod}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500">
                            {new Date(d.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-[10px] font-mono text-stone-400 mt-1">ID: {d.id.substring(0, 8)}...</p>
                        </div>
                      ))}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-stone-200 text-stone-500 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Donation ID</th>
                            <th className="py-3 px-4">Method</th>
                            <th className="py-3 px-4 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-xs text-stone-600">
                          {donations.map((d) => (
                            <tr key={d.id} className="hover:bg-stone-50/50 transition-colors">
                              <td className="py-3 px-4 font-semibold">
                                {new Date(d.date).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="py-3 px-4 font-mono text-[10px] text-stone-400">
                                {d.id.substring(0, 8)}...
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-[10px] font-medium">
                                  {d.paymentMethod}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-serif font-bold text-[#1e3a5f]">
                                GHS {d.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </section>
    </>
  );
}
