# Baseline de qualidade — Âmi

O que existe de fato pra validar uma mudança, hoje (2026-11-10). Ver `tech-stack.md` para a tabela completa de ferramentas.

## Disponível

- **Preview funcional**: `npx expo start --web` (configurado em `.claude/launch.json` como `ami-app-web`), porta 8081 — permite ver e interagir com qualquer tela no navegador.
- **TypeScript**: `tsconfig.json` existe, então erros de tipo aparecem no editor/build, mas não há script dedicado (`npm run typecheck` não existe hoje).
- **Git**: histórico completo de commits na branch `ami`, permite comparar antes/depois e reverter.

## Disponível (atualizado em 2026-11-25)

- **Testes automatizados (unitários)**: Jest configurado (`jest-expo`, `npm test`), com suítes em `src/**/__tests__/` cobrindo principalmente a lógica de desfralde (`desfraldeCalc`, `desfraldeElegibilidade`, `desfraldeAgenda`, `desfraldePermissoes`, `desfraldeRelatorio`) e `desfraldeStorage`. Não cobre UI/componentes visuais — não serve pra validar mudança de UX.

## Não disponível (não inventar)

- Lint (ESLint/Prettier): não configurado.
- Testes de componente/E2E: não configurado.
- Comparação visual automatizada (screenshot diff): não configurado — comparação antes/depois é manual, por captura de tela.
- CI: não verificado ainda se existe pipeline.

## Como isso afeta o harness (Fase 7)

Toda validação de mudança de UX, por enquanto, depende de:
1. Abrir o preview e navegar manualmente até a tela mudada.
2. Comparar screenshot antes/depois.
3. Checar erros de tipo/console no preview.

Não há como hoje rodar "a suíte de testes" — se isso for necessário, a decisão de adicionar uma base mínima de testes precisa ser conversada e aprovada antes, nunca presumida.
