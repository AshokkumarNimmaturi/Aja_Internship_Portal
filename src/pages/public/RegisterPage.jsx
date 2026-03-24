import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, Info } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const getPasswordStrength = (password) => {
  if (password.length === 0) return { score: 0, label: "", color: "" };
  if (password.length < 6)
    return { score: 1, label: "Weak", color: "bg-red-400" };
  if (
    password.length < 10 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  )
    return { score: 2, label: "Medium", color: "bg-amber-400" };
  return { score: 3, label: "Strong", color: "bg-green-500" };
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!formData.agreed) {
      toast.error("Please agree to the Terms of Service");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/auth/register", {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "SUBSCRIBER",
      });
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* LEFT — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1628] flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold tracking-wide">
              AIP
            </span>
          </div>
          <div>
            <div className="text-white text-sm font-semibold leading-tight">
              Aja Internship Portal
            </div>
            <div className="text-white/40 text-xs leading-tight">
              Interview Question Bank
            </div>
          </div>
        </Link>

        <div>
          <h2 className="font-serif text-4xl text-white leading-snug mb-4">
            Start Your Journey
            <br />
            <em className="text-[#2563EB]">To Interview Success</em>
          </h2>
          <p className="text-white/50 font-light text-sm leading-relaxed mb-10">
            Join thousands of learners who cracked their tech interviews using
            real questions from our consultancy.
          </p>

          <div className="flex flex-col gap-4">
            {[
              "Access 500+ real interview questions",
              "Questions reviewed by expert tutors",
              "Choose your technology track",
              "Start from just ₹299 for 30 days",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-[#2563EB] shrink-0" />
                <span className="text-white/60 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/20 text-xs">
          © 2026 Aja Consultancy. All rights reserved.
        </div>
      </div>

      {/* RIGHT — Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-[#0A1628] rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">AIP</span>
            </div>
            <span className="text-sm font-semibold text-[#0A1628]">
              Aja Internship Portal
            </span>
          </Link>

          <h1 className="text-2xl font-semibold text-[#0A1628] mb-2">
            Create Your Learner Account
          </h1>
          <p className="text-sm text-gray-400 font-light mb-6">
            Get access to real interview questions from industry experts
          </p>

          {/* Info Box */}
          <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <Info size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              This registration is for <strong>external learners only.</strong>{" "}
              If you are an Aja Consulting Services employee, please{" "}
              <Link to="/login" className="underline font-medium">
                log in with credentials
              </Link>{" "}
              provided by your administrator.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Phone Number{" "}
                <span className="text-gray-300 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength Bar */}
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          s <= strength.score ? strength.color : "bg-gray-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      strength.score === 1
                        ? "text-red-500"
                        : strength.score === 2
                          ? "text-amber-500"
                          : "text-green-600"
                    }`}
                  >
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  required
                  className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all pr-12 ${
                    formData.confirmPassword.length > 0 &&
                    formData.confirmPassword !== formData.password
                      ? "border-red-300 focus:border-red-400"
                      : "border-black/10 focus:border-[#2563EB]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formData.confirmPassword.length > 0 &&
                formData.confirmPassword !== formData.password && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="agreed"
                checked={formData.agreed}
                onChange={handleChange}
                className="mt-0.5 accent-[#2563EB]"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                I agree to the{" "}
                <span className="text-[#2563EB] hover:underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-[#2563EB] hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
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
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#2563EB] font-medium hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
