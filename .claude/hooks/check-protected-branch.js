#!/usr/bin/env node
// PreToolUse hook: bloqueia Edit/Write/MultiEdit enquanto o repositório
// estiver em uma branch protegida (produção), forçando o trabalho de
// UX/UI a sempre acontecer numa branch separada (ex: ux-review).
const { execSync } = require('child_process');

const PROTECTED_BRANCHES = ['main', 'ami'];

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let branch = '';
  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    // Não é um repositório git, ou git indisponível — não bloqueia.
    process.exit(0);
  }

  if (!PROTECTED_BRANCHES.includes(branch)) {
    process.exit(0); // branch separada, segue o fluxo normal
  }

  let filePath = '(desconhecido)';
  try {
    const parsed = JSON.parse(input);
    filePath = parsed?.tool_input?.file_path || filePath;
  } catch {
    // mantém o valor padrão
  }

  const reason =
    `Edição bloqueada: a branch atual ("${branch}") é protegida pelo harness de UX/UI. ` +
    `Crie ou volte para uma branch de trabalho (ex: "git checkout -b ux-review") antes de editar "${filePath}".`;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
});
