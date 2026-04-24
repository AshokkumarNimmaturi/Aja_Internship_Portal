import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/authApi";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);

      setSent(true);
      toast.success("Reset link sent!");
    } catch (error) {
      toast.error("Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

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
          {!sent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔑</span>
                </div>
                <h1 className="font-serif text-2xl text-[#0A1628] mb-2">
                  Forgot your password?
                </h1>
                <p className="text-sm text-gray-400 font-light leading-relaxed">
                  Enter your registered email address and we will send you a
                  link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h2 className="font-serif text-2xl text-[#0A1628] mb-2">
                Check your inbox!
              </h2>
              <p className="text-sm text-gray-400 font-light leading-relaxed mb-2">
                We sent a password reset link to
              </p>
              <p className="text-sm font-semibold text-[#0A1628] mb-6">
                {email}
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-amber-700 leading-relaxed">
                  The link will expire in <strong>15 minutes</strong>. If you
                  don't see the email, check your spam folder.
                </p>
              </div>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="text-xs text-[#2563EB] hover:underline"
              >
                Try a different email address
              </button>
            </div>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6 pt-5 border-t border-black/5">
            <Link
              to="/login"
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
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

export default ForgotPasswordPage;
