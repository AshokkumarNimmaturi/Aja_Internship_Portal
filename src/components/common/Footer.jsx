import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 text-white/60 px-6 py-20 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="Aja Interview Vault" className="h-12 w-auto brightness-0 invert" />
              <div>
                <div className="text-white text-lg font-bold leading-tight">
                  Aja Interview Vault
                </div>
                <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest leading-tight">
                  Aja Consulting Services LLP
                </div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              Empowering the next generation of IT professionals through our
              comprehensive 9-month internship program and expert-led
              interview preparation.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <div className="flex flex-col gap-4 text-sm">
              <Link to="/packages" className="hover:text-white transition-colors">Courses & Packages</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <div className="flex flex-col gap-4 text-sm">
              <a href="https://ajacs.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Main Website</a>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <a href="mailto:support@ajacs.in" className="hover:text-white transition-colors">Contact Support</a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 Aja Consulting Services LLP. All rights reserved.</p>
          <div className="flex items-center gap-6">
             <span>Terms of Service</span>
             <Link to="/privacy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
