/**
 * Confere a classificação de área por palavra-chave.
 *
 *   node scripts/verificar-classificacao.mjs   (ou: npm run verificar)
 *
 * Existe porque este classificador já errou em produção de um jeito silencioso:
 * a busca era por substring, a sigla `'ti'` casava dentro de "atividades" e
 * "administrativas", e 24 das 30 vagas publicadas viraram "Tecnologia" — uma
 * clínica de psicologia inclusive. Nada quebrou, nenhum log apareceu; só o
 * filtro por área da página de vagas passou a mentir.
 *
 * Sem framework de propósito: o projeto não tem suíte de testes, e um `assert`
 * que roda com `node` puro não cria uma convenção nova para manter.
 */

import assert from 'node:assert/strict'

import { classificarArea } from '../api/_fonte-vagas.js'

/** [área esperada, título do anúncio, resumo do anúncio] */
const CASOS = [
  ['negocios', 'Jovem Aprendiz Administrativo', 'atividades administrativas de escritorio'],
  ['industria', 'Aprendiz Auxiliar de Producao', 'apoio na linha de producao industrial'],
  ['saude', 'Jovem Aprendiz Recepcao Clinica', 'atendimento a pacientes na clinica'],
  ['comunicacao', 'Aprendiz de Marketing', 'apoio nas redes sociais e criacao de conteudo'],
  ['tecnologia', 'Jovem Aprendiz de TI', 'suporte ao usuario e manutencao de sistemas'],
  ['educacao', 'Aprendiz Auxiliar de Escola', 'apoio pedagogico em sala de aula'],

  // A armadilha original: nada aqui é de tecnologia, mas "atividades" e
  // "administrativas" contêm as letras "ti". Se este caso voltar a devolver
  // "tecnologia", a busca virou substring de novo.
  [
    'negocios',
    'Jovem Aprendiz - Operacional',
    'atividades administrativas e operacionais da filial',
  ],
]

let falhas = 0

for (const [esperado, titulo, resumo] of CASOS) {
  const obtido = classificarArea(`${titulo} ${resumo}`)

  if (obtido === esperado) {
    console.log(`ok    ${esperado.padEnd(12)} ${titulo}`)
  } else {
    falhas += 1
    console.error(`ERRO  esperava ${esperado}, veio ${obtido} — ${titulo}`)
  }
}

assert.equal(falhas, 0, `${falhas} anúncio(s) classificado(s) na área errada`)
console.log(`\n${CASOS.length} casos, todos na área esperada.`)
