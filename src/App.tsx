import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  GraduationCap, 
  Search, 
  LogOut, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Components
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { RHModule } from "./components/RHModule";
import { SSTModule } from "./components/SSTModule";
import { EscalaModule } from "./components/EscalaModule";
import { TreinamentoModule } from "./components/TreinamentoModule";
import { EmployeePortal } from "./components/EmployeePortal";
import { View360 } from "./components/View360";

// Types
import { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [isPortal, setIsPortal] = useState(window.location.search.includes("portal=true"));

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetch(`/api/search?q=${searchQuery}`).then(res => res.json()).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "RH", "SST", "Escala", "Treinamento", "Gestor"] },
    { id: "rh", label: "Funcionários", icon: Users, roles: ["Admin", "RH"] },
    { id: "escala", label: "Escala", icon: Calendar, roles: ["Admin", "Escala"] },
    { id: "sst", label: "SST / ASO", icon: ShieldCheck, roles: ["Admin", "SST"] },
    { id: "treinamento", label: "Treinamentos", icon: GraduationCap, roles: ["Admin", "Treinamento"] },
  ];

  // Ensure active module is allowed, otherwise fallback to dashboard
  useEffect(() => {
    if (!user) return;
    const isAllowed = menuItems.find(m => m.id === activeModule)?.roles.includes(user.role);
    if (!isAllowed) {
      setActiveModule("dashboard");
    }
  }, [user?.role, activeModule]);

  if (isPortal) return <EmployeePortal onExit={() => {
    setIsPortal(false);
    window.history.pushState({}, '', window.location.pathname);
  }} />;
  if (!user) return <Login onLogin={setUser} />;

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white text-slate-800 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-nexus-primary rounded flex items-center justify-center font-black text-xl text-white">N</div>
            <h1 className="text-xl font-bold tracking-tighter text-nexus-sidebar">NEXUS</h1>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {filteredMenu.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                  activeModule === item.id ? 'bg-slate-100 text-nexus-sidebar' : 'text-slate-500 hover:text-nexus-sidebar hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="flex items-center bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200 focus-within:bg-white focus-within:border-nexus-primary/30 focus-within:ring-0 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="BUSCA GLOBAL..." 
                className="bg-transparent border-none focus:ring-0 text-xs font-bold uppercase tracking-widest ml-2 w-48 text-slate-800 placeholder:text-slate-400 outline-none"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
                <div className="p-2 border-b bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resultados da Busca</div>
                {searchResults.map(res => (
                  <button 
                    key={res.id} 
                    onClick={() => { setSelectedEmployeeId(res.id); setSearchQuery(""); }}
                    className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-sm font-bold">{res.nome}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{res.cargo} • {res.matricula}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-nexus-primary transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{user.role}</p>
            </div>
            <button onClick={() => setUser(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-nexus-primary transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-nexus-bg overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeModule === "dashboard" && <Dashboard />}
            {activeModule === "rh" && <RHModule user={user} onViewDetails={setSelectedEmployeeId} />}
            {activeModule === "sst" && <SSTModule user={user} />}
            {activeModule === "escala" && <EscalaModule user={user} />}
            {activeModule === "treinamento" && <TreinamentoModule user={user} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer / Quick Actions */}
      <footer className="h-10 bg-white border-t flex items-center justify-between px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div>NEXUS v1.0.0 • Enterprise Resource Planning</div>
        <div className="flex gap-4">
          <button onClick={() => setIsPortal(true)} className="hover:text-nexus-primary transition-colors">Acessar Portal do Colaborador</button>
          <span>Suporte: 0800-NEXUS</span>
        </div>
      </footer>

      {/* View 360 Overlay */}
      {selectedEmployeeId && (
        <View360 id={selectedEmployeeId} onClose={() => setSelectedEmployeeId(null)} />
      )}
    </div>
  );
}
