// Faixa etária do Desfralde — referência do manual "Treinamento
// Esfincteriano", publicado pela Sociedade Brasileira de Pediatria (SBP) em
// parceria com a Sociedade Brasileira de Urologia (SBU) em 2019: a idade
// isolada não é um bom critério pra decidir o início, mas é por volta dos 24
// meses que os sinais de prontidão costumam começar a ser avaliados — por
// isso o resumo de sinais/guia só aparece a partir daí. Acima dos 72 meses
// (6 anos) o cartão de entrada some (processo normalmente já concluído).
export const IDADE_MINIMA_DESFRALDE_MESES = 24;
export const IDADE_MAXIMA_DESFRALDE_MESES = 72;

export const DISCLAIMER_IDADE_DESFRALDE =
  'Essa referência de idade segue o manual de Treinamento Esfincteriano da Sociedade Brasileira de Pediatria (SBP) e da Sociedade Brasileira de Urologia (SBU), 2019 — é uma orientação geral, não um diagnóstico. Cada criança tem seu tempo; na dúvida, converse com o pediatra.';

// A partir de quando o resumo de sinais de prontidão e o guia aparecem pro
// perfil, pra quem ainda não tem um processo de desfralde em andamento.
export function elegivelParaIniciarDesfralde(idadeMesesCrianca: number | null): boolean {
  return idadeMesesCrianca !== null && idadeMesesCrianca >= IDADE_MINIMA_DESFRALDE_MESES;
}

// Se o cartão "🧻 Desfralde" deve aparecer no perfil — quem já tem um
// processo em andamento (ou pausado/concluído) continua vendo normalmente,
// mesmo que a idade tenha passado da faixa sugerida nesse meio tempo.
export function mostrarEntradaDesfralde(idadeMesesCrianca: number | null, jaTemProcesso: boolean): boolean {
  if (idadeMesesCrianca === null || idadeMesesCrianca > IDADE_MAXIMA_DESFRALDE_MESES) return false;
  return jaTemProcesso || elegivelParaIniciarDesfralde(idadeMesesCrianca);
}
