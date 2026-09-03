import { Child, childFullName } from '../types/child';
import { ChecklistTemplate } from '../types/routine';
import { loadChecklists, saveChecklists } from '../storage/routineStorage';

const ITENS_PADRAO_ESCOLA = ['Uniforme separado', 'Lancheira pronta', 'Material escolar', 'Tarefa de casa conferida'];
const ITENS_PADRAO_ATIVIDADE = ['Roupa/kit separado', 'Garrafinha de água', 'Levar a tempo do horário'];

function novoId(sufixo: string): string {
  return `${Date.now()}-${sufixo}-${Math.random().toString(36).slice(2, 7)}`;
}

function criarItens(textos: string[]): ChecklistTemplate['itens'] {
  return textos.map((texto) => ({ id: novoId('item'), texto, feito: false }));
}

// Garante que exista (e esteja com o nome certo) um checklist automático
// pra escola e pra cada atividade extracurricular de cada filho — sem
// mexer nos itens de um checklist que já existe (a mãe pode ter editado).
// Remove os que não têm mais escola/atividade correspondente.
export async function syncChecklistsForAllChildren(children: Child[]): Promise<void> {
  const templates = await loadChecklists();
  const manuais = templates.filter((t) => !t.origemAuto);
  const automaticos = templates.filter((t) => t.origemAuto);

  const proximos: ChecklistTemplate[] = [];

  children.forEach((child) => {
    if (!child.naoVaiEscola && child.escola) {
      const nome = `Escola — ${childFullName(child)}`;
      const existente = automaticos.find(
        (t) => t.origemAuto?.childId === child.id && !t.origemAuto?.atividadeId,
      );
      proximos.push(
        existente
          ? { ...existente, nome }
          : {
              id: novoId('escola'),
              nome,
              tipo: 'Rotina escolar',
              itens: criarItens(ITENS_PADRAO_ESCOLA),
              origemAuto: { childId: child.id },
            },
      );
    }

    child.atividades.forEach((atividade) => {
      const nome = `${atividade.nome} — ${childFullName(child)}`;
      const existente = automaticos.find(
        (t) => t.origemAuto?.childId === child.id && t.origemAuto?.atividadeId === atividade.id,
      );
      proximos.push(
        existente
          ? { ...existente, nome }
          : {
              id: novoId('atividade'),
              nome,
              tipo: 'Atividade extracurricular',
              itens: criarItens(ITENS_PADRAO_ATIVIDADE),
              origemAuto: { childId: child.id, atividadeId: atividade.id },
            },
      );
    });
  });

  await saveChecklists([...manuais, ...proximos]);
}

export async function removeChecklistsForChild(childId: string): Promise<void> {
  const templates = await loadChecklists();
  const updated = templates.filter((t) => t.origemAuto?.childId !== childId);
  await saveChecklists(updated);
}
