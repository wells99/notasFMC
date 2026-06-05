import { existsSync } from "node:fs";

// Caminho do arquivo JSON na raiz do projeto
const FILE_PATH = "./alunos.json";

// Definição da estrutura do objeto Aluno
interface Aluno {
  id: number;
  nome: string;
  trabalho: number;
  prova: number;
  media: number;
}

// Função para buscar dados ou criar o arquivo vazio se não existir
async function obterDadosAlunos(): Promise<Aluno[]> {
  if (!existsSync(FILE_PATH)) {
    await Bun.write(FILE_PATH, JSON.stringify([], null, 2));
    return [];
  }
  const arquivo = Bun.file(FILE_PATH);
  return await arquivo.json();
}

// Função utilitária para centralizar a gravação no JSON
async function salvarDados(alunos: Aluno[]) {
  await Bun.write(FILE_PATH, JSON.stringify(alunos, null, 2));
}

// Função responsável por renderizar a tabela ou a mensagem de vazio
function exibirTabela(alunos: Aluno[]) {
  if (alunos.length === 0) {
    console.log("\n=========================================");
    console.log("⚠️  Sem alunos cadastrados.");
    console.log("=========================================");
    return;
  }

  console.log("\n=================== TABELA DE ALUNOS ===================");
  const dadosFormatados = alunos.map(aluno => ({
    ID: aluno.id,
    "Nome do Aluno": aluno.nome,
    "Nota do Trabalho": aluno.trabalho,
    "Nota da Prova": aluno.prova,
    "Média Final": aluno.media
  }));
  
  console.table(dadosFormatados);
  console.log("========================================================");
}

async function ejecutarFluxo() {
  const alunos = await obterDadosAlunos();

  while (true) {
    exibirTabela(alunos);

    console.log("\n--- MENU DE OPÇÕES ---");
    console.log("1. Cadastrar Novo Aluno");
    console.log("2. Modificar Notas de Prova");
    console.log("3. Calcular Médias (Percorrer Lista)");
    console.log("4. Sair do Programa");
    
    const opcao = prompt("Escolha uma opção (1-4): ");

    // ================= OPÇÃO 1: CADASTRAR ALUNO =================
    if (opcao === "1") {
      console.log("\n--- CADASTRO DE ALUNO ---");
      const nome = prompt("Nome do aluno: ");
      
      if (!nome || nome.trim() === "") {
        console.log("Nome inválido! Operação cancelada.");
        continue;
      }

      const notaTrabalhoStr = prompt(`Digite a nota do trabalho para ${nome}: `);
      const trabalho = parseFloat(notaTrabalhoStr || "0") || 0;

      const proximoId = alunos.length > 0 ? Math.max(...alunos.map(a => a.id)) + 1 : 1;

      alunos.push({
        id: proximoId,
        nome: nome.trim(),
        trabalho: trabalho,
        prova: 0,
        media: 0
      });

      await salvarDados(alunos);
      console.log(`\n✓ ${nome} cadastrado com sucesso!`);
    } 
    
    // ================= OPÇÃO 2: MODIFICAR NOTAS DE PROVA =================
    else if (opcao === "2") {
      if (alunos.length === 0) {
        console.log("\n❌ Não existem alunos cadastrados para modificar notas.");
        continue;
      }

      console.log("\n--- ATUALIZAÇÃO DE NOTAS DE PROVA ---");
      
      for (const aluno of alunos) {
        console.log(`\n-----------------------------------------`);
        console.log(`Aluno Atual: ${aluno.nome} (ID: ${aluno.id})`);
        console.log(`-----------------------------------------`);

        const respostaProva = prompt(`Adicionar/Alterar nota da prova para "${aluno.nome}"? (s/n): `);

        if (respostaProva?.toLowerCase() === "s") {
          const notaProvaStr = prompt(`Digite a nota da prova para ${aluno.nome}: `);
          aluno.prova = parseFloat(notaProvaStr || "0") || 0;
        } else {
          const parar = prompt("Deseja interromper a edição e voltar ao menu? (s/n): ");
          if (parar?.toLowerCase() === "s") {
            break; // Sai do laço "for" dos alunos e volta para o menu principal
          }
        }
      }

      await salvarDados(alunos);
      console.log("\n✓ Alterações de notas salvas com sucesso!");
    } 
    
    // ================= OPÇÃO 3: CALCULAR MÉDIAS (NOVA) =================
    else if (opcao === "3") {
      if (alunos.length === 0) {
        console.log("\n❌ Não existem alunos cadastrados para calcular médias.");
        continue;
      }

      console.log("\n--- CALCULANDO MÉDIAS ---");
      
      for (const aluno of alunos) {
        // Calcula a média aritmética simples
        aluno.media = (aluno.trabalho + aluno.prova) / 2;
        console.log(`-> Média de "${aluno.nome}" atualizada para: ${aluno.media}`);
        
        // Salva no JSON o aluno atual antes de ir para o próximo
        await salvarDados(alunos);
      }

      console.log("\n✓ Todas as médias foram calculadas e sincronizadas com o JSON!");
    }
    
    // ================= OPÇÃO 4: SAIR =================
    else if (opcao === "4") {
      console.log("\nSaindo... Programa encerrado.");
      break;
    } 
    
    else {
      console.log("\nOpção inválida! Digite um número de 1 a 4.");
    }
  }
}

// Inicia a aplicação
ejecutarFluxo();