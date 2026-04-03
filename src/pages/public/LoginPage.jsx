import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeSlash, HiCheckCircle } from "react-icons/hi2";
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const user = res.data.user;
      const accessToken = res.data.accessToken;

      // ✅ STORE TOKEN (ONLY ONE SOURCE)
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Update AuthContext (no duplication issue now)
      login(user, accessToken);

      toast.success(`Welcome back, ${user.fullName}!`);

      // 🔥 REDIRECT AFTER LOGIN
      const redirectPath = localStorage.getItem("redirectAfterLogin");

      if (redirectPath) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
        return;
      }

      // First login
      if (user.firstLogin) {
        navigate("/change-password");
        return;
      }

      // Role-based routing
      if (user.role === "ADMIN") navigate("/portal/admin");
      else if (user.role === "TUTOR") navigate("/portal/review");
      else if (user.role === "EMPLOYEE") navigate("/portal/dashboard");
      else navigate("/dashboard");

    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* LEFT PANEL: Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A1628] via-[#112236] to-[#2563EB] flex-col justify-between p-16 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        <Link to="/" className="flex items-center gap-4 relative z-10">
          <img src="/logo.png" alt="Aja" className="h-10 w-auto brightness-0 invert" />
          <div className="h-8 w-px bg-white/20 mx-1" />
          <div>
            <div className="text-white text-sm font-bold tracking-tight">
              Aja Interview Vault
            </div>
            <div className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest">
              Aja Consulting Services LLP
            </div>
          </div>
        </Link>

        <div className="relative z-10">
          <h2 className="text-5xl font-serif text-white leading-tight mb-8">
            Start Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-bold italic">
              IT Career Journey
            </span> <br />
            Today.
          </h2>

          <div className="flex flex-col gap-6 max-w-sm">
            {[
              { t: "Internship to Employment", d: "A clear path from learning to full-time hiring." },
              { t: "Expert-Led Training", d: "Learn from veterans with 10+ years experience." },
              { t: "Verified Interview Bank", d: "Real questions from real tech assessments." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <HiCheckCircle size={18} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{item.t}</div>
                  <div className="text-white/40 text-xs mt-0.5">{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
          © 2026 AJA CONSULTING SERVICES LLP
        </div>
      </div>

      {/* RIGHT PANEL: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#0A1628] tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Log in to access your dashboard and courses.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0A1628] uppercase tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-[#0A1628] uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" size={18} className="text-blue-600 text-xs font-bold hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 bg-[#0A1628] text-white font-bold rounded-2xl hover:bg-blue-700 hover:scale-[1.02] active:scale-100 shadow-xl shadow-blue-900/10 transition-all disabled:opacity-60 disabled:scale-100"
            >
              {loading ? (
                 <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                 </div>
              ) : "Sign In to Portal"}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account yet?{" "}
                <Link to="/register" className="text-blue-600 font-bold hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;