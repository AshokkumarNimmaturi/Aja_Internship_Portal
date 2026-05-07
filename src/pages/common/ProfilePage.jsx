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
  HiCamera,
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/subscriber/Sidebar";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import { fetchMe, updateProfile, changePassword } from "../../api/authApi";
import toast from "react-hot-toast";

const INTEREST_OPTIONS = [
  "Java", "Spring Boot", "React", "JavaScript", "TypeScript",
  "Python", "Django", "DevOps", "Docker", "Kubernetes", "Salesforce",
  "SQL", "REST APIs", "Microservices", "Machine Learning",
];

const ProfilePage = ({ isPortal = false }) => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Profile state
  const [profile, setProfile] = useState({ fullName: user?.fullName || user?.name || "", email: user?.email || "" });
  const [profilePic, setProfilePic] = useState(user?.profilePicture || null);
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
        const res = await fetchMe();
        const data = res.data;
        setProfile({ fullName: data.fullName || data.name || "", email: data.email || "" });
        setProfilePic(data.profilePicture || null);
        setInterests(data.interests || []);
      } catch {
        // fallback to auth context
        setProfile({ fullName: user?.fullName || user?.name || "", email: user?.email || "" });
        setProfilePic(user?.profilePicture || null);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ fullName: profile.fullName, profilePicture: profilePic });
      updateUser({ fullName: profile.fullName, profilePicture: profilePic });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveInterests = async () => {
    try {
      await updateProfile({ interests });
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
      await changePassword({
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
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      {SidebarComponent}

      <main className="flex-1 p-8 py-10 overflow-y-auto w-full">
        <div className="max-w-3xl mx-auto">
          {/* Compact Profile Header */}
          <div className="bg-white border border-[#E3E6E8] rounded-lg p-6 mb-6 flex items-center gap-5 shadow-sm">
            <div className="relative group cursor-pointer">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
              ) : (
                <div className={`w-16 h-16 rounded-lg bg-[#0A1628] text-white text-xl font-bold flex items-center justify-center border border-white/10`}>
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <HiCamera size={24} className="text-white" />
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0A1628] leading-tight">
                {profile.fullName || "Identification"}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{profile.email}</span>
                <span className="text-gray-200">·</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0074CC]">
                  {user?.role || "USER"}
                </span>
              </div>
            </div>
          </div>

          {/* Section Tabs - Compact */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg border border-[#E3E6E8]">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 flex-1 justify-center py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeSection === s.id
                    ? "bg-white text-[#0A1628] shadow-sm ring-1 ring-black/5"
                    : "text-gray-400 hover:text-[#0A1628]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* PERSONAL INFO */}
          {activeSection === "profile" && (
            <div className="bg-white border border-[#E3E6E8] rounded-lg p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-6">
                 <h2 className="font-bold text-[#0A1628] text-sm mb-1 uppercase tracking-widest">Personal Details</h2>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Update your identification data</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:border-[#0074CC] focus:bg-white transition-all font-medium"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Email (Fixed)</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-black/5 rounded-lg text-sm text-gray-400 cursor-not-allowed font-medium"
                  />
                </div>

                <div className="pt-4 flex border-t border-gray-50">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all disabled:opacity-60"
                  >
                    {savingProfile ? "Saving..." : "Save Identity"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* INTERESTS */}
          {activeSection === "interests" && (
            <div className="bg-white border border-[#E3E6E8] rounded-lg p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-6">
                 <h2 className="font-bold text-[#0A1628] text-sm mb-1 uppercase tracking-widest">Mastery Subjects</h2>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Technologies you are currently mastering</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-8">
                {INTEREST_OPTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${
                      interests.includes(item)
                        ? "bg-[#0074CC] text-white border-[#0074CC]"
                        : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Custom interest */}
              <div className="space-y-1.5 mb-8">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Custom Tag</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. GraphQL"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:border-[#0074CC] transition-all font-medium"
                  />
                  <button
                    onClick={addCustomInterest}
                    className="px-4 py-2 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-gray-100 hover:bg-white transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50">
                <button
                  onClick={handleSaveInterests}
                  className="px-6 py-2.5 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all"
                >
                  Update Stream Preferences
                </button>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeSection === "security" && (
            <div className="bg-white border border-[#E3E6E8] rounded-lg p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="mb-6">
                 <h2 className="font-bold text-[#0A1628] text-sm mb-1 uppercase tracking-widest">Access Protocol</h2>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Manage your vault entry credentials</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={passwords.current}
                      required
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:border-[#0074CC] transition-all font-medium"
                      placeholder="Current access code"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
                    >
                      {showCurrent ? <HiEyeSlash size={16} /> : <HiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwords.newPass}
                      required
                      minLength={6}
                      onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:border-[#0074CC] transition-all font-medium"
                      placeholder="New access code"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
                    >
                      {showNew ? <HiEyeSlash size={16} /> : <HiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Confirm Entry</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    required
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:border-[#0074CC] transition-all font-medium"
                    placeholder="Verify entry code"
                  />
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <button
                    type="submit"
                    disabled={changingPw}
                    className="px-6 py-2.5 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all disabled:opacity-60"
                  >
                    {changingPw ? "Updating..." : "Authorize Update"}
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
