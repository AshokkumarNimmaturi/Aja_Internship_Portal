import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
// ✅ UPGRADED: Using elite Heroicons 2
import { HiStar, HiLockClosed, HiChevronRight } from "react-icons/hi2";
import axiosInstance from "../../api/axiosInstance";

const tutors = [
  {
    initials: "RK",
    name: "Rajesh Kumar",
    spec: "Java · Spring · Microservices",
    rating: 5,
    questions: 142,
    experience: "12yr",
  },
  {
    initials: "PM",
    name: "Priya Menon",
    spec: "React · TypeScript · Node.js",
    rating: 5,
    questions: 98,
    experience: "8yr",
  },
  {
    initials: "AS",
    name: "Anil Sharma",
    spec: "DevOps · Kubernetes · AWS",
    rating: 4,
    questions: 76,
    experience: "10yr",
  },
  {
    initials: "SK",
    name: "Swetha Kiran",
    spec: "Salesforce · Apex · LWC",
    rating: 5,
    questions: 84,
    experience: "9yr",
  },
];

const techBadgeStyle = {
  Java: "bg-amber-100 text-amber-800",
  React: "bg-blue-100 text-blue-800",
  DevOps: "bg-emerald-100 text-emerald-800",
};

const StarRating = ({ count }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <HiStar
        key={s}
        size={12}
        className={
          s <= count
            ? "text-amber-400 fill-amber-400"
            : "text-gray-200 fill-gray-200"
        }
      />
    ))}
  </div>
);

