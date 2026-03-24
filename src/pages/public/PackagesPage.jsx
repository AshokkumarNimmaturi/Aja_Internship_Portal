import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { Check, X } from "lucide-react";

const packages = [
  {
    id: 1,
    icon: "☕",
    name: "Backend",
    description:
      "Master Java, Spring Boot and backend system design questions asked in top product companies.",
    techs: ["Java", "Spring Boot", "Microservices", "SQL", "REST APIs"],
    questionCount: 120,
    prices: { 30: 299, 90: 699, 180: 1199 },
    color: "bg-amber-50 border-amber-100",
    featured: false,
  },
  {
    id: 2,
    icon: "⚛️",
    name: "Frontend",
    description:
      "Ace React, JavaScript and modern frontend interviews with questions from real projects.",
    techs: ["React", "JavaScript", "TypeScript", "CSS", "Redux"],
    questionCount: 110,
    prices: { 30: 299, 90: 699, 180: 1199 },
    color: "bg-blue-50 border-blue-100",
    featured: true,
  },
  {
    id: 3,
    icon: "🐳",
    name: "DevOps",
    description:
      "Docker, Kubernetes, CI/CD and cloud questions from engineers who cleared DevOps interviews.",
    techs: ["Docker", "Kubernetes", "CI/CD", "Linux", "AWS"],
    questionCount: 90,
    prices: { 30: 299, 90: 699, 180: 1199 },
    color: "bg-emerald-50 border-emerald-100",
    featured: false,
  },
  {
    id: 4,
    icon: "☁️",
    name: "Salesforce",
    description:
      "Apex, LWC and Salesforce admin questions collected from certified consultants.",
    techs: ["Apex", "LWC", "SOQL", "Flows", "Admin"],
    questionCount: 95,
    prices: { 30: 299, 90: 699, 180: 1199 },
    color: "bg-red-50 border-red-100",
    featured: false,
  },
  {
    id: 5,
    icon: "🐍",
    name: "Python",
    description:
      "Core Python, Django and Flask questions from backend and data engineering interviews.",
    techs: ["Core Python", "Django", "Flask", "OOP", "Data Structures"],
    questionCount: 100,
    prices: { 30: 299, 90: 699, 180: 1199 },
    color: "bg-purple-50 border-purple-100",
    featured: false,
  },
];

const durations = [
  { days: 30, label: "30 Days", sublabel: "Basic" },
  { days: 90, label: "90 Days", sublabel: "Standard" },
  { days: 180, label: "180 Days", sublabel: "Premium" },
];

const comparisonFeatures = [
  { name: "Full Q&A Access", basic: true, standard: true, premium: true },
  { name: "Bookmark Questions", basic: true, standard: true, premium: true },
  { name: "Search & Filter", basic: true, standard: true, premium: true },
  { name: "Download Notes", basic: false, standard: true, premium: true },
  { name: "Priority Tutor Q&A", basic: false, standard: false, premium: true },
  {
    name: "Certificate of Completion",
    basic: false,
    standard: false,
    premium: true,
  },
];

