# Princípios de UX — Âmi

Derivados da identidade de marca já definida (`product-brief.md`), não inventados pelo agente. Servem pra justificar recomendações — toda recomendação de UX deve conseguir apontar pra um destes (ou dizer explicitamente que é preferência estética sem base aqui).

1. **Aparece na hora certa, sem precisar de mil explicações.** A interface deve minimizar o que a mãe precisa digitar/explicar antes de receber ajuda — ex: o chat da Âmi já veio sem botões de atalho fixos, abrindo direto na caixa de texto.
2. **Resolve, não só sugere.** Priorizar ações concretas (confirmar, criar, agendar) sobre sugestões genéricas.
3. **Sem julgamento.** Copy e fluxos de erro não podem soar como repreensão — inclusive em mensagens de validação de formulário.
4. **Companhia, não logística fria.** Mesmo sendo um app de tarefas (agenda, checklist), a voz e a presença da mascote devem manter um tom de presença pessoal, não de ferramenta corporativa.
5. **Fora do escopo médico, de forma explícita.** Qualquer tela que toque saúde (Cuidados) precisa deixar claro, no próprio texto, que não é orientação médica personalizada — isso já é regra de produto, não só de UX.
6. **Magia real, não perfeição decorativa.** Da pitch: "magia real, não perfeição" — prioriza utilidade e remoção de fricção sobre polimento visual gratuito.

## Diretrizes de plataforma a considerar

- App roda em **iOS + Android + Web** a partir do mesmo código (React Native + Expo). Ao avaliar um componente, checar se o padrão sugerido (ex: um gesto ou atalho) existe nas três plataformas antes de recomendar, em vez de assumir convenção só de iOS ou só de Android.
- Acessibilidade: nenhuma auditoria de contraste/WCAG foi feita ainda — pendente, não presumir conformidade.
