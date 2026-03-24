import { Link } from "react-router-dom";
import { PlusCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import TechBadge from "../../components/common/TechBadge";

const mockSubmissions = [
  {
    id: 1,
    title: "What is the difference between @Component and @Bean in Spring?",
    technology: "Spring Boot",
    status: "APPROVED",
    date: "10 Mar 2026",
  },
  {
    id: 2,
    title: "Explain Java memory model and garbage collection.",
    technology: "Java",
    status: "PENDING",
    date: "12 Mar 2026",
  },
  {
    id: 3,
    title: "How does React context API work internally?",
    technology: "React",
    status: "REJECTED",
    date: "8 Mar 2026",
  },
  {
    id: 4,
    title: "What are the differences between SQL joins?",
    technology: "SQL",
    status: "APPROVED",
    date: "5 Mar 2026",
  },
];

const StatusBadge = ({ status }) => {
  const styles = {
    APPROVED: "bg-green-50 text-green-600",
    PENDING: "bg-amber-50 text-amber-600",
    REJECTED: "bg-red-50 text-red-600",
  };
  const icons = {
    APPROVED: <CheckCircle size={11} />,
    PENDING: <Clock size={11} />,
    REJECTED: <XCircle size={11} />,
  };
  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {icons[status]} {status}
    </span>
  );
};

const PortalSidebar = ({ user, role, activeItem }) => {
  const employeeNav = [
    { label: "Dashboard", icon: "🏠", path: "/portal/dashboard" },
    { label: "Submit Question", icon: "✏️", path: "/portal/submit" },
    { label: "My Submissions", icon: "📋", path: "/portal/submissions" },
    { label: "My Answers", icon: "💬", path: "/portal/answers" },
    { label: "Profile", icon: "👤", path: "/portal/profile" },
  ];
  const tutorNav = [
    { label: "Dashboard", icon: "🏠", path: "/portal/dashboard" },
    { label: "Pending Review", icon: "⏳", path: "/portal/review", badge: 5 },
    { label: "Access Requests", icon: "🔑", path: "/portal/access" },
    { label: "All Questions", icon: "📚", path: "/portal/questions" },
    { label: "Profile", icon: "👤", path: "/portal/profile" },
  ];
  const adminNav = [
    { label: "Dashboard", icon: "🏠", path: "/portal/dashboard" },
    { label: "Users", icon: "👥", path: "/portal/admin" },
    { label: "Pending Review", icon: "⏳", path: "/portal/review", badge: 5 },
    { label: "Access Requests", icon: "🔑", path: "/portal/access" },
    { label: "Packages", icon: "📦", path: "/portal/packages" },
    { label: "Audit Log", icon: "📊", path: "/portal/audit" },
    { label: "Profile", icon: "👤", path: "/portal/profile" },
  ];

  const navItems =
    role === "ADMIN" ? adminNav : role === "TUTOR" ? tutorNav : employeeNav;

  const roleBadgeStyle = {
    ADMIN: "bg-[#0A1628] text-white",
    TUTOR: "bg-blue-600 text-white",
    EMPLOYEE: "bg-teal-600 text-white",
  };

  return (
    <aside className="w-64 shrink-0 bg-[#0A1628] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <span className="text-white text-xs font-bold">AIP</span>
          </div>
          <div>
            <div className="text-white text-xs font-semibold leading-tight">
              Aja Internship Portal
            </div>
            <div className="text-white/40 text-xs leading-tight">
              Internal Portal
            </div>
          </div>
        </Link>
        {/* Role Badge */}
        <div className="mt-3">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${roleBadgeStyle[role] || "bg-gray-600 text-white"}`}
          >
            {role}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
              activeItem === item.label
                ? "bg-white text-[#0A1628] font-medium"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">{item.icon}</span>
              {item.label}
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 text-white text-xs font-semibold flex items-center justify-center">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="text-xs font-medium text-white leading-tight">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-white/40 leading-tight">
                {user?.email || ""}
              </div>
            </div>
          </div>
          <Link
            to="/login"
            className="text-white/40 hover:text-red-400 text-xs transition-colors"
          >
            Logout
          </Link>
        </div>
      </div>
    </aside>
  );
};

export { PortalSidebar, StatusBadge };

const EmployeeDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      label: "My Submissions",
      value: mockSubmissions.length,
      icon: "📋",
      color: "bg-blue-50 text-[#2563EB]",
    },
    {
      label: "Approved",
      value: mockSubmissions.filter((q) => q.status === "APPROVED").length,
      icon: "✅",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Pending",
      value: mockSubmissions.filter((q) => q.status === "PENDING").length,
      icon: "⏳",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PortalSidebar
        user={user}
        role={user?.role || "EMPLOYEE"}
        activeItem="Dashboard"
      />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[#0A1628] mb-1">
              Welcome, {user?.name?.split(" ")[0] || "Employee"} 👋
            </h1>
            <p className="text-sm text-gray-400 font-light">
              Share your interview experience with the team
            </p>
          </div>
          <Link
            to="/portal/submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all"
          >
            <PlusCircle size={15} />
            Submit Question
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-black/8 rounded-2xl p-5"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${stat.color}`}
              >
                {stat.icon}
              </div>
              <div className="font-serif text-3xl text-[#0A1628] mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white border border-black/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#0A1628]">
              Recent Submissions
            </h2>
            <Link
              to="/portal/submit"
              className="text-xs text-[#2563EB] hover:underline"
            >
              + Submit New
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">
                    Question
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">
                    Technology
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockSubmissions.map((q) => (
                  <tr
                    key={q.id}
                    className="border-b border-black/5 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <p className="text-sm text-gray-700 line-clamp-1">
                        {q.title}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <TechBadge tech={q.technology} />
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-3 text-xs text-gray-400">{q.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
