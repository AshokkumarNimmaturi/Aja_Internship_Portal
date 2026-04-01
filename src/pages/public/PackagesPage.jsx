import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const PackagesPage = () => {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      const res = await axiosInstance.get("/packages");
      setPackages(res.data);
    } catch (error) {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading packages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      {/* HEADER */}
      <div className="text-center py-12 px-4">
        <p className="text-blue-600 text-sm font-semibold tracking-wide">
          SUBSCRIPTION PACKAGES
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Choose Your Technology Track
        </h1>

        <p className="text-gray-500 mt-2">
          Time-limited access to full question banks. Start from ₹299.
        </p>
      </div>

      {/* DURATION SELECTOR */}
      <div className="flex justify-center gap-3 mb-10">
        {[30, 90, 180].map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDuration(d)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              selectedDuration === d
                ? "bg-[#0A1628] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {d} Days
          </button>
        ))}
      </div>

      {/* EMPTY STATE */}
      {packages.length === 0 ? (
        <p className="text-center text-gray-500">
          No packages available
        </p>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 pb-16">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-xl transition relative ${
                index === 1 ? "border-blue-500 scale-105" : ""
              }`}
            >
              {/* MOST POPULAR */}
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <h2 className="text-lg font-semibold">{pkg.name}</h2>

              <p className="text-sm text-gray-500 mt-2">
                {pkg.description}
              </p>

              {/* PRICE */}
              <div className="mt-5 text-3xl font-bold text-[#0A1628]">
                ₹{getPrice(pkg)}
                <span className="text-sm text-gray-400">
                  {" "} / {selectedDuration} days
                </span>
              </div>

              {/* TECH */}
              {pkg.technologyName && (
                <p className="text-xs text-gray-400 mt-2">
                  {pkg.technologyName}
                </p>
              )}

              {/* BUTTON */}
              <button
                onClick={() => navigate(`/packages/${pkg.id}`)} // ✅ FIXED
                className="mt-6 w-full py-3 bg-[#0A1628] text-white rounded-xl hover:bg-[#0F2340] transition"
              >
                Get Access
              </button>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PackagesPage;