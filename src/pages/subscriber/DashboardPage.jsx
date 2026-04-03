import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  HiBookOpen, 
  HiChartBar, 
  HiClock, 
  HiCheckCircle, 
  HiStar, 
  HiMagnifyingGlass,
  HiFunnel,
  HiLockClosed,
  HiArrowLongRight,
  HiArrowTrendingUp,
  HiAcademicCap,
  HiBolt,
  HiArrowPath
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/subscriber/Sidebar";
import axiosInstance from "../../api/axiosInstance";
import TechBadge from "../../components/common/TechBadge";

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSolved: 124,
    accuracy: 85,
    currentStreak: 7,
    nextGoalProgress: 65
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

        setRecentQuestions(qRes.data || []);
      } catch (error) {
        console.error("Dashboard Data Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar activeItem="Dashboard" />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <h1 className="text-3xl font-serif text-[#0A1628] mb-1">
                Welcome back, {user?.fullName?.split(" ")[0] || "Subscriber"}! 🚀
              </h1>
              <p className="text-xs text-gray-400 font-bold font-sans uppercase tracking-[0.2em]">
                {subscription ? `${subscription.packageName} Plan Active` : "Choose a plan to unlock full potential"}
              </p>
            </div>
            
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right duration-700">
               <div className="bg-white border border-black/5 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl shadow-inner"><HiBolt size={20} /></div>
                  <div>
                    <div className="text-sm font-black text-[#0A1628] leading-tight">{stats.currentStreak} Day Streak!</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Consistency is key</div>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              <div className="bg-white rounded-[40px] border border-black/5 p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20" />
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-serif text-[#0A1628]">Recently Viewed Intel</h2>
                  <Link to="/dashboard/questions" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors flex items-center gap-2 group/link">
                    Full Question Bank <HiArrowLongRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {loading ? (
                    <div className="py-24 text-center">
                       <div className="animate-spin text-blue-100 flex justify-center mb-4"><HiArrowPath size={40} /></div>
                       <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Fetching Intel...</p>
                    </div>
                  ) : recentQuestions.length > 0 ? (
                    recentQuestions.map((q, idx) => (
                      <Link key={q.id} to={`/dashboard/questions/${q.id}`} 
                        className="flex items-center justify-between p-6 rounded-[32px] border border-black/5 hover:border-blue-100 hover:bg-blue-50/20 transition-all group/item animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover/item:scale-110 group-hover/item:bg-blue-50 group-hover/item:text-blue-500 transition-all shadow-inner">
                              <HiStar size={22} />
                            </div>
                            <div>
                               <h4 className="font-bold text-[#0A1628] text-base mb-1.5 group-hover/item:text-blue-600 transition-colors">{q.title}</h4>
                               <div className="flex items-center gap-3">
                                  <TechBadge tech={q.technologyName} />
                                  <span className="text-[10px] text-gray-300 font-black uppercase tracking-[0.1em]">• {q.difficulty}</span>
                               </div>
                            </div>
                         </div>
                         <div className="text-gray-200 group-hover/item:text-blue-400 transform group-hover/item:translate-x-1 transition-all"><HiArrowLongRight size={24} /></div>
                      </Link>
                    ))
                  ) : (
                     <div className="py-24 text-center bg-gray-50/50 rounded-[40px] border border-dashed border-black/10">
                       <div className="text-4xl mb-4 grayscale opacity-30">📚</div>
                       <p className="text-sm text-gray-400 font-serif italic mb-4">You haven't studied any questions yet.</p>
                       <Link to="/dashboard/questions" className="inline-flex px-8 py-3 bg-[#0A1628] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/10 active:scale-95">Begin Mastery</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
               <div className={`rounded-[40px] p-10 border shadow-2xl relative overflow-hidden group ${subscription ? 'bg-gradient-to-br from-[#0A1628] to-[#1E3A5F] text-white border-transparent' : 'bg-white border-black/5'}`}>
                  {subscription && <HiStar size={180} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />}
                  
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className={`p-4 rounded-2xl shadow-xl ${subscription ? 'bg-blue-500/20 text-blue-300 border border-white/10' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                      <HiAcademicCap size={30} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl leading-tight font-serif">{subscription ? subscription.packageName : "Ascend to Premium"}</h3>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${subscription ? 'text-blue-300/80' : 'text-gray-400'}`}>
                        {subscription ? 'Elite Vault Access' : 'Secure the future'}
                      </p>
                    </div>
                  </div>

                  {!subscription ? (
                    <div className="relative z-10">
                      <p className="text-sm text-gray-500 mb-10 leading-relaxed italic font-light">Join the top 1% of candidates with curated mock interviews and deep behavioral analytics.</p>
                      <Link to="/portal/packages" className="block w-full py-5 bg-[#0A1628] text-white rounded-2xl text-center text-xs font-black uppercase tracking-widest hover:bg-blue-900 transition-all shadow-2xl shadow-blue-900/20 active:scale-[0.98]">Get Access Now</Link>
                    </div>
                  ) : (
                    <div className="relative z-10">
                      <div className="space-y-5 mb-10">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-blue-200">Subscription Meta</span>
                             <span className="font-mono text-white/80">{subscription.status === "ACTIVE" ? new Date(subscription.endDate || subscription.expiryDate).toLocaleDateString() : "Trial Mode"}</span>
                         </div>
                         <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,0.5)]" style={{ width: '65%' }} />
                         </div>
                      </div>
                      <Link to="/dashboard/subscription" className="block w-full py-5 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-2xl text-center text-xs font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all active:scale-[0.98]">Manage Access</Link>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
