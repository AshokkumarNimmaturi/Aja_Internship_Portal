import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Bookmark,
  MessageCircle,
  Bell,
  ChevronDown,
  LogOut,
  User,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import TechBadge from "../../components/common/TechBadge";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import axiosInstance from "../../api/axiosInstance";
import { Sidebar } from "../../components/subscriber/Sidebar";



const ITEMS_PER_PAGE = 6;

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [bookmarks, setBookmarks] = useState([]);
  const [page, setPage] = useState(1);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await axiosInstance.get("/subscriptions/my");
        
        let activeSub = null;
        if (Array.isArray(res.data) && res.data.length > 0) {
          activeSub = res.data.find(sub => sub.status === "ACTIVE") || res.data[0];
        } else if (res.data && !Array.isArray(res.data)) {
          activeSub = res.data;
        }

        if (activeSub && activeSub.endDate) {
          setSubscription(activeSub);
        } else {
          setSubscription(null);
        }
      } catch (error) {
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (subscription) {
      setLoadingQuestions(true);
      axiosInstance.get("/questions/my")
        .then(res => setQuestions(res.data))
        .catch(err => console.error("Failed to load questions", err))
        .finally(() => setLoadingQuestions(false));
    }
  }, [subscription]);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const toggleBookmark = (id) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Filter questions
  const filtered = questions.filter((q) => {
    const techName = typeof q.technology === 'string' ? q.technology : (q.technology?.name || "");
    const matchSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      techName.toLowerCase().includes(search.toLowerCase());
    const matchDiff = difficulty === "ALL" || q.difficulty === difficulty;
    return matchSearch && matchDiff;
  });

  // Paginate
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar user={user} subscription={subscription} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-black/5 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#0A1628]">
              {getGreeting()}, {(user?.fullName || user?.name)?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Here are your questions. Keep practising!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={18} />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 border border-black/8 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0A1628] to-[#2563EB] text-white text-xs font-semibold flex items-center justify-center">
                {(user?.fullName || user?.name)?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="text-sm text-gray-600">
                {(user?.fullName || user?.name)?.split(" ")[0]}
              </span>
              <ChevronDown size={13} className="text-gray-300" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              />
              <input
                type="text"
                placeholder="Search questions by title or technology..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 bg-white border border-black/8 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Difficulty Filter Chips */}
            <div className="flex items-center gap-2">
              {["ALL", "EASY", "MEDIUM", "HARD"].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDifficulty(d);
                    setPage(1);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    difficulty === d
                      ? d === "ALL"
                        ? "bg-[#0A1628] text-white"
                        : d === "EASY"
                          ? "bg-green-500 text-white"
                          : d === "MEDIUM"
                            ? "bg-amber-500 text-white"
                            : "bg-red-500 text-white"
                      : "bg-white border border-black/8 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Main Dashboard UI Based on Subscription */}
          {subscription ? (
            <>
              {/* Results Count */}
              {!loadingQuestions && (
                <p className="text-xs text-gray-400 mb-4">
                  Showing {paginated.length} of {filtered.length} questions
                </p>
              )}

              {/* Questions Grid */}
              {loadingQuestions ? (
                <div className="flex items-center justify-center py-20 text-gray-500">
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Loading your questions...
                  </div>
                </div>
              ) : questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-black/5 rounded-2xl w-full max-w-2xl mx-auto shadow-sm">
                  <div className="text-5xl mb-5">📭</div>
                  <h3 className="text-lg font-bold text-[#0A1628] mb-2 leading-snug">
                    No questions to display
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                    Questions for your package will automatically appear here once added by our expert tutors.
                  </p>
                </div>
              ) : paginated.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                  {paginated.map((q) => (
                    <Link
                      key={q.id}
                      to={`/dashboard/questions/${q.id}`}
                      className="block bg-white border border-black/8 rounded-2xl p-5 hover:border-blue-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      {/* Card Top */}
                      <div className="flex items-start justify-between mb-3">
                        <TechBadge tech={q.technology} />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleBookmark(q.id);
                          }}
                          className="transition-colors"
                        >
                          <Bookmark
                            size={15}
                            className={
                              bookmarks.includes(q.id)
                                ? "text-[#2563EB] fill-[#2563EB]"
                                : "text-gray-200 hover:text-[#2563EB]"
                            }
                          />
                        </button>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-[#0A1628] leading-snug mb-4 line-clamp-2">
                        {q.title}
                      </h3>

                      {/* Card Bottom */}
                      <div className="flex items-center justify-between">
                        <DifficultyBadge difficulty={q.difficulty} />
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <MessageCircle size={12} />
                          <span>{q.answerCount} answers</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-[#0A1628] mb-2">
                    No questions found
                  </h3>
                  <p className="text-sm text-gray-400">
                    Try a different search term or filter
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-black/8 rounded-xl text-sm text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    ← Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                        page === p
                          ? "bg-[#0A1628] text-white"
                          : "border border-black/8 text-gray-500 hover:bg-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-black/8 rounded-xl text-sm text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : !loading ? (
            <div className="flex flex-col items-center justify-center py-20 mt-10 text-center bg-white border border-black/8 rounded-2xl w-full max-w-2xl mx-auto shadow-sm">
              <div className="text-6xl mb-6">🔒</div>
              <h3 className="text-xl font-semibold text-[#0A1628] mb-3">
                Unlock Premium Questions
              </h3>
              <p className="text-sm text-gray-500 mb-8 max-w-sm leading-relaxed">
                You need an active subscription to access our full interview question bank. Choose a package to start practising today!
              </p>
              <Link
                to="/packages"
                className="px-7 py-3.5 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
              >
                Browse Packages
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-gray-500">Loading your questions...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
