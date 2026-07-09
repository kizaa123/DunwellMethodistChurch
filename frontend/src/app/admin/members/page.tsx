"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Member } from "@/types";

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.admin.getMembers()
      .then(setMembers)
      .catch((err) => {
        console.error("Failed to load members, using fallback:", err);
        setError("Could not load members from database. Showing static fallback list.");
        setMembers([
          { id: "1", userId: "1", phone: "555-0101", department: "Usher Board", user: { id: "1", name: "John Smith", email: "john@example.com", role: "MEMBER", createdAt: "" } },
          { id: "2", userId: "2", phone: "555-0102", department: "Choir", user: { id: "2", name: "Jane Doe", email: "jane@example.com", role: "MEMBER", createdAt: "" } },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1e3a5f]">Members</h1>
        <p className="text-stone-500 text-sm">Manage church members and their profiles</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-xs mb-4 border border-amber-200 animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 bg-white rounded-xl border border-stone-200">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f]"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-10 text-center text-stone-500 text-sm">
          No members registered yet.
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {members.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-[#1e3a5f]">{member.user?.name}</p>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1e3a5f] text-xs font-medium shrink-0">
                    {member.user?.role}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-stone-600">
                  <p className="break-all"><span className="text-stone-400 text-xs">Email:</span> {member.user?.email}</p>
                  <p><span className="text-stone-400 text-xs">Phone:</span> {member.phone || "N/A"}</p>
                  <p><span className="text-stone-400 text-xs">Department:</span> {member.department || "General"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-stone-600">Name</th>
                    <th className="text-left px-6 py-3 font-medium text-stone-600">Email</th>
                    <th className="text-left px-6 py-3 font-medium text-stone-600">Phone</th>
                    <th className="text-left px-6 py-3 font-medium text-stone-600">Department</th>
                    <th className="text-left px-6 py-3 font-medium text-stone-600">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#1e3a5f]">{member.user?.name}</td>
                      <td className="px-6 py-4 text-stone-600">{member.user?.email}</td>
                      <td className="px-6 py-4 text-stone-600">{member.phone || "N/A"}</td>
                      <td className="px-6 py-4 text-stone-600">{member.department || "General"}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1e3a5f] text-xs font-medium">
                          {member.user?.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
