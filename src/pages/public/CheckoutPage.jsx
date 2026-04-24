import { useState, useEffect } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { HiCheck, HiShieldCheck, HiArrowLeft, HiTag } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { fetchPackageById } from "../../api/packageApi";
import { createOrder, verifyPayment } from "../../api/paymentApi";
import toast from "react-hot-toast";

const tierFeatures = {
  30: {
    label: "Basic",
    features: ["Full Q&A Access", "Bookmark Questions", "Search & Filter"],
  },
  90: {
    label: "Standard",
    features: [
      "Full Q&A Access",
      "Bookmark Questions",
      "Search & Filter",
      "Download Notes",
    ],
  },
  180: {
    label: "Premium",
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

const getIcon = (name) => {
  if (!name) return "📦";
  const lower = name.toLowerCase();
  if (lower.includes("backend") || lower.includes("java")) return "☕";
  if (lower.includes("frontend") || lower.includes("react")) return "⚛️";
  if (lower.includes("devops") || lower.includes("docker")) return "🐳";
  if (lower.includes("salesforce")) return "☁️";
  if (lower.includes("python")) return "🐍";
  return "📦";
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
  const [pageLoading, setPageLoading] = useState(true);
   const [pkg, setPkg] = useState(null);
  const [vpa, setVpa] = useState("");
  
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await fetchPackageById(id);
        setPkg(res.data);
      } catch (error) {
        toast.error("Package not found");
      } finally {
        setPageLoading(false);
      }
    };
    fetchPackage();
  }, [id]);

  const tier = tierFeatures[tierDays];

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

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

  const getPrice = () => {
    if (tierDays === 30) return pkg.basicPrice;
    if (tierDays === 90) return pkg.standardPrice;
    return pkg.premiumPrice;
  };

  const price = getPrice();
  const gst = Math.round(price * 0.18);
  const total = price + gst;

  const handlePayment = async () => {
    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", `/checkout/${id}?tier=${tierDays}`);
      toast.error("Please log in or register to continue");
      navigate(`/register`);
      return;
    }

    setLoading(true);
    try {
      // Step 1 — Create order on backend
      const orderResponse = await createOrder({
        packageId: Number(id),
        tier: tier.label.toUpperCase(),
      });

      const { razorpayOrderId, razorpayKeyId, amount } = orderResponse.data;

      // Step 2 — Open Razorpay
      const options = {
        key: razorpayKeyId,
        amount: amount * 100,
        currency: "INR",
        name: "Aja Interview Vault",
        description: `${pkg.name} — ${tier.label} Plan`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            // Step 3 — Verify payment on backend
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment successful! Welcome aboard.");
            navigate("/payment/success");
          } catch {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
          contact: user?.phone || "",
          method: vpa ? "upi" : undefined,
        },
        vpa: vpa || undefined,
        theme: { color: "#3399cc" },
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <Navbar />

      <div className="pt-28 pb-16 px-6 max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          to={`/packages/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
        >
          <HiArrowLeft size={15} /> Back to package
        </Link>

        <h1 className="font-serif text-4xl font-bold text-[#0A1628] mb-8 tracking-tighter">
          Complete Your Order
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
          {/* LEFT — Order Summary */}
          <div className="flex flex-col gap-8">
            {/* Package Card */}
            <div className="figma-card rounded-3xl p-8">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Order Summary
              </h2>

              {/* Package Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-5">
                <span className="text-3xl">{getIcon(pkg.name)}</span>
                <div>
                  <div className="text-sm font-semibold text-[#0A1628]">
                    {pkg.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {pkg.technologyName || "Technology Package"}
                  </div>
                </div>
              </div>

              {/* Tier Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HiTag size={13} className="text-[#2563EB]" />
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
                  <span className="text-gray-700">₹{price}</span>
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
            <div className="figma-card rounded-3xl p-8">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                What's Included
              </h2>
              <div className="flex flex-col gap-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                      <HiCheck size={11} className="text-green-500" />
                    </div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Payment */}
          <div className="flex flex-col gap-8 animation-delay-200">
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
                  <button
                    onClick={() => {
                      localStorage.setItem("redirectAfterLogin", `/checkout/${id}?tier=${tierDays}`);
                      navigate("/register");
                    }}
                    className="text-xs px-4 py-2 bg-[#0A1628] text-white rounded-lg hover:bg-[#0F2340] transition-all"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem("redirectAfterLogin", `/checkout/${id}?tier=${tierDays}`);
                      navigate("/login");
                    }}
                    className="text-xs px-4 py-2 border border-black/10 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Log In
                  </button>
                </div>
              </div>
            )}

            {/* Payment Card */}
            <div className="figma-card rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 apple-transition pointer-events-none" />
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6 relative z-10">
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

              {/* UPI ID Input (Optional) */}
              <div className="mb-6 group/input">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 transition-colors group-focus-within/input:text-[#2563EB]">
                  Enter UPI ID (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={vpa}
                    onChange={(e) => setVpa(e.target.value)}
                    placeholder="e.g. username@okaxis"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-300"
                  />
                  {vpa && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-1 rounded-md animate-fade-in">
                      DIRECT PAY ENABLED
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest">
                  Leave empty to get a <span className="text-[#0A1628] font-bold">QR Code</span> instead
                </p>
              </div>

              {/* Razorpay Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 razorpay-official-button text-sm font-bold uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative z-10"
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
                    <HiShieldCheck size={16} />
                    Pay ₹{total} Securely
                  </>
                )}
              </button>

              {/* Razorpay Badge */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <HiShieldCheck size={13} className="text-gray-300" />
                <span className="text-xs text-gray-300">
                  Secured by Razorpay
                </span>
              </div>

              {/* Success Note */}
              <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-green-50 rounded-xl">
                <HiCheck size={13} className="text-green-500 shrink-0" />
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
            <div className="figma-card rounded-3xl p-6">
              <div className="flex items-start gap-3">
                <HiShieldCheck
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
