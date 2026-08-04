/**
 * Monta o perfil do usuário a partir do que ele já preencheu no site.
 *
 * O ELEV não tem cadastro: o teste vocacional e o currículo ficam apenas no
 * `localStorage` do navegador. Este módulo lê essas duas fontes e monta o
 * recorte enviado para `/api/combinar`.
 *
 * O recorte é deliberadamente pequeno. Nome, e-mail, telefone e LinkedIn
 * ficam de fora: não ajudam a recomendar uma vaga e não há motivo para sair
 * do aparelho do usuário. O servidor ainda aplica o mesmo corte de novo, para
 * não depender do front-end (veja a allowlist em `api/combinar.js`).
 */

import { PERGUNTAS, calcularResultado } from '../data/vocacional.js'

function lerJson(chave) {
  try {
    const bruto = window.localStorage.getItem(chave)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

/** O usuário já respondeu o teste vocacional inteiro? */
export function temResultadoVocacional() {
  const respostas = lerJson('elev:vocacional')
  return Boolean(respostas) && Object.keys(respostas).length === PERGUNTAS.length
}

/** O usuário já preencheu algo no currículo? */
export function temCurriculo() {
  const curriculo = lerJson('elev:curriculo')
  return Boolean(curriculo?.dados?.nome?.trim() || curriculo?.objetivo?.trim())
}

/**
 * Monta o perfil para a recomendação.
 *
 * @returns {object|null} `null` se o teste vocacional ainda não foi concluído
 */
export function montarPerfil() {
  const respostas = lerJson('elev:vocacional')
  if (!respostas) return null

  const ranking = calcularResultado(respostas)
  if (ranking.length === 0) return null

  const curriculo = lerJson('elev:curriculo') ?? {}
  const dados = curriculo.dados ?? {}

  return {
    areas: ranking.map(({ area, percentual }) => ({ area, percentual })),
    curriculo: {
      cargo: dados.cargo ?? '',
      cidade: dados.cidade ?? '',
      estado: dados.estado ?? '',
      objetivo: curriculo.objetivo ?? '',
      habilidades: curriculo.habilidades ?? [],
      cursos: (curriculo.cursos ?? []).map((c) =>
        [c.nome, c.instituicao].filter(Boolean).join(' — '),
      ),
      formacoes: (curriculo.formacoes ?? []).map((f) =>
        [f.curso, f.instituicao, f.situacao].filter(Boolean).join(' — '),
      ),
      experiencias: (curriculo.experiencias ?? []).map((e) =>
        [e.cargo, e.empresa, e.descricao].filter(Boolean).join(' — '),
      ),
    },
  }
}
