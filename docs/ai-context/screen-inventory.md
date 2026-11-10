# Inventário de telas — Âmi

Navegação: uma única barra de abas (`src/navigation/RootNavigator.tsx`, `createBottomTabNavigator`), sem navigators aninhados. 9 telas, todas verificadas visualmente no preview web em 2026-11-10 (estado vazio, sem dados cadastrados).

| Tela (rota) | Arquivo | Função principal | Linhas | Estado observado |
|---|---|---|---|---|
| Âmi (`/`) | [AssistantScreen.tsx](../../src/screens/AssistantScreen.tsx) | Chat-atalho da mascote, conversas categorizadas por tema | 388 | ✅ Funcional, respostas ainda fixas por tema (IA generativa é fase 2) |
| Perfis (`/Perfis`) | [ChildrenProfileScreen.tsx](../../src/screens/ChildrenProfileScreen.tsx) | Cadastro de filho | 471 | ✅ Formulário completo, vazio |
| Cuidadores (`/Cuidadores`) | [CaregiversScreen.tsx](../../src/screens/CaregiversScreen.tsx) | Cadastro de cuidador + toggle "esse sou eu" | 328 | ✅ Formulário completo, vazio |
| Agenda (`/Agenda`) | [AgendaScreen.tsx](../../src/screens/AgendaScreen.tsx) | Eventos, calendário semana/mês, importação por foto/PDF | 433 | ✅ Vazio; import não testado ponta a ponta (servidor local) |
| Checklist (`/Checklist`) | [ChecklistScreen.tsx](../../src/screens/ChecklistScreen.tsx) | Templates de checklist por tipo de atividade | 306 | ✅ Vazio |
| Descobrir (`/Descobrir`) | [DiscoverScreen.tsx](../../src/screens/DiscoverScreen.tsx) | Busca de atividades extracurriculares/fim de semana | 139 | ✅ Dados fictícios claramente rotulados "[Exemplo]" |
| Histórias (`/Histórias`) | [StoriesScreen.tsx](../../src/screens/StoriesScreen.tsx) | Gerador de histórias por IA | 563 | ✅ Formulário completo; geração real não testada |
| Sono (`/Sono`) | [SleepScreen.tsx](../../src/screens/SleepScreen.tsx) | Rotina e registro diário de sono | 769 | ⚠️ Bloqueada sem filho cadastrado (tela vazia, sem CTA pra resolver) |
| Cuidados (`/Cuidados`) | [CareScreen.tsx](../../src/screens/CareScreen.tsx) | Calendário de vacina/puericultura | 261 | ⚠️ Bloqueada sem filho cadastrado (mesma trava) |

## Componentes reutilizados (`src/components/`)

`AtividadesEditor`, `AvatarPicker`, `CaregiverSelector`, `ChildSelector`, `ChipSelector`, `DateFields`, `HoraInput`, `ImportEventModal`, `MonthlyCalendar`, `SleepWeeklyCalendar`, `TagInput`, `TurnoSelector`, `WeeklyCalendar`, `DiasSemanaSelector`.

Não auditei ainda se esses componentes são realmente reaproveitados de forma consistente entre telas (ex: se `DateFields` é usado igual em Perfis, Cuidadores e Agenda) — isso é trabalho da skill `design-system-b2c` / auditoria (Fase 8), não deste mapeamento.
