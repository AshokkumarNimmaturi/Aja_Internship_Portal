import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import {
  Check,
  Lock,
  Star,
  ArrowLeft,
  Clock,
  BookOpen,
  Users,
} from "lucide-react";

const packagesData = {
  1: {
    icon: "☕",
    name: "Backend",
    description:
      "Master Java, Spring Boot and backend system design questions asked in top product companies. Questions are collected from real employee interview experiences and reviewed by senior backend engineers.",
    techs: [
      "Java",
      "Spring Boot",
      "Microservices",
      "SQL",
      "REST APIs",
      "Design Patterns",
    ],
    questionCount: 120,
    tutorCount: 8,
    prices: { 30: 299, 90: 699, 180: 1199 },
    sampleQuestions: [
      {
        id: 1,
        title:
          "What is the difference between HashMap and ConcurrentHashMap in Java? When would you use each?",
        preview:
          "HashMap is not thread-safe and allows one null key. ConcurrentHashMap is thread-safe and uses segment-level locking. Use HashMap in single-threaded environments...",
      },
      {
        id: 2,
        title:
          "Explain the Spring Bean lifecycle. What are the different scopes available?",
        preview:
          "Spring Bean lifecycle goes through instantiation, property assignment, BeanNameAware, BeanFactoryAware, ApplicationContextAware, pre-initialization, InitializingBean...",
      },
      {
        id: 3,
        title:
          "What is the difference between @RestController and @Controller in Spring Boot?",
        preview:
          "@RestController is a convenience annotation combining @Controller and @ResponseBody. Every method in a @RestController returns data directly as JSON or XML...",
      },
      {
        id: 4,
        title:
          "How does JPA handle the N+1 query problem and what are the solutions?",
        preview:
          "The N+1 problem occurs when fetching a list of entities causes one query for the parent and N queries for each child. Solutions include JOIN FETCH, @EntityGraph...",
      },
      {
        id: 5,
        title:
          "Explain the difference between @Transactional propagation levels in Spring.",
        preview:
          "REQUIRED (default) joins existing transaction or creates new one. REQUIRES_NEW always creates a new transaction. NESTED creates a savepoint within the current transaction...",
      },
    ],
    features: [
      "Full access to 120+ backend questions",
      "Detailed answers with code examples",
      "Questions organized by topic and difficulty",
      "Bookmark important questions",
      "Search and filter by technology",
      "Regular updates with new questions",
    ],
  },
  2: {
    icon: "⚛️",
    name: "Frontend",
    description:
      "Ace React, JavaScript and modern frontend interviews with questions from real projects and real interview experiences across top product and service companies.",
    techs: ["React", "JavaScript", "TypeScript", "CSS", "Redux", "Performance"],
    questionCount: 110,
    tutorCount: 6,
    prices: { 30: 299, 90: 699, 180: 1199 },
    sampleQuestions: [
      {
        id: 1,
        title:
          "Explain the difference between useEffect and useLayoutEffect with real use cases.",
        preview:
          "useEffect runs asynchronously after the browser paints. useLayoutEffect runs synchronously after DOM updates but before paint. Use useLayoutEffect when you need to measure DOM...",
      },
      {
        id: 2,
        title:
          "What is React reconciliation and how does the Virtual DOM work?",
        preview:
          "React reconciliation is the process by which React updates the DOM. When state changes React creates a new Virtual DOM tree and diffs it against the previous one...",
      },
      {
        id: 3,
        title:
          "How do you optimize React performance? Explain useMemo and useCallback.",
        preview:
          "useMemo memoizes computed values to avoid expensive recalculations. useCallback memoizes function references to prevent child re-renders...",
      },
      {
        id: 4,
        title:
          "What is the difference between controlled and uncontrolled components in React?",
        preview:
          "Controlled components have their form data handled by React state. Uncontrolled components store form data in the DOM itself accessed via refs...",
      },
      {
        id: 5,
        title: "Explain event bubbling and event delegation in JavaScript.",
        preview:
          "Event bubbling is when an event triggered on a child element propagates up through its parent elements. Event delegation leverages this by attaching a single listener...",
      },
    ],
    features: [
      "Full access to 110+ frontend questions",
      "Detailed answers with code examples",
      "React hooks deep dive questions",
      "JavaScript fundamentals coverage",
      "TypeScript interview questions",
      "Performance optimization topics",
    ],
  },
  3: {
    icon: "🐳",
    name: "DevOps",
    description:
      "Docker, Kubernetes, CI/CD and cloud questions from engineers who cleared DevOps and SRE interviews at top tech companies.",
    techs: ["Docker", "Kubernetes", "CI/CD", "Linux", "AWS", "Monitoring"],
    questionCount: 90,
    tutorCount: 5,
    prices: { 30: 299, 90: 699, 180: 1199 },
    sampleQuestions: [
      {
        id: 1,
        title:
          "How would you design a zero-downtime deployment pipeline using Docker and Kubernetes?",
        preview:
          "Use a rolling update strategy in Kubernetes with readiness probes. Configure maxUnavailable: 0 and maxSurge: 1. Implement health checks and use blue-green deployments...",
      },
      {
        id: 2,
        title:
          "What is the difference between a Docker image and a Docker container?",
        preview:
          "A Docker image is a read-only template with instructions for creating a container. A container is a runnable instance of an image...",
      },
      {
        id: 3,
        title:
          "Explain Kubernetes pod scheduling and how resource limits work.",
        preview:
          "The Kubernetes scheduler assigns pods to nodes based on resource requirements, node affinity, taints and tolerations. Resource limits define CPU and memory boundaries...",
      },
      {
        id: 4,
        title:
          "What is the difference between horizontal and vertical scaling in cloud architecture?",
        preview:
          "Horizontal scaling adds more instances of a service. Vertical scaling increases the resources of an existing instance. Horizontal is preferred for stateless services...",
      },
      {
        id: 5,
        title:
          "How do you implement a CI/CD pipeline from scratch using GitHub Actions?",
        preview:
          "Create a .github/workflows directory with YAML workflow files. Define triggers on push or pull request. Add jobs for build, test, and deploy stages...",
      },
    ],
    features: [
      "Full access to 90+ DevOps questions",
      "Docker and Kubernetes deep dives",
      "CI/CD pipeline design questions",
      "Cloud architecture scenarios",
      "Linux and shell scripting topics",
      "Monitoring and observability",
    ],
  },
  4: {
    icon: "☁️",
    name: "Salesforce",
    description:
      "Apex, LWC and Salesforce admin questions collected from certified consultants with years of real project experience.",
    techs: ["Apex", "LWC", "SOQL", "Flows", "Admin", "Integration"],
    questionCount: 95,
    tutorCount: 4,
    prices: { 30: 299, 90: 699, 180: 1199 },
    sampleQuestions: [
      {
        id: 1,
        title:
          "What is the difference between trigger.new and trigger.old in Salesforce Apex?",
        preview:
          "Trigger.new contains the new versions of records being inserted or updated. Trigger.old contains old versions of records being updated or deleted...",
      },
      {
        id: 2,
        title: "Explain the Salesforce governor limits and how to handle them.",
        preview:
          "Governor limits are runtime limits enforced by Salesforce to ensure efficient use of shared resources. Key limits include 150 SOQL queries per transaction...",
      },
      {
        id: 3,
        title:
          "What is the difference between Aura components and Lightning Web Components?",
        preview:
          "LWC is built on modern web standards using native browser features. Aura uses a proprietary framework. LWC has better performance and simpler syntax...",
      },
      {
        id: 4,
        title:
          "How do you implement field-level security and record-level security in Salesforce?",
        preview:
          "Field-level security is controlled through profiles and permission sets. Record-level security uses OWD, role hierarchy, sharing rules and manual sharing...",
      },
      {
        id: 5,
        title:
          "Explain the Salesforce deployment process and different tools available.",
        preview:
          "Salesforce deployment can be done via Change Sets, Salesforce CLI, ANT migration tool or VS Code with Salesforce extensions...",
      },
    ],
    features: [
      "Full access to 95+ Salesforce questions",
      "Apex coding questions with solutions",
      "LWC component design patterns",
      "Admin and configuration topics",
      "Integration and API questions",
      "Real project scenario questions",
    ],
  },
  5: {
    icon: "🐍",
    name: "Python",
    description:
      "Core Python, Django and Flask questions from backend and data engineering interviews at product and service companies.",
    techs: [
      "Core Python",
      "Django",
      "Flask",
      "OOP",
      "Data Structures",
      "Async",
    ],
    questionCount: 100,
    tutorCount: 5,
    prices: { 30: 299, 90: 699, 180: 1199 },
    sampleQuestions: [
      {
        id: 1,
        title:
          "What is the difference between a list and a tuple in Python? When would you use each?",
        preview:
          "Lists are mutable and allow changes after creation. Tuples are immutable and cannot be changed. Use tuples for fixed data like coordinates or RGB values...",
      },
      {
        id: 2,
        title: "Explain Python decorators with a real-world example.",
        preview:
          "Decorators are functions that modify the behavior of other functions. They use the @syntax and wrap the original function...",
      },
      {
        id: 3,
        title:
          "What is the GIL in Python and how does it affect multithreading?",
        preview:
          "The Global Interpreter Lock is a mutex that protects access to Python objects preventing multiple threads from executing Python bytecodes simultaneously...",
      },
      {
        id: 4,
        title:
          "How does Django handle database migrations and what is the migration workflow?",
        preview:
          "Django migrations track changes to models and apply them to the database. The workflow is: change models, run makemigrations, review migration file, run migrate...",
      },
      {
        id: 5,
        title:
          "Explain the difference between synchronous and asynchronous programming in Python.",
        preview:
          "Synchronous code executes sequentially blocking until each operation completes. Async code using asyncio allows concurrent operations without blocking...",
      },
    ],
    features: [
      "Full access to 100+ Python questions",
      "Core Python fundamentals coverage",
      "Django and Flask framework questions",
      "Data structures and algorithms",
      "OOP design pattern questions",
      "Async programming topics",
    ],
  },
};

