export type Tema = 'Aventura' | 'Drama' | 'Terror' | 'Comédia' | 'Fantasia' | '';
export type Sustinho = 'leve' | 'moderado' | 'nenhum' | '';
export type PapelCrianca = 'protagonista' | 'coadjuvante' | 'não aparece' | '';
export type Arco = 'herói' | 'vilão' | 'ambos' | '';
export type Comprimento = 'curta' | 'média' | 'longa' | '';
export type Narrador = '1ª pessoa' | '3ª pessoa' | '';
export type TipoFinal = 'fechado' | 'escolha sua aventura' | '';

export interface CustomCharacter {
  id: string;
  nome: string;
  descricao: string;
}

export interface StoryPreferences {
  personagens: string[]; // nomes (podem vir de Child cadastrado ou CustomCharacter)
  arco: Arco;
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
