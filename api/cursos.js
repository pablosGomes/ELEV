/**
 * Serverless Function (Vercel) — GET /api/cursos
 *
 * Serve o catálogo de cursos gratuitos. Hoje a fonte é o arquivo
 * `src/data/cursos.js`; como o front-end consome via HTTP, a origem pode ser
 * trocada por um CMS, planilha ou banco de dados sem alterar nenhuma tela.
 *
 * Filtros aceitos por query string:
 *   ?area=tecnologia     filtra por área
 *   ?q=excel             busca em título, descrição, provedor e tags
 */

import { CURSOS } from '../src/data/cursos.js'

const CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400'

/** Normaliza texto para busca: minúsculas e sem acento. */
function normalizar(texto = '') {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  const { area, q } = req.query ?? {}
  let cursos = CURSOS

  if (area) {
    cursos = cursos.filter((curso) => curso.area === area)
  }

  if (q) {
    const termo = normalizar(String(q))
    cursos = cursos.filter((curso) =>
      normalizar(
        `${curso.titulo} ${curso.descricao} ${curso.provedor} ${curso.tags.join(' ')}`,
      ).includes(termo),
    )
  }

  res.setHeader('Cache-Control', CACHE)
  return res.status(200).json({ fonte: 'catalogo', total: cursos.length, cursos })
}
