import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/authApi";
import toast from "react-hot-toast";

const rules = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character (!@#$)", test: (p) => /[!@#$%^&*]/.test(p) },
];

const getStrength = (password) => {
  const passed = rules.filter((r) => r.test(password)).length;
  if (passed <= 1)
    return { label: "Weak", color: "bg-red-400", width: "w-1/5" };
  if (passed === 2)
    return { label: "Fair", color: "bg-orange-400", width: "w-2/5" };
  if (passed === 3)
    return { label: "Good", color: "bg-amber-400", width: "w-3/5" };
  if (passed === 4)
    return { label: "Strong", color: "bg-blue-400", width: "w-4/5" };
  return { label: "Very Strong", color: "bg-green-500", width: "w-full" };
};

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);
  const allRulesPassed = rules.every((r) => r.test(password));
  const passwordsMatch = password === confirm && confirm.length > 0;
  const isValid = allRulesPassed && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Please meet all password requirements");
      return;
    }
    if (!token) {
      toast.error("Invalid or expired reset link");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        token,
        newPassword: password,
        confirmPassword: confirm,
      });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Reset failed. Link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 font-sans">
        <div className="bg-white rounded-2xl border border-black/8 p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-serif text-xl text-[#0A1628] mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/forgot-password"
            className="block w-full py-3 bg-[#0A1628] text-white text-sm font-medium rounded-xl text-center hover:bg-[#0F2340] transition-all"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

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
              Aja Interview Vault
            </div>
            <div className="text-xs text-gray-400 leading-tight">
              Interview Question Bank
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-black/8 p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h1 className="font-serif text-2xl text-[#0A1628] mb-2">
              Reset your password
            </h1>
            <p className="text-sm text-gray-400 font-light">
              Enter a new strong password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 text-xs transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Strength Bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                    />
                  </div>
                  <p
                    className={`text-xs mt-1 font-medium ${strength.color.replace("bg-", "text-")}`}
                  >
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
                className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${
                  confirm.length > 0
                    ? passwordsMatch
                      ? "border-green-400 focus:border-green-400 focus:ring-green-50"
                      : "border-red-300 focus:border-red-400 focus:ring-red-50"
                    : "border-black/10 focus:border-[#2563EB] focus:ring-blue-50"
                }`}
              />
              {confirm.length > 0 && (
                <p
                  className={`text-xs mt-1 ${passwordsMatch ? "text-green-500" : "text-red-400"}`}
                >
                  {passwordsMatch
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Password Rules */}
            {password.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-black/5">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Password requirements:
                </p>
                <div className="flex flex-col gap-1.5">
                  {rules.map((rule) => (
                    <div key={rule.label} className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-xs shrink-0 ${
                          rule.test(password) ? "bg-green-500" : "bg-gray-200"
                        }`}
                      >
                        {rule.test(password) ? "✓" : ""}
                      </div>
                      <span
                        className={`text-xs ${rule.test(password) ? "text-green-600" : "text-gray-400"}`}
                      >
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full py-3.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
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
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-black/5">
            <Link
              to="/login"
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          © 2026 Aja Consultancy. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
