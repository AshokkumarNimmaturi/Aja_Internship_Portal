import { useState, useEffect } from "react";
// ✅ UPGRADED: Switched to elite Heroicons 2 (React Icons)
import {
  HiPencilSquare,
  HiBuildingOffice,
  HiCodeBracket,
  HiInboxStack,
  HiTag,
  HiSparkles,
  HiCheckCircle,
  HiBriefcase,
  HiDocumentText,
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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden portal-modern">
      <PortalSidebar user={user} role={user?.role} activeItem="Submit Intel" />

      <main className="flex-1 p-8 py-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto pb-20">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-serif text-[#0A1628] mb-1 font-bold">Intelligence Intake</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] font-sans">Aja Internal Portal — Submission System</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-[60px] border border-black/5 shadow-sm p-12 space-y-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <HiSparkles size={200} className="text-blue-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Question Title */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0A1628] mb-4">
                  <HiDocumentText size={18} className="text-blue-500" /> Question Summary <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Logic for reversing a linked list in O(n) time"
                  required
                  className="w-full px-6 py-4.5 bg-gray-50 border border-black/5 rounded-[20px] text-lg font-bold text-[#0A1628] focus:ring-8 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder-gray-300 shadow-inner leading-tight"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                  <HiBriefcase size={18} /> Company / Client
                </label>
                <div className="relative">
                  <HiBuildingOffice size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="e.g. Google, Amazon..."
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold text-[#0A1628] focus:border-blue-400 outline-none transition-all placeholder-gray-200"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                  <HiTag size={18} /> Semantic Tags
                </label>
                <div className="relative">
                  <HiTag size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g. algorithms, linked-list"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold text-[#0A1628] focus:border-blue-400 outline-none transition-all placeholder-gray-200 uppercase"
                  />
                </div>
              </div>

              {/* Question Body */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0A1628] mb-4">
                  <HiPencilSquare size={18} className="text-blue-500" /> Intel Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  placeholder="Provide explicit multi-line detail of the question as presented in the interview..."
                  required
                  rows={4}
                  className="w-full px-6 py-5 bg-gray-50 border border-black/5 rounded-[30px] text-sm text-gray-600 focus:border-blue-400 outline-none transition-all resize-none shadow-inner italic font-light leading-relaxed"
                />
              </div>

              {/* Proposed Answer */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0A1628] mb-4">
                  <HiCheckCircle size={18} className="text-emerald-500" /> Mastery Response (Internal) <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="initialAnswer"
                  value={formData.initialAnswer}
                  onChange={handleChange}
                  placeholder="Draft the benchmark solution for curation review..."
                  required
                  rows={4}
                  className="w-full px-6 py-5 bg-emerald-50/20 border-2 border-dashed border-emerald-100 rounded-[30px] text-sm text-gray-700 focus:border-emerald-400 outline-none transition-all resize-none leading-relaxed font-medium"
                />
              </div>

              {/* Tech Select */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                  <HiCodeBracket size={18} /> Technology Core <span className="text-red-400">*</span>
                </label>
                <select
                  name="technologyId"
                  value={formData.technologyId}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] focus:border-blue-400 outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="">Select Stack</option>
                  {techList.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                  <option value="NEW" className="text-blue-600 font-bold">+ New Intel Category</option>
                </select>
                {formData.technologyId === "NEW" && (
                  <input
                    name="newTechName"
                    value={formData.newTechName}
                    onChange={handleChange}
                    placeholder="New Tech Identity..."
                    className="mt-3 w-full px-6 py-3 bg-blue-50/50 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 placeholder-blue-300 focus:border-blue-400 outline-none animate-in fade-in slide-in-from-top-2 duration-300"
                  />
                )}
              </div>

              {/* Package Select */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                  <HiInboxStack size={18} /> Catalog Assignment <span className="text-red-400">*</span>
                </label>
                <select
                  name="packageId"
                  value={formData.packageId}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] focus:border-blue-400 outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="">Select Catalog</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Selection */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Complexity Grading <span className="text-red-400">*</span></label>
                <div className="flex gap-4">
                  {[
                    { value: "EASY", label: "Foundational", active: "bg-emerald-500 text-white shadow-emerald-500/30", base: "bg-emerald-50 text-emerald-600" },
                    { value: "MEDIUM", label: "Professional", active: "bg-amber-500 text-white shadow-amber-500/30", base: "bg-amber-50 text-amber-600" },
                    { value: "HARD", label: "Mastery", active: "bg-red-500 text-white shadow-red-500/30", base: "bg-red-50 text-red-600" },
                  ].map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => handleDifficulty(d.value)}
                      className={`flex-1 py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 border border-transparent ${formData.difficulty === d.value ? d.active : `${d.base} opacity-60 grayscale hover:grayscale-0 hover:opacity-100`
                        }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-10 border-t border-black/5">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-[#0A1628] text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-[30px] hover:bg-blue-600 transition-all shadow-2xl shadow-blue-900/40 disabled:opacity-60 flex items-center justify-center gap-4 active:scale-95 group"
              >
                {loading ? <HiArrowPath size={24} className="animate-spin" /> : <HiSparkles size={24} className="group-hover:rotate-12 transition-transform" />}
                {loading ? "COMMITTING INTELLIGENCE..." : "INITIALIZE CURATION SYNC"}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center opacity-30 group hover:opacity-100 transition-opacity">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.5em] flex items-center justify-center gap-2">
              <HiShieldCheck size={16} /> Data Encryption Active — Session Secure
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmitQuestionPage;
