import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, ThumbsUp, Star } from "lucide-react";
import TechBadge from "../../components/common/TechBadge";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import { useAuth } from "../../context/AuthContext";

const mockQuestion = {
  id: 1,
  title:
    "What is the difference between HashMap and ConcurrentHashMap in Java? When would you use each?",
  technology: "Java",
  difficulty: "MEDIUM",
  rating: 4.8,
  tutorComment: {
    tutor: "Rajesh Kumar",
    initials: "RK",
    comment:
      "This is one of the most frequently asked Java concurrency questions. Make sure you understand thread safety concepts before answering. Mention segment locking in ConcurrentHashMap and give a real use case.",
  },
  answers: [
    {
      id: 1,
      user: "Priya S.",
      initials: "PS",
      text: "HashMap is not thread-safe. It allows one null key and multiple null values. It is faster in single-threaded environments. ConcurrentHashMap is thread-safe and uses segment-level locking (in Java 7) or CAS operations (in Java 8+). It does not allow null keys or values. Use HashMap when working in a single-threaded context. Use ConcurrentHashMap when multiple threads need to read and write concurrently without external synchronization.",
      upvotes: 24,
      upvoted: false,
      time: "2 days ago",
    },
    {
      id: 2,
      user: "Arun M.",
      initials: "AM",
      text: "To add to the above answer — in Java 8, ConcurrentHashMap was redesigned. Instead of segment locking it now uses a combination of CAS (Compare and Swap) operations and synchronized blocks on individual buckets. This makes it more efficient. The compute(), merge() and forEach() methods are also atomic which makes complex operations easier to implement safely.",
      upvotes: 18,
      upvoted: true,
      time: "1 day ago",
    },
    {
      id: 3,
      user: "Sneha R.",
      initials: "SR",
      text: "A practical use case: if you are building a web application that maintains a session cache accessed by multiple threads, use ConcurrentHashMap. If you are building a utility method that processes a list sequentially and needs a lookup table, HashMap is fine and more performant.",
      upvotes: 12,
      upvoted: false,
      time: "5 hours ago",
    },
  ],
};

const QuestionDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [answers, setAnswers] = useState(mockQuestion.answers);
  const [visibleCount, setVisibleCount] = useState(2);

  const handleUpvote = (answerId) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === answerId
          ? {
              ...a,
              upvoted: !a.upvoted,
              upvotes: a.upvoted ? a.upvotes - 1 : a.upvotes + 1,
            }
          : a,
      ),
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar — reuse same sidebar style */}
      <aside className="w-64 shrink-0 bg-white border-r border-black/5 min-h-screen flex flex-col">
        <div className="p-6 border-b border-black/5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0A1628] rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">AIP</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#0A1628] leading-tight">
                Aja Internship Portal
              </div>
              <div className="text-xs text-gray-400 leading-tight">
                Interview Question Bank
              </div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {[
            { label: "Dashboard", icon: "🏠", path: "/dashboard" },
            {
              label: "My Questions",
              icon: "📚",
              path: "/dashboard/questions",
              active: true,
            },
            { label: "Bookmarks", icon: "🔖", path: "/dashboard/bookmarks" },
            {
              label: "My Subscription",
              icon: "💳",
              path: "/dashboard/subscription",
            },
            { label: "Profile", icon: "👤", path: "/dashboard/profile" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                item.active
                  ? "bg-blue-50 text-[#2563EB] font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-black/5 flex flex-col gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700">
              Active · 24 days left
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A1628] to-[#2563EB] text-white text-xs font-semibold flex items-center justify-center">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="text-xs font-medium text-[#0A1628]">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-gray-400">Subscriber</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 max-w-4xl">
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
              {mockQuestion.title}
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
            <TechBadge tech={mockQuestion.technology} />
            <DifficultyBadge difficulty={mockQuestion.difficulty} />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={12}
                  className={
                    s <= Math.floor(mockQuestion.rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200 fill-gray-200"
                  }
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">
                {mockQuestion.rating} rated by tutors
              </span>
            </div>
          </div>
        </div>

        {/* Tutor Comment */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-5 border-l-4 border-l-[#2563EB]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0A1628] text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {mockQuestion.tutorComment.initials}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#0A1628]">
                {mockQuestion.tutorComment.tutor}
              </div>
              <div className="text-xs text-[#2563EB]">Tutor's Note</div>
            </div>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed font-light">
            {mockQuestion.tutorComment.comment}
          </p>
        </div>

        {/* Answers Section */}
        <div className="bg-white border border-black/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#0A1628]">
              {answers.length} Answers
            </h2>
            <span className="text-xs px-3 py-1 bg-gray-50 border border-black/5 text-gray-400 rounded-full">
              Most upvoted first
            </span>
          </div>

          <div className="flex flex-col gap-5">
            {answers.slice(0, visibleCount).map((answer) => (
              <div
                key={answer.id}
                className="border border-black/5 rounded-xl p-5 hover:border-blue-50 transition-all"
              >
                {/* Answer Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 text-xs font-semibold flex items-center justify-center">
                      {answer.initials}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#0A1628]">
                        {answer.user}
                      </div>
                      <div className="text-xs text-gray-400">{answer.time}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpvote(answer.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      answer.upvoted
                        ? "bg-blue-50 border-blue-100 text-[#2563EB]"
                        : "border-black/8 text-gray-400 hover:border-blue-100 hover:text-[#2563EB]"
                    }`}
                  >
                    <ThumbsUp size={12} />
                    {answer.upvotes}
                  </button>
                </div>

                {/* Answer Text */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {answer.text}
                </p>
              </div>
            ))}
          </div>

          {/* Load More */}
          {visibleCount < answers.length && (
            <button
              onClick={() => setVisibleCount(answers.length)}
              className="w-full mt-5 py-3 border border-black/8 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all"
            >
              Load {answers.length - visibleCount} more answers
            </button>
          )}
        </div>

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
