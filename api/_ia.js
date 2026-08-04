/**
 * Camada de IA do ELEV — configuração compartilhada.
 *
 * Arquivos com `_` no início não viram rota na Vercel, então este módulo é
 * apenas código compartilhado entre a rota `/api/combinar` e o script de build
 * `scripts/gerar-vagas.mjs`.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * O que a IA faz aqui — e o que ela NÃO faz
 * ────────────────────────────────────────────────────────────────────────────
 * Um modelo de linguagem não tem índice de vagas em tempo real: ele não
 * descobre vaga nenhuma. Se perguntássemos "liste vagas de Jovem Aprendiz
 * hoje", ele inventaria — o que seria pior que dado nenhum, porque pareceria
 * verdadeiro.
 *
 * Por isso a origem das vagas continua sendo uma API real (Jooble). O Claude
 * entra em duas funções em que ele é de fato melhor que código:
 *
 *   1. ENRIQUECER (no build) — o anúncio bruto vem como um parágrafo de texto
 *      corrido. O modelo lê esse texto e separa em requisitos, atividades,
 *      benefícios, escolaridade e faixa etária, além de classificar a área e
 *      descartar o que não é aprendizagem de verdade.
 *
 *   2. RECOMENDAR (em tempo real) — cruza o resultado do teste vocacional e o
 *      currículo do usuário com as vagas disponíveis, explicando o porquê de
 *      cada indicação.
 *
 * A regra que atravessa os dois prompts: extrair, nunca inventar. Campo que
 * não está no anúncio fica vazio.
 */

import Anthropic from '@anthropic-ai/sdk'

import { AREAS } from '../src/data/areas.js'

/** Modelo usado nas duas tarefas. */
export const MODELO = 'claude-sonnet-5'

const IDS_DE_AREA = AREAS.map((area) => area.id)

/** Cliente Anthropic, ou `null` quando a chave não está configurada. */
export function criarCliente() {
  if (!process.env.ANTHROPIC_API_KEY) return null
  return new Anthropic()
}

/* ==========================================================================
   1. Enriquecimento de vagas (executado no build)
   ========================================================================== */

const ESQUEMA_ENRIQUECIMENTO = {
  type: 'object',
  properties: {
    vagas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'O mesmo id recebido na entrada.' },
          ehAprendiz: {
            type: 'boolean',
            description:
              'true apenas se o anúncio for de programa de aprendizagem (Jovem Aprendiz / Menor Aprendiz). Estágio, trainee e CLT júnior são false.',
          },
          titulo: { type: 'string' },
          empresa: { type: 'string' },
          area: { type: 'string', enum: IDS_DE_AREA },
          cidade: { type: 'string' },
          estado: { type: 'string', description: 'Sigla da UF em maiúsculas, ou string vazia.' },
          modalidade: { type: 'string', enum: ['Presencial', 'Híbrido', 'Remoto', ''] },
          jornada: { type: 'string', description: 'Ex.: "6 horas/dia". Vazio se não constar.' },
          salario: {
            type: 'string',
            description: 'Como aparece no anúncio. Vazio se não constar.',
          },
          escolaridade: { type: 'string', description: 'Vazio se não constar.' },
          idade: { type: 'string', description: 'Ex.: "16 a 22 anos". Vazio se não constar.' },
          descricao: {
            type: 'string',
            description: 'Resumo de 1 a 2 frases do que a vaga é, em português do Brasil.',
          },
          requisitos: { type: 'array', items: { type: 'string' } },
          atividades: { type: 'array', items: { type: 'string' } },
          beneficios: { type: 'array', items: { type: 'string' } },
        },
        required: [
          'id',
          'ehAprendiz',
          'titulo',
          'empresa',
          'area',
          'cidade',
          'estado',
          'modalidade',
          'jornada',
          'salario',
          'escolaridade',
          'idade',
          'descricao',
          'requisitos',
          'atividades',
          'beneficios',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['vagas'],
  additionalProperties: false,
}

const INSTRUCOES_ENRIQUECIMENTO = `Você organiza anúncios de vaga para o ELEV, um site gratuito que ajuda jovens brasileiros a conseguir o primeiro emprego.

Você recebe anúncios em texto corrido e devolve os mesmos anúncios com os campos separados.

REGRA MAIS IMPORTANTE: extraia, nunca invente.
- Só preencha um campo se a informação estiver no texto do anúncio.
- Se não estiver, devolva string vazia (ou lista vazia). Vazio é a resposta correta — não tente adivinhar salário, benefício ou requisito "provável".
- Não traduza nem reescreva fatos: se o anúncio diz "R$ 1.100", não escreva "cerca de mil reais".
- Quem vai ler é um adolescente procurando o primeiro emprego. Um benefício inventado faz alguém perder uma manhã de ônibus.

Sobre "ehAprendiz": marque true apenas para programas de aprendizagem (Jovem Aprendiz, Menor Aprendiz, Aprendiz Legal, aprendizagem industrial). Estágio, trainee, temporário e vaga CLT júnior são false, mesmo que aceitem quem não tem experiência.

Sobre "area": classifique pelo conteúdo do trabalho, não só pelo título.
${AREAS.map((a) => `- ${a.id}: ${a.nome} — ${a.descricao}`).join('\n')}

Sobre as listas (requisitos, atividades, beneficios): itens curtos, um por linha, no máximo 5 de cada. Reescreva em português claro e direto, mas sem acrescentar nada que o anúncio não diga. Se o anúncio não separa requisitos de atividades, use o julgamento — o que se exige do candidato é requisito, o que ele vai fazer é atividade.`

