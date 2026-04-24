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
  HiPhone,
  HiTag,
  HiChartBar,
  HiIdentification,
  HiDocumentText,
  HiTrash
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import { fetchMe } from "../../api/authApi";
import { 
  fetchUsersAdmin, 
  deleteUserAdmin, 
  activateUserAdmin, 
  createUserAdmin, 
  updateUserAdmin, 
  fetchAuditLogs, 
  fetchSupportCalls, 
  updateSupportStatusApi 
} from "../../api/adminApi";
import { fetchQuestions, fetchPendingQuestions, reviewQuestion } from "../../api/questionApi";
import { fetchPackages, createPackage } from "../../api/packageApi";
import { fetchSupportTickets, updateSupportTicketStatus } from "../../api/supportApi";
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
    <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border ${styles[difficulty] || "bg-gray-100"}`}>
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
  const [selectedReviewEmployee, setSelectedReviewEmployee] = useState(null);

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
    const isAdmin = user?.role === 'ADMIN';

    // ✅ RESILIENT PARALLEL FETCHING
    // We map every request to a "Safe Request" that catches its own errors
    const safeFetches = [
      (isAdmin ? fetchUsersAdmin() : Promise.resolve({ data: [] })).catch(() => ({ data: [] })),
      fetchQuestions().catch(() => ({ data: [] })),
      fetchPackages().catch(() => ({ data: [] })),
      fetchSupportTickets().catch(() => ({ data: [] })),
      fetchSupportCalls().catch(() => ({ data: [] })),
      fetchPendingQuestions().catch(() => ({ data: [] }))
    ];

    try {
      const [uRes, qRes, pRes, sRes, callsRes, pendingRes] = await Promise.all(safeFetches);
      
      setUsers(uRes.data?.content || uRes.data || []);
      setAllQuestions(qRes.data?.content || qRes.data || []);
      setPackages(pRes.data?.content || pRes.data || []);
      setSupportRequests(sRes.data?.content || sRes.data || []);
      setSupportCalls(callsRes.data || []);
      
      const pendingList = Array.isArray(pendingRes.data) ? pendingRes.data : (pendingRes.data?.content || []);
      setPendingQuestions(pendingList);
      
      const techs = ["All", ...new Set(pendingList.map(q => q.technologyName || "General"))];
      setTechFilters(techs);

      setStats({
        users: (uRes.data?.content || uRes.data || []).length,
        questions: (qRes.data?.content || qRes.data || []).length,
        pending: pendingList.length,
        support: (sRes.data || []).filter(r => r.status === 'PENDING').length
      });
    } catch (err) {
      console.error("Critical Terminal Error:", err);
      toast.error("Internal sync error - some data may be missing");
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const fetchAuditData = useCallback(async () => {
    try {
      const res = await fetchAuditLogs();
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
        fetchMe().then(res => {
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
      await reviewQuestion(id, {
        decision: decision,
        rejectionReason: comments[id] || "",
        correctedAnswer: correctedAnswers[id] || ""
      });
      toast.success(`Question ${decision.toLowerCase()} successfully!`);
      
      // Update local state
      setPendingQuestions(prev => prev.filter(q => q.id !== id));
      
      // If auditing a specific employee, update their list
      if (selectedReviewEmployee) {
        const updatedQuestions = selectedReviewEmployee.questions.filter(q => q.id !== id);
        if (updatedQuestions.length === 0) {
          setSelectedReviewEmployee(null);
        } else {
          setSelectedReviewEmployee({ ...selectedReviewEmployee, questions: updatedQuestions });
        }
      }
      
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
      const res = await updateSupportStatusApi(newStatus);
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
        await deleteUserAdmin(userId);
        toast.success("User deactivated successfully");
      } else {
        await activateUserAdmin(userId);
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
      await createUserAdmin(userForm);
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
      await updateUserAdmin(selectedUserForPhone.id, {
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
      await createPackage(packageForm);
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
        await updateSupportTicketStatus(id, status);
        toast.success("Status updated");
        fetchData();
    } catch (err) {
        toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      <PortalSidebar user={user} role={user?.role || "TUTOR"} activeItem={activeView} />
      
      <main className="flex-1 p-8 py-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header & Agent Pulse - Professional */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0A1628] leading-tight mb-1">{activeView}</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Control Terminal</p>
            </div>

             {/* LIVE MISSION BANNER - Sharp */}
             {isInCall && (
               <div className="p-5 bg-[#0074CC] rounded-lg shadow-sm border border-[#0074CC] animate-in slide-in-from-top-4 duration-500 flex-1 mx-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center border border-white/30 animate-pulse">
                        <HiBolt className="text-white" size={20} />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-white uppercase tracking-widest mb-0.5">Telemetry Active</div>
                        <h2 className="text-sm font-sans font-bold text-white tracking-tight">Live Support Mission</h2>
                      </div>
                    </div>
                  </div>
               </div>
             )}

            {/* AGENT STATUS DASHBOARD - Technical */}
            <div className="bg-[#0A1628] p-4 rounded-lg border border-white/5 shadow-sm flex items-center gap-6 relative overflow-hidden">
               {isInCall && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />}
               
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-500 ${
                    isInCall ? 'bg-red-500/20 border-red-500/50' : status === 'AVAILABLE' ? 'bg-green-500/20 border-green-500/50' : 'bg-gray-800 border-white/10'
                  }`}>
                    {isInCall ? <HiBolt className="text-red-500 animate-bounce" size={18} /> : status === 'AVAILABLE' ? <HiShieldCheck className="text-green-500" size={18} /> : <HiXCircle className="text-gray-500" size={18} />}
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-tight truncate max-w-[100px]">{user?.fullName.split(' ')[0]}</h4>
                    <p className={`text-[8px] font-bold uppercase tracking-widest ${isInCall ? 'text-red-400' : 'text-gray-400'}`}>
                        {isInCall ? 'LIVE' : status}
                    </p>
                  </div>
               </div>

               <div className="flex bg-gray-900/50 p-1 rounded-lg border border-white/5">
                  <button onClick={() => handleUpdateStatus('AVAILABLE')} className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${status === 'AVAILABLE' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'}`}>READY</button>
                  <button onClick={() => handleUpdateStatus('BREAK')} className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${status === 'BREAK' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-white'}`}>BREAK</button>
                  <button onClick={() => handleUpdateStatus('OFFLINE')} className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${status === 'OFFLINE' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>EXIT</button>
               </div>
            </div>

            <div className="flex gap-3">
              {activeView === "Users" && user?.role === 'ADMIN' && (
                <button onClick={() => setShowUserForm(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all shadow-sm active:scale-95">
                  <HiUserPlus size={16} /> New Agent
                </button>
              )}
              <button onClick={fetchData} className="p-2.5 bg-white border border-[#E3E6E8] text-gray-400 rounded-lg hover:bg-gray-50 transition-all active:scale-95">
                <HiArrowPath size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Stats Grid - High Density */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Global Talent", count: stats.users, icon: HiUsers, color: "text-[#0074CC]", bg: "bg-[#0074CC]/5" },
              { label: "Total Intel", count: stats.questions, icon: HiClipboardDocumentList, color: "text-[#2E7D32]", bg: "bg-[#2E7D32]/5" },
              { label: "Awaiting Sync", count: stats.pending, icon: HiClock, color: "text-[#D32F2F]", bg: "bg-[#D32F2F]/5" },
              { label: "Member Tickets", count: stats.support, icon: HiChatBubbleLeftEllipsis, color: "text-[#7B1FA2]", bg: "bg-[#7B1FA2]/5" }
            ].map((s, i) => (
              <div key={i} className="bg-white p-5 rounded-lg border border-[#E3E6E8] shadow-sm hover:border-[#0074CC]/30 transition-all group overflow-hidden relative">
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`p-3 rounded-lg ${s.bg} ${s.color} border border-[#E3E6E8]/10`}>
                    <s.icon size={18} />
                  </div>
                  <div>
                    <div className="text-2xl font-serif font-bold text-[#0A1628] leading-tight tracking-tight">{s.count}</div>
                    <div className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* VIEW: Users - Professional Grid */}
          {activeView === "Users" && user?.role === 'ADMIN' && (
             <div className="bg-white rounded-lg border border-[#E3E6E8] overflow-hidden shadow-sm animate-in fade-in duration-500">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-widest text-gray-400 border-b border-[#E3E6E8]">
                    <tr>
                      <th className="px-6 py-4">Member Profile</th>
                      <th className="px-6 py-4">Access Level</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Communication</th>
                      <th className="px-6 py-4 text-right">Access Manager</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6] text-xs">
                    {Array.isArray(users) && users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-all group">
                        <td className="px-6 py-4">
                          <div className="text-sm font-serif font-bold text-[#0A1628] tracking-tight">{u.fullName}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight opacity-60">{u.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[9px] font-bold px-3 py-1 bg-gray-50 rounded-lg border border-[#E3E6E8] text-gray-500 uppercase tracking-widest">{u.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <span className={`w-1.5 h-1.5 rounded-full ${u.enabled ? 'bg-green-500 font-bold uppercase tracking-widest' : 'bg-red-400'}`} />
                             <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">{u.enabled ? 'Active' : 'Locked'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-4">
                              {u.phone ? (
                                <VoiceCallButton toNumber={u.phone} label={u.fullName} compact={true} />
                              ) : (
                                <span className="text-[9px] text-gray-300 font-bold uppercase">No Phone</span>
                              )}
                              <div className="flex items-center gap-2">
                                 {u.inCall ? (
                                   <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-bold tracking-widest border border-blue-100 animate-pulse uppercase">LIVE ON CALL</span>
                                 ) : (
                                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{u.phone || "—"}</span>
                                 )}
                                 <button onClick={() => handleOpenPhoneModal(u)} className="p-1 hover:text-[#0074CC] text-gray-300 transition-all"><HiPencilSquare size={14} /></button>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           {user?.id !== u.id && (
                             <button onClick={() => handleToggleUser(u.id, u.enabled)} className={`text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-lg border transition-all ${u.enabled ? 'text-red-500 border-red-50 hover:bg-red-500 hover:text-white' : 'text-emerald-600 border-emerald-50 hover:bg-emerald-600 hover:text-white'}`}>
                               {u.enabled ? 'Revoke' : 'Restore'}
                             </button>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}

          {/* VIEW: Packages - Sharp Cards */}
          {activeView === "Packages" && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {Array.isArray(packages) && packages.map(pkg => (
                   <div key={pkg.id} className="bg-white p-6 rounded-lg border border-[#E3E6E8] shadow-sm hover:border-[#0074CC]/30 transition-all group relative overflow-hidden">
                      <div className="w-10 h-10 bg-[#0074CC]/5 text-[#0074CC] rounded-lg flex items-center justify-center mb-6 border border-[#0074CC]/10 shadow-inner relative z-10">
                        <HiArchiveBox size={20} />
                      </div>
                      <h3 className="font-serif font-bold text-xl text-[#0A1628] mb-1 tracking-tight relative z-10">{pkg.name}</h3>
                      <p className="text-xs text-gray-500 mb-6 font-sans font-medium tracking-tight line-clamp-2 relative z-10 opacity-80">
                        {pkg.description || "Premium intel packet for professional interview mastery."}
                      </p>
                      
                      <div className="space-y-3 mb-6 relative z-10 bg-gray-50 p-4 rounded-lg border border-[#E3E6E8] shadow-inner">
                         <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
                           <span>Standard Tier</span>
                           <span className="text-[#0A1628] text-xs font-bold">₹{pkg.standardPrice || 0}</span>
                         </div>
                         <div className="h-px bg-[#E3E6E8]/30" />
                         <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-[#0074CC]">
                           <span>Mastery Bundle</span>
                           <span className="text-sm font-bold">₹{pkg.bundlePrice || 0}</span>
                         </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-[#F3F4F6] relative z-10">
                         <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Base: ₹{pkg.basicPrice || 0}</span>
                         <span className="px-3 py-1 bg-green-50 text-green-600 text-[8px] font-bold uppercase tracking-widest rounded-lg border border-green-100 shadow-sm">Active</span>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {/* VIEW: Audit Log - Technical Grid */}
          {activeView === "Audit Log" && user?.role === 'ADMIN' && (
             <div className="bg-white rounded-lg border border-[#E3E6E8] overflow-hidden shadow-sm animate-in fade-in duration-500">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-widest text-gray-400 border-b border-[#E3E6E8]">
                    <tr><th className="px-6 py-4">Time Intel</th><th className="px-6 py-4">Active Agent</th><th className="px-6 py-4">Operation</th><th className="px-6 py-4">Telemetry Report</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6] text-xs">
                    {Array.isArray(auditLogs) && auditLogs.length > 0 ? auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-all group">
                        <td className="px-6 py-4 text-gray-400 text-[9px] font-bold uppercase tracking-tighter">
                          {new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 font-serif font-bold text-[#0A1628] tracking-tight">
                          {log.performedByEmail.split('@')[0]}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[8px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 inline-flex items-center gap-1 uppercase tracking-widest">
                            <HiBolt size={10} /> {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[10px] text-gray-500 font-medium uppercase tracking-tight max-w-sm truncate opacity-70">
                          {log.details}
                        </td>
                      </tr>
                    )) : (
                       <tr><td colSpan="4" className="px-6 py-20 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">Awaiting system telemetry...</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          )}

          {/* VIEW: Questions List - Sharp Table */}
          {activeView === "Questions" && (
             <div className="bg-white rounded-lg border border-[#E3E6E8] overflow-hidden shadow-sm animate-in fade-in duration-500">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-widest text-gray-400 border-b border-[#E3E6E8]">
                     <tr><th className="px-6 py-4">Intelligence Packet Identification</th><th className="px-6 py-4">Core Technology</th><th className="px-6 py-4">Sync State</th></tr>
                   </thead>
                   <tbody className="divide-y divide-[#F3F4F6] text-xs">
                      {allQuestions.map(q => (
                        <tr key={q.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer" onClick={() => (window.location.href = `/portal/questions/${q.id}`)}>
                          <td className="px-6 py-4">
                            <div className="text-xs font-sans font-bold text-[#0A1628] tracking-tight group-hover:text-[#0074CC] transition-colors">{q.title}</div>
                            <div className="text-[9px] text-[#0074CC] font-bold uppercase tracking-widest opacity-60">{q.clientName || "General Intake"}</div>
                          </td>
                          <td className="px-6 py-4"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{q.technologyName}</span></td>
                          <td className="px-6 py-4">
                            <span className={`text-[8px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest leading-none shadow-sm ${q.status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                              {q.status === 'APPROVED' ? 'MASTER_ACTIVE' : 'AWAITING_SYNC'}
                            </span>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
             </div>
          )}

          {/* VIEW: Access Tickets - Professional Grid */}
          {activeView === "Access Requests" && (
             <div className="space-y-10 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                    {Array.isArray(supportRequests) && supportRequests.length > 0 ? supportRequests.map(req => (
                    <div key={req.id} className="bg-white p-6 rounded-lg border border-[#E3E6E8] shadow-sm hover:border-[#0074CC]/30 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center border border-purple-100 shadow-inner"><HiChatBubbleLeftEllipsis size={18} /></div>
                            <div>
                                <h4 className="font-serif font-bold text-[#0A1628] text-base tracking-tight">{req.subject}</h4>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest opacity-60">{req.userEmail.split('@')[0]}</span>
                            </div>
                        </div>
                        <span className={`text-[8px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest border shadow-sm ${req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{req.status}</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-[#E3E6E8] text-xs text-[#232629] font-sans font-medium tracking-tight mb-6 shadow-inner opacity-80 leading-relaxed">"{req.message}"</div>
                        {req.status === 'PENDING' && (
                        <button onClick={() => handleSupportStatus(req.id, 'RESOLVED')} className="w-full py-2.5 bg-[#0A1628] text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#2E7D32] transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2">
                             Resolve & Sync
                        </button>
                        )}
                    </div>
                    )) : <div className="col-span-2 py-24 bg-white border border-dashed border-[#E3E6E8] rounded-lg text-center text-gray-300 uppercase font-bold text-[10px] tracking-widest">Command deck clear.</div>}
                </div>

                {/* RECENT CALL LOGS - Integrated */}
                <div className="animate-in fade-in duration-500">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h3 className="text-sm font-bold text-[#0A1628] uppercase tracking-widest">Recent Activity Pulse</h3>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Voice Telemetry Logs</span>
                    </div>
                    <div className="bg-white rounded-lg border border-[#E3E6E8] overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                           <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-widest text-gray-400 border-b border-[#E3E6E8]">
                              <tr>
                                 <th className="px-6 py-4">Time Intel</th>
                                 <th className="px-6 py-4">Subscriber Number</th>
                                 <th className="px-6 py-4">Agent</th>
                                 <th className="px-6 py-4">Status</th>
                                 <th className="px-6 py-4 text-right">Dur</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-[#F3F4F6] text-xs">
                              {supportCalls.length > 0 ? supportCalls.map(call => (
                                 <tr key={call.id} className="hover:bg-gray-50/50 transition-all">
                                    <td className="px-6 py-4 text-gray-400 text-[9px] font-bold uppercase tracking-tighter">
                                        {new Date(call.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[#0A1628] tracking-widest text-[10px]">{call.callerNumber}</td>
                                    <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{call.agentName?.split(' ')[0] || "QUEUE"}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {call.status === 'COMPLETED' ? (
                                                <span className="text-[8px] font-bold text-green-600 uppercase tracking-widest">COMPLETED</span>
                                            ) : call.status === 'ANSWERED' ? (
                                                <span className="text-[8px] font-bold text-blue-600 uppercase tracking-widest animate-pulse">LIVE NOW</span>
                                            ) : call.status === 'MISSED' ? (
                                                <span className="text-[8px] font-bold text-red-600 uppercase tracking-widest">MISSED CALL</span>
                                            ) : (
                                                <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest">IN_QUEUE</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-400 font-bold text-[10px]">{call.duration ? `${call.duration}s` : '—'}</td>
                                 </tr>
                              )) : (
                                 <tr><td colSpan="5" className="px-6 py-16 text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest">Awaiting voice telemetry...</td></tr>
                              )}
                           </tbody>
                        </table>
                    </div>
                </div>
              </div>
           )}

           {/* VIEW: Support Logs (Voice Telemetry) - Technical Header */}
          {activeView === "Support Logs" && (
             <div className="space-y-6 py-4 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 px-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0A1628] text-white rounded-lg flex items-center justify-center shadow-sm">
                      <HiPhone size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0A1628] uppercase tracking-widest">Voice Telemetry Command</h3>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Real-time support auditing system</p>
                    </div>
                  </div>
                  
                  <div className="flex bg-white p-1 rounded-lg border border-[#E3E6E8] shadow-sm">
                    <button 
                      onClick={() => setCallStatusFilter("ALL")}
                      className={`px-6 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${callStatusFilter === 'ALL' ? 'bg-[#0A1628] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Mission Logs
                    </button>
                    <button 
                      onClick={() => setCallStatusFilter("MISSED")}
                      className={`px-6 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${callStatusFilter === 'MISSED' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:text-red-500'}`}
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

          {/* VIEW: Review Queue (Elite Drill-Down) */}
          {activeView === "Review Queue" && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {!selectedReviewEmployee ? (
                 <>
                   {/* Stage 1: Intelligence Sources - Sharp Grid */}
                   <div className="flex items-center justify-between mb-8 px-2">
                      <div>
                         <h3 className="text-sm font-bold text-[#0A1628] uppercase tracking-widest">Intelligence Sources</h3>
                         <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest opacity-60 mt-1">Active contributors awaiting verification sync</p>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100 shadow-sm animate-pulse">
                         <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                         <span className="text-[9px] font-bold uppercase tracking-widest">Live Sync Alpha</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.values(pendingQuestions.reduce((acc, q) => {
                         const key = q.submittedByEmail || "Unknown";
                         if (!acc[key]) acc[key] = { email: key, name: q.submittedByName || "Internal Member", questions: [] };
                         acc[key].questions.push(q);
                         return acc;
                      }, {})).map((agent) => (
                         <div 
                           key={agent.email} 
                           onClick={() => setSelectedReviewEmployee(agent)}
                           className="group bg-white p-6 rounded-lg border border-[#E3E6E8] shadow-sm hover:border-[#0074CC]/30 transition-all cursor-pointer relative overflow-hidden"
                         >
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                               <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-[#E3E6E8] shadow-inner group-hover:bg-[#0074CC] group-hover:text-white transition-all font-bold text-gray-300">
                                  {agent.name.charAt(0)}
                               </div>
                               <div>
                                  <h4 className="text-sm font-bold text-[#0A1628] uppercase tracking-tight group-hover:text-[#0074CC] transition-colors mb-0.5">{agent.name}</h4>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest opacity-60 truncate max-w-[120px]">{agent.email}</p>
                               </div>
                            </div>
                            <div className="flex items-center justify-between pt-5 border-t border-[#F3F4F6] relative z-10">
                               <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Pending Intel</span>
                               <div className="w-8 h-8 bg-[#0A1628] text-white rounded-lg flex items-center justify-center text-[10px] font-bold group-hover:bg-[#0074CC] transition-all">{agent.questions.length}</div>
                            </div>
                         </div>
                      ))}

                      {pendingQuestions.length === 0 && (
                         <div className="col-span-full py-24 bg-white rounded-lg border border-dashed border-[#E3E6E8] flex flex-col items-center justify-center text-center px-10">
                            <h3 className="text-sm font-bold text-[#0A1628] mb-1 uppercase tracking-widest">Control Deck Sanitized</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">All systems nominal.</p>
                         </div>
                      )}
                   </div>
                 </>
               ) : (
                 <div className="animate-in fade-in duration-500">
                    <div className="flex items-center justify-between mb-8 px-2">
                       <div className="flex items-center gap-4">
                          <button onClick={() => setSelectedReviewEmployee(null)} className="w-8 h-8 bg-white border border-[#E3E6E8] rounded-lg flex items-center justify-center text-gray-400 hover:text-[#0074CC] shadow-sm"><HiArrowPath className="rotate-180" size={16} /></button>
                          <div className="text-[10px] font-bold uppercase tracking-widest"><span className="text-gray-400">Auditing</span> <span className="text-gray-200">/</span> <span className="text-[#0074CC]">{selectedReviewEmployee.name}</span></div>
                       </div>
                    </div>

                    <div className="flex flex-col gap-6">
                       {selectedReviewEmployee.questions.map((q) => (
                         <div key={q.id} className="bg-white border border-[#E3E6E8] rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-gray-50/50 border-b border-[#E3E6E8] px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                               <div className="flex items-center gap-3">
                                  <HiTag size={12} className="text-gray-300" />
                                  <div>
                                     <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Stack</div>
                                     <div className="text-[10px] font-bold text-[#0A1628] uppercase">{q.technologyName || "General"}</div>
                                  </div>
                               </div>
                               <div className="flex items-center gap-3">
                                  <HiChartBar size={12} className="text-gray-300" />
                                  <div>
                                     <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Scale</div>
                                     <div className="text-[10px] font-bold text-[#0A1628] uppercase">{q.difficulty || "Medium"}</div>
                                  </div>
                               </div>
                               <div className="flex items-center gap-3">
                                  <HiIdentification size={12} className="text-gray-300" />
                                  <div>
                                     <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Packet ID</div>
                                     <div className="text-[10px] font-bold text-[#0A1628] uppercase">{String(q.id).split('-')[0]}</div>
                                  </div>
                               </div>
                               <div className="flex items-center gap-3">
                                  <HiBriefcase size={12} className="text-gray-300" />
                                  <div>
                                     <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Origin</div>
                                     <div className="text-[10px] font-bold text-[#0074CC] uppercase truncate max-w-[80px]">{q.clientName || "Vault"}</div>
                                  </div>
                               </div>
                            </div>

                            <div className="p-6">
                               <div className="space-y-6 mb-8">
                                  <div className="bg-[#F8F9F9] border-l-2 border-[#0074CC] px-5 py-4 rounded-r-lg">
                                     <h3 className="text-sm font-bold text-[#0A1628] leading-tight uppercase tracking-tight">{q.title}</h3>
                                  </div>
                                  <div className="p-5 bg-gray-50 border border-[#E3E6E8] rounded-lg">
                                     <p className="text-xs text-[#232629] leading-relaxed font-medium uppercase tracking-tight opacity-70">{q.content}</p>
                                  </div>
                                  <div className="p-5 bg-[#0074CC]/5 border border-[#0074CC]/10 rounded-lg">
                                     <p className="text-xs text-[#232629] leading-relaxed font-bold uppercase tracking-tight">{q.initialAnswer || "No documentation provided."}</p>
                                  </div>
                               </div>

                               <div className="space-y-4 pt-6 border-t border-[#F3F4F6]">
                                  <textarea
                                    placeholder="Compose the verified master intelligence packet..."
                                    value={correctedAnswers[q.id] || ""}
                                    onChange={(e) => setCorrectedAnswers({ ...correctedAnswers, [q.id]: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-[#E3E6E8] rounded-lg text-xs text-[#232629] placeholder:text-gray-300 outline-none focus:bg-white focus:border-[#0074CC] transition-all font-medium"
                                    rows={2}
                                  />
                                  <textarea 
                                    value={comments[q.id] || ""}
                                    onChange={(e) => setComments({ ...comments, [q.id]: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-[#E3E6E8] rounded-lg text-xs font-bold uppercase tracking-tight text-gray-500 placeholder:text-gray-200 outline-none focus:bg-white focus:border-[#0074CC] transition-all"
                                    placeholder="Technical feedback..."
                                    rows={1}
                                  />
                                  <div className="flex items-center justify-between pt-2">
                                     <button onClick={() => handleReviewAction(q.id, 'REJECTED')} disabled={!!processing} className="flex items-center gap-2 px-6 py-2 rounded-lg border border-red-100 text-red-500 text-[9px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"><HiTrash size={14} /> Reject</button>
                                     <button onClick={() => handleReviewAction(q.id, 'APPROVED')} disabled={!!processing} className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-[#0074CC] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#0063AD] transition-all shadow-sm"><HiCheckCircle size={14} /> Sync Mastery</button>
                                  </div>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* MODAL: New Agent Form - Sharp */}
          {showUserForm && (
            <div className="fixed inset-0 bg-[#0A1628]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-lg w-full max-w-lg p-8 shadow-2xl border border-[#E3E6E8] relative animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-sm font-bold text-[#0A1628] uppercase tracking-widest">Induct New Agent</h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Establishing global access credentials</p>
                  </div>
                  <button onClick={() => setShowUserForm(false)} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"><HiXCircle size={20} /></button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Full Identity</label>
                    <input required value={userForm.fullName} onChange={e => setUserForm({...userForm, fullName: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-[#E3E6E8] focus:bg-white focus:border-[#0074CC] outline-none transition-all text-xs font-bold" placeholder="e.g. Alex Chen" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Secure Email</label>
                    <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-[#E3E6E8] focus:bg-white focus:border-[#0074CC] outline-none transition-all text-xs font-bold" placeholder="agent@aja.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Sync Phone</label>
                      <input required type="tel" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-[#E3E6E8] focus:bg-white focus:border-[#0074CC] outline-none transition-all text-xs font-bold" placeholder="10-digit number" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Clearance Level</label>
                      <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-[#E3E6E8] focus:bg-white focus:border-[#0074CC] outline-none transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                        <option value="EMPLOYEE">Contributor</option>
                        <option value="TUTOR">Curator</option>
                        <option value="ADMIN">Overseer</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Initial Cipher</label>
                    <input required type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-[#E3E6E8] focus:bg-white focus:border-[#0074CC] outline-none transition-all text-xs font-bold" placeholder="••••••••" />
                  </div>
                  <button disabled={processing === 'user'} className="w-full bg-[#0A1628] text-white py-3 rounded-lg text-[9px] font-bold uppercase tracking-widest mt-4 hover:bg-black transition-all shadow-sm active:scale-95 disabled:opacity-50">
                    {processing === 'user' ? 'INDUCTING...' : 'FINALIZE AGENT REGISTRATION'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: New Package Form - Sharp */}
          {showPackageForm && (
            <div className="fixed inset-0 bg-[#0A1628]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-lg w-full max-w-xl p-8 shadow-2xl border border-[#E3E6E8] relative animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-sm font-bold text-[#0A1628] uppercase tracking-widest">Design Elite Product</h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Expanding the global mastery inventory</p>
                  </div>
                  <button onClick={() => setShowPackageForm(false)} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"><HiXCircle size={20} /></button>
                </div>

                <form onSubmit={handleCreatePackage} className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Product Identification</label>
                    <input required value={packageForm.name} onChange={e => setPackageForm({...packageForm, name: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-[#E3E6E8] outline-none focus:bg-white focus:border-[#0074CC] transition-all text-xs font-bold" placeholder="e.g. Distributed Systems Mastery" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Value Proposition</label>
                    <textarea rows="3" value={packageForm.description} onChange={e => setPackageForm({...packageForm, description: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-[#E3E6E8] outline-none focus:bg-white focus:border-[#0074CC] transition-all text-xs font-medium leading-relaxed uppercase tracking-tight opacity-70" placeholder="Define the mastery offered..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Entry Tier Price</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-[10px]">₹</span>
                       <input required type="number" value={packageForm.basicPrice} onChange={e => setPackageForm({...packageForm, basicPrice: e.target.value})} className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-gray-50 border border-[#E3E6E8] focus:bg-white focus:border-[#0074CC] outline-none text-xs font-bold" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#0074CC] ml-1">Mastery Bundle Price</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0074CC] font-bold text-[10px]">₹</span>
                       <input required type="number" value={packageForm.bundlePrice} onChange={e => setPackageForm({...packageForm, bundlePrice: e.target.value})} className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-blue-50 border border-blue-100 focus:border-blue-400 outline-none text-[13px] font-bold text-[#0074CC] shadow-inner" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Tech Core</label>
                    <input value={packageForm.technologyName} onChange={e => setPackageForm({...packageForm, technologyName: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-[#E3E6E8] outline-none focus:bg-white focus:border-[#0074CC] text-xs font-bold" placeholder="e.g. Distributed Systems" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Storefront Category</label>
                    <select value={packageForm.packageType} onChange={e => setPackageForm({...packageForm, packageType: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-[#E3E6E8] outline-none text-[9px] font-bold uppercase tracking-widest cursor-pointer shadow-sm">
                      <option value="FULL_STACK">FULL STACK</option>
                      <option value="BACKEND">BACKEND</option>
                      <option value="FRONTEND">FRONTEND</option>
                      <option value="SYSTEM_DESIGN">S-DESIGN</option>
                    </select>
                  </div>
                  <button className="col-span-2 bg-[#0A1628] text-white py-3 rounded-lg text-[9px] font-bold uppercase tracking-widest mt-6 hover:bg-black transition-all shadow-sm active:scale-95 disabled:opacity-50">
                    PUBLISH ELITE INTEL TO GLOBAL STOREFRONT
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: Update Phone - Sharp */}
          {showPhoneModal && (
            <div className="fixed inset-0 bg-[#0A1628]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-lg w-full max-w-sm p-8 shadow-2xl border border-[#E3E6E8] relative animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[10px] font-bold text-[#0A1628] uppercase tracking-widest">Update Phone</h2>
                  <button onClick={() => setShowPhoneModal(false)} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"><HiXCircle size={18} /></button>
                </div>
                <form onSubmit={handleUpdatePhone} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Contact Number</label>
                    <input 
                      required 
                      value={newPhoneNumber} 
                      onChange={e => setNewPhoneNumber(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-[#E3E6E8] focus:bg-white focus:border-[#0074CC] outline-none transition-all text-xs font-bold" 
                      placeholder="e.g. 7780131390" 
                    />
                  </div>
                  <button disabled={processing === 'phone'} className="w-full bg-[#0A1628] text-white py-3 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-sm active:scale-95">
                    {processing === 'phone' ? 'SAVING...' : 'SAVE CONTACT NUMBER'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ON CALL INDICATOR - Sharp */}
        {isInCall && (
          <div key={isInCall} className="fixed bottom-12 right-12 z-[99999] flex items-center gap-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-white animate-pulse">
             <div className="relative">
                <span className="absolute inset-0 bg-white rounded-full animate-ping opacity-75" />
                <span className="relative block w-3 h-3 bg-white rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Telemetry Active</span>
                <span className="text-xs font-bold uppercase tracking-tight">System Live: On Call</span>
              </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanelPage;
