import { ConteudoGuiaItem } from '../types/conteudoGuia';

// Conteúdo de exemplo do guia de Desfralde — texto original da Âmi, tom
// sereno e sem julgamento. Todo item nasce com validadoEspecialista: false
// e mostra o selo "aguardando validação de especialista" até a Mari
// confirmar quem valida (briefing, seção 11) e aprovar o texto.
export const CONTEUDO_GUIA_DESFRALDE: ConteudoGuiaItem[] = [
  {
    id: 'preparar',
    area: 'desfralde',
    secao: 'preparar',
    ordemSugerida: 1,
    titulo: 'Preparar',
    corpoMd:
      'Antes de começar, vale combinar o básico em família: quais palavras vão usar, onde vai ficar o penico ou o redutor, e o que fazer nos primeiros escapes. Cada criança tem seu tempo — não existe idade certa, só o momento da sua família.',
    idadeMinMeses: 12,
    idadeMaxMeses: 72,
    validadoEspecialista: false,
    validadoPor: null,
    validadoEm: null,
    versao: 1,
  },
  {
    id: 'primeiros_dias',
    area: 'desfralde',
    secao: 'primeiros_dias',
    ordemSugerida: 2,
    titulo: 'Os primeiros dias',
    corpoMd:
      'Os primeiros dias costumam ter mais idas ao banheiro e mais escapes — isso faz parte do processo, não é um sinal de que algo está errado. Levar no horário combinado ajuda a criar o hábito, mesmo que a criança ainda não peça por conta própria.',
    idadeMinMeses: 12,
    idadeMaxMeses: 72,
    validadoEspecialista: false,
    validadoPor: null,
    validadoEm: null,
    versao: 1,
  },
  {
    id: 'dia_a_dia',
    area: 'desfralde',
    secao: 'dia_a_dia',
    ordemSugerida: 3,
    titulo: 'Dia a dia',
    corpoMd:
      'Com a rotina andando, os horários combinados em casa tendem a precisar de menos lembrete. Observar os padrões no painel ajuda a ajustar os horários — sem comparar com outras crianças, só olhando pro que funciona pra essa família.',
    idadeMinMeses: 12,
    idadeMaxMeses: 72,
    validadoEspecialista: false,
    validadoPor: null,
    validadoEm: null,
    versao: 1,
  },
  {
    id: 'passeios_escola',
    area: 'desfralde',
    secao: 'passeios_escola',
    ordemSugerida: 4,
    titulo: 'Passeios e escola',
    corpoMd:
      'Fora de casa, vale levar uma troca de roupa e combinar com a escola ou com quem cuida quais são os horários e as palavras da família. O resumo compartilhável (seção de relatórios) ajuda a passar essa informação sem precisar explicar tudo de novo.',
    idadeMinMeses: 12,
    idadeMaxMeses: 72,
    validadoEspecialista: false,
    validadoPor: null,
    validadoEm: null,
    versao: 1,
  },
  {
    id: 'noite',
    area: 'desfralde',
    secao: 'noite',
    ordemSugerida: 5,
    titulo: 'A noite',
    corpoMd:
      'A fase da noite costuma vir depois do dia já estar mais estável, e pode levar mais tempo — isso é esperado. Noites molhadas fazem parte do caminho; o que ajuda é olhar a evolução ao longo das semanas, não cada noite isolada.',
    idadeMinMeses: 18,
    idadeMaxMeses: 72,
    validadoEspecialista: false,
    validadoPor: null,
    validadoEm: null,
    versao: 1,
  },
  {
    id: 'recaidas_escapes',
    area: 'desfralde',
    secao: 'recaidas_escapes',
    ordemSugerida: 6,
    titulo: 'Recaídas e escapes',
    corpoMd:
      'Escapes fazem parte do processo, em qualquer fase. Uma fase que parecia encaminhada pode voltar atrás por um tempo — mudança de rotina, uma novidade em casa — e isso não anula o que já foi conquistado. Pausar quando a família precisar também é uma opção, sem culpa.',
    idadeMinMeses: 12,
    idadeMaxMeses: 72,
    validadoEspecialista: false,
    validadoPor: null,
    validadoEm: null,
    versao: 1,
  },
  {
    id: 'pediatra',
    area: 'desfralde',
    secao: 'pediatra',
    ordemSugerida: 7,
    titulo: 'Quando conversar com o pediatra',
    corpoMd:
      'A Âmi não faz diagnóstico nem avalia se algo está errado. Se a família tiver dúvida sobre o ritmo do desfralde ou notar algo que preocupe, o caminho é conversar com o pediatra — ele é quem pode avaliar a situação da criança de verdade.',
    idadeMinMeses: null,
    idadeMaxMeses: null,
    validadoEspecialista: false,
    validadoPor: null,
    validadoEm: null,
    versao: 1,
  },
];
