import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// ✅ UPGRADED: Using elite Heroicons 2
import {
  HiUser,
  HiEnvelope,
  HiLockClosed,
  HiTag,
  HiDocumentCheck,
  HiEye,
  HiEyeSlash,
  HiPlus,
  HiXMark,
  HiCheckCircle,
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/subscriber/Sidebar";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const INTEREST_OPTIONS = [
  "Java", "Spring Boot", "React", "JavaScript", "TypeScript",
  "Python", "Django", "DevOps", "Docker", "Kubernetes", "Salesforce",
  "SQL", "REST APIs", "Microservices", "Machine Learning",
];

const ProfilePage = ({ isPortal = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile state
  const [profile, setProfile] = useState({ fullName: user?.fullName || user?.name || "", email: user?.email || "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Interests state
  const [interests, setInterests] = useState([]);
  const [customInterest, setCustomInterest] = useState("");

  // Password state
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  // Active section
  const [activeSection, setActiveSection] = useState("profile");

  // Load current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        const data = res.data;
        setProfile({ fullName: data.fullName || data.name || "", email: data.email || "" });
        setInterests(data.interests || []);
      } catch {
        // fallback to auth context
        setProfile({ fullName: user?.fullName || user?.name || "", email: user?.email || "" });
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await axiosInstance.put("/auth/profile", { fullName: profile.fullName });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveInterests = async () => {
    try {
      await axiosInstance.put("/auth/profile", { interests });
      toast.success("Interests saved!");
    } catch (err) {
      toast.error("Failed to save interests");
    }
  };

  const toggleInterest = (item) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCustomInterest = () => {
    const val = customInterest.trim();
    if (val && !interests.includes(val)) {
      setInterests((prev) => [...prev, val]);
    }
    setCustomInterest("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwords.newPass.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPw(true);
    try {
      await axiosInstance.post("/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
        confirmPassword: passwords.confirm,
      });
      toast.success("Password changed successfully!");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  const sections = [
    { id: "profile", label: "Personal Info", icon: <HiUser size={16} /> },
    { id: "interests", label: "Interests", icon: <HiTag size={16} /> },
    { id: "security", label: "Change Password", icon: <HiLockClosed size={16} /> },
  ];

  const initials = profile.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const roleColor = {
    ADMIN: "from-indigo-500 to-purple-600",
    TUTOR: "from-blue-500 to-cyan-500",
    EMPLOYEE: "from-amber-500 to-orange-500",
    SUBSCRIBER: "from-[#0A1628] to-[#2563EB]",
  };

  const SidebarComponent = isPortal
    ? <PortalSidebar user={user} role={user?.role} activeItem="Profile" />
    : <Sidebar />;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden py-10">
      {SidebarComponent}

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Hero Avatar Card */}
          <div className="bg-gradient-to-br from-[#0A1628] to-[#1a3a6b] rounded-2xl p-8 mb-8 flex items-center gap-6 shadow-lg shadow-blue-900/10 border border-white/5">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleColor[user?.role] || "from-gray-500 to-gray-700"} text-white text-2xl font-bold flex items-center justify-center shadow-inner border border-white/10`}>
              {initials}
            </div>
            <div className="text-white">
              <h1 className="font-serif text-2xl font-bold leading-tight mb-1">
                {profile.fullName || "Your Profile"}
              </h1>
              <div className="flex items-center gap-2.5">
                <HiEnvelope size={14} className="text-white/50" />
                <span className="text-sm text-white/60">{profile.email}</span>
              </div>
              <span className={`inline-block mt-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 bg-white/10`}>
                {user?.role || "USER"}
              </span>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2 mb-8 bg-white border border-black/5 rounded-2xl p-1.5 shadow-sm">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 flex-1 justify-center py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeSection === s.id
                    ? "bg-[#0A1628] text-white shadow-lg shadow-blue-900/10"
                    : "text-gray-400 hover:text-[#0A1628] hover:bg-gray-50"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>

          {/* PERSONAL INFO */}
          {activeSection === "profile" && (
            <div className="bg-white border border-black/5 rounded-2xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="font-bold text-[#0A1628] text-xl mb-6 font-serif">Personal Information</h2>
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <HiUser size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <HiEnvelope size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full pl-11 pr-4 py-4 bg-gray-100 border border-black/5 rounded-2xl text-sm text-gray-400 cursor-not-allowed font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 italic ml-1">Email address cannot be changed.</p>
                </div>

                <div className="pt-4 border-t border-black/5">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-8 py-4 bg-[#0A1628] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-[#0F2340] shadow-xl shadow-blue-900/10 transition-all disabled:opacity-60 active:scale-95"
                  >
                    <HiDocumentCheck size={18} />
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* INTERESTS */}
          {activeSection === "interests" && (
            <div className="bg-white border border-black/5 rounded-2xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="font-bold text-[#0A1628] text-xl mb-2 font-serif">Your Interests</h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed font-light">
                Select the technologies you're interested in. We use this to curate <span className="font-bold text-[#0A1628]">Elite Level Questions</span> for you.
              </p>

              <div className="flex flex-wrap gap-2.5 mb-8">
                {INTEREST_OPTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                      interests.includes(item)
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-lg shadow-blue-500/20"
                        : "bg-gray-50 text-gray-400 border-black/5 hover:bg-gray-100"
                    }`}
                  >
                    {interests.includes(item) && <HiCheckCircle size={14} className="animate-in zoom-in duration-300" />}
                    {item}
                  </button>
                ))}
              </div>

              {/* Custom interest */}
              <div className="space-y-2 mb-8">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Add Custom Tag</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="e.g. GraphQL, WebRTC..."
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())}
                    className="flex-1 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500 transition-all font-medium"
                  />
                  <button
                    onClick={addCustomInterest}
                    className="flex items-center gap-2 px-6 py-4 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all active:scale-95 shadow-sm"
                  >
                    <HiPlus size={18} /> Add
                  </button>
                </div>
              </div>

              {/* Selected preview */}
              {interests.length > 0 && (
                <div className="mb-10 p-5 bg-gray-50 rounded-3xl border border-black/5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">Mastery Track ({interests.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((i) => (
                      <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#2563EB] text-[10px] font-bold uppercase tracking-widest border border-blue-100 shadow-sm animate-in zoom-in duration-300">
                        {i}
                        <button onClick={() => toggleInterest(i)} className="hover:text-red-500 transition-colors">
                          <HiXMark size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-black/5">
                <button
                  onClick={handleSaveInterests}
                  className="flex items-center gap-2 px-8 py-4 bg-[#0A1628] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-[#0F2340] transition-all shadow-xl shadow-blue-900/10 active:scale-95"
                >
                  <HiDocumentCheck size={18} /> Update Track Interests
                </button>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeSection === "security" && (
            <div className="bg-white border border-black/5 rounded-2xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="font-bold text-[#0A1628] text-xl mb-2 font-serif">Security & Access</h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed font-light">
                Choose a strong, unique password to protect your <span className="font-bold text-[#0A1628]">Interview Vault</span> resources.
              </p>

              <form onSubmit={handleChangePassword} className="flex flex-col gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Current Password</label>
                  <div className="relative">
                    <HiLockClosed size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={passwords.current}
                      required
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500 transition-all font-medium"
                      placeholder="Verify current access"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                    >
                      {showCurrent ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">New Vault Password</label>
                  <div className="relative">
                    <HiLockClosed size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwords.newPass}
                      required
                      minLength={6}
                      onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                      className="w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500 transition-all font-medium"
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                    >
                      {showNew ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
                    </button>
                  </div>
                  {passwords.newPass && (
                    <div className="mt-3 flex gap-1.5 px-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                          passwords.newPass.length >= i * 3
                            ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-amber-400" : i <= 3 ? "bg-blue-400" : "bg-green-500"
                            : "bg-gray-100"
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <div className="relative">
                    <HiLockClosed size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="password"
                      value={passwords.confirm}
                      required
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className={`w-full pl-11 pr-12 py-4 border rounded-2xl text-sm focus:outline-none transition-all font-medium ${
                        passwords.confirm && passwords.confirm !== passwords.newPass
                          ? "bg-red-50/30 border-red-200 focus:border-red-400"
                          : "bg-gray-50 border-gray-100 focus:border-blue-500"
                      }`}
                      placeholder="Repeat new password"
                    />
                    {passwords.confirm && passwords.confirm === passwords.newPass && (
                      <HiCheckCircle size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in duration-300" />
                    )}
                  </div>
                  {passwords.confirm && passwords.confirm !== passwords.newPass && (
                    <p className="text-[10px] text-red-500 ml-1 font-bold">Passwords do not match</p>
                  )}
                </div>

                <div className="pt-6 border-t border-black/5">
                  <button
                    type="submit"
                    disabled={changingPw}
                    className="flex items-center gap-2 px-8 py-4 bg-[#0A1628] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-[#0F2340] shadow-xl shadow-blue-900/10 transition-all active:scale-95 disabled:opacity-60"
                  >
                    <HiLockClosed size={18} />
                    {changingPw ? "Updating Vault..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
