---
name: visual-qa-b2c
description: Valida a experiência visual e funcional do app Âmi depois de uma mudança — compara antes/depois, checa responsividade e regressões. Use depois de qualquer implementação de UX, antes de considerá-la concluída.
allowed-tools: Read, Bash(git diff:*), Bash(git log:*), mcp__Claude_Browser__preview_start, mcp__Claude_Browser__preview_stop, mcp__Claude_Browser__navigate, mcp__Claude_Browser__computer, mcp__Claude_Browser__read_page, mcp__Claude_Browser__read_console_messages, mcp__Claude_Browser__resize_window
---

## Objetivo

Confirmar, com evidência, se uma mudança já implementada funciona e não quebrou nada — nunca presumir que "deve ter funcionado".

## Procedimento

1. Rode `git diff` (ou `git log -1 -p` se já commitado) pra saber exatamente o que mudou.
2. Abra o preview (`ami-app-web`) e navegue até a(s) tela(s) tocada(s).
3. Avalie, no que for aplicável à mudança:
   - Layout em telas estreitas (`resize_window` com preset `mobile` e depois `desktop` de novo ao final — nunca deixe emulação mobile travada).
   - Consistência com `docs/ai-context/design-system.md`.
   - Quebras de alinhamento, textos cortados, elementos sobrepostos.
   - Estados do componente mudado (vazio, preenchido, erro, se existirem).
   - Contraste visual (comparação qualitativa com a paleta oficial).
   - Tamanho de área de toque em botões/inputs novos ou alterados.
   - Navegação: a tela ainda abre, a aba ainda funciona.
   - Console do navegador sem erro novo (`read_console_messages`).
   - Regressão: alguma tela vizinha que compartilha o componente mudado também precisa ser checada.
4. Compare screenshot "antes" (se existir, da skill `ux-implementation`) com "depois".
5. Declare **expressamente** o que não foi testado — ex: comportamento nativo iOS/Android (só dá pra testar via Expo Go real, não no preview web), notificação push (não funciona no navegador).

## Formato de saída obrigatório

- Lista do que foi checado, com resultado (OK / regressão encontrada / não aplicável).
- Screenshots antes/depois lado a lado quando possível.
- Lista separada e explícita: "Não testado nesta validação: [...]".

## Restrições

- Nunca declarar "testado" algo que não rodou de fato no preview.
- Se encontrar uma regressão, pare e reporte — não tente corrigir sozinho dentro desta skill (isso volta pra `ux-implementation`, com nova aprovação se for mudança de escopo).

## Teste de funcionamento

Rode esta skill logo após qualquer uso da `ux-implementation` e confirme que a saída tem pelo menos um screenshot "depois" e a lista de "não testado" preenchida (mesmo que curta).
