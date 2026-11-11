# Design System — Âmi

**Status: informal.** Existe uma paleta de cores oficial e centralizada; tipografia, espaçamento, raios de borda e componentes **não têm tokens compartilhados** — cada tela define seus próprios números no `StyleSheet` local. Isto é um fato observado no código, não uma recomendação — decidir se vale formalizar entra no backlog (`ux-backlog.md`), com sua aprovação antes de qualquer mudança.

## Paleta de cores (oficial, confirmada)

Fonte: `src/theme/colors.ts`, que cita `lumi_registro_completo_projeto.docx` seção 7 — já batem exatamente.

| Nome | Hex | Uso no código |
|---|---|---|
| Lilás suave | `#CCC3E6` | `primary` |
| Azul claro | `#C8DFF0` | `secondary` |
| Branco suave | `#F5F4F8` | `background` |
| Lavanda claro | `#DED4EC` | — |
| Azul gelo | `#E1EEF7` | — |
| Cinza lilás | `#D1CDDA` | `border` |
| — | `#3A3550` | `text` |
| — | `#7A7390` | `textMuted` |
| — | `#FFFFFF` | `card` |

`text`, `textMuted` e `card` não vêm do documento de marca — foram definidos direto no código (decisão de implementação, não de marca).

## Tipografia — não documentado (pendente)

Não existe arquivo de tokens de tipografia. Tamanhos observados em uso real (ex: `AgendaScreen.tsx`): títulos de tela em 24px/700, labels em 13px/600, texto de apoio em 12px, corpo em 14-16px. Repetidos de memória em cada tela, não importados de um lugar comum.

## Espaçamento e raios — não documentado (pendente)

Mesma situação: `padding: 16`, `borderRadius: 16` (cards grandes), `borderRadius: 10` (botões/inputs), `borderRadius: 14` (cards de item) aparecem como números soltos, repetidos tela a tela, sem uma escala nomeada.

## Componentes

Lista completa em `screen-inventory.md`. Existem componentes reutilizáveis (`DateFields`, `ChipSelector`, `TagInput`, etc.), mas ainda não verificado se o mesmo padrão visual (ex: como um input de data se parece) é realmente idêntico onde deveria ser — fica para a skill `design-system-b2c` na auditoria.

## Identidade de marca (confirmada, de `lumi_registro_completo_projeto.docx`)

- Paleta "clara e suave — feminina sem ser 'princesa de conto', leve e acolhedora".
- Mascote: fada madrinha adulta elegante (não infantilizada) — "menos fantasia, mais mulher real".
- Sistema de logo: o ponto do "i" em "lumi"/"âmi" vira um brilho (referência à varinha).
- Ícone oficial da mascote já existe em `assets/mascote/avatar-circular-bust.png` e já é usado no chat (`RootNavigator.tsx`).

## Estados de loading, erro, vazio, responsividade, animações

Não levantados ainda neste documento — pendente, a levantar na auditoria (Fase 8) tela por tela.
