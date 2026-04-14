import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
// ✅ UPGRADED: Using elite Heroicons 2
import { 
  HiUsers, 
  HiClipboardDocumentList, 
  HiArchiveBox, 
  HiClock, 
  HiArrowPath,
  HiChatBubbleLeftEllipsis,
  HiCheckCircle,
  HiXCircle,
  HiBolt,
  HiPlusCircle,
  HiUserPlus,
  HiShieldCheck,
  HiPencilSquare,
  HiPhoneArrowUpRight,
  HiPhoneXMark,
  HiArrowRightOnRectangle,
  HiBriefcase,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiPhone
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import VoiceCallButton from "../../components/common/VoiceCallButton";
import SupportTelemetryTable from "../../components/portal/SupportTelemetryTable";

const TechBadge = ({ tech }) => (
  <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded border border-black/5 text-gray-600 uppercase italic tracking-widest">
    {tech}
  </span>
);

const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    EASY: "bg-green-50 text-green-700 border-green-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    HARD: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${styles[difficulty] || "bg-gray-100"}`}>
      {difficulty}
    </span>
  );
};

const AdminPanelPage = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const [activeView, setActiveView] = useState("Users");
  
  // States
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [supportCalls, setSupportCalls] = useState([]); // ✅ NEW: Call Logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ users: 0, questions: 0, pending: 0, support: 0 });
  const [processing, setProcessing] = useState(null);

  // Review Queue States
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [techFilters, setTechFilters] = useState(["All"]);
  const [correctedAnswers, setCorrectedAnswers] = useState({});
  const [comments, setComments] = useState({});

  // Agent Status States
  const [status, setStatus] = useState(user?.status || "OFFLINE");
  const [isInCall, setIsInCall] = useState(user?.inCall || false);
  const [callStatusFilter, setCallStatusFilter] = useState("ALL"); // ALL or MISSED
  
  // Default support number for general header button
  const ADMIN_SUPPORT_NUMBER = "+917780131390";

  // Forms Visibility
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedUserForPhone, setSelectedUserForPhone] = useState(null);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");

  // Form Data
  const [userForm, setUserForm] = useState({ fullName: "", email: "", phone: "", password: "", role: "EMPLOYEE" });
  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    basicPrice: "",
    standardPrice: "",
    premiumPrice: "",
    bundlePrice: "",
    technologyName: "",
    packageType: "FULL_STACK"
  });

  // ✅ ROUTE HANDLING
  useEffect(() => {
    const path = location.pathname;
    const role = user?.role;
    
    if (path.endsWith("/admin") && role === 'ADMIN') setActiveView("Users");
    else if (path.includes("/questions")) setActiveView("Questions");
    else if (path.includes("/review")) setActiveView("Review Queue");
    else if (path.includes("/access")) setActiveView("Access Requests");
    else if (path.includes("/support-logs")) setActiveView("Support Logs");
    else if (path.includes("/packages")) setActiveView("Packages");
    else if (path.includes("/audit") && role === 'ADMIN') setActiveView("Audit Log");
    else {
      // Intelligent fallback
      if (role === 'ADMIN') setActiveView("Users");
      else setActiveView("Access Requests");
    }
  }, [location, user?.role]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const isAdmin = user?.role === 'ADMIN';
      const fetches = [
        isAdmin ? axiosInstance.get("/admin/users") : Promise.resolve({ data: [] }),
        axiosInstance.get("/questions"),
        axiosInstance.get("/packages"),
        axiosInstance.get("/support").catch(() => ({ data: [] })),
        axiosInstance.get("/admin/support-calls").catch(() => ({ data: [] })),
        axiosInstance.get("/questions/pending").catch(() => ({ data: [] })) // ✅ FETCH PENDING
      ];

      const [uRes, qRes, pRes, sRes, callsRes, pendingRes] = await Promise.all(fetches);
      
      setUsers(uRes.data?.content || uRes.data || []);
      setAllQuestions(qRes.data.content || qRes.data);
      setPackages(pRes.data?.content || pRes.data || []);
      setSupportRequests(sRes.data?.content || sRes.data || []);
      setSupportCalls(callsRes.data || []);
      
      const pendingList = Array.isArray(pendingRes.data) ? pendingRes.data : (pendingRes.data.content || []);
      setPendingQuestions(pendingList);
      
      const techs = ["All", ...new Set(pendingList.map(q => q.technologyName || "General"))];
      setTechFilters(techs);

      setStats({
        users: (uRes.data?.content || uRes.data || []).length,
        questions: (qRes.data.content || qRes.data).length,
        pending: pendingList.length,
        support: sRes.data.filter(r => r.status === 'PENDING').length
      });
    } catch (err) {
      toast.error("Dashboard sync error");
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const fetchAuditData = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/admin/audit-log");
      setAuditLogs(res.data.content || res.data);
    } catch (err) {
      console.warn("Audit logs service not ready yet");
    }
  }, []);

  useEffect(() => {
    fetchData();
    if (activeView === "Audit Log" && user?.role === 'ADMIN') {
      fetchAuditData();
    }
    // ✅ ULTRA-RESPONSIVE POLLING (5 Seconds)
    const interval = setInterval(() => {
        axiosInstance.get("/auth/me").then(res => {
            if (!user?.inCall) {
                if (res.data.inCall !== isInCall) {
                    setIsInCall(res.data.inCall);
                }
                setStatus(res.data.status);
            }
        }).catch(() => console.warn("Sync heart-beat suspended..."));
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchData, fetchAuditData, activeView, user?.role, updateUser, isInCall]);

  // ✅ STATUS ACTIONS
  const handleReviewAction = async (id, decision) => {
    setProcessing(id + decision);
    try {
      await axiosInstance.put(`/questions/${id}/review`, {
        decision: decision,
        rejectionReason: comments[id] || "",
        correctedAnswer: correctedAnswers[id] || ""
      });
      toast.success(`Question ${decision.toLowerCase()} successfully!`);
      setPendingQuestions(prev => prev.filter(q => q.id !== id));
      fetchData(); // Refresh all stats
    } catch (err) {
      toast.error(err.response?.data?.message || "Review action failed.");
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setProcessing("status");
    try {
      const res = await axiosInstance.post(`/auth/support-status?status=${newStatus}`);
      setStatus(res.data.status);
      updateUser({ status: res.data.status });
      toast.success(`Broadcasting status: ${newStatus}`);
    } catch (err) {
      toast.error("Status update failed");
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleUser = async (userId, currentStatus) => {
    try {
      if (currentStatus) {
        await axiosInstance.delete(`/admin/users/${userId}`);
        toast.success("User deactivated successfully");
      } else {
        await axiosInstance.put(`/admin/users/${userId}/activate`);
        toast.success("User access restored successfully");
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user status");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setProcessing("user");
    try {
      await axiosInstance.post("/admin/users", userForm);
      toast.success("User created successfully");
      setShowUserForm(false);
      setUserForm({ fullName: "", email: "", phone: "", password: "", role: "EMPLOYEE" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setProcessing(null);
    }
  };

  const handleOpenPhoneModal = (u) => {
    setSelectedUserForPhone(u);
    setNewPhoneNumber(u.phone || "");
    setShowPhoneModal(true);
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    if (!/^[0-9]{10,15}$/.test(newPhoneNumber)) {
      toast.error("Enter valid phone number");
      return;
    }
    setProcessing("phone");
    try {
      await axiosInstance.put(`/admin/users/${selectedUserForPhone.id}`, {
        phone: newPhoneNumber
      });
      toast.success("Phone updated successfully");
      setShowPhoneModal(false);
      fetchData();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setProcessing(null);
    }
  };

  // ✅ PACKAGE ACTIONS
  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setProcessing("package");
    try {
      await axiosInstance.post("/packages", packageForm);
      toast.success("Package created successfully");
      setShowPackageForm(false);
      setPackageForm({
        name: "", description: "", basicPrice: "", standardPrice: "", 
        premiumPrice: "", bundlePrice: "", technologyName: "", packageType: "FULL_STACK"
      });
      fetchData();
    } catch (err) {
      toast.error("Failed to create package");
    } finally {
      setProcessing(null);
    }
  };

  const handleSupportStatus = async (id, status) => {
    try {
        await axiosInstance.put(`/support/${id}/status?status=${status}`);
        toast.success("Status updated");
        fetchData();
    } catch (err) {
        toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      <PortalSidebar user={user} role={user?.role || "TUTOR"} activeItem={activeView} />
      
      <main className="flex-1 p-8 py-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* 1. Header & Agent Pulse */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-3xl font-serif text-[#0A1628] mb-1 font-bold">{activeView}</h1>
              <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">Control Terminal</p>
            </div>

             {/* ✅ GLOBAL LIVE MISSION BANNER */}
             {isInCall && (
               <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-[35px] shadow-2xl shadow-blue-500/20 border border-white/20 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 animate-pulse">
                        <HiBolt className="text-white" size={24} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em] mb-1">Telemetry Active</div>
                        <h2 className="text-xl font-serif text-white font-bold tracking-tight">Live Support Mission in Progress</h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Ongoing Transmission</span>
                    </div>
                  </div>
               </div>
             )}

            {/* ✅ AGENT STATUS DASHBOARD */}
            <div className="bg-[#0A1628] p-5 rounded-[30px] border border-white/5 shadow-2xl flex items-center gap-8 relative overflow-hidden group">
               {/* Pulse Effect */}
               {isInCall && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />}
               
               <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                    isInCall ? 'bg-red-500/20 border-red-500/50' : status === 'AVAILABLE' ? 'bg-green-500/20 border-green-500/50' : 'bg-gray-800 border-white/10'
                  }`}>
                    {isInCall ? <HiBolt className="text-red-500 animate-bounce" size={24} /> : status === 'AVAILABLE' ? <HiShieldCheck className="text-green-500" size={24} /> : <HiXCircle className="text-gray-500" size={24} />}
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold truncate max-w-[120px]">{user?.fullName}</h4>
                    <p className={`text-[8px] font-black uppercase tracking-widest ${isInCall ? 'text-red-400' : 'text-gray-400'}`}>
                        {isInCall ? '🔴 LIVE ON CALL' : status}
                    </p>
                  </div>
               </div>

               <div className="flex bg-gray-900/50 p-1.5 rounded-2xl border border-white/5 relative z-10">
                  <button 
                    onClick={() => handleUpdateStatus('AVAILABLE')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black tracking-widest transition-all ${status === 'AVAILABLE' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    <HiShieldCheck size={14} /> READY
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('BREAK')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black tracking-widest transition-all ${status === 'BREAK' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    <HiClock size={14} /> BREAK
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('OFFLINE')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black tracking-widest transition-all ${status === 'OFFLINE' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    <HiArrowRightOnRectangle size={14} /> EXIT
                  </button>
               </div>
            </div>

            <div className="flex gap-4">
              {activeView === "Users" && user?.role === 'ADMIN' && (
                <button onClick={() => setShowUserForm(true)} className="flex items-center gap-2 px-7 py-3.5 bg-[#0A1628] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-900 transition-all shadow-2xl active:scale-95">
                  <HiUserPlus size={20} /> New Agent
                </button>
              )}
              <button onClick={fetchData} className="p-3.5 bg-white border border-black/10 text-gray-400 rounded-2xl hover:bg-gray-50 transition-all active:scale-95">
                <HiArrowPath size={20} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              { label: "Global Talent", count: stats.users, icon: HiUsers, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Total Intel", count: stats.questions, icon: HiClipboardDocumentList, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Awaiting Sync", count: stats.pending, icon: HiClock, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Member Tickets", count: stats.support, icon: HiChatBubbleLeftEllipsis, color: "text-purple-600", bg: "bg-purple-50" }
            ].map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
                   <s.icon size={80} className={s.color} />
                </div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className={`p-4 rounded-2xl ${s.bg} ${s.color} border border-black/5 shadow-inner`}>
                    <s.icon size={24} />
                  </div>
                  <div>
                    <div className="text-3xl font-serif text-[#0A1628] font-black leading-tight tracking-tighter">{s.count}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-black opacity-80">{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* VIEW: Users */}
          {activeView === "Users" && user?.role === 'ADMIN' && (
             <div className="bg-white rounded-[40px] border border-black/8 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <table className="w-full text-left font-sans">
                  <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-black/5">
                    <tr><th className="px-8 py-5">Full Member Profile</th><th className="px-8 py-5">Security Clearances</th><th className="px-8 py-5">Status Pulse</th><th className="px-8 py-5 text-center">Contact</th><th className="px-8 py-5 text-right">Access Manager</th></tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-sm">
                    {Array.isArray(users) && users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/80 transition-all group">
                        <td className="px-8 py-6">
                          <div className="font-black text-[#0A1628] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{u.fullName}</div>
                          <div className="text-[11px] text-gray-400 font-mono italic">{u.email}</div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black px-3.5 py-1.5 bg-gray-100 rounded-xl border border-black/5 text-gray-600 uppercase tracking-widest font-mono">{u.role}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2.5">
                             <span className={`w-2.5 h-2.5 rounded-full ${u.enabled ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-400'}`} />
                             <span className="text-[11px] font-black uppercase tracking-widest opacity-70">{u.enabled ? 'Verified Active' : 'Access Restricted'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              {u.phone ? (
                                <VoiceCallButton 
                                  toNumber={u.phone} 
                                  label={u.fullName}
                                  compact={true}
                                />
                              ) : (
                                <span className="text-[10px] text-gray-300 italic">No Phone</span>
                              )}
                              <div className="flex items-center gap-2">
                                 {u.inCall ? (
                                   <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black tracking-widest border border-blue-100 animate-pulse">
                                     <HiPhoneArrowUpRight size={12} /> ON CALL
                                   </span>
                                 ) : (
                                   <span className="text-[11px] font-bold font-mono text-gray-500">{u.phone || "—"}</span>
                                 )}
                                 <button 
                                   onClick={() => handleOpenPhoneModal(u)}
                                   className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-blue-600 transition-all"
                                   title="Edit Phone"
                                 >
                                   <HiPencilSquare size={14} />
                                 </button>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           {user?.id !== u.id && (
                             <button 
                               onClick={() => handleToggleUser(u.id, u.enabled)}
                               className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                                 u.enabled ? 'text-red-500 border-red-50 hover:bg-red-500 hover:text-white hover:border-red-500' : 'text-emerald-600 border-emerald-50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                               }`}
                             >
                               {u.enabled ? 'Terminate Access' : 'Restore Connection'}
                             </button>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}

          {/* VIEW: Packages */}
          {activeView === "Packages" && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-500">
                {Array.isArray(packages) && packages.map(pkg => (
                   <div key={pkg.id} className="bg-white p-9 rounded-[50px] border border-black/8 shadow-sm hover:shadow-2xl hover:border-blue-300 transition-all group relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-125 transition-transform duration-700">
                         <HiArchiveBox size={140} className="text-blue-600" />
                      </div>
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 border border-blue-100 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner relative z-10"><HiArchiveBox size={32} /></div>
                      <h3 className="font-bold text-2xl text-[#0A1628] mb-2 font-serif relative z-10">{pkg.name}</h3>
                      <p className="text-sm text-gray-400 mb-8 font-light italic leading-loose line-clamp-3 relative z-10">"{pkg.description || "Premium intel packet for professional interview mastery."}"</p>
                      
                      <div className="space-y-4 mb-8 relative z-10 bg-gray-50/50 p-6 rounded-3xl border border-black/5 shadow-inner">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                           <span>Standard Tier</span>
                           <span className="text-blue-600 text-base">₹{pkg.standardPrice || 0}</span>
                         </div>
                         <div className="h-px bg-black/5" />
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-600">
                           <span>Mastery Bundle</span>
                           <span className="text-xl font-serif font-black underline decoration-emerald-200 underline-offset-8">₹{pkg.bundlePrice || 0}</span>
                         </div>
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t border-black/5 relative z-10">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Base Point: ₹{pkg.basicPrice || 0}</span>
                         <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100 shadow-sm">Sync Active</span>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {/* VIEW: Audit Log */}
          {activeView === "Audit Log" && user?.role === 'ADMIN' && (
             <div className="bg-white rounded-[40px] border border-black/8 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <table className="w-full text-left font-sans">
                  <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-black/5">
                    <tr><th className="px-8 py-5">Time Intel</th><th className="px-8 py-5">Active Agent</th><th className="px-8 py-5">Operation</th><th className="px-8 py-5">Telemetry Report</th></tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-sm">
                    {Array.isArray(auditLogs) && auditLogs.length > 0 ? auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50/80 transition-all group">
                        <td className="px-8 py-6 text-gray-400 text-[10px] font-black font-mono tracking-tighter italic">{new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-8 py-6 font-black text-[#0A1628] group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                          {log.performedByEmail || "SYSTEM_DAEMON"}
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[9px] font-black px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center justify-center gap-1.5 w-fit uppercase tracking-widest shadow-sm">
                            <HiBolt size={12} /> {log.action}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-gray-400 italic text-[11px] leading-relaxed max-w-sm truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">"{log.details}"</td>
                      </tr>
                    )) : (
                       <tr><td colSpan="4" className="px-8 py-32 text-center text-gray-300 italic font-serif">Awaiting system telemetry synchronization...</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          )}

          {/* VIEW: Questions List */}
          {activeView === "Questions" && (
             <div className="bg-white rounded-[40px] border border-black/8 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <table className="w-full text-left font-sans">
                   <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-black/5">
                     <tr><th className="px-8 py-5">Intelligence Packet Identification</th><th className="px-8 py-5">Core Technology</th><th className="px-8 py-5">Sync State</th></tr>
                   </thead>
                   <tbody className="divide-y divide-black/5 text-sm">
                      {allQuestions.map(q => (
                        <tr key={q.id} className="group hover:bg-gray-50/80 transition-all cursor-pointer" onClick={() => (window.location.href = `/portal/questions/${q.id}`)}>
                          <td className="px-8 py-6">
                            <div className="font-black text-[#0A1628] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{q.title}</div>
                            <div className="text-[11px] text-blue-500 italic font-bold uppercase tracking-widest">{q.clientName || "General Intake"}</div>
                          </td>
                          <td className="px-8 py-6"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono italic">{q.technologyName}</span></td>
                          <td className="px-8 py-6"><span className={`text-[9px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-widest leading-none shadow-sm ${q.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>{q.status === 'APPROVED' ? 'MASTER_ACTIVE' : 'AWAITING_SYNC'}</span></td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
             </div>
          )}

          {/* VIEW: Access Tickets */}
          {activeView === "Access Requests" && (
             <div className="space-y-12 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    {Array.isArray(supportRequests) && supportRequests.length > 0 ? supportRequests.map(req => (
                    <div key={req.id} className="bg-white p-9 rounded-[50px] border border-black/8 shadow-sm hover:shadow-2xl hover:border-blue-300 transition-all group relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 opacity-5 group-hover:scale-125 transition-transform duration-700">
                            <HiChatBubbleLeftEllipsis size={100} className="text-purple-600" />
                        </div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center border border-purple-100 shadow-inner group-hover:rotate-12 transition-transform"><HiChatBubbleLeftEllipsis size={28} /></div>
                            <div>
                                <h4 className="font-bold text-[#0A1628] text-xl mb-1 font-serif">{req.subject}</h4>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">{req.userEmail}</span>
                            </div>
                        </div>
                        <span className={`text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border-2 shadow-sm ${req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{req.status}</span>
                        </div>
                        <div className="bg-gray-50/50 p-6 rounded-[32px] border border-black/5 text-sm text-gray-600 italic mb-8 font-light leading-relaxed shadow-inner">"{req.message}"</div>
                        {req.status === 'PENDING' && (
                        <button onClick={() => handleSupportStatus(req.id, 'RESOLVED')} className="w-full py-4.5 bg-[#0A1628] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-blue-900/10 active:scale-95 flex items-center justify-center gap-3 relative z-10">
                            <HiCheckCircle size={20} /> Terminate Ticket & Resolve
                        </button>
                        )}
                    </div>
                    )) : <div className="col-span-2 py-32 bg-white rounded-[50px] border-2 border-dashed border-black/5 text-center text-gray-300 italic font-serif text-xl">Command deck clear. No active tickets.</div>}
                </div>

                {/* ✅ RECENT CALL LOGS SECTION */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="flex items-center justify-between mb-8 px-4">
                        <h3 className="text-2xl font-serif text-[#0A1628] font-bold">Recent Support Activity</h3>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Voice Telemetry Logs</span>
                    </div>
                    <div className="bg-white rounded-[40px] border border-black/8 overflow-hidden shadow-sm">
                        <table className="w-full text-left font-sans">
                           <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-black/5">
                              <tr>
                                 <th className="px-8 py-5">Time Intel</th>
                                 <th className="px-8 py-5">Subscriber Number</th>
                                 <th className="px-8 py-5">Assigned Agent</th>
                                 <th className="px-8 py-5">Status</th>
                                 <th className="px-8 py-5 text-right">Duration</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-black/5">
                              {supportCalls.length > 0 ? supportCalls.map(call => (
                                 <tr key={call.id} className="hover:bg-gray-50/50 transition-all">
                                    <td className="px-8 py-6 text-gray-400 text-[10px] font-black font-mono tracking-tighter italic">
                                        {new Date(call.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-8 py-6 font-black text-[#0A1628] tracking-widest text-[11px]">{call.callerNumber}</td>
                                    <td className="px-8 py-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{call.agentName || "Queue/Untracked"}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {call.status === 'COMPLETED' ? (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black tracking-widest border border-green-100"><HiCheckCircle size={14} /> COMPLETED</span>
                                            ) : call.status === 'ANSWERED' ? (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black tracking-widest border border-blue-100 animate-pulse"><HiPhoneArrowUpRight size={14} /> LIVE NOW</span>
                                            ) : call.status === 'MISSED' ? (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black tracking-widest border border-red-100"><HiPhoneXMark size={14} /> MISSED CALL</span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black tracking-widest border border-amber-100 uppercase">IN_QUEUE</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right text-gray-400 font-mono text-xs">{call.duration ? `${call.duration}s` : '—'}</td>
                                 </tr>
                              )) : (
                                 <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-300 italic font-serif">Awaiting call telemetry...</td></tr>
                              )}
                           </tbody>
                        </table>
                    </div>
                </div>
              </div>
           )}
           {/* VIEW: Support Logs (Voice Telemetry) */}
          {activeView === "Support Logs" && (
             <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                {/* Header & Filter */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 px-4 gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[#0A1628] text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-900/20">
                      <HiPhone size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif text-[#0A1628] font-black tracking-tight italic">Voice Telemetry</h3>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Real-time support auditing system</p>
                    </div>
                  </div>
                  
                  <div className="flex bg-white p-1.5 rounded-[22px] border border-black/5 shadow-sm">
                    <button 
                      onClick={() => setCallStatusFilter("ALL")}
                      className={`px-8 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${callStatusFilter === 'ALL' ? 'bg-[#0A1628] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Mission Logs
                    </button>
                    <button 
                      onClick={() => setCallStatusFilter("MISSED")}
                      className={`px-8 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${callStatusFilter === 'MISSED' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      Missed Pulse
                    </button>
                  </div>
                </div>

                <SupportTelemetryTable 
                  supportCalls={supportCalls} 
                  callStatusFilter={callStatusFilter} 
                  user={user} 
                />
             </div>
          )}

          {/* VIEW: Review Queue (Admin Integrated) */}
          {activeView === "Review Queue" && (
            <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
               {/* Search & Filters */}
               <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search pending intelligence packets..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-black/8 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="relative">
                    <HiAdjustmentsHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    <select
                      className="pl-12 pr-10 py-4 bg-white border border-black/8 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none shadow-sm cursor-pointer"
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                    >
                      {techFilters.map(tech => (
                        <option key={tech} value={tech}>{tech}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {(pendingQuestions || [])
                  .filter(q => (activeFilter === "All" || q.technologyName === activeFilter))
                  .filter(q => (q.title?.toLowerCase().includes(searchQuery.toLowerCase()) || q.answer?.toLowerCase().includes(searchQuery.toLowerCase())))
                  .length > 0 ? (
                  pendingQuestions
                    .filter(q => (activeFilter === "All" || q.technologyName === activeFilter))
                    .filter(q => (q.title?.toLowerCase().includes(searchQuery.toLowerCase()) || q.answer?.toLowerCase().includes(searchQuery.toLowerCase())))
                    .map((q) => (
                      <div key={q.id} className="bg-white rounded-[40px] border border-black/8 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="px-8 py-6 bg-gray-50/50 border-b border-black/5 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <TechBadge tech={q.technologyName} />
                            <DifficultyBadge difficulty={q.difficulty} />
                          </div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono italic">ID: {q.id}</span>
                        </div>

                        <div className="p-8">
                          <h3 className="text-xl font-bold text-[#0A1628] mb-4 font-serif leading-tight">{q.title}</h3>
                          
                          <div className="space-y-6">
                            {/* Context Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gray-50 p-6 rounded-[32px] border border-black/5 shadow-inner">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Submission Content</h4>
                                <p className="text-sm text-gray-600 leading-relaxed italic">"{q.content}"</p>
                              </div>
                              <div className="bg-blue-50/30 p-6 rounded-[32px] border border-blue-100/50 shadow-inner">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-2">Proposed Explanation</h4>
                                <p className="text-sm text-gray-600 leading-relaxed font-medium italic">"{q.initialAnswer || "No explanation provided."}"</p>
                              </div>
                            </div>

                            {/* Corrected Answer Input */}
                            <div>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Verified Master Answer (Syncs to Storefront)</h4>
                              <textarea
                                className="w-full p-6 bg-white border border-black/8 rounded-[32px] text-sm font-medium focus:outline-none focus:ring-8 focus:ring-blue-50/30 transition-all shadow-inner leading-relaxed"
                                placeholder="Craft the official, high-quality answer for subscribers..."
                                rows={4}
                                value={correctedAnswers[q.id] || ""}
                                onChange={(e) => setCorrectedAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              />
                            </div>

                            {/* Rejection Comments */}
                            <div>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Rejection Feedback</h4>
                              <input
                                type="text"
                                className="w-full px-6 py-4 bg-white border border-black/8 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-50/10 transition-all shadow-inner"
                                placeholder="Internal feedback if deferring this packet..."
                                value={comments[q.id] || ""}
                                onChange={(e) => setComments(prev => ({ ...prev, [q.id]: e.target.value }))}
                              />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                              <button
                                onClick={() => handleReviewAction(q.id, 'APPROVED')}
                                disabled={processing === (q.id + 'APPROVED')}
                                className="flex-1 py-4.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                              >
                                {processing === (q.id + 'APPROVED') ? (
                                  <HiArrowPath className="animate-spin" size={18} />
                                ) : (
                                  <HiCheckCircle size={18} />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => handleReviewAction(q.id, 'REJECTED')}
                                disabled={processing === (q.id + 'REJECTED')}
                                className="flex-1 py-4.5 bg-white text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                              >
                                {processing === (q.id + 'REJECTED') ? (
                                  <HiArrowPath className="animate-spin" size={18} />
                                ) : (
                                  <HiXCircle size={18} />
                                )}
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-32 bg-white rounded-[50px] border-2 border-dashed border-black/5 text-center">
                    <HiBriefcase size={64} className="mx-auto text-gray-100 mb-6" />
                    <p className="text-gray-300 italic font-serif text-xl">Review queue synchronized. All intelligence packets verified.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODALS: (Kept consistent with elite UI) */}
          {showUserForm && (
            <div className="fixed inset-0 bg-[#0A1628]/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-[60px] w-full max-w-md p-10 shadow-2xl border border-white/10 relative overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                   <HiUserPlus size={160} className="text-[#0A1628]" />
                </div>
                <div className="flex justify-between items-center mb-10 relative z-10">
                  <h2 className="text-3xl font-serif text-[#0A1628] font-black tracking-tighter">Team Induction</h2>
                  <button onClick={() => setShowUserForm(false)} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-red-500 hover:text-white rounded-full transition-all active:scale-90"><HiXCircle size={24} /></button>
                </div>
                <form onSubmit={handleCreateUser} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 block">Agent Name</label>
                    <input required value={userForm.fullName} onChange={e => setUserForm({...userForm, fullName: e.target.value})} className="w-full px-6 py-4 rounded-[20px] bg-gray-50 border border-black/5 focus:ring-8 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all font-bold" placeholder="Designate identity..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 block">Agent Email</label>
                    <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-6 py-4 rounded-[20px] bg-gray-50 border border-black/5 focus:ring-8 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all font-bold" placeholder="agent@aja.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 block">Agent Phone</label>
                    <input required type="tel" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} className="w-full px-6 py-4 rounded-[20px] bg-gray-50 border border-black/5 focus:ring-8 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all font-bold" placeholder="10-digit number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 block">Initial Cipher</label>
                    <input required type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-6 py-4 rounded-[20px] bg-gray-50 border border-black/5 focus:ring-8 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all font-bold" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 block">Authority Clearances</label>
                    <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-6 py-4 rounded-[20px] bg-gray-50 border border-black/5 focus:ring-8 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all font-black uppercase italic tracking-widest text-[11px] cursor-pointer">
                      <option value="EMPLOYEE">Contributor Level</option>
                      <option value="TUTOR">Curator Level</option>
                      <option value="ADMIN">Overseer Level</option>
                    </select>
                  </div>
                  <button disabled={processing === 'user'} className="w-full bg-[#0A1628] text-white py-5 rounded-[25px] font-black uppercase tracking-[0.2em] text-[11px] mt-8 hover:bg-blue-600 transition-all shadow-2xl shadow-blue-900/40 active:scale-95">
                    {processing === 'user' ? 'INDUCTING...' : 'FINALIZE AGENT REGISTRATION'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {showPackageForm && (
            <div className="fixed inset-0 bg-[#0A1628]/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-[70px] w-full max-w-2xl p-12 shadow-2xl border border-white/10 relative overflow-hidden animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                   <HiArchiveBox size={240} className="text-[#0A1628]" />
                </div>
                <div className="flex justify-between items-center mb-10 relative z-10">
                  <h2 className="text-3xl font-serif text-[#0A1628] font-black tracking-tighter">Design Elite Product</h2>
                  <button onClick={() => setShowPackageForm(false)} className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-red-500 hover:text-white rounded-full transition-all active:scale-90 shadow-sm"><HiXCircle size={28} /></button>
                </div>
                <form onSubmit={handleCreatePackage} className="grid grid-cols-2 gap-8 relative z-10">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 block">Product Identification</label>
                    <input required value={packageForm.name} onChange={e => setPackageForm({...packageForm, name: e.target.value})} className="w-full px-6 py-4 rounded-[20px] bg-gray-50 border border-black/5 focus:ring-8 focus:ring-blue-50 outline-none transition-all font-bold" placeholder="e.g. System Design Mastery" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 block">Value Proposition</label>
                    <textarea rows="3" value={packageForm.description} onChange={e => setPackageForm({...packageForm, description: e.target.value})} className="w-full px-6 py-5 rounded-[30px] bg-gray-50 border border-black/5 focus:ring-8 focus:ring-blue-50 outline-none transition-all font-light italic leading-loose" placeholder="Define the mastery offered..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 block">Entry Tier Price</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-black">₹</span>
                       <input required type="number" value={packageForm.basicPrice} onChange={e => setPackageForm({...packageForm, basicPrice: e.target.value})} className="w-full pl-10 pr-6 py-4 rounded-[20px] bg-gray-50 border border-black/5 focus:border-blue-400 outline-none font-black" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 ml-2 block">Mastery Bundle Price</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400 font-black">₹</span>
                       <input required type="number" value={packageForm.bundlePrice} onChange={e => setPackageForm({...packageForm, bundlePrice: e.target.value})} className="w-full pl-10 pr-6 py-5 rounded-[20px] bg-emerald-50 border border-emerald-200 focus:border-emerald-400 outline-none font-black text-xl text-emerald-700 shadow-inner" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 block">Technology Core</label>
                    <input value={packageForm.technologyName} onChange={e => setPackageForm({...packageForm, technologyName: e.target.value})} className="w-full px-6 py-4 rounded-[20px] bg-gray-50 border border-black/5 focus:border-blue-400 outline-none font-bold placeholder-gray-300" placeholder="e.g. Distributed Systems" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 block">Storefront Category</label>
                    <select value={packageForm.packageType} onChange={e => setPackageForm({...packageForm, packageType: e.target.value})} className="w-full px-6 py-4 rounded-[20px] bg-gray-50 border border-black/5 outline-none font-black text-[11px] uppercase tracking-widest cursor-pointer shadow-sm">
                      <option value="FULL_STACK">FULL STACK MASTERY</option>
                      <option value="BACKEND">BACKEND COMMAND</option>
                      <option value="FRONTEND">FRONTEND ARCHITECTURE</option>
                      <option value="SYSTEM_DESIGN">DISTRIBUTED SYSTEMS</option>
                    </select>
                  </div>
                  <button className="col-span-2 bg-[#0A1628] text-white py-5 rounded-[30px] font-black uppercase tracking-[0.2em] text-[11px] mt-10 hover:bg-emerald-600 transition-all shadow-2xl shadow-blue-900/40 active:scale-95">
                    PUBLISH ELITE INTEL TO GLOBAL STOREFRONT
                  </button>
                </form>
              </div>
            </div>
          )}

          {showPhoneModal && (
            <div className="fixed inset-0 bg-[#0A1628]/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-[50px] w-full max-w-sm p-10 shadow-2xl border border-white/10 relative overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-serif text-[#0A1628] font-black tracking-tight">Update Phone</h2>
                  <button onClick={() => setShowPhoneModal(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-500 hover:text-white rounded-full transition-all"><HiXCircle size={20} /></button>
                </div>
                <form onSubmit={handleUpdatePhone} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 block">Contact Number</label>
                    <input 
                      required 
                      value={newPhoneNumber} 
                      onChange={e => setNewPhoneNumber(e.target.value)} 
                      className="w-full px-6 py-4 rounded-[20px] bg-gray-50 border border-black/5 focus:border-blue-400 outline-none transition-all font-bold" 
                      placeholder="e.g. 7780131390" 
                    />
                  </div>
                  <button disabled={processing === 'phone'} className="w-full bg-[#0A1628] text-white py-4 rounded-[20px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                    {processing === 'phone' ? 'SAVING...' : 'SAVE CONTACT NUMBER'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ✅ ULTIMATE RED DOT: YOUR ON CALL INDICATOR (TOP RIGHT) */}
        {isInCall && (
          <div key={isInCall} className="fixed top-12 right-12 z-[99999] flex items-center gap-4 bg-red-600 text-white px-6 py-4 rounded-[30px] shadow-[0_20px_50px_rgba(220,38,38,0.5)] border-4 border-white animate-pulse">
             <div className="relative">
                <span className="absolute inset-0 bg-white rounded-full animate-ping opacity-75" />
                <span className="relative block w-4 h-4 bg-white rounded-full shadow-lg" />
             </div>
             <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none mb-1">Telemetry Active</span>
                <span className="text-[14px] font-serif italic font-black">You are On Call Now</span>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanelPage;
