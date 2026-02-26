import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { User, Funcionario } from "../types";

export const RHModule = ({ user }: { user: User }) => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: "", cpf: "", matricula: "", data_admissao: "", cargo: "", setor: "",
    email: "", telefone: "", endereco: ""
  });

  const load = () => fetch("/api/funcionarios").then(res => res.json()).then(setFuncionarios);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/funcionarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowForm(false);
      load();
      setFormData({ nome: "", cpf: "", matricula: "", data_admissao: "", cargo: "", setor: "", email: "", telefone: "", endereco: "" });
    }
  };

  const canEdit = user.role === "Admin" || user.role === "RH";

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-nexus-sidebar uppercase tracking-tight">Gestão de Funcionários</h2>
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Funcionário
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold mb-4 uppercase text-nexus-sidebar">Cadastrar Novo Funcionário</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase text-slate-500">Nome Completo</label>
                <input className="input-field" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">CPF</label>
                <input className="input-field" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Matrícula</label>
                <input className="input-field" value={formData.matricula} onChange={e => setFormData({...formData, matricula: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Data Admissão</label>
                <input type="date" className="input-field" value={formData.data_admissao} onChange={e => setFormData({...formData, data_admissao: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Cargo</label>
                <input className="input-field" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Setor</label>
                <input className="input-field" value={formData.setor} onChange={e => setFormData({...formData, setor: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">E-mail</label>
                <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 font-bold uppercase text-sm">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Registro</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Matrícula</th>
              <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Nome</th>
              <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Cargo / Setor</th>
              <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {funcionarios.map(f => (
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
                <td className="px-4 py-3 text-right">
                  <button className="text-nexus-primary hover:underline font-bold text-xs uppercase">Detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
