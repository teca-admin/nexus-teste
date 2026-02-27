import React, { useState, useEffect } from "react";
import { Users, AlertCircle, Clock, GraduationCap, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [selectedList, setSelectedList] = useState<{ type: string, title: string, data: any[] } | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard").then(res => res.json()).then(setStats);
  }, []);

  const handleCardClick = async (type: string, title: string) => {
    setIsLoadingList(true);
    try {
      let endpoint = "";
      if (type === "totalFuncionarios") endpoint = "/api/funcionarios";
      else if (type === "asosVencidos") endpoint = "/api/funcionarios"; // We'll filter on client for now or add specific endpoints
      else if (type === "semEscala") endpoint = "/api/funcionarios";
      else if (type === "treinamentosPendentes") endpoint = "/api/funcionarios";

      const res = await fetch(endpoint);
      let data = await res.json();

      // Simple client-side filtering for the demo/prototype
      if (type === "asosVencidos") {
        const sstRes = await fetch("/api/treinamentos/resultados"); // Just as example, real logic would need better endpoints
        // For now let's just show all and label them if we don't have specific list endpoints
      }

      setSelectedList({ type, title, data });
    } catch (error) {
      console.error("Erro ao carregar lista:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  if (!stats) return <div className="p-8 text-slate-400">Carregando indicadores...</div>;

  const cards = [
    { id: "totalFuncionarios", label: "Total Funcionários", value: stats.totalFuncionarios, icon: Users, color: "text-blue-600" },
    { id: "asosVencidos", label: "ASOs Vencidos", value: stats.asosVencidos, icon: AlertCircle, color: "text-nexus-primary" },
    { id: "semEscala", label: "Sem Escala Ativa", value: stats.semEscala, icon: Clock, color: "text-amber-600" },
    { id: "treinamentosPendentes", label: "Treinamentos Pendentes", value: stats.treinamentosPendentes, icon: GraduationCap, color: "text-indigo-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card flex items-center justify-between cursor-pointer hover:border-nexus-primary transition-all group"
            onClick={() => handleCardClick(card.id, card.label)}
          >
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-nexus-primary transition-colors">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
            <card.icon className={`w-8 h-8 opacity-20 ${card.color} group-hover:opacity-40 transition-opacity`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-bold text-nexus-sidebar uppercase border-b pb-3 mb-4">Atividades Recentes</h3>
          <div className="space-y-3">
            {stats.atividades && stats.atividades.length > 0 ? (
              stats.atividades.map((atv: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className={`w-2 h-2 rounded-full ${atv.tipo === 'treinamento' ? 'bg-green-500' : 'bg-nexus-primary'}`} />
                  <span className="text-slate-600">{atv.texto}</span>
                  <span className="ml-auto text-[10px] text-slate-400 font-bold uppercase">{atv.tempo}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic p-4 text-center">Nenhuma atividade recente registrada.</p>
            )}
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-bold text-nexus-sidebar uppercase border-b pb-3 mb-4">Alertas Críticos</h3>
          <div className="space-y-3">
            {stats.alertas && stats.alertas.length > 0 ? (
              stats.alertas.map((alerta: any, i: number) => (
                <div key={i} className={`flex items-center gap-3 text-sm p-3 rounded-md border ${
                  alerta.tipo === 'erro' ? 'bg-red-50 text-nexus-primary border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {alerta.tipo === 'erro' ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  <span className="font-medium">{alerta.texto}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 text-sm p-3 bg-green-50 text-green-700 rounded-md border border-green-100">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Tudo em dia! Nenhum alerta crítico no momento.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedList && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="bg-nexus-sidebar p-4 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold uppercase tracking-tight">{selectedList.title}</h3>
                <button onClick={() => setSelectedList(null)} className="hover:bg-white/10 p-1 rounded transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b sticky top-0">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Matrícula</th>
                      <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Nome</th>
                      <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Cargo / Setor</th>
                      <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedList.data.map((f: any) => (
                      <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{f.matricula}</td>
                        <td className="px-4 py-3 font-medium">{f.nome}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-bold text-slate-700">{f.cargo}</div>
                          <div className="text-[10px] text-slate-400 uppercase">{f.setor}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            f.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
