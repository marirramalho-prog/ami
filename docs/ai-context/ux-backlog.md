# Backlog de UX — Âmi

**Auditoria completa (Fase 8) concluída em 2026-11-10 — 9/9 telas cobertas.** Nenhum item abaixo foi implementado; tudo pendente de aprovação da Mari.

| # | Item | Onde | Criticidade | Esforço | Confiança | Status |
|---|---|---|---|---|---|---|
| 1 | Sono e Cuidados ficam bloqueadas sem filho cadastrado, sem link direto pra Perfis | `SleepScreen.tsx`, `CareScreen.tsx` | **P1** | Baixo | Alta | **Implementado em 2026-11-10 (Fase 9)** |
| 2 | Rótulos da barra de abas cortam em largura mobile (375px) | `RootNavigator.tsx` | P2 | Baixo | Alta | Pendente de aprovação |
| 3 | Área de toque dos chips abaixo de ~44pt (componente compartilhado) | `ChipSelector.tsx:64` | P2 | Baixo | Alta | Pendente de aprovação |
| 4 | Botões "remover item" (`×`) sem `accessibilityLabel` | `SleepScreen.tsx:497`, `ChecklistScreen.tsx:183`, `TagInput.tsx:50` | P2 | Baixo | Alta | Pendente de aprovação |
| 5 | Quase nenhum `accessibilityLabel` no app (só 2 ocorrências, em `AssistantScreen.tsx`) | `src/` inteiro | P2 | Médio | Média | Pendente de aprovação — recomenda levantamento dedicado |
| 6 | Navegação direta por URL na versão web sempre volta pra "Âmi" | Roteamento web (Expo Router/React Navigation) | P3 | Médio | Média | Pendente — só relevante se web virar canal real |
| 7 | Ausência de tokens de tipografia/espaçamento | Todas as telas (`StyleSheet` local) | — | — | — | Documentado em `design-system.md`, não quantificado como item de criticidade |
| 8 | Fonte real de dados do "Descobrir" ainda não decidida | `DiscoverScreen.tsx` | — | — | — | Decisão de produto da Mari, fora do escopo de UX |
| 9 | Console mostra 14× `"Unexpected text node: . A text node cannot be a child of a <View>"` já na tela inicial, antes de qualquer interação | Não localizado ainda — reproduzido em 2026-11-10 durante validação da Fase 9, pré-existente (confirmado via `git stash`, independente da mudança feita) | — | — | — | Observado, não investigado — não quebra a renderização visível, mas pode indicar JSX com espaço/texto solto fora de um `<Text>` |
| 10 | Exclusão de item (checklist, cuidador, perfil de filho) acontece com um único toque, sem confirmação nem undo — dado é local, perda é definitiva | `ChecklistScreen.tsx`, `CaregiversScreen.tsx:154`, `ChildrenProfileScreen.tsx:162` | P2 | Baixo | Alta | Achado em 2026-11-10 (teste de autonomia do agente, tela Checklist) — pendente de aprovação |
| 11 | Formulário de criação do Checklist fica sempre expandido (~430px fixos), mesmo com checklists já existentes — custo de rolagem cresce com o uso | `ChecklistScreen.tsx` | P2 | Médio (recolher por padrão interage com `nomeSugerido`/`tipoSugerido` vindos de Agenda/Import) | Média | Achado em 2026-11-10 — pendente de aprovação |
| 12 | Estado vazio do Checklist é texto cinza solto, sem tom de marca nem CTA reforçado | `ChecklistScreen.tsx` | P3 (oportunidade de produto, não defeito objetivo) | Baixo | Média | Achado em 2026-11-10 — pendente de aprovação |
| 13 | Sem indicador de progresso por checklist (ex: "1 de 2 itens feitos") | `ChecklistScreen.tsx` | P3 (oportunidade de produto, não defeito objetivo) | Baixo-médio | Média | Achado em 2026-11-10 — pendente de aprovação |

**Ponto positivo observado** (não é backlog, é reforço do que já funciona bem): a mensagem "Data incompleta ou inválida." é reaproveitada de forma consistente entre `AgendaScreen`, `CaregiversScreen` e `ChildrenProfileScreen`, via componente `DateFields` compartilhado — exatamente o padrão que `design-system-b2c` deve proteger.

## Como este arquivo vai crescer

A Fase 8 (auditoria completa, skill `ux-audit-b2c`) vai classificar cada item encontrado por criticidade (P0-P3), esforço e confiança, com evidência. Nada aqui vira implementação sem sua aprovação explícita.
