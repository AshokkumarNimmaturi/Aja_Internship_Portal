import { Link } from "react-router-dom";
import { HiShieldExclamation, HiArrowLeft } from "react-icons/hi2";

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center text-sm">
      <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-500 mb-8 border border-red-100 shadow-xl shadow-red-500/10">
        <HiShieldExclamation size={48} />
      </div>
      
      <h1 className="text-4xl font-serif text-[#0F172A] mb-4 font-bold">Access Restricted</h1>
      <p className="text-gray-400 max-w-sm leading-relaxed mb-10 italic">
        Your current role does not have the administrative clearance required to access this intelligence sector.
      </p>

      <Link 
        to="/portal/dashboard" 
        className="flex items-center gap-2 px-8 py-4 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-900 transition-all shadow-2xl shadow-blue-900/20 active:scale-95"
      >
        <HiArrowLeft size={16} /> Return to Dashboard
      </Link>
      
      <div className="mt-12 opacity-30">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-200 pt-8">
          Aja Internal Security Protocol • Error 403
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
