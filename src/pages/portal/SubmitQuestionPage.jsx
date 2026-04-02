import { useState, useEffect } from "react";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const SubmitQuestionPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [techList, setTechList] = useState([]);
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    initialAnswer: "",
    clientName: "", // ✅ NEW FIELD
    technologyId: "",
    newTechName: "",
    packageId: "",
    difficulty: "EASY",
    tags: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [techRes, pkgRes] = await Promise.all([
          axiosInstance.get("/technologies"),
          axiosInstance.get("/packages"),
        ]);
        setTechList(techRes.data);
        setPackages(pkgRes.data);
      } catch (err) {
        toast.error("Failed to load form data");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDifficulty = (val) => {
    setFormData({ ...formData, difficulty: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Handle New Tech if needed
      let techId = formData.technologyId;
      if (techId === "NEW") {
        const newTechRes = await axiosInstance.post("/technologies", { 
          name: formData.newTechName,
          description: "Added by user during submission"
        });
        techId = newTechRes.data.id;
      }

      // 2. Submit Question
      const payload = {
        title: formData.title,
        content: formData.body,
        clientName: formData.clientName,
        initialAnswer: formData.initialAnswer,
        technologyId: techId,
        packageId: formData.packageId,
        difficulty: formData.difficulty,
        tags: formData.tags
      };

      await axiosInstance.post("/questions", payload);
      toast.success("Question submitted for review!");
      
      // Reset form
      setFormData({
        title: "",
        body: "",
        initialAnswer: "",
        clientName: "",
        technologyId: "",
        newTechName: "",
        packageId: "",
        difficulty: "EASY",
        tags: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PortalSidebar user={user} role={user?.role} activeItem="Submit Intel" />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif text-[#0A1628] mb-2">Share Interview Intel</h1>
            <p className="text-sm text-gray-500 font-light">
              Help others by sharing real-time interview questions you've encountered. 
              Our tutors will verify and polish your submission.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-black/5 shadow-sm p-8 space-y-6">
            
            {/* Question Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Question Summary (Brief) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Explain the difference between Map and Set in JS"
                required
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* ✅ NEW: Client/Company Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide font-bold">
                Target Company / Client Name <span className="text-gray-300 text-[10px] lowercase font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="e.g., Google, Amazon, Deloitte..."
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-200 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all bg-gray-50/30"
              />
              <p className="text-[10px] text-gray-400 mt-1.5 italic">
                Linking this to a company helps others search by specific interview rounds.
              </p>
            </div>

            {/* Question Body */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Question Details <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Add more context — what was asked, how it was phrased, any follow-up questions
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

            {/* Proposed Answer */}
            <div>
              <label className="block text-xs font-bold text-[#0A1628] mb-2 uppercase tracking-wide">
                Proposed Best Answer <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Provide the ideal response for this question. Tutors will review and polish it.
              </p>
              <textarea
                name="initialAnswer"
                value={formData.initialAnswer}
                onChange={handleChange}
                placeholder="Write the correct answer here..."
                required
                rows={4}
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all resize-none bg-blue-50/20"
              />
            </div>

            {/* Technology & Package Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Technology */}
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
                  <option value="">Select tech</option>
                  {techList.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                  <option value="NEW" className="text-blue-600 font-bold">+ Add New Tech</option>
                </select>
                {formData.technologyId === "NEW" && (
                  <input
                    type="text"
                    name="newTechName"
                    value={formData.newTechName}
                    onChange={handleChange}
                    placeholder="Tech name..."
                    className="mt-2 w-full px-4 py-2 border border-blue-200 bg-blue-50/30 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                  />
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
                  <option value="">Select package</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-3">Difficulty <span className="text-red-400">*</span></label>
              <div className="flex gap-3">
                {[
                  { value: "EASY", label: "Easy", active: "bg-green-500 text-white border-green-500" },
                  { value: "MEDIUM", label: "Medium", active: "bg-amber-500 text-white border-amber-500" },
                  { value: "HARD", label: "Hard", active: "bg-red-500 text-white border-red-500" },
                ].map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => handleDifficulty(d.value)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      formData.difficulty === d.value ? d.active : "border-black/10 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#0A1628] text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-[#0F2340] hover:shadow-lg transition-all disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit for Review"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SubmitQuestionPage;
