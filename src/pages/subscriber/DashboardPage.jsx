import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  Star, 
  Search,
  Filter,
  Lock,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/subscriber/Sidebar";
import axiosInstance from "../../api/axiosInstance";
import TechBadge from "../../components/common/TechBadge";

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSolved: 0,
    accuracy: 0,
    currentStreak: 0,
    nextGoalProgress: 0
  });
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [subRes, qRes] = await Promise.all([
          axiosInstance.get("/subscriptions/my").catch(() => ({ data: [] })),
          axiosInstance.get("/questions/recent")
        ]);
        
        const subData = Array.isArray(subRes.data) ? subRes.data : (subRes.data ? [subRes.data] : []);
        const activeSubRaw = subData.find(s => s.status?.toUpperCase() === "ACTIVE") || subData[0];
        setSubscription(activeSubRaw && (activeSubRaw.endDate || activeSubRaw.expiryDate) ? activeSubRaw : null);

        // Derive allowed techs for filtering
        const allowedTechs = subData.flatMap(s => {
          const t = [];
          if (s.technologyName) t.push(s.technologyName);
          const pName = s.packageName || "";
          const pType = s.packageType || "";
          if (pName.includes("Backend") || pType === "BACKEND") t.push("Java", "Spring", "SpringBoot", "Node", "Backend", "Express", "Microservices");
          if (pName.includes("Frontend") || pType === "FRONTEND") t.push("React", "Frontend", "JavaScript", "Redux", "Angular", "Vue", "CSS", "HTML");
          return t;
        });

        // Safe filter for recent questions
        const rawQs = qRes.data || [];
        const filteredQs = (user?.role === "SUBSCRIBER") 
          ? rawQs.filter(q => allowedTechs.includes(q.technologyName) || (q.packageType && allowedTechs.some(at => at.toUpperCase() === q.packageType.toUpperCase())))
          : rawQs;

        setRecentQuestions(filteredQs);
        
        // Mock stats for high-fidelity UI (can be connected to backend later)
        setStats({
          totalSolved: 124,
          accuracy: 85,
          currentStreak: 7,
          nextGoalProgress: 65
        });
      } catch (error) {
        console.error("Dashboard Data Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar activeItem="Dashboard" />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif text-[#0A1628] mb-1">
                Welcome back, {user?.fullName?.split(" ")[0] || "Subscriber"}! 🚀
              </h1>
              <p className="text-sm text-gray-400 font-light font-sans uppercase tracking-widest">
                {subscription ? `${subscription.packageName} Plan Active` : "Choose a plan to unlock full potential"}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="bg-white border border-black/5 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><Zap size={16} fill="currentColor" /></div>
                  <div>
                    <div className="text-sm font-bold text-[#0A1628]">{stats.currentStreak} Day Streak!</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">Consistency is key</div>
                  </div>
               </div>
            </div>
          </div>

          {/* UI Cleanup: Removed hardcoded stats grid for Questions Solved, Accuracy, Rate, Rank */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Recent Activity & Question Bank */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[40px] border border-black/5 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-serif text-[#0A1628]">Recent Questions</h2>
                  <Link to="/portal/questions" className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                    Full Question Bank <ArrowRight size={14} />
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {loading ? (
                    <div className="py-20 text-center"><div className="animate-spin text-blue-100 flex justify-center"><RefreshCw size={32} /></div></div>
                  ) : Array.isArray(recentQuestions) && recentQuestions.length > 0 ? (
                    recentQuestions.map(q => (
                      <Link key={q.id} to={`/portal/question/${q.id}`} className="flex items-center justify-between p-5 rounded-3xl border border-black/5 hover:border-blue-100 hover:bg-blue-50/10 transition-all group">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                              <Star size={18} />
                            </div>
                            <div>
                               <h4 className="font-bold text-[#0A1628] text-sm mb-1 group-hover:text-blue-600 transition-colors">{q.title}</h4>
                               <div className="flex items-center gap-2">
                                  <TechBadge tech={q.technologyName} />
                                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">• {q.difficulty}</span>
                               </div>
                            </div>
                         </div>
                         <div className="text-gray-300 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all"><ArrowRight size={18} /></div>
                      </Link>
                    ))
                  ) : (
                     <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-black/10">
                       <p className="text-sm text-gray-400 font-serif italic font-light">No recently viewed questions.</p>
                       <Link to="/dashboard/questions" className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-2 block">Explore Question Bank</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Subscription & Goals */}
            <div className="space-y-8">
               {/* Subscription Card */}
               <div className={`rounded-[40px] p-8 border shadow-sm ${subscription ? 'bg-gradient-to-br from-[#0A1628] to-[#1E3A5F] text-white border-transparent' : 'bg-white border-black/5'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-2xl ${subscription ? 'bg-white/10 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                      <Star size={24} fill={subscription ? "currentColor" : "none"} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{subscription ? subscription.packageName : "Unlock Premium"}</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${subscription ? 'text-blue-200' : 'text-gray-400'}`}>
                        {subscription ? 'Active Membership' : 'Practice with the best'}
                      </p>
                    </div>
                  </div>

                  {!subscription ? (
                    <>
                      <p className="text-sm text-gray-500 mb-8 leading-relaxed italic">Get access to premium questions, mock interviews, and advanced curation analytics.</p>
                      <Link to="/portal/packages" className="block w-full py-4 bg-[#0A1628] text-white rounded-2xl text-center text-xs font-bold uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/10">Upgrade Now</Link>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4 mb-8">
                         <div className="flex justify-between text-xs">
                            <span className="text-blue-200">Valid Until</span>
                             <span className="font-mono">{new Date(subscription.endDate || subscription.expiryDate).toLocaleDateString()}</span>
                         </div>
                         <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: '45%' }} />
                         </div>
                      </div>
                      <Link to="/dashboard/subscription" className="block w-full py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl text-center text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all">Manage Subscription</Link>
                    </>
                  )}
               </div>

               {/* UI Cleanup: Removed Learning Paths / Goals section as it was not being tracked */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
