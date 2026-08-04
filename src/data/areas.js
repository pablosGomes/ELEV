/**
 * Áreas profissionais do ELEV.
 *
 * Este é o vocabulário compartilhado do site: cursos, vagas e o resultado do
 * teste vocacional usam sempre estes mesmos `id`s. Isso permite, por exemplo,
 * levar o usuário direto de "sua área é Tecnologia" para os cursos e vagas
 * daquela área.
 */

export const AREAS = [
  {
    id: 'tecnologia',
    nome: 'Tecnologia e Inovação',
    nomeCurto: 'Tecnologia',
    icone: 'Code2',
    descricao:
      'Programação, dados, suporte técnico e tudo que faz a tecnologia funcionar. Uma das áreas que mais contrata jovens sem experiência.',
    carreiras: [
      'Desenvolvedor(a) de software',
      'Analista de suporte / Help desk',
      'Analista de dados',
      'Designer de interfaces (UX/UI)',
      'Técnico(a) em redes',
    ],
    caracteristicas: [
      'Gosta de resolver problemas com lógica',
      'Aprende ferramentas novas com facilidade',
      'Prefere trabalho com foco e concentração',
    ],
  },
  {
    id: 'saude',
    nome: 'Saúde e Bem-estar',
    nomeCurto: 'Saúde',
    icone: 'HeartPulse',
    descricao:
      'Cuidar de pessoas, prevenir doenças e promover qualidade de vida. Área com forte demanda e muitos cursos técnicos gratuitos.',
    carreiras: [
      'Técnico(a) em enfermagem',
      'Auxiliar de saúde bucal',
      'Técnico(a) em farmácia',
      'Cuidador(a) de idosos',
      'Nutrição e educação física',
    ],
    caracteristicas: [
      'Tem empatia e paciência com pessoas',
      'Lida bem com rotinas e protocolos',
      'Se sente útil ajudando quem precisa',
    ],
  },
  {
    id: 'negocios',
    nome: 'Negócios e Administração',
    nomeCurto: 'Negócios',
    icone: 'Briefcase',
    descricao:
      'Organizar, planejar, vender e cuidar das finanças de uma empresa. É a porta de entrada mais comum para o Jovem Aprendiz.',
    carreiras: [
      'Assistente administrativo',
      'Auxiliar financeiro',
      'Analista de RH',
      'Consultor(a) de vendas',
      'Empreendedor(a)',
    ],
    caracteristicas: [
      'Gosta de organização e planejamento',
      'Tem facilidade com números e metas',
      'Sabe negociar e conversar com pessoas',
    ],
  },
  {
    id: 'comunicacao',
    nome: 'Comunicação e Criatividade',
    nomeCurto: 'Comunicação',
    icone: 'Palette',
    descricao:
      'Criar, escrever, desenhar e contar histórias. Área que cresceu muito com o marketing digital e as redes sociais.',
    carreiras: [
      'Social media / Marketing digital',
      'Designer gráfico',
      'Produtor(a) de vídeo',
      'Redator(a) de conteúdo',
      'Fotógrafo(a)',
    ],
    caracteristicas: [
      'Tem ideias originais com facilidade',
      'Se expressa bem escrevendo ou falando',
      'Repara em detalhes visuais e estética',
    ],
  },
  {
    id: 'educacao',
    nome: 'Educação e Social',
    nomeCurto: 'Educação',
    icone: 'GraduationCap',
    descricao:
      'Ensinar, orientar e transformar comunidades. Área para quem se realiza vendo outras pessoas evoluírem.',
    carreiras: [
      'Auxiliar de sala de aula',
      'Professor(a)',
      'Educador(a) social',
      'Monitor(a) de projetos sociais',
      'Psicologia e serviço social',
    ],
    caracteristicas: [
      'Gosta de explicar coisas para os outros',
      'Se preocupa com questões sociais',
      'Tem paciência para ensinar no ritmo de cada um',
    ],
  },
  {
    id: 'industria',
    nome: 'Indústria e Serviços Técnicos',
    nomeCurto: 'Indústria',
    icone: 'Wrench',
    descricao:
      'Produzir, montar, manter e consertar. Área com salários competitivos e muita oferta de curso técnico gratuito.',
    carreiras: [
      'Técnico(a) em eletromecânica',
      'Técnico(a) em logística',
      'Eletricista predial',
      'Operador(a) de produção',
      'Técnico(a) em segurança do trabalho',
    ],
    caracteristicas: [
      'Prefere colocar a mão na massa',
      'Gosta de entender como as coisas funcionam',
      'Tem atenção à segurança e precisão',
    ],
  },
]

/** Mapa `id -> area`, para consultas rápidas. */
export const AREAS_POR_ID = Object.fromEntries(AREAS.map((area) => [area.id, area]))

/** Retorna a área pelo id, ou `undefined` se o id não existir. */
export function obterArea(id) {
  return AREAS_POR_ID[id]
}

/** Nome curto da área — usado nos chips/badges dos cards. */
export function nomeDaArea(id) {
  return AREAS_POR_ID[id]?.nomeCurto ?? 'Geral'
}
