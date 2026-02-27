import express from "express";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.API_URL || "https://mkxnzujtzmqhopvodein.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1reG56dWp0em1xaG9wdm9kZWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDU1NjYsImV4cCI6MjA4NzY4MTU2Nn0.ZyFZLSa_ymkJRX7eikjugJi7xA77BC5Iy3NHyGVOZoI";
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- API ROUTES ---

// AUTH API
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(`Tentativa de login para o usuário: ${username}`);
  
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.error("Erro: Credenciais do Supabase não configuradas!");
      return res.status(500).json({ success: false, message: "Erro de configuração no servidor (Supabase URL/Key faltando)" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error) {
      console.error("Erro no Supabase ao buscar usuário:", error.message);
      return res.status(401).json({ 
        success: false, 
        message: error.code === "PGRST116" ? "Usuário ou senha incorretos" : `Erro no banco de dados: ${error.message}` 
      });
    }

    if (user) {
      console.log("Login bem-sucedido para:", username);
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Credenciais inválidas" });
    }
  } catch (err: any) {
    console.error("Erro crítico no servidor durante o login:", err);
    res.status(500).json({ success: false, message: "Erro interno no servidor" });
  }
});

// RH API
app.get("/api/funcionarios", async (req, res) => {
  const { data: list, error } = await supabase.from("funcionarios").select("*");
  res.json(list || []);
});

app.get("/api/funcionarios/matricula/:matricula", async (req, res) => {
  const { data: funcionario, error } = await supabase
    .from("funcionarios")
    .select("*")
    .eq("matricula", req.params.matricula)
    .single();

  if (error) {
    console.error("Supabase Matricula Error:", error);
    return res.status(404).json({ success: false, message: "Matrícula não encontrada ou erro no banco" });
  }

  if (funcionario) {
    res.json({ success: true, funcionario });
  } else {
    res.status(404).json({ success: false, message: "Matrícula não encontrada" });
  }
});

