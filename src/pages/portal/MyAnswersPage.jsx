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
import axiosInstance from "../../api/axiosInstance";

const MyAnswersPage = () => {
  const { user } = useAuth();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnswers = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/answers/my");
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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden py-10">
      <PortalSidebar 
        user={user} 
        role={user?.role || "EMPLOYEE"} 
        activeItem="My Answers" 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <Link to="/portal/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#0A1628] transition-colors mb-4 group">
              <HiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
            </Link>
            <h1 className="font-serif text-3xl text-[#0A1628] mb-1 font-bold">My Contributions</h1>
            <p className="text-sm text-gray-400 font-light italic">Champion responses shared with the Aja global community</p>
          </div>

          {/* Answers List */}
          <div className="flex flex-col gap-6">
            {loading ? (
               <div className="bg-white border border-black/8 rounded-[40px] p-24 flex flex-col items-center gap-4 shadow-sm">
                  <HiArrowPath className="w-10 h-10 text-blue-500 animate-spin" />
                  <span className="text-sm text-gray-300 font-bold uppercase tracking-[0.2em] italic">Syncing Mastery Data...</span>
               </div>
            ) : Array.isArray(answers) && answers.length > 0 ? (
              answers.map((ans) => (
                <div key={ans.id} className="bg-white border border-black/8 rounded-[36px] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-50 group-hover:bg-blue-600 transition-colors" />
                   <div className="flex items-start justify-between mb-5">
                      <div className="flex-1">
                         <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2.5 block opacity-70">INTEL SOURCE</span>
                         <h3 className="font-serif text-xl text-[#0A1628] group-hover:text-blue-600 transition-colors leading-tight font-bold">
                            {ans.questionTitle || "Unknown Question Source"}
                         </h3>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                         <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-black/5 text-gray-400 shadow-inner group-hover:bg-white transition-colors duration-300">
                            <HiHandThumbUp size={16} className={ans.upvoteCount > 0 ? "text-blue-500 fill-blue-500" : ""} />
                            <span className="text-[10px] font-black font-mono tracking-tighter">{ans.upvoteCount || 0}</span>
                         </div>
                         {ans.accepted && (
                            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-sm">
                               <HiCheckCircle size={14} /> Verified Best
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="bg-gray-50/50 rounded-2xl p-6 border border-black/5 mb-6 italic text-sm text-gray-600 leading-relaxed font-light shadow-inner">
                      "{ans.content}"
                   </div>

                   <div className="flex items-center justify-between border-t border-black/5 pt-5">
                      <div className="flex items-center gap-2 text-gray-400">
                         <HiClock size={16} className="opacity-50" />
                         <span className="text-[10px] font-bold uppercase tracking-widest italic">Intelligence Shared {formatDate(ans.createdAt)}</span>
                      </div>
                      
                      <Link to={`/portal/questions/${ans.questionId}`} className="flex items-center gap-2 px-6 py-2.5 bg-[#0A1628] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/10 active:scale-95">
                         Mastery Link <HiChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                   </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-black/8 rounded-[50px] p-28 text-center shadow-inner">
                 <div className="max-w-xs mx-auto">
                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-inner hover:scale-110 transition-transform">
                       <HiChatBubbleLeftEllipsis size={36} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#0A1628] mb-2 leading-tight">Champion Tracker Empty</h3>
                    <p className="text-sm text-gray-400 leading-relaxed font-light italic">
                       Contribute elite technical solutions to build your ranking and help the global network.
                    </p>
                    <Link to="/portal/dashboard" className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-[#0A1628] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 active:scale-95">
                       Browse Active Discussions
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
