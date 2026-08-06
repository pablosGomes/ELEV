/**
 * Confere a normalização dos dados de vaga vindos do Jooble.
 *
 *   node scripts/verificar-vagas.mjs   (ou: npm run verificar)
 *
 * Cobre as duas funções que já publicaram dado errado sem quebrar nada:
 *
 *   1. `classificarArea` — a busca era por substring, a sigla `'ti'` casava
 *      dentro de "atividades" e "administrativas", e 24 das 30 vagas no ar
 *      viraram "Tecnologia" (uma clínica de psicologia inclusive).
 *   2. `separarLocal` — o Jooble manda `location: "Brasil"` em boa parte dos
 *      anúncios, e o país era copiado para `cidade` como se fosse o município.
 *
 * As duas falharam em silêncio: nenhum erro, nenhum log, só a tela mentindo.
 * Sem framework de propósito — o projeto não tem suíte de testes, e um `assert`
 * que roda com `node` puro não cria uma convenção nova para manter.
 */

import assert from 'node:assert/strict'

import { classificarArea, separarLocal } from '../api/_fonte-vagas.js'

let falhas = 0

function conferir(rotulo, obtido, esperado) {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado)
  if (ok) {
    console.log(`ok    ${rotulo}`)
  } else {
    falhas += 1
    console.error(
      `ERRO  ${rotulo}\n      esperava ${JSON.stringify(esperado)}, veio ${JSON.stringify(obtido)}`,
    )
  }
}

/* ------------------------------------------------- Classificação por área */

/** [área esperada, título do anúncio, resumo do anúncio] */
const AREAS = [
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

for (const [esperado, titulo, resumo] of AREAS) {
  conferir(`área de "${titulo}"`, classificarArea(`${titulo} ${resumo}`), esperado)
}

/* ------------------------------------------------------- Separação do local */

const LOCAIS = [
  ['São Paulo, SP', { cidade: 'São Paulo', estado: 'SP' }],
  ['Londrina, PR', { cidade: 'Londrina', estado: 'PR' }],

  // O país não é cidade. Este é o caso que o Jooble mais manda.
  ['Brasil', { cidade: '', estado: '' }],
  ['Brazil', { cidade: '', estado: '' }],

  // Uma cidade de verdade seguida do país continua valendo.
  ['Recife, Brasil', { cidade: 'Recife', estado: '' }],

  ['', { cidade: '', estado: '' }],
]

for (const [entrada, esperado] of LOCAIS) {
  conferir(`local ${JSON.stringify(entrada)}`, separarLocal(entrada), esperado)
}

/* ------------------------------------------------------------------ Resumo */

assert.equal(falhas, 0, `${falhas} verificação(ões) falharam`)
console.log(`\n${AREAS.length + LOCAIS.length} verificações, todas de acordo.`)
