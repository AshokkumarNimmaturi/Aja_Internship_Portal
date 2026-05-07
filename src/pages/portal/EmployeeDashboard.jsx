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
    <span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${styles[status] || styles.PENDING}`}>
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
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      <PortalSidebar user={user} role={user?.role || "EMPLOYEE"} activeItem="Dashboard" />

      <main className="flex-1 p-8 py-10 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          {/* Header - Minimalist */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-[#0A1628] mb-1">Contributor Dashboard</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Active Member: <span className="text-[#0074CC]">{user?.fullName || "Aja Member"}</span>
              </p>
            </div>
            <Link
              to="/portal/submit"
              className="flex items-center gap-2 px-6 py-2 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all active:scale-95"
            >
              <HiPlusCircle size={14} /> New Submission
            </Link>
          </div>

          {/* Stats Overview - High Density */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-[#E3E6E8] shadow-sm hover:border-[#0074CC]/20 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center border border-black/5`}>
                     <s.icon size={18} />
                  </div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</div>
                </div>
                <div className="text-3xl font-bold text-[#0A1628]">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Table - Professional */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-[#E3E6E8] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-[#0A1628] uppercase tracking-widest">Submission Stream</h2>
                  <Link to="/portal/submissions" className="text-[10px] font-bold text-[#0074CC] uppercase tracking-widest hover:underline">View All</Link>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="py-20 text-center"><HiArrowPath className="animate-spin mx-auto text-gray-200" size={32} /></div>
                  ) : submissions.length > 0 ? (
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="border-b border-[#E3E6E8]">
                          <th className="pb-3 font-bold text-gray-400 uppercase tracking-widest text-[9px]">Content</th>
                          <th className="pb-3 font-bold text-gray-400 uppercase tracking-widest text-[9px]">Organization</th>
                          <th className="pb-3 font-bold text-gray-400 uppercase tracking-widest text-[9px]">Stack</th>
                          <th className="pb-3 font-bold text-gray-400 uppercase tracking-widest text-[9px] text-center">Status</th>
                          <th className="pb-3 font-bold text-gray-400 uppercase tracking-widest text-[9px] text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3F4F6]">
                        {submissions.slice(0, 8).map((q) => (
                          <tr key={q.id} className="group hover:bg-gray-50/50 transition-all cursor-default text-xs">
                            <td className="py-4 font-bold text-[#0A1628] line-clamp-1 max-w-[200px] group-hover:text-[#0074CC]">{q.title}</td>
                            <td className="py-4">
                               <span className="font-bold text-gray-500 uppercase tracking-tight text-[10px]">{q.clientName || "General"}</span>
                            </td>
                            <td className="py-4"><TechBadge tech={q.technologyName || q.technology} className="!text-[9px] !py-0.5" /></td>
                            <td className="py-4 flex justify-center"><StatusBadge status={q.status} /></td>
                            <td className="py-4 text-right text-gray-400 font-bold uppercase text-[9px]">
                               {new Date(q.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-20 text-center bg-gray-50/30 rounded-lg border border-dashed border-[#E3E6E8]">
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Pipeline idle. Start your contribution.</p>
                       <Link to="/portal/submit" className="inline-flex items-center gap-2 px-6 py-2 bg-[#0A1628] text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all active:scale-95">
                          Launch Submission
                       </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Platform Insights - Compact */}
            <div className="space-y-4">
               <div className="bg-[#0A1628] p-6 rounded-lg text-white shadow-sm relative overflow-hidden group">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Network Health</h3>
                  <div className="space-y-6">
                    <div>
                       <div className="flex justify-between text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-2">
                          <span>Verified Curation</span>
                          <span>{((globalStats.totalQuestions / (globalStats.totalReceived || 1)) * 100).toFixed(0)}%</span>
                       </div>
                       <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 transition-all duration-1000" style={{ width: `${(globalStats.totalQuestions / (globalStats.totalReceived || 1)) * 100}%` }} />
                       </div>
                    </div>
                    <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                       <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                          <span className="block text-[8px] text-blue-200 font-bold uppercase tracking-widest mb-1">Global Vault</span>
                          <span className="text-lg font-bold text-white">{globalStats.totalReceived}</span>
                       </div>
                       <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                          <span className="block text-[8px] text-green-300 font-bold uppercase tracking-widest mb-1">Verified</span>
                          <span className="text-lg font-bold text-white">{globalStats.totalQuestions}</span>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-white border border-[#E3E6E8] p-6 rounded-lg shadow-sm">
                  <h4 className="text-[10px] font-bold text-[#0A1628] uppercase tracking-widest mb-4">Submission Ethics</h4>
                  <ul className="space-y-4">
                     <li className="flex gap-3 text-[10px] text-gray-500 leading-normal font-bold uppercase tracking-widest">
                        <div className="mt-1 w-1 h-1 rounded-full bg-[#0074CC] shrink-0" />
                        Detailed nuance ensures priority sync.
                     </li>
                     <li className="flex gap-3 text-[10px] text-gray-500 leading-normal font-bold uppercase tracking-widest">
                        <div className="mt-1 w-1 h-1 rounded-full bg-[#0074CC] shrink-0" />
                        Accurate tagging optimizes vault discovery.
                     </li>
                  </ul>
                  
                  <div className="mt-8 pt-6 border-t border-[#F3F4F6]">
                    <VoiceCallButton className="w-full !rounded-lg !py-2.5 !text-[9px] !bg-gray-50 !text-[#0A1628] border border-gray-100 hover:!bg-white" />
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
