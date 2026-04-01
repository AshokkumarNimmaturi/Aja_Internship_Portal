import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const PackageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [processing, setProcessing] = useState(false);

  // ✅ FETCH PACKAGE
  const fetchPackage = async () => {
    try {
      const res = await axiosInstance.get(`/packages/${id}`);
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

  // ✅ MAP DURATION → TIER (VERY IMPORTANT 🔥)
  const getTier = (duration) => {
    if (duration === 30) return "BASIC";
    if (duration === 90) return "STANDARD";
    if (duration === 180) return "PREMIUM";
    return "BASIC";
  };

  // ✅ GET PRICE
  const getPrice = () => {
    if (!pkg) return 0;
    if (selectedDuration === 30) return pkg.basicPrice;
    if (selectedDuration === 90) return pkg.standardPrice;
    return pkg.premiumPrice;
  };

  // ✅ HANDLE BUY
  const handleBuy = () => {
    navigate(`/checkout/${id}?tier=${selectedDuration}`);
  };

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading package...</p>
      </div>
    );
  }

  // ❌ NOT FOUND
  if (!pkg) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500">Package not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-xl">
        <h1 className="text-3xl font-bold text-[#0A1628]">{pkg.name}</h1>

        <p className="text-gray-500 mt-2">{pkg.description}</p>

        {/* Duration */}
        <div className="mt-6 flex gap-3">
          {[30, 90, 180].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDuration(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedDuration === d
                  ? "bg-[#0A1628] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>

        {/* Price */}
        <div className="mt-6 text-3xl font-bold text-[#0A1628]">
          ₹{getPrice()}
          <span className="text-sm text-gray-400">
            {" "}
            / {selectedDuration} days
          </span>
        </div>

        {/* Tech */}
        {pkg.technologyName && (
          <p className="text-xs text-gray-400 mt-2">{pkg.technologyName}</p>
        )}

        {/* Button */}
        <button
          onClick={handleBuy}
          disabled={processing}
          className="mt-6 w-full py-3 bg-[#0A1628] text-white rounded-xl hover:bg-[#0F2340] transition disabled:opacity-60"
        >
          {processing ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
};

export default PackageDetailPage;
