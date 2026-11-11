# Lista de mudanças — PR #1 (branch `ux-review`)

Checklist pra testar tudo o que foi feito, no app rodando (`npx expo start --web`, na branch `ux-review`). Marque conforme for testando.

## Tela Sono / Cuidados

- [ ] Sem filho cadastrado, abrir a aba **Sono** mostra o link "👶 ir para Perfis" (antes, não tinha nenhuma saída)
- [ ] O mesmo na aba **Cuidados**
- [ ] Clicar no link leva direto pra aba Perfis

## Tela Checklist

- [ ] Com pelo menos 1 checklist já criado, o formulário de criação some, vira um botão **"+ Novo checklist"**
- [ ] Clicar em "+ Novo checklist" abre o formulário de novo
- [ ] Dentro do formulário aberto, aparece um link **"cancelar"** que fecha de novo
- [ ] Criar um checklist novo faz o formulário fechar sozinho depois
- [ ] Marcar um item como feito faz aparecer **"X de Y feitos"** embaixo do nome do checklist
- [ ] Clicar em "remover" (do checklist inteiro) abre uma **caixa de confirmação** antes de excluir — nada some sem confirmar
- [ ] Com nenhum checklist criado ainda, o texto vazio é mais acolhedor (menciona a Âmi 🧚)

## Tela Cuidadores e Perfis

- [ ] Clicar em "remover" num cuidador ou num perfil de filho também abre confirmação antes de excluir

## Barra de abas (embaixo da tela)

- [ ] Deixe a janela estreita (ou simule celular: F12 → ícone de celular) e confira que os nomes das abas **não cortam mais** no meio (alguns aparecem abreviados: "Cuidad.", "Check.", "Descobr.", "Histór." — é proposital, pra caber)

## Coisas menores (visual, mais difícil de notar sozinha)

- [ ] Chips de seleção (tipo de atividade, categorias, tags) ficaram um pouco mais fáceis de tocar (área maior), sem mudar a aparência
- [ ] Botões "×" de remover item, avatares e dias da semana agora têm descrição pra quem usa leitor de tela (não dá pra ver isso sem ativar um leitor de tela no celular — se quiser testar, no iPhone é "VoiceOver" em Ajustes > Acessibilidade)

## O que eu NÃO testei (fica pra você ou pra quando tiver o app no celular)

- [ ] Funcionamento no Expo Go (celular de verdade) — só testei na visualização web
- [ ] Notificação push (não funciona no navegador, só no celular)
- [ ] Leitor de tela de verdade (testei só pela estrutura técnica, não ouvindo o leitor real)

---

**Se algo não bater com essa lista ou parecer estranho**, me diga exatamente o que você viu (e em qual tela) que eu investigo antes de você decidir sobre o merge.
