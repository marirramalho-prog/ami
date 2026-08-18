// Servidor local mínimo: guarda a chave da API da Anthropic no backend,
// nunca no app. O app React Native chama este servidor, nunca a API
// da Anthropic diretamente.
const http = require('http');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const PORT = process.env.PORT || 4001;
const API_KEY = process.env.ANTHROPIC_API_KEY;

function buildPrompt(prefs) {
  const linhas = [
    'Escreva uma história infantil em português do Brasil, seguindo estas preferências:',
    prefs.personagens.length ? `Personagens: ${prefs.personagens.join(', ')}.` : '',
    prefs.arco ? `O personagem principal é ${prefs.arco}.` : '',
    prefs.papelCrianca ? `Papel da criança na história: ${prefs.papelCrianca}.` : '',
    prefs.relacao ? `Relação entre os personagens: ${prefs.relacao}.` : '',
    prefs.tema ? `Tema: ${prefs.tema}.` : '',
    prefs.sustinho && prefs.sustinho !== 'nenhum'
      ? `Nível de suspense/sustinho: ${prefs.sustinho} (apropriado para a faixa etária informada, nunca assustador demais).`
      : '',
    prefs.moral ? `Moral ou lição da história: ${prefs.moral}.` : '',
    prefs.lugar ? `Cenário/lugar: ${prefs.lugar}.` : '',
    prefs.epoca ? `Época: ${prefs.epoca}.` : '',
    prefs.comprimento ? `Comprimento: história ${prefs.comprimento}.` : '',
    prefs.faixaEtaria ? `Faixa etária/nível de leitura: ${prefs.faixaEtaria}.` : '',
    prefs.narrador ? `Narração em ${prefs.narrador}.` : '',
    prefs.tipoFinal === 'escolha sua aventura'
      ? 'Inclua 1 ou 2 pontos de decisão no meio da história, com opções claras marcadas como "Opção A" e "Opção B" escritas no texto (formato simples em texto, sem interatividade real ainda).'
      : 'Final fechado, história linear.',
    prefs.eventoContexto ? `Inspire-se neste evento real da família: ${prefs.eventoContexto}.` : '',
    '',
    'Nunca inclua conteúdo médico, conselhos de saúde ou temas assustadores demais para a faixa etária. Escreva só a história, sem comentários antes ou depois.',
  ].filter(Boolean);
  return linhas.join('\n');
}

async function handleGenerateStory(req, res) {
  if (!API_KEY) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada em server/.env' }));
    return;
  }

  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', async () => {
    try {
      const prefs = JSON.parse(body);
      const prompt = buildPrompt(prefs);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        res.writeHead(response.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: errText }));
        return;
      }

      const data = await response.json();
      const texto = data.content?.[0]?.text || '';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ texto }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(err) }));
    }
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/generate-story') {
    handleGenerateStory(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`Servidor de histórias da Lumi rodando em http://localhost:${PORT}`);
  if (!API_KEY) {
    console.warn('Aviso: ANTHROPIC_API_KEY não encontrada em server/.env');
  }
});
