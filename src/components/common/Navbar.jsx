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
        scrolled ? "bg-white/95 backdrop-blur-md shadow-lg shadow-black/5" : "bg-white"
      } border-b border-black/5 h-20 flex items-center`}
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        {/* Left - Branding */}
        <Link to="/" className="flex items-center gap-3 w-1/4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-black/5 shadow-sm">
            <img src="/logo.png" alt="Aja Logo" className="h-7 w-auto" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-[#0D0D0D] leading-tight">
              Aja Interview Vault
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-tight">
              Aja Consulting Services LLP
            </div>
          </div>
        </Link>

        {/* Center - Links */}
        <div className="hidden md:flex items-center justify-center gap-10 flex-1">
          <Link
            to="/"
            className="text-sm font-medium text-gray-500 hover:text-[#2563EB] transition-colors relative group"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-full" />
          </Link>
          <Link
            to="/packages"
            className="text-sm font-medium text-gray-500 hover:text-[#2563EB] transition-colors relative group"
          >
            Packages
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-full" />
          </Link>
        </div>

        {/* Right - Auth */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                className="text-xs font-bold px-5 py-2.5 border border-black/10 rounded-xl text-[#0D0D0D] hover:bg-gray-50 transition-all"
              >
                My Portal
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-bold px-5 py-2.5 bg-[#0D0D0D] text-white rounded-xl hover:bg-gray-800 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-bold px-6 py-2.5 text-gray-500 hover:text-[#0D0D0D] transition-all"
              >
                Log in
              </button>
              <Link
                to="/register"
                className="text-sm font-bold px-6 py-2.5 bg-[#0D0D0D] text-white rounded-xl hover:bg-gray-800 shadow-xl shadow-black/10 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 rounded-xl bg-gray-50 border border-black/5" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <HiXMark size={22} className="text-[#0D0D0D]" /> : <HiBars3 size={22} className="text-[#0D0D0D]" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-black/5 px-6 py-4 flex flex-col gap-4 shadow-xl shadow-black/5 animate-in slide-in-from-top-2 duration-300">
          <Link
            to="/"
            className="text-sm font-bold text-gray-500 hover:text-[#2563EB] py-2"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/packages"
            className="text-sm font-bold text-gray-500 hover:text-[#2563EB] py-2"
            onClick={() => setMenuOpen(false)}
          >
            Packages
          </Link>
          <div className="h-px bg-black/5 my-2" />
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                className="text-sm font-bold text-[#0D0D0D] py-2"
                onClick={() => setMenuOpen(false)}
              >
                My Portal
              </Link>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="text-sm font-bold text-red-500 py-2 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-bold text-gray-500 hover:text-[#0D0D0D] py-2"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold bg-[#0D0D0D] text-white px-6 py-3 rounded-xl text-center shadow-lg shadow-black/10 active:scale-95 transition-all"
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
