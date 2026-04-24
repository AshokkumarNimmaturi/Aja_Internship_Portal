import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
// ✅ UPGRADED: Using elite Heroicons 2
import { 
  HiArrowLeft, 
  HiPencilSquare, 
  HiChatBubbleLeftEllipsis, 
  HiCheckCircle, 
  HiPlusCircle, 
  HiDocumentCheck, 
  HiXMark,
  HiClock,
  HiHandThumbUp,
  HiBriefcase,
  HiDocumentText,
  HiShieldCheck,
  HiBolt,
  HiArrowPath
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import TechBadge from "../../components/common/TechBadge";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import { 
  fetchQuestionById, 
  getQuestionAnswers, 
  updateQuestion, 
  setOfficialAnswer, 
  submitAnswer 
} from "../../api/questionApi";
import toast from "react-hot-toast";

const PortalQuestionDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit mode for Question
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    difficulty: "",
    tags: ""
  });

  // Adding new answer
  const [showAddAnswer, setShowAddAnswer] = useState(false);
  const [newAnswerContent, setNewAnswerContent] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const qRes = await fetchQuestionById(id);
      setQuestion(qRes.data);
      setEditForm({
        title: qRes.data.title,
        content: qRes.data.content,
        difficulty: qRes.data.difficulty,
        tags: qRes.data.tags || ""
      });

      const aRes = await getQuestionAnswers(id);
      setAnswers(aRes.data);
    } catch (error) {
      console.error("Failed to fetch details:", error);
      toast.error("Could not find question details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      await updateQuestion(id, editForm);
      toast.success("Question updated successfully! 🦾");
      setIsEditing(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update question");
    }
  };

  const handleAddBetterAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswerContent.trim()) return;

    setSubmittingAnswer(true);
    try {
      await submitAnswer(id, { content: newAnswerContent });
      toast.success("Better answer added! 🏆");
      setNewAnswerContent("");
      setShowAddAnswer(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to add answer");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <HiArrowPath className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  );

  if (!question) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Question not found</h2>
      <Link to="/portal/submissions" className="text-blue-600 underline">Back to Submissions</Link>
    </div>
  );

  const canEdit = user?.email === question.submittedByEmail || 
                  ["TUTOR", "ADMIN"].includes(user?.role?.toUpperCase());

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden portal-modern">
      <PortalSidebar user={user} role={user?.role || "EMPLOYEE"} activeItem="My Submissions" />

      <main className="flex-1 p-8 py-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Top Bar */}
          <div className="mb-6 flex items-center justify-between">
            <Link to="/portal/submissions" className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#0A1628] transition-colors group">
              <HiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to History
            </Link>
            
            {canEdit && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-black/8 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
              >
                <HiPencilSquare size={16} /> Edit Submission
              </button>
            )}
          </div>

          {/* Question Display/Edit */}
          <div className="bg-white border border-black/8 rounded-[40px] p-8 mb-8 shadow-sm">
            {isEditing ? (
              <form onSubmit={handleUpdateQuestion} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Question Title</label>
                  <input 
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-black/5 rounded-2xl text-xl font-bold text-[#0A1628] focus:border-blue-500 focus:ring-8 focus:ring-blue-50/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Question Details</label>
                  <textarea 
                    value={editForm.content}
                    onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                    rows={6}
                    className="w-full px-5 py-5 bg-gray-50 border border-black/5 rounded-2xl text-sm text-gray-600 focus:border-blue-500 focus:ring-8 focus:ring-blue-50/50 outline-none transition-all resize-none italic font-light leading-relaxed"
                  />
                </div>
                <div className="flex gap-3 pt-6 border-t border-black/5">
                  <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-[#0A1628] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 active:scale-95">
                    <HiDocumentCheck size={16} /> Save Changes
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-8 py-3 bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all active:scale-95">
                    <HiXMark size={16} /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="font-serif text-3xl text-[#0A1628] leading-tight mb-4">{question.title}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <TechBadge tech={question.technologyName} />
                      <DifficultyBadge difficulty={question.difficulty} />
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${
                        question.clientName?.includes("REDACTED") 
                        ? "bg-gray-50 text-gray-400 border-black/5" 
                        : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}>
                        <HiBriefcase size={12} /> {question.clientName || "General Interview"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest border border-green-200">
                        <HiCheckCircle size={12} /> {question.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-black/5 mb-8">
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap italic font-light">
                    "{question.content}"
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t border-black/5 pt-4">
                  <div className="flex items-center gap-2">
                    Submitted by <span className="text-[#0A1628]">{question.submittedByName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiClock size={14} className="text-gray-300" /> {new Date(question.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Feedback Section */}
          {question.rejectionReason && (
            <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 mb-8 border-l-8 border-l-amber-400 shadow-sm animate-in slide-in-from-left duration-500">
              <div className="flex items-center gap-2 mb-3 text-amber-700 font-bold">
                <HiChatBubbleLeftEllipsis size={20} />
                <span className="text-xs uppercase tracking-widest">Reviewer Feedback</span>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed italic font-medium">"{question.rejectionReason}"</p>
            </div>
          )}

          {/* Discussion & Mastery Section */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-[#0A1628] mb-6 flex items-center gap-2 font-serif">
              <HiChatBubbleLeftEllipsis size={24} className="text-blue-500" /> Mastery Discussion
            </h2>
            
            <div className="flex flex-col gap-6">
              {/* Proposed Answer */}
              <div className="bg-white border border-black/8 rounded-[40px] p-8 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-100 group-hover:bg-blue-400 transition-colors" />
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 border border-black/5 shadow-inner">
                      <HiDocumentText size={20} />
                   </div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Initial Intel Explanation</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic font-light font-sans">
                  {question.initialAnswer || "No initial explanation provided."}
                </p>
              </div>

              {/* Master Answer Section — Elite Sync: officialAnswer */}
              {question.officialAnswer && (
                <div className="bg-[#0A1628] rounded-[40px] p-9 shadow-2xl relative overflow-hidden group border border-white/5 animate-in zoom-in duration-500">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <HiShieldCheck size={160} className="text-white" />
                  </div>
                  <div className="flex items-center gap-3 mb-5 relative z-10">
                     <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-white/10 shadow-lg">
                        <HiBolt size={20} />
                     </div>
                     <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em]">Verified Master Answer</span>
                  </div>
                  <p className="text-base text-white/95 leading-relaxed font-medium relative z-10 italic">
                    "{question.officialAnswer}"
                  </p>
                  <div className="mt-8 flex items-center gap-3 relative z-10">
                     <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-blue-600/30">Vault Sync Active</span>
                     <div className="h-1 flex-1 bg-white/5 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expert Answers Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#0A1628] mb-1 font-serif">Community Knowledge</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mastery Benchmarking ({answers.length})</p>
              </div>
              <button 
                onClick={() => setShowAddAnswer(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
              >
                <HiPlusCircle size={18} /> Contribute Answer
              </button>
            </div>

            {/* Add Better Answer Modal */}
            {showAddAnswer && (
              <div className="mb-10 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-[40px] p-8 shadow-sm animate-in fade-in slide-in-from-top-6 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm">
                      <HiPencilSquare size={20} />
                    </div>
                    <h3 className="text-sm font-black text-blue-700 uppercase tracking-widest">Contribute Expert Response</h3>
                  </div>
                  <button onClick={() => setShowAddAnswer(false)} className="w-8 h-8 flex items-center justify-center text-blue-300 hover:text-blue-600 transition-colors bg-white rounded-full shadow-sm">
                    <HiXMark size={18} />
                  </button>
                </div>
                <textarea 
                  placeholder="Explain the technical concepts, best practices, and efficient solution correctly..."
                  value={newAnswerContent}
                  onChange={(e) => setNewAnswerContent(e.target.value)}
                  rows={6}
                  className="w-full px-6 py-5 bg-white border border-blue-100 rounded-3xl text-sm text-gray-800 placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:ring-8 focus:ring-blue-100/50 transition-all resize-none shadow-inner leading-relaxed"
                />
                <div className="flex justify-end pt-6">
                  <button 
                    onClick={handleAddBetterAnswer}
                    disabled={submittingAnswer || !newAnswerContent.trim()}
                    className="px-8 py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-50 active:scale-95"
                  >
                    {submittingAnswer ? "Publishing..." : "Post Official Submission"}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-6">
              {answers.length > 0 ? answers.map((answer) => (
                <div key={answer.id} className={`bg-white border rounded-[32px] p-7 shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${answer.accepted ? 'border-green-200 ring-2 ring-green-100' : 'border-black/5'}`}>
                  {answer.accepted && <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 flex items-center justify-center font-black text-sm shadow-inner uppercase tracking-widest border border-black/5">
                        {answer.authorName?.charAt(0) || "A"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0A1628] mb-0.5">{answer.authorName || "Anonymous Contributor"}</div>
                        <div className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-300">
                           {answer.accepted ? <span className="text-green-500 flex items-center gap-1"><HiCheckCircle /> Verified Master Solution</span> : 'Expert Submission'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       {/* Elite Feature: Promote To Master */}
                       {!answer.accepted && ["ADMIN", "TUTOR"].includes(user?.role?.toUpperCase()) && (
                         <button 
                           onClick={async () => {
                             try {
                               await setOfficialAnswer(id, { officialAnswer: answer.content });
                               toast.success("Response promoted to Master Answer! 🛡️");
                               fetchData();
                             } catch(err) {
                               toast.error("Failed to promote answer");
                             }
                           }}
                           className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5"
                         >
                           <HiCheckCircle size={14} /> Promote as Master
                         </button>
                       )}
                       <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-black/5 text-gray-400 shadow-inner group-hover:bg-white transition-colors duration-300">
                         <HiHandThumbUp size={14} className={answer.upvotedByCurrentUser ? "text-blue-500 fill-blue-500" : ""} />
                         <span className="text-[10px] font-bold font-mono tracking-tighter">{answer.upvoteCount || 0}</span>
                       </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-light font-sans pl-2 border-l border-black/5">
                    {answer.content}
                  </p>
                </div>
              )) : (
                <div className="py-24 text-center bg-white border border-black/5 border-dashed rounded-[50px] shadow-sm">
                   <div className="text-5xl mb-6 grayscale opacity-40">💡</div>
                   <h3 className="text-xl font-bold text-[#0A1628] mb-2 font-serif">Awaiting Champion Response</h3>
                   <p className="text-sm text-gray-400 italic font-light max-w-xs mx-auto">This intel packet is awaiting technical verification. Be the first to provide a mastery solution.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PortalQuestionDetailPage;
