import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Clock, CheckCircle, XCircle, Loader2, BarChart3, Target, Award } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import TechBadge from "../../components/common/TechBadge";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import axiosInstance from "../../api/axiosInstance";

export const StatusBadge = ({ status }) => {
  const styles = {
    APPROVED: "bg-green-50 text-green-600 border border-green-100",
    PENDING: "bg-amber-50 text-amber-600 border border-amber-100",
    REJECTED: "bg-red-50 text-red-600 border border-red-100",
  };
  const icons = {
    APPROVED: <CheckCircle size={10} />,
    PENDING: <Clock size={10} />,
    REJECTED: <XCircle size={10} />,
  };
  return (
    <span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${styles[status] || styles.PENDING}`}>
      {icons[status] || icons.PENDING} {status}
    </span>
  );
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({ totalReceived: 0, totalQuestions: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [myRes, allRes] = await Promise.all([
          axiosInstance.get("/questions/my"),
          axiosInstance.get("/questions")
        ]);
        
        setSubmissions(myRes.data);
        
        const allQuestions = allRes.data.content || allRes.data;
        setGlobalStats({
          totalReceived: allQuestions.length,
          totalQuestions: allQuestions.filter(q => q.status === 'APPROVED').length
        });
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Total Intake", value: submissions.length, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Approved Mastery", value: submissions.filter(q => q.status === "APPROVED").length, icon: Award, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Awaiting Sync", value: submissions.filter(q => q.status === "PENDING").length, icon: Target, color: "text-amber-600", bg: "bg-amber-50" }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PortalSidebar user={user} role={user?.role || "EMPLOYEE"} activeItem="Dashboard" />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl text-[#0A1628] mb-1">Contributor Hub</h1>
              <p className="text-xs text-gray-400 font-light uppercase tracking-widest font-sans">
                Logged in as <span className="font-bold text-gray-500">{user?.fullName || "Employee"}</span>
              </p>
            </div>
            <Link
              to="/portal/submit"
              className="flex items-center gap-2 px-6 py-3 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/10"
            >
              <PlusCircle size={16} /> New Submission
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-4 border border-black/5 shadow-inner`}>
                   <s.icon size={22} />
                </div>
                <div className="text-4xl font-serif text-[#0A1628] mb-1">{s.value}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[40px] border border-black/5 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-serif text-[#0A1628]">Submission History</h2>
                  <Link to="/portal/my-submissions" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">View All Records</Link>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-100" size={32} /></div>
                  ) : submissions.length > 0 ? (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-black/5">
                          <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-gray-400">Content Summary</th>
                          <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-gray-400">Technology</th>
                          <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-gray-400 text-center">Status</th>
                          <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-gray-400 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {submissions.slice(0, 8).map((q) => (
                          <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 font-semibold text-sm text-[#0A1628] leading-tight line-clamp-1 max-w-[200px]">{q.title}</td>
                            <td className="py-4"><TechBadge tech={q.technologyName || q.technology} /></td>
                            <td className="py-4 text-center"><StatusBadge status={q.status} /></td>
                            <td className="py-4 text-right text-[10px] font-mono text-gray-300">{formatDate(q.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-black/10">
                       <p className="text-sm text-gray-400 italic font-serif">No intelligence reports submitted yet.</p>
                       <Link to="/portal/submit" className="text-[10px] text-blue-600 uppercase tracking-widest font-bold mt-2 block">Create first submission</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Platform Insights */}
            <div className="space-y-6">
               <div className="bg-[#0A1628] p-8 rounded-[40px] text-white shadow-xl shadow-blue-900/10">
                  <h3 className="text-lg font-serif mb-6">Platform Pulse</h3>
                  <div className="space-y-6">
                    <div>
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-2">
                          <span>Sync Rate</span>
                          <span>{((globalStats.totalQuestions / (globalStats.totalReceived || 1)) * 100).toFixed(0)}%</span>
                       </div>
                       <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400" style={{ width: `${(globalStats.totalQuestions / (globalStats.totalReceived || 1)) * 100}%` }} />
                       </div>
                    </div>
                    <div className="pt-4 border-t border-white/5 space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Total Knowledge Base</span>
                          <span className="text-xl font-serif font-black">{globalStats.totalReceived}</span>
                       </div>
                       <div className="flex justify-between items-center text-emerald-400">
                          <span className="text-[10px] uppercase tracking-widest font-bold">Verified Expertise</span>
                          <span className="text-xl font-serif font-black">{globalStats.totalQuestions}</span>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-white border border-black/5 p-8 rounded-[40px] shadow-sm">
                  <h4 className="font-serif text-lg text-[#0A1628] mb-4">Contributor Tips</h4>
                  <ul className="space-y-4">
                     <li className="flex gap-3 text-sm text-gray-500 leading-relaxed italic">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        "High-quality explanations lead to faster approval rates."
                     </li>
                     <li className="flex gap-3 text-sm text-gray-500 leading-relaxed italic">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        "Use technology tags accurately to help curators find your work."
                     </li>
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
