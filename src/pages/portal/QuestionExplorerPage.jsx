import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  HiCommandLine, 
  HiUserGroup, 
  HiMagnifyingGlass, 
  HiChevronRight,
  HiBriefcase,
  HiTag,
  HiArrowPath,
  HiSquare3Stack3D,
  HiServerStack,
  HiVariable
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { PortalSidebar } from "../../components/portal/PortalSidebar";
import { fetchQuestions } from "../../api/questionApi";
import { fetchTechnologies } from "../../api/techApi";
import { fetchPackages } from "../../api/packageApi";
import TechBadge from "../../components/common/TechBadge";
import DifficultyBadge from "../../components/common/DifficultyBadge";

const QuestionExplorerPage = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [techList, setTechList] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [explorerMode, setExplorerMode] = useState("TECH"); // TECH or EMPLOYEE
  
  // Selection States
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("ALL"); // ALL, FRONTEND, BACKEND
  const [packageFilter, setPackageFilter] = useState("ALL");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorStatus(null);
      try {
        const [qRes, tRes, pRes] = await Promise.all([
          fetchQuestions({ size: 1000 }),
          fetchTechnologies(),
          fetchPackages()
        ]);
        setQuestions(qRes.data.content || qRes.data || []);
        setTechList(tRes.data || []);
        setPackages(pRes.data || []);
      } catch (err) {
        if (err.response?.status === 403) {
          setErrorStatus(403);
        } else {
          console.error("Explorer sync error:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDomain = (tech) => {
    if (!tech) return "OTHER";
    const fe = ["React", "HTML", "CSS", "JavaScript", "Frontend", "Flutter", "Angular", "Vue", "Web"];
    return fe.some(t => tech.toLowerCase().includes(t.toLowerCase())) ? "FRONTEND" : "BACKEND";
  };

  // --- Dynamic Drill-down Logic (Mode Aware) ---
  
  // L1: Primary Level
  const level1Groups = useMemo(() => {
    const groups = {};
    questions.forEach(q => {
      const tech = q.technologyName || "Other";
      const emp = q.submittedByName || "Internal Member";
      const domain = getDomain(tech);
      
      if (domainFilter !== "ALL" && domain !== domainFilter) return;
      if (packageFilter !== "ALL" && q.packageName !== packageFilter) return;

      const key = explorerMode === "TECH" ? tech : emp;
      if (!groups[key]) groups[key] = { name: key, count: 0 };
      groups[key].count++;
    });
    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [questions, domainFilter, packageFilter, explorerMode]);

  // L2: Secondary Level
  const level2Groups = useMemo(() => {
    const primarySelected = explorerMode === "TECH" ? selectedTech : selectedEmployee;
    if (!primarySelected) return [];
    
    const groups = {};
    questions.forEach(q => {
      const tech = q.technologyName || "Other";
      const emp = q.submittedByName || "Internal Member";
      
      const matchPrimary = explorerMode === "TECH" ? tech === selectedTech : emp === selectedEmployee;
      if (!matchPrimary) return;
      
      const key = explorerMode === "TECH" ? emp : tech;
      if (!groups[key]) groups[key] = { name: key, count: 0 };
      groups[key].count++;
    });
    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [questions, selectedTech, selectedEmployee, explorerMode]);

  // L3: Tertiary Level (Clients)
  const clientSubGroups = useMemo(() => {
    if (!selectedTech || !selectedEmployee) return [];
    const groups = {};
    questions.forEach(q => {
      const tech = q.technologyName || "Other";
      const emp = q.submittedByName || "Internal Member";
      
      if (tech !== selectedTech || emp !== selectedEmployee) return;
      
      const client = q.clientName || "General Intake";
      if (!groups[client]) groups[client] = { name: client, count: 0 };
      groups[client].count++;
    });
    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [questions, selectedTech, selectedEmployee]);

  const finalQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesDomain = domainFilter === "ALL" || getDomain(q.technologyName) === domainFilter;
      const matchesPackage = packageFilter === "ALL" || q.packageName === packageFilter;
      const matchesTech = !selectedTech || q.technologyName === selectedTech;
      const matchesEmp = !selectedEmployee || q.submittedByName === selectedEmployee;
      const matchesClient = !selectedClient || q.clientName === selectedClient;
      const matchesSearch = !searchQuery || q.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDomain && matchesPackage && matchesTech && matchesEmp && matchesClient && matchesSearch;
    });
  }, [questions, selectedTech, selectedEmployee, selectedClient, searchQuery, domainFilter, packageFilter]);

  const resetFilters = () => {
    setSelectedTech(null);
    setSelectedEmployee(null);
    setSelectedClient(null);
    setSearchQuery("");
    setDomainFilter("ALL");
    setPackageFilter("ALL");
  };


  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden portal-modern">
      <PortalSidebar user={user} role={user?.role} activeItem="Explorer" />      <main className="flex-1 flex flex-col overflow-hidden">
        {errorStatus === 403 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-white/50 backdrop-blur-sm animate-fade-in">
             <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-500 mb-8 border border-red-100 shadow-xl shadow-red-500/10">
                <HiVariable size={40} />
             </div>
             <h1 className="text-4xl font-serif text-[#0F172A] mb-4 font-bold italic">Intelligence Locked</h1>
             <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-10 italic">
                Your backend security core is currently restricting access to global intelligence for the Employee role.
             </p>
             <Link to="/portal/dashboard" className="px-8 py-4 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-900 transition-all shadow-2xl shadow-blue-900/20 active:scale-95">
                Return to Dashboard
             </Link>
             <div className="mt-16 opacity-30">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-200 pt-8 italic">
                   Aja Security Protocol • Sync Status: Forbidden
                </p>
             </div>
          </div>
        ) : (
          <>
            {/* Top Header / Filter Bar */}
            <header className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex items-center justify-between shadow-sm relative z-10">
              <div className="flex items-center gap-8">
                <div>
                  <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Question Explorer</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mastery Knowledge Base</p>
                </div>
                
                <div className="h-8 w-px bg-gray-100 hidden lg:block" />
                
                {/* Mode Toggle */}
                <div className="hidden lg:flex bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
                  <button 
                    onClick={() => { setExplorerMode("TECH"); resetFilters(); }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${explorerMode === "TECH" ? "bg-white text-blue-600 shadow-sm border border-black/5" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <HiCommandLine size={14} /> Technology
                  </button>
                  <button 
                    onClick={() => { setExplorerMode("EMPLOYEE"); resetFilters(); }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${explorerMode === "EMPLOYEE" ? "bg-white text-blue-600 shadow-sm border border-black/5" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <HiUserGroup size={14} /> Contributor
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-50 rounded-xl border border-transparent focus-within:border-blue-500/30 focus-within:bg-white transition-all overflow-hidden shrink-0">
                  <div className="flex items-center px-4 border-r border-gray-200">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-3">Domain</span>
                      <select 
                        className="bg-transparent text-[11px] font-bold text-[#1E293B] outline-none cursor-pointer py-2.5"
                        value={domainFilter}
                        onChange={(e) => setDomainFilter(e.target.value)}
                      >
                        <option value="ALL">All</option>
                        <option value="FRONTEND">FE</option>
                        <option value="BACKEND">BE</option>
                      </select>
                  </div>
                  <div className="flex items-center px-4 border-r border-gray-200">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-3">Package</span>
                      <select 
                        className="bg-transparent text-[11px] font-bold text-[#1E293B] outline-none cursor-pointer py-2.5 max-w-[100px]"
                        value={packageFilter}
                        onChange={(e) => setPackageFilter(e.target.value)}
                      >
                        <option value="ALL">All</option>
                        {packages.map(pkg => (
                          <option key={pkg.id} value={pkg.name}>{pkg.name}</option>
                        ))}
                      </select>
                  </div>
                  <div className="relative group flex-1">
                      <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                      <input 
                        type="text"
                        placeholder="Search intel..."
                        className="pl-10 pr-4 py-2.5 bg-transparent text-xs font-medium outline-none w-48"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
                </div>
              </div>
            </header>

            {/* Explorer Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* L1 Navigation (Drill Down Pane) */}
              <aside className="w-80 border-r border-[#E2E8F0] bg-white overflow-y-auto flex flex-col">
                <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    {selectedEmployee && selectedTech ? "Select Client" : 
                     (explorerMode === "TECH" ? (selectedTech ? "Select Contributor" : "Select Technology") : (selectedEmployee ? "Select Technology" : "Select Contributor"))}
                  </span>
                  {(selectedTech || selectedEmployee) && (
                    <button 
                      onClick={() => {
                        if (explorerMode === "TECH") {
                           if (selectedEmployee) setSelectedEmployee(null);
                           else setSelectedTech(null);
                        } else {
                           if (selectedTech) setSelectedTech(null);
                           else setSelectedEmployee(null);
                        }
                        setSelectedClient(null);
                      }}
                      className="text-blue-600 text-[10px] font-bold flex items-center gap-1 hover:underline"
                    >
                      <HiArrowPath size={12} /> Back
                    </button>
                  )}
                </div>
                
                <div className="flex-1">
                  {loading ? (
                    <div className="py-20 text-center"><HiArrowPath className="animate-spin mx-auto text-blue-200" size={32} /></div>
                  ) : (
                    !(explorerMode === "TECH" ? selectedTech : selectedEmployee) ? level1Groups : (!(explorerMode === "TECH" ? selectedEmployee : selectedTech) ? level2Groups : clientSubGroups)
                  ).map(item => (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (explorerMode === "TECH") {
                           if (!selectedTech) setSelectedTech(item.name);
                           else if (!selectedEmployee) setSelectedEmployee(item.name);
                           else setSelectedClient(item.name);
                        } else {
                           if (!selectedEmployee) setSelectedEmployee(item.name);
                           else if (!selectedTech) setSelectedTech(item.name);
                           else setSelectedClient(item.name);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-blue-50/30 transition-all text-left group ${
                        (selectedClient === item.name || 
                        (explorerMode === "TECH" ? (!selectedClient && selectedEmployee === item.name) : (!selectedClient && selectedTech === item.name)) || 
                        (explorerMode === "TECH" ? (!selectedEmployee && !selectedClient && selectedTech === item.name) : (!selectedTech && !selectedClient && selectedEmployee === item.name))) ? "bg-blue-50 border-r-4 border-r-blue-600" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          (selectedClient === item.name || 
                          (explorerMode === "TECH" ? (!selectedClient && selectedEmployee === item.name) : (!selectedClient && selectedTech === item.name)) || 
                          (explorerMode === "TECH" ? (!selectedEmployee && !selectedClient && selectedTech === item.name) : (!selectedTech && !selectedClient && selectedEmployee === item.name))) ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                        }`}>
                          {explorerMode === "TECH" ? 
                             (!selectedTech ? <HiCommandLine size={16} /> : (!selectedEmployee ? <HiUserGroup size={16} /> : <HiBriefcase size={16} />)) :
                             (!selectedEmployee ? <HiUserGroup size={16} /> : (!selectedTech ? <HiCommandLine size={16} /> : <HiBriefcase size={16} />))
                          }
                        </div>
                        <div>
                          <div className={`text-[13px] font-semibold transition-colors ${(selectedClient === item.name || (explorerMode === "TECH" ? (!selectedClient && selectedEmployee === item.name) : (!selectedClient && selectedTech === item.name)) || (explorerMode === "TECH" ? (!selectedEmployee && !selectedClient && selectedTech === item.name) : (!selectedTech && !selectedClient && selectedEmployee === item.name))) ? "text-blue-600" : "text-[#1E293B]"}`}>
                            {item.name}
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium">
                            {item.count} Internal Packets
                          </div>
                        </div>
                      </div>
                      <HiChevronRight className={`text-gray-300 group-hover:text-blue-400 transition-all ${(selectedClient === item.name || (explorerMode === "TECH" ? (!selectedClient && selectedEmployee === item.name) : (!selectedClient && selectedTech === item.name)) || (explorerMode === "TECH" ? (!selectedEmployee && !selectedClient && selectedTech === item.name) : (!selectedTech && !selectedClient && selectedEmployee === item.name))) ? "translate-x-1 text-blue-400" : ""}`} />
                    </button>
                  ))}
                </div>
              </aside>

              {/* L2 Navigation / Results Pane */}
              <section className="flex-1 bg-[#F8FAFC] overflow-y-auto p-10">
                <div className="max-w-4xl mx-auto">
                  {/* Context Summary */}
                  {!selectedTech ? (
                    <div className="py-32 text-center animate-fade-in">
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-black/5 flex items-center justify-center mx-auto mb-6 text-blue-500">
                          <HiSquare3Stack3D size={32} />
                      </div>
                      <h2 className="text-2xl font-serif text-[#0F172A] mb-2 font-bold italic">Initiate Technical Drill-Down</h2>
                      <p className="text-sm text-gray-400 font-light max-w-xs mx-auto italic">Select a core technology from the left pane to begin investigating technical intelligence.</p>
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-3 mb-10 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={resetFilters}>Vault</span>
                        <HiChevronRight size={14} className="text-gray-300" />
                        <span className={`transition-colors ${!selectedEmployee ? 'text-blue-600' : 'hover:text-blue-600 cursor-pointer'}`} onClick={() => { setSelectedEmployee(null); setSelectedClient(null); }}>{selectedTech}</span>
                        {selectedEmployee && (
                          <>
                            <HiChevronRight size={14} className="text-gray-300" />
                            <span className={`transition-colors ${!selectedClient ? 'text-blue-600' : 'hover:text-blue-600 cursor-pointer'}`} onClick={() => setSelectedClient(null)}>{selectedEmployee}</span>
                          </>
                        )}
                        {selectedClient && (
                          <>
                            <HiChevronRight size={14} className="text-gray-300" />
                            <span className="text-blue-600">{selectedClient}</span>
                          </>
                        )}
                      </div>

                      <div className="mb-10 flex items-center justify-between">
                        <h2 className="text-3xl font-serif text-[#0F172A] font-bold tracking-tight">
                            {selectedClient || selectedEmployee || selectedTech} <span className="text-gray-300 ml-2 font-light">Repository</span>
                        </h2>
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-black/5">
                            <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-[#0A1628] bg-gray-50 rounded-lg">Recent</button>
                            <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Relevant</button>
                        </div>
                      </div>

                      {/* Question List */}
                      <div className="space-y-6">
                        {finalQuestions.length > 0 ? finalQuestions.map(q => (
                          <div key={q.id} className="bg-white rounded-[32px] border border-black/8 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-100 group-hover:bg-blue-500 transition-colors" />
                            
                            <div className="flex justify-between items-start mb-5">
                              <Link to={`/portal/questions/${q.id}`} className="text-xl font-bold text-[#1E293B] group-hover:text-blue-600 transition-colors leading-tight font-serif flex-1 pr-10">
                                {q.title}
                              </Link>
                              <DifficultyBadge difficulty={q.difficulty} />
                            </div>

                            <p className="text-sm text-gray-500 leading-relaxed italic font-light mb-6 line-clamp-2">
                              "{q.content || "Expert technical nuance regarding foundational implementation."}"
                            </p>

                            <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                              <div className="flex items-center gap-3">
                                  <TechBadge tech={q.technologyName} />
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500/60 uppercase tracking-widest italic bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100/50">
                                    <HiBriefcase size={12} /> {q.clientName || "General Intake"}
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs">
                                  <div className="text-right">
                                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Contributor</div>
                                    <button 
                                      onClick={() => { setSelectedEmployee(q.submittedByName); setExplorerMode("EMPLOYEE"); }}
                                      className="text-[#0F172A] font-bold hover:text-blue-600 transition-colors"
                                    >
                                        {q.submittedByName}
                                    </button>
                                  </div>
                                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 font-black border border-black/5">
                                    {q.submittedByName?.charAt(0)}
                                  </div>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="py-24 text-center bg-white border border-dashed border-black/5 rounded-[40px] text-gray-300 italic font-serif">
                            No matching intelligence packets found in this sector.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default QuestionExplorerPage;
