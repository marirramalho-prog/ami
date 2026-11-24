import { DesfraldePermissao } from '../../types/desfralde';
import {
  obterPermissaoEfetiva,
  podeSalvarConfiguracao,
  podeSalvarRegistro,
} from '../desfraldePermissoes';

const PROCESSO_ID = 'processo-1';

describe('obterPermissaoEfetiva', () => {
  it('dá permissão total pro responsável principal, mesmo sem registro de permissão', () => {
    const permissao = obterPermissaoEfetiva(
      { id: 'cuidador-principal', principal: true },
      [],
      PROCESSO_ID,
    );
    expect(permissao).toEqual({ podeVer: true, podeRegistrar: true, podeConfigurar: true });
  });

  it('dá só visualização pro cuidador sem registro de permissão explícito', () => {
    const permissao = obterPermissaoEfetiva(
      { id: 'cuidador-babá', principal: false },
      [],
      PROCESSO_ID,
    );
    expect(permissao).toEqual({ podeVer: true, podeRegistrar: false, podeConfigurar: false });
  });

  it('respeita o registro de permissão explícito do cuidador', () => {
    const permissoes: DesfraldePermissao[] = [
      {
        processoId: PROCESSO_ID,
        caregiverId: 'cuidador-avó',
        podeVer: true,
        podeRegistrar: true,
        podeConfigurar: false,
      },
    ];
    const permissao = obterPermissaoEfetiva(
      { id: 'cuidador-avó', principal: false },
      permissoes,
      PROCESSO_ID,
    );
    expect(permissao).toEqual({ podeVer: true, podeRegistrar: true, podeConfigurar: false });
  });

  it('não aplica permissão de outro processo', () => {
    const permissoes: DesfraldePermissao[] = [
      {
        processoId: 'outro-processo',
        caregiverId: 'cuidador-avó',
        podeVer: true,
        podeRegistrar: true,
        podeConfigurar: true,
      },
    ];
    const permissao = obterPermissaoEfetiva(
      { id: 'cuidador-avó', principal: false },
      permissoes,
      PROCESSO_ID,
    );
    expect(permissao).toEqual({ podeVer: true, podeRegistrar: false, podeConfigurar: false });
  });

  it('nega tudo quando não há cuidador identificado', () => {
    const permissao = obterPermissaoEfetiva(null, [], PROCESSO_ID);
    expect(permissao).toEqual({ podeVer: false, podeRegistrar: false, podeConfigurar: false });
  });
});

describe('podeSalvarRegistro / podeSalvarConfiguracao', () => {
  it('cuidador sem podeRegistrar não consegue salvar um registro', () => {
    const permissao = obterPermissaoEfetiva({ id: 'c1', principal: false }, [], PROCESSO_ID);
    expect(podeSalvarRegistro(permissao)).toBe(false);
  });

  it('cuidador sem podeConfigurar não consegue salvar a configuração', () => {
    const permissao = obterPermissaoEfetiva({ id: 'c1', principal: false }, [], PROCESSO_ID);
    expect(podeSalvarConfiguracao(permissao)).toBe(false);
  });

  it('responsável principal consegue os dois', () => {
    const permissao = obterPermissaoEfetiva({ id: 'c1', principal: true }, [], PROCESSO_ID);
    expect(podeSalvarRegistro(permissao)).toBe(true);
    expect(podeSalvarConfiguracao(permissao)).toBe(true);
  });
});
