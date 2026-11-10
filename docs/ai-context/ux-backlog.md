# Backlog de UX — Âmi

Preenchido de verdade na Fase 8 (auditoria completa). Por ora, só os itens já observados durante o mapeamento (Fase 2), sem prioridade atribuída ainda — nenhum foi aprovado para implementação.

| Item | Onde | Observação | Status |
|---|---|---|---|
| Telas Sono e Cuidados ficam vazias e sem ação possível sem filho cadastrado | `SleepScreen.tsx`, `CareScreen.tsx` | Só mostram um texto pedindo pra cadastrar em Perfis, sem link/atalho direto pra lá | Observado, não avaliado |
| Ausência de tokens de tipografia/espaçamento | Todas as telas (`StyleSheet` local) | Números repetidos (fontSize, padding, borderRadius) sem fonte única — ver `design-system.md` | Observado, não avaliado |
| Fonte real de dados do "Descobrir" ainda não decidida | `DiscoverScreen.tsx` | Decisão de produto pendente da Mari, não é bug de UX | Fora do escopo de UX por enquanto |

## Auditoria parcial — tela Descobrir (2026-11-10, teste de validação da skill `ux-audit-b2c`)

| Tela | Elemento | Problema | Evidência | Princípio de UX | Impacto | Criticidade | Esforço | Confiança | Recomendação |
|---|---|---|---|---|---|---|---|---|---|
| Descobrir | Barra de abas inferior | Nomes das abas cortam com reticências em largura mobile (375px) | Screenshot em viewport 375×812 | Legibilidade / navegação | Mãe pode não identificar a aba certa de relance | P2 | Baixo | Alta | Encurtar rótulos ou reduzir padding lateral da tab bar |
| Descobrir | Chips de categoria (`DiscoverScreen.tsx:115-122`) | Área de toque abaixo de ~44pt recomendados | Leitura de código | Facilidade de interação | Risco de toque errado, uso com uma mão | P3 | Baixo | Média | Aumentar `paddingVertical` dos chips |
| Descobrir | Navegação direta por URL na versão web | Recarregar numa URL de aba específica sempre volta pra "Âmi" | Teste manual de navegação | Navegação/encontrabilidade | Baixo — só afeta web, uso real é mobile | P3 | Médio | Média | Avaliar só se web virar canal de uso real |

Esta auditoria cobriu só a tela Descobrir, como teste da skill — não é a auditoria completa da Fase 8, que ainda cobre as outras 8 telas.

## Como este arquivo vai crescer

A Fase 8 (auditoria completa, skill `ux-audit-b2c`) vai classificar cada item encontrado por criticidade (P0-P3), esforço e confiança, com evidência. Nada aqui vira implementação sem sua aprovação explícita.
