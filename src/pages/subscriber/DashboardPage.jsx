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
import { fetchMySubscription } from "../../api/paymentApi";
import { fetchRecentQuestions } from "../../api/questionApi";
import TechBadge from "../../components/common/TechBadge";
import VoiceCallButton from "../../components/common/VoiceCallButton";

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
          fetchMySubscription().catch(() => ({ data: [] })),
          fetchRecentQuestions()
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
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      <Sidebar activeItem="Dashboard" />
      
      <main className="flex-1 p-8 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <h1 className="text-xl font-bold text-[#0A1628] mb-1">
                Dashboard Overview
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {subscription ? `${subscription.packageName} stream initialized` : "Unsubscribe status detected"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Intel Center */}
            <div className="lg:col-span-8 space-y-6">
               <div className="bg-white border border-[#E3E6E8] rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                     <h2 className="text-sm font-bold text-[#0A1628]">Recently Viewed Questions</h2>
                     <Link to="/dashboard/questions" className="text-[9px] font-black text-[#0074CC] uppercase tracking-widest hover:underline">
                        View Entire Repository
                     </Link>
                  </div>
                  
                  <div className="space-y-3">
                     {loading ? (
                        <div className="py-12 text-center text-gray-300"><HiArrowPath className="animate-spin inline mr-2" /> <span className="text-[10px] font-bold uppercase tracking-widest">Residuing Intel...</span></div>
                     ) : recentQuestions.length > 0 ? (
                        recentQuestions.map((q) => (
                           <Link key={q.id} to={`/dashboard/questions/${q.id}`} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-[#0074CC]/20 hover:bg-gray-50/50 transition-all group">
                              <div className="flex items-center gap-4">
                                 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-[#0074CC] transition-colors"><HiStar size={16} /></div>
                                 <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-0.5">{q.title}</h4>
                                    <div className="flex items-center gap-2"><TechBadge tech={q.technologyName} /><span className="text-[8px] font-bold uppercase text-gray-300 tracking-widest">· {q.difficulty}</span></div>
                                 </div>
                              </div>
                              <HiArrowLongRight size={18} className="text-gray-200 group-hover:text-[#0074CC] group-hover:translate-x-1 transition-all" />
                           </Link>
                        ))
                     ) : (
                        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
                           <p className="text-xs text-gray-400 mb-6 font-medium">Your study history is currently blank.</p>
                           <Link to="/dashboard/questions" className="text-[9px] font-black uppercase tracking-widest px-6 py-2.5 bg-[#0A1628] text-white rounded-lg">Browse Intel</Link>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Status Panel */}
            <div className="lg:col-span-4 space-y-6">
               <div className={`bg-white border border-[#E3E6E8] rounded-lg p-6 shadow-sm h-full ${subscription ? 'border-l-4 border-l-[#0074CC]' : ''}`}>
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-[#0A1628] border border-gray-100">
                        <HiAcademicCap size={20} />
                     </div>
                     <div>
                        <h3 className="text-sm font-bold text-[#0A1628] leading-tight">{subscription ? subscription.packageName : "Basic Account"}</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#0074CC]">Membership Protocol</p>
                     </div>
                  </div>

                  {subscription ? (
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
                              <span>Sync Status</span>
                              <span className="text-gray-700">Expires {new Date(subscription.endDate || subscription.expiryDate).toLocaleDateString()}</span>
                           </div>
                           <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#0074CC] transition-all duration-1000" style={{ width: '65%' }} />
                           </div>
                        </div>
                        <Link to="/dashboard/subscription" className="block w-full py-2.5 bg-[#0074CC] text-white text-center text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#0063AD] transition-all">Manage Stream</Link>
                        
                        <div className="pt-6 border-t border-gray-50 space-y-4">
                           <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Expert Relay</span>
                              <span className="px-2 py-0.5 bg-green-50 text-[8px] font-bold text-green-600 rounded-full border border-green-100 uppercase tracking-widest">Enabled</span>
                           </div>
                           <VoiceCallButton toNumber="support" label="Support" className="w-full py-2.5 !rounded-lg !text-[10px] !font-bold !bg-gray-50 !text-[#0A1628] !shadow-none border border-gray-100 hover:!bg-white hover:!border-[#0074CC]/30" />
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-6">
                        <p className="text-xs text-gray-400 leading-relaxed font-medium">Access premium technical intel and mock interview simulations.</p>
                        <Link to="/portal/packages" className="block w-full py-2.5 bg-[#0A1628] text-white text-center text-[10px] font-bold uppercase tracking-widest rounded-lg">Upgrade Now</Link>
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
