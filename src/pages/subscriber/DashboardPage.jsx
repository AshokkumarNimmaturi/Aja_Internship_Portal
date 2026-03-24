import { useState } from "react";
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

// Mock data — will come from API when backend is ready
const mockQuestions = [
  {
    id: 1,
    title:
      "What is the difference between HashMap and ConcurrentHashMap in Java?",
    technology: "Java",
    difficulty: "MEDIUM",
    answerCount: 12,
    bookmarked: false,
  },
  {
    id: 2,
    title: "Explain the Spring Bean lifecycle and different scopes available.",
    technology: "Spring Boot",
    difficulty: "HARD",
    answerCount: 8,
    bookmarked: true,
  },
  {
    id: 3,
    title: "What is the difference between useEffect and useLayoutEffect?",
    technology: "React",
    difficulty: "MEDIUM",
    answerCount: 15,
    bookmarked: false,
  },
  {
    id: 4,
    title: "How does JPA handle the N+1 query problem?",
    technology: "Java",
    difficulty: "HARD",
    answerCount: 6,
    bookmarked: false,
  },
  {
    id: 5,
    title: "Explain event bubbling and event delegation in JavaScript.",
    technology: "JavaScript",
    difficulty: "EASY",
    answerCount: 20,
    bookmarked: true,
  },
  {
    id: 6,
    title: "What is the difference between Docker image and Docker container?",
    technology: "DevOps",
    difficulty: "EASY",
    answerCount: 9,
    bookmarked: false,
  },
  {
    id: 7,
    title:
      "How do you optimize React performance using useMemo and useCallback?",
    technology: "React",
    difficulty: "HARD",
    answerCount: 11,
    bookmarked: false,
  },
  {
    id: 8,
    title: "Explain Python decorators with a real world example.",
    technology: "Python",
    difficulty: "MEDIUM",
    answerCount: 14,
    bookmarked: false,
  },
  {
    id: 9,
    title: "What is the GIL in Python and how does it affect multithreading?",
    technology: "Python",
    difficulty: "HARD",
    answerCount: 7,
    bookmarked: true,
  },
  {
    id: 10,
    title: "How does Kubernetes handle pod scheduling and resource limits?",
    technology: "DevOps",
    difficulty: "HARD",
    answerCount: 5,
    bookmarked: false,
  },
  {
    id: 11,
    title: "What are Salesforce governor limits and how do you handle them?",
    technology: "Salesforce",
    difficulty: "MEDIUM",
    answerCount: 10,
    bookmarked: false,
  },
  {
    id: 12,
    title: "Explain controlled vs uncontrolled components in React.",
    technology: "React",
    difficulty: "EASY",
    answerCount: 18,
    bookmarked: false,
  },
];

const ITEMS_PER_PAGE = 6;

const Sidebar = ({ user, onLogout }) => {
  const navItems = [
    { label: "Dashboard", icon: "🏠", path: "/dashboard", active: true },
    { label: "My Questions", icon: "📚", path: "/dashboard/questions" },
    { label: "Bookmarks", icon: "🔖", path: "/dashboard/bookmarks" },
    { label: "My Subscription", icon: "💳", path: "/dashboard/subscription" },
    { label: "Profile", icon: "👤", path: "/dashboard/profile" },
  ];

  const daysLeft = 24;

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-black/5 min-h-screen flex flex-col">
      {/* Logo */}
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

      {/* Nav Items */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map((item) => (
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

      {/* Bottom — Subscription + User */}
      <div className="p-4 border-t border-black/5 flex flex-col gap-3">
        {/* Subscription Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-green-700">
            Active · {daysLeft} days left
          </span>
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A1628] to-[#2563EB] text-white text-xs font-semibold flex items-center justify-center">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="text-xs font-medium text-[#0A1628] leading-tight">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-gray-400 leading-tight">
                Subscriber
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-300 hover:text-red-400 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [bookmarks, setBookmarks] = useState(
    mockQuestions.filter((q) => q.bookmarked).map((q) => q.id),
  );
  const [page, setPage] = useState(1);

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
  const filtered = mockQuestions.filter((q) => {
    const matchSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.technology.toLowerCase().includes(search.toLowerCase());
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
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-black/5 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#0A1628]">
              {getGreeting()}, {user?.name?.split(" ")[0] || "there"} 👋
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
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="text-sm text-gray-600">
                {user?.name?.split(" ")[0]}
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

          {/* Results Count */}
          <p className="text-xs text-gray-400 mb-4">
            Showing {paginated.length} of {filtered.length} questions
          </p>

          {/* Questions Grid */}
          {paginated.length > 0 ? (
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
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
