import { useState, useEffect } from "react";
import {
  HiPencilSquare,
  HiArrowPath,
  HiShieldCheck
} from "react-icons/hi2";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import { useAuth } from "../../context/AuthContext";
import { fetchTechnologies, createTechnology } from "../../api/techApi";
import { fetchPackages } from "../../api/packageApi";
import { submitQuestion } from "../../api/questionApi";
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
    clientName: "",
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
          fetchTechnologies(),
          fetchPackages(),
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
      let techId = formData.technologyId;
      if (techId === "NEW") {
        const newTechRes = await createTechnology({
          name: formData.newTechName,
          description: "Added by user during submission"
        });
        techId = newTechRes.data.id;
      }

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

      await submitQuestion(payload);
      toast.success("Intelligence submitted for review! 🦾");

      setFormData({
        title: "", body: "", initialAnswer: "", clientName: "",
        technologyId: "", newTechName: "", packageId: "",
        difficulty: "EASY", tags: ""
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit intelligence");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      <PortalSidebar user={user} role={user?.role} activeItem="Submit Intel" />

      <main className="flex-1 overflow-y-auto p-8 py-10 w-full">
        <div className="max-w-4xl mx-auto pb-10">
          
          <div className="mb-8 pl-1">
            <h1 className="text-xl font-bold text-[#0A1628] mb-1">Submit Intelligence</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Contribute to the global technical vault</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-[#E3E6E8] rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              
              {/* ── TITLE ── */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Implement Binary Search"
                  required
                  className="w-full px-4 py-2.5 border border-[#E3E6E8] rounded-lg text-sm focus:outline-none focus:border-[#0074CC] transition-all font-medium"
                />
              </div>

              {/* ── DETAILS ── */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Details <span className="text-red-500">*</span></label>
                <div className="border border-[#E3E6E8] rounded-lg overflow-hidden focus-within:border-[#0074CC] transition-all">
                  <div className="bg-gray-50 border-b border-[#E3E6E8] px-4 py-1.5 flex gap-4 text-gray-300">
                     <span className="text-[10px] font-bold uppercase tracking-widest">Question Body</span>
                  </div>
                  <textarea
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    placeholder="Provide technical specifics..."
                    required
                    rows={6}
                    className="w-full p-4 outline-none text-sm text-[#232629] leading-relaxed font-medium bg-white"
                  />
                </div>
              </div>

              {/* ── MASTERY RESPONSE ── */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Benchmark Solution <span className="text-red-400">*</span></label>
                <div className="border border-[#E3E6E8] rounded-lg overflow-hidden focus-within:border-green-400 transition-all">
                   <div className="bg-gray-50 border-b border-[#E3E6E8] px-4 py-1.5 flex gap-4 text-green-600/60">
                     <span className="text-[10px] font-bold uppercase tracking-widest">Internal Verification Key</span>
                  </div>
                  <textarea
                    name="initialAnswer"
                    value={formData.initialAnswer}
                    onChange={handleChange}
                    placeholder="Provide the benchmark response..."
                    required
                    rows={5}
                    className="w-full p-4 outline-none text-sm text-[#232629] leading-relaxed font-medium bg-green-50/5"
                  />
                </div>
              </div>

              {/* ── META DATA ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Technology Stack</label>
                  <select
                    name="technologyId"
                    value={formData.technologyId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-[#E3E6E8] rounded-lg text-sm outline-none bg-gray-50 focus:bg-white transition-all font-bold"
                  >
                    <option value="">Select Stack...</option>
                    {techList.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    <option value="NEW">+ Create New Stack</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Vault Category</label>
                   <select
                     name="packageId"
                     value={formData.packageId}
                     onChange={handleChange}
                     required
                     className="w-full px-3 py-2 border border-[#E3E6E8] rounded-lg text-sm outline-none bg-gray-50 focus:bg-white transition-all font-bold"
                   >
                     <option value="">Select Package...</option>
                     {packages.map((pkg) => (
                       <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                     ))}
                   </select>
                </div>
              </div>

              <div className="space-y-6 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Complexity Calibration</label>
                  <div className="flex border border-[#E3E6E8] rounded-lg divide-x divide-[#E3E6E8] overflow-hidden shadow-sm">
                    {["EASY", "MEDIUM", "HARD"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleDifficulty(lvl)}
                        className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-all ${
                          formData.difficulty === lvl 
                            ? "bg-[#0A1628] text-white" 
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Organization / Origin</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="e.g. Google"
                      className="w-full px-4 py-2 border border-[#E3E6E8] rounded-lg text-sm outline-none focus:border-[#0074CC] transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Discovery Tags</label>
                    <input
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g. java, backend"
                      className="w-full px-4 py-2 border border-[#E3E6E8] rounded-lg text-sm outline-none focus:border-[#0074CC] border-dashed transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-[#E3E6E8] p-6 flex items-center justify-end gap-3">
              <button 
                type="button" 
                className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-[#0074CC] hover:bg-[#0063AD] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <HiArrowPath className="animate-spin" />}
                {loading ? "Processing..." : "Submit Entry"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SubmitQuestionPage;
