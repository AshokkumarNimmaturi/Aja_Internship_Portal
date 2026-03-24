import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      let mockUser = null;
      let mockToken = "mock_token_123";

      const email = formData.email.toLowerCase();
      if (email === "admin@test.com") {
        mockUser = { id: 1, name: "Admin User", role: "ADMIN", isFirstLogin: false };
      } else if (email === "tutor@test.com") {
        mockUser = { id: 2, name: "Tutor User", role: "TUTOR", isFirstLogin: false };
      } else if (email === "employee@test.com") {
        mockUser = { id: 3, name: "Employee User", role: "EMPLOYEE", isFirstLogin: false };
      } else if (email === "student@test.com") {
        mockUser = { id: 4, name: "Student User", role: "SUBSCRIBER", isFirstLogin: false };
      } else {
        throw new Error("Invalid credentials. Try admin@test.com, tutor@test.com, employee@test.com, or student@test.com");
      }

      const user = mockUser;
      const accessToken = mockToken;

      login(user, accessToken);

      toast.success(`Welcome back, ${user.name}!`);

      if (user.isFirstLogin) {
        navigate("/change-password");
        return;
      }

      if (user.role === "ADMIN") navigate("/portal/admin");
      else if (user.role === "TUTOR") navigate("/portal/review");
      else if (user.role === "EMPLOYEE") navigate("/portal/dashboard");
      else navigate("/dashboard");
    } catch (error) {
      const message = error.message;
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
            Welcome to
            <br />
            <em className="text-[#2563EB]">Aja Internship Portal</em>
          </h2>
          <p className="text-white/50 font-light text-sm leading-relaxed mb-10">
            Real questions. Real experience. Real confidence.
          </p>

          <div className="flex flex-col gap-4">
            {[
              "Questions from real employee interviews",
              "Reviewed and rated by expert tutors",
              "Technology-specific packages from ₹299",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-[#2563EB] shrink-0" />
                <span className="text-white/60 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/20 text-xs">
          © 2026 Aja Consulting Services LLP. All rights reserved.
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-[#0A1628] rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">AIP</span>
            </div>
            <span className="text-sm font-semibold text-[#0A1628]">
              Aja Internship Portal
            </span>
          </Link>

          <h1 className="text-2xl font-semibold text-[#0A1628] mb-2">
            Log in to your account
          </h1>
          <p className="text-sm text-gray-400 font-light mb-8">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">
                  Password
                </label>
                {/* ✅ FIXED — was a <button>, now a proper <Link> */}
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#2563EB] hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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
            </div>

            {/* Submit Button */}
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
                  Logging in...
                </span>
              ) : (
                "Log in"
              )}
            </button>

            {/* Internal Staff Note */}
            <p className="text-xs text-center text-gray-400 italic">
              Internal staff — use credentials provided by your administrator.
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-black/5" />
              <span className="text-xs text-gray-300">or</span>
              <div className="flex-1 h-px bg-black/5" />
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-400">
              New here?{" "}
              <Link
                to="/register"
                className="text-[#2563EB] font-medium hover:underline"
              >
                Create a learner account →
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
