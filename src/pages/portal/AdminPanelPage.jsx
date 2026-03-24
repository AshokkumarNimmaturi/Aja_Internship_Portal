import { useState } from "react";
import {
  Copy,
  Check,
  UserPlus,
  Users,
  ClipboardList,
  Package,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar, StatusBadge } from "./EmployeeDashboard";
import RoleBadge from "../../components/common/RoleBadge";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const mockUsers = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh@aja.com",
    role: "TUTOR",
    active: true,
    firstLoginPending: false,
  },
  {
    id: 2,
    name: "Priya Menon",
    email: "priya@aja.com",
    role: "EMPLOYEE",
    active: true,
    firstLoginPending: false,
  },
  {
    id: 3,
    name: "Anil Sharma",
    email: "anil@aja.com",
    role: "EMPLOYEE",
    active: true,
    firstLoginPending: true,
  },
  {
    id: 4,
    name: "Swetha Kiran",
    email: "swetha@aja.com",
    role: "TUTOR",
    active: false,
    firstLoginPending: false,
  },
];

const mockAccessRequests = [
  {
    id: 1,
    name: "Vikram Nair",
    email: "vikram@gmail.com",
    requestedDate: "12 Mar 2026",
  },
  {
    id: 2,
    name: "Anita Joshi",
    email: "anita@yahoo.com",
    requestedDate: "11 Mar 2026",
  },
];

const mockAuditLog = [
  {
    id: 1,
    timestamp: "13 Mar 2026, 10:22 AM",
    actor: "Admin",
    role: "ADMIN",
    action: "Created User",
    entity: "Anil Sharma",
    details: "Role: EMPLOYEE",
  },
  {
    id: 2,
    timestamp: "12 Mar 2026, 3:45 PM",
    actor: "Rajesh Kumar",
    role: "TUTOR",
    action: "Approved Question",
    entity: "Q#42",
    details: "Spring Boot question",
  },
  {
    id: 3,
    timestamp: "11 Mar 2026, 11:00 AM",
    actor: "Admin",
    role: "ADMIN",
    action: "Deactivated User",
    entity: "Swetha Kiran",
    details: "Account suspended",
  },
];

const generateTempPassword = () => {
  return `Aja@${Math.floor(1000 + Math.random() * 9000)}Temp`;
};

const AdminPanelPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Users");
  const [users, setUsers] = useState(mockUsers);
  const [accessRequests, setAccessRequests] = useState(mockAccessRequests);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    role: "EMPLOYEE",
  });
  const [createdUser, setCreatedUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { label: "Users", icon: <Users size={14} /> },
    { label: "Create User", icon: <UserPlus size={14} /> },
    { label: "Access Requests", icon: <ShieldAlert size={14} /> },
    { label: "Audit Log", icon: <ClipboardList size={14} /> },
    { label: "Packages", icon: <Package size={14} /> },
  ];

  const stats = [
    { label: "Total Users", value: users.length, color: "text-[#2563EB]" },
    { label: "Active Subscriptions", value: 24, color: "text-green-600" },
    { label: "Pending Reviews", value: 5, color: "text-amber-600" },
    { label: "Questions This Month", value: 18, color: "text-purple-600" },
  ];

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tempPassword = generateTempPassword();
    try {
      await axiosInstance.post("/admin/users", {
        ...createForm,
        tempPassword,
      });
      setCreatedUser({ ...createForm, tempPassword });
      setCreateForm({ name: "", email: "", role: "EMPLOYEE" });
      toast.success("User created successfully! Email sent.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdUser?.tempPassword || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleActive = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    );
    toast.success("User status updated");
  };

  const handleAccessAction = (id, action) => {
    setAccessRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success(`Access ${action === "grant" ? "granted" : "denied"}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PortalSidebar user={user} role="ADMIN" activeItem="Users" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-[#0A1628] mb-1">
            Admin Panel
          </h1>
          <p className="text-sm text-gray-400 font-light">
            Manage users, review access requests and monitor platform activity
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-black/8 rounded-2xl p-5"
            >
              <div className={`font-serif text-3xl mb-1 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1.5 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.label
                  ? "bg-white text-[#0A1628] shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* USERS TAB */}
        {activeTab === "Users" && (
          <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                      Name
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                      Email
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                      First Login
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-black/5 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A1628] to-[#2563EB] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-[#0A1628]">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {u.email}
                      </td>
                      <td className="px-5 py-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleToggleActive(u.id)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
                            u.active
                              ? "bg-green-50 text-green-600 hover:bg-green-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {u.active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        {u.firstLoginPending && (
                          <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <select className="text-xs border border-black/10 rounded-lg px-2 py-1.5 text-gray-600 bg-white focus:outline-none focus:border-[#2563EB]">
                          <option>Change Role</option>
                          <option value="TUTOR">Make Tutor</option>
                          <option value="EMPLOYEE">Make Employee</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CREATE USER TAB */}
        {activeTab === "Create User" && (
          <div className="max-w-lg">
            {createdUser ? (
              <div className="bg-white border border-black/8 rounded-2xl p-7">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <Check size={24} className="text-green-500" />
                </div>
                <h2 className="text-lg font-semibold text-[#0A1628] mb-1">
                  User Created Successfully!
                </h2>
                <p className="text-sm text-gray-400 mb-5">
                  An email with credentials has been sent to {createdUser.email}
                  . Share the temporary password below with the employee
                  securely.
                </p>

                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-5">
                  <div className="text-xs text-gray-500 mb-2">
                    Temporary Password
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-base font-bold text-[#0A1628] font-mono">
                      {createdUser.tempPassword}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white border border-black/10 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      {copied ? (
                        <Check size={12} className="text-green-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-400 mb-5 leading-relaxed">
                  <strong className="text-gray-600">Employee Details:</strong>
                  <br />
                  Name: {createdUser.name}
                  <br />
                  Email: {createdUser.email}
                  <br />
                  Role: {createdUser.role}
                </div>

                <button
                  onClick={() => setCreatedUser(null)}
                  className="w-full py-3 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all"
                >
                  Create Another User
                </button>
              </div>
            ) : (
              <div className="bg-white border border-black/8 rounded-2xl p-7">
                <h2 className="text-lg font-semibold text-[#0A1628] mb-1">
                  Create Internal User
                </h2>
                <p className="text-sm text-gray-400 mb-6 font-light">
                  Create accounts for Tutors and Employees. They will receive
                  login credentials via email.
                </p>

                <form
                  onSubmit={handleCreateUser}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, name: e.target.value })
                      }
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, email: e.target.value })
                      }
                      placeholder="john@aja.com"
                      required
                      className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Role
                    </label>
                    <select
                      value={createForm.role}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, role: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all bg-white"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="TUTOR">Tutor</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      Admin accounts cannot be created here for security
                      reasons.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all disabled:opacity-60"
                  >
                    {loading
                      ? "Creating User..."
                      : "Create User & Send Credentials"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ACCESS REQUESTS TAB */}
        {activeTab === "Access Requests" && (
          <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
            {accessRequests.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                      Name
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                      Email
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                      Requested
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accessRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-black/5 last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-[#0A1628]">
                        {req.name}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {req.email}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {req.requestedDate}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccessAction(req.id, "deny")}
                            className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                          >
                            Deny
                          </button>
                          <button
                            onClick={() => handleAccessAction(req.id, "grant")}
                            className="text-xs px-3 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-lg hover:bg-green-100 transition-all"
                          >
                            Grant
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-sm text-gray-400">
                  No pending access requests
                </p>
              </div>
            )}
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === "Audit Log" && (
          <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/5 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                    Timestamp
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                    Actor
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                    Action
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                    Entity
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockAuditLog.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-black/5 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-[#0A1628]">
                      {log.actor}
                    </td>
                    <td className="px-5 py-3">
                      <RoleBadge role={log.role} />
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {log.action}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {log.entity}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PACKAGES TAB */}
        {activeTab === "Packages" && (
          <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/5 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                    Package
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                    Questions
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                    Price (30d)
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    icon: "☕",
                    name: "Backend Package",
                    questions: 120,
                    price: "₹299",
                    active: true,
                  },
                  {
                    icon: "⚛️",
                    name: "Frontend Package",
                    questions: 110,
                    price: "₹299",
                    active: true,
                  },
                  {
                    icon: "🐳",
                    name: "DevOps Package",
                    questions: 90,
                    price: "₹299",
                    active: true,
                  },
                  {
                    icon: "☁️",
                    name: "Salesforce Package",
                    questions: 95,
                    price: "₹299",
                    active: true,
                  },
                  {
                    icon: "🐍",
                    name: "Python Package",
                    questions: 100,
                    price: "₹299",
                    active: true,
                  },
                ].map((pkg, i) => (
                  <tr
                    key={i}
                    className="border-b border-black/5 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{pkg.icon}</span>
                        <span className="text-sm font-medium text-[#0A1628]">
                          {pkg.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {pkg.questions}+
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[#0A1628]">
                      {pkg.price}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 bg-green-50 text-green-600 rounded-full">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanelPage;
