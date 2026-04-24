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
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      <PortalSidebar user={user} role={user?.role} activeItem="Explorer" />      <main className="flex-1 flex flex-col overflow-hidden">
        {errorStatus === 403 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-fade-in">
             <div className="w-20 h-20 bg-red-50 rounded-lg flex items-center justify-center text-red-500 mb-8 border border-red-100 shadow-sm">
                <HiVariable size={32} />
             </div>
             <h1 className="text-xl font-bold text-[#0A1628] mb-2">Intelligence Locked</h1>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-xs leading-relaxed mb-10">
                Aja security protocols are currently restricting global intel access for your role.
             </p>
             <Link to="/portal/dashboard" className="px-8 py-3 bg-[#0A1628] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all active:scale-95">
                Back to Command
             </Link>
          </div>
        ) : (
          <>
            {/* Top Header / Filter Bar - Professional */}
            <header className="bg-white border-b border-[#E3E6E8] px-8 py-4 flex items-center justify-between shadow-sm relative z-10">
              <div className="flex items-center gap-8">
                <div>
                  <h1 className="text-lg font-bold text-[#0A1628] tracking-tight">Question Explorer</h1>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Mastery Knowledge Base</p>
                </div>
                
                <div className="h-8 w-px bg-gray-100 hidden lg:block" />
                
                {/* Mode Toggle - Sharp */}
                <div className="hidden lg:flex bg-gray-100 p-1 rounded-lg border border-[#E3E6E8]">
                  <button 
                    onClick={() => { setExplorerMode("TECH"); resetFilters(); }}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${explorerMode === "TECH" ? "bg-white text-[#0074CC] shadow-sm border border-[#E3E6E8]" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <HiCommandLine size={12} /> Technology
                  </button>
                  <button 
                    onClick={() => { setExplorerMode("EMPLOYEE"); resetFilters(); }}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${explorerMode === "EMPLOYEE" ? "bg-white text-[#0074CC] shadow-sm border border-[#E3E6E8]" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <HiUserGroup size={12} /> Contributor
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-50 rounded-lg border border-[#E3E6E8] focus-within:border-[#0074CC] focus-within:bg-white transition-all overflow-hidden shrink-0">
                  <div className="flex items-center px-4 border-r border-[#E3E6E8]">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mr-2">Domain</span>
                      <select 
                        className="bg-transparent text-[10px] font-bold text-[#232629] outline-none cursor-pointer py-2"
                        value={domainFilter}
                        onChange={(e) => setDomainFilter(e.target.value)}
                      >
                        <option value="ALL">All</option>
                        <option value="FRONTEND">FE</option>
                        <option value="BACKEND">BE</option>
                      </select>
                  </div>
                  <div className="flex items-center px-4 border-r border-[#E3E6E8]">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mr-2">Pack</span>
                      <select 
                        className="bg-transparent text-[10px] font-bold text-[#232629] outline-none cursor-pointer py-2 max-w-[80px]"
                        value={packageFilter}
                        onChange={(e) => setPackageFilter(e.target.value)}
                      >
                        <option value="ALL">All</option>
                        {packages.map(pkg => (
                          <option key={pkg.id} value={pkg.name}>{pkg.name}</option>
                        ))}
                      </select>
                  </div>
                  <div className="relative group">
                      <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0074CC] transition-colors" size={14} />
                      <input 
                        type="text"
                        placeholder="Search intel..."
                        className="pl-9 pr-3 py-2 bg-transparent text-[10px] font-medium outline-none w-40"
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
              <aside className="w-80 border-r border-[#E3E6E8] bg-white overflow-y-auto flex flex-col">
                <div className="px-5 py-3 border-b border-[#F3F4F6] bg-gray-50/30 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {selectedEmployee && selectedTech ? "Select Client" : 
                     (explorerMode === "TECH" ? (selectedTech ? "Contributor" : "Technology") : (selectedEmployee ? "Technology" : "Contributor"))}
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
                      className="text-[#0074CC] text-[9px] font-bold uppercase tracking-widest hover:underline"
                    >
                      Back
                    </button>
                  )}
                </div>
                
                <div className="flex-1">
                  {loading ? (
                    <div className="py-20 text-center"><HiArrowPath className="animate-spin mx-auto text-gray-200" size={24} /></div>
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
                      className={`w-full flex items-center justify-between px-5 py-3.5 border-b border-[#F3F4F6] hover:bg-[#0074CC]/5 transition-all text-left group ${
                        (selectedClient === item.name || 
                        (explorerMode === "TECH" ? (!selectedClient && selectedEmployee === item.name) : (!selectedClient && selectedTech === item.name)) || 
                        (explorerMode === "TECH" ? (!selectedEmployee && !selectedClient && selectedTech === item.name) : (!selectedTech && !selectedClient && selectedEmployee === item.name))) ? "bg-[#0074CC]/5 border-r-2 border-[#0074CC]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          (selectedClient === item.name || 
                          (explorerMode === "TECH" ? (!selectedClient && selectedEmployee === item.name) : (!selectedClient && selectedTech === item.name)) || 
                          (explorerMode === "TECH" ? (!selectedEmployee && !selectedClient && selectedTech === item.name) : (!selectedTech && !selectedClient && selectedEmployee === item.name))) ? "bg-[#0074CC] text-white" : "bg-gray-50 text-gray-400 group-hover:text-[#0074CC]"
                        }`}>
                          {explorerMode === "TECH" ? 
                             (!selectedTech ? <HiCommandLine size={14} /> : (!selectedEmployee ? <HiUserGroup size={14} /> : <HiBriefcase size={14} />)) :
                             (!selectedEmployee ? <HiUserGroup size={14} /> : (!selectedTech ? <HiCommandLine size={14} /> : <HiBriefcase size={14} />))
                          }
                        </div>
                        <div>
                          <div className={`text-xs font-bold transition-colors uppercase tracking-tight ${(selectedClient === item.name || (explorerMode === "TECH" ? (!selectedClient && selectedEmployee === item.name) : (!selectedClient && selectedTech === item.name)) || (explorerMode === "TECH" ? (!selectedEmployee && !selectedClient && selectedTech === item.name) : (!selectedTech && !selectedClient && selectedEmployee === item.name))) ? "text-[#0074CC]" : "text-[#0A1628]"}`}>
                            {item.name}
                          </div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                            {item.count} Intel Packets
                          </div>
                        </div>
                      </div>
                      <HiChevronRight className={`text-gray-200 group-hover:text-[#0074CC] transition-all size={14} ${(selectedClient === item.name || (explorerMode === "TECH" ? (!selectedClient && selectedEmployee === item.name) : (!selectedClient && selectedTech === item.name)) || (explorerMode === "TECH" ? (!selectedEmployee && !selectedClient && selectedTech === item.name) : (!selectedTech && !selectedClient && selectedEmployee === item.name))) ? "translate-x-0.5 text-[#0074CC]" : ""}`} />
                    </button>
                  ))}
                </div>
              </aside>

              {/* L2 Navigation / Results Pane - Professional */}
              <section className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                  {/* Context Summary */}
                  {!selectedTech && !selectedEmployee ? (
                    <div className="py-24 text-center">
                      <div className="w-16 h-16 bg-white rounded-lg shadow-sm border border-[#E3E6E8] flex items-center justify-center mx-auto mb-6 text-gray-200">
                          <HiSquare3Stack3D size={32} />
                      </div>
                      <h2 className="text-sm font-bold text-[#0A1628] mb-1 uppercase tracking-widest">Initiate Discovery</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-xs mx-auto">Select a core vector from the drill-down pane to investigate technical intel.</p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-300">
                      <div className="flex items-center gap-3 mb-8 text-gray-400 text-[9px] font-bold uppercase tracking-widest">
                        <span className="hover:text-[#0074CC] cursor-pointer transition-colors" onClick={resetFilters}>Vault</span>
                        <HiChevronRight size={12} className="text-gray-300" />
                        <span className={`transition-colors ${!selectedEmployee ? 'text-[#0074CC]' : 'hover:text-[#0074CC] cursor-pointer'}`} onClick={() => { setSelectedEmployee(null); setSelectedClient(null); }}>{selectedTech || "All Stacks"}</span>
                        {selectedEmployee && (
                          <>
                            <HiChevronRight size={12} className="text-gray-300" />
                            <span className={`transition-colors ${!selectedClient ? 'text-[#0074CC]' : 'hover:text-[#0074CC] cursor-pointer'}`} onClick={() => setSelectedClient(null)}>{selectedEmployee}</span>
                          </>
                        )}
                        {selectedClient && (
                          <>
                            <HiChevronRight size={12} className="text-gray-300" />
                            <span className="text-[#0074CC]">{selectedClient}</span>
                          </>
                        )}
                      </div>

                      <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#0A1628] tracking-tight uppercase">
                            {selectedClient || selectedEmployee || selectedTech} <span className="text-gray-300 ml-1 font-bold">Repo</span>
                        </h2>
                        <div className="flex bg-white p-1 rounded-lg border border-[#E3E6E8] shadow-sm">
                            <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#0A1628] bg-gray-50 rounded-lg">Recent</button>
                            <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">Relevant</button>
                        </div>
                      </div>

                      {/* Question List - Professional */}
                      <div className="space-y-4">
                        {finalQuestions.length > 0 ? finalQuestions.map(q => (
                          <div key={q.id} className="bg-white rounded-lg border border-[#E3E6E8] p-6 shadow-sm hover:border-[#0074CC]/30 transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                              <Link to={`/portal/questions/${q.id}`} className="text-sm font-bold text-[#0A1628] group-hover:text-[#0074CC] transition-colors leading-tight uppercase tracking-tight flex-1 pr-8">
                                {q.title}
                              </Link>
                              <DifficultyBadge difficulty={q.difficulty} />
                            </div>

                            <p className="text-xs text-[#232629] leading-relaxed mb-6 line-clamp-2 font-medium uppercase tracking-tight opacity-70">
                              {q.content || "Expert technical nuance regarding foundational implementation."}
                            </p>

                            <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-5">
                              <div className="flex items-center gap-3">
                                  <TechBadge tech={q.technologyName} className="!rounded-lg !text-[8px]" />
                                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#0074CC] uppercase tracking-widest bg-[#0074CC]/5 px-3 py-1 rounded-lg border border-[#0074CC]/10">
                                    <HiBriefcase size={10} /> {q.clientName || "General Intake"}
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="text-[8px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">Source</div>
                                    <button 
                                      onClick={() => { setSelectedEmployee(q.submittedByName); setExplorerMode("EMPLOYEE"); }}
                                      className="text-[#0A1628] text-[10px] font-bold hover:text-[#0074CC] transition-colors uppercase tracking-tight"
                                    >
                                        {q.submittedByName}
                                    </button>
                                  </div>
                                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 font-bold border border-[#E3E6E8] text-[10px]">
                                    {q.submittedByName?.charAt(0)}
                                  </div>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="py-20 text-center bg-white border border-dashed border-[#E3E6E8] rounded-lg">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No matching intel detected.</span>
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
