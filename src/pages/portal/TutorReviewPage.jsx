import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Star, RefreshCw, Clock } from "lucide-react";
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
  const [activeFilter, setActiveFilter] = useState("All");
  const [processing, setProcessing] = useState(null);
  const [loadingQ, setLoadingQ] = useState(true);

  const techFilters = [
    "All", "Java", "Spring Boot", "React", "JavaScript", "SQL", "DevOps", "Python", "Salesforce",
  ];

  // Fetch PENDING questions — try multiple endpoint patterns the backend might use
  const fetchQuestions = useCallback(async () => {
    setLoadingQ(true);
    try {
      let data = [];

      // Strategy 1: dedicated pending endpoint
      try {
        const res = await axiosInstance.get("/questions/pending");
        const raw = res.data;
        data = Array.isArray(raw) ? raw : (raw.content || raw.data || []);
      } catch {
        // Strategy 2: filter by status query param
        try {
          const res = await axiosInstance.get("/questions?status=PENDING");
          const raw = res.data;
          data = Array.isArray(raw) ? raw : (raw.content || raw.data || []);
        } catch {
          // Strategy 3: get all and filter client-side
          const res = await axiosInstance.get("/questions");
          const raw = res.data;
          const all = Array.isArray(raw) ? raw : (raw.content || raw.data || []);
          data = all.filter(
            (q) => !q.status || q.status === "PENDING" || q.status === "pending"
          );
        }
      }

      setQuestions(data);
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

  // Normalise technology field — can be string or object
  const getTech = (q) => {
    if (!q) return "";
    if (typeof q.technology === "string") return q.technology;
    if (q.technology?.name) return q.technology.name;
    if (q.technologyName) return q.technologyName;
    return "";
  };

  // Normalise body/description field
  const getBody = (q) =>
    q.content || q.description || q.body || q.details || "";

  // Normalise submitter name
  const getSubmitter = (q) =>
    q.submitted_by || q.submittedBy || q.createdBy || q.authorName || q.employee?.fullName || "";

  const filtered =
    activeFilter === "All"
      ? questions
      : questions.filter((q) => getTech(q) === activeFilter);

  const handleAction = async (id, action) => {
    setProcessing(id + action);
    try {
      // Try multiple endpoint patterns the backend may use
      try {
        await axiosInstance.put(`/questions/${id}/review`, {
          status: action,
          decision: action,
          comment: comments[id] || "",
          rejection_reason: comments[id] || "",
          rating: ratings[id] || 0,
          reviewd_by: user?.id || user?.userId,
        });
      } catch {
        // Fallback: PATCH endpoint
        await axiosInstance.patch(`/questions/${id}`, {
          status: action,
          rejection_reason: comments[id] || "",
          reviewd_by: user?.id || user?.userId,
        });
      }
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

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-serif text-3xl text-[#0A1628]">Pending Reviews</h1>
                {!loadingQ && questions.length > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
                    {questions.length} pending
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 font-light">
                Review, rate and approve or reject submitted questions.
              </p>
            </div>
            <button
              onClick={fetchQuestions}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 border border-black/10 rounded-xl hover:bg-gray-50 transition-all"
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
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeFilter === tech
                    ? "bg-[#0A1628] text-white shadow-sm"
                    : "bg-white border border-black/10 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loadingQ ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-black/5 rounded-2xl shadow-sm">
              <RefreshCw className="animate-spin text-gray-300 mb-4" size={32} />
              <p className="text-gray-400 text-sm">Loading pending questions...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="flex flex-col gap-5">
              {filtered.map((q) => (
                <div
                  key={q.id}
                  className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-4">
                      <h3 className="font-bold text-[#0A1628] text-base leading-snug">{q.title}</h3>
                      {getSubmitter(q) && (
                        <p className="text-xs text-gray-400 mt-1">
                          Submitted by <span className="font-semibold text-gray-600">{getSubmitter(q)}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <TechBadge tech={getTech(q)} />
                      <DifficultyBadge difficulty={q.difficulty} />
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                        <Clock size={10} /> Pending
                      </span>
                    </div>
                  </div>

                  {/* Question body */}
                  {getBody(q) && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-4 bg-gray-50 rounded-xl p-3 border border-black/5">
                      {getBody(q)}
                    </p>
                  )}

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    <span className="text-xs font-semibold text-gray-400 mr-2 uppercase tracking-wide">
                      Rate:
                    </span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRatings({ ...ratings, [q.id]: s })}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star
                          size={18}
                          className={
                            s <= (ratings[q.id] || 0)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200 fill-gray-200"
                          }
                        />
                      </button>
                    ))}
                    {ratings[q.id] && (
                      <span className="text-xs text-amber-500 font-semibold ml-2">
                        {ratings[q.id]}/5
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  <input
                    placeholder="Add a reviewer comment (optional)..."
                    value={comments[q.id] || ""}
                    onChange={(e) =>
                      setComments({ ...comments, [q.id]: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-black/10 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all mb-4"
                  />

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(q.id, "REJECTED")}
                      disabled={!!processing}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-semibold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      {processing === q.id + "REJECTED" ? "Rejecting..." : "Reject"}
                    </button>
                    <button
                      onClick={() => handleAction(q.id, "APPROVED")}
                      disabled={!!processing}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-semibold hover:bg-green-500 hover:text-white hover:border-green-500 transition-all disabled:opacity-50"
                    >
                      <CheckCircle size={15} />
                      {processing === q.id + "APPROVED" ? "Approving..." : "Approve"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-black/5 rounded-2xl shadow-sm text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-lg font-bold text-[#0A1628] mb-2">All caught up!</h3>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-4">
                {activeFilter === "All"
                  ? "There are no pending questions to review right now."
                  : `No pending "${activeFilter}" questions. Try a different filter.`}
              </p>
              <button
                onClick={fetchQuestions}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 border border-black/10 rounded-xl hover:bg-gray-50 transition-all"
              >
                <RefreshCw size={14} /> Check Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TutorReviewPage;
