import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { Star, Lock, ChevronRight } from "lucide-react";

const sampleQuestions = [
  {
    id: 1,
    tech: "Java",
    rating: 5,
    title:
      "What is the difference between HashMap and ConcurrentHashMap in Java?",
    preview:
      "HashMap is not thread-safe and allows one null key. ConcurrentHashMap is thread-safe and uses segment-level locking...",
    tutor: "Rajesh K.",
    initials: "RK",
    package: "Backend Package",
  },
  {
    id: 2,
    tech: "React",
    rating: 5,
    title:
      "Explain the difference between useEffect and useLayoutEffect with real use cases.",
    preview:
      "useEffect runs asynchronously after the browser paints. useLayoutEffect runs synchronously after DOM updates but before paint...",
    tutor: "Priya M.",
    initials: "PM",
    package: "Frontend Package",
  },
  {
    id: 3,
    tech: "DevOps",
    rating: 4,
    title:
      "How would you design a zero-downtime deployment pipeline using Docker and Kubernetes?",
    preview:
      "Use a rolling update strategy in Kubernetes with readiness probes. Configure the deployment with maxUnavailable 0...",
    tutor: "Anil S.",
    initials: "AS",
    package: "DevOps Package",
  },
];

const packages = [
  {
    icon: "☕",
    name: "Backend",
    techs: "Java · Spring Boot · Microservices · SQL",
    price: "₹299",
    featured: false,
  },
  {
    icon: "⚛️",
    name: "Frontend",
    techs: "React · JavaScript · TypeScript · CSS",
    price: "₹299",
    featured: true,
  },
  {
    icon: "🐳",
    name: "DevOps",
    techs: "Docker · Kubernetes · CI/CD · Linux",
    price: "₹299",
    featured: false,
  },
  {
    icon: "☁️",
    name: "Salesforce",
    techs: "Apex · LWC · SOQL · Flows · Admin",
    price: "₹299",
    featured: false,
  },
  {
    icon: "🐍",
    name: "Python",
    techs: "Core Python · Django · Flask · OOP",
    price: "₹299",
    featured: false,
  },
];

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
      <Star
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

