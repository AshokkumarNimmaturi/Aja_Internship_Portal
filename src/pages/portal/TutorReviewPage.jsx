import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Star, RefreshCw, Clock, Edit3, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import TechBadge from "../../components/common/TechBadge";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";

const TutorReviewPage = () => {
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [comments, setComments] = useState({});
  const [ratings, setRatings] = useState({});
  const [correctedAnswers, setCorrectedAnswers] = useState({}); // ✅ ADDED: Track edits to the answer
  const [activeFilter, setActiveFilter] = useState("All");
  const [processing, setProcessing] = useState(null);
  const [loadingQ, setLoadingQ] = useState(true);

  const techFilters = [
    "All", "Java", "Spring Boot", "React", "JavaScript", "SQL", "DevOps", "Python", "Salesforce",
  ];

  // Fetch PENDING questions
  const fetchQuestions = useCallback(async () => {
    setLoadingQ(true);
    try {
      let data = [];
      const res = await axiosInstance.get("/questions/pending");
      const raw = res.data;
      data = Array.isArray(raw) ? raw : (raw.content || raw.data || []);

      setQuestions(data);

      // ✅ Initialize corrected answers with whatever the employee submitted
      const initialMap = {};
      data.forEach(q => {
        if (q.initialAnswer) initialMap[q.id] = q.initialAnswer;
      });
      setCorrectedAnswers(initialMap);

    } catch (err) {
      toast.error("Failed to load pending questions");
      console.error("fetchQuestions error:", err);
    } finally {
      setLoadingQ(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const getTech = (q) => {
    if (!q) return "";
    if (typeof q.technology === "string") return q.technology;
    if (q.technology?.name) return q.technology.name;
    if (q.technologyName) return q.technologyName;
    return "";
  };

  const getBody = (q) => q.content || q.description || q.body || q.details || "";

  const getSubmitter = (q) =>
    q.submitted_by || q.submittedBy || q.createdBy || q.authorName || q.submittedByName || "";

  const filtered =
    activeFilter === "All"
      ? questions
      : questions.filter((q) => getTech(q) === activeFilter);

  const handleAction = async (id, action) => {
    setProcessing(id + action);
    try {
      await axiosInstance.put(`/questions/${id}/review`, {
        decision: action,
        rejectionReason: comments[id] || "",
        correctedAnswer: correctedAnswers[id] || "", // ✅ Sent to backend to update the Answer record
        rating: ratings[id] || 0,
      });

      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success(
        `Question ${action === "APPROVED" ? "approved ✓" : "rejected"} successfully`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PortalSidebar user={user} role={user?.role || "TUTOR"} activeItem="Pending Review" />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-serif text-3xl text-[#0A1628]">Review Hub</h1>
                {!loadingQ && questions.length > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
                    {questions.length} pending
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 font-light italic">
                Polishing and approving community contributions.
              </p>
            </div>
            <button
              onClick={fetchQuestions}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 border border-black/10 rounded-xl hover:bg-gray-50 transition-all font-sans"
            >
              <RefreshCw size={14} className={loadingQ ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Tech Filters */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {techFilters.map((tech) => (
              <button
                key={tech}
                onClick={() => setActiveFilter(tech)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeFilter === tech
                    ? "bg-[#0A1628] text-white shadow-md shadow-[#0A1628]/20"
                    : "bg-white border border-black/8 text-gray-400 hover:bg-gray-50"
                  }`}
              >
                {tech}
              </button>
            ))}
          </div>

          {/* List */}
          {loadingQ ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-black/5 rounded-2xl shadow-sm">
              <RefreshCw className="animate-spin text-gray-200 mb-4" size={32} />
              <p className="text-gray-400 text-sm italic">Scanning for new submissions...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="flex flex-col gap-6">
              {filtered.map((q) => (
                <div
                  key={q.id}
                  className="bg-white border border-black/5 rounded-3xl p-7 shadow-sm hover:shadow-md transition-all border-l-4 border-l-amber-400"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1 pr-4">
                      <h3 className="font-bold text-[#0A1628] text-lg leading-tight mb-2">{q.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-black/5 italic">
                          By {getSubmitter(q) || "Member"}
                        </span>
                        <TechBadge tech={getTech(q)} />
                        <DifficultyBadge difficulty={q.difficulty} />
                      </div>
                    </div>
                  </div>

                  {/* Submission Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-black/5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Question Details</span>
                      <p className="text-sm text-gray-600 leading-relaxed italic">"{getBody(q)}"</p>
                    </div>
                    <div className="bg-blue-50/30 rounded-2xl p-4 border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 block">Employee's Proposed Answer</span>
                      <p className="text-sm text-blue-700/80 leading-relaxed italic">
                        {q.initialAnswer ? `"${q.initialAnswer}"` : "No answer provided."}
                      </p>
                    </div>
                  </div>

                  {/* Reviewer Editor */}
                  <div className="bg-white border-2 border-dashed border-blue-100 rounded-2xl p-5 mb-6">
                    <div className="flex items-center gap-2 mb-3 text-blue-600">
                      <Edit3 size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Final Polish (Official Answer)</span>
                    </div>
                    <textarea
                      placeholder="Polish or correct the answer here..."
                      value={correctedAnswers[q.id] || ""}
                      onChange={(e) => setCorrectedAnswers({ ...correctedAnswers, [q.id]: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-black/5 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-5">
                    <span className="text-xs font-bold text-gray-400 mr-2 uppercase tracking-wide">Quality:</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setRatings({ ...ratings, [q.id]: s })} className="hover:scale-110 transition-transform">
                        <Star size={18} className={s <= (ratings[q.id] || 0) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                      </button>
                    ))}
                  </div>

                  {/* Comment */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                      <MessageSquare size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Internal Feedback</span>
                    </div>
                    <input
                      placeholder="Add a reason for rejection or a word of praise..."
                      value={comments[q.id] || ""}
                      onChange={(e) => setComments({ ...comments, [q.id]: e.target.value })}
                      className="w-full px-4 py-2.5 border border-black/10 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-blue-300 transition-all shadow-sm"
                    />
                  </div>

                  {/* Final Actions */}
                  <div className="flex gap-3 pt-5 border-t border-black/5 font-sans">
                    <button
                      onClick={() => handleAction(q.id, "REJECTED")}
                      disabled={!!processing}
                      className="flex-1 py-3 px-6 rounded-xl bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100"
                    >
                      {processing === q.id + "REJECTED" ? "Rejecting..." : "Reject Submission"}
                    </button>
                    <button
                      onClick={() => handleAction(q.id, "APPROVED")}
                      disabled={!!processing}
                      className="flex-[2] py-3 px-6 rounded-xl bg-[#0A1628] text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/10"
                    >
                      {processing === q.id + "APPROVED" ? "Approving..." : "Approve & Publish Answer"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-black/5 rounded-2xl shadow-sm text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-lg font-bold text-[#0A1628] mb-2">Review Queue Empty</h3>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-6 font-light">
                {activeFilter === "All"
                  ? "Great job! All submitted questions have been reviewed and processed."
                  : `No pending "${activeFilter}" questions in the queue.`}
              </p>
              <button onClick={fetchQuestions} className="px-6 py-2.5 bg-gray-50 text-[#0A1628] border border-black/8 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all font-sans">
                Refresh Queue
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TutorReviewPage;
