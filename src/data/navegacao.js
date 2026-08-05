/**
 * Abas do site.
 *
 * Fonte única da navegação: o menu, o rodapé e os cards de acesso rápido da
 * página inicial leem tudo daqui. Adicionar uma aba nova é adicionar um item
 * nesta lista (e a rota correspondente em `App.jsx`).
 */

export const ABAS = [
  {
    para: '/sobre',
    rotulo: 'Sobre o Projeto',
    rotuloCurto: 'Sobre',
    icone: 'Users',
    descricao: 'Conheça o ELEV, seus objetivos e a equipe por trás do projeto.',
    chamada: 'Conhecer o projeto',
  },
  {
    para: '/cursos',
    rotulo: 'Cursos Gratuitos',
    rotuloCurto: 'Cursos',
    icone: 'BookOpen',
    descricao: 'Cursos gratuitos com certificado, organizados por área profissional.',
    chamada: 'Ver cursos',
  },
  {
    para: '/teste-vocacional',
    rotulo: 'Teste Vocacional',
    rotuloCurto: 'Vocacional',
    icone: 'Compass',
    descricao: 'Responda 18 perguntas e descubra quais áreas combinam com o seu perfil.',
    chamada: 'Fazer o teste',
  },
  {
    para: '/curriculo',
    rotulo: 'Criar Currículo',
    rotuloCurto: 'Currículo',
    icone: 'FileText',
    descricao: 'Preencha seus dados e baixe um currículo pronto em PDF, de graça.',
    chamada: 'Criar currículo',
  },
  {
    para: '/vagas',
    rotulo: 'Vagas',
    rotuloCurto: 'Vagas',
    icone: 'Briefcase',
    descricao: 'Vagas de Jovem Aprendiz com requisitos e como se candidatar.',
    chamada: 'Buscar vagas',
  },
  {
    para: '/dicas',
    rotulo: 'Dicas e Vídeo-Aulas',
    rotuloCurto: 'Dicas',
    icone: 'Lightbulb',
    descricao: 'Como montar currículo, evitar erros comuns e mandar bem na entrevista.',
    chamada: 'Ler as dicas',
  },
]
