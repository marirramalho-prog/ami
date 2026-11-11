---
name: ux-implementation
description: Implementa no código uma melhoria de UX/UI já aprovada pela Mari (vinda de uma auditoria ou pedido direto). Use só quando já existe aprovação explícita do que fazer — nunca pra decidir sozinho o que mudar.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, mcp__Claude_Browser__preview_start, mcp__Claude_Browser__preview_stop, mcp__Claude_Browser__navigate, mcp__Claude_Browser__computer, mcp__Claude_Browser__read_page, mcp__Claude_Browser__read_console_messages
---

## Pré-condição

Esta skill só roda depois que a Mari aprovou especificamente o que será mudado. Se a tarefa que te chamou não deixar claro o que foi aprovado, pare e pergunte antes de tocar em qualquer arquivo.

## Procedimento obrigatório

1. **Identificar arquivos**: localizar a(s) tela(s)/componente(s) envolvidos (`docs/ai-context/screen-inventory.md`).
2. **Explicar a mudança**: antes de editar, diga em 1-3 frases o que vai mudar e por quê (referenciando o item aprovado).
3. **Identificar riscos**: outras telas que usam o mesmo componente, dados que dependem do formato atual, funcionalidades sensíveis (`docs/ai-context/product-brief.md` → seção de escopo; dados locais no AsyncStorage).
4. **Registrar estado anterior**: screenshot da tela antes de editar (via preview) e/ou `git diff` vazio como ponto de partida — isso é a base da comparação final.
5. **Modificar só o necessário**: não tocar em código não relacionado à mudança aprovada, mesmo que pareça "já que estou aqui".
6. **Reaproveitar componentes existentes** em vez de criar novos (checar `docs/ai-context/design-system.md` e `src/components/`).
7. **Checar antes de escrever código**: se a mudança envolve Expo/React Native, confira `https://docs.expo.dev/versions/v57.0.0/` em vez de usar sintaxe de versões antigas — o `AGENTS.md` avisa que isso já quebrou antes.
8. **Verificações técnicas disponíveis** (`docs/ai-context/quality-baseline.md`): abrir o preview web e navegar até a tela mudada; checar console/erros (`read_console_messages`); não inventar `npm test`/`npm run lint` — não existem no projeto hoje.
9. **Gerar evidência**: screenshot depois da mudança, no mesmo estado/fluxo do "antes".
10. **Apresentar o que mudou**: lista de arquivos tocados, resumo da mudança, comparação antes/depois.
11. **Atualizar documentação**: se a mudança afeta um padrão documentado em `design-system.md`, `screen-inventory.md` ou fecha um item do `ux-backlog.md`, atualize o arquivo correspondente.

## Restrições

- Nunca alterar funcionalidade não relacionada sem justificativa e nova aprovação.
- Nunca commitar ou mudar de branch sem a Mari saber — a implementação acontece na branch de trabalho combinada (hoje `ux-review`).
- Nunca introduzir dependência nova sem necessidade demonstrada.
- Se a mudança tocar em dado sensível (perfil de filho/cuidador) ou permissões (câmera, notificação), sinalize isso explicitamente no resumo final, mesmo que a mudança em si seja só visual.

## Critério de conclusão de uma implementação

Só está concluída quando você apresentar: o problema original, a mudança aprovada, os arquivos alterados, o que foi verificado (e o que não foi), evidência visual, riscos remanescentes, e como desfazer (`git diff`/`git checkout` do arquivo, ou reverter o commit).

## Teste de funcionamento

Peça uma mudança trivial e reversível (ex: ajustar o `padding` de um card numa tela) com aprovação simulada, e confira que a saída final cobre todos os itens do critério de conclusão acima.
