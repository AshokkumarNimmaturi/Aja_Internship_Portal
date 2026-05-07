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

  return (    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      <Sidebar activeItem="Bookmarks" />

      {/* Main */}
      <main className="flex-1 p-8 py-10 overflow-y-auto w-full">
        <div className="mb-8 animate-in fade-in slide-in-from-left duration-500">
          <h1 className="text-xl font-bold text-[#0A1628] mb-1">Bookmarks</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Saved Knowledge Repository
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <HiMagnifyingGlass
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Filter saved intel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E3E6E8] rounded-lg text-sm text-[#232629] placeholder-gray-300 focus:outline-none focus:border-[#0074CC] transition-all"
          />
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((q) => (
                <div
                key={q.id}
                className="bg-white border border-[#E3E6E8] rounded-lg p-5 hover:border-[#0074CC]/20 transition-all group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <TechBadge tech={q.technology} />
                    <button
                      onClick={() => removeBookmark(q.id)}
                      className="text-[#0074CC] hover:scale-110 transition-transform"
                    >
                      <HiBookmark size={16} />
                    </button>
                  </div>
                  <Link to={`/dashboard/questions/${q.id}`}>
                    <h3 className="text-sm font-bold text-[#232629] leading-tight mb-4 group-hover:text-[#0074CC] transition-colors line-clamp-3">
                      {q.title}
                    </h3>
                  </Link>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">{q.difficulty}</span>
                  <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-medium">
                    <HiChatBubbleLeftEllipsis size={14} />
                    <span>{q.answerCount} results</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-[#E3E6E8] rounded-lg">
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
              <HiBookmark size={20} className="text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-[#0A1628] mb-1">
              Empty Repository
            </h3>
            <p className="text-[9px] text-gray-400 mb-6 font-bold uppercase tracking-widest">
              Save questions to build your priority list
            </p>
            <Link
              to="/dashboard"
              className="px-6 py-2 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all"
            >
              Browse Intel
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookmarksPage;
