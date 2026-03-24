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

const PaymentSuccessPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  // Auto redirect to dashboard after 10 seconds
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
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#0A1628] rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold tracking-wide">
              AIP
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#0A1628] leading-tight">
              Aja Internship Portal
            </div>
            <div className="text-xs text-gray-400 leading-tight">
              Interview Question Bank
            </div>
          </div>
        </Link>

        {/* Success Card */}
        <div className="bg-white rounded-2xl border border-black/8 p-8 text-center shadow-sm">
          {/* Animated Check */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle size={44} className="text-green-500" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl text-[#0A1628] mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-400 font-light text-sm mb-8">
            Welcome aboard{user?.name ? `, ${user.name}` : ""}! Your
            subscription is now active and you have full access.
          </p>

          {/* Subscription Details */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Subscription Details
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Package size={14} className="text-[#2563EB]" />
                  Package
                </div>
                <span className="text-sm font-medium text-[#0A1628]">
                  {user?.packageName || "Your Package"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar size={14} className="text-[#2563EB]" />
                  Start Date
                </div>
                <span className="text-sm font-medium text-[#0A1628]">
                  {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock size={14} className="text-[#2563EB]" />
                  Status
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-600 rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              to="/dashboard"
              className="w-full py-3.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all flex items-center justify-center gap-2"
            >
              Go to My Dashboard
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/packages"
              className="w-full py-3.5 border border-black/10 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-all"
            >
              Browse All Packages
            </Link>
          </div>

          {/* Auto Redirect Note */}
          <p className="text-xs text-gray-300 mt-5">
            Redirecting to dashboard in{" "}
            <span className="text-[#2563EB] font-medium">{countdown}s</span>{" "}
            automatically...
          </p>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          © 2026 Aja Consulting Services LLP. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
