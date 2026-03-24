import { Link } from "react-router-dom";
import { CheckCircle, Calendar, Package, Clock, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const paymentHistory = [
  {
    date: "13 Mar 2026",
    package: "Frontend Package",
    amount: "₹824",
    status: "Success",
  },
  {
    date: "13 Dec 2025",
    package: "Backend Package",
    amount: "₹824",
    status: "Success",
  },
];

const SubscriptionPage = () => {
  const { user } = useAuth();
  const daysTotal = 90;
  const daysLeft = 24;
  const daysUsed = daysTotal - daysLeft;
  const progress = Math.round((daysUsed / daysTotal) * 100);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-black/5 min-h-screen flex flex-col">
        <div className="p-6 border-b border-black/5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0A1628] rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">AIP</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#0A1628] leading-tight">
                Aja Internship Portal
              </div>
              <div className="text-xs text-gray-400 leading-tight">
                Interview Question Bank
              </div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {[
            { label: "Dashboard", icon: "🏠", path: "/dashboard" },
            { label: "My Questions", icon: "📚", path: "/dashboard/questions" },
            { label: "Bookmarks", icon: "🔖", path: "/dashboard/bookmarks" },
            {
              label: "My Subscription",
              icon: "💳",
              path: "/dashboard/subscription",
              active: true,
            },
            { label: "Profile", icon: "👤", path: "/dashboard/profile" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                item.active
                  ? "bg-blue-50 text-[#2563EB] font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-black/5 flex flex-col gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700">
              Active · {daysLeft} days left
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A1628] to-[#2563EB] text-white text-xs font-semibold flex items-center justify-center">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="text-xs font-medium text-[#0A1628]">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-gray-400">Subscriber</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-[#0A1628] mb-1">
            My Subscription
          </h1>
          <p className="text-sm text-gray-400 font-light">
            Manage your active subscription and view payment history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Card */}
          <div className="bg-white border border-black/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                Current Plan
              </h2>
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-green-50 text-green-600 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Active
              </span>
            </div>

            {/* Package Info */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">⚛️</span>
              <div>
                <div className="text-base font-semibold text-[#0A1628]">
                  Frontend Package
                </div>
                <div className="text-xs text-gray-400">
                  Standard Plan · 90 Days
                </div>
              </div>
            </div>

            {/* Days Countdown */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#2563EB]" />
                <span className="text-sm text-gray-500">Days Remaining</span>
              </div>
              <span className="font-serif text-3xl text-[#0A1628]">
                {daysLeft}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#2563EB] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-300">
              <span>{daysUsed} days used</span>
              <span>{daysLeft} days left</span>
            </div>

            {/* Dates */}
            <div className="mt-5 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <Calendar size={13} className="text-[#2563EB]" />
                  Start Date
                </span>
                <span className="font-medium text-[#0A1628]">13 Mar 2026</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <Calendar size={13} className="text-[#2563EB]" />
                  Expiry Date
                </span>
                <span className="font-medium text-[#0A1628]">11 Jun 2026</span>
              </div>
            </div>

            {/* Renew Button */}
            <Link
              to="/packages"
              className="flex items-center justify-center gap-2 w-full mt-6 py-3 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all"
            >
              <RefreshCw size={14} />
              Renew / Upgrade Plan
            </Link>
          </div>

          {/* What's Included */}
          <div className="bg-white border border-black/8 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-5">
              What's Included
            </h2>
            <div className="flex flex-col gap-3">
              {[
                "Full Q&A Access to Frontend Package",
                "Bookmark Questions",
                "Search and Filter by Difficulty",
                "Download Notes",
                "Access to 110+ Questions",
                "Regular Content Updates",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle size={12} className="text-green-500" />
                  </div>
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </div>

            {/* Upgrade Note */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Want more?</strong> Upgrade to Premium for Priority
                Tutor Q&A and a Certificate of Completion.
              </p>
              <Link
                to="/packages"
                className="text-xs text-[#2563EB] font-medium hover:underline mt-1 block"
              >
                View Premium Plan →
              </Link>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white border border-black/8 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-5">
            Payment History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">
                    Package
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">
                    Amount
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, i) => (
                  <tr
                    key={i}
                    className="border-b border-black/5 last:border-b-0"
                  >
                    <td className="py-3 text-sm text-gray-600">
                      {payment.date}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {payment.package}
                    </td>
                    <td className="py-3 text-sm font-medium text-[#0A1628]">
                      {payment.amount}
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-medium px-2.5 py-1 bg-green-50 text-green-600 rounded-full">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPage;
