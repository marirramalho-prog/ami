---
name: ux-microcopy
description: Revisa e melhora textos de interface do app Âmi (títulos, botões, mensagens de erro, placeholders, onboarding) pra ficarem claros, curtos e na voz da marca. Use quando a Mari pedir pra revisar copy de uma tela, ou apontar um texto confuso/genérico.
allowed-tools: Read, Grep, Glob, Edit
---

## Antes de começar

Leia `docs/ai-context/ux-principles.md` (tom: "sem julgamento", "resolve, não só sugere", "companhia, não logística fria") e, se a tela tocar em saúde, `docs/ai-context/product-brief.md` (escopo médico excluído de propósito).

## O que revisar

Títulos de tela · botões e CTAs · textos de apoio · placeholders · mensagens de erro/validação · confirmações · onboarding · orientações contextuais (ex: avisos de confiança baixa na importação de evento).

## Procedimento

1. Localizar os textos relevantes no código (strings literais em JSX/`Text`, não em comentário).
2. Para cada texto problemático, propor uma alternativa, com justificativa curta ligada a um princípio de `ux-principles.md` ou a um defeito objetivo (ex: jargão técnico, tom de repreensão, ambiguidade).
3. Nunca usar linguagem técnica desnecessária ou tom de culpa/erro do usuário — mesmo em mensagens de validação (ex: evitar "Campo inválido", preferir algo que oriente o próximo passo).
4. Respeitar o que já é voz de marca estabelecida (ex: textos do pitch, taglines) — não reescrever o que já está alinhado só por preferência pessoal.
5. Edição direta no código só depois de aprovação — por padrão, esta skill **propõe** (tabela antes/depois); só edita o arquivo se a tarefa que a chamou disser explicitamente que já está aprovado.

## Formato de saída obrigatório

Tabela: `Arquivo:linha | Texto atual | Texto proposto | Por quê (princípio ou defeito objetivo)`.

## Restrições

- Nunca inventar copy que implique orientação médica personalizada (ex: não sugerir frases que soem como diagnóstico ou recomendação clínica na tela Cuidados).
- Preservar termos técnicos/legais que não podem ser simplificados sem perder precisão (ex: nomes oficiais de vacinas do PNI).

## Teste de funcionamento

Rode numa tela pequena, como as mensagens de validação de `CaregiversScreen.tsx`, e confira que a saída é uma tabela com pelo menos uma proposta justificada por um princípio real de `ux-principles.md`.
