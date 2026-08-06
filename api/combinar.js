/**
 * Serverless Function (Vercel) — POST /api/combinar
 *
 * Cruza o perfil do usuário (resultado do teste vocacional + currículo) com as
 * vagas disponíveis e devolve as que mais combinam, com o motivo de cada uma.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Privacidade
 * ────────────────────────────────────────────────────────────────────────────
 * O currículo é dado pessoal. Três decisões de projeto por causa disso:
 *
 *   1. Só sai do navegador quando o usuário clica no botão — nunca sozinho.
 *   2. Nada é gravado: não há banco, não há log do corpo da requisição. O que
 *      chega é usado na chamada ao modelo e descartado quando a função morre.
 *   3. O front-end envia um recorte mínimo (`extrairPerfil` abaixo descarta o
 *      resto). Nome, e-mail, telefone e LinkedIn não são enviados — não
 *      ajudariam a recomendar e só aumentariam a exposição.
 *
 * A interface informa isso ao usuário antes do clique.
 */

import { criarCliente, ehLimiteDeUso, recomendarVagas } from './_mistral.js'
import { catalogoDeVagas } from './_catalogo.js'

/** Quantas vagas são oferecidas ao modelo como candidatas. */
const MAXIMO_DE_CANDIDATAS = 25

/** Corta strings longas antes de enviar ao modelo. */
function limitar(valor, tamanho) {
  return typeof valor === 'string' ? valor.slice(0, tamanho) : ''
}

/**
 * Recorta do corpo recebido apenas o que serve para recomendar.
 *
 * Isto é uma allowlist de propósito: qualquer campo que o front-end mande a
 * mais é silenciosamente descartado aqui, em vez de seguir para o modelo.
 */
function extrairPerfil(corpo) {
  const areas = Array.isArray(corpo?.areas)
    ? corpo.areas
        .slice(0, 6)
        .map((item) => ({
          area: limitar(item?.area, 40),
          percentual: Number.isFinite(item?.percentual) ? item.percentual : 0,
        }))
        .filter((item) => item.area)
    : []

  const curriculo = corpo?.curriculo ?? {}

  return {
    areasComMaiorAfinidade: areas,
    cargoDesejado: limitar(curriculo.cargo, 120),
    cidade: limitar(curriculo.cidade, 80),
    estado: limitar(curriculo.estado, 2),
    objetivo: limitar(curriculo.objetivo, 800),
    habilidades: Array.isArray(curriculo.habilidades)
      ? curriculo.habilidades.slice(0, 20).map((h) => limitar(h, 80))
      : [],
    cursosConcluidos: Array.isArray(curriculo.cursos)
      ? curriculo.cursos.slice(0, 15).map((c) => limitar(c, 120))
      : [],
    formacao: Array.isArray(curriculo.formacoes)
      ? curriculo.formacoes.slice(0, 5).map((f) => limitar(f, 160))
      : [],
    experiencia: Array.isArray(curriculo.experiencias)
      ? curriculo.experiencias.slice(0, 5).map((e) => limitar(e, 200))
      : [],
  }
}

/** Resume uma vaga para caber no contexto sem perder o que importa na decisão. */
function resumirVaga(vaga) {
  return {
    id: vaga.id,
    titulo: vaga.titulo,
    empresa: vaga.empresa,
    area: vaga.area,
    cidade: vaga.cidade,
    estado: vaga.estado,
    modalidade: vaga.modalidade,
    escolaridade: vaga.escolaridade,
    requisitos: (vaga.requisitos ?? []).slice(0, 6),
    atividades: (vaga.atividades ?? []).slice(0, 6),
    descricao: limitar(vaga.descricao, 400),
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  // Resultado depende do corpo enviado: nunca deve ser cacheado.
  res.setHeader('Cache-Control', 'no-store')

  const cliente = criarCliente()
  if (!cliente) {
    return res.status(503).json({
      erro: 'recurso_indisponivel',
      mensagem: 'A recomendação personalizada precisa da variável de ambiente MISTRAL_API_KEY.',
    })
  }

  const perfil = extrairPerfil(req.body ?? {})

  if (perfil.areasComMaiorAfinidade.length === 0) {
    return res.status(400).json({
      erro: 'perfil_incompleto',
      mensagem: 'Faça o teste vocacional antes de pedir recomendações.',
    })
  }

  // As mesmas vagas que a listagem mostra: recomendar de um catálogo e exibir
  // outro faria o usuário receber indicação de vaga que não está na página.
  const catalogo = catalogoDeVagas()

  // Prioriza as vagas das áreas de maior afinidade, mas mantém as demais na
  // lista — às vezes a vaga que mais combina não é da área "certa".
  const preferidas = new Set(perfil.areasComMaiorAfinidade.slice(0, 3).map((a) => a.area))
  const ordenadas = [...catalogo.vagas].sort((a, b) => {
    const pesoA = preferidas.has(a.area) ? 0 : 1
    const pesoB = preferidas.has(b.area) ? 0 : 1
    return pesoA - pesoB
  })

  const candidatas = ordenadas.slice(0, MAXIMO_DE_CANDIDATAS)

  try {
    const resultado = await recomendarVagas(cliente, perfil, candidatas.map(resumirVaga))

    // O modelo devolve ids; devolvemos a vaga inteira junto, para o front-end
    // não precisar cruzar as duas listas.
    const porId = new Map(candidatas.map((vaga) => [vaga.id, vaga]))
    const recomendacoes = (resultado.recomendacoes ?? [])
      .map((item) => ({ ...item, vaga: porId.get(item.vagaId) }))
      .filter((item) => item.vaga)

    // `fonte` viaja junto para a interface poder dizer se a análise olhou
    // anúncios reais ou as vagas de exemplo — a recomendação é tão real quanto
    // o catálogo que ela leu.
    return res.status(200).json({
      resumo: resultado.resumo,
      recomendacoes,
      fonte: catalogo.fonte,
      total: candidatas.length,
    })
  } catch (erro) {
    // Sem detalhes do corpo da requisição no log — ver nota de privacidade.
    console.error('[api/combinar] falha na recomendação:', erro.message)

    // O free tier da Mistral tem limite de requisições por minuto. Isso é
    // esperado numa apresentação com várias pessoas clicando ao mesmo tempo,
    // e merece uma mensagem que diz o que fazer em vez de "erro interno".
    if (ehLimiteDeUso(erro)) {
      return res.status(429).json({
        erro: 'limite_de_uso',
        mensagem:
          'Muitas análises ao mesmo tempo. Espere alguns segundos e tente de novo — o serviço de IA é gratuito e tem limite por minuto.',
      })
    }

    return res.status(502).json({
      erro: 'falha_na_recomendacao',
      mensagem: 'Não foi possível gerar as recomendações agora. Tente de novo em instantes.',
    })
  }
}
