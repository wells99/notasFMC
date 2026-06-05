import { existsSync } from "node:fs";

const FILE_PATH = "./alunos.json";
// A Render injeta automaticamente a variável PORT, caso contrário usa a 3000
const PORT = process.env.PORT || 3000;

interface Aluno {
  id: number;
  nome: string;
  trabalho: number;
  prova: number;
  media: number;
}

async function obterDadosAlunos(): Promise<Aluno[]> {
  if (!existsSync(FILE_PATH)) {
    await Bun.write(FILE_PATH, JSON.stringify([], null, 2));
    return [];
  }
  return await Bun.file(FILE_PATH).json();
}

async function salvarDados(alunos: Aluno[]) {
  await Bun.write(FILE_PATH, JSON.stringify(alunos, null, 2));
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // ================= ROTAS DE PÁGINAS ESTÁTICAS =================
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(Bun.file("./public/index.html"), { headers: { "Content-Type": "text/html" } });
    }
    if (url.pathname === "/gerenciar") {
      return new Response(Bun.file("./public/gerenciar.html"), { headers: { "Content-Type": "text/html" } });
    }

    // ================= ROTAS DA API (JSON) =================
    
    // Listar todos os alunos
    if (url.pathname === "/api/alunos" && req.method === "GET") {
      const alunos = await obterDadosAlunos();
      return Response.json(alunos);
    }

    // Cadastrar novo aluno
    if (url.pathname === "/api/alunos" && req.method === "POST") {
      const body = await req.json();
      const alunos = await obterDadosAlunos();
      const proximoId = alunos.length > 0 ? Math.max(...alunos.map(a => a.id)) + 1 : 1;

      const novoAluno: Aluno = {
        id: proximoId,
        nome: body.nome.trim(),
        trabalho: parseFloat(body.trabalho) || 0,
        prova: 0,
        media: 0
      };
      
      alunos.push(novoAluno);
      await salvarDados(alunos);
      return Response.json({ success: true });
    }

    // Modificar nota da prova de um aluno específico
    if (url.pathname === "/api/alunos/prova" && req.method === "POST") {
      const body = await req.json(); // espera { id, prova }
      const alunos = await obterDadosAlunos();
      const aluno = alunos.find(a => a.id === Number(body.id));
      
      if (aluno) {
        aluno.prova = parseFloat(body.prova) || 0;
        await salvarDados(alunos);
        return Response.json({ success: true });
      }
      return new Response("Aluno não encontrado", { status: 404 });
    }

    // Calcular as médias de todos os alunos
    if (url.pathname === "/api/alunos/calcular-medias" && req.method === "POST") {
      const alunos = await obterDadosAlunos();
      for (const aluno of alunos) {
        aluno.media = (aluno.trabalho + aluno.prova) / 2;
      }
      await salvarDados(alunos);
      return Response.json({ success: true });
    }

    return new Response("Rota não encontrada", { status: 404 });
  },
});

console.log(`🚀 Servidor Web ativo em: http://localhost:${PORT}`);