import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// ✅ UPGRADED: Using elite Heroicons 2
import { 
  HiClipboardDocumentList, 
  HiMagnifyingGlass, 
  HiAdjustmentsHorizontal, 
  HiArrowLeft,
  HiChevronRight,
  HiClock,
  HiArrowPath
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import TechBadge from "../../components/common/TechBadge";
import { StatusBadge } from "./EmployeeDashboard";
import { fetchMyQuestions } from "../../api/questionApi";

const MySubmissionsPage = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTech, setFilterTech] = useState("ALL");

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await fetchMyQuestions();
        setSubmissions(res.data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(q => {
    const matchesSearch = q.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterTech === "ALL" || (q.technologyName || q.technology) === filterTech;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      <PortalSidebar 
        user={user} 
        role={user?.role || "EMPLOYEE"} 
        activeItem="My Submissions" 
      />

      <main className="flex-1 p-8 py-10 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          {/* Header - Minimalist */}
          <div className="mb-8 items-center flex justify-between">
            <div>
              <Link to="/portal/dashboard" className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#0074CC] transition-colors mb-3 group">
                <HiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
              </Link>
              <h1 className="text-2xl font-serif font-bold text-[#0A1628] mb-1">Submission Archive</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tracking your technical intel history</p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input 
                    type="text"
                    placeholder="Search intel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white border border-[#E3E6E8] rounded-lg text-sm focus:border-[#0074CC] transition-all outline-none w-72 shadow-sm font-medium"
                  />
               </div>
            </div>
          </div>

          {/* Submissions Table - Professional */}
          <div className="bg-white border border-[#E3E6E8] rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-gray-50/50 border-b border-[#E3E6E8]">
                    <tr>
                      <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-gray-400">Mastery Content</th>
                      <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-gray-400">Origin</th>
                      <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-gray-400">Stack</th>
                      <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-gray-400">Submitted</th>
                      <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-gray-400 text-center">Status</th>
                      <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-gray-400 text-right">Intel Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {loading ? (
                       <tr>
                         <td colSpan="6" className="px-6 py-20 text-center">
                            <HiArrowPath className="w-8 h-8 text-gray-200 animate-spin mx-auto mb-3" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Syncing Archive...</span>
                         </td>
                       </tr>
                    ) : filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((q) => (
                        <tr key={q.id} className="hover:bg-gray-50/50 transition-all group">
                           <td className="px-6 py-4">
                              <div className="font-bold text-[#0A1628] mb-0.5 line-clamp-1 group-hover:text-[#0074CC] transition-colors">{q.title}</div>
                               <div className="text-[10px] text-gray-400 line-clamp-1 opacity-70 uppercase font-bold tracking-tight">ID: {String(q.id).split('-')[0]}...</div>
                           </td>
                           <td className="px-6 py-4">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{q.clientName || "General"}</span>
                           </td>
                           <td className="px-6 py-4">
                              <TechBadge tech={q.technologyName || q.technology} className="!text-[9px] !py-0.5" />
                           </td>
                           <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                              {formatDate(q.createdAt)}
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <StatusBadge status={q.status} />
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <Link 
                                to={`/portal/questions/${q.id}`}
                                className="p-2 text-gray-300 hover:text-[#0074CC] hover:bg-[#0074CC]/5 rounded-lg transition-all inline-block active:scale-95"
                              >
                                 <HiChevronRight size={16} />
                              </Link>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-20 text-center">
                           <div className="max-w-xs mx-auto">
                              <h3 className="text-sm font-bold text-[#0A1628] mb-1 uppercase tracking-widest">No Intelligence Found</h3>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6 leading-relaxed">
                                 {searchTerm ? `Zero results for "${searchTerm}"` : "History repository is currently empty."}
                              </p>
                              {!searchTerm && (
                                <Link to="/portal/submit" className="inline-flex items-center gap-2 px-6 py-2 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all active:scale-95">
                                   Initiate Entry
                                </Link>
                              )}
                           </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MySubmissionsPage;
