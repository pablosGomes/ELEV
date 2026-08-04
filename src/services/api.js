/**
 * Camada de acesso a dados do ELEV.
 *
 * Todo o site consome dados por aqui — nenhuma tela chama `fetch` direto.
 * Isso concentra em um só lugar a decisão de "veio da API ou do fallback?".
 *
 * Estratégia: tenta a Serverless Function da Vercel (`/api/...`). Se ela não
 * existir (rodando `npm run dev`, que não executa as functions), demorar ou
 * falhar, cai para os dados locais. O objeto devolvido sempre informa a
 * `fonte`, e a interface usa isso para avisar o usuário com honestidade.
 */

import { CURSOS } from '../data/cursos.js'
import { VAGAS_EXEMPLO } from '../data/vagas.js'

const TEMPO_LIMITE = 8000

/** `fetch` com timeout — evita que a tela fique carregando para sempre. */
async function buscarComLimite(url) {
  const controlador = new AbortController()
  const limite = setTimeout(() => controlador.abort(), TEMPO_LIMITE)

  try {
    const resposta = await fetch(url, {
      signal: controlador.signal,
      headers: { Accept: 'application/json' },
    })

    if (!resposta.ok) throw new Error(`A rota ${url} respondeu ${resposta.status}`)

    // Em `npm run dev` a rota /api não existe e o Vite devolve o index.html.
    // Sem esta checagem, o `.json()` estouraria com um erro confuso.
    const tipo = resposta.headers.get('content-type') ?? ''
    if (!tipo.includes('application/json')) {
      throw new Error(`A rota ${url} não devolveu JSON`)
    }

    return await resposta.json()
  } finally {
    clearTimeout(limite)
  }
}

/**
 * Busca as vagas de Jovem Aprendiz.
 * @returns {Promise<{vagas: Array, fonte: string, motivo?: string}>}
 */
export async function buscarVagas() {
  try {
    const dados = await buscarComLimite('/api/vagas')

    return {
      vagas: Array.isArray(dados.vagas) ? dados.vagas : VAGAS_EXEMPLO,
      fonte: dados.fonte ?? 'exemplos',
      motivo: dados.motivo,
      geradoEm: dados.geradoEm,
      modelo: dados.modelo,
    }
  } catch (erro) {
    return {
      vagas: VAGAS_EXEMPLO,
      fonte: 'exemplos',
      motivo: `Não foi possível consultar a API de vagas (${erro.message}).`,
    }
  }
}

/**
 * Busca o catálogo de cursos gratuitos.
 * @returns {Promise<{cursos: Array, fonte: string, motivo?: string}>}
 */
export async function buscarCursos() {
  try {
    const dados = await buscarComLimite('/api/cursos')

    return {
      cursos: Array.isArray(dados.cursos) && dados.cursos.length ? dados.cursos : CURSOS,
      fonte: dados.fonte ?? 'catalogo',
    }
  } catch {
    return { cursos: CURSOS, fonte: 'local' }
  }
}

/**
 * Pede as vagas que mais combinam com o perfil do usuário.
 *
 * Diferente das outras funções deste arquivo, esta não tem plano B: sem a
 * API não há recomendação, e é mais honesto dizer isso do que devolver uma
 * lista qualquer fingindo ser personalizada.
 *
 * @param {object} perfil resultado de `montarPerfil()`
 * @returns {Promise<{resumo: string, recomendacoes: Array}>}
 * @throws {Error} com `codigo` quando a API responde um erro conhecido
 */
export async function combinarVagas(perfil) {
  const controlador = new AbortController()
  // A recomendação envolve uma chamada ao modelo — mais lenta que uma
  // leitura de catálogo, por isso o limite maior.
  const limite = setTimeout(() => controlador.abort(), 45000)

  try {
    const resposta = await fetch('/api/combinar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(perfil),
      signal: controlador.signal,
    })

    const tipo = resposta.headers.get('content-type') ?? ''
    if (!tipo.includes('application/json')) {
      // Em `npm run dev` a rota /api não existe e o Vite devolve o index.html.
      const erro = new Error(
        'A recomendação personalizada só funciona no site publicado (ou com "npx vercel dev").',
      )
      erro.codigo = 'rota_indisponivel'
      throw erro
    }

    const dados = await resposta.json()

    if (!resposta.ok) {
      const erro = new Error(dados.mensagem ?? 'Não foi possível gerar as recomendações.')
      erro.codigo = dados.erro ?? 'erro_desconhecido'
      throw erro
    }

    return dados
  } finally {
    clearTimeout(limite)
  }
}
