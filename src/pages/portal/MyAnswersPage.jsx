import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// ✅ UPGRADED: Using elite Heroicons 2
import { 
  HiChatBubbleLeftEllipsis, 
  HiArrowLeft,
  HiChevronRight,
  HiHandThumbUp,
  HiClock,
  HiCheckCircle,
  HiArrowPath
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import { fetchMyAnswers } from "../../api/questionApi";

const MyAnswersPage = () => {
  const { user } = useAuth();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnswers = async () => {
      setLoading(true);
      try {
        const res = await fetchMyAnswers();
        setAnswers(res.data);
      } catch (error) {
        console.error("Error fetching answers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnswers();
  }, []);

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
        activeItem="My Answers" 
      />

      <main className="flex-1 p-8 py-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header - Sharp */}
          <div className="mb-8">
            <Link to="/portal/dashboard" className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#0A1628] transition-colors mb-4 group">
              <HiArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Dashboard
            </Link>
            <h1 className="text-xl font-bold text-[#0A1628] uppercase tracking-tight mb-1">My Contributions</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-70">Champion responses shared with the Aja global community</p>
          </div>

          {/* Answers List - High Density */}
          <div className="flex flex-col gap-4">
            {loading ? (
               <div className="bg-white border border-[#E3E6E8] rounded-lg p-20 flex flex-col items-center gap-4 shadow-sm">
                  <HiArrowPath className="w-8 h-8 text-[#0074CC] animate-spin" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Syncing Mastery Data...</span>
               </div>
            ) : Array.isArray(answers) && answers.length > 0 ? (
              answers.map((ans) => (
                <div key={ans.id} className="bg-white border border-[#E3E6E8] rounded-lg p-6 shadow-sm hover:border-[#0074CC]/30 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-[#0074CC]/5 group-hover:bg-[#0074CC] transition-colors" />
                   <div className="flex items-start justify-between mb-5 px-1">
                      <div className="flex-1">
                         <span className="text-[9px] font-bold text-[#0074CC] uppercase tracking-widest mb-1 block opacity-70">INTEL SOURCE</span>
                         <h3 className="text-base font-bold text-[#0A1628] uppercase tracking-tight group-hover:text-[#0074CC] transition-colors leading-tight">
                            {ans.questionTitle || "Unknown Question Source"}
                         </h3>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-[#E3E6E8] text-gray-400 shadow-inner group-hover:bg-white transition-colors">
                            <HiHandThumbUp size={14} className={ans.upvoteCount > 0 ? "text-[#0074CC]" : ""} />
                            <span className="text-[10px] font-bold font-mono text-[#0A1628]">{ans.upvoteCount || 0}</span>
                         </div>
                         {ans.accepted && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-lg text-[9px] font-bold tracking-widest uppercase shadow-sm">
                               <HiCheckCircle size={14} /> Verified Best
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="bg-gray-50/50 rounded-lg p-5 border border-[#E3E6E8] mb-5 text-[11px] text-[#232629] leading-relaxed font-medium uppercase tracking-tight opacity-70 shadow-inner">
                      "{ans.content}"
                   </div>

                   <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-4 px-1">
                      <div className="flex items-center gap-2 text-gray-400">
                         <HiClock size={14} className="opacity-50" />
                         <span className="text-[9px] font-bold uppercase tracking-widest">Shared {formatDate(ans.createdAt)}</span>
                      </div>
                      
                      <Link to={`/portal/questions/${ans.questionId}`} className="flex items-center gap-2 px-6 py-2 bg-[#0A1628] text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all shadow-sm active:scale-95 group/btn">
                         Mastery Link <HiChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                   </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-[#E3E6E8] rounded-lg p-24 text-center">
                 <div className="max-w-xs mx-auto">
                    <div className="w-16 h-16 bg-[#0074CC]/5 text-[#0074CC] rounded-lg flex items-center justify-center mx-auto mb-6 border border-[#0074CC]/10 shadow-inner">
                       <HiChatBubbleLeftEllipsis size={28} />
                    </div>
                    <h3 className="text-sm font-bold text-[#0A1628] mb-1 uppercase tracking-widest">Contribution Index Empty</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
                       Establish verified mastery packets to build your network ranking.
                    </p>
                    <Link to="/portal/dashboard" className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-[#0A1628] text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all shadow-sm active:scale-95">
                       Browse Active Vault
                    </Link>
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyAnswersPage;
