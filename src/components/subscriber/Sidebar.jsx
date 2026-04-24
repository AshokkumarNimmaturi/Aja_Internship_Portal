import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// ✅ UPGRADED: Switched to elite Heroicons 2 (React Icons)
import { 
  HiArrowRightOnRectangle, 
  HiBars3, 
  HiXMark,
  HiHome,
  HiMagnifyingGlass,
  HiBookmark,
  HiCreditCard,
  HiUser
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await axiosInstance.get("/subscriptions/my");
        let activeSub = null;
        if (Array.isArray(res.data) && res.data.length > 0) {
          activeSub = res.data.find(sub => sub.status === "ACTIVE") || res.data[0];
        } else if (res.data && !Array.isArray(res.data)) {
          activeSub = res.data;
        }

        if (activeSub && activeSub.endDate) {
          setSubscription(activeSub);
        } else {
          setSubscription(null);
        }
      } catch (error) {
        setSubscription(null);
      }
    };
    fetchSubscription();
  }, []);

  const navItems = [
    { label: "Dashboard", icon: <HiHome size={22} />, path: "/dashboard" },
    { label: "Questions", icon: <HiMagnifyingGlass size={22} />, path: "/dashboard/questions" },
    { label: "Bookmarks", icon: <HiBookmark size={22} />, path: "/dashboard/bookmarks" },
    { label: "Subscription", icon: <HiCreditCard size={22} />, path: "/dashboard/subscription" },
    { label: "Profile", icon: <HiUser size={22} />, path: "/dashboard/profile" },
  ];

  const getDaysLeft = () => {
    if (!subscription || !subscription.endDate) return null;
    return Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
  };
  const daysLeft = getDaysLeft();

  return (
    <aside 
      className={`shrink-0 bg-white border-r border-black/5 h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out relative z-50 shadow-sm ${isHovered ? 'w-64' : 'w-[84px]'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="p-5 border-b border-black/5 h-[84px] flex items-center shrink-0 overflow-hidden">
        <Link to="/" className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 shrink-0 bg-[#0A1628] rounded-lg flex items-center justify-center transition-all shadow-sm overflow-hidden">
            <img src="/logo.png" alt="Aja logo" className="w-7 h-auto object-contain brightness-0 invert" />
          </div>
          <div className={`whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="text-sm font-bold text-[#0A1628] leading-tight">
              Aja Interview Vault
            </div>
            <button className="md:hidden p-2 text-gray-600" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
            </button>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto scrollbar-hide overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.includes(item.path));
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center rounded-lg transition-all duration-200 h-10 relative group ${
                isActive
                  ? "bg-blue-50 text-[#0074CC]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-[#0A1628]"
              } ${isHovered ? 'px-3 justify-start gap-3' : 'justify-center mx-1.5'}`}
              title={!isHovered ? item.label : ""}
            >
              {isActive && !isHovered && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#0074CC] rounded-r-sm" />
              )}
              <span className={`shrink-0 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                 {isActive ? React.cloneElement(item.icon, { size: 18 }) : React.cloneElement(item.icon, { size: 18 })}
              </span>
              <span className={`text-xs font-semibold whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — Subscription + User */}
      <div className="p-5 border-t border-black/5 flex flex-col gap-4 shrink-0 overflow-hidden">
        
        {/* Subscription Badge */}
        <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 h-10' : 'opacity-0 h-0 w-0 hidden'}`}>
          {subscription && daysLeft > 0 ? (
             <div className="flex items-center gap-2.5 px-3 py-2 bg-green-50 border border-green-100 rounded-lg whitespace-nowrap">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0" />
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">
                Premium · {daysLeft} days
              </span>
            </div>
          ) : (
             <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg border border-black/5 whitespace-nowrap">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Standard Tier
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className={`flex items-center ${isHovered ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0A1628] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm" title={!isHovered ? (user?.fullName || user?.name) : ""}>
              {(user?.fullName || user?.name)?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className={`whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <div className="text-[12px] font-bold text-[#0A1628] leading-tight truncate w-28">
                {user?.fullName || user?.name || "User"}
              </div>
              <div className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                Subscriber
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={!isHovered ? "Logout" : ""}
            className={`text-red-400 hover:text-red-600 transition-all shrink-0 p-2 rounded-lg hover:bg-red-50 ${!isHovered && 'hidden'}`}
          >
            <HiArrowRightOnRectangle className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* CUSTOM LOGOUT WARNING MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowLogoutModal(false)} />
          <div className="bg-white border border-black/5 w-full max-w-sm rounded-2xl p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                <HiArrowRightOnRectangle className="text-red-500 w-8 h-8" />
             </div>
             <h3 className="text-xl font-serif font-bold text-[#0A1628] text-center mb-2">Sign Out?</h3>
             <p className="text-gray-400 text-[10px] text-center font-bold uppercase tracking-widest leading-relaxed mb-8 px-4">
                Are you sure you want to exit your mastery vault? All active progress will be saved.
             </p>
             <div className="flex gap-4">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-[#0A1628] text-[10px] font-bold uppercase tracking-widest rounded-lg border border-black/5 transition-all active:scale-95"
                >
                  No, Stay
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-red-900/20 transition-all active:scale-95"
                >
                  Yes, Logout
                </button>
             </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
