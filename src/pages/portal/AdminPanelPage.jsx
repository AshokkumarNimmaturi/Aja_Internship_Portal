import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
// ✅ UPGRADED: Using elite Heroicons 2
import { 
  HiUsers, 
  HiClipboardDocumentList, 
  HiArchiveBox, 
  HiKey, 
  HiClock, 
  HiArrowPath,
  HiChatBubbleLeftEllipsis,
  HiCheckCircle,
  HiXCircle,
  HiBolt,
  HiPlusCircle,
  HiUserPlus,
  HiShieldCheck,
  HiBriefcase,
  HiMagnifyingGlass,
  HiPencilSquare
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import VoiceCallButton from "../../components/common/VoiceCallButton";

const AdminPanelPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeView, setActiveView] = useState("Users");
  
  // States
  const [users, setUsers] = useState([]);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ users: 0, questions: 0, pending: 0, support: 0 });
  const [supportRequests, setSupportRequests] = useState([]);
  const [processing, setProcessing] = useState(null);
  
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
    else if (path.endsWith("/questions")) setActiveView("Questions");
    else if (path.endsWith("/review")) setActiveView("Review Queue");
    else if (path.endsWith("/access")) setActiveView("Access Requests");
    else if (path.endsWith("/packages")) setActiveView("Packages");
    else if (path.endsWith("/audit") && role === 'ADMIN') setActiveView("Audit Log");
    else setActiveView("Access Requests"); // Safe default for Tutors
  }, [location, user?.role]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const isAdmin = user?.role === 'ADMIN';
      
      const fetches = [
        isAdmin ? axiosInstance.get("/admin/users") : Promise.resolve({ data: { content: [] } }),
        axiosInstance.get("/questions"),
        axiosInstance.get("/packages"),
        axiosInstance.get("/support").catch(() => ({ data: [] }))
      ];

      const [uRes, qRes, pRes, sRes] = await Promise.all(fetches);
      
      const userData = uRes.data?.content || uRes.data || [];
      const questionData = qRes.data.content || qRes.data;
      
      setUsers(userData);
      setAllQuestions(questionData);
      setPackages(pRes.data?.content || pRes.data || []);
      setSupportRequests(sRes.data?.content || sRes.data || []);
      setPendingQuestions(questionData.filter(q => q.status === "PENDING"));
      
      setStats({
        users: userData.length,
        questions: questionData.length,
        pending: questionData.filter(q => q.status === "PENDING").length,
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
    if (activeView === "Audit Log" && user?.role === 'ADMIN') fetchAuditData();
  }, [fetchData, fetchAuditData, activeView, user?.role]);

  // ✅ USER ACTIONS
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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <PortalSidebar user={user} role={user?.role || "TUTOR"} activeItem={activeView} />
      
      <main className="flex-1 p-8 py-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-serif text-[#0A1628] mb-1 font-bold">{activeView}</h1>
              <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase font-sans">Administrative Command Terminal</p>
            </div>
            
            <div className="flex gap-4">
              {activeView === "Users" && user?.role === 'ADMIN' && (
                <button onClick={() => setShowUserForm(true)} className="flex items-center gap-2 px-7 py-3.5 bg-[#0A1628] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-900 transition-all shadow-2xl shadow-blue-900/10 active:scale-95">
                  <HiUserPlus size={20} /> Register Team Member
                </button>
              )}
              {activeView === "Packages" && user?.role === 'ADMIN' && (
                <button onClick={() => setShowPackageForm(true)} className="flex items-center gap-2 px-7 py-3.5 bg-[#0A1628] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-900 transition-all shadow-2xl shadow-blue-900/10 active:scale-95">
                  <HiPlusCircle size={20} /> Create New Product
                </button>
              )}
              <button onClick={fetchData} className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border border-black/10 rounded-2xl bg-white hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                <HiArrowPath size={16} className={loading ? "animate-spin" : ""} /> Sync Data
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
                                <span className="text-[11px] font-bold font-mono text-gray-500">{u.phone || "—"}</span>
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500 py-10">
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
      </main>
    </div>
  );
};

export default AdminPanelPage;
