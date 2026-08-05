/**
 * Camada de IA do ELEV — Mistral.
 *
 * Arquivos com `_` no início não viram rota na Vercel: este é só código
 * compartilhado, usado hoje por `/api/combinar`.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * O que a IA faz aqui — e o que ela NÃO faz
 * ────────────────────────────────────────────────────────────────────────────
 * Ela NÃO descobre vagas. Um modelo de linguagem não tem índice de ofertas em
 * tempo real; se perguntássemos "liste vagas de Jovem Aprendiz hoje", ele
 * inventaria — pior que dado nenhum, porque pareceria verdadeiro. As vagas vêm
 * de uma API real (Jooble) ou, sem ela, dos exemplos de `src/data/vagas.js`.
 *
 * Ela faz duas coisas que código comum não faria bem:
 *
 *   1. ORGANIZAR (no build) — o anúncio chega como um parágrafo de texto
 *      corrido. O modelo separa em requisitos, atividades, benefícios,
 *      escolaridade e faixa etária, classifica a área pelo conteúdo do
 *      trabalho e descarta o que não é aprendizagem de verdade.
 *
 *   2. RECOMENDAR (sob demanda) — lê o perfil do jovem (teste vocacional +
 *      currículo) e escolhe, entre as vagas existentes, as que combinam.
 *
 * A regra que atravessa os dois prompts: extrair, nunca inventar. Campo que
 * não está no anúncio fica vazio.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Por que Mistral
 * ────────────────────────────────────────────────────────────────────────────
 * Tem free tier sem cartão de crédito, o que mantém o projeto sem custo.
 * A contrapartida são limites de requisição por minuto — daí o tratamento
 * explícito de HTTP 429 mais abaixo.
 */

import { Mistral } from '@mistralai/mistralai'

import { AREAS } from '../src/data/areas.js'

/**
 * Modelo usado.
 *
 * A Mistral publica IDs datados e os aposenta de tempos em tempos, sem alias
 * do tipo `-latest`. Por isso o valor é sobrescrevível por variável de
 * ambiente: se este ID for aposentado, dá para trocar em Settings > Environment
 * Variables, sem mexer no código nem fazer um commit.
 */
export const MODELO = process.env.MISTRAL_MODEL || 'mistral-small-4-0-26-03'

/** Cliente Mistral, ou `null` quando a chave não está configurada. */
export function criarCliente() {
  if (!process.env.MISTRAL_API_KEY) return null
  return new Mistral({ apiKey: process.env.MISTRAL_API_KEY })
}

const IDS_DE_AREA = AREAS.map((area) => area.id)

/* ==========================================================================
   1. Organização dos anúncios (executado no build)
   ========================================================================== */

