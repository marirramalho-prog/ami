---
name: ux-audit-b2c
description: Auditoria estruturada de UX/UI de uma tela, componente ou jornada do app Âmi. Use quando a Mari pedir "audita essa tela", "revisa o Perfis", "o que está ruim aqui", ou pedir a auditoria completa do app. Só lê e documenta — nunca modifica código.
allowed-tools: Read, Grep, Glob, mcp__Claude_Browser__preview_start, mcp__Claude_Browser__preview_stop, mcp__Claude_Browser__navigate, mcp__Claude_Browser__computer, mcp__Claude_Browser__read_page, mcp__Claude_Browser__get_page_text, mcp__Claude_Browser__resize_window, Edit(docs/ai-context/ux-backlog.md)
---

## Objetivo

Produzir uma avaliação objetiva de uma tela/jornada do Âmi, com evidência real (visual ou de código), nunca opinião solta.

## Antes de começar

Leia `docs/ai-context/README.md`, depois pelo menos `screen-inventory.md`, `ux-principles.md` e `design-system.md`. Se a auditoria for de uma jornada específica, leia também `user-journeys.md`.

## O que avaliar, por tela

Clareza da proposta de valor · hierarquia visual · navegação e encontrabilidade · carga cognitiva · consistência de componentes (comparar com `design-system.md`) · legibilidade · contraste e acessibilidade · facilidade de interação · feedback ao usuário · prevenção/recuperação de erros · organização de formulários · estados vazio/loading · uso em mobile (usar `resize_window` pra simular telas estreitas) · fricções na jornada · elementos de confiança · oportunidades de conversão/ativação.

## Procedimento

1. Abra o preview (`mcp__Claude_Browser__preview_start` com `name: "ami-app-web"`) e navegue até a tela/jornada alvo.
2. Capture evidência: screenshot, texto da página (`get_page_text`), ou trecho de código (arquivo + linha) quando o problema for estrutural.
3. Para cada problema encontrado, preencha uma linha da tabela de saída (formato abaixo).
4. Classifique criticidade SEM inventar dado quantitativo — é julgamento técnico, não medição:
   - **P0**: impede uma jornada essencial ou é barreira grave de uso.
   - **P1**: fricção importante, erro recorrente, risco de perda de conversão.
   - **P2**: melhoria significativa de usabilidade/clareza/consistência.
   - **P3**: refinamento visual, polimento.
5. Não proponha implementação — só recomendação. Implementação é a skill `ux-implementation`, só depois de aprovação da Mari.
6. Ao final, acrescente os itens novos em `docs/ai-context/ux-backlog.md` (não sobrescreva os existentes; se um item já lá for confirmado por esta auditoria, atualize o status em vez de duplicar).

## Formato de saída obrigatório

Tabela markdown com colunas: `Tela | Elemento | Problema | Evidência | Princípio de UX | Impacto | Criticidade | Esforço | Confiança | Recomendação`. `Esforço` é Baixo/Médio/Alto. `Confiança` é Alta/Média/Baixa (quão certo você está de que é um problema real, não suposição).

Feche com um resumo: quantos itens por criticidade, e quais são "quick wins" (baixo esforço, alto impacto) vs. mudanças estruturais.

## Restrições

- Nunca editar código de tela/componente durante uma auditoria.
- Nunca afirmar dado de usuário real (conversão, taxa de erro) — o app não tem usuárias reais ainda (`docs/ai-context/personas.md`).
- Se a tela depender do servidor local (`server/`) e ele não estiver rodando, declare isso explicitamente em vez de pular a funcionalidade em silêncio.

## Teste de funcionamento

Rode esta skill na tela `Descobrir` (simples, com dados fictícios, sem dependência de servidor) e confira que a saída tem: pelo menos 1 linha de tabela com evidência real, classificação de criticidade, e nenhuma alteração de arquivo de código.
