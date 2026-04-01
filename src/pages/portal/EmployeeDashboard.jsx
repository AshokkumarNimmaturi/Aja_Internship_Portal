import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import TechBadge from "../../components/common/TechBadge";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import axiosInstance from "../../api/axiosInstance";

const StatusBadge = ({ status }) => {
  const styles = {
    APPROVED: "bg-green-50 text-green-600 border border-green-100",
    PENDING: "bg-amber-50 text-amber-600 border border-amber-100",
    REJECTED: "bg-red-50 text-red-600 border border-red-100",
  };
  const icons = {
    APPROVED: <CheckCircle size={11} />,
    PENDING: <Clock size={11} />,
    REJECTED: <XCircle size={11} />,
  };
  return (
    <span
      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${styles[status] || styles.PENDING}`}
    >
      {icons[status] || icons.PENDING} {status}
    </span>
  );
};

export { StatusBadge };

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalPendingCount, setGlobalPendingCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch USER'S submissions for the dashboard
        const res = await axiosInstance.get("/questions/my");
        setSubmissions(res.data);

        // 2. Fetch GLOBAL pending count for the sidebar badge (If Admin/Tutor)
        if (user?.role === "ADMIN" || user?.role === "TUTOR") {
            const pendingRes = await axiosInstance.get("/questions/pending");
            const list = Array.isArray(pendingRes.data) ? pendingRes.data : (pendingRes.data.content || []);
            setGlobalPendingCount(list.length);
        }
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.role]);

  const stats = [
    {
      label: "My Submissions",
      value: submissions.length,
      icon: "📋",
      color: "bg-blue-50 text-[#2563EB] border-blue-100",
    },
    {
      label: "Approved",
      value: submissions.filter((q) => q.status === "APPROVED").length,
      icon: "✅",
      color: "bg-green-50 text-green-600 border-green-100",
    },
    {
      label: "Pending",
      value: submissions.filter((q) => q.status === "PENDING").length,
      icon: "⏳",
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PortalSidebar
        user={user}
        role={user?.role || "EMPLOYEE"}
        activeItem="Dashboard"
        pendingCount={globalPendingCount}
      />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[#0A1628] mb-1">
              Welcome, {(user?.fullName || user?.name)?.split(" ")[0] || "Employee"} 👋
            </h1>
            <p className="text-sm text-gray-400 font-light">
              Share your interview experience with the team
            </p>
          </div>
          <Link
            to="/portal/submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all shadow-sm"
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
              className={`bg-white border border-black/8 rounded-2xl p-5 transition-transform hover:-translate-y-1 shadow-sm`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 border ${stat.color}`}
              >
                {stat.icon}
              </div>
              <div className="font-serif text-4xl text-[#0A1628] mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[#0A1628]">
              Recent Submissions
            </h2>
            <Link
              to="/portal/submit"
              className="text-xs font-bold text-[#2563EB] hover:underline uppercase tracking-wider"
            >
              + Submit New
            </Link>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-black/10">
                    <Loader2 className="animate-spin text-gray-300 mb-2" size={32} />
                    <p className="text-xs text-gray-400 font-medium">Syncing with question bank...</p>
                </div>
            ) : submissions.length > 0 ? (
                <table className="w-full">
                <thead>
                    <tr className="border-b border-black/5">
                    <th className="text-left text-[10px] uppercase tracking-widest font-bold text-gray-400 pb-3">
                        Question
                    </th>
                    <th className="text-left text-[10px] uppercase tracking-widest font-bold text-gray-400 pb-3">
                        Technology
                    </th>
                    <th className="text-left text-[10px] uppercase tracking-widest font-bold text-gray-400 pb-3">
                        Status
                    </th>
                    <th className="text-left text-[10px] uppercase tracking-widest font-bold text-gray-400 pb-3">
                        Date
                    </th>
                    </tr>
                </thead>
                <tbody>
                    {[...submissions].reverse().slice(0, 5).map((q) => (
                    <tr
                        key={q.id}
                        className="border-b border-black/5 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                        <td className="py-3.5 pr-4">
                        <p className="text-sm font-semibold text-gray-700 line-clamp-1">
                            {q.title}
                        </p>
                        </td>
                        <td className="py-3.5 pr-4">
                        <TechBadge tech={q.technologyName || q.technology} />
                        </td>
                        <td className="py-3.5 pr-4">
                        <StatusBadge status={q.status} />
                        </td>
                        <td className="py-3.5 text-xs font-mono text-gray-400">{formatDate(q.createdAt)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-xl border border-dashed border-black/10">
                    <p className="text-sm text-gray-500 font-medium font-serif italic mb-1">No submissions yet.</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Questions you submit will appear here.</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
