import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
// ✅ UPGRADED: Switched to elite Heroicons 2 (React Icons)
import { 
  HiArrowLeft, 
  HiCheckBadge, 
  HiCalendarDays, 
  HiCreditCard, 
  HiRocketLaunch,
  HiShieldCheck,
  HiBolt
} from "react-icons/hi2";
import { fetchPackageById } from "../../api/packageApi";
import toast from "react-hot-toast";

const PackageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(90);
  const [processing, setProcessing] = useState(false);

  const fetchPackage = async () => {
    try {
      const res = await fetchPackageById(id);
      setPkg(res.data);
    } catch (error) {
      toast.error("Package not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [id]);

  const getPrice = () => {
    if (!pkg) return 0;
    if (selectedDuration === 30) return pkg.basicPrice;
    if (selectedDuration === 90) return pkg.standardPrice;
    return pkg.premiumPrice;
  };

  const handleBuy = () => {
    navigate(`/checkout/${id}?tier=${selectedDuration}`);
  };

  if (loading) return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <HiBolt className="w-12 h-12 text-blue-200 mb-4 animate-bounce" />
        <p className="text-gray-400 font-serif italic">Syncing Package Intel...</p>
      </div>
    </div>
  );

  if (!pkg) return (
    <div className="h-screen bg-gray-50 flex items-center justify-center flex-col">
      <HiShieldCheck className="w-16 h-16 text-red-100 mb-4" />
      <p className="text-[#0A1628] font-serif text-xl font-bold">Package Data Corrupted</p>
      <Link to="/portal/packages" className="mt-4 text-blue-600 underline">Return to Vault</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-6 font-sans">
      <div className="w-full max-w-4xl">
        <Link to="/portal/packages" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#0A1628] transition-colors mb-8 group">
          <HiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Storefront
        </Link>
        
        <div className="bg-white rounded-[60px] shadow-2xl border border-black/5 overflow-hidden flex flex-col md:flex-row">
           {/* Visual Side */}
           <div className="md:w-1/3 bg-[#0A1628] p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-5">
                 <HiRocketLaunch size={240} />
              </div>
              <div className="relative z-10">
                 <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-8 border border-white/10 shadow-inner">
                    <HiCheckBadge size={32} className="text-blue-400" />
                 </div>
                 <h2 className="text-4xl font-serif font-black leading-tight mb-4">{pkg.name}</h2>
                 <p className="text-blue-200/60 text-xs font-black uppercase tracking-[0.2em]">{pkg.technologyName || "Full Stack"}</p>
              </div>
              <div className="relative z-10 pt-12">
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Platform Verification</div>
                 <div className="flex items-center gap-2 text-emerald-400">
                    <HiShieldCheck size={18} />
                    <span className="text-xs font-bold">Industry Verified Intel</span>
                 </div>
              </div>
           </div>

           {/* Content Side */}
           <div className="md:w-2/3 p-12 md:p-16">
              <div className="mb-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Elite Mastery Description</h3>
                 <p className="text-lg text-gray-600 leading-relaxed font-light italic font-serif">"{pkg.description || "Synthesized technical deep-dives into industry-standard interview patterns."}"</p>
              </div>

              <div className="mb-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Select Commitment Tier</h3>
                 <div className="flex gap-4">
                    {[30, 90, 180].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDuration(d)}
                        className={`flex-1 group relative p-6 rounded-[32px] border-2 transition-all active:scale-95 text-left ${
                          selectedDuration === d
                            ? "bg-blue-50 border-blue-500 shadow-xl shadow-blue-500/10"
                            : "bg-white border-black/5 hover:border-blue-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                           <HiCalendarDays size={20} className={selectedDuration === d ? "text-blue-600" : "text-gray-300"} />
                           {selectedDuration === d && <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                        </div>
                        <div className={`text-lg font-black tracking-tighter ${selectedDuration === d ? 'text-[#0A1628]' : 'text-gray-400'}`}>{d} Days</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 opacity-60">Intel Access</div>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="flex items-end justify-between border-t border-black/5 pt-10">
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Tier Investment</span>
                    <div className="text-5xl font-serif font-black text-[#0A1628] flex items-start gap-1">
                       <span className="text-2xl mt-2">₹</span>
                       {getPrice()}
                    </div>
                 </div>
                 <button
                    onClick={handleBuy}
                    disabled={processing}
                    className="flex-1 max-w-[240px] py-6 bg-[#0A1628] text-white rounded-[30px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-95"
                  >
                    <HiCreditCard size={20} /> Checkout Securely
                  </button>
              </div>
           </div>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Precision Engineering by Aja Interview Vault</p>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailPage;
