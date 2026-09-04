import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRole } from "../../types";
import { useAuth } from "../../auth/AuthContext";
import { RegisterData } from "../../auth/authTypes";
import { ArrowRight, CheckCircle2 } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the terms of service and civic participation charter.");
      return;
    }

    const expertiseArray = expertiseString
      ? expertiseString.split(",").map((s) => s.trim()).filter(Boolean)
      : ["General"];

    const capabilitiesArray = capabilitiesString
      ? capabilitiesString.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Mentorship", "Technical Support"];

    let payload: RegisterData;

    switch (role) {
      case "citizen":
        payload = {
          role: "citizen",
          data: {
            fullName: name || "Citizen Volunteer",
            email,
            phone,
            password,
            state,
            district,
            termsAccepted,
          },
        };
        break;
      case "university":
        payload = {
          role: "university",
          data: {
            universityName: orgName || "Institution of Technology",
            email,
            contactPerson: name || "Faculty Representative",
            designation: designation || "Professor / Dean",
            password,
            state,
            district,
            expertise: expertiseArray,
          },
        };
        break;
      case "industry":
        payload = {
          role: "industry",
          data: {
            companyName: orgName || "Enterprise Partner",
            email,
            contactPerson: name || "Innovation Lead",
            designation: designation || "Director",
            password,
            sector,
            location: `${district}, ${state}`,
            expertise: expertiseArray,
            capabilities: capabilitiesArray,
          },
        };
        break;
      case "government":
        payload = {
          role: "government",
          data: {
            departmentName: orgName || "Department of Public Administration",
            email,
            officerName: name || "Nodal Officer",
            designation: designation || "District Officer",
            password,
            state,
            district,
            departmentType: deptType,
          },
        };
        break;
    }

    const success = await register(payload);
    if (success) {
      navigate(`/${role}/dashboard`);
    } else {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
          {error}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sushmitha Krishnan"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98401 23456"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
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
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Kalasalingam Academy of Research and Education"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Anjali Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Designation
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Head of Department"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Areas of Academic Expertise (Comma separated)
            </label>
            <input
              type="text"
              value={expertiseString}
              onChange={(e) => setExpertiseString(e.target.value)}
              placeholder="e.g. IoT, Agricultural Engineering, Water Treatment"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
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
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. CoolTech India Pvt. Ltd."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-600 focus:outline-none"
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rajesh Mehta"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Designation
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="VP, Innovation"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-600 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Industry Sector
            </label>
            <input
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="e.g. CleanTech, Agri-IoT, Cloud & AI"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Support Capabilities (Comma separated)
            </label>
            <input
              type="text"
              value={capabilitiesString}
              onChange={(e) => setCapabilitiesString(e.target.value)}
              placeholder="e.g. Mentorship, Prototype Grants, Cloud Credits"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-600 focus:outline-none"
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
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Department of Science & Technology"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Officer Rajan"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Designation
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Director of Innovation"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Department Type
            </label>
            <select
              value={deptType}
              onChange={(e) => setDeptType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@organization.org"
          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
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
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
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
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
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
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            I agree to the UniBridge SIH 2026 Terms of Service, Public Interest Charter, and verified collaborative participation.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 mt-4"
        style={{ background: submitButtonColor }}
      >
        {isLoading ? (
          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