/**
 * Enriquece um lote de vagas cruas com o Claude.
 *
 * @param {Anthropic} cliente
 * @param {Array<{id: string, titulo: string, empresa: string, local: string, texto: string}>} lote
 * @returns {Promise<Array>} vagas com os campos separados
 */
export async function enriquecerLote(cliente, lote) {
  const resposta = await cliente.messages.create({
    model: MODELO,
    max_tokens: 8000,
    system: INSTRUCOES_ENRIQUECIMENTO,
    // `medium` já basta: a tarefa é extração de campos, não raciocínio aberto.
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema: ESQUEMA_ENRIQUECIMENTO },
    },
    messages: [
      {
        role: 'user',
        content: `Organize os anúncios abaixo.\n\n${JSON.stringify(lote, null, 2)}`,
      },
    ],
  })

  if (resposta.stop_reason === 'refusal') {
    throw new Error('O modelo recusou o conteúdo do lote.')
  }

  const texto = resposta.content.find((bloco) => bloco.type === 'text')?.text
  if (!texto) throw new Error('Resposta sem conteúdo de texto.')

  return JSON.parse(texto).vagas
}

/* ==========================================================================
   2. Recomendação personalizada (executado sob demanda)
   ========================================================================== */

const ESQUEMA_RECOMENDACAO = {
  type: 'object',
  properties: {
    recomendacoes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          vagaId: { type: 'string' },
          pontuacao: {
            type: 'string',
            enum: ['alta', 'media', 'baixa'],
            description: 'Quanto a vaga combina com o perfil.',
          },
          motivo: {
            type: 'string',
            description:
              'Uma frase, falando com o jovem em segunda pessoa, dizendo por que essa vaga combina com ele.',
          },
          pontosFortes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Até 3 coisas do perfil que atendem a vaga. Itens curtos.',
          },
          oQuePreparar: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Até 2 lacunas concretas e contornáveis, escritas como próximo passo. Lista vazia se não houver.',
          },
        },
        required: ['vagaId', 'pontuacao', 'motivo', 'pontosFortes', 'oQuePreparar'],
        additionalProperties: false,
      },
    },
    resumo: {
      type: 'string',
      description:
        'Duas ou três frases falando diretamente com o jovem sobre o perfil dele e por onde começar.',
    },
  },
  required: ['recomendacoes', 'resumo'],
  additionalProperties: false,
}

const INSTRUCOES_RECOMENDACAO = `Você orienta jovens brasileiros que estão buscando o primeiro emprego, no site gratuito ELEV.

Você recebe o perfil de um jovem (resultado do teste vocacional e, quando ele preencheu, o currículo) e uma lista de vagas de Jovem Aprendiz. Devolva as que mais combinam com ele.

Como escolher:
- Selecione no máximo 4 vagas, da que mais combina para a que menos combina. É melhor indicar 2 boas do que 4 forçadas.
- Considere a área de maior afinidade, mas não só ela: habilidades, cursos concluídos e cidade também pesam. Uma vaga de outra área com requisitos que ele já cumpre pode combinar mais que uma da área "certa" que exige o que ele não tem.
- Não indique uma vaga só porque sobrou espaço na lista.

Como escrever:
- Fale com o jovem, em segunda pessoa ("você já fez o curso de Excel"), em português do Brasil.
- Seja concreto e cite o que está no perfil dele. "Combina com seu perfil" não ajuda ninguém; "você já concluiu dois cursos de rotinas administrativas, que é exatamente o que essa vaga pede" ajuda.
- Em "oQuePreparar", aponte só lacunas que dá para resolver — um curso gratuito, um dado faltando no currículo. Nunca liste algo que ele não pode mudar, e nunca desencoraje: quem está lendo isso já tem medo suficiente de não ser bom o bastante. Se não houver lacuna relevante, devolva lista vazia.
- Nada de inventar requisito que não está na vaga nem qualificação que não está no perfil.`

/**
 * Cruza o perfil do usuário com as vagas disponíveis.
 *
 * @param {Anthropic} cliente
 * @param {object} perfil resultado do teste vocacional + currículo (opcional)
 * @param {Array} vagas vagas candidatas, já resumidas
 */
export async function recomendarVagas(cliente, perfil, vagas) {
  const resposta = await cliente.messages.create({
    model: MODELO,
    max_tokens: 4000,
    system: INSTRUCOES_RECOMENDACAO,
    output_config: {
      format: { type: 'json_schema', schema: ESQUEMA_RECOMENDACAO },
    },
    messages: [
      {
        role: 'user',
        content: `PERFIL DO JOVEM\n${JSON.stringify(perfil, null, 2)}\n\nVAGAS DISPONÍVEIS\n${JSON.stringify(vagas, null, 2)}`,
      },
    ],
  })

  if (resposta.stop_reason === 'refusal') {
    throw new Error('O modelo recusou a solicitação.')
  }

  const texto = resposta.content.find((bloco) => bloco.type === 'text')?.text
  if (!texto) throw new Error('Resposta sem conteúdo de texto.')

  return JSON.parse(texto)
}
