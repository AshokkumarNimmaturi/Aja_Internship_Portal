import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// ✅ UPGRADED: Switched to elite Heroicons 2 (React Icons)
import { 
  HiArrowRightOnRectangle, 
  HiBars3, 
  HiXMark,
  HiHome,
  HiPencilSquare,
  HiClipboardDocumentList,
  HiChatBubbleLeftEllipsis,
  HiUser,
  HiClock,
  HiKey,
  HiInboxStack,
  HiUsers,
  HiArchiveBox,
  HiChartBar,
  HiMagnifyingGlass,
  HiBookmark,
  HiCreditCard,
  HiPhone,
  HiPhoneXMark,
  HiChatBubbleLeftRight
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

export const PortalSidebar = ({ user, role, pendingCount: initialCount = 0 }) => {
  const [isHovered, setIsHovered] = useState(() => {
    // ✅ ELITE UX: Persist hover state to prevent sidebar "blink" during navigation
    return sessionStorage.getItem("sidebar_hovered") === "true";
  });
  const [livePendingCount, setLivePendingCount] = useState(initialCount);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (role === 'ADMIN' || role === 'TUTOR') {
        try {
          const res = await axiosInstance.get("/questions/pending");
          const data = res.data.content || res.data;
          setLivePendingCount(Array.isArray(data) ? data.length : 0);
        } catch (err) {
          console.error("Sidebar count fetch failed");
        }
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 60000); // Refetch every 60s
    return () => clearInterval(interval);
  }, [role]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const employeeNav = [
    { label: "Dashboard", icon: <HiHome size={22} />, path: "/portal/dashboard" },
    { label: "Global Intel", icon: <HiInboxStack size={22} />, path: "/portal/questions" }, // ✅ NEW: Intelligence Directory
    { label: "Submit Question", icon: <HiPencilSquare size={22} />, path: "/portal/submit" },
    { label: "My Submissions", icon: <HiClipboardDocumentList size={22} />, path: "/portal/submissions" },
    { label: "My Answers", icon: <HiChatBubbleLeftEllipsis size={22} />, path: "/portal/answers" },
    { label: "Profile", icon: <HiUser size={22} />, path: "/portal/profile" },
  ];
  const tutorNav = [
    { label: "Dashboard", icon: <HiHome size={22} />, path: "/portal/dashboard" },
    { label: "Pending Review", icon: <HiClock size={22} />, path: "/portal/review", badge: livePendingCount },
    { label: "Global Intel", icon: <HiInboxStack size={22} />, path: "/portal/questions" }, // ✅ SYNC: Consistent Label
    { label: "Submit Question", icon: <HiPencilSquare size={22} />, path: "/portal/submit" },
    { label: "My Submissions", icon: <HiClipboardDocumentList size={22} />, path: "/portal/submissions" },
    { label: "Access Requests", icon: <HiKey size={22} />, path: "/portal/access" },
    { label: "Support Logs", icon: <HiPhone size={22} />, path: "/portal/support-logs" },
    { label: "Profile", icon: <HiUser size={22} />, path: "/portal/profile" },
  ];
  const adminNav = [
    { label: "Dashboard", icon: <HiHome size={22} />, path: "/portal/dashboard" },
    { label: "Global Intel", icon: <HiInboxStack size={22} />, path: "/portal/questions" }, // ✅ NEW: Intelligence Directory for Admin
    { label: "Users", icon: <HiUsers size={22} />, path: "/portal/admin" },
    { label: "Pending Review", icon: <HiClock size={22} />, path: "/portal/admin/review", badge: livePendingCount },
    { label: "Submit Question", icon: <HiPencilSquare size={22} />, path: "/portal/submit" },
    { label: "My Submissions", icon: <HiClipboardDocumentList size={22} />, path: "/portal/submissions" },
    { label: "Access Requests", icon: <HiKey size={22} />, path: "/portal/access" },
    { label: "Support Logs", icon: <HiPhone size={22} />, path: "/portal/support-logs" },
    { label: "Packages", icon: <HiArchiveBox size={22} />, path: "/portal/packages" },
    { label: "Audit Log", icon: <HiChartBar size={22} />, path: "/portal/audit" },
    { label: "Profile", icon: <HiUser size={22} />, path: "/portal/profile" },
  ];

  const subscriberNav = [
    { label: "Dashboard", icon: <HiHome size={22} />, path: "/dashboard" },
    { label: "Questions", icon: <HiMagnifyingGlass size={22} />, path: "/dashboard/questions" },
    { label: "Bookmarks", icon: <HiBookmark size={22} />, path: "/dashboard/bookmarks" },
    { label: "Subscription", icon: <HiCreditCard size={22} />, path: "/dashboard/subscription" },
    { label: "Profile", icon: <HiUser size={22} />, path: "/dashboard/profile" },
  ];

  const navItems = role === "ADMIN" ? adminNav : role === "TUTOR" ? tutorNav : role === "SUBSCRIBER" ? subscriberNav : employeeNav;

  const roleBadgeStyle = {
    ADMIN: "bg-indigo-500 text-white shadow-indigo-500/30",
    TUTOR: "bg-blue-500 text-white shadow-blue-500/30",
    EMPLOYEE: "bg-amber-500 text-white shadow-amber-500/30",
    SUBSCRIBER: "bg-emerald-500 text-white shadow-emerald-500/30",
  };

  const roleLabels = {
    ADMIN: "AD",
    TUTOR: "TU",
    EMPLOYEE: "EM",
    SUBSCRIBER: "SB"
  };

  return (
    <>
    <aside 
      id="portal-sidebar"
      className={`bg-[#0A1628] h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ease-in-out z-50 shadow-xl ${isHovered ? 'w-64' : 'w-[84px]'}`}
      onMouseEnter={() => {
        setIsHovered(true);
        sessionStorage.setItem("sidebar_hovered", "true");
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        sessionStorage.setItem("sidebar_hovered", "false");
      }}
    >
      {/* Logo */}
      <div className="p-5 border-b border-white/10 h-28 flex flex-col justify-center shrink-0 overflow-hidden relative">
        <Link to="/" className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner overflow-hidden">
            <img src="/logo.png" alt="Aja logo" className="w-7 h-auto object-contain" />
          </div>
          <div className={`whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="text-white text-sm font-bold tracking-tight leading-tight">
              Aja Interview Vault
            </div>
            <div className="text-white/40 text-xs font-medium tracking-wide mt-0.5 leading-tight">
              Internal Portal
            </div>
          </div>
        </Link>
        {/* Role Badge */}
        <div className={`mt-4 absolute bottom-3 transition-all duration-300 ${isHovered ? 'left-16' : 'left-0 w-full flex justify-center'}`}>
          {isHovered ? (
             <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-md whitespace-nowrap shadow-sm border border-white/10 ${roleBadgeStyle[role] || "bg-gray-600 text-white"}`}>
              {role}
            </span>
          ) : (
            <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md shadow-sm border border-white/10 ${roleBadgeStyle[role] || "bg-gray-600 text-white"}`} title={role}>
              {roleLabels[role] || "P"}
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-2.5 overflow-y-auto scrollbar-hide overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center rounded-xl transition-all duration-200 h-12 relative group ${
                isActive
                  ? "bg-white/10 text-white backdrop-blur-sm shadow-inner border border-white/5"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              } ${isHovered ? 'px-4 justify-between gap-3 font-medium' : 'justify-center mx-2'}`}
              title={!isHovered ? item.label : ""}
            >
              {isActive && !isHovered && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-md shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
              <div className={`flex items-center ${isHovered ? 'gap-3.5' : ''}`}>
                <span className={`shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                <span className={`text-sm whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                 isHovered ? (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full relative z-10 shrink-0 shadow-sm border border-red-600">
                    {item.badge}
                  </span>
                 ) : (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0A1628] shadow-sm"></span>
                 )
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-5 border-t border-white/10 flex flex-col gap-3 shrink-0 overflow-hidden">
        <div className={`flex items-center ${isHovered ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-md border border-white/10" title={!isHovered ? (user?.fullName || user?.name) : ""}>
              {(user?.fullName || user?.name)?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className={`whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <div className="text-sm font-bold text-white leading-tight truncate w-24">
                {user?.fullName || user?.name || "User"}
              </div>
              <div className="text-[11px] font-medium text-white/40 mt-0.5 leading-tight truncate w-24">
                {user?.email || ""}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={!isHovered ? "Logout" : ""}
            className={`text-white/40 hover:text-white transition-colors shrink-0 p-2.5 rounded-xl hover:bg-red-500 hover:shadow-md ${!isHovered && 'hidden'}`}
          >
            <HiArrowRightOnRectangle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
    {/* Sidebar Spacer to maintain flex layout space while sidebar is fixed */}
    <div className={`shrink-0 transition-all duration-300 ${isHovered ? 'w-64' : 'w-[84px]'}`} />
    </>
  );
};

export default PortalSidebar;
