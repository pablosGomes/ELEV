/**
 * Qual catálogo de vagas está valendo agora.
 *
 * Arquivos com `_` no início não viram rota na Vercel: isto é código
 * compartilhado por `/api/vagas` (que lista) e `/api/combinar` (que recomenda).
 *
 * Existe porque as duas rotas precisam da MESMA resposta para "as vagas de
 * verdade foram geradas no último build, ou estamos nos exemplos?". Quando cada
 * uma decidia por conta própria, elas divergiram: a listagem passou a mostrar
 * vagas reais do Jooble enquanto a recomendação continuava avaliando só os
 * exemplos estáticos — o usuário via uma lista e recebia indicação de outra.
 *
 * Só é importado pelas Serverless Functions. O navegador recebe as vagas pela
 * resposta de `/api/vagas`, então o catálogo gerado nunca entra no bundle.
 */

import { VAGAS_GERADAS } from '../src/data/vagas-geradas.js'
import { VAGAS_EXEMPLO } from '../src/data/vagas.js'

/**
 * @returns {{vagas: Array, fonte: string, motivo?: string, geradoEm?: string, modelo?: string}}
 *   `fonte` é `'exemplos'` quando o build não produziu vagas reais — quem
 *   consome usa isso para avisar o usuário em vez de fingir que são anúncios
 *   ativos.
 */
export function catalogoDeVagas() {
  const geradas = Array.isArray(VAGAS_GERADAS?.vagas) ? VAGAS_GERADAS.vagas : []

  if (geradas.length === 0) {
    return {
      vagas: VAGAS_EXEMPLO,
      fonte: 'exemplos',
      motivo: VAGAS_GERADAS?.motivo ?? 'Nenhuma vaga foi gerada no último build.',
    }
  }

  return {
    vagas: geradas,
    fonte: VAGAS_GERADAS.fonte,
    geradoEm: VAGAS_GERADAS.geradoEm ?? null,
    modelo: VAGAS_GERADAS.modelo ?? null,
    // Presente quando há vagas reais mas a organização por IA falhou: os
    // anúncios vieram sem requisitos e com área por palavra-chave.
    ...(VAGAS_GERADAS.motivo && { motivo: VAGAS_GERADAS.motivo }),
  }
}
