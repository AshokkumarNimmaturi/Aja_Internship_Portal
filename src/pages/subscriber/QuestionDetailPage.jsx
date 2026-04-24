import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { HiArrowLeft, HiBookmark, HiBriefcase, HiCheckBadge, HiStar, HiArrowPath, HiBolt } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/subscriber/Sidebar";
import { 
  fetchQuestionById, 
  recordQuestionVisit, 
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
      // ✅ ELITE SYNC: Record visit for Recently Viewed dashboard
      recordQuestionVisit(id).catch(() => {});

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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar activeItem="Questions" />
      <main className="flex-1 p-10 py-10 overflow-y-auto max-w-5xl mx-auto w-full">
        {/* Elite Breadcrumb */}
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10 transition-all">
          <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Command</Link>
          <span className="text-gray-200">/</span>
          <Link to="/dashboard/questions" className="hover:text-blue-600 transition-colors">Intelligence</Link>
          <span className="text-gray-200">/</span>
          <span className="text-[#0A1628]">Packet #{id}</span>
        </div>

        {/* Question Intelligence Section */}
        <div className="bg-white border border-black/5 rounded-[50px] p-12 mb-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <HiBriefcase size={180} className="rotate-12" />
          </div>
          
          <div className="flex justify-between items-start mb-10 relative z-10">
             <div className="flex-1 pr-12">
               <h1 className="text-4xl font-serif text-[#0A1628] leading-tight mb-6">{question.title}</h1>
               <div className="flex flex-wrap gap-4 items-center">
                  <TechBadge tech={question.technologyName || "General"} />
                  <DifficultyBadge difficulty={question.difficulty} />
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-blue-100/50">
                     <HiBriefcase size={14} /> {question.clientName || "General Intake"}
                  </div>
               </div>
             </div>
             
             <button 
                onClick={toggleBookmark} 
                disabled={isSyncing}
                className={`shrink-0 w-16 h-16 flex items-center justify-center rounded-[24px] border transition-all shadow-xl ${
                  bookmarked 
                    ? "bg-blue-600 border-blue-500 shadow-blue-500/20" 
                    : "bg-white border-black/5 hover:border-blue-200 shadow-black/5"
                } ${isSyncing ? "opacity-50" : "active:scale-95"}`}
              >
                <HiBookmark 
                  size={24} 
                  className={bookmarked ? "text-white fill-white" : "text-gray-300"} 
                />
             </button>
          </div>

          <div className="bg-gray-50/50 p-10 rounded-[40px] border border-black/5 shadow-inner relative z-10">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Intel Description</h3>
             </div>
             <p className="text-lg text-[#0A1628] leading-relaxed italic whitespace-pre-wrap font-serif font-light">
               "{question.content}"
             </p>
          </div>
        </div>

        {/* Master Official Answer Section */}
        <div className="bg-[#0A1628] rounded-[60px] p-14 shadow-2xl relative overflow-hidden group border border-white/5 animate-in zoom-in duration-700">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <HiCheckBadge size={280} className="text-white" />
           </div>
           
           <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10 shadow-2xl">
                    <HiCheckBadge size={28} />
                 </div>
                 <div>
                   <h2 className="text-2xl font-black text-white tracking-tight">
                      {question.officialAnswer ? "Master Official Answer" : "Initial Submission Answer"}
                   </h2>
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">
                      {question.officialAnswer ? "Curation Verified by Aja Tutors" : "Initial context provided by submitter"}
                   </p>
                 </div>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/20 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20 shadow-lg">
                 <HiBolt size={14} className="animate-pulse" /> {question.officialAnswer ? "Final Protocol" : "Draft Protocol"}
              </div>
           </div>

           <div className="text-xl leading-relaxed text-white/90 bg-white/5 p-10 rounded-[40px] border border-white/5 shadow-2xl min-h-[300px] italic font-medium font-serif relative z-10 transition-all group-hover:bg-white/[0.07]">
             {question.officialAnswer ? (
                `"${question.officialAnswer}"`
             ) : (
                `"${question.initialAnswer || "No detailed explanation was provided with this submission."}"`
             )}
           </div>
           
           <div className="mt-12 flex items-center justify-between pt-10 border-t border-white/5 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/10 bg-white/5 text-blue-300 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer">
                    <HiStar size={16} /> Mark as Elite Intel
                 </div>
              </div>
              <Link to="/dashboard/questions" className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-3 group/back">
                 <HiArrowLeft size={18} className="group-hover/back:-translate-x-1 transition-transform" /> Back to Base
              </Link>
           </div>

         {/* Expert Answers Section */}
         <div className="mt-12 mb-12">
            <h2 className="text-xl font-bold text-[#0A1628] mb-6 flex items-center gap-2 font-serif">
               Community Intelligence ({answers.length})
            </h2>

            <div className="flex flex-col gap-6">
              {answers.length > 0 ? answers.map((answer) => (
                <div key={answer.id} className="bg-white border rounded-[32px] p-7 shadow-sm relative overflow-hidden group border-black/5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] text-gray-400 flex items-center justify-center font-black text-sm uppercase tracking-widest border border-black/5">
                        {answer.authorName?.charAt(0) || "A"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0A1628] mb-0.5">{answer.authorName || "Anonymous Contributor"}</div>
                        <div className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-300">
                           Expert Submission
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-light font-sans pl-2 border-l-2 border-blue-500/20">
                    {answer.content}
                  </p>
                </div>
              )) : (
                 <div className="py-16 text-center text-gray-400 text-sm italic font-light border border-dashed border-black/5 rounded-[40px] bg-white/50">
                    No community intel has been submitted for this packet yet.
                 </div>
              )}
            </div>
         </div>
         
        </div>
      </main>
    </div>
  );
};

export default QuestionDetailPage;
