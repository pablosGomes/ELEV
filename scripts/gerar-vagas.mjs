/**
 * Gera o arquivo de vagas — roda automaticamente antes do build.
 *
 *   npm run build  →  prebuild  →  este script  →  vite build
 *
 * Por que no build, e não a cada visita:
 *   - o custo (de cota, não de dinheiro) é por deploy, não por visitante;
 *   - a página abre instantânea, sem esperar o modelo;
 *   - as chaves nunca chegam perto do navegador.
 *
 * Para atualizar as vagas, basta um novo deploy. Na Vercel dá para agendar um
 * redeploy diário em Settings > Git > Deploy Hooks.
 *
 * ESTE SCRIPT NUNCA DERRUBA O BUILD. Faltando chave, API fora do ar ou
 * resposta inesperada, ele grava um arquivo vazio e sai com sucesso — o site
 * então cai para as vagas de exemplo, que é o comportamento de antes.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buscarNoJooble, normalizarSemIa } from '../api/_fonte-vagas.js'
import { MODELO, criarCliente, ehLimiteDeUso, organizarLote } from '../api/_mistral.js'

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

/** Quantos anúncios por chamada. Lotes pequenos = respostas mais fiéis. */
const TAMANHO_DO_LOTE = 5

/** Pausa entre lotes, para respeitar o limite por minuto do free tier. */
const PAUSA_ENTRE_LOTES_MS = 1500

const dormir = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function log(mensagem) {
  console.log(`[gerar-vagas] ${mensagem}`)
}

async function gravar(conteudo) {
  await mkdir(dirname(DESTINO), { recursive: true })
  await writeFile(
    DESTINO,
    `${CABECALHO}export const VAGAS_GERADAS = ${JSON.stringify(conteudo, null, 2)}\n`,
    'utf8',
  )
}

/** Saída usada quando não há como gerar nada — o site cai para os exemplos. */
async function gravarVazio(motivo) {
  log(motivo)
  log('gravando arquivo vazio; o site vai usar as vagas de exemplo')
  await gravar({ geradoEm: null, fonte: 'exemplos', motivo, total: 0, vagas: [] })
}

/** Completa os campos que o modelo pode ter deixado em branco. */
function finalizar(vaga, bruta) {
  const { ehAprendiz, ...resto } = vaga

  return {
    ...resto,
    // Vazio quando o anúncio não diz onde é — ver `normalizarSemIa`.
    cidade: vaga.cidade,
    modalidade: vaga.modalidade || 'Presencial',
    jornada: vaga.jornada || 'A combinar',
    salario: vaga.salario || 'A combinar',
    escolaridade: vaga.escolaridade || 'Consulte o anúncio',
    idade: vaga.idade || '14 a 24 anos',
    publicadaEm: bruta.publicadaEm,
    url: bruta.url,
    exemplo: false,
  }
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

  // Sem a chave da Mistral o site ainda mostra vagas reais — só que com os
  // campos que dá para deduzir sem ler o anúncio (área por palavra-chave,
  // requisitos e benefícios vazios).
  if (!cliente) {
    log('MISTRAL_API_KEY não configurada — usando classificação por palavra-chave')
    const vagas = brutas.map(normalizarSemIa)
    await gravar({
      geradoEm: new Date().toISOString(),
      fonte: 'jooble',
      total: vagas.length,
      vagas,
    })
    log(`${vagas.length} vagas gravadas (sem organização por IA)`)
    return
  }

  log(`organizando ${brutas.length} anúncios com ${MODELO}...`)

  const lotes = []
  for (let i = 0; i < brutas.length; i += TAMANHO_DO_LOTE) {
    lotes.push(brutas.slice(i, i + TAMANHO_DO_LOTE))
  }

  const porId = new Map(brutas.map((bruta) => [bruta.id, bruta]))
  const organizadas = []
  let lotesComFalha = 0
  let ultimoErro = ''

  for (const [indice, lote] of lotes.entries()) {
    if (indice > 0) await dormir(PAUSA_ENTRE_LOTES_MS)

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
      const resultado = await organizarLote(cliente, entrada)

      for (const vaga of resultado) {
        // O modelo também é o filtro: estágio e CLT júnior chegam misturados na
        // busca por "jovem aprendiz" e são descartados aqui.
        if (!vaga.ehAprendiz) continue

        const bruta = porId.get(vaga.id)
        if (bruta) organizadas.push(finalizar(vaga, bruta))
      }

      log(`lote ${indice + 1}/${lotes.length} concluído`)
    } catch (erro) {
      lotesComFalha += 1
      ultimoErro = erro.message

      if (ehLimiteDeUso(erro)) {
        // Bater no limite do free tier no meio do build não deve custar as
        // vagas já organizadas: paramos aqui e ficamos com o que deu certo.
        log(`limite de uso da Mistral atingido no lote ${indice + 1} — parando por aqui`)
        break
      }

      // Um lote que falha não invalida os outros: caímos para a normalização
      // sem IA nesses anúncios em vez de perdê-los.
      log(
        `lote ${indice + 1}/${lotes.length} falhou (${erro.message}) — usando normalização simples`,
      )
      organizadas.push(...lote.map(normalizarSemIa))
    }
  }

  if (organizadas.length === 0) {
    await gravarVazio('Nenhum anúncio sobreviveu ao filtro de aprendizagem.')
    return
  }

  // Todos os lotes falharem significa que a organização por IA não aconteceu:
  // as vagas saíram da classificação por palavra-chave, sem requisitos nem
  // benefícios. Isso já passou despercebido em produção porque só aparecia no
  // log do build — gravar o motivo no arquivo deixa o problema visível para
  // quem olhar os dados, e a rota `/api/vagas` o repassa.
  const iaFalhouEmTudo = lotesComFalha === lotes.length

  if (iaFalhouEmTudo) {
    log(`ATENÇÃO: nenhum lote foi organizado pela IA (último erro: ${ultimoErro})`)
    log('as vagas vão para o site com área por palavra-chave e sem requisitos')
  }

  await gravar({
    geradoEm: new Date().toISOString(),
    fonte: iaFalhouEmTudo ? 'jooble' : 'jooble+ia',
    modelo: MODELO,
    ...(iaFalhouEmTudo && {
      motivo: `A organização por IA falhou em todos os lotes (${ultimoErro}). Confira MISTRAL_API_KEY e se o ID em MISTRAL_MODEL ainda existe.`,
    }),
    total: organizadas.length,
    descartadas: brutas.length - organizadas.length,
    vagas: organizadas,
  })

  log(`${organizadas.length} vagas gravadas (${brutas.length - organizadas.length} descartadas)`)
}

principal().catch(async (erro) => {
  // Rede de segurança: qualquer coisa inesperada vira arquivo vazio, nunca um
  // build quebrado.
  await gravarVazio(`Erro inesperado: ${erro.message}`)
})
