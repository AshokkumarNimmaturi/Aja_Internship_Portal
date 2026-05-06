import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// ✅ UPGRADED: Using elite Heroicons 2
import { HiBars3, HiXMark } from "react-icons/hi2";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (user?.role === "SUBSCRIBER") return "/dashboard";
    if (user?.role === "ADMIN") return "/portal/admin";
    if (user?.role === "TUTOR") return "/portal/review";
    if (user?.role === "EMPLOYEE") return "/portal/dashboard";
    return "/dashboard";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[#0B0E14]/90 backdrop-blur-md shadow-lg shadow-purple-500/10 border-b border-white/10"
          : "bg-transparent border-b border-white/5"
      } h-20 flex items-center`}
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        {/* Left - Branding */}
        <Link to="/" className="flex items-center gap-3 w-1/4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-white/10 border border-white/20 backdrop-blur-md">
            <img src="/logo.png" alt="Aja Logo" className="h-7 w-auto filter brightness-0 invert" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold leading-tight text-white">
              Aja Interview Vault
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider leading-tight text-purple-300">
              Aja Consulting Services LLP
            </div>
          </div>
        </Link>

        {/* Center - Links */}
        <div className="hidden md:flex items-center justify-center gap-10 flex-1">
          <Link
            to="/"
            className="text-sm font-medium transition-colors relative group text-gray-300 hover:text-white"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full bg-purple-500" />
          </Link>
          <Link
            to="/packages"
            className="text-sm font-medium transition-colors relative group text-gray-300 hover:text-white"
          >
            Packages
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full bg-purple-500" />
          </Link>
        </div>

        {/* Right - Auth */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                className="text-xs font-bold px-5 py-2.5 rounded-xl transition-all border border-white/20 text-white hover:bg-white/10"
              >
                My Portal
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-bold px-5 py-2.5 rounded-xl transition-all bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-bold px-6 py-2.5 transition-all text-gray-300 hover:text-white"
              >
                Log in
              </button>
              <Link
                to="/register"
                className="text-sm font-bold px-6 py-2.5 rounded-xl transition-all bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 rounded-xl border bg-white/10 border-white/20" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <HiXMark size={22} className="text-white" /> : <HiBars3 size={22} className="text-white" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 border-b px-6 py-4 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-2 duration-300 bg-[#0B0E14] border-white/10 shadow-purple-900/20">
          <Link
            to="/"
            className="text-sm font-bold text-gray-300 hover:text-white py-2"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/packages"
            className="text-sm font-bold text-gray-300 hover:text-white py-2"
            onClick={() => setMenuOpen(false)}
          >
            Packages
          </Link>
          <div className="h-px bg-white/10 my-2" />
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                className="text-sm font-bold text-white py-2"
                onClick={() => setMenuOpen(false)}
              >
                My Portal
              </Link>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="text-sm font-bold text-red-400 py-2 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-bold text-gray-300 hover:text-white py-2"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold bg-purple-600 text-white px-6 py-3 rounded-xl text-center shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
