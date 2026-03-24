import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, X } from "lucide-react";

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
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
      } border-b border-black/5`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0A1628] rounded-xl flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-wide">
              AIP
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#0A1628] leading-tight">
              Aja Internship Portal
            </div>
            <div className="text-xs text-gray-400 leading-tight">
              Interview Question Bank
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/packages"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Packages
          </Link>
          <Link
            to="/#tutors"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Tutors
          </Link>
          <Link
            to="/#about"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            About
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                className="text-sm px-4 py-2 border border-black/10 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
              >
                My Portal
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 bg-[#0A1628] text-white rounded-lg hover:bg-[#0F2340] transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm px-4 py-2 border border-black/10 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm px-4 py-2 bg-[#0A1628] text-white rounded-lg hover:bg-[#0F2340] transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-black/5 px-6 py-4 flex flex-col gap-4">
          <Link
            to="/"
            className="text-sm text-gray-600"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/packages"
            className="text-sm text-gray-600"
            onClick={() => setMenuOpen(false)}
          >
            Packages
          </Link>
          <Link
            to="/login"
            className="text-sm text-gray-600"
            onClick={() => setMenuOpen(false)}
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium text-[#2563EB]"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
