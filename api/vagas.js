/**
 * Serverless Function (Vercel) — GET /api/vagas
 *
 * Esta rota não busca nem processa nada: ela só entrega o que já foi
 * preparado. O trabalho pesado (buscar no Jooble e organizar cada anúncio com
 * a Mistral) acontece uma vez por deploy, em `scripts/gerar-vagas.mjs`.
 *
 * Isso deixa a resposta instantânea, o consumo de cota por deploy em vez de
 * por visitante, e as chaves fora do caminho de qualquer requisição.
 *
 * Sem as chaves configuradas, o arquivo gerado sai vazio e caímos nas vagas de
 * exemplo — a interface avisa o usuário e aponta para os portais oficiais.
 */

import { catalogoDeVagas } from './_catalogo.js'

const CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  res.setHeader('Cache-Control', CACHE)

  const catalogo = catalogoDeVagas()

  return res.status(200).json({ ...catalogo, total: catalogo.vagas.length })
}
