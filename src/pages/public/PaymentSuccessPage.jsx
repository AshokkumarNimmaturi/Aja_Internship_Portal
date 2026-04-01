import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  Package,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

const PaymentSuccessPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(10);
  const [subscription, setSubscription] = useState(null);

  // ✅ FETCH SUBSCRIPTION (REAL DATA)
  const fetchSubscription = async () => {
    try {
      const res = await axiosInstance.get("/subscriptions/my");
      setSubscription(res.data);
    } catch (error) {
      console.error("Failed to fetch subscription");
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  // ✅ AUTO REDIRECT
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12 font-sans">
      <div className="w-full max-w-md">
        {/* LOGO */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#0A1628] rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">AIP</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#0A1628]">
              Aja Internship Portal
            </div>
            <div className="text-xs text-gray-400">Interview Question Bank</div>
          </div>
        </Link>

        {/* CARD */}
        <div className="bg-white rounded-2xl border p-8 text-center shadow-sm">
          {/* ICON */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle size={44} className="text-green-500" />
            </div>
          </div>

          {/* TITLE */}
          <h1 className="text-3xl font-semibold text-[#0A1628] mb-2">
            Payment Successful!
          </h1>

          <p className="text-gray-400 text-sm mb-8">
            Welcome aboard{user?.fullName ? `, ${user.fullName}` : ""}! 🎉
          </p>

          {/* SUBSCRIPTION DETAILS */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left">
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-4">
              Subscription Details
            </h2>

            <div className="flex flex-col gap-3">
              {/* PACKAGE */}
              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Package size={14} />
                  Package
                </div>
                <span className="text-sm font-medium text-[#0A1628]">
                  {subscription?.packageName || "Your Package"}
                </span>
              </div>

              {/* START DATE */}
              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar size={14} />
                  Start Date
                </div>
                <span className="text-sm font-medium text-[#0A1628]">
                  {subscription?.startDate
                    ? new Date(subscription.startDate).toLocaleDateString(
                        "en-IN",
                      )
                    : new Date().toLocaleDateString("en-IN")}
                </span>
              </div>

              {/* STATUS */}
              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock size={14} />
                  Status
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-600 rounded-full">
                  {subscription?.status || "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col gap-3">
            <Link
              to="/dashboard"
              className="py-3 bg-[#0A1628] text-white rounded-xl flex justify-center gap-2"
            >
              Go to Dashboard <ArrowRight size={14} />
            </Link>

            <Link
              to="/packages"
              className="py-3 border rounded-xl text-gray-600"
            >
              Browse Packages
            </Link>
          </div>

          {/* COUNTDOWN */}
          <p className="text-xs text-gray-400 mt-5">
            Redirecting in <span className="text-blue-500">{countdown}s</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
