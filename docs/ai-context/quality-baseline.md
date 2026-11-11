# Baseline de qualidade — Âmi

O que existe de fato pra validar uma mudança, hoje (2026-11-10). Ver `tech-stack.md` para a tabela completa de ferramentas.

## Disponível

- **Preview funcional**: `npx expo start --web` (configurado em `.claude/launch.json` como `ami-app-web`), porta 8081 — permite ver e interagir com qualquer tela no navegador.
- **TypeScript**: `tsconfig.json` existe, então erros de tipo aparecem no editor/build, mas não há script dedicado (`npm run typecheck` não existe hoje).
- **Git**: histórico completo de commits na branch `ami`, permite comparar antes/depois e reverter.

## Não disponível (não inventar)

- Lint (ESLint/Prettier): não configurado.
- Testes automatizados (unitários, componente, E2E): não configurado, nenhuma dependência de teste no `package.json`.
- Comparação visual automatizada (screenshot diff): não configurado — comparação antes/depois é manual, por captura de tela.
- CI: não verificado ainda se existe pipeline.

## Como isso afeta o harness (Fase 7)

Toda validação de mudança de UX, por enquanto, depende de:
1. Abrir o preview e navegar manualmente até a tela mudada.
2. Comparar screenshot antes/depois.
3. Checar erros de tipo/console no preview.

Não há como hoje rodar "a suíte de testes" — se isso for necessário, a decisão de adicionar uma base mínima de testes precisa ser conversada e aprovada antes, nunca presumida.
