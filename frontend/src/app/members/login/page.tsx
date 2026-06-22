"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";

export default function MemberLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = isLogin
        ? await api.login(form.email, form.password)
        : await api.register(form);

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      if (result.user.role === "ADMIN" || result.user.role === "PASTOR") {
        router.push("/admin");
      } else {
        router.push("/members/profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Member Portal"
        subtitle={isLogin ? "Sign in to access your account" : "Create a new member account"}
      />

      <section className="py-16 bg-stone-50">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLogin ? "bg-[#1e3a5f] text-white" : "bg-stone-100 text-stone-600"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !isLogin ? "bg-[#1e3a5f] text-white" : "bg-stone-100 text-stone-600"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                  />
                </div>
              )}
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
                <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#1e3a5f] text-white font-medium hover:bg-[#2a5082] transition-colors disabled:opacity-60"
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-stone-500 mt-4">
              <Link href="/" className="text-[#c9a227] hover:underline">
                Back to home
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
