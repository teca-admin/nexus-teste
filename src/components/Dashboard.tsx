import React, { useState, useEffect } from "react";
import { Users, AlertCircle, Clock, GraduationCap } from "lucide-react";
import { motion } from "motion/react";

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard").then(res => res.json()).then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-slate-400">Carregando indicadores...</div>;

  const cards = [
    { label: "Total Funcionários", value: stats.totalFuncionarios, icon: Users, color: "text-blue-600" },
    { label: "ASOs Vencidos", value: stats.asosVencidos, icon: AlertCircle, color: "text-nexus-primary" },
    { label: "Sem Escala Ativa", value: stats.semEscala, icon: Clock, color: "text-amber-600" },
    { label: "Treinamentos Pendentes", value: stats.treinamentosPendentes, icon: GraduationCap, color: "text-indigo-600" },
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
            className="card flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
            <card.icon className={`w-8 h-8 opacity-20 ${card.color}`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-bold text-nexus-sidebar uppercase border-b pb-3 mb-4">Atividades Recentes</h3>
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 text-sm p-2 hover:bg-slate-50 rounded transition-colors">
                <div className="w-2 h-2 rounded-full bg-nexus-primary" />
                <span className="text-slate-600">Novo funcionário cadastrado no setor de Operações</span>
                <span className="ml-auto text-[10px] text-slate-400">Há 2 horas</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-bold text-nexus-sidebar uppercase border-b pb-3 mb-4">Alertas Críticos</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm p-3 bg-red-50 text-nexus-primary rounded-md border border-red-100">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">5 ASOs vencem nos próximos 7 dias</span>
            </div>
            <div className="flex items-center gap-3 text-sm p-3 bg-amber-50 text-amber-700 rounded-md border border-amber-100">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Escala de amanhã possui 2 postos vagos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
