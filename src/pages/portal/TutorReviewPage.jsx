import { useState, useEffect, useCallback } from "react";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Star, 
  Edit3, 
  MessageSquare,
  Briefcase,
  Search,
  Filter
} from "lucide-react";

const TechBadge = ({ tech }) => (
  <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded border border-black/5 text-gray-600 uppercase italic tracking-widest">
    {tech}
  </span>
);

const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    EASY: "bg-green-50 text-green-700 border-green-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    HARD: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${styles[difficulty] || "bg-gray-100"}`}>
      {difficulty}
    </span>
  );
};

const TutorReviewPage = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [techFilters, setTechFilters] = useState(["All"]);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [correctedAnswers, setCorrectedAnswers] = useState({});
  const [comments, setComments] = useState({});
  const [processing, setProcessing] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoadingQ(true);
    try {
      const res = await axiosInstance.get("/questions/pending");
      const list = Array.isArray(res.data) ? res.data : (res.data.content || []);
      setQuestions(list);
      
      const techs = ["All", ...new Set(list.map(q => q.technologyName || "General"))];
      setTechFilters(techs);
    } catch (err) {
      toast.error("Failed to load curation queue");
    } finally {
      setLoadingQ(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAction = async (id, decision) => {
    setProcessing(id + decision);
    try {
      await axiosInstance.put(`/questions/${id}/review`, {
        decision: decision,
        rejectionReason: comments[id] || "",
        correctedAnswer: correctedAnswers[id] || ""
      });
      toast.success(`Question ${decision.toLowerCase()} successfully!`);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Review action failed. Please ensure the official answer is provided for approval.");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = questions.filter(q => {
    const matchesTech = activeFilter === "All" || (q.technologyName || "General") === activeFilter;
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (q.clientName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTech && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PortalSidebar user={user} role="TUTOR" activeItem="Review Queue" />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif text-[#0A1628] mb-1">Curation Phase</h1>
              <p className="text-xs text-gray-400 font-light uppercase tracking-widest">Expert Verification & Mastery Benchmarking</p>
            </div>
            <button onClick={fetchQuestions} className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#0A1628] border border-black/10 rounded-xl hover:bg-white transition-all">
              <RefreshCw size={14} className={loadingQ ? "animate-spin" : ""} /> Sync Queue
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
             <div className="flex-1 relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by title or client..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all shadow-sm"
                />
             </div>
             <div className="flex gap-2 items-center">
                <Filter size={14} className="text-gray-400 mr-2" />
                <div className="flex gap-1 overflow-x-auto pb-1 max-w-xs scrollbar-hide">
                  {techFilters.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => setActiveFilter(tech)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeFilter === tech
                          ? "bg-[#0A1628] text-white shadow-md shadow-blue-900/20"
                          : "bg-white border border-black/5 text-gray-400 hover:bg-gray-100"
                        }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          {/* List */}
          {loadingQ ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-black/5 rounded-[40px] text-center shadow-sm">
              <RefreshCw className="animate-spin text-blue-100 mb-4" size={32} />
              <p className="text-gray-400 text-sm italic font-serif">Awaiting quality submissions...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="flex flex-col gap-8">
              {Array.isArray(filtered) && filtered.map((q) => (
                <div key={q.id} className="group bg-white border border-black/5 rounded-[40px] p-8 shadow-sm hover:shadow-xl transition-all hover:border-blue-100 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400 group-hover:bg-blue-500 transition-colors" />
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#0A1628] text-xl leading-tight mb-3 group-hover:text-blue-700 transition-colors">{q.title}</h3>
                      <div className="flex flex-wrap items-center gap-3">
                         <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 text-[10px] font-bold uppercase tracking-widest italic">
                            <Briefcase size={12} /> {q.clientName || "General Intake"}
                         </div>
                         <TechBadge tech={q.technologyName || "General"} />
                         <DifficultyBadge difficulty={q.difficulty} />
                         <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1">Submitted by {q.submittedByName || "Member"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Context Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 rounded-2xl p-5 border border-black/5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Submission Content</span>
                      <p className="text-sm text-gray-600 leading-relaxed italic">"{q.content}"</p>
                    </div>
                    <div className="bg-blue-50/20 rounded-2xl p-5 border border-blue-100/50">
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mb-1.5">Proposed Explanation</span>
                      <p className="text-sm text-blue-700/70 leading-relaxed font-light italic">
                        {q.initialAnswer ? `"${q.initialAnswer}"` : "No explanation provided."}
                      </p>
                    </div>
                  </div>

                  {/* Mastering Tool */}
                  <div className="bg-white border-2 border-dashed border-blue-100 rounded-3xl p-6 mb-6 shadow-inner">
                    <div className="flex items-center gap-2 mb-3 text-blue-600 font-bold">
                       <Edit3 size={16} />
                       <span className="text-xs uppercase tracking-widest">Verified Master Answer (Syncs to Storefront)</span>
                    </div>
                    <textarea
                      placeholder="Craft the official, high-quality answer for subscribers..."
                      value={correctedAnswers[q.id] || ""}
                      onChange={(e) => setCorrectedAnswers({ ...correctedAnswers, [q.id]: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50/30 border border-black/5 rounded-2xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-8 focus:ring-blue-50/50 transition-all resize-none font-sans leading-relaxed"
                      rows={5}
                    />
                  </div>

                  {/* Feedback */}
                  <div className="mb-8">
                     <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest ml-2 block mb-1">Internal Feedback (Visible to Submitter)</span>
                     <input 
                       value={comments[q.id] || ""}
                       onChange={(e) => setComments({ ...comments, [q.id]: e.target.value })}
                       className="w-full px-5 py-3 border border-black/5 rounded-2xl text-sm italic text-gray-500 placeholder-gray-200 outline-none focus:border-blue-200 focus:bg-gray-50/50 transition-all"
                       placeholder="Explain rejection or offer feedback..."
                     />
                  </div>

                  {/* Action Cluster */}
                  <div className="flex gap-4">
                     <button 
                       onClick={() => handleAction(q.id, 'REJECTED')}
                       disabled={!!processing}
                       className="flex-1 py-4 px-6 rounded-2xl bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100 flex items-center justify-center gap-2"
                     >
                       <XCircle size={16} /> {processing === q.id + "REJECTED" ? 'REJECTING...' : 'DISCARD'}
                     </button>
                     <button 
                       onClick={() => handleAction(q.id, 'APPROVED')}
                       disabled={!!processing}
                       className="flex-[2] py-4 px-6 rounded-2xl bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-2"
                     >
                       <CheckCircle size={16} /> {processing === q.id + "APPROVED" ? 'SYNCING...' : 'APPROVE & PUBLISH'}
                     </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-white border border-black/5 rounded-[50px] text-center shadow-inner">
               <div className="text-6xl mb-6">🥂</div>
               <h3 className="text-xl font-serif text-[#0A1628] mb-2">Queue Mastery Achieved</h3>
               <p className="text-gray-400 text-sm italic font-light max-w-xs">{searchQuery ? `No matches for "${searchQuery}" in ${activeFilter} category.` : "Every single question has been curated. Take a well-deserved break."}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TutorReviewPage;
