/** Modelo de dados do currículo e conteúdo de exemplo. */

/** Gera um id único para os itens de lista (formações, experiências, etc.). */
export function novoId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const CURRICULO_VAZIO = {
  dados: {
    nome: '',
    cargo: '',
    email: '',
    telefone: '',
    cidade: '',
    estado: '',
    linkedin: '',
  },
  objetivo: '',
  formacoes: [],
  experiencias: [],
  cursos: [],
  habilidades: [],
  idiomas: [],
}

/**
 * Currículo de exemplo, carregado pelo botão "Preencher com exemplo".
 * Serve como referência de redação: verbos de ação, resultados com números e
 * experiências que não são emprego formal.
 */
export const CURRICULO_EXEMPLO = {
  dados: {
    nome: 'Ana Beatriz Souza',
    cargo: 'Jovem Aprendiz Administrativo',
    email: 'ana.souza@email.com',
    telefone: '(11) 98888-7777',
    cidade: 'São Paulo',
    estado: 'SP',
    linkedin: 'linkedin.com/in/anabeatrizsouza',
  },
  objetivo:
    'Estudante do 3º ano do Ensino Médio buscando a primeira oportunidade como Jovem Aprendiz na área administrativa. Tenho facilidade com organização, Excel e atendimento ao público, e quero aprender na prática as rotinas de um escritório.',
  formacoes: [
    {
      id: 'f1',
      curso: 'Ensino Médio',
      instituicao: 'E.E. Prof. Carlos Alberto Ferreira',
      inicio: '2024',
      fim: '2026',
      situacao: 'Cursando',
    },
  ],
  experiencias: [
    {
      id: 'e1',
      cargo: 'Auxiliar no comércio da família',
      empresa: 'Mercearia Souza',
      inicio: 'jan/2025',
      fim: '',
      atual: true,
      descricao:
        'Atendo cerca de 30 clientes por dia, organizo o controle de estoque em planilha e faço o fechamento do caixa três vezes por semana.',
    },
    {
      id: 'e2',
      cargo: 'Voluntária em projeto social',
      empresa: 'Projeto Ler é Crescer',
      inicio: 'mar/2024',
      fim: 'dez/2024',
      atual: false,
      descricao:
        'Apoiei oficinas de leitura para 20 crianças aos sábados, organizei o material didático e ajudei no controle de frequência.',
    },
  ],
  cursos: [
    {
      id: 'c1',
      nome: 'Informática Básica e Pacote Office',
      instituicao: 'Fundação Bradesco',
      cargaHoraria: '20',
      ano: '2025',
    },
    {
      id: 'c2',
      nome: 'Rotinas Administrativas',
      instituicao: 'Fundação Bradesco',
      cargaHoraria: '18',
      ano: '2025',
    },
    {
      id: 'c3',
      nome: 'Comunicação e Oratória',
      instituicao: 'Fundação Bradesco',
      cargaHoraria: '14',
      ano: '2026',
    },
  ],
  habilidades: [
    'Excel intermediário',
    'Pacote Office',
    'Atendimento ao cliente',
    'Organização e rotina administrativa',
    'Trabalho em equipe',
    'Comunicação escrita',
  ],
  idiomas: [
    { id: 'i1', idioma: 'Português', nivel: 'Nativo' },
    { id: 'i2', idioma: 'Inglês', nivel: 'Básico' },
  ],
}

export const SITUACOES_FORMACAO = ['Cursando', 'Concluído', 'Trancado', 'Incompleto']

export const NIVEIS_IDIOMA = ['Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo']

/** Sugestões clicáveis para o campo de habilidades. */
export const HABILIDADES_SUGERIDAS = [
  'Pacote Office',
  'Excel intermediário',
  'Atendimento ao cliente',
  'Comunicação',
  'Trabalho em equipe',
  'Organização',
  'Proatividade',
  'Digitação rápida',
  'Redes sociais',
  'Inglês básico',
  'Rotinas administrativas',
  'Controle de estoque',
]

/**
 * Percentual de preenchimento do currículo.
 * Usado na barra de progresso para incentivar o usuário a completar tudo.
 */
export function calcularCompletude(curriculo) {
  const criterios = [
    Boolean(curriculo.dados.nome.trim()),
    Boolean(curriculo.dados.cargo.trim()),
    Boolean(curriculo.dados.email.trim()),
    Boolean(curriculo.dados.telefone.trim()),
    Boolean(curriculo.dados.cidade.trim()),
    curriculo.objetivo.trim().length >= 40,
    curriculo.formacoes.length > 0,
    curriculo.experiencias.length > 0,
    curriculo.cursos.length > 0,
    curriculo.habilidades.length >= 3,
  ]

  const atendidos = criterios.filter(Boolean).length
  return Math.round((atendidos / criterios.length) * 100)
}
