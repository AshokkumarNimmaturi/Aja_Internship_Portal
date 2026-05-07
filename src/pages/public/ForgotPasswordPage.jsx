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
    <div className="min-h-screen bg-transparent flex items-center justify-center px-6 py-12 font-sans relative z-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
            <img src="/logo.png" alt="Aja Logo" className="h-6 w-auto filter brightness-0 invert" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-tight">
              Aja Interview Vault
            </div>
            <div className="text-xs text-purple-400 leading-tight">
              Interview Question Bank
            </div>
          </div>
        </Link>

        <div className="bg-[#0A0D14]/80 backdrop-blur-xl rounded-[2rem] border border-white/10 p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {!sent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-purple-500/20 border border-purple-500/30 shadow-inner rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔑</span>
                </div>
                <h1 className="font-serif text-2xl text-white mb-2 tracking-tight">
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
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 tracking-wide"
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
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h2 className="font-serif text-2xl text-white mb-2">
                Check your inbox!
              </h2>
              <p className="text-sm text-gray-400 font-light leading-relaxed mb-2">
                We sent a password reset link to
              </p>
              <p className="text-sm font-semibold text-purple-400 mb-6">
                {email}
              </p>
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 mb-6 text-left shadow-sm">
                <p className="text-xs text-amber-300 leading-relaxed">
                  The link will expire in <strong>15 minutes</strong>. If you
                  don't see the email, check your spam folder.
                </p>
              </div>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline"
              >
                Try a different email address
              </button>
            </div>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6 pt-5 border-t border-white/10">
            <Link
              to="/login"
              className="text-xs font-bold text-gray-400 hover:text-purple-400 transition-colors flex items-center justify-center gap-1"
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
