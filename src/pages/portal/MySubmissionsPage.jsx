import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ClipboardList, 
  Search, 
  Filter, 
  ArrowLeft,
  ChevronRight,
  Clock
} from "lucide-react";
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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
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
              <Link to="/portal/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#0A1628] transition-colors mb-3 group">
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
              </Link>
              <h1 className="font-serif text-3xl text-[#0A1628] mb-1">My Submissions</h1>
              <p className="text-sm text-gray-400 font-light italic">Detailed history of all questions you've shared</p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input 
                    type="text"
                    placeholder="Search titles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white border border-black/8 rounded-xl text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none w-64 shadow-sm"
                  />
               </div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white border border-black/8 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-black/5">
                    <tr>
                      <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Question Detail</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Technology</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Submitted On</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Status</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {loading ? (
                       <tr>
                         <td colSpan="5" className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                               <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                               <span className="text-sm text-gray-400 font-medium">Loading history...</span>
                            </div>
                         </td>
                       </tr>
                    ) : filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((q) => (
                        <tr key={q.id} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="px-6 py-5">
                              <div className="font-bold text-[#0A1628] mb-1 line-clamp-1">{q.title}</div>
                              <div className="text-xs text-gray-400 line-clamp-1 max-w-sm italic">{q.content || "No description provided"}</div>
                           </td>
                           <td className="px-6 py-5">
                              <TechBadge tech={q.technologyName || q.technology} />
                           </td>
                           <td className="px-6 py-5 text-xs font-mono text-gray-500 font-medium">
                              {formatDate(q.createdAt)}
                           </td>
                           <td className="px-6 py-5">
                              <StatusBadge status={q.status} />
                           </td>
                           <td className="px-6 py-5 text-right">
                              <Link 
                                to={`/portal/questions/${q.id}`}
                                className="p-2 text-gray-300 hover:text-[#0A1628] hover:bg-white rounded-lg transition-all border border-transparent hover:border-black/5 hover:shadow-sm inline-block"
                              >
                                 <ChevronRight size={18} />
                              </Link>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-24 text-center">
                           <div className="max-w-xs mx-auto">
                              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
                                 <ClipboardList size={28} />
                              </div>
                              <h3 className="text-lg font-bold text-[#0A1628] mb-1">No submissions found</h3>
                              <p className="text-sm text-gray-400 leading-relaxed font-light">
                                 {searchTerm ? "Try adjusting your search terms." : "You haven't submitted any questions yet."}
                              </p>
                              <Link to="/portal/submit" className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-[#0A1628] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#0F2340] transition-all shadow-md">
                                 Submit Your First
                              </Link>
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
