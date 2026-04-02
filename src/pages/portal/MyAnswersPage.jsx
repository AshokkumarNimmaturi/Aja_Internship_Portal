import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  ArrowLeft,
  ChevronRight,
  ThumbsUp,
  Clock,
  CheckCircle2
} from "lucide-react";
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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <PortalSidebar 
        user={user} 
        role={user?.role || "EMPLOYEE"} 
        activeItem="My Answers" 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/portal/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#0A1628] transition-colors mb-3 group">
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
            </Link>
            <h1 className="font-serif text-3xl text-[#0A1628] mb-1">My Answers</h1>
            <p className="text-sm text-gray-400 font-light italic">Your contributions to the community knowledge base</p>
          </div>

          {/* Answers List */}
          <div className="flex flex-col gap-6">
            {loading ? (
               <div className="bg-white border border-black/8 rounded-2xl p-20 flex flex-col items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-sm text-gray-400 font-medium tracking-wide">Syncing your contributions...</span>
               </div>
            ) : Array.isArray(answers) && answers.length > 0 ? (
              answers.map((ans) => (
                <div key={ans.id} className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                   <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                         <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2 block font-mono">Question</span>
                         <h3 className="font-serif text-lg text-[#0A1628] group-hover:text-blue-600 transition-colors leading-snug">
                            {ans.questionTitle || "Unknown Question"}
                         </h3>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                         <div className="flex items-center gap-1.5 text-gray-400">
                            <ThumbsUp size={14} className={ans.upvoteCount > 0 ? "text-blue-500 fill-blue-50" : ""} />
                            <span className="text-xs font-bold font-mono">{ans.upvoteCount || 0}</span>
                         </div>
                         {ans.accepted && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded text-[10px] font-bold tracking-tighter uppercase whitespace-nowrap">
                               <CheckCircle2 size={10} /> Best Answer
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="bg-gray-50/80 rounded-xl p-4 border border-black/5 mb-4 italic text-sm text-gray-600 leading-relaxed font-light">
                      "{ans.content}"
                   </div>

                   <div className="flex items-center justify-between border-t border-black/5 pt-4">
                      <div className="flex items-center gap-1.5 text-gray-400">
                         <Clock size={12} />
                         <span className="text-[10px] font-bold uppercase tracking-wider font-mono italic">Answered {formatDate(ans.createdAt)}</span>
                      </div>
                      
                      <Link to={`/portal/questions/${ans.questionId}`} className="flex items-center gap-1.5 text-xs font-bold text-[#0A1628] hover:text-blue-600 transition-colors uppercase tracking-widest">
                         View Discussion <ChevronRight size={14} />
                      </Link>
                   </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-black/8 rounded-2xl p-24 text-center shadow-sm">
                 <div className="max-w-xs mx-auto">
                    <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-inner">
                       <MessageSquare size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-[#0A1628] mb-1">No answers yet</h3>
                    <p className="text-sm text-gray-400 leading-relaxed font-light">
                       Start participating in discussions to build your profile and help others!
                    </p>
                    <Link to="/portal/dashboard" className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-[#0A1628] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#0F2340] transition-all shadow-md">
                       Explore Questions
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
