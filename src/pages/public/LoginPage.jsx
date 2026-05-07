import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeSlash, HiCheckCircle } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api/authApi";
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
      const res = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      const user = res.data.user;
      const accessToken = res.data.accessToken;
      const refreshToken = res.data.refreshToken;

      // ✅ STORE TOKEN (ONLY ONE SOURCE)
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Update AuthContext (no duplication issue now)
      login(user, accessToken, refreshToken);

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
    <div className="min-h-screen flex font-sans bg-transparent">
      {/* LEFT PANEL: Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 mesh-bg flex-col justify-between p-16 relative overflow-hidden">
        <div className="animated-grid-bg" />
        {/* Abstract Background Decoration */}
        <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float animation-delay-200" />

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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400 font-bold italic">
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 animate-fade-in-up">
        <div className="w-full max-w-md bg-[#0A0D14]/80 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 rounded-[2.5rem]">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Log in to access your dashboard and courses.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                required
                className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-white placeholder-gray-500 transition-all text-sm hover:border-white/20"
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-1">Password</label>
                <Link to="/forgot-password" size={18} className="text-purple-400 text-[10px] tracking-widest uppercase font-bold hover:underline">
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
                  className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-white placeholder-gray-500 transition-all text-sm hover:border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white rounded-2xl flex justify-center items-center relative overflow-hidden group tracking-wider font-bold transition-all"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              <span className="relative z-10">
              {loading ? (
                 <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                 </div>
              ) : "Sign In to Portal"}
              </span>
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account yet?{" "}
                <Link to="/register" className="text-purple-400 font-bold hover:underline">
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