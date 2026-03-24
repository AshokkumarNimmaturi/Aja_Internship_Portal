import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "./EmployeeDashboard";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const technologies = [
  "Java",
  "Spring Boot",
  "React",
  "JavaScript",
  "TypeScript",
  "Python",
  "Django",
  "DevOps",
  "Docker",
  "Kubernetes",
  "Salesforce",
  "SQL",
  "Other",
];

const SubmitQuestionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    technology: "",
    difficulty: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDifficulty = (val) => {
    setFormData({ ...formData, difficulty: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.technology) {
      toast.error("Please select a technology");
      return;
    }
    if (!formData.difficulty) {
      toast.error("Please select difficulty");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/questions", formData);
      setSubmitted(true);
      toast.success("Question submitted for review!");
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
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

      <main className="flex-1 p-8">
        <div className="max-w-2xl">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-[#0A1628] mb-1">
              Submit an Interview Question
            </h1>
            <p className="text-sm text-gray-400 font-light">
              Share a question you faced in a real interview. It will be
              reviewed by a tutor before publishing.
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

            {/* Technology */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Technology <span className="text-red-400">*</span>
              </label>
              <select
                name="technology"
                value={formData.technology}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all bg-white"
              >
                <option value="">Select a technology</option>
                {technologies.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
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
