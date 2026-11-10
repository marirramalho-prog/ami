# Context Bank — Âmi

Índice do conhecimento persistente sobre o app Âmi. Estes arquivos **não carregam sozinhos** em cada sessão — são consultados sob demanda, quando a tarefa pedir aquele tipo de informação. As regras gerais que carregam sempre ficam em `AGENTS.md` (na raiz do repositório).

| Arquivo | Quando consultar |
|---|---|
| [product-brief.md](./product-brief.md) | Antes de qualquer decisão de produto/UX: o que é o Âmi, pra quem, o que exclui de propósito |
| [personas.md](./personas.md) | Ao avaliar se uma solução serve o público real — hoje baseado em hipótese, não pesquisa validada |
| [user-journeys.md](./user-journeys.md) | Ao analisar ou mudar um fluxo que atravessa mais de uma tela |
| [screen-inventory.md](./screen-inventory.md) | Ao procurar em qual tela/arquivo vive uma funcionalidade |
| [design-system.md](./design-system.md) | Antes de propor qualquer mudança visual (cor, espaçamento, componente) |
| [tech-stack.md](./tech-stack.md) | Ao avaliar viabilidade técnica de uma mudança ou escolher como testá-la |
| [ux-principles.md](./ux-principles.md) | Ao justificar uma recomendação de UX com princípio da marca |
| [ux-backlog.md](./ux-backlog.md) | Ao priorizar o que atacar primeiro |
| [decision-log.md](./decision-log.md) | Antes de sugerir algo que pode já ter sido decidido (e rejeitado) antes |
| [quality-baseline.md](./quality-baseline.md) | Antes de dizer "testei" — mostra o que existe de fato pra testar |

## Como manter isso vivo

- **Fato confirmado**: algo visto no código, testado no preview, ou escrito nos documentos oficiais do projeto (pasta `Lumi/` no OneDrive da Mari). Marcado sem aviso especial.
- **Hipótese**: julgamento do agente ou decisão ainda não validada com usuárias reais. Sempre marcada explicitamente como "(hipótese)".
- **Pendente**: informação que falta e precisa ser preenchida. Marcada como "(pendente)".
- Nova decisão de produto/UX → registrar em `decision-log.md`, com data e motivo.
- Informação que virou desatualizada → editar o arquivo direto, não duplicar; se a mudança for relevante, registrar em `decision-log.md` por quê mudou.
- Regra de marca contradiz o que está no código → o código é o que roda hoje, mas a contradição deve virar um item no `ux-backlog.md`, nunca ser "resolvida" silenciosamente escolhendo um lado.
- Isto é documentação de **produto**, não muda a cada sessão — não anote aqui o que é só desta conversa (isso fica no `decision-log.md` apenas se virar uma decisão permanente).
