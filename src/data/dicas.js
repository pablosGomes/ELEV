/**
 * Conteúdo da aba "Dicas e Vídeo-Aulas".
 *
 * Cobre os quatro temas pedidos na documentação:
 *   - como montar um currículo
 *   - erros comuns em currículos
 *   - como se preparar para entrevistas
 *   - como conseguir o primeiro emprego
 *
 * Sobre as vídeo-aulas: cada item aceita um `youtubeId`. Enquanto ele for
 * `null`, o card abre uma busca no YouTube pelo tema (link que nunca quebra).
 * Basta preencher o `youtubeId` com o vídeo escolhido para ele passar a ser
 * exibido embutido na página.
 */

export const GUIAS = [
  {
    id: 'montar-curriculo',
    categoria: 'Currículo',
    icone: 'FileText',
    titulo: 'Como montar um currículo do zero',
    resumo:
      'Você não precisa ter experiência para ter um bom currículo. Precisa saber o que colocar no lugar dela.',
    tempoLeitura: 6,
    secoes: [
      {
        titulo: 'A estrutura que funciona',
        paragrafos: [
          'Um currículo de primeiro emprego cabe em uma página. Sempre. Recrutadores passam menos de 30 segundos na primeira leitura, então a ordem das informações importa mais do que a quantidade.',
        ],
        lista: [
          'Nome completo e o cargo que você busca, bem no topo',
          'Contato: telefone com WhatsApp, e-mail sério e cidade/estado',
          'Objetivo: duas ou três linhas dizendo o que você quer e o que oferece',
          'Formação: escola, curso e ano de conclusão (ou previsão)',
          'Cursos complementares: aqui entram os cursos gratuitos que você fez',
          'Experiências: estágios, voluntariado, trabalhos informais e projetos escolares',
          'Habilidades: idiomas, informática e competências comportamentais',
        ],
      },
      {
        titulo: 'Sem experiência? Use o que você já tem',
        paragrafos: [
          'Quase todo jovem chega achando que o campo de experiência vai ficar vazio. Ele não fica. Trabalho voluntário, ajuda no negócio da família, monitoria na escola, organização de eventos, projeto de feira de ciências, gestão de uma página nas redes sociais — tudo isso é experiência real e mostra responsabilidade.',
          'O segredo é descrever o que você fez em forma de resultado, e não de tarefa. Em vez de "ajudei na loja da família", escreva "atendi cerca de 20 clientes por dia e organizei o controle de estoque em planilha".',
        ],
      },
      {
        titulo: 'Escreva com verbos de ação',
        paragrafos: [
          'Comece cada frase de experiência com um verbo forte. Isso muda completamente a impressão que o texto passa.',
        ],
        lista: [
          'Organizei, atendi, produzi, controlei, apoiei, criei',
          'Evite: "fui responsável por", "tinha a função de", "participei de"',
          'Sempre que possível, coloque um número: quantas pessoas, quanto tempo, quantos itens',
        ],
      },
      {
        titulo: 'Antes de enviar',
        paragrafos: [
          'Revise em voz alta, peça para alguém ler e salve sempre em PDF com um nome profissional: "Curriculo-Maria-Silva.pdf". Nunca envie em .docx — a formatação quebra no computador de quem recebe.',
        ],
      },
    ],
  },
  {
    id: 'erros-curriculo',
    categoria: 'Currículo',
    icone: 'AlertTriangle',
    titulo: 'Os 10 erros que mais eliminam candidatos',
    resumo:
      'A maioria dos currículos é descartada por detalhes bobos, não por falta de qualificação.',
    tempoLeitura: 5,
    secoes: [
      {
        titulo: 'Erros de conteúdo',
        lista: [
          'E-mail informal do tipo "gatinha_2007@". Crie um com nome e sobrenome.',
          'Objetivo genérico como "busco crescer profissionalmente". Diga a vaga concreta.',
          'Currículo com mais de uma página no primeiro emprego.',
          'Mentir sobre curso, nível de idioma ou experiência. Isso sempre aparece na entrevista.',
          'Copiar e colar o mesmo currículo para todas as vagas sem adaptar uma linha sequer.',
        ],
      },
      {
        titulo: 'Erros de forma',
        lista: [
          'Erros de português. Um único erro já tira a credibilidade do documento.',
          'Foto de selfie, de festa ou com filtro. Se for usar foto, use uma neutra — ou não use.',
          'Fontes decorativas, cores berrantes e muitos negritos competindo entre si.',
          'Informações desatualizadas: telefone antigo, cidade errada, curso já concluído marcado como "cursando".',
          'Enviar em formato editável, sem PDF, com o arquivo chamado "curriculo final 2 (1).docx".',
        ],
      },
      {
        titulo: 'O teste dos 10 segundos',
        paragrafos: [
          'Peça para alguém olhar seu currículo por 10 segundos e depois fechar. Se essa pessoa não souber dizer seu nome, qual vaga você quer e a sua principal qualificação, o currículo precisa ser reorganizado — não reescrito.',
        ],
      },
    ],
  },
  {
    id: 'entrevista',
    categoria: 'Entrevista',
    icone: 'MessagesSquare',
    titulo: 'Como se preparar para a entrevista',
    resumo: 'Nervosismo não elimina ninguém. Falta de preparo, sim. E preparo é 100% treinável.',
    tempoLeitura: 7,
    secoes: [
      {
        titulo: 'Antes da entrevista',
        lista: [
          'Pesquise a empresa: o que ela faz, há quanto tempo existe, quais são os valores dela.',
          'Releia a descrição da vaga e separe um exemplo seu para cada requisito citado.',
          'Prepare uma apresentação de 1 minuto sobre você: quem é, o que estuda, o que busca.',
          'Separe a roupa na véspera. Discreta e limpa vale mais do que cara.',
          'Confirme o endereço e calcule o trajeto com 30 minutos de folga.',
          'Se for online: teste câmera, microfone e internet, e escolha um fundo neutro e bem iluminado.',
        ],
      },
      {
        titulo: 'As perguntas que sempre caem',
        lista: [
          '"Fale um pouco sobre você" — responda em formato presente, passado e futuro, em 1 minuto.',
          '"Por que você quer trabalhar aqui?" — cite algo real que você pesquisou sobre a empresa.',
          '"Qual seu ponto fraco?" — escolha um verdadeiro e diga o que você já faz para melhorá-lo.',
          '"Onde você se vê em 5 anos?" — mostre vontade de aprender e crescer dentro da área.',
          '"Você tem alguma pergunta?" — sempre tenha duas. Nunca responda "não".',
        ],
      },
      {
        titulo: 'Use a técnica STAR',
        paragrafos: [
          'Quando pedirem um exemplo prático, estruture a resposta em quatro partes. Isso evita que você se perca no meio da história.',
        ],
        lista: [
          'Situação: qual era o contexto',
          'Tarefa: o que precisava ser feito',
          'Ação: o que você fez, especificamente',
          'Resultado: o que aconteceu no final',
        ],
      },
      {
        titulo: 'Durante e depois',
        lista: [
          'Chegue 10 minutos antes, nem mais nem menos.',
          'Cumprimente todo mundo, inclusive a recepção. Isso costuma ser observado.',
          'Deixe o celular no silencioso e guardado, fora da mesa.',
          'Não fale mal de escola, professor ou trabalho anterior.',
          'Se não souber algo, diga que não sabe e que tem interesse em aprender. É melhor que inventar.',
          'Agradeça ao final e, no dia seguinte, envie uma mensagem curta de agradecimento.',
        ],
      },
    ],
  },
  {
    id: 'primeiro-emprego',
    categoria: 'Carreira',
    icone: 'Rocket',
    titulo: 'Como conseguir o primeiro emprego',
    resumo:
      'Conseguir a primeira vaga é um processo com etapas. Quem trata como sorte demora muito mais.',
    tempoLeitura: 8,
    secoes: [
      {
        titulo: 'Conheça seus direitos como aprendiz',
        paragrafos: [
          'O contrato de aprendizagem é regulado pela Lei 10.097/2000. Ele é diferente de um emprego comum e foi feito justamente para quem não tem experiência.',
        ],
        lista: [
          'Idade entre 14 e 24 anos (sem limite de idade para pessoas com deficiência)',
          'Carteira assinada, 13º salário, férias e FGTS',
          'Jornada de até 6 horas por dia, compatível com o horário escolar',
          'Parte do tempo é curso de formação, pago pela empresa',
          'Contrato de até 2 anos, e você precisa estar matriculado na escola',
        ],
      },
      {
        titulo: 'Onde procurar de verdade',
        lista: [
          'Agentes de integração: CIEE, Nube, Aprendiz Legal',
          'SENAI, Senac, Senar e Senat, que combinam curso técnico com contratação',
          'Sites de carreira das próprias empresas — muitas divulgam só lá',
          'Sine e postos de atendimento ao trabalhador da sua cidade',
          'Indicação: avise professores, vizinhos e família que você está procurando',
        ],
      },
      {
        titulo: 'Monte sua rotina de busca',
        paragrafos: [
          'Procurar emprego funciona melhor como hábito diário do que como esforço concentrado uma vez por mês. Reserve uma hora por dia.',
        ],
        lista: [
          'Candidate-se a 3 a 5 vagas por dia, sempre adaptando o objetivo do currículo',
          'Anote em uma planilha: empresa, vaga, data e situação',
          'Faça um curso gratuito por mês e adicione ao currículo assim que terminar',
          'Acompanhe as candidaturas depois de uma semana sem resposta',
        ],
      },
      {
        titulo: 'Lidando com o "não"',
        paragrafos: [
          'Você vai receber muito mais recusas do que aprovações, e isso não é um sinal sobre o seu valor — é estatística. Uma vaga de aprendiz costuma receber centenas de candidatos.',
          'O que separa quem consegue de quem desiste raramente é talento. É constância: continuar se candidatando, continuar estudando e melhorar um detalhe do currículo a cada rodada.',
        ],
      },
    ],
  },
]

