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
    prefs.vilao ? `O vilão da história se chama ${prefs.vilao}.` : '',
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
      const textBlock = (data.content || []).find((block) => block.type === 'text');
      const texto = textBlock?.text || '';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ texto }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(err) }));
    }
  });
}

function buildExtractEventPrompt() {
  const hoje = new Date();
  const hojeFormatado = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

  return [
    'Você lê um documento (foto ou PDF) e extrai compromissos de agenda familiar em português do Brasil.',
    `A data de hoje é ${hojeFormatado}.`,
    'Responda APENAS com um JSON válido, sem texto antes ou depois, no formato:',
    '{"eventos": [{"titulo": "", "tipo": "", "data": {"dia": "", "mes": "", "ano": ""}, "horaInicio": "", "horaFim": "", "local": "", "criancasCitadas": [], "prazoConfirmacao": "", "contato": "", "observacoes": "", "confianca": {"titulo": "alta", "tipo": "alta", "data": "alta", "horaInicio": "alta", "horaFim": "alta", "local": "alta", "prazoConfirmacao": "alta", "contato": "alta", "observacoes": "alta"}}]}',
    '',
    'Regras:',
    '- Um item em "eventos" por compromisso real encontrado no documento (ex: um calendário escolar com várias datas gera vários itens).',
    '- "tipo" é uma palavra livre curta (ex: aniversario, escola, passeio, reuniao, saude, viagem, outro).',
    '- Datas em dia/mes com 2 dígitos e ano com 4 dígitos. Horários em HH:MM (24h). Deixe em branco o que não existir ou não conseguir ler.',
    '- Convites (principalmente de aniversário infantil) costumam não escrever o ano. Se o dia e o mês estiverem claros mas o ano não aparecer no documento, preencha o ano assumindo a data de hoje informada acima: use o ano corrente, e se esse dia/mês já passou este ano, use o ano seguinte. Nesse caso (ano inferido, não lido de fato no documento), marque a confiança de "data" como "baixa".',
    '- "criancasCitadas": só os nomes de crianças escritos literalmente no documento, como texto puro — não invente nomes.',
    '- "confianca" tem um nível (alta, media ou baixa) pra cada campo acima, refletindo o quanto você tem certeza da leitura daquele campo específico.',
    '- Se o documento for um registro de saúde (receita, atestado, carteira de vacina, pedido de exame, laudo etc.), defina "tipo" como "saude", "titulo" como "Compromisso de saúde", preencha só data/horário/local se existirem, e deixe "observacoes" vazia — nunca escreva diagnóstico, medicação ou qualquer detalhe clínico.',
    '- Nunca inclua comentários, markdown ou texto fora do JSON.',
  ].join('\n');
}

async function callAnthropicVision(mediaType, base64Data) {
  const isPdf = mediaType === 'application/pdf';
  const contentBlock = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Data } }
    : { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'pdfs-2024-09-25',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: [contentBlock, { type: 'text', text: buildExtractEventPrompt() }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((block) => block.type === 'text');
  return textBlock?.text || '';
}

function parseEventosJson(texto) {
  const inicio = texto.indexOf('{');
  const fim = texto.lastIndexOf('}');
  const jsonTexto = inicio !== -1 && fim !== -1 ? texto.slice(inicio, fim + 1) : texto;
  const parsed = JSON.parse(jsonTexto);
  return Array.isArray(parsed.eventos) ? parsed.eventos : [];
}

async function handleExtractEvent(req, res) {
  if (!API_KEY) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada em server/.env' }));
    return;
  }

  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', async () => {
    try {
      const { mediaType, data } = JSON.parse(body);
      if (!mediaType || !data) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'mediaType e data são obrigatórios' }));
        return;
      }

      const texto = await callAnthropicVision(mediaType, data);
      const eventos = parseEventosJson(texto);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ eventos }));
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

  if (req.method === 'POST' && req.url === '/extract-event') {
    handleExtractEvent(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`Servidor de histórias da Âmi rodando em http://localhost:${PORT}`);
  if (!API_KEY) {
    console.warn('Aviso: ANTHROPIC_API_KEY não encontrada em server/.env');
  }
});
