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
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 REQUIRED VALIDATION
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please fill all required fields");
      return;
    }

    // 🔥 EMAIL VALIDATION
    if (!formData.email.includes("@")) {
      toast.error("Enter valid email address");
      return;
    }

    // 🔥 PASSWORD MATCH
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // 🔥 PASSWORD STRENGTH
    if (strength.score < 2) {
      toast.error("Password is too weak");
      return;
    }

    // 🔥 TERMS
    if (!formData.agreed) {
      toast.error("Please agree to the Terms of Service");
      return;
    }

    // 🔥 PHONE VALIDATION
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("Enter valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post("/auth/register", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || null, // ✅ IMPORTANT FIX
        password: formData.password,
      });

      toast.success("Account created successfully!");

      // 🔥 REDIRECT FIX
      const redirectPath = localStorage.getItem("redirectAfterLogin");

      if (redirectPath) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.log("REGISTER ERROR:", error.response?.data); // 🔥 DEBUG

      if (error.response?.status === 409) {
        toast.error("Email already exists");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.response?.data ||
            "Registration failed",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* LEFT PANEL: Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A1628] via-[#112236] to-[#2563EB] flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        <Link to="/" className="flex items-center gap-4 relative z-10">
          <img src="/logo.png" alt="Aja" className="h-10 w-auto brightness-0 invert" />
          <div className="h-8 w-px bg-white/20 mx-1" />
          <div>
            <div className="text-white text-sm font-bold tracking-tight">
              Aja Internship Portal
            </div>
            <div className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest">
              Aja Consulting Services LLP
            </div>
          </div>
        </Link>

        <div className="relative z-10">
          <h2 className="text-5xl font-serif text-white leading-tight mb-8">
            Build Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-bold italic">
              Future In Tech.
            </span> <br />
            Join Us.
          </h2>

          <div className="flex flex-col gap-6 max-w-sm">
            {[
              { t: "9-Month Paid Internship", d: "Hands-on experience with core IT projects." },
              { t: "Employment Pipeline", d: "Top performers get full-time offers at Aja." },
              { t: "Course Track Included", d: "Structured learning paths for every role." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <CheckCircle size={18} className="text-blue-400" />
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

      {/* RIGHT PANEL: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0A1628] tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-gray-400 text-xs font-light mb-6">
              Join the portal to start your professional resource access.
            </p>
            
            {/* INTERNAL EMPLOYEE NOTICE */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <p className="text-[10px] text-blue-700 leading-relaxed font-bold uppercase tracking-wider mb-1">
                Internal Employee Notice
              </p>
              <p className="text-xs text-blue-600 leading-relaxed">
                If you are an <span className="font-bold">Aja internal employee</span>, please login with the credentials given by your administration.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0A1628] uppercase tracking-wider ml-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0A1628] uppercase tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0A1628] uppercase tracking-wider ml-1">Phone (Optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0A1628] uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-4 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0A1628] uppercase tracking-wider ml-1">Confirm</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-4 text-gray-400">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 p-1 cursor-pointer group">
              <input
                type="checkbox"
                name="agreed"
                checked={formData.agreed}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                I agree to the <span className="text-blue-600 font-bold hover:underline">Terms of Service</span> and <span className="text-blue-600 font-bold hover:underline">Privacy Policy</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-[#0A1628] text-white font-bold rounded-2xl hover:bg-blue-700 hover:scale-[1.02] active:scale-100 shadow-xl shadow-blue-900/10 transition-all disabled:opacity-60 disabled:scale-100"
            >
              {loading ? (
                 <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                 </div>
              ) : "Create Professional Account"}
            </button>

            <p className="text-sm text-center text-gray-500 mt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