const LandingPage = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* HERO */}
      <section
        className={`pt-32 pb-20 px-6 text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium px-4 py-2 rounded-full mb-8">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            500+ Real Interview Questions — Curated by Experts
          </div>

          <h1 className="font-serif text-5xl md:text-7xl text-[#0A1628] leading-tight tracking-tight mb-6">
            Crack Any Tech Interview.{" "}
            <em className="text-[#2563EB] not-italic font-serif italic">
              Questions From Real Experiences.
            </em>
          </h1>

          <p className="text-lg text-gray-500 font-light leading-relaxed max-w-xl mx-auto mb-10">
            Thousands of interview questions collected from our consultancy
            employees, reviewed and rated by expert tutors. Your shortcut to
            interview-ready confidence.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/packages"
              className="px-7 py-3.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
            >
              Browse Free Questions
            </Link>
            <Link
              to="/packages"
              className="px-7 py-3.5 border border-black/10 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-1"
            >
              View Packages <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="border-y border-black/5 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { num: "500+", label: "Questions" },
            { num: "10+", label: "Technologies" },
            { num: "200+", label: "Contributors" },
            { num: "50+", label: "Expert Tutors" },
          ].map((s, i) => (
            <div
              key={i}
              className={`text-center py-4 ${i < 3 ? "border-r border-black/5" : ""}`}
            >
              <div className="font-serif text-4xl text-[#0A1628]">{s.num}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED QUESTIONS */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#2563EB] uppercase mb-2">
              Top Tutor Picks
            </p>
            <h2 className="font-serif text-4xl text-[#0A1628]">
              Sample Questions — Try Before You Buy
            </h2>
            <p className="text-gray-400 mt-2 font-light">
              Handpicked by our most experienced tutors.
            </p>
          </div>
          <Link
            to="/packages"
            className="text-sm text-gray-400 border border-black/8 px-4 py-2 rounded-lg hover:text-gray-700 hover:bg-gray-50 transition-all whitespace-nowrap"
          >
            See all questions →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sampleQuestions.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-black/8 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:border-blue-100 transition-all duration-250 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide ${techBadgeStyle[q.tech]}`}
                >
                  {q.tech}
                </span>
                <StarRating count={q.rating} />
              </div>

              <h3 className="text-sm font-semibold text-[#0A1628] leading-snug mb-4">
                {q.title}
              </h3>

              {/* Blurred Answer */}
              <div className="relative rounded-xl overflow-hidden bg-gray-50 p-3">
                <p className="text-xs text-gray-500 leading-relaxed blur-sm select-none pointer-events-none">
                  {q.preview}
                </p>
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl">
                  <button className="flex items-center gap-1.5 text-xs font-medium text-[#2563EB] bg-white border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all">
                    <Lock size={11} /> Unlock Answer
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-6 h-6 rounded-full bg-[#0A1628] text-white flex items-center justify-center text-xs font-semibold">
                    {q.initials}
                  </div>
                  Reviewed by {q.tutor}
                </div>
                <span className="text-xs text-gray-300">{q.package}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PACKAGES */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto bg-gray-50 rounded-3xl p-10">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest text-[#2563EB] uppercase mb-2">
              Subscription Packages
            </p>
            <h2 className="font-serif text-4xl text-[#0A1628]">
              Choose Your Technology Track
            </h2>
            <p className="text-gray-400 mt-2 font-light">
              Time-limited access to full question banks. Start from ₹299.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {packages.map((pkg, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-5 border transition-all duration-250 hover:-translate-y-1 hover:shadow-lg cursor-pointer relative
                  ${pkg.featured ? "border-2 border-[#2563EB]" : "border-black/8"}`}
              >
                {pkg.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="text-3xl mb-3">{pkg.icon}</div>
                <div className="text-sm font-semibold text-[#0A1628] mb-1">
                  {pkg.name}
                </div>
                <div className="text-xs text-gray-400 leading-relaxed mb-4">
                  {pkg.techs}
                </div>
                <div className="font-serif text-2xl text-[#0A1628]">
                  {pkg.price}{" "}
                  <span className="font-sans text-xs text-gray-400 font-normal">
                    / 30 days
                  </span>
                </div>
                <Link
                  to={`/packages`}
                  className={`block w-full mt-4 py-2 rounded-lg text-xs font-medium text-center transition-all
                    ${
                      pkg.featured
                        ? "bg-[#0A1628] text-white hover:bg-[#0F2340]"
                        : "border border-black/10 text-gray-700 hover:bg-[#0A1628] hover:text-white"
                    }`}
                >
                  Get Access
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/packages"
              className="inline-block px-8 py-3 border border-black/10 rounded-xl text-sm text-gray-600 hover:bg-white hover:shadow-sm transition-all"
            >
              View Full Stack Bundle — All 5 Tracks at ₹999 →
            </Link>
          </div>
        </div>
      </section>

      {/* TOP TUTORS */}
      <section className="py-20 px-6 max-w-7xl mx-auto" id="tutors">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest text-[#2563EB] uppercase mb-2">
            Our Expert Tutors
          </p>
          <h2 className="font-serif text-4xl text-[#0A1628]">
            Questions Reviewed by the Best
          </h2>
          <p className="text-gray-400 mt-2 font-light max-w-md mx-auto">
            Every question is vetted and rated by senior engineers with 5–15
            years of experience.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {tutors.map((t, i) => (
            <div
              key={i}
              className="bg-white border border-black/8 rounded-2xl p-6 text-center hover:-translate-y-1 hover:border-blue-100 transition-all duration-250"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0A1628] to-[#2563EB] text-white text-lg font-semibold flex items-center justify-center mx-auto mb-3">
                {t.initials}
              </div>
              <div className="text-sm font-semibold text-[#0A1628]">
                {t.name}
              </div>
              <div className="text-xs text-gray-400 mt-1 mb-3">{t.spec}</div>
              <StarRating count={t.rating} />
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-[#0A1628]">
                    {t.questions}
                  </div>
                  <div className="text-xs text-gray-300">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-[#0A1628]">
                    {t.experience}
                  </div>
                  <div className="text-xs text-gray-300">Experience</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto bg-[#0A1628] rounded-3xl py-20 px-10 text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Ready to Ace Your Next
            <br />
            Tech Interview?
          </h2>
          <p className="text-white/60 font-light mb-10 max-w-md mx-auto">
            Join professionals who prepared with Aja Internship Portal. Real
            questions, real answers, real confidence.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/register"
              className="px-7 py-3.5 bg-white text-[#0A1628] text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Start with Free Questions
            </Link>
            <Link
              to="/packages"
              className="px-7 py-3.5 border border-white/20 text-white text-sm rounded-xl hover:border-white/40 hover:bg-white/5 transition-all"
            >
              View All Packages →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
