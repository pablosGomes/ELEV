/**
 * Teste vocacional do ELEV.
 *
 * Modelo: escala Likert de 1 a 5. Cada afirmação tem afinidade com uma das
 * áreas de `data/areas.js`. A pontuação final de cada área é a soma das
 * respostas daquela área normalizada em porcentagem, o que permite comparar
 * áreas mesmo que elas tenham quantidades diferentes de perguntas.
 *
 * O teste é orientativo — serve para abrir caminhos, não para fechar portas.
 */

export const ESCALA = [
  { valor: 1, rotulo: 'Discordo totalmente', curto: 'Nada a ver' },
  { valor: 2, rotulo: 'Discordo', curto: 'Pouco' },
  { valor: 3, rotulo: 'Mais ou menos', curto: 'Neutro' },
  { valor: 4, rotulo: 'Concordo', curto: 'Bastante' },
  { valor: 5, rotulo: 'Concordo totalmente', curto: 'Total' },
]

export const PERGUNTAS = [
  // Tecnologia
  {
    id: 1,
    area: 'tecnologia',
    texto:
      'Quando um aparelho ou aplicativo dá problema, eu gosto de tentar descobrir a causa sozinho.',
  },
  {
    id: 2,
    area: 'tecnologia',
    texto: 'Tenho facilidade em aprender a usar programas e ferramentas novas.',
  },
  {
    id: 3,
    area: 'tecnologia',
    texto: 'Me interesso por como sites, jogos e aplicativos são feitos por dentro.',
  },

  // Saúde
  {
    id: 4,
    area: 'saude',
    texto: 'Me sinto bem quando consigo cuidar de alguém que está passando por dificuldade.',
  },
  {
    id: 5,
    area: 'saude',
    texto: 'Tenho paciência para seguir procedimentos e rotinas com muito cuidado.',
  },
  {
    id: 6,
    area: 'saude',
    texto: 'Tenho curiosidade sobre como o corpo humano funciona e como prevenir doenças.',
  },

  // Negócios
  {
    id: 7,
    area: 'negocios',
    texto: 'Gosto de organizar tarefas, prazos e planilhas para que tudo saia no lugar certo.',
  },
  {
    id: 8,
    area: 'negocios',
    texto: 'Me sinto confortável negociando, convencendo ou vendendo uma ideia.',
  },
  {
    id: 9,
    area: 'negocios',
    texto: 'Tenho interesse em entender como uma empresa ganha e controla dinheiro.',
  },

  // Comunicação
  {
    id: 10,
    area: 'comunicacao',
    texto: 'Costumo ter ideias criativas e gosto de colocá-las em prática.',
  },
  {
    id: 11,
    area: 'comunicacao',
    texto: 'Escrever textos, gravar vídeos ou criar posts é algo que me dá prazer.',
  },
  {
    id: 12,
    area: 'comunicacao',
    texto: 'Reparo em detalhes visuais: cores, layout, tipografia e estética das coisas.',
  },

  // Educação
  {
    id: 13,
    area: 'educacao',
    texto: 'Gosto de explicar assuntos para outras pessoas até elas entenderem de verdade.',
  },
  {
    id: 14,
    area: 'educacao',
    texto: 'Me incomodo com desigualdade e gostaria de fazer algo para mudar isso.',
  },
  {
    id: 15,
    area: 'educacao',
    texto:
      'Me realizo mais vendo alguém evoluir do que recebendo elogio pelo meu próprio trabalho.',
  },

  // Indústria
  {
    id: 16,
    area: 'industria',
    texto: 'Prefiro trabalhos práticos, em que eu coloco a mão na massa, do que só teoria.',
  },
  {
    id: 17,
    area: 'industria',
    texto: 'Tenho curiosidade em desmontar, consertar ou entender como as máquinas funcionam.',
  },
  {
    id: 18,
    area: 'industria',
    texto: 'Sou cuidadoso com segurança, precisão e com seguir as regras de um procedimento.',
  },
]

/**
 * Calcula o resultado do teste.
 *
 * @param {Record<number, number>} respostas mapa `idDaPergunta -> valor (1..5)`
 * @returns {Array<{area: string, pontos: number, percentual: number}>}
 *          áreas ordenadas da maior para a menor afinidade
 */
export function calcularResultado(respostas) {
  const acumulado = {}

  for (const pergunta of PERGUNTAS) {
    const valor = respostas[pergunta.id]
    if (!valor) continue

    if (!acumulado[pergunta.area]) {
      acumulado[pergunta.area] = { soma: 0, maximo: 0 }
    }
    acumulado[pergunta.area].soma += valor
    acumulado[pergunta.area].maximo += ESCALA.length
  }

  return Object.entries(acumulado)
    .map(([area, { soma, maximo }]) => {
      // Normaliza de [1..5] para [0..100]: a nota mínima possível é 1 por
      // pergunta, então descontamos esse piso antes de calcular a porcentagem.
      const piso = maximo / ESCALA.length
      const percentual = Math.round(((soma - piso) / (maximo - piso)) * 100)

      return { area, pontos: soma, percentual: Math.max(0, Math.min(100, percentual)) }
    })
    .sort((a, b) => b.percentual - a.percentual || a.area.localeCompare(b.area))
}

/** Mensagem de leitura do resultado, conforme a distância entre 1º e 2º lugar. */
export function interpretarResultado(ranking) {
  if (ranking.length < 2) return ''

  const diferenca = ranking[0].percentual - ranking[1].percentual

  if (diferenca >= 20) {
    return 'Seu perfil apontou para uma área com bastante clareza. Vale começar por ela e testar na prática com um curso gratuito curto.'
  }
  if (diferenca >= 8) {
    return 'Você tem uma área principal, mas a segunda ficou perto. Carreiras que combinam as duas costumam ser um ótimo caminho.'
  }
  return 'Suas respostas ficaram equilibradas entre várias áreas — o que é totalmente normal nesta fase. Experimente um curso curto de cada uma das três primeiras antes de decidir.'
}
