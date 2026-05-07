import { useEffect, useState } from "react";
import { fetchMySubscription } from "../../api/paymentApi";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Sidebar } from "../../components/subscriber/Sidebar";
import VoiceCallButton from "../../components/common/VoiceCallButton";

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      const res = await fetchMySubscription();
      if (Array.isArray(res.data)) {
        setSubscriptions(res.data);
      } else if (res.data && res.data.endDate) {
        setSubscriptions([res.data]);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load subscriptions");
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      <Sidebar activeItem="Subscription" />
      <main className="flex-1 overflow-y-auto px-8 py-10 w-full">
        <div className="max-w-4xl mx-auto">
          {/* Elite Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 pl-1">
            <div>
              <h1 className="text-xl font-bold text-[#0A1628] mb-1">Subscriptions</h1>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Manage your active streams and support access</p>
            </div>
            <button
              onClick={() => (window.location.href = "/packages")}
              className="px-5 py-2 bg-[#0074CC] hover:bg-[#0063AD] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all active:scale-95"
            >
              Browse Packages
            </button>
          </div>

          {subscriptions.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm border border-[#E3E6E8] text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-6 text-2xl border border-gray-100">💳</div>
              <h2 className="text-lg font-bold text-[#0A1628] mb-2">No Active Membership</h2>
              <p className="text-xs text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                Unlock professional technical interview intelligence. Subscriptions grant access to curated question banks.
              </p>
              <button
                onClick={() => (window.location.href = "/packages")}
                className="px-8 py-2.5 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub, idx) => {
                const start = new Date(sub.startDate || new Date());
                const end = new Date(sub.endDate || new Date());
                const now = new Date();
                const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                const leftDays = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
                const progress = Math.min(100, Math.round(((totalDays - leftDays) / totalDays) * 100));
                const isActive = sub.status === "ACTIVE" && leftDays > 0;

                return (
                  <div key={sub.id || idx} className="bg-white rounded-lg border border-[#E3E6E8] shadow-sm hover:border-[#0074CC]/20 transition-all group">
                    <div className="p-6">
                       <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                          <div className="flex-1 w-full">
                             <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-base font-bold text-[#0A1628]">
                                  {sub.packageName || "Premium Package"}
                                </h2>
                                <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full border ${
                                  isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                  {isActive ? "ACTIVE" : "EXPIRED"}
                                </span>
                             </div>

                             <div className="flex gap-6 mb-5">
                                <div className="space-y-1">
                                   <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Initiated</div>
                                   <div className="text-[11px] font-bold text-gray-700">{start.toLocaleDateString()}</div>
                                </div>
                                <div className="space-y-1">
                                   <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Next Expiry</div>
                                   <div className="text-[11px] font-bold text-gray-700">{end.toLocaleDateString()}</div>
                                </div>
                             </div>

                             <div className="space-y-2">
                                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                                   <div
                                     className={`h-full transition-all duration-1000 ${isActive ? 'bg-[#0074CC]' : 'bg-red-500'}`}
                                     style={{ width: `${progress}%` }}
                                   />
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                                   <span className={isActive ? 'text-green-600' : 'text-red-500'}>
                                      {isActive ? 'Status: Valid' : 'Status: Terminated'}
                                   </span>
                                   <span className="text-gray-400">{leftDays} days remaining</span>
                                </div>
                             </div>
                          </div>

                          {isActive && (
                            <div className="shrink-0 w-full md:w-auto">
                               <VoiceCallButton className="w-full !rounded-lg !py-2.5 !text-[10px] !bg-gray-50 !text-[#0A1628] !shadow-none border border-gray-100 hover:!bg-white" />
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-10 bg-white rounded-lg border border-[#E3E6E8] p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-[#0A1628]/10">
                 <div>
                    <h3 className="text-sm font-bold text-[#0A1628] mb-1">Upgrade your path</h3>
                    <p className="text-[10px] text-gray-400 font-medium">Explore additional stacks to diversify your interview preparation.</p>
                 </div>
                 <button
                   onClick={() => (window.location.href = "/packages")}
                   className="px-6 py-2 bg-gray-50 text-[#0A1628] text-[9px] font-black uppercase tracking-widest rounded-lg border border-gray-100 hover:bg-white hover:border-[#0074CC]/30 transition-all font-sans"
                 >
                   View Catalog
                 </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPage;
