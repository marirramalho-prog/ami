import { DesfraldePermissao } from '../types/desfralde';

// Checagem só de exibição (esconder/desabilitar botão) — não existe conta
// de usuário nem back-end hoje, então isto não impede de verdade um
// cuidador de usar o aparelho de outra pessoa. Documentado também em
// types/desfralde.ts, junto da interface DesfraldePermissao.
export interface PermissaoEfetivaDesfralde {
  podeVer: boolean;
  podeRegistrar: boolean;
  podeConfigurar: boolean;
}

const PERMISSAO_RESPONSAVEL_PRINCIPAL: PermissaoEfetivaDesfralde = {
  podeVer: true,
  podeRegistrar: true,
  podeConfigurar: true,
};

// Cuidador sem registro de permissão explícito: vê por padrão, mas não
// registra nem configura, até o responsável principal liberar.
const PERMISSAO_PADRAO_CUIDADOR: PermissaoEfetivaDesfralde = {
  podeVer: true,
  podeRegistrar: false,
  podeConfigurar: false,
};

export function obterPermissaoEfetiva(
  caregiver: { id: string; principal: boolean } | null,
  permissoes: DesfraldePermissao[],
  processoId: string,
): PermissaoEfetivaDesfralde {
  if (!caregiver) {
    return { podeVer: false, podeRegistrar: false, podeConfigurar: false };
  }
  if (caregiver.principal) {
    return PERMISSAO_RESPONSAVEL_PRINCIPAL;
  }
  const registro = permissoes.find(
    (p) => p.processoId === processoId && p.caregiverId === caregiver.id,
  );
  if (!registro) {
    return PERMISSAO_PADRAO_CUIDADOR;
  }
  return {
    podeVer: registro.podeVer,
    podeRegistrar: registro.podeRegistrar,
    podeConfigurar: registro.podeConfigurar,
  };
}

export function podeSalvarRegistro(permissao: PermissaoEfetivaDesfralde): boolean {
  return permissao.podeRegistrar;
}

export function podeSalvarConfiguracao(permissao: PermissaoEfetivaDesfralde): boolean {
  return permissao.podeConfigurar;
}
