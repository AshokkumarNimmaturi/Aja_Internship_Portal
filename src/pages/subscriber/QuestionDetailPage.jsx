import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Briefcase, UserCheck, Star, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/subscriber/Sidebar";
import axiosInstance from "../../api/axiosInstance";
import TechBadge from "../../components/common/TechBadge";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import toast from "react-hot-toast";

const QuestionDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const [qRes, bRes] = await Promise.all([
        axiosInstance.get(`/questions/${id}`),
        axiosInstance.get("/bookmarks").catch(() => ({ data: [] }))
      ]);
      
      setQuestion(qRes.data);
      const isBookmarked = Array.isArray(bRes.data) && bRes.data.some(b => b.id === parseInt(id));
      setBookmarked(isBookmarked);
    } catch (e) { 
      toast.error("Could not load details."); 
      console.error(e);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchQuestion(); }, [id]);

  const toggleBookmark = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await axiosInstance.post(`/bookmarks/${id}`);
      setBookmarked(!bookmarked);
      toast.success(bookmarked ? "Bookmark removed" : "Question saved to bookmarks!");
    } catch (e) {
      toast.error("Failed to update bookmark.");
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
       <RefreshCw className="animate-spin text-gray-300 mr-2" size={24} />
       <p className="text-gray-500 animate-pulse text-sm font-medium">Securing connection...</p>
    </div>
  );

  if (!question) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center flex-col">
       <h2 className="text-xl font-bold text-gray-800 mb-2">Question not found</h2>
       <Link to="/dashboard" className="text-blue-600 underline">Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6 font-sans">
          <Link to="/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-600">Question #{id}</span>
        </div>

        {/* Question Header Card */}
        <div className="bg-white border border-black/8 rounded-3xl p-8 mb-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
             <div className="flex-1 pr-8">
               <h1 className="text-3xl font-serif text-[#0A1628] leading-tight mb-4">{question.title}</h1>
               <div className="flex flex-wrap gap-2 items-center">
                  <TechBadge tech={question.technologyName || (question.technology?.name) || "General"} />
                  <DifficultyBadge difficulty={question.difficulty} />
               </div>
             </div>
             <button 
                onClick={toggleBookmark} 
                disabled={isSyncing}
                className={`shrink-0 p-3 rounded-2xl border transition-all shadow-sm ${
                  bookmarked 
                    ? "bg-blue-50 border-blue-100 hover:bg-blue-100" 
                    : "bg-white border-black/8 hover:border-blue-200"
                } ${isSyncing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Bookmark 
                  size={20} 
                  className={`${
                    isSyncing 
                      ? "animate-pulse text-blue-400" 
                      : bookmarked 
                        ? "text-blue-600 fill-blue-600" 
                        : "text-gray-300"
                  }`} 
                />
             </button>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-black/5">
             <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Interview Context</h3>
             <p className="text-[#0A1628] leading-relaxed italic whitespace-pre-wrap font-light">"{question.content}"</p>
          </div>
        </div>

        {/* Official Master Answer */}
        <div className="bg-white border border-black/8 rounded-3xl p-8 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#0A1628] flex items-center gap-2">
                 <UserCheck size={20} className="text-green-500" />
                 Official Master Answer
              </h2>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
                 Verified by Aja Tutors
              </div>
           </div>
           <div className="text-sm leading-relaxed text-gray-700 bg-gray-50/50 p-6 rounded-2xl border border-black/5 shadow-inner min-h-[200px]">
             {question.answers?.[0]?.content || "The official answer for this question is being polished by our team. Check back soon!"}
           </div>
           
           <div className="mt-8 flex items-center justify-between pt-6 border-t border-black/5">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1 shadow-sm px-3 py-1.5 rounded-xl border border-black/5 bg-white cursor-pointer hover:bg-gray-50 transition-all">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-gray-700">Excellent content</span>
                 </div>
              </div>
              <Link to="/dashboard" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center gap-2">
                 <ArrowLeft size={14} /> Back to Dashboard
              </Link>
           </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionDetailPage;
