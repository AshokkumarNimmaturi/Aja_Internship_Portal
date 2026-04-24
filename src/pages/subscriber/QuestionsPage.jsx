import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// ✅ UPGRADED: Using elite Heroicons 2
import { HiMagnifyingGlass, HiAdjustmentsHorizontal, HiChevronRight, HiBookOpen, HiStar, HiBolt, HiArrowPath, HiShieldCheck } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/subscriber/Sidebar";
import { fetchMySubscription } from "../../api/paymentApi";
import { fetchQuestions } from "../../api/questionApi";
import TechBadge from "../../components/common/TechBadge";

const QuestionsPage = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTech, setSelectedTech] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const qRes = await fetchQuestions();
        setQuestions(qRes.data.content || qRes.data || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const techs = ["All", ...new Set(questions.map(q => q.technologyName))];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTech = selectedTech === "All" || q.technologyName === selectedTech;
    return matchesSearch && matchesTech;
  });

  return (
    <div className="flex h-screen bg-[#F1F2F3] font-sans overflow-hidden portal-modern">
      <Sidebar activeItem="Questions" />
      
      <main className="flex-1 p-8 py-12 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto">
          {/* Elite Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 pl-1">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#232629] mb-1">Your Question Bank</h1>
              <p className="text-gray-500 text-xs">Master the nuances of professional technical interviews across your unlocked stacks.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-lg border border-[#E3E6E8] shadow-sm w-full md:w-[380px] focus-within:ring-1 focus-within:ring-blue-400 transition-all">
              <HiMagnifyingGlass size={18} className="text-gray-300" />
              <input 
                type="text" 
                placeholder="Find specific intel, concepts..."
                className="bg-transparent border-none outline-none text-xs w-full font-medium text-[#232629] placeholder-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 border-b border-[#E3E6E8] pb-6">
             <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
                {techs.map(tech => (
                  <button
                    key={tech}
                    onClick={() => setSelectedTech(tech)}
                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      selectedTech === tech 
                        ? "bg-[#0074CC] text-white shadow-md" 
                        : "bg-white text-gray-500 border border-[#E3E6E8] hover:bg-gray-50"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
             </div>
             <div className="hidden lg:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#0074CC]/40 italic">
                <HiShieldCheck size={14} /> Security Cleared Repository
             </div>
          </div>

          {/* Content */}
          {loading ? (
             <div className="py-40 text-center animate-pulse">
                <HiArrowPath size={40} className="animate-spin mx-auto text-blue-200 mb-6" />
                <p className="text-gray-400 font-serif italic">Accessing your premium intelligence vault...</p>
             </div>
          ) : filteredQuestions.length > 0 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {filteredQuestions.map(q => (
                  <Link 
                    key={q.id} 
                    to={`/dashboard/questions/${q.id}`} 
                    className="block bg-white rounded-lg border border-[#E3E6E8] shadow-sm hover:border-[#0074CC]/20 hover:bg-gray-50/50 transition-all group overflow-hidden"
                  >
                    <div className="p-5">
                       <div className="flex items-center justify-between gap-6">
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-2">
                                <TechBadge tech={q.technologyName} />
                                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100">{q.difficulty}</span>
                             </div>
                             <h3 className="font-sans font-bold text-[#232629] text-sm group-hover:text-[#0074CC] transition-colors leading-tight">
                                {q.title}
                             </h3>
                          </div>
                          <div className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-200 group-hover:text-[#0074CC] group-hover:bg-blue-50 transition-all shrink-0">
                             <HiChevronRight size={18} />
                          </div>
                       </div>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="py-40 text-center bg-white rounded-xl border border-[#E3E6E8] shadow-inner px-12">
               <div className="w-20 h-20 bg-gray-50 text-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-black/5">
                 <HiBookOpen size={32} />
               </div>
               <h3 className="text-xl font-bold text-[#232629] mb-2 font-black">No Intel Detected</h3>
               <p className="text-sm text-gray-400 max-w-sm mx-auto mb-10 leading-relaxed">
                 {searchTerm ? "Your current search query doesn't match any packets in your vault. Try adjusting your mission parameters." : "Your intelligence vault is currently empty. You haven't subscribed to any mastery packages yet."}
               </p>
               {!searchTerm && (
                 <Link to="/packages" className="inline-flex px-12 py-4 bg-[#232629] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#0074CC] transition-all shadow-2xl shadow-blue-900/10 active:scale-95">
                   Explore Mastery Packages
                 </Link>
               )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuestionsPage;
