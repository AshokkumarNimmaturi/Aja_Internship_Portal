import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Edit3, 
  MessageSquare, 
  CheckCircle, 
  PlusCircle, 
  Save, 
  X,
  Clock,
  ThumbsUp,
  Briefcase,
  FileText,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import TechBadge from "../../components/common/TechBadge";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import axiosInstance from "../../api/axiosInstance";
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
      const qRes = await axiosInstance.get(`/questions/${id}`);
      setQuestion(qRes.data);
      setEditForm({
        title: qRes.data.title,
        content: qRes.data.content,
        difficulty: qRes.data.difficulty,
        tags: qRes.data.tags || ""
      });

      const aRes = await axiosInstance.get(`/answers/${id}`);
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
      await axiosInstance.put(`/questions/${id}`, editForm);
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
      await axiosInstance.post(`/answers/${id}`, {
        content: newAnswerContent
      });
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
      <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <PortalSidebar user={user} role={user?.role || "EMPLOYEE"} activeItem="My Submissions" />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Top Bar */}
          <div className="mb-6 flex items-center justify-between">
            <Link to="/portal/submissions" className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#0A1628] transition-colors group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to History
            </Link>
            
            {canEdit && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-black/8 rounded-xl text-xs font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
              >
                <Edit3 size={14} /> Edit Submission
              </button>
            )}
          </div>

          {/* Question Display/Edit */}
          <div className="bg-white border border-black/8 rounded-3xl p-8 mb-8 shadow-sm">
            {isEditing ? (
              <form onSubmit={handleUpdateQuestion} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Question Title</label>
                  <input 
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-5 py-3 border border-black/8 rounded-xl text-lg font-bold text-[#0A1628] focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Question Details</label>
                  <textarea 
                    value={editForm.content}
                    onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                    rows={6}
                    className="w-full px-5 py-4 border border-black/8 rounded-xl text-sm text-gray-600 focus:border-blue-500 outline-none transition-all resize-none italic"
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-black/5">
                  <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-[#0A1628] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-md">
                    <Save size={14} /> Save Changes
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="font-serif text-3xl text-[#0A1628] leading-tight mb-3">{question.title}</h1>
                    <div className="flex items-center gap-3">
                      <TechBadge tech={question.technologyName} />
                      <DifficultyBadge difficulty={question.difficulty} />
                      {/* ✅ NEW: Client Name with Redaction support */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        question.clientName?.includes("REDACTED") 
                        ? "bg-gray-50 text-gray-400 border-black/5" 
                        : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}>
                        <Briefcase size={10} /> {question.clientName || "General Interview"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest border border-green-200">
                        <CheckCircle size={10} /> {question.status}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap italic border-l-4 border-l-blue-100 pl-4 py-2">
                  "{question.content}"
                </p>
                <div className="mt-6 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t border-black/5 pt-4">
                  <div className="flex items-center gap-2">
                    Submitted by <span className="text-[#0A1628]">{question.submittedByName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={12} /> {new Date(question.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Feedback Section (if any) */}
          {question.rejectionReason && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8 border-l-4 border-l-amber-400">
              <div className="flex items-center gap-2 mb-2 text-amber-700">
                <MessageSquare size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Reviewer Feedback</span>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed italic">"{question.rejectionReason}"</p>
            </div>
          )}

          {/* Discussion & Mastery Section */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-[#0A1628] mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-500" /> Mastery Discussion
            </h2>
            
            <div className="flex flex-col gap-6">
              {/* Proposed Answer (Original) */}
              <div className="bg-white border border-black/5 rounded-[32px] p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 group-hover:bg-blue-400 transition-colors" />
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-black/5">
                      <FileText size={14} />
                   </div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Proposed Explanation</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  {question.initialAnswer || "No initial explanation provided."}
                </p>
              </div>

              {/* Master Answer (Corrected) */}
              {question.correctedAnswer && (
                <div className="bg-[#0A1628] rounded-[32px] p-8 shadow-xl relative overflow-hidden group border border-white/5">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <ShieldCheck size={120} className="text-white" />
                  </div>
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                     <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-white/10">
                        <Zap size={14} />
                     </div>
                     <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Tutor Verified Master Answer</span>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed font-medium relative z-10">
                    {question.correctedAnswer}
                  </p>
                  <div className="mt-6 flex items-center gap-2 relative z-10">
                     <span className="px-3 py-1 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20">Official Sync</span>
                     <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest ml-1 italic">Published to Storefront</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Answers Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1628] mb-1">Expert Answers</h2>
                <p className="text-xs text-gray-400 italic">Historical solutions for this question</p>
              </div>
              <button 
                onClick={() => setShowAddAnswer(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                <PlusCircle size={14} /> Add One More Answer
              </button>
            </div>

            {/* Add Better Answer Modal/Form */}
            {showAddAnswer && (
              <div className="mb-8 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-blue-700 uppercase tracking-widest">Contribute a Better Response</h3>
                  <button onClick={() => setShowAddAnswer(false)} className="text-blue-400 hover:text-blue-600 transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <textarea 
                  placeholder="Explain the solution clearly and concisely..."
                  value={newAnswerContent}
                  onChange={(e) => setNewAnswerContent(e.target.value)}
                  rows={5}
                  className="w-full px-5 py-4 border border-blue-100 rounded-2xl text-sm text-gray-800 placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all resize-none shadow-sm"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button 
                    onClick={handleAddBetterAnswer}
                    disabled={submittingAnswer || !newAnswerContent.trim()}
                    className="px-6 py-2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {submittingAnswer ? "Posting..." : "Post Official Answer"}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-5">
              {answers.length > 0 ? answers.map((answer) => (
                <div key={answer.id} className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all ${answer.accepted ? 'border-green-200 border-l-4 border-l-green-500' : 'border-black/5'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm shadow-inner uppercase tracking-widest">
                        {answer.authorName?.charAt(0) || "A"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0A1628]">{answer.authorName || "Anonymous"}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{answer.accepted ? '✅ Verified Solution' : 'Expert Submission'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-black/5 text-gray-400">
                      <ThumbsUp size={12} />
                      <span className="text-xs font-bold">{answer.upvoteCount || 0}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-light">
                    {answer.content}
                  </p>
                </div>
              )) : (
                <div className="py-20 text-center bg-white border border-black/5 rounded-3xl shadow-sm">
                   <div className="text-4xl mb-4">💡</div>
                   <h3 className="text-lg font-bold text-[#0A1628] mb-1">No answers yet</h3>
                   <p className="text-sm text-gray-400 italic">Be the first to provide a champion response!</p>
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
