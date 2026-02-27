import React, { useState, useEffect } from "react";
import { LogOut, User, Calendar, ShieldCheck, AlertCircle, GraduationCap } from "lucide-react";
import { motion } from "motion/react";

export const View360 = ({ id, onClose }: { id: number, onClose: () => void }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/funcionarios/${id}`).then(res => res.json()).then(setData);
  }, [id]);

  if (!data) return null;

  const { funcionario, rh, sst, escala, treinamentos } = data;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-[60]">
      <motion.div 
        initial={{ x: "100%" }} 
        animate={{ x: 0 }} 
        className="bg-white w-full max-w-4xl h-full shadow-2xl overflow-y-auto"
      >
        <div className="bg-nexus-sidebar p-6 text-white flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold">
              {funcionario.nome.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{funcionario.nome}</h2>
              <p className="text-xs uppercase tracking-widest opacity-60">{funcionario.cargo} • {funcionario.setor}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 flex items-center gap-2">
                <User className="w-3 h-3" /> Informações do RH
              </h3>
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">CPF</p>
                  <p className="text-sm font-medium">{funcionario.cpf}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Função • Setor</p>
                  <p className="text-sm font-medium">{funcionario.cargo} • {funcionario.setor}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">RG</p>
                  <p className="text-sm font-medium">{funcionario.rg || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Data de Nascimento</p>
                  <p className="text-sm font-medium">{funcionario.data_nascimento ? new Date(funcionario.data_nascimento).toLocaleDateString('pt-BR') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Matrícula</p>
                  <p className="text-sm font-mono">{funcionario.matricula}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">E-mail</p>
                  <p className="text-sm font-medium">{rh?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Telefone</p>
                  <p className="text-sm font-medium">{rh?.telefone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Endereço</p>
                  <p className="text-sm font-medium">{rh?.endereco || 'N/A'}</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Escalas Recentes
              </h3>
              <div className="space-y-2">
                {escala.length > 0 ? escala.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-bold">{new Date(e.data).toLocaleDateString('pt-BR')}</p>
                      <p className="text-[10px] uppercase text-slate-500">{e.local} • {e.funcao}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-nexus-sidebar">{e.horario_inicio} - {e.horario_fim}</p>
                      <p className="text-[10px] uppercase text-slate-400">{e.turno}</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-400 italic">Nenhuma escala registrada.</p>}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Status SST (ASO)
              </h3>
              {sst.length > 0 ? (
                <div className={`p-6 rounded-xl border-2 ${
                  sst[0].status === 'Válido' ? 'border-green-100 bg-green-50' : 
                  sst[0].status === 'Vencendo' ? 'border-amber-100 bg-amber-50' : 'border-red-100 bg-red-50'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      sst[0].status === 'Válido' ? 'bg-green-600 text-white' : 
                      sst[0].status === 'Vencendo' ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {sst[0].status}
                    </span>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Vence em</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{new Date(sst[0].data_vencimento).toLocaleDateString('pt-BR')}</p>
                  <p className="text-[10px] uppercase text-slate-500 mt-1">Tipo: {sst[0].tipo}</p>
                </div>
              ) : (
                <div className="p-6 rounded-xl border-2 border-dashed border-slate-200 text-center">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-bold uppercase">Sem ASO registrado</p>
                </div>
              )}
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 flex items-center gap-2">
                <GraduationCap className="w-3 h-3" /> Treinamentos
              </h3>
              <div className="space-y-3">
                {treinamentos.map((t: any, i: number) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-bold text-slate-700">{t.nome}</p>
                      <span className={`text-[8px] font-bold uppercase px-1 rounded ${
                        t.status === 'Aprovado' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-slate-400">{new Date(t.data_conclusao).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs font-bold text-slate-800">Nota: {t.nota.toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
