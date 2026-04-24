import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// ✅ UPGRADED: Using elite Heroicons 2
import { 
  HiPlusCircle, 
  HiClock, 
  HiCheckCircle, 
  HiXCircle, 
  HiArrowPath, 
  HiChartBar, 
  HiCursorArrowRays, 
  HiTrophy 
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import TechBadge from "../../components/common/TechBadge";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import { fetchMyQuestions, fetchQuestions } from "../../api/questionApi";
import VoiceCallButton from "../../components/common/VoiceCallButton";

export const StatusBadge = ({ status }) => {
  const styles = {
    APPROVED: "bg-green-50 text-green-600 border border-green-100",
    PENDING: "bg-amber-50 text-amber-600 border border-amber-100",
    REJECTED: "bg-red-50 text-red-600 border border-red-100",
  };
  const icons = {
    APPROVED: <HiCheckCircle size={12} />,
    PENDING: <HiClock size={12} />,
    REJECTED: <HiXCircle size={12} />,
  };
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight px-2.5 py-1.5 rounded-xl ${styles[status] || styles.PENDING}`}>
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
      
      // ✅ RESILIENT FETCHING: Load personal data first
      try {
        const myRes = await fetchMyQuestions();
        setSubmissions(myRes.data || []);
      } catch (err) {
        console.warn("Could not load personal submissions", err.response?.status);
      }

      // ✅ PLATFORM STATS: Fail quietly if restricted
      try {
        const allRes = await fetchQuestions();
        const allQuestions = allRes.data.content || allRes.data;
        const validQuestions = Array.isArray(allQuestions) ? allQuestions : [];
        
        setGlobalStats({
          totalReceived: validQuestions.length,
          totalQuestions: validQuestions.filter(q => q.status === 'APPROVED').length
        });
      } catch (err) {
        // Employees might not have permission for the global list, which is fine
        console.debug("Global stats restricted for this role");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Total Intake", value: submissions.length, icon: HiChartBar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Approved Mastery", value: submissions.filter(q => q.status === "APPROVED").length, icon: HiTrophy, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Awaiting Sync", value: submissions.filter(q => q.status === "PENDING").length, icon: HiCursorArrowRays, color: "text-amber-600", bg: "bg-amber-50" }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden portal-modern">
      <PortalSidebar user={user} role={user?.role || "EMPLOYEE"} activeItem="Dashboard" />

      <main className="flex-1 p-8 py-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-serif text-3xl text-[#0A1628] mb-1 font-bold">Contributor Hub</h1>
              <p className="text-xs text-gray-500">
                Active Session: <span className="text-gray-700 font-semibold">{user?.fullName || "Aja Member"}</span>
              </p>
            </div>
            <Link
              to="/portal/submit"
              className="flex items-center gap-2 px-6 py-3 bg-[#0A1628] text-white text-xs font-semibold rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
            >
              <HiPlusCircle size={18} /> New Submission
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {stats.map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform">
                   <s.icon size={80} className={s.color} />
                </div>
                <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-6 border border-black/5 shadow-inner group-hover:scale-110 transition-transform`}>
                   <s.icon size={28} />
                </div>
                <div className="text-5xl font-serif text-[#0A1628] mb-1 font-black">{s.value}</div>
                <div className="text-xs text-gray-500 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[50px] border border-black/8 p-10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-serif text-[#0A1628] font-bold">Intelligence Feed</h2>
                  <Link to="/portal/submissions" className="text-xs font-bold text-blue-600 hover:underline transition-all">View Archive</Link>
                </div>

                <div className="overflow-x-auto text-sm">
                  {loading ? (
                    <div className="py-24 text-center"><HiArrowPath className="animate-spin mx-auto text-blue-100" size={44} /></div>
                  ) : submissions.length > 0 ? (
                    <table className="w-full text-left font-sans">
                      <thead>
                        <tr className="border-b border-black/5">
                          <th className="pb-5 text-xs font-bold text-gray-400">Mastery Content</th>
                          <th className="pb-5 text-xs font-bold text-gray-400">Origin / Company</th>
                          <th className="pb-5 text-xs font-bold text-gray-400">Technology</th>
                          <th className="pb-5 text-xs font-bold text-gray-400 text-center">Status</th>
                          <th className="pb-5 text-xs font-bold text-gray-400 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {submissions.slice(0, 8).map((q) => (
                          <tr key={q.id} className="group hover:bg-gray-50/50 transition-all cursor-default">
                            <td className="py-6 font-bold text-[#0A1628] tracking-tight line-clamp-1 max-w-[180px] group-hover:text-blue-600">{q.title}</td>
                            <td className="py-6">
                               <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">{q.clientName || "General"}</span>
                            </td>
                            <td className="py-6"><TechBadge tech={q.technologyName || q.technology} /></td>
                            <td className="py-6 flex justify-center"><StatusBadge status={q.status} /></td>
                            <td className="py-6 text-right text-xs font-medium text-gray-400 italic">
                               {new Date(q.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-24 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-black/5 group">
                       <p className="text-sm text-gray-400 italic font-serif max-w-xs mx-auto mb-6">Your technical intel contribution pipeline is currently empty.</p>
                       <Link to="/portal/submit" className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-black/8 text-xs font-bold text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95">
                          <HiPlusCircle size={18} /> Initiate Submission
                       </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Platform Insights */}
            <div className="space-y-6">
               <div className="bg-[#0A1628] p-10 rounded-[50px] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <HiChartBar size={200} />
                  </div>
                  <h3 className="text-xl font-serif mb-8 font-bold relative z-10">Platform Pulse</h3>
                  <div className="space-y-8 relative z-10">
                    <div>
                       <div className="flex justify-between text-xs font-bold text-blue-300/60 mb-3">
                          <span>Quality Sync Rate</span>
                          <span>{((globalStats.totalQuestions / (globalStats.totalReceived || 1)) * 100).toFixed(0)}%</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.5)] transition-all duration-1000" style={{ width: `${(globalStats.totalQuestions / (globalStats.totalReceived || 1)) * 100}%` }} />
                       </div>
                    </div>
                    <div className="pt-6 border-t border-white/5 space-y-6">
                       <div className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/5">
                          <span className="text-xs text-blue-200 font-bold">Global Intel Pool</span>
                          <span className="text-3xl font-serif font-black tracking-tighter text-blue-100">{globalStats.totalReceived}</span>
                       </div>
                       <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/10 text-emerald-400">
                          <span className="text-xs font-bold">Verified Mastery</span>
                          <span className="text-3xl font-serif font-black tracking-tighter">{globalStats.totalQuestions}</span>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-white border border-black/8 p-10 rounded-[50px] shadow-sm relative overflow-hidden">
                  <h4 className="font-serif text-xl text-[#0A1628] mb-6 font-bold">Vault Guidelines</h4>
                  <ul className="space-y-6">
                     <li className="flex gap-4 text-sm text-gray-500 leading-relaxed italic group items-start">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        "Elite technical nuance ensures high-priority curation sync."
                     </li>
                     <li className="flex gap-4 text-sm text-gray-500 leading-relaxed italic group items-start">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        "Accurate technology tagging optimizes global discoverability."
                     </li>
                  </ul>
                  
                  {/* Internal Technical Support */}
                  <div className="mt-10 pt-8 border-t border-black/5 text-gray-400">
                    <p className="text-xs font-bold mb-4 uppercase tracking-widest text-center">Internal Support</p>
                    <VoiceCallButton />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
