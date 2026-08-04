/**
 * Serverless Function (Vercel) — GET /api/vagas
 *
 * Serve o catálogo de vagas de Jovem Aprendiz a partir de `src/data/vagas.js`.
 *
 * Sobre a origem dos dados: são vagas de exemplo, montadas a partir de perfis
 * reais de programas de aprendizagem, e cada uma carrega `exemplo: true`. A
 * interface avisa o usuário disso e aponta para os portais oficiais, onde as
 * vagas de verdade são publicadas. É menos vistoso do que fingir uma busca ao
 * vivo, e é a única forma honesta de fazer isso sem uma fonte real.
 *
 * O front-end consome via HTTP justamente para que trocar essa origem — por um
 * CMS, uma planilha ou uma API de vagas — não exija mudar nenhuma tela.
 */

import { VAGAS_EXEMPLO } from '../src/data/vagas.js'

const CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  res.setHeader('Cache-Control', CACHE)

  return res.status(200).json({
    fonte: 'exemplos',
    total: VAGAS_EXEMPLO.length,
    vagas: VAGAS_EXEMPLO,
  })
}
