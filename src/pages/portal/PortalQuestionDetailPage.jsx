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
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      <PortalSidebar user={user} role={user?.role || "EMPLOYEE"} activeItem="My Submissions" />

      <main className="flex-1 p-8 py-10 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto">
          {/* Top Bar - Minimalist */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#0074CC] transition-colors group"
              >
                <HiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
              </button>
              
              <Link to="/portal/submissions" className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#0074CC] transition-colors group border-l border-gray-200 pl-6">
                History Sync
              </Link>
            </div>
            
            {canEdit && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2 bg-white border border-[#E3E6E8] rounded-lg text-[9px] font-bold uppercase tracking-widest text-[#0074CC] hover:bg-white/80 transition-all active:scale-95 shadow-sm"
              >
                <HiPencilSquare size={14} /> Refine Entry
              </button>
            )}
          </div>

          {/* Question Display/Edit - Professional */}
          <div className="bg-white border border-[#E3E6E8] rounded-lg p-6 mb-8 shadow-sm">
            {isEditing ? (
              <form onSubmit={handleUpdateQuestion} className="space-y-6">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5">Core Requirement</label>
                  <input 
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-[#E3E6E8] rounded-lg text-sm font-bold text-[#0A1628] focus:border-[#0074CC] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5">Technical Context</label>
                  <textarea 
                    value={editForm.content}
                    onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-[#E3E6E8] rounded-lg text-xs text-[#232629] focus:border-[#0074CC] outline-none transition-all resize-none leading-relaxed font-medium"
                  />
                </div>
                <div className="flex gap-3 pt-6 border-t border-[#F3F4F6]">
                  <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-[#0A1628] text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all active:scale-95">
                    <HiDocumentCheck size={14} /> Commit Changes
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-400 text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-all active:scale-95">
                    <HiXMark size={14} /> Abort
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-xl font-sans font-bold text-[#0A1628] leading-tight mb-4">{question.title}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <TechBadge tech={question.technologyName} className="!rounded-lg !text-[9px]" />
                      <DifficultyBadge difficulty={question.difficulty} />
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-400 border border-[#E3E6E8] rounded-lg text-[9px] font-bold uppercase tracking-widest">
                        <HiBriefcase size={10} /> {question.clientName || "General Intake"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#0074CC] text-[9px] font-bold uppercase tracking-widest border border-[#0074CC]/10 rounded-lg">
                        <HiCheckCircle size={10} /> {question.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F8F9F9] p-5 rounded-lg border border-[#E3E6E8] mb-8">
                  <p className="text-[#232629] text-sm leading-relaxed whitespace-pre-wrap font-sans font-medium">
                    {question.content}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold uppercase tracking-widest border-t border-[#F3F4F6] pt-4">
                  <div className="flex items-center gap-2">
                    Source: <span className="text-[#0A1628]">{question.submittedByName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiClock size={12} className="text-gray-300" /> {new Date(question.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Feedback Section - Compact */}
          {question.rejectionReason && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8 border-l-4 border-l-amber-400 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold">
                <HiChatBubbleLeftEllipsis size={16} />
                <span className="text-[9px] uppercase tracking-widest">Reviewer Feedback</span>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed font-sans font-bold tracking-tight opacity-90">{question.rejectionReason}</p>
            </div>
          )}

          {/* Discussion & Mastery Section */}
          <div className="mb-10">
            <h2 className="text-sm font-bold text-[#0A1628] mb-6 flex items-center gap-2 uppercase tracking-widest">
              Knowledge Verification
            </h2>
            
            <div className="flex flex-col gap-4">
              {/* Proposed Answer */}
              <div className="bg-white border border-[#E3E6E8] rounded-lg p-5 shadow-sm relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 border border-[#E3E6E8] shadow-inner">
                      <HiDocumentText size={14} />
                   </div>
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Submission Explanation</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-sans font-medium tracking-tight">
                  {question.initialAnswer || "Zero documentation provided."}
                </p>
              </div>

              {/* Master Answer Section — High Tension */}
              {question.officialAnswer && (
                <div className="bg-[#0A1628] rounded-lg p-7 shadow-sm border border-white/5 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-white/5">
                        <HiBolt size={14} />
                     </div>
                     <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Verified Master Solution</span>
                  </div>
                  <p className="text-base text-white/95 leading-relaxed font-sans font-bold tracking-tight">
                    {question.officialAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Expert Answers Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold text-[#0A1628] uppercase tracking-widest">Peer Verification ({answers.length})</h2>
              <button 
                onClick={() => setShowAddAnswer(true)}
                className="flex items-center gap-2 px-6 py-2 bg-[#0074CC] text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#0063AD] transition-all active:scale-95 shadow-sm"
              >
                <HiPlusCircle size={14} /> Publish Solution
              </button>
            </div>

            {/* Add Better Answer Modal - High Density */}
            {showAddAnswer && (
              <div className="mb-8 bg-blue-50 border border-[#0074CC]/20 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <HiPencilSquare size={16} className="text-[#0074CC]" />
                    <h3 className="text-[10px] font-bold text-[#0074CC] uppercase tracking-widest">Add Expert Intelligence</h3>
                  </div>
                  <button onClick={() => setShowAddAnswer(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <HiXMark size={16} />
                  </button>
                </div>
                <textarea 
                  placeholder="Provide technical specifics..."
                  value={newAnswerContent}
                  onChange={(e) => setNewAnswerContent(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-[#E3E6E8] rounded-lg text-xs text-[#232629] focus:outline-none focus:border-[#0074CC] transition-all resize-none font-medium"
                />
                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleAddBetterAnswer}
                    disabled={submittingAnswer || !newAnswerContent.trim()}
                    className="px-6 py-2 bg-[#0074CC] text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#0063AD] transition-all disabled:opacity-50 active:scale-95"
                  >
                    {submittingAnswer ? "Syncing..." : "Sync Official Answer"}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {answers.length > 0 ? answers.map((answer) => (
                <div key={answer.id} className={`bg-white border rounded-lg p-6 shadow-sm group ${answer.accepted ? 'border-[#0074CC] bg-blue-50/5' : 'border-[#E3E6E8]'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-xs border border-[#E3E6E8] uppercase">
                        {answer.authorName?.charAt(0) || "A"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0A1628] mb-0.5">{answer.authorName || "Anonymous Contributor"}</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-gray-300">
                           {answer.accepted ? <span className="text-[#0074CC] flex items-center gap-1"><HiCheckCircle /> Verified Key</span> : 'Community Insight'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       {!answer.accepted && ["ADMIN", "TUTOR"].includes(user?.role?.toUpperCase()) && (
                         <button 
                           onClick={async () => {
                             try {
                               await setOfficialAnswer(id, { officialAnswer: answer.content });
                               toast.success("Mastered! 🛡️");
                               fetchData();
                             } catch(err) {
                               toast.error("Process failed");
                             }
                           }}
                           className="px-3 py-1.5 bg-[#0074CC]/5 hover:bg-[#0074CC]/10 text-[#0074CC] rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5"
                         >
                           <HiCheckCircle size={12} /> Masterize
                         </button>
                       )}
                       <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-[#E3E6E8] text-gray-400 shadow-sm">
                         <HiHandThumbUp size={12} className={answer.upvotedByCurrentUser ? "text-[#0074CC] fill-[#0074CC]" : ""} />
                         <span className="text-[9px] font-bold font-mono">{answer.upvoteCount || 0}</span>
                       </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#232629] leading-relaxed font-sans font-medium tracking-tight border-l-2 border-[#F3F4F6] pl-4">
                    {answer.content}
                  </p>
                </div>
              )) : (
                <div className="py-20 text-center bg-white border border-[#E3E6E8] border-dashed rounded-lg shadow-sm">
                   <h3 className="text-sm font-bold text-[#0A1628] mb-1 uppercase tracking-widest">Knowledge Gap Detected</h3>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verify this intel packet by providing a solution.</p>
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
