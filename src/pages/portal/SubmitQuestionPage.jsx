import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const SubmitQuestionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [packages, setPackages] = useState([]);
  const [techList, setTechList] = useState([]); // real technologies with IDs from backend
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    technologyId: "",   // numeric ID from backend
    packageId: "",
    difficulty: "",
    newTechName: "",    // used if technologyId === 'NEW'
  });

  useEffect(() => {
    const init = async () => {
      // Load packages independently — critical for form
      try {
        const pkgRes = await axiosInstance.get("/packages");
        setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : pkgRes.data.content || []);
      } catch (err) {
        console.error("Packages fetch error:", err);
        toast.error("Failed to load packages. Please refresh.");
      }

      // Load technologies independently — has static fallback so non-critical
      try {
        let techRes;
        try {
          techRes = await axiosInstance.get("/technologies");
        } catch {
          try {
            techRes = await axiosInstance.get("/technology");
          } catch {
            techRes = await axiosInstance.get("/admin/technologies");
          }
        }
        const techs = Array.isArray(techRes.data) ? techRes.data : techRes.data.content || [];
        setTechList(techs);
        console.log("Technologies from backend:", techs);
      } catch (err) {
        // Non-fatal: the form already shows a static fallback list when techList is empty
        console.warn("Could not load technologies from backend — using static fallback:", err.message);
      }
    };
    init();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    // AUTOMATION: If package is selected, auto-select its technology
    if (name === "packageId" && value) {
      const selectedPkg = packages.find(p => String(p.id) === String(value));
      if (selectedPkg && (selectedPkg.technology_id || selectedPkg.technologyId)) {
        updatedData.technologyId = selectedPkg.technology_id || selectedPkg.technologyId;
      }
    }

    setFormData(updatedData);
  };

  const handleDifficulty = (val) => {
    setFormData({ ...formData, difficulty: val });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.packageId) {
      toast.error("Please assign this question to a package");
      return;
    }

    if (!formData.difficulty) {
      toast.error("Please select difficulty");
      return;
    }

    setLoading(true);

    try {
      let techId = formData.technologyId;

      // PHASE 1: Handle New Technology Creation
      if (techId === "NEW" && formData.newTechName) {
        try {
          const techRes = await axiosInstance.post("/technologies", {
            name: formData.newTechName,
            active: 1,
            description: "Automatically added via question submission"
          });
          techId = techRes.data.id || techRes.data;
          toast.success(`Created new technology: ${formData.newTechName}`);
        } catch (err) {
          toast.error("Failed to create new technology. Using fallback.");
          // if POST fails, we'll try to proceed or stop
          setLoading(false);
          return;
        }
      }

      // PHASE 2: Submit Question
      const finalTechId = Number(techId);
      const payload = {
        title: formData.title,
        content: formData.body,
        // Send both to ensure backend DTO and DB Mapper are both satisfied
        technologyId: finalTechId,
        technology_id: finalTechId,
        packageId: Number(formData.packageId),
        package_id: Number(formData.packageId),
        difficulty: formData.difficulty,
        status: "PENDING",
        submitted_by: user?.id || user?.userId,
      };

      console.log("Submitting question payload:", payload);

      const res = await axiosInstance.post("/questions", payload);
      console.log("Submit response:", res.status, res.data);

      setSubmitted(true);
      toast.success("Question submitted for review!");
    } catch (error) {
      const serverMsg = error.response?.data?.message
        || error.response?.data?.error
        || JSON.stringify(error.response?.data)
        || "Failed to submit. Please try again.";
      console.error("Submit error:", error.response?.status, error.response?.data);
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        <PortalSidebar
          user={user}
          role={user?.role || "EMPLOYEE"}
          activeItem="Submit Question"
        />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white border border-black/8 rounded-2xl p-10 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-green-500" />
            </div>
            <h2 className="font-serif text-2xl text-[#0A1628] mb-2">
              Question Submitted!
            </h2>
            <p className="text-sm text-gray-400 font-light mb-6 leading-relaxed">
              Your question has been sent for tutor review. It will appear in
              the question bank once approved.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSubmitted(false)}
                className="w-full py-3 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all"
              >
                Submit Another Question
              </button>
              <Link
                to="/portal/dashboard"
                className="w-full py-3 border border-black/10 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-all text-center"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PortalSidebar
        user={user}
        role={user?.role || "EMPLOYEE"}
        activeItem="Submit Question"
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="font-serif text-4xl text-[#0A1628] mb-2">
              Submit an Interview Question
            </h1>
            <p className="text-sm text-gray-400 font-light max-w-lg mx-auto">
              Share a question you faced in a real interview. Help your fellow portal members by contributing to the bank! 🚀
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-black/8 rounded-2xl p-7 flex flex-col gap-6"
          >
            {/* Question Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Question Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. What is the difference between abstract class and interface?"
                required
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Question Body */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Question Details <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Add more context — what was asked, how it was phrased, any
                follow-up questions
              </p>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                placeholder="Describe the question in detail..."
                required
                rows={5}
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all resize-none"
              />
            </div>

            {/* Technology — fetched from backend with real IDs */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Technology <span className="text-red-400">*</span>
              </label>
              <select
                name="technologyId"
                value={formData.technologyId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all bg-white"
              >
                <option value="">Select a technology</option>
                {techList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
                <option value="NEW" className="text-blue-600 font-bold">+ Add New Technology</option>
              </select>

              {formData.technologyId === "NEW" && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    name="newTechName"
                    value={formData.newTechName}
                    onChange={handleChange}
                    placeholder="Enter new technology name..."
                    required
                    className="w-full px-4 py-2.5 border border-blue-200 bg-blue-50/30 rounded-xl text-sm text-gray-800 placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              )}

              {techList.length === 0 && !formData.technologyId && (
                <p className="text-xs text-amber-500 mt-1">⚠ Loading technologies from server...</p>
              )}
            </div>

            {/* Package */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Assign to Package <span className="text-red-400">*</span>
              </label>
              <select
                name="packageId"
                value={formData.packageId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all bg-white"
              >
                <option value="">Select a package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-3">
                Difficulty <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                {[
                  {
                    value: "EASY",
                    label: "Easy",
                    active: "bg-green-500 text-white border-green-500",
                  },
                  {
                    value: "MEDIUM",
                    label: "Medium",
                    active: "bg-amber-500 text-white border-amber-500",
                  },
                  {
                    value: "HARD",
                    label: "Hard",
                    active: "bg-red-500 text-white border-red-500",
                  },
                ].map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => handleDifficulty(d.value)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      formData.difficulty === d.value
                        ? d.active
                        : "border-black/10 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full mt-1.5 shrink-0" />
              <p className="text-xs text-blue-700">
                Your question will be reviewed by a tutor before it appears in
                the question bank. You will see its status in My Submissions.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit for Review"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SubmitQuestionPage;
