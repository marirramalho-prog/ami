# Product Brief — Âmi

## O que é

Âmi (antes "Lumi" — nome mudou por indisponibilidade no INPI) é um app de **logística familiar com uma mascote de IA** ("a fada madrinha das mães"). Resolve o dia a dia prático de cuidar de filhos: agenda, rotina, atividades extracurriculares, sono, histórias, cuidadores — **deliberadamente fora do escopo médico/pediátrico**.

## Problema que resolve

Hoje as mães dependem de fontes fragmentadas — WhatsApp, redes sociais, buscas soltas — pra resolver logística da família. Não existe um player forte que combine mascote com identidade própria, agregação de conteúdo e foco só-logística (sem misturar saúde/pediatria, o que gera desconfiança regulatória segundo a pesquisa de mercado do projeto).

## Proposta de valor (pitch oficial)

> "Toda mãe já quis ter uma amiga que simplesmente resolvesse. [...] É essa a magia de ter a Lumi [Âmi]: sua fada madrinha particular, sempre por perto, pronta para transformar qualquer pedido [...] numa solução real. Sem julgamento. Só cuidado."

Posicionamento: **"Companhia, não logística"** — diferencial frente a concorrentes que se vendem como assistente/co-piloto (Ohai, Goldee AI, TotTime, Milo).

## O que o produto exclui de propósito

- **Escopo médico/pediátrico**: a tela "Cuidados" mostra calendário público de vacina/puericultura, mas nunca dá orientação médica personalizada — texto da tela deixa isso explícito. Cards de especialidade carregam selo "aguardando validação do pediatra parceiro" até isso ser validado de verdade.
- Dados de saúde/alergias não entram no campo de observações do perfil do filho (decisão de produto).

## Estágio atual (confirmado, 2026-11-10)

MVP funcional completo (blocos 1-6 do roadmap), **sem usuárias reais ainda**. Mari está revisando tela por tela antes de validar com 5-10 mães reais (próximo passo formal). Armazenamento 100% local (AsyncStorage) — Supabase (contas de usuário, dados sincronizados entre cuidadores) é a próxima etapa grande, ainda não iniciada.

## Fontes

- `Lumi/Contexto/lumi_registro_completo_projeto.docx` (pesquisa de mercado, pitch, posicionamento)
- `Lumi/Cronograma/ami_roadmap_desenvolvimento_app.md` (status de desenvolvimento)
- `Lumi/ami_debriefing_app.md` (estado tela a tela)
