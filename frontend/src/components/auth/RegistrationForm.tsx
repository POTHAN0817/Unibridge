import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRole } from "../../types";
import { useAuth } from "../../auth/AuthContext";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

interface RegistrationFormProps {
  role: UserRole;
  loginPath: string;
  submitButtonColor?: string;
}

const statesOfIndia = [
  "Tamil Nadu",
  "Karnataka",
  "Maharashtra",
  "Delhi",
  "Telangana",
  "Kerala",
  "Andhra Pradesh",
  "Gujarat",
  "Uttar Pradesh",
  "Other",
];

const tamilNaduDistricts = [
  "Jharkhand",
  "Virudhunagar",
  "Madurai",
  "Chennai",
  "Tiruchirappalli",
  "Coimbatore",
  "Dindigul",
  "Tenkasi",
  "Tirunelveli",
  "Salem",
  "Other District",
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  role,
  loginPath,
  submitButtonColor = "#0B63F6",
}) => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  // Shared form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Virudhunagar");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role specific fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orgName, setOrgName] = useState("");
  const [designation, setDesignation] = useState("");
  const [sector, setSector] = useState("CleanTech & IoT");
  const [deptType, setDeptType] = useState("Science & Technology");
  const [expertiseString, setExpertiseString] = useState("");
  const [capabilitiesString, setCapabilitiesString] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter an email address.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("Please accept the terms of service and civic participation charter.");
      return;
    }

    const expertiseArray = expertiseString
      ? expertiseString.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const capabilitiesArray = capabilitiesString
      ? capabilitiesString.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    let payload: Record<string, unknown>;

    switch (role) {
      case "citizen":
        payload = {
          full_name: name.trim(),
          email: trimmedEmail,
          phone: phone.trim(),
          password,
          confirm_password: confirmPassword,
          state,
          district,
          terms_accepted: termsAccepted,
        };
        break;

      case "university":
        payload = {
          university_name: orgName.trim(),
          university_email: trimmedEmail,
          contact_person: name.trim(),
          designation: designation.trim(),
          password,
          confirm_password: confirmPassword,
          state,
          district,
          expertise: expertiseArray,
        };
        break;

      case "industry":
        payload = {
          company_name: orgName.trim(),
          official_email: trimmedEmail,
          contact_person: name.trim(),
          designation: designation.trim(),
          password,
          confirm_password: confirmPassword,
          industry_sector: sector.trim(),
          location: `${district}, ${state}`,
          expertise: expertiseArray,
          support_capabilities: capabilitiesArray,
        };
        break;

      case "government":
        payload = {
          department_name: orgName.trim(),
          official_email: trimmedEmail,
          officer_name: name.trim(),
          designation: designation.trim(),
          password,
          confirm_password: confirmPassword,
          state,
          district,
          department_type: deptType,
        };
        break;
    }

    setIsSubmitting(true);

    try {
      const result = await register(role, payload);

      if (result.success) {
        if (result.autoLoggedIn) {
          // Option A: Backend logged user in immediately
          navigate(`/${role}/dashboard`, { replace: true });
        } else {
          // Option B: Registration created; redirect to login
          setSuccessMessage("Registration successful! Redirecting to login portal...");
          setTimeout(() => {
            navigate(loginPath, { replace: true });
          }, 1600);
        }
      } else {
        setErrorMessage(result.error || "Registration failed. Please check form values.");
      }
    } catch (err: any) {
      console.error("[UniBridge Register] Error:", err);
      if (err.message && err.message.includes("Unable to connect")) {
        setErrorMessage("Unable to connect to UniBridge backend. Please verify the backend server is active.");
      } else {
        setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2 animate-in fade-in duration-200"
        >
          <AlertCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
          <div className="leading-snug">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200"
        >
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <div className="leading-snug">{successMessage}</div>
        </div>
      )}

      {/* Role specific inputs */}
      {role === "citizen" && (
        <>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              disabled={isBusy}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sushmitha Krishnan"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              disabled={isBusy}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98401 23456"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none disabled:opacity-60"
            />
          </div>
        </>
      )}

      {role === "university" && (
        <>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              University / College Name
            </label>
            <input
              type="text"
              required
              disabled={isBusy}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Kalasalingam Academy of Research and Education"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none disabled:opacity-60"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Contact Person
              </label>
              <input
                type="text"
                required
                disabled={isBusy}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Anjali Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Designation
              </label>
              <input
                type="text"
                required
                disabled={isBusy}
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Head of Department"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Areas of Academic Expertise (Comma separated)
            </label>
            <input
              type="text"
              disabled={isBusy}
              value={expertiseString}
              onChange={(e) => setExpertiseString(e.target.value)}
              placeholder="e.g. IoT, Agricultural Engineering, Water Treatment"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none disabled:opacity-60"
            />
          </div>
        </>
      )}

      {role === "industry" && (
        <>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Company / Organization Name
            </label>
            <input
              type="text"
              required
              disabled={isBusy}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. CoolTech India Pvt. Ltd."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-600 focus:outline-none disabled:opacity-60"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Contact Person
              </label>
              <input
                type="text"
                required
                disabled={isBusy}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rajesh Mehta"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-600 focus:outline-none disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Designation
              </label>
              <input
                type="text"
                required
                disabled={isBusy}
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="VP, Innovation"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-600 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Industry Sector
            </label>
            <input
              type="text"
              disabled={isBusy}
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="e.g. CleanTech, Agri-IoT, Cloud & AI"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-600 focus:outline-none disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Support Capabilities (Comma separated)
            </label>
            <input
              type="text"
              disabled={isBusy}
              value={capabilitiesString}
              onChange={(e) => setCapabilitiesString(e.target.value)}
              placeholder="e.g. Mentorship, Prototype Grants, Cloud Credits"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-600 focus:outline-none disabled:opacity-60"
            />
          </div>
        </>
      )}

      {role === "government" && (
        <>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Department Name
            </label>
            <input
              type="text"
              required
              disabled={isBusy}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Department of Science & Technology"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none disabled:opacity-60"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Officer Name
              </label>
              <input
                type="text"
                required
                disabled={isBusy}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Officer Rajan"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Designation
              </label>
              <input
                type="text"
                required
                disabled={isBusy}
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Director of Innovation"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Department Type
            </label>
            <select
              disabled={isBusy}
              value={deptType}
              onChange={(e) => setDeptType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none disabled:opacity-60"
            >
              <option value="Science & Technology">Science & Technology</option>
              <option value="Agriculture & Farmers Welfare">Agriculture & Farmers Welfare</option>
              <option value="Water Resources & Sanitation">Water Resources & Sanitation</option>
              <option value="Rural Development & Panchayat Raj">Rural Development & Panchayat Raj</option>
              <option value="Education">Education</option>
            </select>
          </div>
        </>
      )}

      {/* Common Email & Password */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
          Official Email
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          disabled={isBusy}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@domain.com"
          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none disabled:opacity-60"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            disabled={isBusy}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none disabled:opacity-60"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            disabled={isBusy}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none disabled:opacity-60"
          />
        </div>
      </div>

      {/* State & District */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            State
          </label>
          <select
            disabled={isBusy}
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none disabled:opacity-60"
          >
            {statesOfIndia.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            District
          </label>
          <select
            disabled={isBusy}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none disabled:opacity-60"
          >
            {tamilNaduDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Terms acceptance */}
      <div className="pt-2">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            required
            disabled={isBusy}
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            I agree to the UniBridge Terms of Service, Public Interest Charter, and verified collaborative participation.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isBusy}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 mt-4"
        style={{ background: submitButtonColor }}
      >
        {isBusy ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          <>
            Complete {role.charAt(0).toUpperCase() + role.slice(1)} Registration
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <div className="text-center pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Already registered?{" "}
          <Link to={loginPath} className="font-bold text-blue-600 hover:text-blue-700 ml-1">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};
