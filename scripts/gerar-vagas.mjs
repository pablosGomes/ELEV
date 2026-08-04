/**
 * Gera o arquivo de vagas enriquecidas — roda automaticamente antes do build.
 *
 *   npm run build   →  prebuild  →  este script  →  vite build
 *
 * Por que no build, e não a cada visita:
 *   - o custo é por deploy, não por visitante;
 *   - a página abre instantânea, sem esperar o modelo;
 *   - a chave da Anthropic nunca chega perto do navegador.
 *
 * Para atualizar as vagas, basta um novo deploy (a Vercel permite agendar
 * um redeploy diário em Settings > Git > Deploy Hooks + Cron).
 *
 * ESTE SCRIPT NUNCA DERRUBA O BUILD. Faltando chave, API fora do ar ou
 * resposta inesperada, ele grava um arquivo vazio e sai com sucesso — o site
 * então cai para as vagas de exemplo, exatamente como antes.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buscarNoJooble, normalizarSemIa } from '../api/_fonte-vagas.js'
import { MODELO, criarCliente, enriquecerLote } from '../api/_ia.js'

const AQUI = dirname(fileURLToPath(import.meta.url))

// Gravamos um módulo `.js`, não um `.json`: importar JSON em ESM exige
// atributos de importação e o suporte varia entre runtimes. Um módulo comum
// funciona em qualquer lugar — no Node do build, na função da Vercel e no Vite.
const DESTINO = join(AQUI, '..', 'src', 'data', 'vagas-geradas.js')

const CABECALHO = `/**
 * ARQUIVO GERADO AUTOMATICAMENTE — não edite à mão.
 *
 * Criado por \`scripts/gerar-vagas.mjs\`, que roda antes de cada build.
 * Para regenerar: \`npm run vagas\` (ou simplesmente \`npm run build\`).
 */

`

/** Quantas vagas por chamada ao modelo. Lotes pequenos = respostas mais fiéis. */
const TAMANHO_DO_LOTE = 5

function log(mensagem) {
  console.log(`[gerar-vagas] ${mensagem}`)
}

async function gravar(conteudo) {
  await mkdir(dirname(DESTINO), { recursive: true })
  const corpo = `export const VAGAS_GERADAS = ${JSON.stringify(conteudo, null, 2)}\n`
  await writeFile(DESTINO, CABECALHO + corpo, 'utf8')
}

/** Saída usada quando não há como gerar nada — o site cai para os exemplos. */
async function gravarVazio(motivo) {
  log(motivo)
  log('gravando arquivo vazio; o site vai usar as vagas de exemplo')
  await gravar({ geradoEm: null, fonte: 'exemplos', motivo, total: 0, vagas: [] })
}

async function principal() {
  const chaveJooble = process.env.JOOBLE_API_KEY

  if (!chaveJooble) {
    await gravarVazio('JOOBLE_API_KEY não configurada — sem fonte de vagas reais.')
    return
  }

  let brutas = []
  try {
    brutas = await buscarNoJooble(chaveJooble)
    log(`${brutas.length} anúncios recebidos do Jooble`)
  } catch (erro) {
    await gravarVazio(`Falha ao consultar o Jooble: ${erro.message}`)
    return
  }

  if (brutas.length === 0) {
    await gravarVazio('O Jooble não retornou anúncios para os filtros usados.')
    return
  }

  const cliente = criarCliente()

  // Sem chave da Anthropic o site ainda funciona com vagas reais — só que com
  // os campos que dá para extrair sem ler o anúncio (área por palavra-chave,
  // requisitos e benefícios vazios).
  if (!cliente) {
    log('ANTHROPIC_API_KEY não configurada — usando classificação por palavra-chave')
    const vagas = brutas.map(normalizarSemIa)
    await gravar({
      geradoEm: new Date().toISOString(),
      fonte: 'jooble',
      total: vagas.length,
      vagas,
    })
    log(`${vagas.length} vagas gravadas (sem enriquecimento)`)
    return
  }

  log(`enriquecendo ${brutas.length} anúncios com ${MODELO}...`)

  const lotes = []
  for (let i = 0; i < brutas.length; i += TAMANHO_DO_LOTE) {
    lotes.push(brutas.slice(i, i + TAMANHO_DO_LOTE))
  }

  const porId = new Map(brutas.map((bruta) => [bruta.id, bruta]))
  const enriquecidas = []
  let lotesComFalha = 0

  for (const [indice, lote] of lotes.entries()) {
    const entrada = lote.map((bruta) => ({
      id: bruta.id,
      titulo: bruta.titulo,
      empresa: bruta.empresa,
      local: [bruta.cidade, bruta.estado].filter(Boolean).join(', '),
      jornada: bruta.jornada,
      salario: bruta.salario,
      texto: bruta.texto,
    }))

    try {
      const resultado = await enriquecerLote(cliente, entrada)

      for (const vaga of resultado) {
        const bruta = porId.get(vaga.id)
        if (!bruta) continue

        // O modelo também é o filtro: estágio e CLT júnior chegam misturados
        // na busca por "jovem aprendiz" e são descartados aqui.
        if (!vaga.ehAprendiz) continue

        enriquecidas.push({
          ...vaga,
          ehAprendiz: undefined,
          cidade: vaga.cidade || 'Não informado',
          modalidade: vaga.modalidade || 'Presencial',
          jornada: vaga.jornada || 'A combinar',
          salario: vaga.salario || 'A combinar',
          escolaridade: vaga.escolaridade || 'Consulte o anúncio',
          idade: vaga.idade || '14 a 24 anos',
          publicadaEm: bruta.publicadaEm,
          url: bruta.url,
          exemplo: false,
        })
      }

      log(`lote ${indice + 1}/${lotes.length} concluído`)
    } catch (erro) {
      // Um lote que falha não invalida os outros: caímos para a normalização
      // sem IA nesses anúncios em vez de perdê-los.
      lotesComFalha += 1
      log(
        `lote ${indice + 1}/${lotes.length} falhou (${erro.message}) — usando normalização simples`,
      )
      enriquecidas.push(...lote.map(normalizarSemIa))
    }
  }

  if (enriquecidas.length === 0) {
    await gravarVazio('Nenhum anúncio sobreviveu ao filtro de aprendizagem.')
    return
  }

  await gravar({
    geradoEm: new Date().toISOString(),
    fonte: lotesComFalha === lotes.length ? 'jooble' : 'jooble+claude',
    modelo: MODELO,
    total: enriquecidas.length,
    descartadas: brutas.length - enriquecidas.length,
    vagas: enriquecidas.map((vaga) => {
      // `ehAprendiz: undefined` acima não some do objeto — some no JSON.stringify.
      const { ehAprendiz, ...resto } = vaga
      return resto
    }),
  })

  log(`${enriquecidas.length} vagas gravadas (${brutas.length - enriquecidas.length} descartadas)`)
}

principal().catch(async (erro) => {
  // Rede de segurança: qualquer coisa inesperada vira arquivo vazio, nunca um
  // build quebrado.
  await gravarVazio(`Erro inesperado: ${erro.message}`)
})
