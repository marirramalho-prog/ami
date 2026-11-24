// Desfralde é rotina, não saúde: nenhum dado daqui entra em analytics, logs,
// IA, publicidade ou parceiros (ver AGENTS/briefing). Tabelas próprias,
// separáveis do resto do app de propósito — ver desfraldeStorage.ts.

export type StatusDesfralde = 'nao_iniciado' | 'em_andamento' | 'pausado' | 'concluido';

export type FaseDesfralde = 'preparar' | 'primeiros_dias' | 'dia_a_dia' | 'noite';

export interface DesfraldeProcesso {
  id: string;
  childId: string;
  status: StatusDesfralde;
  faseAtual: FaseDesfralde;
  iniciadoEm: string | null;
  pausadoEm: string | null;
  concluidoEm: string | null;
  criadoPor: string | null; // caregiverId
  atualizadoEm: string;
}

// Catálogo fixo de sinais — ligados ao filho (existem antes do processo
// começar), não ao processo.
export type CodigoSinalProntidao =
  | 'fica_seco_mais_tempo'
  | 'avisa_ou_esconde'
  | 'incomoda_com_fralda_suja'
  | 'curiosidade_banheiro'
  | 'abaixa_sobe_roupa'
  | 'entende_pedidos_simples';

export interface SinalProntidao {
  id: string;
  childId: string;
  sinal: CodigoSinalProntidao;
  marcado: boolean;
  marcadoEm: string | null;
  desmarcadoEm: string | null;
  atualizadoPor: string | null; // caregiverId
}

export type RecipienteDesfralde = 'penico' | 'vaso' | 'vaso_redutor' | '';
export type ModoHorarioDesfralde = 'intervalo' | 'momentos';
export type MomentoRotinaDesfralde =
  | 'ao_acordar'
  | 'antes_de_sair'
  | 'depois_das_refeicoes'
  | 'antes_do_banho'
  | 'antes_de_dormir';

export interface PalavrasFamiliaDesfralde {
  xixi: string;
  coco: string;
  banheiro: string;
}

export interface DesfraldeConfiguracao {
  processoId: string;
  fraldaDia: boolean;
  fraldaSoneca: boolean;
  fraldaNoite: boolean;
  fraldaPasseio: boolean;
  recipiente: RecipienteDesfralde;
  modoHorario: ModoHorarioDesfralde;
  intervaloMin: string;
  momentos: MomentoRotinaDesfralde[];
  palavras: PalavrasFamiliaDesfralde;
  combinados: string; // máx. 500
  recompensa: string; // máx. 200
  atualizadoPor: string | null;
  atualizadoEm: string;
}

export type ConteudoRegistroDesfralde = 'xixi' | 'coco' | 'ambos' | '';
export type LocalRegistroDesfralde = 'penico_vaso' | 'escape_roupa' | 'fralda' | '';
export type IniciativaRegistroDesfralde = 'pediu' | 'levado' | '';
export type PeriodoRegistroDesfralde = 'dia' | 'soneca' | 'noite';
export type NoiteResultadoDesfralde = 'seco' | 'molhado' | '';
export type AmbienteRegistroDesfralde = 'casa' | 'escola' | 'outro' | '';

export interface DesfraldeRegistro {
  id: string;
  processoId: string;
  childId: string;
  conteudo: ConteudoRegistroDesfralde;
  local: LocalRegistroDesfralde;
  iniciativa: IniciativaRegistroDesfralde;
  periodo: PeriodoRegistroDesfralde;
  noiteResultado: NoiteResultadoDesfralde;
  ambiente: AmbienteRegistroDesfralde;
  registradoEm: string; // ISO timestamp
  registradoPor: string | null; // caregiverId
  observacao: string; // máx. 280, nunca dado de saúde (aviso na UI)
  criadoEm: string;
  editadoEm: string | null;
  editadoPor: string | null;
}

export type TipoConquistaDesfralde =
  | 'primeiro_xixi'
  | 'primeiro_coco'
  | 'primeiro_dia_sem_fralda'
  | 'pediu_sozinho'
  | 'primeira_noite_seca'
  | 'concluido';

export interface DesfraldeConquista {
  id: string;
  processoId: string;
  tipo: TipoConquistaDesfralde;
  data: string;
  registradoPor: string | null;
}

export type TipoLembreteDesfralde = 'banheiro' | 'revisar_sinais' | 'revisar_fase';

export interface DesfraldeLembrete {
  id: string;
  processoId: string;
  tipo: TipoLembreteDesfralde;
  modoHorario: ModoHorarioDesfralde; // só usado quando tipo === 'banheiro'
  intervaloMin: string;
  momentos: MomentoRotinaDesfralde[];
  horaInicio: string;
  horaFim: string;
  diasSemana: number[]; // 0 (domingo) a 6 (sábado)
  destinatarios: string[]; // caregiverIds
  ativo: boolean;
  notificationIds: string[];
}

// Checado só na UI (esconder/desabilitar ação) — não existe conta de
// usuário nem back-end hoje, então isto não é uma garantia de segurança
// real, só uma preferência de exibição da família.
export interface DesfraldePermissao {
  processoId: string;
  caregiverId: string;
  podeVer: boolean;
  podeRegistrar: boolean;
  podeConfigurar: boolean;
}
