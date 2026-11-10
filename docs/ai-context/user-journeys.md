# Jornadas principais — Âmi

Documentadas a partir do debriefing e do código (`src/screens/`). Marcadas como "verificada na tela" (naveguei até lá e vi o formulário/fluxo) ou "não testada ponta a ponta" (não preenchi dados reais nem rodei o servidor de IA, pra não poluir o app com dados de teste).

## 1. Cadastrar filho → ver reflexo automático na Agenda
`Perfis` → preencher nome, nascimento, escola/turno, atividades extracurriculares → `Agenda` passa a mostrar escola (todo dia) e atividades (nos dias marcados) automaticamente, sem recadastro.
**Status**: verificada na tela (formulário existe e está correto); o reflexo automático na Agenda não foi testado ponta a ponta (exigiria cadastrar um filho de teste).

## 2. Importar evento por foto/PDF
`Agenda` → botão "Importar de foto ou PDF" → câmera/galeria/arquivo → servidor local lê com IA de visão → extrai campos com nível de confiança (baixa confiança destacada em lilás) → mãe confirma → evento salvo → oferece lembrete de confirmação/presente e criação de checklist.
**Status**: tela e botão verificados; fluxo completo não testado (depende do servidor local `server/ligar-servidor.cmd` rodando, que não liguei).

## 3. Gerar história personalizada vinculada a um evento
`Histórias` → escolher/criar personagens (reaproveitados de Perfis/Cuidadores ou novos) → tema, moral, cenário, duração, faixa etária, narrador, final, opção de série, vínculo com evento da agenda → geração real por IA (Anthropic).
**Status**: formulário verificado; geração real não testada (depende do servidor local).

## 4. Configurar e manter rotina de sono
`Sono` → primeira vez: formulário completo (horários semana/fim de semana, soneca se ≤5 anos, ritual pré-sono, lembrete) → depois de salvo, abre resumido com link "editar" → registro diário via "Salvar infos de hoje" (status da noite, horário real, despertares).
**Status**: **bloqueada hoje** — a tela exige filho cadastrado antes de mostrar qualquer formulário; não testada além do estado vazio.

## 5. Consultar calendário de cuidados de saúde pública
`Cuidados` → calendário de vacina (PNI), puericultura, especialidades, triagem neonatal, calculado a partir da data de nascimento do filho → cards com prazo relativo e fonte oficial.
**Status**: **bloqueada hoje** — mesma trava da jornada 4, exige filho cadastrado.

## Observação transversal

As jornadas 4 e 5 dependem inteiramente da jornada 1 ter sido concluída antes — e hoje, se a mãe entrar primeiro em Sono ou Cuidados (antes de Perfis), não há nenhum atalho na própria tela pra ir cadastrar o filho. Isso é uma observação de mapeamento, não uma recomendação — a priorização fica para a auditoria (ver `ux-backlog.md`).
