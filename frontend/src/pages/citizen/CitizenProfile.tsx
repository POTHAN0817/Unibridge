import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { User, Mail, Phone, MapPin, Building, Shield, Save, CheckCircle2 } from "lucide-react";

export default function CitizenProfile() {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [state, setState] = useState(user?.state || "");
  const [district, setDistrict] = useState(user?.district || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setState(user.state || "");
      setDistrict(user.district || "");
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      state,
      district,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Citizen Profile & Preferences"
        title="Account Settings"
        subtitle="Manage your personal info, district representation, and notification preferences."
      />

      <PageContainer maxWidth="lg">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs">
          {saved && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} /> Profile settings saved successfully!
            </div>
          )}

          {/* User badge */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-extrabold shadow-sm">
              {user?.avatar || (user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "C")}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#071A33]">{user?.name || user?.email || "Citizen User"}</h2>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                <Shield size={11} /> Verified Citizen Reporter
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98401 23456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gray-100">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer transition-all"
              >
                <Save size={15} /> Save Changes
              </button>

              <button
                type="button"
                onClick={logout}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Sign out of account
              </button>
            </div>
          </form>
        </div>
      </PageContainer>
    </div>
  );
}
