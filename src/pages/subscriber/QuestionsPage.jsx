import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// ✅ UPGRADED: Using elite Heroicons 2
import { HiMagnifyingGlass, HiAdjustmentsHorizontal, HiChevronRight, HiBookOpen, HiStar, HiBolt, HiArrowPath } from "react-icons/hi2";
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
        const [subRes, qRes] = await Promise.all([
          fetchMySubscription().catch(() => ({ data: [] })),
          fetchQuestions()
        ]);

        const activeSubs = Array.isArray(subRes.data) ? subRes.data : [];
        setSubscriptions(activeSubs);

        const allQs = qRes.data.content || qRes.data || [];
        
        if (user?.role === "SUBSCRIBER") {
           const activeSubsRaw = activeSubs.filter(s => 
             s.status?.toUpperCase() === "ACTIVE" || 
             new Date(s.endDate || s.expiryDate) > new Date()
           );

           const allowedTechs = activeSubsRaw.flatMap(s => {
             const t = [];
             if (s.technologyName) t.push(s.technologyName);
             const pName = s.packageName || "";
             const pType = s.packageType || "";
             
             if (pName.includes("Backend") || pType === "BACKEND") {
               t.push("Java", "Spring", "SpringBoot", "Node", "Backend", "Express", "Microservices");
             }
             if (pName.includes("Frontend") || pType === "FRONTEND") {
               t.push("React", "Frontend", "JavaScript", "Redux", "Angular", "Vue", "CSS", "HTML");
             }
             if (pType === "FULL_STACK") {
               t.push("Full Stack", "Java", "Spring", "React", "Node", "JavaScript");
             }
             return t;
           });
           
           const filtered = allQs.filter(q => 
             q.status === "APPROVED" && 
             (allowedTechs.includes(q.technologyName) || 
              (q.packageType && allowedTechs.some(at => at.toUpperCase() === q.packageType.toUpperCase())))
           );
           setQuestions(filtered);
        } else {
           setQuestions(allQs);
        }

      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const techs = ["All", ...new Set(questions.map(q => q.technologyName))];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTech = selectedTech === "All" || q.technologyName === selectedTech;
    return matchesSearch && matchesTech;
  });

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar activeItem="Questions" />
      
      <main className="flex-1 p-8 py-10 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-serif text-[#0A1628] mb-1">Your Question Bank</h1>
              <p className="text-xs text-gray-400 font-light tracking-wide uppercase">
                {questions.length} premium questions unlocked
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-black/5 shadow-sm w-full md:w-96">
              <HiMagnifyingGlass size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search concepts, questions..."
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {techs.map(tech => (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedTech === tech 
                    ? "bg-[#0A1628] text-white shadow-lg shadow-blue-900/10" 
                    : "bg-white text-gray-400 border border-black/5 hover:bg-gray-50"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
             <div className="py-40 text-center">
                <div className="animate-spin text-blue-500 flex justify-center mb-4"><HiArrowPath size={40} /></div>
                <p className="text-gray-400 font-serif italic">Syncing your personalized library...</p>
             </div>
          ) : filteredQuestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {filteredQuestions.map(q => (
                 <Link 
                   key={q.id} 
                   to={`/dashboard/questions/${q.id}`} 
                   className="bg-white p-7 rounded-[40px] border border-black/5 hover:border-blue-200 transition-all group flex flex-col justify-between shadow-sm hover:shadow-md"
                 >
                   <div>
                      <div className="flex items-center justify-between mb-4">
                        <TechBadge tech={q.technologyName} />
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none bg-gray-50 px-2.5 py-1 rounded-full">{q.difficulty}</div>
                      </div>
                      <h3 className="font-bold text-[#0A1628] text-lg mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">{q.title}</h3>
                   </div>
                   
                   <div className="flex items-center justify-between pt-6 border-t border-black/5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                          <HiBolt size={14} fill="currentColor" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mastery Sync Available</span>
                      </div>
                      <div className="text-blue-600 transform group-hover:translate-x-1 transition-transform"><HiChevronRight size={20} /></div>
                   </div>
                 </Link>
               ))}
            </div>
          ) : (
            <div className="py-40 text-center bg-white rounded-[60px] border border-black/5 shadow-inner">
               <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                 <HiBookOpen size={40} />
               </div>
               <h3 className="text-xl font-serif text-[#0A1628] mb-2">No questions found</h3>
               <p className="text-sm text-gray-400 italic max-w-sm mx-auto mb-8">
                 {searchTerm ? "Try adjusting your search terms or filters." : "You haven't unlocked any content for this category yet."}
               </p>
               {!searchTerm && (
                 <Link to="/packages" className="px-8 py-3 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20">
                   Explore Packages
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
