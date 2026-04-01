import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const location = useLocation();

  const handleLogout = () => {
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
    { label: "Dashboard", icon: "🏠", path: "/dashboard" },
    { label: "My Questions", icon: "📚", path: "/dashboard/questions" },
    { label: "Bookmarks", icon: "🔖", path: "/dashboard/bookmarks" },
    { label: "My Subscriptions", icon: "💳", path: "/dashboard/subscription" },
    { label: "Profile", icon: "👤", path: "/dashboard/profile" },
  ];

  const getDaysLeft = () => {
    if (!subscription || !subscription.endDate) return null;
    return Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
  };
  const daysLeft = getDaysLeft();

  return (
    <aside 
      className={`shrink-0 bg-white border-r border-black/5 min-h-screen flex flex-col transition-all duration-300 ease-in-out relative z-50 shadow-sm ${isHovered ? 'w-64' : 'w-[84px]'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="p-5 border-b border-black/5 h-[84px] flex items-center shrink-0 overflow-hidden">
        <Link to="/" className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 shrink-0 bg-[#0A1628] rounded-2xl flex items-center justify-center transition-all shadow-md">
            <span className="text-white text-xs font-bold tracking-wider">AIP</span>
          </div>
          <div className={`whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="text-sm font-bold text-[#0A1628] leading-tight">
              Aja Internship Portal
            </div>
            <div className="text-xs text-gray-400 font-medium leading-tight">
              Interview Question Bank
            </div>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-2.5 overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.includes(item.path));
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center rounded-xl transition-all duration-200 h-12 relative group ${
                isActive
                  ? "bg-blue-50 text-[#2563EB]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-[#0A1628]"
              } ${isHovered ? 'px-4 justify-start gap-3.5' : 'justify-center mx-2'}`}
              title={!isHovered ? item.label : ""}
            >
              {isActive && !isHovered && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#2563EB] rounded-r-md" />
              )}
              <span className={`text-xl shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
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
             <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-green-50 border border-green-100 rounded-xl whitespace-nowrap">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-xs font-semibold text-green-700">
                Premium · {daysLeft} days left
              </span>
            </div>
          ) : (
             <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 rounded-xl border border-black/5 whitespace-nowrap">
              <span className="text-xs font-semibold text-gray-500">
                Free Tier
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className={`flex items-center ${isHovered ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A1628] to-[#2563EB] shadow-md text-white text-sm font-bold flex items-center justify-center shrink-0" title={!isHovered ? (user?.fullName || user?.name) : ""}>
              {(user?.fullName || user?.name)?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className={`whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <div className="text-sm font-bold text-[#0A1628] leading-tight truncate w-28">
                {user?.fullName || user?.name || "User"}
              </div>
              <div className="text-xs font-medium text-gray-400 mt-0.5 leading-tight">
                Subscriber
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={!isHovered ? "Logout" : ""}
            className={`text-gray-400 hover:text-white transition-colors shrink-0 p-2.5 rounded-xl hover:bg-red-500 hover:shadow-md ${!isHovered && 'hidden'}`}
          >
            <LogOut size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </aside>
  );
};
