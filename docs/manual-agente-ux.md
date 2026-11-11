# Manual de uso — Agente de UX/UI do Âmi

Guia pra você operar o agente `ux-frontend-b2c` sem precisar reconstruir nada. Guarde este arquivo — ele é a referência pra qualquer sessão futura.

## Como iniciar o agente

Abra o Claude Code na pasta `C:\Users\marir\dev\ami-app` (como você já faz hoje). O agente **não precisa ser "ligado"** — ele já está configurado no projeto (`.claude/agents/ux-frontend-b2c.md`). Você pode:
- Deixar o Claude decidir sozinho quando usá-lo (ele é acionado automaticamente quando o pedido é de UX/UI).
- Ou pedir explicitamente: **"usa o agente ux-frontend-b2c pra [tarefa]"**.

**Se o agente foi criado ou editado nesta mesma sessão**, pode ser necessário abrir uma sessão nova pra ele ser reconhecido (já aconteceu com a gente — ver "Como recuperar o trabalho" abaixo).

## Como pedir uma auditoria

Exemplo pronto:

> "Audita a tela de Agenda."

ou, pra tudo de novo:

> "Roda a auditoria completa do app de novo."

O agente vai usar a skill `ux-audit-b2c`: só lê e documenta, nunca edita código. O resultado é uma tabela com problema, evidência, criticidade (P0-P3), esforço e recomendação — e os itens novos entram em `docs/ai-context/ux-backlog.md`.

## Como solicitar uma melhoria (com diagnóstico e aprovação)

Exemplo pronto:

> "Melhora a tela de Checklist."

Um pedido assim (vago, de propósito) faz o agente **parar antes de mudar qualquer coisa**: ele diagnostica, lista propostas com impacto/esforço, e pergunta o que você aprova. Ele só vai direto pro código se você já tiver dito especificamente o que aprovou.

## Como solicitar uma implementação

Depois que você escolher o que aprovar, diga algo como:

> "Aprovado, implementa só os itens A e B."

O agente usa a skill `ux-implementation`: identifica os arquivos, explica a mudança antes de editar, modifica só o necessário, valida no preview, e te mostra antes/depois.

## Como revisar os resultados

- **O que mudou**: pergunte "o que você alterou?" — ou rode `git diff` / `git log --oneline` num terminal na pasta do projeto.
- **Testes executados**: o agente te diz no fim de cada implementação o que testou e o que não testou (ex: "testei só na web, não no celular").
- **Comparação visual**: o agente te mostra screenshot de antes/depois quando possível.
- **Branch**: todo esse trabalho acontece na branch `ux-review` — sua branch `ami` nunca é tocada sem você pedir explicitamente pra fazer o merge.

## Como adicionar novas informações (personas, marca, decisões)

A base de conhecimento fica em `docs/ai-context/`. Pra atualizar, é só pedir:

> "Atualiza o `personas.md` com isso: [sua informação]."

ou, se você validar algo com usuárias reais:

> "Registra essa decisão no decision-log: [decisão + motivo]."

Nunca edite esses arquivos manualmente sem necessidade — peça pro agente fazer, assim ele mantém o formato (fato confirmado / hipótese / pendente) consistente.

## Como corrigir o agente

Se uma recomendação for ruim ou ele não seguir uma regra (ex: implementou sem perguntar), diga isso diretamente:

> "Isso não devia ter sido implementado sem minha aprovação — não faça isso de novo."

Peça pra registrar a correção como uma memória permanente dele, ou ajuste direto o arquivo `.claude/agents/ux-frontend-b2c.md` (a seção "Regras inegociáveis") se for algo que deveria valer sempre, não só uma vez.

## Como atualizar as skills

As skills ficam em `.claude/skills/<nome>/SKILL.md`. Pra mudar uma, peça:

> "Atualiza a skill ux-audit-b2c pra também considerar [novo critério]."

Depois de editada, teste numa tela pequena antes de confiar nela de novo (o "Teste de funcionamento" já vem escrito dentro de cada skill).

## Como recuperar o trabalho (desfazer uma mudança)

- **Uma mudança específica**: peça "desfaz a última mudança" — o agente usa `git diff`/`git checkout` no(s) arquivo(s), ou `git revert` se já foi commitado.
- **Voltar tudo ao estado antes deste projeto**: `git checkout ami` muda pra branch original, intocada, a qualquer momento.
- **Apagar todo o trabalho de UX**: `git branch -D ux-review` (só se tiver certeza — isso é destrutivo e irreversível).

## Como retomar o trabalho futuramente

Abra uma sessão nova do Claude Code na mesma pasta e diga, por exemplo:

> "Continua o trabalho de UX — o que ficou pendente no backlog?"

O agente vai ler `docs/ai-context/ux-backlog.md` e `decision-log.md` sozinho — você não precisa reexplicar o contexto do zero. Se, por algum motivo, o agente ou alguma skill não for reconhecido (mensagem tipo "Unknown skill" ou "Agent type not found"), normalmente é porque algo foi criado na sessão anterior e ainda não foi "recarregado" — abrir uma sessão nova de novo resolve.

## Onde está tudo, resumido

| O quê | Onde |
|---|---|
| Perfil do agente | `.claude/agents/ux-frontend-b2c.md` |
| Skills | `.claude/skills/*/SKILL.md` |
| Conhecimento do produto | `docs/ai-context/` (comece por `README.md`) |
| Backlog de UX priorizado | `docs/ai-context/ux-backlog.md` |
| Histórico de decisões | `docs/ai-context/decision-log.md` |
| Controle técnico de segurança | `.claude/hooks/check-protected-branch.js` + `.claude/settings.json` |
| Este manual | `docs/manual-agente-ux.md` |