export const VIDEO_AULAS = [
  {
    id: 'va-curriculo',
    titulo: 'Montando o currículo de primeiro emprego',
    descricao: 'Passo a passo prático, do cabeçalho às habilidades, para quem ainda não trabalhou.',
    tema: 'Currículo',
    youtubeId: null,
    busca: 'como fazer curriculo primeiro emprego jovem aprendiz',
  },
  {
    id: 'va-entrevista',
    titulo: 'Simulação de entrevista de emprego',
    descricao:
      'Veja uma entrevista completa comentada e entenda o que o recrutador avalia em cada resposta.',
    tema: 'Entrevista',
    youtubeId: null,
    busca: 'simulacao entrevista de emprego jovem aprendiz comentada',
  },
  {
    id: 'va-aprendiz',
    titulo: 'Como funciona o programa Jovem Aprendiz',
    descricao: 'Direitos, jornada, salário, duração do contrato e como se inscrever nos programas.',
    tema: 'Carreira',
    youtubeId: null,
    busca: 'como funciona programa jovem aprendiz direitos lei da aprendizagem',
  },
  {
    id: 'va-excel',
    titulo: 'Excel básico para quem vai trabalhar',
    descricao: 'As funções que realmente aparecem no dia a dia de um assistente administrativo.',
    tema: 'Habilidades',
    youtubeId: null,
    busca: 'curso excel basico completo para iniciantes trabalho',
  },
  {
    id: 'va-linkedin',
    titulo: 'Criando seu perfil no LinkedIn',
    descricao:
      'Como montar um perfil profissional mesmo sem experiência e ser encontrado por recrutadores.',
    tema: 'Carreira',
    youtubeId: null,
    busca: 'como criar perfil linkedin sem experiencia primeiro emprego',
  },
  {
    id: 'va-soft-skills',
    titulo: 'Comportamento profissional no trabalho',
    descricao:
      'Pontualidade, comunicação, feedback e postura: o que mais faz aprendiz ser efetivado.',
    tema: 'Habilidades',
    youtubeId: null,
    busca: 'postura profissional no trabalho primeiro emprego dicas',
  },
]

export const CATEGORIAS_GUIA = [...new Set(GUIAS.map((g) => g.categoria))]
