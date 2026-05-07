import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
// ✅ UPGRADED: Using elite Heroicons 2
import { HiStar, HiLockClosed, HiChevronRight } from "react-icons/hi2";
import { fetchPackages } from "../../api/packageApi";
import { fetchQuestions } from "../../api/questionApi";

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
      // ✅ RESILIENT FETCHING: Decouple requests so one failure doesn't crash the page
      try {
        const pkgRes = await fetchPackages();
        const pkgData = pkgRes.data.content || pkgRes.data;
        setPackages(Array.isArray(pkgData) ? pkgData : []);
      } catch (err) {
        // Quietly fail and allow fallback UI
      }

      try {
        const quesRes = await fetchQuestions({ limit: 3 });
        const quesData = quesRes.data.content || quesRes.data;
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
      } catch (err) {
        // Quietly fail and use premium fallback content
        setSampleQuestions([
          { id: 's1', title: "What is the difference between abstract class and interface in Java?", technology: "Java", difficulty: "EASY" },
          { id: 's2', title: "How does the virtual DOM work in React?", technology: "React", difficulty: "MEDIUM" },
          { id: 's3', title: "Explain the concept of CI/CD pipelines in DevOps.", technology: "DevOps", difficulty: "HARD" }
        ]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen cosmic-bg font-sans relative overflow-hidden text-gray-200">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-[10%] right-[-10%] w-[35%] h-[35%] bg-blue-900/20 rounded-full blur-[120px] -z-10" />

      <Navbar />

      {/* HERO SECTION */}
      <section
        className={`relative pt-44 pb-20 px-6 transition-all duration-1000 flex flex-col items-center bg-cover bg-center bg-no-repeat ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(5,5,5,0.75), rgba(13,13,13,1)), url("/hero_bg.png")' }}
      >
        {/* Shooting Stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="shooting-star star-1"></div>
          <div className="shooting-star star-2"></div>
          <div className="shooting-star star-3"></div>
          <div className="shooting-star star-4"></div>
          <div className="shooting-star star-5"></div>
          <div className="shooting-star star-6"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
          {/* Aja Branding Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-sm">
                <img src="/logo.png" alt="Aja Logo" className="w-7 h-auto filter brightness-0 invert" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">AJA INTERVIEW VAULT</h2>
            </div>

            {/* Rocket Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 text-purple-100 text-[9px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm shadow-purple-500/30 backdrop-blur-sm">
              🚀 Empowering Your Career in IT
            </div>
          </div>

          {/* Symmetrical Refined Heading */}
          <h1 className="text-4xl md:text-6xl text-white font-black leading-[1.15] tracking-tight mb-8 px-4">
            The Portal for <br />
            <span className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">Professional <SlidingText /></span>
          </h1>

          {/* Refined Description */}
          <p className="text-base md:text-lg text-gray-300 font-medium leading-relaxed mb-12 max-w-2xl mx-auto px-4">
            Access curated interview question packages, real-world resources, and <br className="hidden md:block" />
            expert guidance — all designed to help you crack interviews and land top <br className="hidden md:block" />
            opportunities in the tech industry.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-5 mb-16 relative z-10">
            <Link
              to="/register"
              className="px-8 py-4 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all flex items-center gap-2"
            >
              Get Started <HiChevronRight size={18} />
            </Link>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border border-white/20 bg-white/10 backdrop-blur-md text-white text-sm font-bold rounded-xl hover:bg-white/20 transition-all shadow-sm"
            >
              Explore Packages
            </button>
          </div>

          {/* Trust Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-300 mb-4 px-4 relative z-10">
            {["9-Month Internship Program", "Interview Question Packages", "Career Acceleration"].map((text, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                <div className="w-4 h-4 rounded-full border border-purple-400/50 flex items-center justify-center text-purple-300 bg-purple-500/20">
                  <svg size={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2 h-2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE CARDS (Overview) */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative z-10" id="features">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Interview Packages",
              desc: "Curated questions from top tech companies with detailed solutions.",
              icon: "🌌",
              color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
              link: "/packages"
            },
            {
              title: "9-Month Internship",
              desc: "Hands-on experience, real projects, and mentorship from industry experts.",
              icon: "🚀",
              color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
              link: "https://ajacs.in"
            },
            {
              title: "Career Growth",
              desc: "Build skills, gain confidence, and accelerate your professional journey.",
              icon: "✨",
              color: "bg-teal-500/20 text-teal-300 border-teal-500/30",
              link: "/dashboard"
            }
          ].map((feat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 hover:border-purple-500/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] group flex flex-col">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-8 border ${feat.color} shadow-inner`}>
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 drop-shadow-md">{feat.title}</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8 flex-1">
                {feat.desc}
              </p>
              <Link to={feat.link} className="flex items-center gap-2 text-sm font-bold text-purple-400 group-hover:text-purple-300 group-hover:gap-3 transition-all">
                Learn More <HiChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* PACKAGES (Cosmic Subscription Section) */}
      <section className="px-6 py-24 relative z-10" id="packages">
        <div className="max-w-7xl mx-auto bg-[#0A0D14]/80 backdrop-blur-xl rounded-[3rem] p-12 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.2em] text-purple-400 uppercase mb-4 drop-shadow-md">
              Subscription Packages
            </p>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
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
                className={`bg-white/5 backdrop-blur-md rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-2 cursor-pointer relative group
                  ${i === 1 ? "border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "border-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"}`}
              >
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                    Most Popular
                  </div>
                )}
                <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform origin-left text-purple-400 drop-shadow-md">
                  {i === 0 ? "⚙️" : i === 1 ? "⚛️" : i === 2 ? "☁️" : i === 3 ? "🐍" : "☕"}
                </div>
                <div className="text-sm font-bold text-white mb-2 font-serif">
                  {pkg.name || "Package"}
                </div>
                <div className="text-xs text-gray-400 font-medium leading-relaxed mb-6 line-clamp-2">
                  {pkg.technologyName || pkg.description || "Core concepts and advanced topics"}
                </div>
                <div className="text-2xl font-bold text-white">
                  ₹{pkg.basicPrice || 299}{" "}
                  <span className="text-[10px] tracking-wide text-gray-500 font-bold uppercase ml-1">
                    / 30 days
                  </span>
                </div>
                <Link
                  to={`/packages/${pkg.id}`}
                  className={`flex items-center justify-center gap-2 w-full mt-6 py-3 rounded-2xl text-xs font-bold transition-all duration-300
                    ${i === 1
                      ? "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                    }`}
                >
                  Get Access <HiChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )) : (
              <div className="col-span-5 text-center py-20 px-6 bg-purple-900/20 backdrop-blur-sm rounded-[3rem] border border-dashed border-purple-500/30">
                <p className="text-white font-bold leading-relaxed max-w-2xl mx-auto text-lg">
                  If you came here, it means you are preparing for an interview or <br />
                  looking for an internship. <span className="text-purple-400 underline decoration-wavy decoration-purple-500/50">For both, this is your last stop.</span> <br />
                  Buy our packages to know what experts are asking!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INTERNSHIP PROGRAM SECTION (Cosmic Theme) */}
      <section className="py-24 bg-transparent relative overflow-hidden" id="internship">
        <div className="absolute top-1/2 right-0 w-1/4 h-1/2 bg-purple-900/20 rounded-full blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8 shadow-sm border border-purple-500/30">
              Next Step: Your Career
            </div>
            <h2 className="text-4xl md:text-5xl text-white font-black leading-[1.1] mb-8 tracking-tight drop-shadow-lg">
              The Aja 9-Month <br />
              <span className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">Internship Path</span>
            </h2>
            <p className="text-gray-300 text-lg font-medium leading-relaxed mb-10 max-w-xl">
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
                  <div className="mt-1 w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    <svg size={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="https://ajacs.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#0D0D0D] text-sm font-bold rounded-2xl hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 group"
            >
              Join Internship (Main Website) <HiChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <div className="relative flex justify-center">
            <div className="w-full max-w-sm bg-[#0B0E14]/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_40px_rgba(168,85,247,0.15)] overflow-hidden border border-white/10 p-10 flex flex-col items-center justify-center relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img src="/logo.png" alt="Aja Internship" className="w-20 h-auto opacity-20 mb-6 transition-opacity group-hover:opacity-40 filter brightness-0 invert" />
              <div className="text-center relative z-10">
                <div className="text-6xl text-white font-black tracking-tighter mb-2 drop-shadow-md">9+</div>
                <div className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.3em] mb-4">Months of Training</div>
                <div className="text-gray-400 text-xs font-medium leading-relaxed">Immersive hands-on <br /> professional experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO CLOUD */}
      <section className="py-24 border-t border-white/5 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-12">
            Trusted by Aspiring Professionals
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 text-white">
            <div className="text-2xl font-bold">Google</div>
            <div className="text-2xl font-bold">Microsoft</div>
            <div className="text-2xl font-bold">amazon</div>
            <div className="text-2xl font-bold">Meta</div>
            <div className="text-2xl font-bold">tcs</div>
            <div className="text-2xl font-bold">Infosys</div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 py-24 relative z-10">
        <div className="max-w-7xl mx-auto bg-[#0A0D14]/90 backdrop-blur-xl rounded-[3rem] py-20 px-10 text-center relative overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-500/30 via-transparent to-transparent opacity-60" />
          <h2 className="text-4xl md:text-5xl text-white font-bold mb-6 relative z-10 drop-shadow-lg">
            Ready to Ace Your Next <br /> Tech Interview?
          </h2>
          <p className="text-gray-300 font-medium mb-10 max-w-md mx-auto relative z-10 leading-relaxed">
            Join thousands of professionals who have accelerated their <br />
            careers with the Aja Interview Vault.
          </p>
          <div className="flex items-center justify-center gap-4 relative z-10">
            <Link
              to="/register"
              className="px-10 py-5 bg-purple-600 text-white text-sm font-bold rounded-2xl hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
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
