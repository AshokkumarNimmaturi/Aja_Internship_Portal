import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, ThumbsUp, Star } from "lucide-react";
import TechBadge from "../../components/common/TechBadge";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/subscriber/Sidebar";

const QuestionDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);
  const [newAnswer, setNewAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const fetchQuestion = async () => {
    try {
      const res = await axiosInstance.get(`/questions/${id}`);
      setQuestion(res.data);
    } catch (error) {
      console.error("Failed to fetch question detail", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    setSubmittingAnswer(true);
    try {
      await axiosInstance.post(`/questions/${id}/answers`, {
        text: newAnswer,
        content: newAnswer,
        user_id: user?.id || user?.userId,
      });
      toast.success("Answer posted successfully!");
      setNewAnswer("");
      fetchQuestion(); // reload to show new answer
    } catch (err) {
      toast.error("Failed to post answer");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <p className="text-gray-500 animate-pulse text-sm">Loading question details...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Question not found</h2>
        <Link to="/dashboard" className="text-blue-600 underline">Back to Dashboard</Link>
      </div>
    );
  }

  // Answer handling — fall back to empty list if no answers yet
  const displayAnswers = question.answers || [];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar />

      {/* Main */}
      <main className="flex-1 p-8 h-screen overflow-y-auto max-w-4xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link
            to="/dashboard"
            className="hover:text-gray-600 transition-colors"
          >
            Dashboard
          </Link>
          <span>/</span>
          <Link
            to="/dashboard"
            className="hover:text-gray-600 transition-colors"
          >
            My Questions
          </Link>
          <span>/</span>
          <span className="text-gray-600">Question #{id}</span>
        </div>

        {/* Question Header */}
        <div className="bg-white border border-black/8 rounded-2xl p-7 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="font-serif text-2xl text-[#0A1628] leading-snug flex-1">
              {question.title}
            </h1>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className="shrink-0 p-2 rounded-xl border border-black/8 hover:border-blue-100 transition-all"
            >
              <Bookmark
                size={16}
                className={
                  bookmarked ? "text-[#2563EB] fill-[#2563EB]" : "text-gray-300"
                }
              />
            </button>
          </div>

          {/* Meta Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <TechBadge tech={question.technology?.name || question.technology || "Technology"} />
            <DifficultyBadge difficulty={question.difficulty} />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={12}
                  className={
                    s <= Math.floor(question.rating || 0)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200 fill-gray-200"
                  }
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">
                {question.rating || "No ratings"}
              </span>
            </div>
            {question.status === "REJECTED" && (
               <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-red-100">Rejected</span>
            )}
            {question.status === "PENDING" && (
               <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-amber-100">Review Pending</span>
            )}
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white border border-black/8 rounded-2xl p-7 mb-5 shadow-sm">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Question Details</h3>
           <div className="text-[#0A1628] leading-relaxed whitespace-pre-wrap text-sm">
             {question.content}
           </div>
        </div>

        {/* Tutor Comment / Rejection Reason */}
        {(question.rejection_reason || question.comment) && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-5 border-l-4 border-l-[#2563EB]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#0A1628] text-white text-xs font-semibold flex items-center justify-center shrink-0 uppercase">
                {question.reveiwed_by?.charAt(0) || "T"}
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0A1628]">
                  Tutor Feedback
                </div>
                <div className="text-xs text-[#2563EB]">Status: {question.status}</div>
              </div>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed font-light italic">
              "{question.rejection_reason || question.comment}"
            </p>
          </div>
        )}

        {/* Answers Section */}
        <div className="bg-white border border-black/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#0A1628]">
              {displayAnswers.length} Answers
            </h2>
            <span className="text-xs px-3 py-1 bg-gray-50 border border-black/5 text-gray-400 rounded-full">
              Most upvoted first
            </span>
          </div>

          <div className="flex flex-col gap-5">
            {displayAnswers.length > 0 ? (
              displayAnswers.slice(0, visibleCount).map((answer, i) => (
                <div
                  key={answer.id || i}
                  className="border border-black/5 rounded-xl p-5 hover:border-blue-50 transition-all"
                >
                  {/* Answer Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 text-xs font-semibold flex items-center justify-center">
                        {answer.user?.charAt(0) || "A"}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-[#0A1628]">
                          {answer.user || "Anonymous"}
                        </div>
                        <div className="text-xs text-gray-400">{answer.created_at || "Just now"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Answer Text */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {answer.text || answer.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-5">No answers yet for this question.</p>
            )}
          </div>

          {/* Load More */}
          {visibleCount < displayAnswers.length && (
            <button
              onClick={() => setVisibleCount(displayAnswers.length)}
              className="w-full mt-5 py-3 border border-black/8 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all"
            >
              Load {displayAnswers.length - visibleCount} more answers
            </button>
          )}
        </div>

        {/* Add Answer Form — for portal roles */}
        {["ADMIN", "TUTOR", "EMPLOYEE"].includes(user?.role?.toUpperCase()) && (
          <div className="mt-6 bg-white border border-black/8 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Contribute an Answer</h3>
            <form onSubmit={handlePostAnswer}>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Share your knowledge or experience with this question..."
                required
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all min-h-[120px] resize-none"
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={submittingAnswer || !newAnswer.trim()}
                  className="px-6 py-2.5 bg-[#0A1628] text-white text-xs font-semibold rounded-xl hover:bg-[#0F2340] transition-all disabled:opacity-50"
                >
                  {submittingAnswer ? "Posting..." : "Post Answer"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Back Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mt-6"
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>
      </main>
    </div>
  );
};

export default QuestionDetailPage;
