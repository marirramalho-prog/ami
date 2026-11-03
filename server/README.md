# Servidor de histórias — Âmi

Servidor local mínimo, sem dependências externas. Guarda a chave da API da
Anthropic e gera as histórias personalizadas — o app nunca fala direto com a
API da Anthropic, só com este servidor.

## Configurar

1. Copie `.env.example` para `.env` nesta pasta.
2. Coloque sua chave da API da Anthropic em `ANTHROPIC_API_KEY` dentro do `.env`.
   O `.env` já está no `.gitignore` — nunca é enviado ao git.

## Rodar

```bash
node server/index.js
```

Fica ouvindo em `http://localhost:4001`. Precisa estar rodando ao mesmo tempo
que o app, sempre que for gerar uma história.
