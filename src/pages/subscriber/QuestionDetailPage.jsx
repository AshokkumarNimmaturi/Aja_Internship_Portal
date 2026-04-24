import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { HiArrowLeft, HiBookmark, HiBriefcase, HiCheckBadge, HiStar, HiArrowPath, HiBolt, HiShieldCheck } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/subscriber/Sidebar";
import { 
  fetchQuestionById, 
  // recordQuestionVisit, 
  getBookmarks, 
  getQuestionAnswers, 
  toggleBookmarkApi 
} from "../../api/questionApi";
import TechBadge from "../../components/common/TechBadge";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import toast from "react-hot-toast";

const QuestionDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      // ✅ ELITE SYNC: Disabled Visit Telemetry until Backend is ready
      // recordQuestionVisit(id).catch(() => {});

      const [qRes, bRes, aRes] = await Promise.all([
        fetchQuestionById(id),
        getBookmarks().catch(() => ({ data: [] })),
        getQuestionAnswers(id).catch(() => ({ data: [] }))
      ]);
      
      setQuestion(qRes.data);
      setAnswers(aRes.data);
      const isBookmarked = Array.isArray(bRes.data) && bRes.data.some(b => b.id === parseInt(id));
      setBookmarked(isBookmarked);
    } catch (e) { 
      toast.error("Could not load details."); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchQuestion(); }, [id]);

  const toggleBookmark = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await toggleBookmarkApi(id);
      setBookmarked(!bookmarked);
      toast.success(bookmarked ? "Removed from bookmarks" : "Saved to your vault! 🦾");
    } catch (e) {
      toast.error("Failed to update bookmark.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center flex-col">
       <div className="relative">
          <HiArrowPath className="animate-spin text-blue-500 mb-4" size={40} />
          <div className="absolute inset-0 flex items-center justify-center"><HiBolt size={12} className="text-blue-500" /></div>
       </div>
       <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Intel Packet...</p>
    </div>
  );

  if (!question) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center flex-col p-10 text-center">
       <div className="text-6xl mb-6">🕵️‍♂️</div>
       <h2 className="text-2xl font-serif text-[#0A1628] mb-2">Protocol Redacted</h2>
       <p className="text-sm text-gray-400 italic mb-8 max-w-xs">This intelligence packet has been moved or purged from the central database.</p>
       <Link to="/dashboard" className="px-8 py-3 bg-[#0A1628] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl active:scale-95">Back to Command Center</Link>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F1F2F3] font-sans overflow-hidden portal-modern">
      <Sidebar activeItem="Questions" />
      <main className="flex-1 p-8 py-12 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto">
          {/* Back Nav */}
          <div className="flex items-center justify-between mb-8">
             <Link to="/dashboard/questions" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#0074CC] transition-all group">
                <HiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Question Bank
             </Link>
             <div className="flex items-center gap-3">
                <button 
                  onClick={toggleBookmark} 
                  disabled={isSyncing}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    bookmarked 
                      ? "bg-[#0074CC] text-white shadow-lg shadow-blue-500/20" 
                      : "bg-white text-gray-500 border border-[#E3E6E8] hover:bg-gray-50"
                  }`}
                >
                  <HiBookmark size={16} className={bookmarked ? "fill-white" : ""} />
                  {bookmarked ? "Bookmarked" : "Save to Vault"}
                </button>
             </div>
          </div>

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Core intelligence Packet */}
            <div className="bg-white border border-[#E3E6E8] rounded-lg shadow-sm">
               <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <TechBadge tech={question.technologyName || "General"} />
                     <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100">{question.difficulty}</div>
                  </div>
                  
                  <h1 className="text-xl font-sans font-bold text-[#232629] leading-tight mb-4">
                     {question.title}
                  </h1>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed font-sans font-medium">
                      {question.content}
                    </p>
                  </div>
               </div>
            </div>

            {/* Master Solution Guide */}
            <div className="bg-white border border-[#E3E6E8] rounded-lg shadow-sm">
               <div className="bg-gray-50 border-b border-[#E3E6E8] px-6 py-2.5 flex items-center justify-between">
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Official Solution</h2>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#0074CC] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                     Verified
                  </span>
               </div>
               
               <div className="p-6">
                  <div className="bg-white p-6 rounded-lg border border-[#E3E6E8] shadow-inner text-sm leading-relaxed text-[#232629] font-sans font-medium">
                     {question.officialAnswer ? question.officialAnswer : question.initialAnswer || "No mastering guide available for this packet yet."}
                  </div>
                  
                  <div className="mt-10 flex items-center justify-between">
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Aja Consulting Services • Verified Intel</p>
                     <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#0074CC] transition-colors">
                           <HiStar size={16} /> Mark as Mastered
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Community Intelligence Section */}
            {answers.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 px-1">
                   <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Alternative Perspectives ({answers.length})</h2>
                   <div className="h-px w-full bg-gray-200" />
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {answers.map((answer) => (
                    <div key={answer.id} className="bg-white border border-[#E3E6E8] rounded-xl p-8 shadow-sm group hover:border-[#0074CC]/30 transition-all">
                       <div className="flex items-center gap-4 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-black text-xs">
                             {answer.authorName?.charAt(0) || "A"}
                          </div>
                          <div>
                             <div className="text-sm font-bold text-[#232629] mb-0.5">{answer.authorName || "Anonymous Contributor"}</div>
                             <div className="text-[9px] font-black uppercase tracking-widest text-[#0074CC]/40">Expert Contribution</div>
                          </div>
                       </div>
                       <p className="text-sm text-gray-500 leading-relaxed font-sans font-medium pl-4 border-l-2 border-gray-100 group-hover:border-blue-500/20 transition-all">
                          {answer.content}
                       </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-20 text-center opacity-30 pb-20">
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2 italic">
                <HiShieldCheck size={14} /> End-to-End Encryption • Mastery Sync 🦾
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionDetailPage;
