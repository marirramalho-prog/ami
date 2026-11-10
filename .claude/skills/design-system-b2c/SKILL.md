---
name: design-system-b2c
description: Analisa, documenta e aplica padrões consistentes de design (cor, tipografia, espaçamento, componentes, acessibilidade, responsividade) no app Âmi. Use quando a Mari pedir pra revisar consistência visual, formalizar tokens, ou checar se uma tela "está no padrão".
allowed-tools: Read, Grep, Glob, Edit(docs/ai-context/design-system.md), Edit(src/theme/*)
---

## Objetivo

Manter `docs/ai-context/design-system.md` como retrato fiel do que existe hoje, e propor consolidação de padrões **sem nunca criar um padrão novo sem aprovação explícita da Mari**.

## Antes de começar

Leia `docs/ai-context/design-system.md` (estado atual já documentado) e `src/theme/colors.ts`.

## Procedimento

1. Para a área em questão (uma tela, um tipo de componente, ou o app todo), grep os `StyleSheet.create` relevantes em `src/screens/` e `src/components/` por `fontSize`, `fontWeight`, `padding`, `margin`, `borderRadius`, cores em hex fora de `colors.ts`.
2. Compare os valores encontrados entre telas/componentes — identifique: (a) valores idênticos repetidos (candidato a virar token), (b) valores próximos mas diferentes sem razão aparente (possível inconsistência), (c) cor fora da paleta oficial (`colors.ts`) usada direto em hex.
3. **Diferencie claramente** "isso é o que existe" de "isso é o que eu recomendaria" — nunca apresente um como o outro.
4. Se a Mari aprovar formalizar um token (ex: criar `spacing.ts` ou `typography.ts`), só então edite `src/theme/` — nunca antes da aprovação.
5. Atualize `docs/ai-context/design-system.md` com o que foi encontrado/decidido.

## Formato de saída obrigatório

Duas seções separadas: **"O que existe hoje"** (fatos, com arquivo:linha) e **"Recomendações (pendente de aprovação)"** (o que mudaria, por quê, e o esforço estimado).

## Restrições

- Não tratar um padrão encontrado no código como necessariamente bom só por já existir.
- Não introduzir biblioteca de design tokens ou styling nova (ex: styled-components, tamagui) sem necessidade demonstrada e aprovação.
- Reaproveitar componente existente em vez de criar um novo sempre que o existente resolver.

## Teste de funcionamento

Rode num recorte pequeno — ex: "compare o `borderRadius` usado em cards entre `AgendaScreen.tsx` e `ChecklistScreen.tsx`" — e confira que a saída separa fato de recomendação e cita arquivo:linha real.
