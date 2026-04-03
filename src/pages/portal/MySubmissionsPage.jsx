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
import axiosInstance from "../../api/axiosInstance";

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
        const res = await axiosInstance.get("/questions/my");
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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden py-10">
      <PortalSidebar 
        user={user} 
        role={user?.role || "EMPLOYEE"} 
        activeItem="My Submissions" 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 items-center flex justify-between">
            <div>
              <Link to="/portal/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#0A1628] transition-colors mb-4 group">
                <HiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
              </Link>
              <h1 className="font-serif text-3xl text-[#0A1628] mb-1 font-bold">My Submissions</h1>
              <p className="text-sm text-gray-400 font-light italic">Detailed history of all technical intel you've shared</p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text"
                    placeholder="Search titles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 pr-4 py-3 bg-white border border-black/8 rounded-2xl text-sm focus:ring-8 focus:ring-blue-50/50 focus:border-blue-500/50 transition-all outline-none w-72 shadow-sm font-medium"
                  />
               </div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white border border-black/8 rounded-[32px] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-black/5">
                    <tr>
                      <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.15em] text-gray-400">Question Content</th>
                      <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.15em] text-gray-400">Technology</th>
                      <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.15em] text-gray-400">Submitted On</th>
                      <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.15em] text-gray-400">Status</th>
                      <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.15em] text-gray-400 text-right">Mastery Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 font-sans">
                    {loading ? (
                       <tr>
                         <td colSpan="5" className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                               <HiArrowPath className="w-10 h-10 text-blue-500 animate-spin" />
                               <span className="text-sm text-gray-400 font-bold uppercase tracking-widest italic opacity-50">Syncing Intelligence History...</span>
                            </div>
                         </td>
                       </tr>
                    ) : filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((q) => (
                        <tr key={q.id} className="hover:bg-gray-50/80 transition-all group">
                           <td className="px-8 py-6">
                              <div className="font-bold text-[#0A1628] mb-1 line-clamp-1 text-sm tracking-tight group-hover:text-blue-600 transition-colors uppercase">{q.title}</div>
                              <div className="text-xs text-gray-400 line-clamp-1 max-w-sm italic opacity-70">"{q.content || "No description provided"}"</div>
                           </td>
                           <td className="px-8 py-6">
                              <TechBadge tech={q.technologyName || q.technology} />
                           </td>
                           <td className="px-8 py-6 text-xs font-bold text-gray-500 tracking-tighter">
                              {formatDate(q.createdAt)}
                           </td>
                           <td className="px-8 py-6">
                              <StatusBadge status={q.status} />
                           </td>
                           <td className="px-8 py-6 text-right">
                              <Link 
                                to={`/portal/questions/${q.id}`}
                                className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all border border-transparent hover:border-blue-100/50 shadow-sm inline-block active:scale-90"
                              >
                                 <HiChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-8 py-28 text-center">
                           <div className="max-w-xs mx-auto">
                              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-100 shadow-inner group transition-all hover:scale-110">
                                 <HiClipboardDocumentList size={32} />
                              </div>
                              <h3 className="text-xl font-serif font-bold text-[#0A1628] mb-2 leading-tight">No submissions found</h3>
                              <p className="text-sm text-gray-400 leading-relaxed font-light italic">
                                 {searchTerm ? `No results for "${searchTerm}".` : "Your intellectual contribution tracker is empty."}
                              </p>
                              {!searchTerm && (
                                <Link to="/portal/submit" className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-[#0A1628] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 active:scale-95">
                                   Post First Report
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
