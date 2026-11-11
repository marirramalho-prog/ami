// Todos esses campos aceitam texto livre (opção "outro" no seletor),
// então o tipo fica como string — as opções sugeridas ficam só na tela.
export type Tema = string;
export type Sustinho = string;
export type PapelCrianca = string;
export type Arco = string;
export type Comprimento = string;
export type Narrador = string;
export type TipoFinal = string;

export interface CustomCharacter {
  id: string;
  nome: string;
  descricao: string;
}

export interface StoryPreferences {
  personagens: string[]; // nomes (podem vir de Child cadastrado ou CustomCharacter)
  arco: Arco;
  vilao: string; // nome do vilão, texto livre (opcional)
  papelCrianca: PapelCrianca;
  relacao: string;
  tema: Tema;
  sustinho: Sustinho;
  moral: string;
  lugar: string;
  epoca: string;
  comprimento: Comprimento;
  faixaEtaria: string;
  narrador: Narrador;
  tipoFinal: TipoFinal;
  serie: boolean;
  eventoVinculadoId: string | null;
}

export interface Story {
  id: string;
  criadaEm: string;
  childIds: string[]; // filhos cadastrados envolvidos, para o histórico por perfil
  preferencias: StoryPreferences;
  serieId: string | null;
  texto: string;
}

export interface StorySeries {
  id: string;
  nome: string;
  preferenciasBase: StoryPreferences;
}
