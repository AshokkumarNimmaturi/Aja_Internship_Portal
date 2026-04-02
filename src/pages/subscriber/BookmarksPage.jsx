import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark, MessageCircle, Search } from "lucide-react";
import TechBadge from "../../components/common/TechBadge";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/subscriber/Sidebar";
import axiosInstance from "../../api/axiosInstance";

// Mock data removed — using real API data 🚀

const BookmarksPage = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await axiosInstance.get("/bookmarks");
        setBookmarks(res.data);
      } catch (err) {
        console.error("Failed to load bookmarks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const removeBookmark = async (id) => {
    try {
      await axiosInstance.post(`/bookmarks/${id}`);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to remove bookmark", err);
    }
  };

  const filtered = bookmarks.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar />

      {/* Main */}
      <main className="flex-1 p-8 h-screen overflow-y-auto">
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