const tiers = [
  { days: 30, label: "Basic", price: 299, recommended: false },
  { days: 90, label: "Standard", price: 699, recommended: true },
  { days: 180, label: "Premium", price: 1199, recommended: false },
];

const PackageDetailPage = () => {
  const { id } = useParams();
  const [selectedTier, setSelectedTier] = useState(90);
  const pkg = packagesData[id];

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#0A1628] mb-3">
            Package not found
          </h2>
          <Link
            to="/packages"
            className="text-[#2563EB] text-sm hover:underline"
          >
            ← Back to packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* HERO */}
      <section className="pt-28 pb-12 px-6 border-b border-black/5">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
          >
            <ArrowLeft size={15} /> Back to packages
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="text-5xl">{pkg.icon}</div>
              <div>
                <h1 className="font-serif text-4xl text-[#0A1628] mb-2">
                  {pkg.name} Package
                </h1>
                <p className="text-gray-400 font-light leading-relaxed max-w-lg">
                  {pkg.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <BookOpen size={14} className="text-[#2563EB]" />
                    {pkg.questionCount}+ Questions
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users size={14} className="text-[#2563EB]" />
                    {pkg.tutorCount} Expert Tutors
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={14} className="text-[#2563EB]" />
                    Updated 2026
                  </div>
                </div>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {pkg.techs.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-3 py-1 bg-gray-50 border border-black/5 text-gray-500 rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Price */}
            <div className="shrink-0 bg-gray-50 rounded-2xl p-5 border border-black/5 min-w-[180px]">
              <div className="text-xs text-gray-400 mb-1">Starting from</div>
              <div className="font-serif text-4xl text-[#0A1628]">₹299</div>
              <div className="text-xs text-gray-400 mb-4">/ 30 days</div>
              <Link
                to={`/checkout/${id}?tier=${selectedTier}`}
                className="block w-full py-2.5 bg-[#0A1628] text-white text-xs font-medium rounded-xl text-center hover:bg-[#0F2340] transition-all"
              >
                Get Access Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT — Sample Questions */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl text-[#0A1628] mb-2">
              5 Free Sample Questions
            </h2>
            <p className="text-sm text-gray-400 mb-6 font-light">
              Try these before you buy. Full answers are unlocked after
              subscribing.
            </p>

            <div className="flex flex-col gap-4">
              {pkg.sampleQuestions.map((q, i) => (
                <div
                  key={q.id}
                  className="bg-white border border-black/8 rounded-2xl overflow-hidden"
                >
                  {/* Question Header */}
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gray-50 border border-black/5 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-400 shrink-0">
                        {i + 1}
                      </div>
                      <h3 className="text-sm font-semibold text-[#0A1628] leading-snug">
                        {q.title}
                      </h3>
                    </div>
                  </div>

                  {/* Answer Preview — Blurred */}
                  <div className="relative mx-5 mb-5 rounded-xl overflow-hidden bg-gray-50 p-4">
                    <p className="text-xs text-gray-500 leading-relaxed blur-sm select-none pointer-events-none">
                      {q.preview}
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl">
                      <Link
                        to={`/checkout/${id}?tier=30`}
                        className="flex items-center gap-2 text-xs font-medium text-[#2563EB] bg-white border border-blue-100 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all shadow-sm"
                      >
                        <Lock size={12} />
                        Subscribe to Unlock
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Pricing + Features */}
          <div className="flex flex-col gap-6">
            {/* Pricing Tiers */}
            <div>
              <h2 className="font-serif text-2xl text-[#0A1628] mb-4">
                Choose Your Plan
              </h2>
              <div className="flex flex-col gap-3">
                {tiers.map((tier) => (
                  <div
                    key={tier.days}
                    onClick={() => setSelectedTier(tier.days)}
                    className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                      selectedTier === tier.days
                        ? "border-[#2563EB] bg-blue-50/30"
                        : "border-black/8 hover:border-blue-100"
                    }`}
                  >
                    {tier.recommended && (
                      <div className="absolute -top-3 left-4 bg-[#2563EB] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Recommended
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-[#0A1628]">
                          {tier.label}
                        </div>
                        <div className="text-xs text-gray-400">
                          {tier.days} days access
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-2xl text-[#0A1628]">
                          ₹{tier.price}
                        </div>
                      </div>
                    </div>
                    {selectedTier === tier.days && (
                      <div className="mt-3 pt-3 border-t border-blue-100 flex flex-col gap-1">
                        {[
                          "Full Q&A Access",
                          tier.days >= 90 ? "Download Notes" : null,
                          tier.days >= 180 ? "Priority Tutor Q&A" : null,
                          tier.days >= 180 ? "Certificate" : null,
                        ]
                          .filter(Boolean)
                          .map((f) => (
                            <div key={f} className="flex items-center gap-2">
                              <Check size={11} className="text-[#2563EB]" />
                              <span className="text-xs text-gray-500">{f}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Link
                to={`/checkout/${id}?tier=${selectedTier}`}
                className="block w-full mt-4 py-3.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl text-center hover:bg-[#0F2340] transition-all"
              >
                Buy {pkg.name} Package →
              </Link>
              <p className="text-center text-xs text-gray-300 mt-2">
                Instant access after payment
              </p>
            </div>

            {/* What You Get */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-black/5">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-4">
                What You Get
              </h3>
              <div className="flex flex-col gap-2.5">
                {pkg.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <Check
                      size={14}
                      className="text-green-500 shrink-0 mt-0.5"
                    />
                    <span className="text-xs text-gray-500 leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tutor Rating */}
            <div className="bg-white border border-black/8 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                "Questions are extremely relevant to real interviews. Every
                answer is detailed with examples."
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-7 h-7 rounded-full bg-[#0A1628] text-white text-xs font-semibold flex items-center justify-center">
                  RK
                </div>
                <div>
                  <div className="text-xs font-medium text-[#0A1628]">
                    Rajesh Kumar
                  </div>
                  <div className="text-xs text-gray-300">
                    Senior Tutor · Java & Spring
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PackageDetailPage;
