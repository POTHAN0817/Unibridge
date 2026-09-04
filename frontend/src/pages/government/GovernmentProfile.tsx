import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { Landmark, Mail, Phone, Building, Save, CheckCircle2 } from "lucide-react";

export default function GovernmentProfile() {
  const { user, updateProfile, logout } = useAuth();

  const [dept, setDept] = useState(user?.department || "");
  const [name, setName] = useState(user?.name || "");
  const [designation, setDesignation] = useState(user?.designation || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [state, setState] = useState(user?.state || "");
  const [district, setDistrict] = useState(user?.district || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setDept(user.department || (user.profile as Record<string, any>)?.department_name || "");
      setName(user.name || (user.profile as Record<string, any>)?.officer_name || (user.profile as Record<string, any>)?.full_name || "");
      setDesignation(user.designation || (user.profile as Record<string, any>)?.designation || "");
      setPhone(user.phone || (user.profile as Record<string, any>)?.phone || "");
      setState(user.state || (user.profile as Record<string, any>)?.state || "");
      setDistrict(user.district || (user.profile as Record<string, any>)?.district || "");
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      department: dept,
      name,
      designation,
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
        badge="Official Officer Account"
        badgeColor="#10B981"
        title="Government Nodal Officer Profile"
        subtitle="Manage government officer credentials, ministry authorization, and district coverage."
      />

      <PageContainer maxWidth="lg">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs">
          {saved && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} /> Official officer profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Department / Ministry
              </label>
              <input
                type="text"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Officer Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Official Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gray-100">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer"
              >
                <Save size={15} /> Save Officer Profile
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
