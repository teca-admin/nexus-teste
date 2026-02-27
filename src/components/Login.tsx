import React, { useState } from "react";
import { motion } from "motion/react";
import { User } from "../types";

export const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      onLogin(data.user);
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-nexus-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-nexus-sidebar tracking-tighter">NEXUS</h1>
          <p className="text-slate-500 text-sm uppercase tracking-widest mt-2">Enterprise Management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Usuário</label>
            <input 
              type="text" 
              className="input-field" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Senha</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          {error && <p className="text-nexus-primary text-xs font-medium">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3 font-bold uppercase tracking-wider mt-4">
            Entrar no Sistema
          </button>
        </form>
        <div className="mt-6 text-center text-[10px] text-slate-400 uppercase">
          Acesso restrito a colaboradores autorizados
        </div>
      </motion.div>
    </div>
  );
};
