import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiCheckCircle, HiShieldCheck } from "react-icons/hi2"; // ✅ ADDED
import { fetchPackages } from "../../api/packageApi";
import toast from "react-hot-toast";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const PackagesPage = () => {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [loading, setLoading] = useState(true);

  const loadPackageData = async () => {
    try {
      setLoading(true);
      const res = await fetchPackages();
      // ✅ Handle Spring Boot "Page" objects vs "List" arrays
      const data = res.data.content || res.data;
      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Package Sync Error:", error);
      toast.error("Package intelligence is currently syncing");
      // Optional: Set fallback packages here if needed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackageData();
  }, []);

  // ✅ Price based on duration
  const getPrice = (pkg) => {
    if (selectedDuration === 30) return pkg.basicPrice;
    if (selectedDuration === 90) return pkg.standardPrice;
    return pkg.premiumPrice;
  };

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
        <p className="text-white font-bold text-sm uppercase tracking-widest">Aja Interview Vault</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <Navbar />

      {/* HEADER */}
      <div className="max-w-7xl mx-auto pt-32 pb-16 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-900/20 border border-purple-500/30 text-purple-400 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
          Career Development Plans
        </div>

        <h1 className="font-serif text-5xl md:text-6xl text-white leading-tight mb-6">
          Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400 italic font-serif">Last Stop</span> <br />
          For Interview Success
        </h1>

        <p className="text-gray-400 text-lg font-light max-w-3xl mx-auto mb-12 leading-relaxed">
          If you came here, it means you are preparing for an interview or 
          looking for an internship. <span className="text-white font-semibold">For both, this is your last stop.</span> Buy our 
          packages to know what experts are asking in interviews, and our team 
          will contact you once you've registered with us.
        </p>

        {/* DURATION SELECTOR - Polished Pill Toggle */}
        <div className="inline-flex p-1.5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          {[30, 90, 180].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDuration(d)}
              className={`px-8 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                selectedDuration === d
                  ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {d} Days Access
            </button>
          ))}
        </div>
      </div>

      {/* PACKAGES GRID */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        {packages.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-[3rem]">
            <p className="text-gray-400 font-medium">Coming soon: New technology tracks</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => {
              const isPopular = index === 1; // Standard is usually middle
              const isPremium = index === packages.length - 1 && index > 1;

              return (
                <div
                  key={pkg.id}
                  className={`relative group flex flex-col p-6 rounded-3xl transition-all duration-500 hover:-translate-y-1 
                    ${isPopular 
                      ? "bg-[#0A0D14]/80 backdrop-blur-xl border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)] text-white" 
                      : isPremium 
                        ? "bg-[#050505]/90 backdrop-blur-xl border border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.1)] text-white" 
                        : "bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg text-white"}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] whitespace-nowrap">
                      Most Popular Path
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                     <div className={`text-3xl ${!isPremium && "text-purple-400"}`}>
                        {index === 0 ? "⚙️" : index === 1 ? "⚛️" : index === 2 ? "☁️" : "☕"}
                     </div>
                     <div className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${isPremium ? "bg-white/10 text-white" : "bg-purple-500/20 text-purple-400"}`}>
                        {pkg.technologyName || "Core Tech"}
                     </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <p className={`text-xs mb-5 font-light leading-relaxed line-clamp-2 ${isPremium ? "text-white/60" : "text-gray-400"}`}>
                    {pkg.description || "Master core concepts and advanced interview questions."}
                  </p>

                  <div className="mt-auto">
                    <div className="flex items-baseline gap-1 mb-5">
                      <span className="text-3xl font-bold">₹{getPrice(pkg)}</span>
                      <span className={`text-[10px] font-medium ${isPremium ? "text-white/40" : "text-gray-400"}`}>
                        / {selectedDuration} Days
                      </span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {[
                        "500+ Verified Questions",
                        "Expert Tutor Reviews",
                        "Career Path Guidance",
                        "Full-time Hiring Support"
                      ].map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2.5">
                          <HiCheckCircle size={14} className={isPremium ? "text-teal-400" : "text-purple-400"} />
                          <span className={`text-[11px] font-medium ${isPremium ? "text-white/70" : "text-gray-300"}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => navigate(`/checkout/${pkg.id}?days=${selectedDuration}`)}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-[1.02] active:scale-100 shadow-lg
                        ${isPremium 
                          ? "bg-teal-600 text-white hover:bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.4)]" 
                          : isPopular 
                            ? "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                            : "bg-white/10 text-white hover:bg-white/20 border border-white/10"}`}
                    >
                      Begin Your Journey
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default PackagesPage;