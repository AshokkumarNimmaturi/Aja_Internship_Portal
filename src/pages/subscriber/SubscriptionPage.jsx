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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden portal-modern">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center py-10 px-4 overflow-y-auto w-full">
        <div className="w-full max-w-4xl mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0A1628]">My Subscriptions</h1>
        <button
          onClick={() => (window.location.href = "/packages")}
          className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
        >
          Browse Packages
        </button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-black/5 w-full max-w-3xl flex flex-col items-center text-center">
          <div className="text-5xl mb-4">💳</div>
          <h2 className="text-xl font-semibold mb-2 text-[#0A1628]">No Active Subscription</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            You haven't unlocked any of our premium packages yet. Purchase a package to get full access to the interview question bank.
          </p>
          <button
            onClick={() => (window.location.href = "/packages")}
            className="px-6 py-3 bg-[#0A1628] text-white font-medium rounded-xl hover:bg-gray-800 transition"
          >
            Explore Packages
          </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl flex flex-col gap-5">
          {subscriptions.map((sub, idx) => {
            const start = new Date(sub.startDate || new Date());
            const end = new Date(sub.endDate || new Date());
            const now = new Date();
            const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            const leftDays = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
            const used = totalDays - leftDays;
            const progress = Math.min(100, Math.round((used / totalDays) * 100));
            const isActive = sub.status === "ACTIVE" || leftDays > 0;

            return (
              <div key={sub.id || idx} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-black/5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition hover:shadow-md">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-[#0A1628]">
                      {sub.packageName || "Premium Package"}
                    </h2>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {sub.status || (isActive ? "ACTIVE" : "EXPIRED")}
                    </span>
                  </div>

                  {/* DATES */}
                  <div className="flex gap-4 text-sm text-gray-500 mt-1 mb-4">
                    <p>Start: <span className="text-gray-700 font-medium">{start.toLocaleDateString()}</span></p>
                    <p>Expires: <span className="text-gray-700 font-medium">{end.toLocaleDateString()}</span></p>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-500 ${isActive ? 'bg-[#2563EB]' : 'bg-red-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  {/* WARNINGS */}
                  <div className="flex justify-between items-center text-xs mt-2">
                    {leftDays === 0 ? (
                      <span className="text-red-600 font-medium flex items-center gap-1">❌ Subscription expired</span>
                    ) : leftDays <= 3 ? (
                      <span className="text-orange-500 font-medium flex items-center gap-1">⚠️ Expiring soon!</span>
                    ) : (
                      <span className="text-green-600 font-medium flex items-center gap-1">✅ Active</span>
                    )}
                    <span className="font-semibold text-gray-700">{leftDays} days remaining</span>
                  </div>
                  
                  {isActive && (
                    <div className="mt-6 border-t border-black/5 pt-6">
                      <VoiceCallButton />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="mt-4 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Looking for more topics?</h3>
              <p className="text-sm text-blue-700">Explore additional packages and expand your interview prep.</p>
            </div>
            <button
              onClick={() => (window.location.href = "/packages")}
              className="shrink-0 px-6 py-2.5 bg-white text-blue-700 font-semibold rounded-xl shadow-sm hover:shadow transition"
            >
              View More Packages
            </button>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

export default SubscriptionPage;
