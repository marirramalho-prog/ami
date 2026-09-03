export interface DatePart {
  dia: string;
  mes: string;
  ano: string;
}

export function isValidDatePart({ dia, mes, ano }: DatePart): boolean {
  const d = Number(dia);
  const m = Number(mes);
  const y = Number(ano);
  if (!d || !m || !y) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  // Limite bem folgado (não só filhos usam essa validação — cuidadores como
  // avós podem ter nascido bem antes de 1990).
  if (y < 1900 || y > new Date().getFullYear()) return false;
  return true;
}

export function calcularIdade({ dia, mes, ano }: DatePart): number | null {
  if (!isValidDatePart({ dia, mes, ano })) return null;

  const nascimento = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const hoje = new Date();

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

  if (aindaNaoFezAniversario) idade -= 1;
  return idade >= 0 ? idade : null;
}

export function dateKey(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}
