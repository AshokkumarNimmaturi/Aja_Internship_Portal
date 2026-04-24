import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// ✅ UPGRADED: Using elite Heroicons 2
import { HiBookmark, HiChatBubbleLeftEllipsis, HiMagnifyingGlass } from "react-icons/hi2";
import TechBadge from "../../components/common/TechBadge";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/subscriber/Sidebar";
import { getBookmarks, toggleBookmarkApi } from "../../api/questionApi";

const BookmarksPage = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await getBookmarks();
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
      await toggleBookmarkApi(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to remove bookmark", err);
    }
  };

  const filtered = bookmarks.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden portal-modern">
      <Sidebar />

      {/* Main */}
      <main className="flex-1 p-8 py-10 overflow-y-auto">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="font-serif text-3xl text-[#0A1628] mb-1 font-bold">Bookmarks</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
            Curated Knowledge Vault
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-8 animate-fade-in-up animation-delay-100">
          <HiMagnifyingGlass
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up animation-delay-200">
            {filtered.map((q, idx) => (
               <div
                key={q.id}
                style={{ animationDelay: `${idx * 100}ms` }}
                className="glass-panel rounded-3xl p-6 hover:border-blue-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] transition-all duration-300 group animate-fade-in-up"
              >
                <div className="flex items-start justify-between mb-3">
                  <TechBadge tech={q.technology} />
                  <button
                    onClick={() => removeBookmark(q.id)}
                    className="transition-colors"
                  >
                    <HiBookmark
                      size={15}
                      className="text-[#2563EB] fill-[#2563EB] hover:fill-none"
                    />
                  </button>
                </div>
                <Link to={`/dashboard/questions/${q.id}`}>
                  <h3 className="text-sm font-bold text-[#0A1628] leading-snug mb-5 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                    {q.title}
                  </h3>
                </Link>
                <div className="flex items-center justify-between">
                  <DifficultyBadge difficulty={q.difficulty} />
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <HiChatBubbleLeftEllipsis size={12} />
                    <span>{q.answerCount} answers</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-[40px] border-dashed border-black/8 animate-fade-in-up animation-delay-200">
            <div className="w-20 h-20 bg-blue-50/50 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-float-slow">
              <HiBookmark size={36} className="text-blue-300" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#0A1628] mb-2">
              Empty Vault
            </h3>
            <p className="text-[11px] text-gray-400 mb-8 font-bold uppercase tracking-widest">
              Save questions to build your priority list
            </p>
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-[#0A1628] to-blue-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
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
