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
      await reviewQuestion(id, {
        decision: decision,
        rejectionReason: comments[id] || "",
        correctedAnswer: correctedAnswers[id] || ""
      });
      toast.success(`Packet #${String(id).split('-')[0]} ${decision === 'APPROVED' ? 'Synchronized' : 'Decommissioned'}`);
      
      // Update local state by removing processed question
      setQuestions(prev => prev.filter(q => q.id !== id));

      // If we are in drill-down mode, update or exit the current view
      if (selectedReviewEmployee) {
         setSelectedReviewEmployee(prev => {
            const nextQuestions = prev.questions.filter(q => q.id !== id);
            return nextQuestions.length === 0 ? null : { ...prev, questions: nextQuestions };
         });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Telemetry Sync Failed");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = questions.filter(q => {
    const matchesTech = activeFilter === "All" || (q.technologyName || "General") === activeFilter;
    const title = q.title || "";
    const client = q.clientName || "";
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTech && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      <PortalSidebar user={user} role="TUTOR" activeItem="Review Queue" />

      <main className="flex-1 p-8 py-10 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto">
          {!selectedReviewEmployee ? (
            <>
              {/* Contributor Overview - Professional */}
              <div className="flex items-center justify-between mb-10 px-2">
                <div>
                  <h1 className="text-xl font-bold text-[#0A1628] mb-1">Intelligence Pipeline</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Contributors awaiting expert verification</p>
                </div>
                <button onClick={fetchQuestions} className="flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[#0074CC] border border-[#E3E6E8] rounded-lg hover:bg-white transition-all shadow-sm active:scale-95 bg-white/50">
                  <HiArrowPath size={14} className={loadingQ ? "animate-spin" : ""} /> Sync Telemetry
                </button>
              </div>

              {/* Contributor Grid - Tight */}
              {loadingQ ? (
                <div className="py-24 bg-white border border-[#E3E6E8] border-dashed rounded-lg flex flex-col items-center justify-center text-center">
                   <HiArrowPath className="animate-spin text-gray-200 mb-4" size={32} />
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Accessing contributor network...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                  {Object.values(filtered.reduce((acc, q) => {
                    const key = q.submittedByEmail || "Unknown";
                    if (!acc[key]) acc[key] = { email: key, name: q.submittedByName || "Internal Member", questions: [] };
                    acc[key].questions.push(q);
                    return acc;
                  }, {})).map((agent) => (
                    <div 
                      key={agent.email} 
                      onClick={() => setSelectedReviewEmployee(agent)}
                      className="group bg-white p-6 rounded-lg border border-[#E3E6E8] shadow-sm hover:border-[#0074CC]/30 transition-all cursor-pointer relative overflow-hidden"
                    >
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-[#E3E6E8] group-hover:bg-[#0074CC] group-hover:text-white transition-all shadow-inner font-bold text-gray-300">
                             {agent.name.charAt(0)}
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-[#0A1628] uppercase tracking-tight group-hover:text-[#0074CC] transition-colors mb-0.5">{agent.name}</h4>
                             <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest opacity-60 truncate max-w-[120px]">{agent.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center justify-between pt-5 border-t border-[#F3F4F6]">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Pending Intel</span>
                          <div className="w-8 h-8 bg-[#0A1628] text-white rounded-lg flex items-center justify-center text-[10px] font-bold group-hover:bg-[#0074CC] transition-all">{agent.questions.length}</div>
                       </div>
                    </div>
                  ))}

                  {filtered.length === 0 && (
                    <div className="col-span-full py-24 bg-white border border-[#E3E6E8] border-dashed rounded-lg text-center px-10">
                       <h3 className="text-sm font-bold text-[#0A1628] mb-1 uppercase tracking-widest">Curation Queue Sanitized</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">Expert curation queue is perfectly synchronized. All telemetry systems nominal.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="animate-in fade-in duration-500">
               {/* Question Review Terminal - Professional */}
               <div className="flex items-center justify-between mb-10 px-2">
                  <div className="flex items-center gap-4">
                     <button 
                       onClick={() => setSelectedReviewEmployee(null)}
                       className="w-8 h-8 bg-white border border-[#E3E6E8] rounded-lg flex items-center justify-center text-gray-400 hover:text-[#0074CC] transition-all shadow-sm"
                     >
                        <HiArrowPath className="rotate-180" size={16} />
                     </button>
                     <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-gray-400">Auditing</span>
                        <span className="text-gray-200">/</span>
                        <span className="text-[#0074CC]">{selectedReviewEmployee.name}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg border border-green-100 text-[9px] font-bold uppercase tracking-widest">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     Live Sync
                  </div>
               </div>

               <div className="flex flex-col gap-8">
                  {selectedReviewEmployee.questions.map((q) => (
                    <div key={q.id} className="bg-white border border-[#E3E6E8] rounded-lg shadow-sm overflow-hidden">
                        
                        {/* Meta Info Bar - High Density */}
                        <div className="bg-gray-50/50 border-b border-[#E3E6E8] px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                           <div className="flex items-center gap-3">
                              <HiTag size={14} className="text-gray-300" />
                              <div>
                                 <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Stack</div>
                                 <div className="text-[10px] font-bold text-[#0A1628] uppercase">{q.technologyName || "General"}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <HiChartBar size={14} className="text-gray-300" />
                              <div>
                                 <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Level</div>
                                 <div className="text-[10px] font-bold text-[#0A1628] uppercase">{q.difficulty || "Medium"}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <HiIdentification size={14} className="text-gray-300" />
                              <div>
                                 <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Packet ID</div>
                                 <div className="text-[10px] font-bold text-[#0A1628] uppercase truncate max-w-[80px]">{String(q.id).split('-')[0]}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <HiBriefcase size={14} className="text-gray-300" />
                              <div>
                                 <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Origin</div>
                                 <div className="text-[10px] font-bold text-[#0074CC] uppercase truncate max-w-[80px]">{q.clientName || "Vault"}</div>
                              </div>
                           </div>
                        </div>

                        <div className="p-6">
                           <div className="space-y-6 mb-8">
                              {/* Question Context - Tight */}
                              <div className="bg-[#F8F9F9] border-l-2 border-[#0074CC] px-6 py-5 rounded-r-lg">
                                 <div className="text-[8px] font-bold text-[#0074CC] uppercase tracking-widest mb-2 opacity-60">Submitted Intel</div>
                                 <h3 className="text-sm font-bold text-[#0A1628] leading-tight uppercase tracking-tight">{q.title}</h3>
                              </div>

                              {/* Source Content */}
                              <div className="space-y-2">
                                 <div className="flex items-center gap-2 text-gray-400 px-1">
                                    <HiDocumentText size={12} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Transmission Body</span>
                                 </div>
                                 <div className="p-5 bg-gray-50 border border-[#E3E6E8] rounded-lg">
                                    <p className="text-xs text-[#232629] leading-relaxed font-medium uppercase tracking-tight opacity-70">{q.content}</p>
                                 </div>
                              </div>

                              {/* Proposal Content */}
                              <div className="space-y-2">
                                 <div className="flex items-center gap-2 text-[#0074CC] px-1">
                                    <HiShieldCheck size={12} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Mastery Proposal</span>
                                 </div>
                                 <div className="p-5 bg-[#0074CC]/5 border border-[#0074CC]/10 rounded-lg">
                                    <p className="text-xs text-[#232629] leading-relaxed font-bold uppercase tracking-tight">
                                       {q.initialAnswer || "No documentation provided."}
                                    </p>
                                 </div>
                              </div>
                           </div>

                          {/* Action Terminal - Streamlined */}
                          <div className="space-y-6 pt-6 border-t border-[#F3F4F6]">
                             <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                   <div className="flex items-center gap-2 text-gray-400">
                                      <HiPencilSquare size={14} />
                                      <span className="text-[9px] font-bold uppercase tracking-widest">Verify Source Truth</span>
                                   </div>
                                </div>
                                <textarea
                                  placeholder="Compose the verified master intelligence packet..."
                                  value={correctedAnswers[q.id] || ""}
                                  onChange={(e) => setCorrectedAnswers({ ...correctedAnswers, [q.id]: e.target.value })}
                                  className="w-full p-4 bg-gray-50 border border-[#E3E6E8] rounded-lg text-xs text-[#232629] placeholder:text-gray-300 focus:bg-white focus:border-[#0074CC] outline-none transition-all font-medium"
                                  rows={2}
                                />
                             </div>

                             <div className="space-y-3">
                                <div className="flex items-center gap-2 text-gray-400 px-1">
                                   <HiChatBubbleLeftEllipsis size={14} />
                                   <span className="text-[9px] font-bold uppercase tracking-widest">Contributor Response Payload</span>
                                </div>
                                <textarea 
                                  value={comments[q.id] || ""}
                                  onChange={(e) => setComments({ ...comments, [q.id]: e.target.value })}
                                  className="w-full px-4 py-3 bg-gray-50 border border-[#E3E6E8] rounded-lg text-xs font-bold uppercase tracking-tight text-gray-500 placeholder:text-gray-200 outline-none focus:bg-white focus:border-[#0074CC] transition-all"
                                  placeholder="Technical feedback for the contributor network..."
                                  rows={1}
                                />
                             </div>

                             {/* Action Bar - Sharp */}
                             <div className="flex items-center justify-between pt-4">
                                <button 
                                  onClick={() => handleAction(q.id, 'REJECTED')}
                                  disabled={!!processing}
                                  className="flex items-center gap-2 px-6 py-2 rounded-lg border border-red-100 text-red-500 text-[9px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
                                >
                                   <HiTrash size={14} /> {processing === q.id + "REJECTED" ? 'REJECTING...' : 'Decommission Intel'}
                                </button>
                                <button 
                                  onClick={() => handleAction(q.id, 'APPROVED')}
                                  disabled={!!processing}
                                  className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-[#0074CC] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#0063AD] transition-all active:scale-95 shadow-sm"
                                >
                                   <HiCheckCircle size={14} /> {processing === q.id + "APPROVED" ? 'SYNCING...' : 'Verify & Broadcast'}
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
