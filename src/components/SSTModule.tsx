import React, { useState, useEffect } from "react";
import { User, Funcionario } from "../types";

export const SSTModule = ({ user }: { user: User }) => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [formData, setFormData] = useState({ data_realizacao: "", data_vencimento: "", tipo: "Admissional" });

  useEffect(() => {
    fetch("/api/funcionarios").then(res => res.json()).then(setFuncionarios);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/sst/aso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, funcionario_id: selectedId }),
    });
    if (res.ok) {
      alert("ASO registrado com sucesso!");
      setSelectedId("");
    }
  };

  const canEdit = user.role === "Admin" || user.role === "SST";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-bold text-nexus-sidebar uppercase mb-6 border-b pb-3">Registro de ASO (Saúde Ocupacional)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Selecionar Funcionário</label>
            <select className="input-field" value={selectedId} onChange={e => setSelectedId(e.target.value)} required>
              <option value="">Selecione...</option>
              {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome} ({f.matricula})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Data Realização</label>
              <input type="date" className="input-field" value={formData.data_realizacao} onChange={e => setFormData({...formData, data_realizacao: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Data Vencimento</label>
              <input type="date" className="input-field" value={formData.data_vencimento} onChange={e => setFormData({...formData, data_vencimento: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Tipo de Exame</label>
            <select className="input-field" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} required>
              <option>Admissional</option>
              <option>Periódico</option>
              <option>Retorno ao Trabalho</option>
              <option>Mudança de Função</option>
              <option>Demissional</option>
            </select>
          </div>
          {canEdit && (
            <button type="submit" className="btn-primary w-full py-3 font-bold uppercase tracking-wider mt-4">
              Registrar ASO no Prontuário
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