app.post("/api/funcionarios", async (req, res) => {
  const { nome, cpf, matricula, data_admissao, cargo, setor, email, telefone, endereco } = req.body;
  try {
    const { data: func, error: fErr } = await supabase
      .from("funcionarios")
      .insert([{ nome, cpf, matricula, data_admissao, cargo, setor }])
      .select()
      .single();

    if (fErr) throw fErr;

    const { error: rErr } = await supabase
      .from("rh_dados")
      .insert([{ funcionario_id: func.id, email, telefone, endereco }]);

    if (rErr) throw rErr;

    res.json({ success: true, id: func.id });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.get("/api/funcionarios/:id", async (req, res) => {
  const id = req.params.id;
  const { data: funcionario } = await supabase.from("funcionarios").select("*").eq("id", id).single();
  const { data: rh } = await supabase.from("rh_dados").select("*").eq("funcionario_id", id).single();
  const { data: sst } = await supabase.from("sst_asos").select("*").eq("funcionario_id", id).order("data_vencimento", { ascending: false });
  const { data: escala } = await supabase.from("escalas").select("*").eq("funcionario_id", id).order("data", { ascending: false }).limit(5);
  
  const { data: treinamentos } = await supabase
    .from("resultados_treinamento")
    .select(`
      nota, 
      status, 
      data_conclusao,
      cursos ( nome )
    `)
    .eq("funcionario_id", id);

  const formattedTreinamentos = treinamentos?.map((t: any) => ({
    nome: t.cursos.nome,
    nota: t.nota,
    status: t.status,
    data_conclusao: t.data_conclusao
  })) || [];

  res.json({ funcionario, rh, sst, escala, treinamentos: formattedTreinamentos });
});

// SST API
app.post("/api/sst/aso", async (req, res) => {
  const { funcionario_id, data_realizacao, data_vencimento, tipo } = req.body;
  const today = new Date().toISOString().split('T')[0];
  let status = "Válido";
  if (data_vencimento < today) status = "Vencido";
  else {
    const diff = Math.ceil((new Date(data_vencimento).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 30) status = "Vencendo";
  }

  const { error } = await supabase
    .from("sst_asos")
    .insert([{ funcionario_id, data_realizacao, data_vencimento, tipo, status }]);

  res.json({ success: !error });
});

// ESCALA API
app.post("/api/escalas", async (req, res) => {
  const { funcionario_id, data, turno, horario_inicio, horario_fim, local, funcao } = req.body;
  
  // Check conflict
  const { data: conflict } = await supabase
    .from("escalas")
    .select("*")
    .eq("funcionario_id", funcionario_id)
    .eq("data", data)
    .single();

  if (conflict) {
    return res.status(400).json({ success: false, message: "Funcionário já possui escala para este dia." });
  }

  const { error } = await supabase
    .from("escalas")
    .insert([{ funcionario_id, data, turno, horario_inicio, horario_fim, local, funcao }]);
  
  if (!error) {
    await supabase.from("funcionarios").update({ status: "Alocado" }).eq("id", funcionario_id);
  }
  
  res.json({ success: !error });
});

// TREINAMENTO API
app.get("/api/cursos", async (req, res) => {
  const { data: list } = await supabase.from("cursos").select("*");
  res.json(list || []);
});

app.post("/api/cursos", async (req, res) => {
  const { nome, descricao, data_inicio, data_fim, capa_url } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from("cursos")
    .insert([{ nome, descricao: descricao || "", data_inicio, data_fim, obrigatorio: true, capa_url: capa_url || null, data_criacao: today }])
    .select()
    .single();

  res.json({ success: !error, id: data?.id });
});

app.put("/api/cursos/:id", async (req, res) => {
  const { nome, data_inicio, data_fim, capa_url } = req.body;
  const { error } = await supabase
    .from("cursos")
    .update({ nome, data_inicio, data_fim, capa_url })
    .eq("id", req.params.id);
  res.json({ success: !error });
});

app.get("/api/cursos/:id/conteudo", async (req, res) => {
  const { data: conteudos } = await supabase
    .from("cursos_conteudos")
    .select("*")
    .eq("curso_id", req.params.id)
    .order("ordem");

  const { data: avaliacao } = await supabase
    .from("avaliacoes")
    .select("*")
    .eq("curso_id", req.params.id)
    .single();

  let formattedQuestoes = [];
  if (avaliacao) {
    const { data: questoes } = await supabase
      .from("questoes")
      .select("*")
      .eq("avaliacao_id", avaliacao.id);

    if (questoes) {
      for (const q of questoes) {
        const { data: opcoes } = await supabase
          .from("opcoes")
          .select("*")
          .eq("questao_id", q.id);
        q.opcoes = opcoes || [];
      }
      formattedQuestoes = questoes;
    }
  }
  res.json({ conteudos: conteudos || [], avaliacao, questoes: formattedQuestoes });
});

app.post("/api/cursos/conteudo", async (req, res) => {
  const { curso_id, titulo, url_video, ordem } = req.body;
  const { error } = await supabase
    .from("cursos_conteudos")
    .insert([{ curso_id, titulo, url_video, ordem }]);
  res.json({ success: !error });
});

app.delete("/api/cursos/conteudo/:id", async (req, res) => {
  const { error } = await supabase.from("cursos_conteudos").delete().eq("id", req.params.id);
  res.json({ success: !error });
});

app.post("/api/cursos/avaliacao", async (req, res) => {
  const { curso_id, nota_minima, tentativas_maximas, questoes } = req.body;
  
  try {
    // Delete existing if any
    const { data: existing } = await supabase.from("avaliacoes").select("id").eq("curso_id", curso_id).single();
    if (existing) {
      await supabase.from("avaliacoes").delete().eq("id", existing.id);
    }

    const { data: aval, error: aErr } = await supabase
      .from("avaliacoes")
      .insert([{ curso_id, nota_minima, tentativas_maximas }])
      .select()
      .single();

    if (aErr) throw aErr;

    for (const q of questoes) {
      const { data: quest, error: qErr } = await supabase
        .from("questoes")
        .insert([{ avaliacao_id: aval.id, enunciado: q.enunciado }])
        .select()
        .single();

      if (qErr) throw qErr;

      const opcoesToInsert = q.opcoes.map((opt: any) => ({
        questao_id: quest.id,
        texto: opt.texto,
        correta: opt.correta ? true : false
      }));

      const { error: oErr } = await supabase.from("opcoes").insert(opcoesToInsert);
      if (oErr) throw oErr;
    }

    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.post("/api/treinamentos/responder", async (req, res) => {
  const { funcionario_id, curso_id, nota } = req.body;
  
  // Check if already approved or reached limit
  const { data: results } = await supabase
    .from("resultados_treinamento")
    .select("status")
    .eq("funcionario_id", funcionario_id)
    .eq("curso_id", curso_id);

  const isApproved = results?.some((r: any) => r.status === "Aprovado");
  const reprovadoCount = results?.filter((r: any) => r.status === "Reprovado").length || 0;
  
  if (isApproved) {
    return res.status(400).json({ success: false, message: "Você já foi aprovado neste curso." });
  }
  if (reprovadoCount >= 3) {
    return res.status(400).json({ success: false, message: "Limite de tentativas excedido (3)." });
  }

  const { data: avaliacao } = await supabase.from("avaliacoes").select("*").eq("curso_id", curso_id).single();
  const status = nota >= (avaliacao?.nota_minima || 0) ? "Aprovado" : "Reprovado";
  const today = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from("resultados_treinamento")
    .insert([{ funcionario_id, curso_id, nota, status, data_conclusao: today }]);

  res.json({ success: !error, status });
});

app.get("/api/treinamentos/resultados", async (req, res) => {
  const { funcionario_id } = req.query;
  
  let query = supabase
    .from("resultados_treinamento")
    .select(`
      id,
      nota,
      status,
      data_conclusao,
      curso_id,
      funcionario_id,
      funcionarios ( nome, matricula ),
      cursos ( nome )
    `)
    .order("id", { ascending: false });

  if (funcionario_id) {
    query = query.eq("funcionario_id", funcionario_id);
  }

  const { data: results, error } = await query;

  if (error) return res.status(400).json({ success: false, message: error.message });

  // Calculate attempts manually since we can't easily do nested count in Supabase JS client without RPC
  const processedResults = results.map((r: any) => {
    const courseAttempts = results.filter((r2: any) => r2.funcionario_id === r.funcionario_id && r2.curso_id === r.curso_id && r2.id <= r.id);
    return {
      id: r.id,
      funcionario_nome: r.funcionarios.nome,
      matricula: r.funcionarios.matricula,
      curso_nome: r.cursos.nome,
      nota: r.nota,
      status: r.status,
      data_conclusao: r.data_conclusao,
      curso_id: r.curso_id,
      tentativa: courseAttempts.length
    };
  });

  res.json(processedResults);
});

// DASHBOARD API
app.get("/api/dashboard", async (req, res) => {
  const { count: totalFuncionarios } = await supabase.from("funcionarios").select("*", { count: 'exact', head: true });
  const { count: asosVencidos } = await supabase.from("sst_asos").select("*", { count: 'exact', head: true }).eq("status", "Vencido");
  
  // Complex queries like "semEscala" and "treinamentosPendentes" are harder in pure JS client
  // For a real app, these should be RPCs. For now, we'll do simple counts or mock them if too complex
  const { count: semEscala } = await supabase.from("funcionarios").select("*", { count: 'exact', head: true }); // Mocked for now
  const { count: treinamentosPendentes } = await supabase.from("resultados_treinamento").select("*", { count: 'exact', head: true }).eq("status", "Reprovado"); // Mocked for now

  res.json({ 
    totalFuncionarios: totalFuncionarios || 0, 
    asosVencidos: asosVencidos || 0, 
    semEscala: semEscala || 0, 
    treinamentosPendentes: treinamentosPendentes || 0 
  });
});

// SEARCH API
app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  const { data: results } = await supabase
    .from("funcionarios")
    .select("id, nome, matricula, cpf, cargo, setor")
    .or(`nome.ilike.%${q}%,matricula.ilike.%${q}%,cpf.ilike.%${q}%`);
  res.json(results || []);
});

// --- SERVER STARTUP ---

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

// Export app for Vercel
export default app;

// Only start server if not running as a serverless function
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}
