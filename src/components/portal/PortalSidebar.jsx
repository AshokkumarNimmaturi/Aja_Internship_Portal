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
  HiChatBubbleLeftRight,
  HiCommandLine,
  HiRectangleGroup
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
      // ✅ STRICT GUARD: Only Admin/Tutor allowed
      const isPrivileged = role === 'ADMIN' || role === 'TUTOR';
      if (!isPrivileged) {
        setLivePendingCount(0);
        return;
      }

      try {
        const res = await axiosInstance.get("/questions/pending");
        const data = res.data.content || res.data;
        setLivePendingCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        if (err.response?.status === 403) {
          setLivePendingCount(0);
        }
        console.warn("Sidebar notification sync restricted");
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 60000); 
    return () => clearInterval(interval);
  }, [role]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const employeeNav = [
    { label: "Dashboard", icon: <HiHome size={22} />, path: "/portal/dashboard" },
    { label: "Explorer", icon: <HiRectangleGroup size={22} />, path: "/portal/explorer" },
    { label: "Global Intel", icon: <HiInboxStack size={22} />, path: "/portal/questions" },
    { label: "Submit Question", icon: <HiPencilSquare size={22} />, path: "/portal/submit" },
    { label: "My Submissions", icon: <HiClipboardDocumentList size={22} />, path: "/portal/submissions" },
    { label: "My Answers", icon: <HiChatBubbleLeftEllipsis size={22} />, path: "/portal/answers" },
    { label: "Profile", icon: <HiUser size={22} />, path: "/portal/profile" },
  ];
  const tutorNav = [
    { label: "Dashboard", icon: <HiHome size={22} />, path: "/portal/dashboard" },
    { label: "Explorer", icon: <HiRectangleGroup size={22} />, path: "/portal/explorer" },
    { label: "Pending Review", icon: <HiClock size={22} />, path: "/portal/review", badge: livePendingCount },
    { label: "Global Intel", icon: <HiInboxStack size={22} />, path: "/portal/questions" },
    { label: "Submit Question", icon: <HiPencilSquare size={22} />, path: "/portal/submit" },
    { label: "My Submissions", icon: <HiClipboardDocumentList size={22} />, path: "/portal/submissions" },
    { label: "Access Requests", icon: <HiKey size={22} />, path: "/portal/access" },
    { label: "Support Logs", icon: <HiPhone size={22} />, path: "/portal/support-logs" },
    { label: "Profile", icon: <HiUser size={22} />, path: "/portal/profile" },
  ];
  const adminNav = [
    { label: "Dashboard", icon: <HiHome size={22} />, path: "/portal/dashboard" },
    { label: "Explorer", icon: <HiRectangleGroup size={22} />, path: "/portal/explorer" },
    { label: "Global Intel", icon: <HiInboxStack size={22} />, path: "/portal/questions" },
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
            <div className="text-white text-sm font-semibold tracking-tight">
              Aja Interview Vault
            </div>
            <div className="text-white/40 text-[10px] font-bold mt-0.5 tracking-wide">
              Internal Access
            </div>
          </div>
        </Link>
        {/* Role Identity */}
        <div className={`mt-4 absolute bottom-4 transition-all duration-300 ${isHovered ? 'left-16' : 'left-0 w-full flex justify-center'}`}>
          {isHovered ? (
             <span className={`text-[10px] font-bold px-3 py-1 rounded bg-white/5 border border-white/10 uppercase tracking-wider text-white shadow-sm`}>
              {role}
            </span>
          ) : (
            <span className={`text-[10px] font-bold px-2 py-1 rounded bg-white/5 border border-white/10 text-white`} title={role}>
              {roleLabels[role] || "U"}
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-2 overflow-y-auto scrollbar-hide overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center rounded-xl transition-all duration-200 h-12 relative group ${
                isActive
                  ? "bg-white/10 text-white border border-white/5 shadow-sm"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              } ${isHovered ? 'px-4 justify-between gap-3' : 'justify-center mx-2'}`}
              title={!isHovered ? item.label : ""}
            >
              <div className={`flex items-center ${isHovered ? 'gap-3.5' : ''}`}>
                <span className={`shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                <span className={`text-[13px] font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                 isHovered ? (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md relative z-10 shrink-0">
                    {item.badge}
                  </span>
                 ) : (
                  <span className="absolute top-2.5 right-2 text-red-500 font-black">●</span>
                 )
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Area */}
      <div className="p-5 border-t border-white/5 flex flex-col gap-3 shrink-0 overflow-hidden bg-black/10">
        <div className={`flex items-center ${isHovered ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-700 text-white text-sm font-bold flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className={`whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <div className="text-sm font-bold text-white truncate w-24">
                {user?.fullName || user?.name || "User"}
              </div>
              <div className="text-[11px] text-white/30 truncate w-24">
                {user?.email || "internal@aja.tech"}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`text-white/20 hover:text-red-400 transition-colors shrink-0 p-2 rounded-xl hover:bg-red-500/10 ${!isHovered && 'hidden'}`}
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
