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
            <div className="text-white/40 text-xs">Interview Question Bank</div>
          </div>
        </Link>

        <div>
          <h2 className="text-4xl text-white mb-4">
            Start Your Journey
            <br />
            <span className="text-[#2563EB]">To Interview Success</span>
          </h2>

          <div className="flex flex-col gap-4">
            {[
              "Access 500+ real interview questions",
              "Reviewed by expert tutors",
              "Choose your technology track",
              "Start from just ₹299",
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
          <h1 className="text-2xl font-semibold mb-2">Create Your Account</h1>
          
          {/* AJA EMPLOYEE NOTICE */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-6">
            <Info size={18} className="text-[#2563EB] shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              If you are an employee of <span className="font-bold">Aja Consulting Services LLP</span>, please login with the credentials given by your administration.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="px-4 py-3 border rounded-xl"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="px-4 py-3 border rounded-xl"
            />

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone (optional)"
              className="px-4 py-3 border rounded-xl"
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="px-4 py-3 border rounded-xl w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* CONFIRM */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="px-4 py-3 border rounded-xl w-full"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3"
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                name="agreed"
                checked={formData.agreed}
                onChange={handleChange}
              />
              I agree to Terms & Privacy
            </label>

            <button
              type="submit"
              disabled={loading}
              className="py-3 bg-[#0A1628] text-white rounded-xl"
            >
              {loading ? "Creating..." : "Register"}
            </button>

            <p className="text-sm text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