const SlidingText = () => {
  const words = ["Growth.", "Excellence.", "Internships.", "Success."];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-[1.1em] overflow-hidden inline-flex flex-col align-bottom">
      <div
        className="transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateY(-${index * 25}%)` }}
      >
        {words.map((word, i) => (
          <div key={i} className="h-[1.1em] flex items-center whitespace-nowrap">
            {word}
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const [visible, setVisible] = useState(false);
  const [packages, setPackages] = useState([]);
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);

    const fetchData = async () => {
      try {
        const [pkgRes, quesRes] = await Promise.all([
          axiosInstance.get("/packages"),
          axiosInstance.get("/questions?limit=3")
        ]);

        const pkgData = pkgRes.data.content || pkgRes.data;
        const quesData = quesRes.data.content || quesRes.data;
        setPackages(Array.isArray(pkgData) ? pkgData : []);

        const fetchedQues = Array.isArray(quesData) ? quesData : [];
        if (fetchedQues.length > 0) {
          setSampleQuestions(fetchedQues.slice(0, 3));
        } else {
          setSampleQuestions([
            { id: 's1', title: "What is the difference between abstract class and interface in Java?", technology: "Java", difficulty: "EASY" },
            { id: 's2', title: "How does the virtual DOM work in React?", technology: "React", difficulty: "MEDIUM" },
            { id: 's3', title: "Explain the concept of CI/CD pipelines in DevOps.", technology: "DevOps", difficulty: "HARD" }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch landing page data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-[10%] right-[-10%] w-[35%] h-[35%] bg-purple-50/50 rounded-full blur-[120px] -z-10" />

      <Navbar />

      {/* HERO SECTION */}
      <section
        className={`pt-44 pb-20 px-6 transition-all duration-1000 flex flex-col items-center ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Aja Branding Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-black/5 shadow-sm">
                <img src="/logo.png" alt="Aja Logo" className="w-7 h-auto" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#0D0D0D]">AJA INTERVIEW VAULT</h2>
            </div>

            {/* Rocket Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-[#2563EB] text-[9px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm shadow-blue-100/30">
              🚀 Empowering Your Career in IT
            </div>
          </div>

          {/* Symmetrical Refined Heading */}
          <h1 className="text-4xl md:text-6xl text-[#0D0D0D] font-black leading-[1.15] tracking-tight mb-8 px-4">
            The Portal for <br />
            <span className="text-[#2563EB]">Professional <SlidingText /></span>
          </h1>

          {/* Refined Description */}
          <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed mb-12 max-w-2xl mx-auto px-4">
            Access curated interview question packages, real-world resources, and <br className="hidden md:block" />
            expert guidance — all designed to help you crack interviews and land top <br className="hidden md:block" />
            opportunities in the tech industry.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-5 mb-16">
            <Link
              to="/register"
              className="px-8 py-4 bg-[#2563EB] text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              Get Started <HiChevronRight size={18} />
            </Link>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border border-black/5 bg-white text-[#0D0D0D] text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              Explore Packages
            </button>
          </div>

          {/* Trust Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400 mb-4 px-4">
            {["9-Month Internship Program", "Interview Question Packages", "Career Acceleration"].map((text, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                <div className="w-4 h-4 rounded-full border border-blue-100 flex items-center justify-center text-[#2563EB] bg-blue-50">
                  <svg size={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2 h-2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE CARDS (Overview) */}
      <section className="py-20 px-6 max-w-7xl mx-auto" id="features">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Interview Packages",
              desc: "Curated questions from top tech companies with detailed solutions.",
              icon: "📄",
              color: "bg-blue-50 text-blue-600",
              link: "/packages"
            },
            {
              title: "9-Month Internship",
              desc: "Hands-on experience, real projects, and mentorship from industry experts.",
              icon: "💼",
              color: "bg-emerald-50 text-emerald-600",
              link: "https://ajacs.in"
            },
            {
              title: "Career Growth",
              desc: "Build skills, gain confidence, and accelerate your professional journey.",
              icon: "📈",
              color: "bg-purple-50 text-purple-600",
              link: "/dashboard"
            }
          ].map((feat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-black/5 hover:border-blue-100 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5 group flex flex-col">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-8 ${feat.color}`}>
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-[#0D0D0D] mb-3">{feat.title}</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8 flex-1">
                {feat.desc}
              </p>
              <Link to={feat.link} className="flex items-center gap-2 text-sm font-bold text-[#2563EB] group-hover:gap-3 transition-all">
                Learn More <HiChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* PACKAGES (Original Subscription Section) */}
      <section className="px-6 py-24 bg-gray-50/50" id="packages">
        <div className="max-w-7xl mx-auto bg-white rounded-[3rem] p-12 border border-black/5 shadow-sm">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.2em] text-[#2563EB] uppercase mb-4">
              Subscription Packages
            </p>
            <h2 className="text-4xl font-bold text-[#0D0D0D] tracking-tight mb-4">
              Choose Your Technology Track
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto font-medium">
              Get full access to vetted question banks curated by industry experts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {Array.isArray(packages) && packages.length > 0 ? packages.map((pkg, i) => (
              <div
                key={i}
                className={`bg-white rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer relative group
                  ${i === 1 ? "border-2 border-[#2563EB] shadow-md shadow-blue-500/5" : "border-black/5"}`}
              >
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                    Most Popular
                  </div>
                )}
                <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform origin-left text-[#2563EB]">
                  {i === 0 ? "⚙️" : i === 1 ? "⚛️" : i === 2 ? "☁️" : i === 3 ? "🐍" : "☕"}
                </div>
                <div className="text-sm font-bold text-[#0D0D0D] mb-2 font-serif">
                  {pkg.name || "Package"}
                </div>
                <div className="text-xs text-gray-400 font-medium leading-relaxed mb-6 line-clamp-2">
                  {pkg.technologyName || pkg.description || "Core concepts and advanced topics"}
                </div>
                <div className="text-2xl font-bold text-[#0D0D0D]">
                  ₹{pkg.basicPrice || 299}{" "}
                  <span className="text-[10px] tracking-wide text-gray-400 font-bold uppercase ml-1">
                    / 30 days
                  </span>
                </div>
                <Link
                  to={`/packages/${pkg.id}`}
                  className={`flex items-center justify-center gap-2 w-full mt-6 py-3 rounded-2xl text-xs font-bold transition-all duration-300
                    ${i === 1
                      ? "bg-[#2563EB] text-white hover:bg-blue-700 shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-[#0D0D0D] hover:text-white"
                    }`}
                >
                  Get Access <HiChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )) : (
              <div className="col-span-5 text-center py-20 px-6 bg-blue-50/20 rounded-[3rem] border border-dashed border-[#2563EB]/20">
                <p className="text-[#0D0D0D] font-bold leading-relaxed max-w-2xl mx-auto text-lg">
                  If you came here, it means you are preparing for an interview or <br />
                  looking for an internship. <span className="text-[#2563EB] underline decoration-wavy decoration-[#2563EB]/30">For both, this is your last stop.</span> <br />
                  Buy our packages to know what experts are asking!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INTERNSHIP PROGRAM SECTION (Restored Matter) */}
      <section className="py-24 bg-white relative overflow-hidden" id="internship">
        <div className="absolute top-1/2 right-0 w-1/4 h-1/2 bg-blue-50/30 rounded-full blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2563EB] text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8 shadow-sm">
              Next Step: Your Career
            </div>
            <h2 className="text-4xl md:text-5xl text-[#0D0D0D] font-black leading-[1.1] mb-8 tracking-tight">
              The Aja 9-Month <br />
              <span className="text-[#2563EB]">Internship Path</span>
            </h2>
            <p className="text-gray-500 text-lg font-medium leading-relaxed mb-10 max-w-xl">
              Ready to take your tech journey further? Our flagship 9-month professional internship
              program provides immersive, hands-on experience with real Core IT projects,
              followed by full-time employment opportunities at Aja Consulting Services.
            </p>
            <div className="flex flex-col gap-6 mb-10">
              {[
                { title: "Real Core IT Projects", desc: "Work on live production environments." },
                { title: "Expert Mentorship", desc: "Learn from veterans with 10+ years experience." },
                { title: "Guaranteed Placement", desc: "Top performers join ACS full-time." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[#2563EB]">
                    <svg size={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0D0D0D]">{item.title}</h4>
                    <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="https://ajacs.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#0D0D0D] text-white text-sm font-bold rounded-2xl hover:bg-gray-800 shadow-2xl shadow-black/10 transition-all duration-300 group"
            >
              Join Internship (Main Website) <HiChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <div className="relative flex justify-center">
            <div className="w-full max-w-sm bg-gray-50 rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden border border-black/5 p-10 flex flex-col items-center justify-center relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img src="/logo.png" alt="Aja Internship" className="w-20 h-auto opacity-10 mb-6 transition-opacity group-hover:opacity-20" />
              <div className="text-center relative z-10">
                <div className="text-6xl text-[#0D0D0D] font-black tracking-tighter mb-2">9+</div>
                <div className="text-[10px] text-[#2563EB] font-bold uppercase tracking-[0.3em] mb-4">Months of Training</div>
                <div className="text-gray-400 text-xs font-medium leading-relaxed">Immersive hands-on <br /> professional experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO CLOUD */}
      <section className="py-24 border-t border-black/5 bg-[#F9FBFF]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-12">
            Trusted by Aspiring Professionals
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-2xl font-bold text-[#0D0D0D]">Google</div>
            <div className="text-2xl font-bold text-[#0D0D0D]">Microsoft</div>
            <div className="text-2xl font-bold text-[#0D0D0D]">amazon</div>
            <div className="text-2xl font-bold text-[#0D0D0D]">Meta</div>
            <div className="text-2xl font-bold text-[#0D0D0D]">tcs</div>
            <div className="text-2xl font-bold text-[#0D0D0D]">Infosys</div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto bg-[#0D0D0D] rounded-[3rem] py-20 px-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent opacity-50" />
          <h2 className="text-4xl md:text-5xl text-white font-bold mb-6 relative z-10">
            Ready to Ace Your Next <br /> Tech Interview?
          </h2>
          <p className="text-gray-400 font-medium mb-10 max-w-md mx-auto relative z-10 leading-relaxed">
            Join thousands of professionals who have accelerated their <br />
            careers with the Aja Interview Vault.
          </p>
          <div className="flex items-center justify-center gap-4 relative z-10">
            <Link
              to="/register"
              className="px-10 py-5 bg-[#2563EB] text-white text-sm font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
