# Backlog de UX — Âmi

**Auditoria completa (Fase 8) concluída em 2026-11-10 — 9/9 telas cobertas.** Nenhum item abaixo foi implementado; tudo pendente de aprovação da Mari.

| # | Item | Onde | Criticidade | Esforço | Confiança | Status |
|---|---|---|---|---|---|---|
| 1 | Sono e Cuidados ficam bloqueadas sem filho cadastrado, sem link direto pra Perfis | `SleepScreen.tsx`, `CareScreen.tsx` | **P1** | Baixo | Alta | ✅ **Implementado em 2026-11-10 (Fase 9)** |
| 2 | Rótulos da barra de abas cortam em largura mobile (375px) | `RootNavigator.tsx` | P2 | Baixo | Alta | ✅ **Implementado em 2026-11-10** — rótulos abreviados (`Cuidad.`, `Check.`, `Descobr.`, `Histór.`) + fonte 10px; confirmado por medição de DOM (`scrollWidth === clientWidth` em todas as 9 abas) |
| 3 | Área de toque dos chips abaixo de ~44pt (componente compartilhado) | `ChipSelector.tsx:64` e mais 8 locais (`CaregiverSelector`, `ChildSelector`, `TagInput`, `DiscoverScreen`, `StoriesScreen`, `CareScreen` ×2, `ChecklistScreen`, `AssistantScreen`) | P2 | Baixo | Alta | ✅ **Implementado em 2026-11-10** — `minHeight: 44` em todos os chips/botões tocáveis equivalentes encontrados no app |
| 4 | Botões "remover item" (`×`) sem `accessibilityLabel` | `SleepScreen.tsx` (2 locais), `ChecklistScreen.tsx`, `TagInput.tsx` | P2 | Baixo | Alta | ✅ **Implementado em 2026-11-10** — `accessibilityLabel` descritivo + área de toque 44×44 em todos |
| 5 | Quase nenhum `accessibilityLabel` no app (só 2 ocorrências, em `AssistantScreen.tsx`) | `src/` inteiro | P2 | Médio | Média | Parcialmente coberto pelos itens #4/#10 (botões de remover); segue pendente um levantamento dedicado dos demais controles (inputs, seletores) |
| 6 | Navegação direta por URL na versão web sempre volta pra "Âmi" | Roteamento web (Expo Router/React Navigation) | P3 | Médio | Média | Pendente — só relevante se web virar canal real |
| 7 | Ausência de tokens de tipografia/espaçamento | Todas as telas (`StyleSheet` local) | — | — | — | Documentado em `design-system.md`, não quantificado como item de criticidade |
| 8 | Fonte real de dados do "Descobrir" ainda não decidida | `DiscoverScreen.tsx` | — | — | — | Decisão de produto da Mari, fora do escopo de UX |
| 9 | Console mostra 14× `"Unexpected text node: . A text node cannot be a child of a <View>"` já na tela inicial, antes de qualquer interação | Tab bar (`RootNavigator.tsx` via `@react-navigation/bottom-tabs`) | P3 | — | Média | Investigado em 2026-11-10: os ícones da tab bar aparecem duplicados no DOM (medição de layout interna da biblioteca) — hipótese é que o warning vem de dentro de `@react-navigation/bottom-tabs` na web, não do código do Âmi. Não corrigido (não é código nosso, console-only, não afeta usuária) |
| 10 | Exclusão de item (checklist, cuidador, perfil de filho) acontece com um único toque, sem confirmação nem undo — dado é local, perda é definitiva | `ChecklistScreen.tsx`, `CaregiversScreen.tsx`, `ChildrenProfileScreen.tsx` | P2 | Baixo | Alta | ✅ **Implementado em 2026-11-10** — `src/utils/confirm.ts` (helper cross-platform: `Alert.alert` nativo, `window.confirm` na web) nas 3 telas |
| 11 | Formulário de criação do Checklist fica sempre expandido (~430px fixos), mesmo com checklists já existentes — custo de rolagem cresce com o uso | `ChecklistScreen.tsx` | P2 | Médio | Média | ✅ **Implementado em 2026-11-10** — colapsa quando já existe checklist (exceto chegando com sugestão da Agenda/Import), botão "+ Novo checklist" pra reabrir, link "cancelar" pra fechar |
| 12 | Estado vazio do Checklist é texto cinza solto, sem tom de marca nem CTA reforçado | `ChecklistScreen.tsx` | P3 | Baixo | Média | ✅ **Implementado em 2026-11-10** — copy com a mascote, convite à ação |
| 13 | Sem indicador de progresso por checklist (ex: "1 de 2 itens feitos") | `ChecklistScreen.tsx` | P3 | Baixo-médio | Média | ✅ **Implementado em 2026-11-10** — "X de Y feitos" abaixo do tipo do checklist |

**Ponto positivo observado** (não é backlog, é reforço do que já funciona bem): a mensagem "Data incompleta ou inválida." é reaproveitada de forma consistente entre `AgendaScreen`, `CaregiversScreen` e `ChildrenProfileScreen`, via componente `DateFields` compartilhado — exatamente o padrão que `design-system-b2c` deve proteger.

## Como este arquivo vai crescer

A Fase 8 (auditoria completa, skill `ux-audit-b2c`) vai classificar cada item encontrado por criticidade (P0-P3), esforço e confiança, com evidência. Nada aqui vira implementação sem sua aprovação explícita.
