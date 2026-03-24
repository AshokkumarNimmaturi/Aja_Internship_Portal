import { useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { Check, ShieldCheck, ArrowLeft, Tag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const packagesData = {
  1: {
    icon: "☕",
    name: "Backend Package",
    techs: "Java · Spring Boot · Microservices · SQL",
  },
  2: {
    icon: "⚛️",
    name: "Frontend Package",
    techs: "React · JavaScript · TypeScript · CSS",
  },
  3: {
    icon: "🐳",
    name: "DevOps Package",
    techs: "Docker · Kubernetes · CI/CD · Linux",
  },
  4: {
    icon: "☁️",
    name: "Salesforce Package",
    techs: "Apex · LWC · SOQL · Flows · Admin",
  },
  5: {
    icon: "🐍",
    name: "Python Package",
    techs: "Core Python · Django · Flask · OOP",
  },
};

const tierData = {
  30: {
    label: "Basic",
    price: 299,
    features: ["Full Q&A Access", "Bookmark Questions", "Search & Filter"],
  },
  90: {
    label: "Standard",
    price: 699,
    features: [
      "Full Q&A Access",
      "Bookmark Questions",
      "Search & Filter",
      "Download Notes",
    ],
  },
  180: {
    label: "Premium",
    price: 1199,
    features: [
      "Full Q&A Access",
      "Bookmark Questions",
      "Search & Filter",
      "Download Notes",
      "Priority Tutor Q&A",
      "Certificate",
    ],
  },
};

const getExpiryDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + Number(days));
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getTodayDate = () => {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const CheckoutPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tierDays = Number(searchParams.get("tier")) || 30;
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const pkg = packagesData[id];
  const tier = tierData[tierDays];
  const gst = Math.round(tier.price * 0.18);
  const total = tier.price + gst;

  if (!pkg || !tier) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#0A1628] mb-3">
            Invalid package or tier
          </h2>
          <Link
            to="/packages"
            className="text-[#2563EB] text-sm hover:underline"
          >
            ← Back to packages
          </Link>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in or register to continue");
      navigate(`/register`);
      return;
    }

    setLoading(true);
    try {
      // Step 1 — Create order on backend
      const orderResponse = await axiosInstance.post("/payment/create-order", {
        packageId: id,
        durationDays: tierDays,
        amount: total,
      });

      const { orderId, amount, currency } = orderResponse.data;

      // Step 2 — Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "Aja Internship Portal",
        description: `${pkg.name} — ${tier.label} Plan`,
        order_id: orderId,
        handler: async (response) => {
          try {
            // Step 3 — Verify payment on backend
            await axiosInstance.post("/payment/verify", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              packageId: id,
              durationDays: tierDays,
            });
            toast.success("Payment successful! Welcome aboard.");
            navigate("/payment/success");
          } catch {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#0A1628" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="pt-28 pb-16 px-6 max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          to={`/packages/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
        >
          <ArrowLeft size={15} /> Back to package
        </Link>

        <h1 className="font-serif text-3xl text-[#0A1628] mb-8">
          Complete Your Order
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT — Order Summary */}
          <div className="flex flex-col gap-5">
            {/* Package Card */}
            <div className="bg-white rounded-2xl border border-black/8 p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Order Summary
              </h2>

              {/* Package Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-5">
                <span className="text-3xl">{pkg.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-[#0A1628]">
                    {pkg.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {pkg.techs}
                  </div>
                </div>
              </div>

              {/* Tier Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tag size={13} className="text-[#2563EB]" />
                  <span className="text-sm text-gray-600">Selected Plan</span>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full">
                  {tier.label} · {tierDays} Days
                </span>
              </div>

              {/* Dates */}
              <div className="flex flex-col gap-2 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Start Date</span>
                  <span className="text-gray-600 font-medium">
                    {getTodayDate()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Expiry Date</span>
                  <span className="text-gray-600 font-medium">
                    {getExpiryDate(tierDays)}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-black/5 mb-4" />

              {/* Price Breakdown */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-700">₹{tier.price}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">GST (18%)</span>
                  <span className="text-gray-700">₹{gst}</span>
                </div>
                <div className="h-px bg-black/5 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#0A1628]">
                    Total
                  </span>
                  <span className="font-serif text-2xl text-[#0A1628]">
                    ₹{total}
                  </span>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-2xl border border-black/8 p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                What's Included
              </h2>
              <div className="flex flex-col gap-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                      <Check size={11} className="text-green-500" />
                    </div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Payment */}
          <div className="flex flex-col gap-5">
            {/* Not logged in warning */}
            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="text-sm font-medium text-amber-800 mb-1">
                  Account Required
                </p>
                <p className="text-xs text-amber-700 leading-relaxed mb-3">
                  You need to create a free account before completing your
                  purchase.
                </p>
                <div className="flex gap-2">
                  <Link
                    to="/register"
                    className="text-xs px-4 py-2 bg-[#0A1628] text-white rounded-lg hover:bg-[#0F2340] transition-all"
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/login"
                    className="text-xs px-4 py-2 border border-black/10 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            )}

            {/* Payment Card */}
            <div className="bg-white rounded-2xl border border-black/8 p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">
                Payment
              </h2>

              {/* Total Display */}
              <div className="text-center mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">Amount to Pay</div>
                <div className="font-serif text-4xl text-[#0A1628]">
                  ₹{total}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {pkg.name} · {tier.label} · {tierDays} days
                </div>
              </div>

              {/* Razorpay Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 bg-[#F97316] text-white text-sm font-semibold rounded-xl hover:bg-[#EA6C0B] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Pay ₹{total} Securely
                  </>
                )}
              </button>

              {/* Razorpay Badge */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <ShieldCheck size={13} className="text-gray-300" />
                <span className="text-xs text-gray-300">
                  Secured by Razorpay
                </span>
              </div>

              {/* Success Note */}
              <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-green-50 rounded-xl">
                <Check size={13} className="text-green-500 shrink-0" />
                <span className="text-xs text-green-700">
                  You will get instant access after successful payment
                </span>
              </div>

              {/* Accepted Payments */}
              <div className="mt-5">
                <p className="text-xs text-center text-gray-300 mb-3">
                  Accepted payment methods
                </p>
                <div className="flex items-center justify-center gap-3">
                  {["UPI", "Visa", "Mastercard", "Net Banking"].map(
                    (method) => (
                      <span
                        key={method}
                        className="text-xs px-2.5 py-1 border border-black/5 text-gray-400 rounded-lg bg-gray-50"
                      >
                        {method}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-white rounded-2xl border border-black/8 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="text-[#2563EB] shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-xs font-semibold text-[#0A1628] mb-1">
                    100% Secure Payment
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your payment is processed securely by Razorpay. We never
                    store your card details. All transactions are encrypted with
                    256-bit SSL.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
