import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Tag,
  Save,
  Eye,
  EyeOff,
  Plus,
  X,
  CheckCircle,
} from "lucide-react";
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
        const res = await axiosInstance.get("/users/me");
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
      await axiosInstance.put("/users/profile", { fullName: profile.fullName });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveInterests = async () => {
    try {
      await axiosInstance.put("/users/profile", { interests });
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
      await axiosInstance.put("/users/password", {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
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
    { id: "profile", label: "Personal Info", icon: <User size={16} /> },
    { id: "interests", label: "Interests", icon: <Tag size={16} /> },
    { id: "security", label: "Change Password", icon: <Lock size={16} /> },
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
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {SidebarComponent}

      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Hero Avatar Card */}
          <div className="bg-gradient-to-br from-[#0A1628] to-[#1a3a6b] rounded-2xl p-8 mb-8 flex items-center gap-6 shadow-lg">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleColor[user?.role] || "from-gray-500 to-gray-700"} text-white text-2xl font-bold flex items-center justify-center shadow-inner border border-white/10`}>
              {initials}
            </div>
            <div className="text-white">
              <h1 className="font-serif text-2xl font-bold leading-tight mb-1">
                {profile.fullName || "Your Profile"}
              </h1>
              <div className="flex items-center gap-2.5">
                <Mail size={13} className="text-white/50" />
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
                className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === s.id
                    ? "bg-[#0A1628] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>

          {/* PERSONAL INFO */}
          {activeSection === "profile" && (
            <div className="bg-white border border-black/5 rounded-2xl p-8 shadow-sm">
              <h2 className="font-bold text-[#0A1628] text-xl mb-6">Personal Information</h2>
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full pl-11 pr-4 py-3 border border-black/10 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-6 py-3 bg-[#0A1628] text-white text-sm font-semibold rounded-xl hover:bg-[#0F2340] transition-all disabled:opacity-60"
                  >
                    <Save size={15} />
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* INTERESTS */}
          {activeSection === "interests" && (
            <div className="bg-white border border-black/5 rounded-2xl p-8 shadow-sm">
              <h2 className="font-bold text-[#0A1628] text-xl mb-2">Your Interests</h2>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Select the technologies you're interested in. This helps us personalize your question feed.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {INTEREST_OPTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide border transition-all ${
                      interests.includes(item)
                        ? "bg-[#0A1628] text-white border-[#0A1628] shadow-sm"
                        : "bg-gray-50 text-gray-600 border-black/10 hover:bg-gray-100"
                    }`}
                  >
                    {interests.includes(item) && <CheckCircle size={12} />}
                    {item}
                  </button>
                ))}
              </div>

              {/* Custom interest input */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Add custom interest (e.g. GraphQL)..."
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())}
                  className="flex-1 px-4 py-2.5 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                />
                <button
                  onClick={addCustomInterest}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Selected interests preview */}
              {interests.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Selected ({interests.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                        {i}
                        <button onClick={() => toggleInterest(i)} className="hover:text-red-500 transition-colors">
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveInterests}
                className="flex items-center gap-2 px-6 py-3 bg-[#0A1628] text-white text-sm font-semibold rounded-xl hover:bg-[#0F2340] transition-all"
              >
                <Save size={15} /> Save Interests
              </button>
            </div>
          )}

          {/* SECURITY / CHANGE PASSWORD */}
          {activeSection === "security" && (
            <div className="bg-white border border-black/5 rounded-2xl p-8 shadow-sm">
              <h2 className="font-bold text-[#0A1628] text-xl mb-2">Change Password</h2>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Choose a strong password that's at least 6 characters long. You'll be kept logged in.
              </p>

              <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={passwords.current}
                      required
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full pl-11 pr-12 py-3 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwords.newPass}
                      required
                      minLength={6}
                      onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                      className="w-full pl-11 pr-12 py-3 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {passwords.newPass && (
                    <div className="mt-2 flex gap-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                          passwords.newPass.length >= i * 3
                            ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-amber-400" : i <= 3 ? "bg-blue-400" : "bg-green-500"
                            : "bg-gray-200"
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={passwords.confirm}
                      required
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm focus:outline-none transition-all ${
                        passwords.confirm && passwords.confirm !== passwords.newPass
                          ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-50"
                          : "border-black/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                      }`}
                      placeholder="Confirm new password"
                    />
                    {passwords.confirm && passwords.confirm === passwords.newPass && (
                      <CheckCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                    )}
                  </div>
                  {passwords.confirm && passwords.confirm !== passwords.newPass && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPw}
                    className="flex items-center gap-2 px-6 py-3 bg-[#0A1628] text-white text-sm font-semibold rounded-xl hover:bg-[#0F2340] transition-all disabled:opacity-60"
                  >
                    <Lock size={15} />
                    {changingPw ? "Updating..." : "Update Password"}
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
