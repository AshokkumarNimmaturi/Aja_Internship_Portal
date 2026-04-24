import { useState, useEffect, useCallback } from "react";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import { useAuth } from "../../context/AuthContext";
import { fetchPendingQuestions, reviewQuestion } from "../../api/questionApi";
import toast from "react-hot-toast";
// ✅ UPGRADED: Using elite Heroicons 2
import { 
  HiArrowPath, 
  HiCheckCircle, 
  HiXCircle, 
  HiStar, 
  HiPencilSquare, 
  HiChatBubbleLeftEllipsis,
  HiBriefcase,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiTag,
  HiChartBar,
  HiIdentification,
  HiDocumentText,
  HiTrash,
  HiShieldCheck
} from "react-icons/hi2";

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
  const [selectedReviewEmployee, setSelectedReviewEmployee] = useState(null);

  // Form states
  const [correctedAnswers, setCorrectedAnswers] = useState({});
  const [comments, setComments] = useState({});
  const [processing, setProcessing] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoadingQ(true);
    try {
      const res = await fetchPendingQuestions();
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
      await questionApi.reviewQuestion(id, {
        decision: decision,
        rejectionReason: comments[id] || "",
        correctedAnswer: correctedAnswers[id] || ""
      });
      toast.success(`Packet #${id} ${decision === 'APPROVED' ? 'Synchronized' : 'Decommissioned'}`);
      
      // Update local state by removing processed question
      const updatedQuestions = questions.filter(q => q.id !== id);
      setQuestions(updatedQuestions);

      // If we are in drill-down mode, update or exit the current view
      if (selectedReviewEmployee) {
         const remainingForEmp = updatedQuestions.filter(q => (q.submittedByEmail || "Unknown") === selectedReviewEmployee.email);
         if (remainingForEmp.length === 0) {
            setSelectedReviewEmployee(null); // Exit to dashboard if done with this agent
         } else {
            setSelectedReviewEmployee(prev => ({ ...prev, questions: remainingForEmp }));
         }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Telemetry Sync Failed");
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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden portal-modern">
      <PortalSidebar user={user} role="TUTOR" activeItem="Review Queue" />

      <main className="flex-1 p-8 py-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {!selectedReviewEmployee ? (
            <>
              <div className="flex items-center justify-between mb-12 px-6">
                <div>
                  <h1 className="text-3xl font-serif text-[#0A1628] mb-2 font-bold italic">Intelligence Sources</h1>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] opacity-70 italic">Contributors awaiting expert verification sync</p>
                </div>
                <button onClick={fetchQuestions} className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#0A1628] border border-black/10 rounded-2xl hover:bg-white transition-all shadow-sm active:scale-95 bg-gray-50/50">
                  <HiArrowPath size={16} className={loadingQ ? "animate-spin" : ""} /> Sync Telemetry
                </button>
              </div>

              {/* Contributor Grid */}
              {loadingQ ? (
                <div className="py-40 bg-white border-2 border-dashed border-black/5 rounded-[60px] flex flex-col items-center justify-center text-center">
                   <HiArrowPath className="animate-spin text-blue-100 mb-6" size={48} />
                   <p className="text-gray-400 font-serif italic text-lg">Accessing contributor network...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  {Object.values(filtered.reduce((acc, q) => {
                    const key = q.submittedByEmail || "Unknown";
                    if (!acc[key]) acc[key] = { email: key, name: q.submittedByName || "Internal Member", questions: [] };
                    acc[key].questions.push(q);
                    return acc;
                  }, {})).map((agent) => (
                    <div 
                      key={agent.email} 
                      onClick={() => setSelectedReviewEmployee(agent)}
                      className="group bg-white p-10 rounded-[50px] border border-black/8 shadow-sm hover:shadow-2xl hover:border-blue-300 transition-all duration-500 cursor-pointer relative overflow-hidden"
                    >
                       <div className="absolute -top-10 -right-10 opacity-0 group-hover:opacity-5 group-hover:scale-150 transition-all duration-700 text-[#0A1628]">
                          <HiBriefcase size={160} />
                       </div>
                       <div className="flex items-center gap-6 mb-10">
                          <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center border border-black/5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                             <HiBriefcase size={32} className="text-gray-400 group-hover:text-white" />
                          </div>
                          <div>
                             <h4 className="text-xl font-black text-[#0A1628] uppercase tracking-tight group-hover:text-blue-700 transition-colors leading-tight mb-1">{agent.name}</h4>
                             <p className="text-[10px] text-gray-400 font-mono italic">{agent.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center justify-between pt-8 border-t border-black/8">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pending Intel Packets</span>
                          <div className="w-12 h-12 bg-[#0A1628] text-white rounded-[18px] flex items-center justify-center text-sm font-black shadow-lg shadow-blue-900/10 group-hover:scale-110 group-hover:bg-blue-600 transition-all">{agent.questions.length}</div>
                       </div>
                    </div>
                  ))}

                  {filtered.length === 0 && (
                    <div className="col-span-3 py-40 bg-white border-2 border-dashed border-black/5 rounded-[60px] text-center px-10">
                       <div className="text-6xl mb-6 grayscale hover:grayscale-0 transition-all italic opacity-20">🥂</div>
                       <h3 className="text-2xl font-serif text-[#0A1628] font-black mb-2">Curation Queue Sanitized</h3>
                       <p className="text-gray-400 text-sm font-light italic max-w-sm mx-auto leading-relaxed">Expert curation queue is perfectly synchronized. All telemetry systems are nominal.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="animate-in slide-in-from-bottom-6 duration-700">
               {/* Stage 2: Individual Question Curation (Premium Reference UI) */}
               <div className="flex items-center justify-between mb-12 px-6">
                  <div className="flex items-center gap-6">
                     <button 
                       onClick={() => setSelectedReviewEmployee(null)}
                       className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                     >
                        <HiArrowPath className="rotate-180" size={20} />
                     </button>
                     <nav className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-gray-400">Auditing</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-blue-600 font-bold">{selectedReviewEmployee.name}</span>
                     </nav>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100 text-[10px] font-bold">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     Verified Sync
                  </div>
               </div>

               <div className="flex flex-col gap-10">
                  {selectedReviewEmployee.questions.map((q) => (
                    <div key={q.id} className="bg-white border border-gray-100 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                       
                        {/* Meta Info Bar (4 Columns) */}
                        <div className="bg-gray-50/50 border-b border-gray-100 px-10 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm"><HiTag size={18} /></div>
                              <div>
                                 <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Technology</div>
                                 <div className="text-sm font-bold text-gray-800">{q.technologyName || "General"}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-amber-500 shadow-sm"><HiChartBar size={18} /></div>
                              <div>
                                 <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Difficulty</div>
                                 <div className="text-sm font-bold text-gray-800 capitalize">{q.difficulty?.toLowerCase() || "Medium"}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-blue-500 shadow-sm"><HiIdentification size={18} /></div>
                              <div>
                                 <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Question ID</div>
                                 <div className="text-sm font-bold text-gray-800">{q.id}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-emerald-500 shadow-sm"><HiBriefcase size={18} /></div>
                              <div>
                                 <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Source Path</div>
                                 <div className="text-sm font-bold text-emerald-700 italic truncate max-w-[120px]">{q.clientName || "General Storefront"}</div>
                              </div>
                           </div>
                        </div>

                       <div className="p-10">
                           <div className="space-y-6 mb-10">
                              {/* Question Context */}
                              <div className="bg-gray-50/30 border-l-4 border-blue-600 px-8 py-6 rounded-r-2xl">
                                 <div className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 opacity-60">Submitted Intel</div>
                                 <h3 className="text-xl font-bold text-gray-900 leading-snug">{q.title}</h3>
                              </div>

                              {/* Source Intelligence - Full Width */}
                              <div className="space-y-3">
                                 <div className="flex items-center gap-2 text-gray-400 px-2">
                                    <HiDocumentText size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Source Transmission Context</span>
                                 </div>
                                 <div className="p-8 bg-gray-50 border border-gray-100/50 rounded-[30px] shadow-inner">
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium italic">"{q.content}"</p>
                                 </div>
                              </div>

                              {/* Contributor Proposal - Full Width */}
                              <div className="space-y-3">
                                 <div className="flex items-center gap-2 text-blue-500 px-2">
                                    <HiShieldCheck size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Contributor Mastery Proposal</span>
                                 </div>
                                 <div className="p-8 bg-blue-50/30 border border-blue-100/50 rounded-[30px] shadow-sm">
                                    <p className="text-sm text-gray-700 leading-relaxed font-bold">
                                       {q.initialAnswer || "No proposal provided."}
                                    </p>
                                 </div>
                              </div>
                           </div>

                          {/* Main Editor Terminal */}
                          <div className="space-y-8">
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3 text-gray-400">
                                      <HiPencilSquare size={16} />
                                      <span className="text-[10px] font-bold uppercase tracking-wider">Verify Source Truth</span>
                                   </div>
                                   <div className="flex items-center gap-2 text-gray-400">
                                      <HiArrowPath size={14} className="animate-spin-slow opacity-30" />
                                      <span className="text-[10px] font-bold uppercase tracking-tight opacity-50">Synchronize</span>
                                   </div>
                                </div>
                                <textarea
                                  placeholder="Compose the verified master intelligence packet..."
                                  value={correctedAnswers[q.id] || ""}
                                  onChange={(e) => setCorrectedAnswers({ ...correctedAnswers, [q.id]: e.target.value })}
                                  className="w-full p-8 bg-white border border-gray-100 rounded-2xl text-sm text-gray-800 placeholder:text-gray-300 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all shadow-inner"
                                  rows={2}
                                />
                             </div>

                             <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-400 px-2">
                                   <HiChatBubbleLeftEllipsis size={16} />
                                   <span className="text-[10px] font-bold uppercase tracking-wider">Contributor Pipeline Response</span>
                                </div>
                                <textarea 
                                  value={comments[q.id] || ""}
                                  onChange={(e) => setComments({ ...comments, [q.id]: e.target.value })}
                                  className="w-full px-8 py-6 bg-white border border-gray-100 rounded-2xl text-sm font-medium italic text-gray-500 placeholder:text-gray-200 outline-none focus:border-blue-300 transition-all shadow-inner"
                                  placeholder="Technical feedback for the contributor network..."
                                  rows={1}
                                />
                             </div>

                             {/* Bottom Action Bar */}
                             <div className="flex items-center justify-between pt-6">
                                <button 
                                  onClick={() => handleAction(q.id, 'REJECTED')}
                                  disabled={!!processing}
                                  className="flex items-center gap-3 px-8 py-3 rounded-xl border border-red-100 text-red-500 text-[11px] font-bold uppercase tracking-wider hover:bg-red-50 transition-all active:scale-95"
                                >
                                   <HiTrash size={16} /> {processing === q.id + "REJECTED" ? 'REJECTING...' : 'Decommission Intel'}
                                </button>
                                <button 
                                  onClick={() => handleAction(q.id, 'APPROVED')}
                                  disabled={!!processing}
                                  className="flex items-center gap-3 px-10 py-3.5 rounded-xl bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                >
                                   <HiCheckCircle size={18} /> {processing === q.id + "APPROVED" ? 'SYNCING...' : 'Verify & Broadcast to Storefront'}
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

          )}
        </div>
      </main>
    </div>
  );
};

export default TutorReviewPage;
