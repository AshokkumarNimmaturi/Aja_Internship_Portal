import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Copy,
  Check,
  UserPlus,
  Users,
  ClipboardList,
  Package as PackageIcon,
  ShieldAlert,
  Key,
  CheckCircle,
  XCircle,
  Star,
  RefreshCw,
  Clock
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import RoleBadge from "../../components/common/RoleBadge";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const generateTempPassword = () => {
  return `Aja@${Math.floor(1000 + Math.random() * 9000)}Temp`;
};

const AdminPanelPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Active view based on URL — order matters: more specific paths first
  const activeView = location.pathname.includes("/packages")
    ? "Packages"
    : location.pathname.includes("/audit")
    ? "Audit Log"
    : location.pathname.includes("/access")
    ? "Access Requests"
    : location.pathname.includes("/admin/review") || location.pathname.includes("/review")
    ? "Pending Review"
    : "Users";

  // --- SECURITY DEBUGGER: Decode JWT to see authorities ---
  const getRolesFromToken = () => {
    try {
      const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) return ["NO_TOKEN_FOUND"];
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      console.log("Decoded Token Payload:", decoded);
      return decoded.authorities || decoded.roles || decoded.role || [decoded.sub ? "AUTHENTICATED" : "UNKNOWN"];
    } catch (e) {
      return ["DECODE_ERROR"];
    }
  };

  const [currentRoles] = useState(getRolesFromToken());
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(null);
  const [packages, setPackages] = useState([]);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [reviewComments, setReviewComments] = useState({});
  const [reviewRatings, setReviewRatings] = useState({});
  const [reviewError, setReviewError] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "EMPLOYEE",
  });
  const [createdUser, setCreatedUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // DATA FETCHING
  const fetchUsers = useCallback(async () => {
    setUsersError(null);
    setUsersLoading(true);
    try {
      const res = await axiosInstance.get("/admin/users");
      const data = Array.isArray(res.data) ? res.data : (res.data.content || []);
      setUsers(data);
    } catch (err) {
      console.error("Fetch users error:", err);
      setUsersError(err.response?.data?.message || `HTTP ${err.response?.status || 'Connection Error'}`);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setAuditError(null);
    setAuditLoading(true);
    try {
      const res = await axiosInstance.get("/admin/audit-log");
      console.log("🔍 AUDIT LOG RAW RESPONSE:", res.data);
      
      // Handle various Spring Page/Wrapper structures
      const rawData = res.data.content || res.data.data || res.data.auditLogs || (Array.isArray(res.data) ? res.data : []);
      
      const normalized = rawData.map(log => ({
        id: log.id || Math.random(),
        timestamp: log.createdAt || log.created_at || log.timestamp || new Date().toISOString(),
        action: log.action || "SYSTEM_ACTION",
        entity: log.entityType || log.entity_type || log.entity || "N/A",
        details: log.details || log.description || log.message || "—",
        performedBy: log.performedByEmail || log.performedBy || log.performed_by || "System"
      }));
      
      setAuditLogs(normalized);
    } catch (err) {
      console.error("Fetch audit logs error:", err);
      // Capture the specific backend message if available
      const msg = err.response?.data?.message || err.response?.data || `HTTP ${err.response?.status || 'Network Error'}`;
      setAuditError(msg);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  const fetchPendingQuestions = useCallback(async () => {
    setPendingLoading(true);
    setReviewError(null);
    try {
      // Direct call to the backend's review queue
      const res = await axiosInstance.get("/questions/pending");
      const list = Array.isArray(res.data) ? res.data : (res.data.content || []);
      setPendingQuestions(list);
    } catch (err) {
      console.error("PENDING QUEUE ERROR:", err);
      const code = err.code || (err.response ? `HTTP ${err.response.status}` : "NETWORK_ERROR");
      setReviewError(`${code}: Could not reach review queue`);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await axiosInstance.get("/packages");
      setPackages(res.data);
    } catch (err) {
      toast.error("Failed to load packages");
    }
  };

  useEffect(() => {
    if (activeView === "Users") fetchUsers();
    else if (activeView === "Audit Log") fetchAuditLogs();
    else if (activeView === "Packages") fetchPackages();
    else if (activeView === "Pending Review") fetchPendingQuestions();
  }, [activeView, fetchAuditLogs, fetchPendingQuestions]);

  // CREATE USER
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tempPassword = generateTempPassword();
      const fullName = `${createForm.firstName} ${createForm.lastName}`.trim();

      await axiosInstance.post("/admin/users", {
        fullName,
        email: createForm.email,
        phone: createForm.phoneNumber,
        role: createForm.role,
      });

      setCreatedUser({ ...createForm, fullName, tempPassword });
      setCreateForm({ firstName: "", lastName: "", email: "", phoneNumber: "", role: "EMPLOYEE" });
      setShowCreateModal(false);

      toast.success("User created successfully!");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      toast.success("User deactivated");
      fetchUsers();
    } catch {
      toast.error("Failed to deactivate user");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdUser?.tempPassword || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Approve / Reject question as admin
  const handleReviewAction = async (id, action) => {
    setProcessing(id + action);
    try {
      const feedback = reviewComments[id] || "";
      const payload = {
        decision: action, // ✅ Matches ReviewQuestionRequest.getDecision()
        rejectionReason: feedback,
        feedback: feedback,
        reviewerId: user?.id || user?.userId,
      };

      await axiosInstance.put(`/questions/${id}/review`, payload);
      
      setPendingQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success(`Question ${action === "APPROVED" ? "approved ✓" : "rejected"}`);
    } catch (err) {
      console.error("REVIEW ACTION FAILED:", err);
      if (err.response?.status === 403) {
        toast.error("Access Denied (403): Check your token authorities.");
      } else {
        toast.error(err.response?.data?.message || "Connection Error");
      }
    } finally {
      setProcessing(null);
    }
  };

  // Field normalizers
  const getTechFromQ = (q) => {
    if (typeof q.technology === "string") return q.technology;
    return q.technology?.name || q.technologyName || "";
  };
  const getBodyFromQ = (q) => q.content || q.description || q.body || q.details || "";
  const getSubmitterFromQ = (q) => q.submitted_by || q.submittedBy || q.createdBy || q.authorName || q.employee?.fullName || "";

  const viewTitles = {
    "Users": "Manage Users",
    "Audit Log": "System Audit Logs",
    "Packages": "Subscription Packages",
    "Access Requests": "Pending Access Requests",
    "Pending Review": "Pending Question Reviews",
  };

  const viewDesc = {
    "Users": "Add, deactivate, and manage portal roles.",
    "Audit Log": "Review all system-level critical actions.",
    "Packages": "Overview of available active packages and tracks.",
    "Access Requests": "Approve or deny subscriber package requests.",
    "Pending Review": "Approve or reject employee-submitted interview questions.",
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PortalSidebar 
        user={user} 
        role={user?.role || "ADMIN"} 
        activeItem={activeView} 
        pendingCount={pendingQuestions.length} 
      />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl text-[#0A1628] mb-1">
                {viewTitles[activeView]}
              </h1>
              <p className="text-sm text-gray-400 font-light">
                {viewDesc[activeView]}
              </p>
            </div>
            
            {activeView === "Users" && (
               <button 
                  onClick={() => setShowCreateModal(!showCreateModal)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all shadow-sm"
               >
                 <UserPlus size={16} /> New User
               </button>
            )}
            
             {activeView === "Packages" && (
               <button 
                  onClick={() => toast("Package creation module coming soon!")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all shadow-sm"
               >
                 <PackageIcon size={16} /> New Package
               </button>
            )}
          </div>

          {/* CREATE USER MODAL INLINE */}
          {showCreateModal && activeView === "Users" && (
            <div className="mb-8 bg-white border border-black/8 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#0A1628] mb-1">Create New Internal User</h2>
              <p className="text-xs text-gray-400 mb-5">Fill in all fields. A temporary password will be generated automatically.</p>
              <form onSubmit={handleCreateUser}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">First Name</label>
                    <input
                      required
                      placeholder="e.g. Priya"
                      value={createForm.firstName}
                      onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-black/10 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Last Name</label>
                    <input
                      required
                      placeholder="e.g. Sharma"
                      value={createForm.lastName}
                      onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-black/10 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="name@aja.com"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-black/10 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={createForm.phoneNumber}
                      onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-black/10 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Role</label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                      className="w-full px-4 py-2.5 border border-black/10 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-white"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="TUTOR">Tutor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all"
                  >
                    {loading ? "Creating..." : "Create User"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 border border-black/10 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TEMPORARY PASSWORD COPY */}
          {createdUser && (
             <div className="mb-8 flex flex-col md:flex-row items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                   <UserPlus size={16} />
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-green-900">{createdUser.fullName || `${createdUser.firstName} ${createdUser.lastName}`} ({createdUser.email}) created</p>
                   <p className="text-xs text-green-700 font-mono mt-0.5">Temporary Password: <strong>{createdUser.tempPassword}</strong></p>
                 </div>
               </div>
               <button
                 onClick={handleCopy}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-green-700 text-xs font-bold uppercase tracking-wide rounded-lg border border-green-200 shadow-sm hover:bg-green-50"
               >
                 {copied ? <Check size={14} /> : <Copy size={14} />}
                 {copied ? "Copied" : "Copy Password"}
               </button>
             </div>
          )}

          {/* USERS TABLE */}
          {activeView === "Users" && (
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-black/5">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-sm text-[#0A1628]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold">{u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || '—'}</div>
                           <div className="text-xs text-gray-400 mt-0.5">{u.email}</div>
                           {u.phone && <div className="text-xs text-gray-300 mt-0.5">{u.phone}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${u.enabled ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {u.enabled ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {u.email !== user?.email && u.enabled && (
                            <button
                              onClick={() => handleDeactivate(u.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && !usersError && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400">Loading users...</td>
                      </tr>
                    )}
                    {usersError && (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center">
                          <div className="inline-flex flex-col items-center gap-2">
                            <span className="text-3xl">⚠️</span>
                            <p className="text-red-600 font-semibold text-sm">{usersError}</p>
                            <p className="text-xs text-gray-400">Make sure the backend is running and the admin endpoint is accessible.</p>
                            <button onClick={fetchUsers} className="mt-2 px-4 py-2 bg-[#0A1628] text-white text-xs font-semibold rounded-lg hover:bg-[#0F2340] transition-all">Retry</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PACKAGES TABLE */}
          {activeView === "Packages" && (
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-black/5">
                    <tr>
                      <th className="px-6 py-4">Package Details</th>
                      <th className="px-6 py-4">Technology</th>
                      <th className="px-6 py-4">Base Price</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-sm text-[#0A1628]">
                    {packages.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold">{pkg.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{pkg.description || "Package description"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold border border-blue-100">
                            {pkg.technology?.name || pkg.technologyName || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-600">
                          ₹{pkg.basicPrice || pkg.premiumPrice || 299}
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-green-600 text-[10px] font-bold tracking-widest bg-green-50 border border-green-200 px-2.5 py-1 rounded-full uppercase">ACTIVE</span>
                        </td>
                      </tr>
                    ))}
                    {packages.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-20 text-center">
                          <PackageIcon className="mx-auto h-8 w-8 text-gray-300 mb-3" />
                          <p className="text-gray-500 font-medium">Loading package library...</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AUDIT LOG TABLE */}
          {activeView === "Audit Log" && (
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-black/5">
                    <tr>
                      <th className="px-6 py-4 text-gray-500">Timestamp</th>
                      <th className="px-6 py-4 text-gray-500">Action</th>
                      <th className="px-6 py-4 text-gray-500">Actor</th>
                      <th className="px-6 py-4 text-gray-500">Entity</th>
                      <th className="px-6 py-4 text-gray-500">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-sm text-[#0A1628]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors border-l-4 border-transparent hover:border-blue-400">
                        <td className="px-6 py-4 text-[11px] font-mono text-gray-400">
                          {(() => {
                            try {
                              const d = Array.isArray(log.timestamp) 
                                ? new Date(log.timestamp[0], log.timestamp[1]-1, log.timestamp[2], log.timestamp[3], log.timestamp[4])
                                : new Date(log.timestamp);
                              return isNaN(d.getTime()) ? "Just now" : d.toLocaleString();
                            } catch { return "—"; }
                          })()}
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold tracking-tighter uppercase border ${
                             log.action.includes('LOGIN') ? 'bg-blue-50 text-blue-600 border-blue-100' :
                             log.action.includes('CREATE') ? 'bg-green-50 text-green-600 border-green-100' :
                             log.action.includes('UPDATE') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             'bg-gray-50 text-gray-600 border-gray-100'
                           }`}>
                             {log.action}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                           {log.performedBy}
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold text-blue-500 tracking-wider uppercase">
                          {log.entity}
                        </td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs text-xs">
                          <div className="line-clamp-2 leading-relaxed">
                            {log.details}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center">
                            <ClipboardList className="mx-auto h-8 w-8 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No audit logs recorded yet</p>
                            
                            {auditError && (
                              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl max-w-md">
                                 <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase mb-2">
                                   <ShieldAlert size={14} /> Critical API Failure
                                 </div>
                                 <p className="text-red-600 text-xs font-mono mb-3">Error: {auditError}</p>
                                 <div className="text-[10px] text-red-500 bg-white/50 p-2 rounded-lg border border-red-100 text-left">
                                   <p className="font-bold mb-2 uppercase tracking-wide">Suggested Fixes:</p>
                                   <ul className="space-y-2 list-disc pl-3">
                                      <li><strong>Clear Session:</strong> If your JWT is expired, you need a fresh login.</li>
                                      <li><strong>Backend Port:</strong> Check if Port 8080 is accessible.</li>
                                   </ul>
                                   <button 
                                      onClick={() => {
                                        localStorage.clear();
                                        sessionStorage.clear();
                                        window.location.href = "/login";
                                      }}
                                      className="mt-3 w-full bg-red-600 text-white py-1.5 rounded-lg font-bold hover:bg-red-700 transition uppercase tracking-tighter"
                                   >
                                      Force Logout & Re-Login
                                   </button>
                                 </div>
                              </div>
                            )}
                            
                            {!auditError && <p className="text-xs text-gray-400 mt-1">Logs appear here once users perform tracked actions.</p>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PENDING REVIEW — Admin can approve/reject directly */}
          {activeView === "Pending Review" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                {!pendingLoading && pendingQuestions.length > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                    {pendingQuestions.length} awaiting review
                  </span>
                )}
                <button
                  onClick={fetchPendingQuestions}
                  className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 border border-black/10 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <RefreshCw size={14} className={pendingLoading ? "animate-spin" : ""} /> Refresh
                </button>
              </div>

              {pendingLoading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border border-black/5 rounded-2xl shadow-sm">
                  <RefreshCw className="animate-spin text-gray-300 mb-4" size={32} />
                  <p className="text-gray-400 text-sm">Loading pending questions...</p>
                </div>
              ) : pendingQuestions.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {pendingQuestions.map((q) => (
                    <div key={q.id} className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-4">
                          <h3 className="font-bold text-[#0A1628] text-base leading-snug">{q.title}</h3>
                          {getSubmitterFromQ(q) && (
                            <p className="text-xs text-gray-400 mt-1">By <span className="font-semibold text-gray-600">{getSubmitterFromQ(q)}</span></p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                          {getTechFromQ(q) && (
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border border-blue-100">{getTechFromQ(q)}</span>
                          )}
                          {q.difficulty && (
                            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${
                              q.difficulty === "EASY" ? "bg-green-50 text-green-700 border-green-200" :
                              q.difficulty === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-red-50 text-red-700 border-red-200"}`}>{q.difficulty}</span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                            <Clock size={10} /> Pending
                          </span>
                        </div>
                      </div>

                      {getBodyFromQ(q) && (
                        <p className="text-sm text-gray-500 leading-relaxed mb-4 bg-gray-50 rounded-xl p-3 border border-black/5">{getBodyFromQ(q)}</p>
                      )}

                      <div className="flex items-center gap-1 mb-4">
                        <span className="text-xs font-semibold text-gray-400 mr-2 uppercase tracking-wide">Rate:</span>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setReviewRatings({ ...reviewRatings, [q.id]: s })} className="hover:scale-110 transition-transform">
                            <Star size={18} className={s <= (reviewRatings[q.id] || 0) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                          </button>
                        ))}
                        {reviewRatings[q.id] && <span className="text-xs text-amber-500 font-semibold ml-2">{reviewRatings[q.id]}/5</span>}
                      </div>

                      <input
                        placeholder="Add reviewer comment (optional)..."
                        value={reviewComments[q.id] || ""}
                        onChange={(e) => setReviewComments({ ...reviewComments, [q.id]: e.target.value })}
                        className="w-full px-4 py-2.5 border border-black/10 rounded-xl text-sm placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all mb-4"
                      />

                      <div className="flex gap-3">
                        <button onClick={() => handleReviewAction(q.id, "REJECTED")} disabled={!!processing}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-semibold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-50">
                          <XCircle size={15} />{processing === q.id + "REJECTED" ? "Rejecting..." : "Reject"}
                        </button>
                        <button onClick={() => handleReviewAction(q.id, "APPROVED")} disabled={!!processing}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-semibold hover:bg-green-500 hover:text-white hover:border-green-500 transition-all disabled:opacity-50">
                          <CheckCircle size={15} />{processing === q.id + "APPROVED" ? "Approving..." : "Approve"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white border border-black/5 rounded-2xl shadow-sm text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-lg font-bold text-[#0A1628] mb-2">All reviews complete!</h3>
                  {reviewError && (
                     <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-mono">
                        Error fetching pending questions: {reviewError}
                     </div>
                  )}
                  <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-4">No pending questions right now.</p>
                  <button onClick={fetchPendingQuestions} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 border border-black/10 rounded-xl hover:bg-gray-50 transition-all">
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ACCESS REQUESTS */}
          {activeView === "Access Requests" && (
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
               <div className="flex flex-col items-center justify-center py-24 text-center">
                 <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4 border border-amber-100 shadow-sm">
                   <Key size={28} />
                 </div>
                 <h3 className="text-lg font-bold text-[#0A1628] mb-2 leading-snug">No Pending Requests</h3>
                 <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                   All subscription access requests have been cleared. New requests will automatically appear here for your approval.
                 </p>
               </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminPanelPage;
