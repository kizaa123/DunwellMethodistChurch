"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Donation } from "@/types";

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.admin.getDonations()
      .then(setDonations)
      .catch((err) => {
        console.error("Failed to load donations, using fallback:", err);
        setError("Could not load donations from database. Showing static fallback list.");
        setDonations([
          { id: "1", amount: 100, paymentMethod: "card", date: "2026-06-18" },
          { id: "2", amount: 250, paymentMethod: "bank", date: "2026-06-15" },
          { id: "3", amount: 50, paymentMethod: "mobile", date: "2026-06-10" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const total = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-2">Donations</h1>
      <p className="text-stone-500 mb-2">View and track church donations</p>
      <p className="text-lg font-semibold text-[#c9a227] mb-8">Total: ${total.toFixed(2)}</p>

      {error && (
        <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-xs mb-4 border border-amber-200 animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 bg-white rounded-xl border border-stone-200">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-stone-600">Date</th>
                <th className="text-left px-6 py-3 font-medium text-stone-600">Amount</th>
                <th className="text-left px-6 py-3 font-medium text-stone-600">Method</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-stone-500">No donations received yet.</td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 text-stone-600">
                      {new Date(donation.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#1e3a5f]">${donation.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-stone-600 capitalize">{donation.paymentMethod}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