const ESQUEMA_ORGANIZACAO = {
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
              'true apenas se for programa de aprendizagem. Estágio, trainee e CLT júnior são false.',
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
          descricao: { type: 'string', description: 'Resumo de 1 a 2 frases, em português.' },
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

const INSTRUCOES_ORGANIZACAO = `Você organiza anúncios de vaga para o ELEV, um site gratuito que ajuda jovens brasileiros a conseguir o primeiro emprego.

Você recebe anúncios em texto corrido e devolve os mesmos anúncios com os campos separados.

REGRA MAIS IMPORTANTE: extraia, nunca invente.
- Só preencha um campo se a informação estiver no texto do anúncio.
- Se não estiver, devolva string vazia (ou lista vazia). Vazio é a resposta correta — não tente adivinhar salário, benefício ou requisito "provável".
- Não reescreva fatos: se o anúncio diz "R$ 1.100", não escreva "cerca de mil reais".
- Quem vai ler é um adolescente procurando o primeiro emprego. Um benefício inventado faz alguém perder uma manhã de ônibus.

Sobre "ehAprendiz": true só para programas de aprendizagem (Jovem Aprendiz, Menor Aprendiz, Aprendiz Legal, aprendizagem industrial). Estágio, trainee, temporário e CLT júnior são false, mesmo que aceitem quem não tem experiência.

Sobre "area": classifique pelo conteúdo do trabalho, não só pelo título.
${AREAS.map((a) => `- ${a.id}: ${a.nome} — ${a.descricao}`).join('\n')}

Sobre as listas (requisitos, atividades, beneficios): itens curtos, no máximo 5 de cada, em português claro e direto, sem acrescentar nada que o anúncio não diga. O que se exige do candidato é requisito; o que ele vai fazer é atividade.

Responda apenas com o JSON, sem texto em volta e sem blocos de código.`

/**
 * Organiza um lote de anúncios crus.
 *
 * @param {Mistral} cliente
 * @param {Array<{id: string, titulo: string, empresa: string, local: string, texto: string}>} lote
 * @returns {Promise<Array>} anúncios com os campos separados
 */
export async function organizarLote(cliente, lote) {
  const bruto = await conversar(
    cliente,
    INSTRUCOES_ORGANIZACAO,
    `Organize os anúncios abaixo.\n\n${JSON.stringify(lote, null, 2)}`,
    { nome: 'vagas_organizadas', esquema: ESQUEMA_ORGANIZACAO },
  )

  const idsValidos = new Set(lote.map((item) => item.id))

  return (Array.isArray(bruto?.vagas) ? bruto.vagas : []).filter(
    (vaga) => vaga && typeof vaga.id === 'string' && idsValidos.has(vaga.id),
  )
}

/* ==========================================================================
   2. Esquema e instruções da recomendação
   ========================================================================== */

const ESQUEMA_RECOMENDACAO = {
  type: 'object',
  properties: {
    resumo: {
      type: 'string',
      description:
        'Duas ou três frases falando diretamente com o jovem sobre o perfil dele e por onde começar.',
    },
    recomendacoes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          vagaId: { type: 'string', description: 'O id exato de uma das vagas recebidas.' },
          pontuacao: {
            type: 'string',
            enum: ['alta', 'media', 'baixa'],
            description: 'Quanto a vaga combina com o perfil.',
          },
          motivo: {
            type: 'string',
            description: 'Uma frase, em segunda pessoa, dizendo por que essa vaga combina com ele.',
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
  },
  required: ['resumo', 'recomendacoes'],
  additionalProperties: false,
}

const INSTRUCOES = `Você orienta jovens brasileiros que estão buscando o primeiro emprego, no site gratuito ELEV.

Você recebe o perfil de um jovem (resultado do teste vocacional e, quando ele preencheu, o currículo) e uma lista de vagas de Jovem Aprendiz. Devolva as que mais combinam com ele.

Como escolher:
- No máximo 4 vagas, da que mais combina para a que menos combina. Melhor indicar 2 boas do que 4 forçadas.
- Considere a área de maior afinidade, mas não só ela: habilidades, cursos concluídos e cidade também pesam. Uma vaga de outra área cujos requisitos ele já cumpre pode combinar mais que uma da área "certa" que exige o que ele não tem.
- Não indique uma vaga só porque sobrou espaço na lista.
- Use exatamente os ids que vieram na lista de vagas. Nunca invente um id.

Como escrever:
- Fale com o jovem, em segunda pessoa ("você já fez o curso de Excel"), em português do Brasil.
- Seja concreto e cite o que está no perfil dele. "Combina com seu perfil" não ajuda ninguém; "você já concluiu dois cursos de rotinas administrativas, que é exatamente o que essa vaga pede" ajuda.
- Em "oQuePreparar", aponte só lacunas que dá para resolver — um curso gratuito, um dado faltando no currículo. Nunca liste algo que ele não pode mudar, e nunca desencoraje: quem está lendo isso já tem medo suficiente de não ser bom o bastante. Se não houver lacuna relevante, devolva lista vazia.
- Nada de inventar requisito que não está na vaga nem qualificação que não está no perfil.

Responda apenas com o JSON, sem texto em volta e sem blocos de código.`

/* ==========================================================================
   Leitura e validação da resposta
   ========================================================================== */

/**
 * Extrai o texto da resposta.
 *
 * O campo `content` pode vir como string ou como lista de blocos, dependendo
 * do modelo — daí os dois caminhos.
 */
function extrairTexto(resultado) {
  const conteudo = resultado?.choices?.[0]?.message?.content

  if (typeof conteudo === 'string') return conteudo

  if (Array.isArray(conteudo)) {
    return conteudo
      .map((bloco) => (typeof bloco === 'string' ? bloco : (bloco?.text ?? '')))
      .join('')
  }

  return ''
}

/**
 * Converte o texto em JSON.
 *
 * Em modo `json_object` (o plano B) o modelo às vezes embrulha a resposta em
 * um bloco de código markdown, mesmo instruído a não fazer isso. Em vez de
 * confiar, recortamos do primeiro `{` ao último `}`.
 */
function lerJson(texto) {
  const limpo = texto
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim()
  const inicio = limpo.indexOf('{')
  const fim = limpo.lastIndexOf('}')

  if (inicio === -1 || fim === -1) {
    throw new Error('A resposta do modelo não continha JSON.')
  }

  return JSON.parse(limpo.slice(inicio, fim + 1))
}

const PONTUACOES = new Set(['alta', 'media', 'baixa'])

/** Normaliza uma lista de strings vinda do modelo, descartando o resto. */
function listaDeTextos(valor, maximo) {
  if (!Array.isArray(valor)) return []
  return valor
    .filter((item) => typeof item === 'string' && item.trim())
    .slice(0, maximo)
    .map((item) => item.trim())
}

/**
 * Valida a resposta do modelo antes de devolvê-la.
 *
 * O `json_schema` da Mistral já força bastante o formato, mas resposta de
 * modelo é entrada não confiável como qualquer outra: uma recomendação com id
 * inventado ou sem motivo quebraria a tela do usuário. Aqui, o que não passa
 * é descartado em silêncio em vez de derrubar a requisição inteira.
 *
 * @param {object} bruto JSON já parseado
 * @param {Set<string>} idsValidos ids das vagas que foram enviadas ao modelo
 */
function validar(bruto, idsValidos) {
  const recomendacoes = Array.isArray(bruto?.recomendacoes) ? bruto.recomendacoes : []

  const limpas = recomendacoes
    .filter(
      (item) =>
        item &&
        typeof item.vagaId === 'string' &&
        idsValidos.has(item.vagaId) &&
        typeof item.motivo === 'string' &&
        item.motivo.trim().length > 0,
    )
    .slice(0, 4)
    .map((item) => ({
      vagaId: item.vagaId,
      pontuacao: PONTUACOES.has(item.pontuacao) ? item.pontuacao : 'media',
      motivo: item.motivo.trim(),
      pontosFortes: listaDeTextos(item.pontosFortes, 3),
      oQuePreparar: listaDeTextos(item.oQuePreparar, 2),
    }))

  // Um id repetido renderizaria duas vezes a mesma vaga.
  const vistos = new Set()
  const semRepetidas = limpas.filter((item) => {
    if (vistos.has(item.vagaId)) return false
    vistos.add(item.vagaId)
    return true
  })

  return {
    resumo: typeof bruto?.resumo === 'string' ? bruto.resumo.trim() : '',
    recomendacoes: semRepetidas,
  }
}

/* ==========================================================================
   Chamada
   ========================================================================== */

/** `true` quando o erro é limite de requisições do free tier. */
export function ehLimiteDeUso(erro) {
  return (
    erro?.statusCode === 429 || erro?.status === 429 || /429|rate limit/i.test(erro?.message ?? '')
  )
}

/**
 * Faz uma chamada ao modelo esperando JSON de volta.
 *
 * Usada pelas duas tarefas (organizar e recomendar), com o mesmo tratamento
 * de formato e de erro.
 *
 * @param {Mistral} cliente
 * @param {string} sistema instruções
 * @param {string} usuario conteúdo da pergunta
 * @param {{nome: string, esquema: object}} formato JSON schema esperado
 * @returns {Promise<object>} JSON já parseado (ainda não validado)
 */
async function conversar(cliente, sistema, usuario, formato) {
  // `temperature: 0` porque isto é extração estruturada, não redação criativa:
  // queremos a mesma resposta para a mesma entrada.
  const base = {
    model: MODELO,
    temperature: 0,
    messages: [
      { role: 'system', content: sistema },
      { role: 'user', content: usuario },
    ],
  }

  let resultado
  try {
    resultado = await cliente.chat.complete({
      ...base,
      responseFormat: {
        type: 'json_schema',
        jsonSchema: { name: formato.nome, schemaDefinition: formato.esquema, strict: true },
      },
    })
  } catch (erro) {
    // Limite de uso não é problema de formato: repetir em modo JSON simples
    // só gastaria a cota de novo.
    if (ehLimiteDeUso(erro)) throw erro

    // Plano B: nem todo modelo da Mistral aceita `json_schema`. O modo
    // `json_object` é aceito por todos; aí o formato passa a ser garantido
    // pelo prompt e pela validação em código, não pela API.
    resultado = await cliente.chat.complete({
      ...base,
      responseFormat: { type: 'json_object' },
    })
  }

  const texto = extrairTexto(resultado)
  if (!texto.trim()) throw new Error('O modelo devolveu uma resposta vazia.')

  return lerJson(texto)
}

/**
 * Cruza o perfil do usuário com as vagas disponíveis.
 *
 * @param {Mistral} cliente
 * @param {object} perfil teste vocacional + currículo (já recortado)
 * @param {Array} vagas vagas candidatas, já resumidas
 * @returns {Promise<{resumo: string, recomendacoes: Array}>}
 */
export async function recomendarVagas(cliente, perfil, vagas) {
  const bruto = await conversar(
    cliente,
    INSTRUCOES,
    `PERFIL DO JOVEM\n${JSON.stringify(perfil, null, 2)}\n\nVAGAS DISPONÍVEIS\n${JSON.stringify(vagas, null, 2)}`,
    { nome: 'recomendacoes_de_vagas', esquema: ESQUEMA_RECOMENDACAO },
  )

  return validar(bruto, new Set(vagas.map((vaga) => vaga.id)))
}
