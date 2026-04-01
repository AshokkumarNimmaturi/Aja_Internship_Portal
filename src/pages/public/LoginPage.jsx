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
    <div className="min-h-screen flex font-sans">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1628] flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">AIP</span>
          </div>
          <div>
            <div className="text-white text-sm font-semibold">
              Aja Internship Portal
            </div>
            <div className="text-white/40 text-xs">
              Interview Question Bank
            </div>
          </div>
        </Link>

        <div>
          <h2 className="text-4xl text-white mb-4">
            Welcome to <br />
            <span className="text-[#2563EB]">
              Aja Internship Portal
            </span>
          </h2>

          <div className="flex flex-col gap-4">
            {[
              "Questions from real interviews",
              "Reviewed by expert tutors",
              "Packages from ₹299",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-[#2563EB]" />
                <span className="text-white/60 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-2">
            Log in to your account
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* EMAIL */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="px-4 py-3 border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="py-3 bg-[#0A1628] text-white rounded-xl hover:bg-[#0F2340] transition disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* LINKS */}
            <Link to="/forgot-password" className="text-blue-500 text-sm">
              Forgot password?
            </Link>

            <p className="text-sm text-center">
              New user?{" "}
              <Link to="/register" className="text-blue-500 font-medium">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;