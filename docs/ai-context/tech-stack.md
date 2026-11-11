# Stack técnica — Âmi

## Frontend

- **Expo** `^57.0.20` (atualização disponível: `~57.0.32` — não aplicada ainda) + **React Native** `0.86.3` + **React** `19.2.3`, TypeScript `~6.0.3`.
- Navegação: `@react-navigation/native` + `@react-navigation/bottom-tabs` (v7) — uma única barra de abas, sem stacks aninhadas.
- Roda em **iOS, Android e Web** (`react-native-web`) a partir do mesmo código.
- Armazenamento: `@react-native-async-storage/async-storage` — **tudo local no aparelho**, sem backend hoje.
- Notificações: `expo-notifications` (push local — não funcionam na visualização web, só no app instalado).
- Mídia: `expo-image-picker`, `expo-document-picker`, `expo-image-manipulator` (fotos/PDF de convites e boletins).

⚠️ **O `AGENTS.md` do projeto avisa que o Expo mudou de versão** — sempre checar a documentação v57 (`https://docs.expo.dev/versions/v57.0.0/`) antes de escrever código, inclusive para mudanças de UI.

## Backend / IA

- **Supabase** (Postgres + Auth + Storage + Edge Functions) — **planejado, ainda não implementado**. Hoje não há nenhuma chamada a Supabase no código.
- **Servidor local próprio** (`server/`, Node.js puro, sem framework listado) — guarda a `ANTHROPIC_API_KEY` e gera histórias e faz leitura de convites por IA de visão, pra nunca expor a chave no app. Rodado manualmente via `server/ligar-servidor.cmd` durante desenvolvimento; `render.yaml` já prevê deploy como serviço web no Render.

## Build e distribuição

- `eas.json`: perfis `development` (dev client), `preview` (APK interno Android), `production`.
- Build de teste: Android via EAS Build; iPhone/TestFlight pendente da assinatura do Apple Developer Program.
- `app.json`: bundle id `com.amiapp.ami`, ícones e splash já configurados com a paleta oficial.

## Ferramentas de qualidade — o que existe hoje

Verificado em `package.json` (raiz e `server/`) e na raiz do repositório:

| Ferramenta | Status |
|---|---|
| TypeScript (`tsc`) | Configurado (`tsconfig.json`), mas **sem script `typecheck` no `package.json`** |
| ESLint / Prettier | **Não configurado** — nenhum arquivo de config encontrado |
| Testes unitários/componentes | **Não configurado** — nenhum framework de teste (Jest etc.) nas dependências |
| Testes E2E | **Não configurado** |
| CI | Não verificado ainda (pendente — não vi pasta `.github/workflows`) |

Isso não é um julgamento de que "falta tudo isso" — é o estado real, que entra como insumo pra decidir no harness (Fase 7) quais verificações automáticas são viáveis sem inventar comando que não existe.

## Preview de desenvolvimento

Configurado em `.claude/launch.json`: `npx expo start --web`, porta 8081 — é o que uso pra abrir e testar o app durante este processo.
