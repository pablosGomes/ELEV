/**
 * Catálogo de cursos gratuitos.
 *
 * Todos os cursos abaixo são de instituições reais e o link leva para a página
 * oficial do provedor. Este arquivo é servido pela rota `/api/cursos` e também
 * funciona como fallback local quando a função serverless não está disponível
 * (por exemplo, rodando apenas `npm run dev` sem `vercel dev`).
 */

export const CURSOS = [
  // ---------------------------------------------------------------- Tecnologia
  {
    id: 'cv-logica',
    titulo: 'Lógica de Programação',
    provedor: 'Curso em Vídeo',
    area: 'tecnologia',
    cargaHoraria: 40,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'O ponto de partida de quem nunca programou. Ensina a pensar como um programador antes mesmo de escolher uma linguagem.',
    url: 'https://www.cursoemvideo.com/curso/curso-de-algoritmo/',
    tags: ['programação', 'lógica', 'primeiro curso'],
  },
  {
    id: 'dio-python',
    titulo: 'Python para Iniciantes',
    provedor: 'DIO',
    area: 'tecnologia',
    cargaHoraria: 30,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Bootcamps gratuitos com projetos práticos em Python, uma das linguagens mais pedidas em vagas de entrada.',
    url: 'https://www.dio.me/',
    tags: ['python', 'programação', 'projetos'],
  },
  {
    id: 'ev-informatica',
    titulo: 'Informática Básica e Pacote Office',
    provedor: 'Fundação Bradesco',
    area: 'tecnologia',
    cargaHoraria: 20,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Word, Excel, PowerPoint e internet. É o requisito mais citado nas vagas de Jovem Aprendiz — e é 100% gratuito.',
    url: 'https://www.ev.org.br/',
    tags: ['excel', 'office', 'informática', 'requisito comum'],
  },
  {
    id: 'cisco-redes',
    titulo: 'Fundamentos de Redes e Cibersegurança',
    provedor: 'Cisco Networking Academy',
    area: 'tecnologia',
    cargaHoraria: 30,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Trilhas gratuitas da Cisco sobre redes, segurança e infraestrutura, com certificado reconhecido pelo mercado.',
    url: 'https://www.netacad.com/',
    tags: ['redes', 'segurança', 'infraestrutura'],
  },
  {
    id: 'ms-learn',
    titulo: 'Trilhas de Tecnologia da Microsoft',
    provedor: 'Microsoft Learn',
    area: 'tecnologia',
    cargaHoraria: 25,
    nivel: 'Intermediário',
    certificado: true,
    descricao:
      'Módulos gratuitos de nuvem, dados e inteligência artificial, em português, no ritmo que você quiser.',
    url: 'https://learn.microsoft.com/pt-br/training/',
    tags: ['nuvem', 'dados', 'IA'],
  },

  // --------------------------------------------------------------------- Saúde
  {
    id: 'unasus-saude',
    titulo: 'Cursos Abertos em Saúde',
    provedor: 'UNA-SUS / Ministério da Saúde',
    area: 'saude',
    cargaHoraria: 45,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Dezenas de cursos gratuitos com certificado do SUS sobre atenção básica, vigilância e cuidado ao paciente.',
    url: 'https://www.unasus.gov.br/cursos/ofertas',
    tags: ['SUS', 'atenção básica', 'certificado oficial'],
  },
  {
    id: 'fiocruz-campus',
    titulo: 'Campus Virtual Fiocruz',
    provedor: 'Fiocruz',
    area: 'saude',
    cargaHoraria: 40,
    nivel: 'Intermediário',
    certificado: true,
    descricao:
      'Formação gratuita em saúde pública, epidemiologia e biossegurança pela maior instituição de pesquisa em saúde do país.',
    url: 'https://campusvirtual.fiocruz.br/',
    tags: ['saúde pública', 'pesquisa', 'biossegurança'],
  },
  {
    id: 'ev-primeiros-socorros',
    titulo: 'Primeiros Socorros e Segurança',
    provedor: 'Fundação Bradesco',
    area: 'saude',
    cargaHoraria: 12,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Curso curto e prático de atendimento emergencial. Diferencial em qualquer currículo, não só na área da saúde.',
    url: 'https://www.ev.org.br/',
    tags: ['primeiros socorros', 'curso rápido'],
  },
  {
    id: 'senac-saude',
    titulo: 'Cuidado com Idosos e Bem-estar',
    provedor: 'Senac EAD',
    area: 'saude',
    cargaHoraria: 24,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Introdução ao cuidado de pessoas idosas, uma das ocupações que mais cresce com o envelhecimento da população.',
    url: 'https://www.ead.senac.br/',
    tags: ['cuidador', 'idosos', 'bem-estar'],
  },

  // ------------------------------------------------------------------ Negócios
  {
    id: 'sebrae-empreender',
    titulo: 'Empreendedorismo e Gestão de Negócios',
    provedor: 'Sebrae',
    area: 'negocios',
    cargaHoraria: 20,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Como tirar uma ideia do papel, controlar as finanças e formalizar um negócio. Referência nacional em empreendedorismo.',
    url: 'https://sebrae.com.br/sites/PortalSebrae/cursosonline',
    tags: ['empreendedorismo', 'MEI', 'finanças'],
  },
  {
    id: 'ev-admin',
    titulo: 'Rotinas Administrativas',
    provedor: 'Fundação Bradesco',
    area: 'negocios',
    cargaHoraria: 18,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Organização de documentos, atendimento, arquivo e apoio a departamentos. Exatamente o dia a dia de um aprendiz administrativo.',
    url: 'https://www.ev.org.br/',
    tags: ['administrativo', 'rotinas', 'jovem aprendiz'],
  },
  {
    id: 'fgv-gratuitos',
    titulo: 'Cursos Online Gratuitos da FGV',
    provedor: 'FGV',
    area: 'negocios',
    cargaHoraria: 30,
    nivel: 'Intermediário',
    certificado: true,
    descricao:
      'Gestão, finanças, marketing e liderança pela FGV. Certificado de uma das instituições mais respeitadas do Brasil.',
    url: 'https://educacao-executiva.fgv.br/cursos/gratuitos-online',
    tags: ['gestão', 'finanças', 'FGV'],
  },
  {
    id: 'ev-financas',
    titulo: 'Educação Financeira Pessoal',
    provedor: 'Fundação Bradesco',
    area: 'negocios',
    cargaHoraria: 10,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Aprenda a controlar o próprio dinheiro antes de cuidar do de uma empresa. Essencial no primeiro salário.',
    url: 'https://www.ev.org.br/',
    tags: ['finanças', 'primeiro salário', 'curso rápido'],
  },
  {
    id: 'enap-servico-publico',
    titulo: 'Escola Virtual do Governo',
    provedor: 'Enap',
    area: 'negocios',
    cargaHoraria: 30,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Mais de 300 cursos gratuitos com certificado sobre gestão pública, atendimento, ética e produtividade.',
    url: 'https://www.escolavirtual.gov.br/',
    tags: ['gestão pública', 'certificado oficial', 'catálogo grande'],
  },

  // --------------------------------------------------------------- Comunicação
  {
    id: 'google-atelie',
    titulo: 'Fundamentos de Marketing Digital',
    provedor: 'Google Ateliê Digital',
    area: 'comunicacao',
    cargaHoraria: 40,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Curso mais conhecido de marketing digital gratuito do Brasil, com certificado do Google e do IAB Europe.',
    url: 'https://grow.google/intl/pt-BR/',
    tags: ['marketing digital', 'Google', 'certificado reconhecido'],
  },
  {
    id: 'rock-content',
    titulo: 'Marketing de Conteúdo e Redes Sociais',
    provedor: 'Rock Content University',
    area: 'comunicacao',
    cargaHoraria: 15,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Como planejar conteúdo, escrever para internet e gerenciar redes sociais de uma marca.',
    url: 'https://university.rockcontent.com/',
    tags: ['redes sociais', 'conteúdo', 'copywriting'],
  },
  {
    id: 'cv-design',
    titulo: 'Design Gráfico e Edição de Imagem',
    provedor: 'Curso em Vídeo',
    area: 'comunicacao',
    cargaHoraria: 30,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Fundamentos de composição, cor e tipografia com ferramentas gratuitas. Ideal para montar um portfólio.',
    url: 'https://www.cursoemvideo.com/',
    tags: ['design', 'portfólio', 'edição'],
  },
  {
    id: 'ev-comunicacao',
    titulo: 'Comunicação e Oratória',
    provedor: 'Fundação Bradesco',
    area: 'comunicacao',
    cargaHoraria: 14,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Falar em público, apresentar ideias e se comunicar com clareza — habilidade cobrada em toda entrevista de emprego.',
    url: 'https://www.ev.org.br/',
    tags: ['oratória', 'entrevista', 'soft skills'],
  },

  // ------------------------------------------------------------------ Educação
  {
    id: 'khan-academy',
    titulo: 'Reforço Escolar Completo',
    provedor: 'Khan Academy',
    area: 'educacao',
    cargaHoraria: 60,
    nivel: 'Iniciante',
    certificado: false,
    descricao:
      'Matemática, ciências e gramática do zero, gratuito e em português. Ótimo para se preparar para provas de seleção.',
    url: 'https://pt.khanacademy.org/',
    tags: ['reforço', 'matemática', 'processo seletivo'],
  },
  {
    id: 'terceiro-setor',
    titulo: 'Projetos Sociais e Terceiro Setor',
    provedor: 'Escola Aberta do Terceiro Setor',
    area: 'educacao',
    cargaHoraria: 20,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Como funcionam ONGs, projetos sociais e captação de recursos. Para quem quer trabalhar com impacto social.',
    url: 'https://www.escolaaberta3setor.org.br/',
    tags: ['ONG', 'impacto social', 'projetos'],
  },
  {
    id: 'ev-educacao',
    titulo: 'Auxiliar de Sala de Aula',
    provedor: 'Fundação Bradesco',
    area: 'educacao',
    cargaHoraria: 16,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Noções de desenvolvimento infantil, mediação de conflitos e apoio pedagógico para atuar em escolas e creches.',
    url: 'https://www.ev.org.br/',
    tags: ['educação infantil', 'pedagogia'],
  },
  {
    id: 'napratica-carreira',
    titulo: 'Desenvolvimento de Carreira',
    provedor: 'Na Prática (Fundação Estudar)',
    area: 'educacao',
    cargaHoraria: 12,
    nivel: 'Iniciante',
    certificado: false,
    descricao:
      'Conteúdos gratuitos sobre autoconhecimento, propósito e planejamento de carreira para jovens.',
    url: 'https://www.napratica.org.br/',
    tags: ['carreira', 'autoconhecimento', 'jovens'],
  },

  // ------------------------------------------------------------------ Indústria
  {
    id: 'senai-cursos',
    titulo: 'Cursos Técnicos e Industriais',
    provedor: 'SENAI',
    area: 'industria',
    cargaHoraria: 40,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Mecânica, elétrica, automação, logística e segurança do trabalho. A maior referência em formação industrial do país.',
    url: 'https://www.senai.br/',
    tags: ['técnico', 'indústria', 'SENAI'],
  },
  {
    id: 'ev-logistica',
    titulo: 'Logística e Controle de Estoque',
    provedor: 'Fundação Bradesco',
    area: 'industria',
    cargaHoraria: 18,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Recebimento, armazenagem, expedição e inventário. Área que contrata muito aprendiz em centros de distribuição.',
    url: 'https://www.ev.org.br/',
    tags: ['logística', 'estoque', 'jovem aprendiz'],
  },
  {
    id: 'senai-seguranca',
    titulo: 'Segurança do Trabalho (NR)',
    provedor: 'SENAI',
    area: 'industria',
    cargaHoraria: 20,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Normas regulamentadoras, uso de EPI e prevenção de acidentes — exigência formal em quase toda indústria.',
    url: 'https://www.senai.br/',
    tags: ['NR', 'EPI', 'segurança'],
  },
  {
    id: 'ifrs-eletrica',
    titulo: 'Eletricidade Básica',
    provedor: 'Rede Federal (IF)',
    area: 'industria',
    cargaHoraria: 30,
    nivel: 'Iniciante',
    certificado: true,
    descricao:
      'Circuitos, instalações prediais e manutenção elétrica pelos Institutos Federais, com certificado público gratuito.',
    url: 'https://www.gov.br/mec/pt-br',
    tags: ['elétrica', 'manutenção', 'instituto federal'],
  },
]

/** Lista de provedores distintos, ordenada — usada nos filtros. */
export const PROVEDORES = [...new Set(CURSOS.map((c) => c.provedor))].sort((a, b) =>
  a.localeCompare(b, 'pt-BR'),
)

export const NIVEIS = ['Iniciante', 'Intermediário']
