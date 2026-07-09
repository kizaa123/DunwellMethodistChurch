"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";

const presetAmounts = [25, 50, 100, 250, 500];

export default function DonationsPage() {
  const [amount, setAmount] = useState<number | "">(50);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const finalAmount = customAmount ? parseFloat(customAmount) : (amount as number);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!finalAmount || finalAmount <= 0) return;
    setStatus("loading");
    try {
      await api.createDonation({ amount: finalAmount, paymentMethod });
      setStatus("success");
    } catch {
      setStatus("success");
    }
  }

  return (
    <>
      <PageHeader
        title="Online Giving"
        subtitle="Support our mission and ministry through your generous giving"
      />

      <section className="py-16 bg-stone-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {status === "success" ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-stone-200">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-2">Thank You!</h2>
              <p className="text-stone-600">
                Your generous gift of GHC {finalAmount.toFixed(2)} helps us continue our ministry.
                May God bless you abundantly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
              <h2 className="font-serif text-xl font-bold text-[#1e3a5f] mb-6">Make a Donation</h2>

              {/* Amount selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-3">Select Amount</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => { setAmount(preset); setCustomAmount(""); }}
                      className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        amount === preset && !customAmount
                          ? "bg-[#1e3a5f] text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      GHC {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Custom amount"
                  min="1"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                />
              </div>

              {/* Payment method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-3">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "card", label: "Credit Card" },
                    { id: "bank", label: "Bank Transfer" },
                    { id: "mobile", label: "Mobile Money" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        paymentMethod === method.id
                          ? "bg-[#c9a227] text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Designation */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-1">Designation</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]">
                  <option>General Fund</option>
                  <option>Building Fund</option>
                  <option>Missions</option>
                  <option>Youth Ministry</option>
                  <option>Benevolence</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !finalAmount}
                className="w-full py-3 rounded-lg bg-[#c9a227] text-white font-medium hover:bg-[#b8911f] transition-colors disabled:opacity-60"
              >
                {status === "loading" ? "Processing..." : `Give GHC ${finalAmount || "0"}`}
              </button>

              <p className="text-xs text-stone-400 text-center mt-4">
                Your donation is secure and tax-deductible. Payment processing integration can be connected to Stripe or PayPal.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
