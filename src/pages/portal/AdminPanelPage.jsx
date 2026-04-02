import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { 
  Users, 
  ClipboardList, 
  Package as PackageIcon, 
  Key, 
  Clock, 
  RefreshCw,
  MessageSquare,
  CheckCircle,
  XCircle,
  Activity,
  PlusCircle,
  UserPlus,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

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

  // Forms Visibility
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);

  // Form Data
  const [userForm, setUserForm] = useState({ fullName: "", email: "", password: "", role: "EMPLOYEE" });
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
  }, []);

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
        // If user is currently enabled (true), deactivate them (DELETE)
        await axiosInstance.delete(`/admin/users/${userId}`);
        toast.success("User deactivated successfully");
      } else {
        // If user is currently disabled (false), enable them (PUT /activate)
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
      setUserForm({ fullName: "", email: "", password: "", role: "EMPLOYEE" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setProcessing(null);
    }
  };

  // ✅ PACKAGE ACTIONS
  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setProcessing("package");
    try {
      // Assuming backend expects these price fields
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
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif text-[#0A1628] mb-1">{activeView}</h1>
              <p className="text-xs text-gray-400 font-light tracking-wide uppercase font-sans">Administrative Control Center</p>
            </div>
            
            <div className="flex gap-3">
              {activeView === "Users" && user?.role === 'ADMIN' && (
                <button onClick={() => setShowUserForm(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/10">
                  <UserPlus size={16} /> Add Member
                </button>
              )}
              {activeView === "Packages" && user?.role === 'ADMIN' && (
                <button onClick={() => setShowPackageForm(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/10">
                  <PlusCircle size={16} /> New Package
                </button>
              )}
              <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 border border-black/10 rounded-xl hover:bg-gray-100 transition-all">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sync
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Talent Pool", count: stats.users, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Questions", count: stats.questions, icon: ClipboardList, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Pending", count: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Tickets", count: stats.support, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" }
            ].map((s, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-black/5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${s.bg} ${s.color}`}>
                    <s.icon size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-serif text-[#0A1628]">{s.count}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* VIEW: Users */}
          {activeView === "Users" && user?.role === 'ADMIN' && (
             <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-black/5">
                    <tr><th className="p-5">User Profile</th><th className="p-5">Access Level</th><th className="p-5">State</th><th className="p-5 text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-sm font-sans">
                    {Array.isArray(users) && users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-all">
                        <td className="p-5">
                          <div className="font-bold text-[#0A1628]">{u.fullName}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </td>
                        <td className="p-5">
                          <span className="text-[10px] font-bold px-3 py-1 bg-gray-100 rounded-full border border-black/5 text-gray-600 uppercase tracking-widest">{u.role}</span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                             <span className={`w-2 h-2 rounded-full ${u.enabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-red-400'}`} />
                             <span className="text-xs font-semibold">{u.enabled ? 'Active' : 'Disabled'}</span>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                           {user?.id !== u.id && (
                             <button 
                               onClick={() => handleToggleUser(u.id, u.enabled)}
                               className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
                                 u.enabled ? 'text-red-600 border-red-100 hover:bg-red-50' : 'text-green-600 border-green-100 hover:bg-green-50'
                               }`}
                             >
                               {u.enabled ? 'Deactivate' : 'Enable Access'}
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
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(packages) && packages.map(pkg => (
                  <div key={pkg.id} className="bg-white p-7 rounded-[40px] border border-black/5 shadow-sm hover:border-blue-200 transition-all group relative overflow-hidden">
                     <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 group-hover:scale-110 transition-transform"><PackageIcon size={28} /></div>
                     <h3 className="font-bold text-xl text-[#0A1628] mb-1">{pkg.name}</h3>
                     <p className="text-sm text-gray-400 mb-6 font-light line-clamp-2">{pkg.description || "Premium interview prep package."}</p>
                     
                     <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          <span>Standard</span>
                          <span className="text-blue-600">₹{pkg.standardPrice || 0}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 font-black">
                          <span>Full Bundle</span>
                          <span className="text-emerald-600">₹{pkg.bundlePrice || 0}</span>
                        </div>
                     </div>

                     <div className="flex justify-between items-center pt-5 border-t border-black/5">
                        <span className="text-[8px] uppercase tracking-widest text-gray-300 font-bold">Base Price: ₹{pkg.basicPrice || 0}</span>
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-100">Live</span>
                     </div>
                  </div>
                ))}
             </div>
          )}

          {/* VIEW: Audit Log */}
          {activeView === "Audit Log" && user?.role === 'ADMIN' && (
             <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-black/5">
                    <tr><th className="p-5">Recorded At</th><th className="p-5">Actor</th><th className="p-5">Action</th><th className="p-5">Details</th></tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-sm font-sans">
                    {Array.isArray(auditLogs) && auditLogs.length > 0 ? auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-all">
                        <td className="p-5 text-gray-400 text-xs font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-5 font-semibold text-[#0A1628]">
                          {log.performedByEmail || "System"}
                        </td>
                        <td className="p-5">
                          <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 flex items-center gap-1 w-fit">
                            <Activity size={10} /> {log.action}
                          </span>
                        </td>
                        <td className="p-5 text-gray-500 italic max-w-xs truncate">"{log.details}"</td>
                      </tr>
                    )) : (
                       <tr><td colSpan="4" className="p-20 text-center text-gray-400 italic">No system events recorded yet.</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          )}

          {/* MODAL: Create User */}
          {showUserForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif text-[#0A1628]">Add Team Member</h2>
                  <button onClick={() => setShowUserForm(false)} className="text-gray-400 hover:text-red-500 transition-colors"><XCircle size={24} /></button>
                </div>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2 block mb-1">Full Name</label>
                    <input required value={userForm.fullName} onChange={e => setUserForm({...userForm, fullName: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2 block mb-1">Email Address</label>
                    <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all" placeholder="name@aja.com" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2 block mb-1">Initial Password</label>
                    <input required type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2 block mb-1">Assigned Role</label>
                    <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all">
                      <option value="EMPLOYEE">Employee (Contributor)</option>
                      <option value="TUTOR">Tutor (Curator)</option>
                      <option value="ADMIN">Admin (Overseer)</option>
                    </select>
                  </div>
                  <button disabled={processing === 'user'} className="w-full bg-[#0A1628] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs mt-4 hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/10">
                    {processing === 'user' ? 'Creating...' : 'Finalize Registration'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: Create Package */}
          {showPackageForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] w-full max-w-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif text-[#0A1628]">Design New Package</h2>
                  <button onClick={() => setShowPackageForm(false)} className="text-gray-400 hover:text-red-500 transition-colors"><XCircle size={24} /></button>
                </div>
                <form onSubmit={handleCreatePackage} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2 block mb-1">Package Display Name</label>
                    <input required value={packageForm.name} onChange={e => setPackageForm({...packageForm, name: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all" placeholder="e.g. Full Stack Bundle" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2 block mb-1">Sales Description</label>
                    <textarea rows="2" value={packageForm.description} onChange={e => setPackageForm({...packageForm, description: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all" placeholder="What value does this offer?" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2 block mb-1">Basic Tier Price</label>
                    <input required type="number" value={packageForm.basicPrice} onChange={e => setPackageForm({...packageForm, basicPrice: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:border-blue-400 outline-none" placeholder="₹" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2 block mb-1">Bundle Price</label>
                    <input required type="number" value={packageForm.bundlePrice} onChange={e => setPackageForm({...packageForm, bundlePrice: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-blue-50 border border-blue-200 focus:border-blue-400 outline-none font-bold" placeholder="₹" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2 block mb-1">Technology Focus</label>
                    <input value={packageForm.technologyName} onChange={e => setPackageForm({...packageForm, technologyName: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:border-blue-400 outline-none" placeholder="Java / React" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2 block mb-1">Catalog Category</label>
                    <select value={packageForm.packageType} onChange={e => setPackageForm({...packageForm, packageType: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-black/5 outline-none font-bold">
                      <option value="FULL_STACK">Full Stack</option>
                      <option value="BACKEND">Backend</option>
                      <option value="FRONTEND">Frontend</option>
                      <option value="SYSTEM_DESIGN">System Design</option>
                    </select>
                  </div>
                  <button className="col-span-2 bg-[#0A1628] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs mt-4 hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/10">
                    Publish to Storefront
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ACCESS REQUESTS, ETC (KEEPING PREVIOUS FIXES) */}
          {activeView === "Review Queue" && (
             <div className="bg-white p-20 rounded-[40px] text-center border border-black/5 italic text-gray-400 font-serif">
                Review queue has been moved to the primary Curation Module.
             </div>
          )}

          {activeView === "Questions" && (
             <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
                 <table className="w-full text-left font-sans">
                   <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-black/5">
                     <tr><th className="p-5">Intel Summary</th><th className="p-5">Technology</th><th className="p-5">Status</th></tr>
                   </thead>
                   <tbody className="divide-y divide-black/5 text-sm">
                      {allQuestions.map(q => (
                        <tr key={q.id}>
                          <td className="p-5">
                            <div className="font-bold text-[#0A1628]">{q.title}</div>
                            <div className="text-xs text-blue-600 italic font-semibold">{q.clientName || "General"}</div>
                          </td>
                          <td className="p-5"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{q.technologyName}</span></td>
                          <td className="p-5"><span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${q.status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>{q.status}</span></td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
             </div>
          )}

          {activeView === "Access Requests" && (
             <div className="space-y-4">
                {Array.isArray(supportRequests) && supportRequests.length > 0 ? supportRequests.map(req => (
                  <div key={req.id} className="bg-white p-7 rounded-[40px] border border-black/5 shadow-sm hover:border-blue-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <h4 className="font-bold text-[#0A1628] text-lg mb-1">{req.subject}</h4>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">From: {req.userEmail}</span>
                       </div>
                       <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{req.status}</span>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-3xl border border-black/5 text-sm text-gray-600 italic mb-5">"{req.message}"</div>
                    {req.status === 'PENDING' && (
                       <button onClick={() => handleSupportStatus(req.id, 'RESOLVED')} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                          <CheckCircle size={14} /> Mark as Resolved
                       </button>
                    )}
                  </div>
                )) : <div className="p-20 text-center text-gray-400 italic">No pending tickets.</div>}
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanelPage;
