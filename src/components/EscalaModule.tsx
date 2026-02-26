import React, { useState, useEffect } from "react";
import { User, Funcionario } from "../types";

export const EscalaModule = ({ user }: { user: User }) => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [formData, setFormData] = useState({
    data: "", turno: "Diurno", horario_inicio: "08:00", horario_fim: "18:00", local: "", funcao: ""
  });

  useEffect(() => {
    fetch("/api/funcionarios").then(res => res.json()).then(setFuncionarios);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/escalas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, funcionario_id: selectedId }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Escala alocada com sucesso!");
      setSelectedId("");
    } else {
      alert(data.message);
    }
  };

  const canEdit = user.role === "Admin" || user.role === "Escala";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-bold text-nexus-sidebar uppercase mb-6 border-b pb-3">Alocação de Escala Operacional</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase text-slate-500">Funcionário</label>
            <select className="input-field" value={selectedId} onChange={e => setSelectedId(e.target.value)} required>
              <option value="">Selecione...</option>
              {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome} ({f.matricula})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Data</label>
            <input type="date" className="input-field" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Turno</label>
            <select className="input-field" value={formData.turno} onChange={e => setFormData({...formData, turno: e.target.value})} required>
              <option>Diurno</option>
              <option>Noturno</option>
              <option>12x36</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Horário Início</label>
            <input type="time" className="input-field" value={formData.horario_inicio} onChange={e => setFormData({...formData, horario_inicio: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Horário Fim</label>
            <input type="time" className="input-field" value={formData.horario_fim} onChange={e => setFormData({...formData, horario_fim: e.target.value})} required />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase text-slate-500">Local / Posto de Trabalho</label>
            <input className="input-field" value={formData.local} onChange={e => setFormData({...formData, local: e.target.value})} required />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase text-slate-500">Função na Escala</label>
            <input className="input-field" value={formData.funcao} onChange={e => setFormData({...formData, funcao: e.target.value})} required />
          </div>
          {canEdit && (
            <div className="md:col-span-2 mt-4">
              <button type="submit" className="btn-primary w-full py-3 font-bold uppercase tracking-wider">
                Confirmar Alocação
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
