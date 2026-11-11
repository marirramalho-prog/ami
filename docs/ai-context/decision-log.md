# Log de decisões — Âmi

Decisões de produto/técnicas já tomadas antes deste processo (resgatadas do roadmap/debriefing), mais as que forem tomadas daqui pra frente. Registrar aqui evita sugerir de novo algo já decidido e rejeitado.

## Já decididas (histórico, confirmado nos documentos do projeto)

- **2026 (data exata não registrada) — Nome "Lumi" → "Âmi"**: sem disponibilidade no INPI. Rebranding em andamento no app, código e materiais; chaves de armazenamento já migradas.
- **Escopo médico excluído de propósito**: Cuidados mostra calendário público, nunca orientação personalizada; dados de saúde/alergias não entram no campo de observações do perfil do filho.
- **Sem senha padrão previsível para convite de cuidador** ("tipo iniciais+aniversário") — login de cuidador será por convite em link onde o próprio cuidador define a senha, quando o sistema de contas (Supabase) for implementado.
- **Armazenamento só-local por enquanto**: dados ficam no AsyncStorage do aparelho até a fase de contas de usuário via Supabase.
- **Chave da API Anthropic nunca no app**: fica isolada em um servidor local próprio (`server/`), nunca embutida no cliente.
- **"Descobrir" usa dataset fictício rotulado**: fonte de dados real (curadoria manual vs. parceria vs. agregação) ainda em reflexão, não decidida.
- **Prototipar já, validar depois**: abordagem escolhida em vez de esperar pesquisa formal terminar antes de codar — validação com usuárias reais roda em paralelo ao desenvolvimento.

## Decisões tomadas durante este processo (agente de UX/UI)

- **2026-11-10 — Arquitetura escolhida: agente + skills dentro do Claude Code, Context Bank em `docs/ai-context/`.** Motivo: repositório já acessível via Claude Code, com Git funcional — arquitetura recomendada pelo próprio roteiro para este cenário.
- **2026-11-10 — Trabalho de UX isolado na branch `ux-review`**, separada da `ami`, até a Mari aprovar o merge.
- **2026-11-10 — Aprovação em bloco de todo o backlog pendente** ("quero seguir com tudo"): implementados os itens #2, #3, #4, #10, #11, #12 e #13 do `ux-backlog.md` numa única rodada, exceto #6 (baixo valor, mantido pendente) e #9 (console-only, provavelmente causa externa à nossa base de código).
- **2026-11-10 — Confirmação de exclusão usa `Alert.alert` nativo + `window.confirm` na web** (`src/utils/confirm.ts`), em vez de só `Alert.alert`: `Alert.alert` é um no-op silencioso no `react-native-web` (confirmado lendo `node_modules/react-native-web/src/exports/Alert`), o que apagaria dados sem nenhum aviso na versão web.
- **2026-11-11 — PR #1 mesclado na `ami`** (squash) com a aprovação da Mari, sem revisão manual prévia dela — ela pediu pra mesclar direto. A `ami` local tinha 3 commits próprios ainda não enviados ao GitHub; o merge do Git resolveu isso sozinho, sem conflito.
- **2026-11-11 — Itens #6 e #9 do backlog implementados juntos**: adicionar `linking.config` ao `NavigationContainer` (resolve #6, navegação direta por URL na web) também fez o aviso de console do item #9 desaparecer — não precisou de mais nada além dessa mudança.
- **2026-11-11 — Upgrade Expo SDK 57 → 58**: o Expo Go da App Store já tinha subido sozinho pra SDK 58 (não dá pra instalar versão antiga em iPhone), travando o teste no celular da Mari. Rodado `npx expo install --fix` + correção do `app.json` (splash movido pro plugin `expo-splash-screen`, `userInterfaceStyle` de `"light"` pra `"automatic"` — esse campo forçava o app inteiro no claro em iOS/Android, o que anularia o modo escuro recém-implementado) + ajuste de tipos de `ref` de `TextInput` (API mais estrita do React Native 0.87/0.88). `expo-doctor` e `tsc --noEmit` limpos depois.

## Decisões rejeitadas

(nenhuma ainda)
