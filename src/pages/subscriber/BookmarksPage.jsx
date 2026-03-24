import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, MessageCircle, Search } from "lucide-react";
import TechBadge from "../../components/common/TechBadge";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import { useAuth } from "../../context/AuthContext";

const mockBookmarks = [
  {
    id: 2,
    title: "Explain the Spring Bean lifecycle and different scopes available.",
    technology: "Spring Boot",
    difficulty: "HARD",
    answerCount: 8,
  },
  {
    id: 5,
    title: "Explain event bubbling and event delegation in JavaScript.",
    technology: "JavaScript",
    difficulty: "EASY",
    answerCount: 20,
  },
  {
    id: 9,
    title: "What is the GIL in Python and how does it affect multithreading?",
    technology: "Python",
    difficulty: "HARD",
    answerCount: 7,
  },
];

const BookmarksPage = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState(mockBookmarks);
  const [search, setSearch] = useState("");

  const removeBookmark = (id) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const filtered = bookmarks.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
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
            { label: "My Questions", icon: "📚", path: "/dashboard/questions" },
            {
              label: "Bookmarks",
              icon: "🔖",
              path: "/dashboard/bookmarks",
              active: true,
            },
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
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-[#0A1628] mb-1">Bookmarks</h1>
          <p className="text-sm text-gray-400 font-light">
            Questions you saved for later revision
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
          />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-black/8 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all"
          />
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((q) => (
              <div
                key={q.id}
                className="bg-white border border-black/8 rounded-2xl p-5 hover:border-blue-100 hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <TechBadge tech={q.technology} />
                  <button
                    onClick={() => removeBookmark(q.id)}
                    className="transition-colors"
                  >
                    <Bookmark
                      size={15}
                      className="text-[#2563EB] fill-[#2563EB] hover:fill-none"
                    />
                  </button>
                </div>
                <Link to={`/dashboard/questions/${q.id}`}>
                  <h3 className="text-sm font-semibold text-[#0A1628] leading-snug mb-4 line-clamp-2 hover:text-[#2563EB] transition-colors">
                    {q.title}
                  </h3>
                </Link>
                <div className="flex items-center justify-between">
                  <DifficultyBadge difficulty={q.difficulty} />
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <MessageCircle size={12} />
                    <span>{q.answerCount} answers</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Bookmark size={28} className="text-gray-200" />
            </div>
            <h3 className="text-lg font-semibold text-[#0A1628] mb-2">
              No bookmarks yet
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Save questions while browsing to find them quickly later
            </p>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-[#0A1628] text-white text-sm rounded-xl hover:bg-[#0F2340] transition-all"
            >
              Browse Questions
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookmarksPage;