const PackagesPage = () => {
  const [selectedDuration, setSelectedDuration] = useState(30);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-[#2563EB] uppercase mb-3">
            Subscription Packages
          </p>
          <h1 className="font-serif text-5xl text-[#0A1628] mb-4 leading-tight">
            Choose Your Technology Track
          </h1>
          <p className="text-gray-400 font-light text-lg leading-relaxed">
            Time-limited access to full question banks with expert answers. Pick
            the track that matches your interview goal.
          </p>
        </div>
      </section>

      {/* DURATION TOGGLE */}
      <div className="flex justify-center px-6 mb-12">
        <div className="inline-flex bg-gray-100 rounded-2xl p-1.5 gap-1">
          {durations.map((d) => (
            <button
              key={d.days}
              onClick={() => setSelectedDuration(d.days)}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedDuration === d.days
                  ? "bg-white text-[#0A1628] shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div>{d.label}</div>
              <div
                className={`text-xs font-normal ${
                  selectedDuration === d.days
                    ? "text-[#2563EB]"
                    : "text-gray-300"
                }`}
              >
                {d.sublabel}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* PACKAGE CARDS */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl border-2 p-6 transition-all duration-250 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                pkg.featured
                  ? "border-[#2563EB] shadow-blue-50 shadow-lg"
                  : "border-black/8 hover:border-blue-100"
              }`}
            >
              {/* Most Popular Badge */}
              {pkg.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}

              {/* Icon + Name */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-4xl block mb-3">{pkg.icon}</span>
                  <h3 className="text-lg font-semibold text-[#0A1628]">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xs">
                    {pkg.description}
                  </p>
                </div>
              </div>

              {/* Tech Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {pkg.techs.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2.5 py-1 bg-gray-50 border border-black/5 text-gray-500 rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Question Count */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs text-gray-400">
                  {pkg.questionCount}+ questions · 5 free samples included
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-5">
                <span className="font-serif text-4xl text-[#0A1628]">
                  ₹{pkg.prices[selectedDuration]}
                </span>
                <span className="text-sm text-gray-400">
                  / {selectedDuration} days
                </span>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-2 mb-6">
                {[
                  "Full Q&A Access",
                  "Bookmark Questions",
                  selectedDuration >= 90 ? "Download Notes" : null,
                  selectedDuration >= 180 ? "Priority Tutor Q&A" : null,
                  selectedDuration >= 180 ? "Certificate of Completion" : null,
                ]
                  .filter(Boolean)
                  .map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check size={13} className="text-green-500 shrink-0" />
                      <span className="text-xs text-gray-500">{feature}</span>
                    </div>
                  ))}
              </div>

              {/* CTA Button */}
              <Link
                to={`/packages/${pkg.id}`}
                className={`block w-full py-3 rounded-xl text-sm font-medium text-center transition-all ${
                  pkg.featured
                    ? "bg-[#0A1628] text-white hover:bg-[#0F2340]"
                    : "border border-black/10 text-gray-700 hover:bg-[#0A1628] hover:text-white"
                }`}
              >
                Get Access →
              </Link>
            </div>
          ))}

          {/* Full Stack Bundle Card */}
          <div className="md:col-span-2 lg:col-span-3 bg-[#0A1628] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🚀</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Full Stack Bundle
                  </h3>
                  <p className="text-white/50 text-sm">
                    All 5 tracks — Backend + Frontend + DevOps + Salesforce +
                    Python
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Java",
                  "React",
                  "Docker",
                  "Salesforce",
                  "Python",
                  "500+ Questions",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 bg-white/10 text-white/70 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-center md:text-right shrink-0">
              <div className="text-white/40 text-sm line-through mb-1">
                ₹{packages[0].prices[selectedDuration] * 5}
              </div>
              <div className="font-serif text-5xl text-white mb-1">₹999</div>
              <div className="text-white/40 text-xs mb-4">
                / {selectedDuration} days
              </div>
              <Link
                to="/register"
                className="inline-block px-8 py-3 bg-white text-[#0A1628] text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                Get Bundle Deal →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl text-[#0A1628] mb-2">
            Compare Plans
          </h2>
          <p className="text-gray-400 font-light text-sm">
            See what's included in each subscription tier
          </p>
        </div>

        <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 border-b border-black/5">
            <div className="p-5 text-sm font-medium text-gray-400">
              Features
            </div>
            {[
              { label: "Basic", days: "30 days", color: "text-gray-600" },
              { label: "Standard", days: "90 days", color: "text-[#2563EB]" },
              { label: "Premium", days: "180 days", color: "text-purple-600" },
            ].map((tier) => (
              <div
                key={tier.label}
                className="p-5 text-center border-l border-black/5"
              >
                <div className={`text-sm font-semibold ${tier.color}`}>
                  {tier.label}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{tier.days}</div>
              </div>
            ))}
          </div>

          {/* Table Rows */}
          {comparisonFeatures.map((feature, i) => (
            <div
              key={i}
              className={`grid grid-cols-4 border-b border-black/5 last:border-b-0 ${
                i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              <div className="p-5 text-sm text-gray-600">{feature.name}</div>
              {[feature.basic, feature.standard, feature.premium].map(
                (has, j) => (
                  <div
                    key={j}
                    className="p-5 flex items-center justify-center border-l border-black/5"
                  >
                    {has ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-gray-200" />
                    )}
                  </div>
                ),
              )}
            </div>
          ))}

          {/* Price Row */}
          <div className="grid grid-cols-4 bg-gray-50 border-t border-black/8">
            <div className="p-5 text-sm font-medium text-gray-600">Price</div>
            {[
              { price: "₹299", color: "text-gray-700" },
              { price: "₹699", color: "text-[#2563EB]" },
              { price: "₹1199", color: "text-purple-600" },
            ].map((tier, i) => (
              <div key={i} className="p-5 text-center border-l border-black/5">
                <span
                  className={`font-serif text-xl font-semibold ${tier.color}`}
                >
                  {tier.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PackagesPage;
