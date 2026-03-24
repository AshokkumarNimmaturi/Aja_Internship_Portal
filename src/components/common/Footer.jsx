import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-black/5 px-6 py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#0A1628] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">AIP</span>
            </div>
            <span className="text-sm font-semibold text-[#0A1628]">
              Aja Internship Portal
            </span>
          </div>
          <p className="text-xs text-gray-400">
            © 2026 Aja Consultancy. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/packages"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Packages
          </Link>
          <Link
            to="/#tutors"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Tutors
          </Link>
          <Link
            to="/#about"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            About
          </Link>
          <Link
            to="/#contact"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Contact
          </Link>
          <Link
            to="/privacy"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
