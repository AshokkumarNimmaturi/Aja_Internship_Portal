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
    <div className="flex h-screen bg-[#F1F2F3] font-sans overflow-hidden">
      <PortalSidebar user={user} role={user?.role} activeItem="Submit Intel" />

      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-5xl mx-auto pb-20">
          
          <div className="mb-8 pl-1">
            <h1 className="text-3xl font-semibold text-[#232629] mb-1">Submit a Question</h1>
            <p className="text-gray-500 text-sm">Ask your question clearly and get helpful answers from the community.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-[#E3E6E8] rounded-md shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              
              {/* ── TITLE ── */}
              <div className="space-y-2">
                <label className="block text-base font-semibold text-[#232629]">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. How to implement binary search in C++?"
                  required
                  className="w-full px-3 py-2 border border-[#BABFC4] rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm placeholder-gray-300 transition-all font-medium"
                />
                <p className="text-[11px] text-gray-500">Be specific and imagine you’re asking a question to another person.</p>
              </div>

              {/* ── DETAILS ── */}
              <div className="space-y-2">
                <label className="block text-base font-semibold text-[#232629]">Details <span className="text-red-500">*</span></label>
                <div className="border border-[#BABFC4] rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                  <div className="bg-[#F8F9F9] border-b border-[#BABFC4] px-4 py-2 flex gap-4 text-gray-400">
                     <span className="cursor-default font-bold">B</span>
                     <span className="cursor-default italic">I</span>
                     <span className="cursor-default font-mono">{"<>"}</span>
                     <span className="cursor-default">🔗</span>
                     <span className="cursor-default">❝</span>
                  </div>
                  <textarea
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    placeholder="Provide as much detail as possible about your question..."
                    required
                    rows={8}
                    className="w-full p-4 outline-none text-sm text-gray-700 leading-relaxed font-light"
                  />
                </div>
                <p className="text-[11px] text-gray-500">Include all the information someone would need to answer your question.</p>
              </div>

              {/* ── MASTERY RESPONSE ── */}
              <div className="space-y-2">
                <label className="block text-base font-semibold text-[#232629]">Mastery Response <span className="text-red-400">*</span></label>
                <div className="border border-[#BABFC4] rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-emerald-400 focus-within:border-emerald-400 transition-all">
                   <div className="bg-[#F8F9F9] border-b border-[#BABFC4] px-4 py-2 flex gap-4 text-emerald-600/60">
                     <span className="text-[9px] font-black uppercase tracking-widest">Internal Benchmark Solution</span>
                  </div>
                  <textarea
                    name="initialAnswer"
                    value={formData.initialAnswer}
                    onChange={handleChange}
                    placeholder="Provide the benchmark solution for review..."
                    required
                    rows={6}
                    className="w-full p-4 outline-none text-sm text-emerald-900 leading-relaxed font-medium bg-emerald-50/5"
                  />
                </div>
              </div>

              {/* ── META DATA ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Technology Stack</label>
                  <select
                    name="technologyId"
                    value={formData.technologyId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-[#BABFC4] rounded-md text-sm outline-none bg-white shadow-sm"
                  >
                    <option value="">Select Stack...</option>
                    {techList.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    <option value="NEW" className="text-blue-600">+ Add New Technology</option>
                  </select>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Catalog Assignment</label>
                   <select
                     name="packageId"
                     value={formData.packageId}
                     onChange={handleChange}
                     required
                     className="w-full px-3 py-2.5 border border-[#BABFC4] rounded-md text-sm outline-none bg-white shadow-sm"
                   >
                     <option value="">Select Package...</option>
                     {packages.map((pkg) => (
                       <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                     ))}
                   </select>
                </div>
              </div>

              <div className="space-y-8 pt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-4 uppercase tracking-wide text-center">Complexity Grading</label>
                  <div className="flex border border-[#BABFC4] rounded-md divide-x divide-[#BABFC4] overflow-hidden shadow-sm">
                    {["EASY", "MEDIUM", "HARD"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleDifficulty(lvl)}
                        className={`flex-1 py-3 text-[10px] font-black uppercase transition-all ${
                          formData.difficulty === lvl 
                            ? "bg-blue-600 text-white" 
                            : "bg-white text-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        {lvl === "EASY" ? "Foundational" : lvl === "MEDIUM" ? "Professional" : "Mastery"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Company / Origin</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="e.g. Google"
                      className="w-full px-3 py-2 border border-[#BABFC4] rounded-md text-sm outline-none focus:border-blue-400 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Semantic Tags</label>
                    <input
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g. java, arrays, loops"
                      className="w-full px-3 py-2 border border-[#BABFC4] rounded-md text-sm outline-none focus:border-blue-400 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F8F9F9] border-t border-[#E3E6E8] p-8 flex items-center justify-end gap-4">
              <button 
                type="button" 
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-[#0074CC] hover:bg-[#0063AD] text-white rounded-md text-sm font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <HiArrowPath className="animate-spin" />}
                {loading ? "Submitting..." : "Submit Question"}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center opacity-40">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <HiShieldCheck /> Submission Gateway Secure
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmitQuestionPage;
