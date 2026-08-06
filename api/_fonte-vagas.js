/**
 * Origem das vagas — busca e normalização.
 *
 * Compartilhado entre a rota `/api/vagas` e o script de build
 * `scripts/gerar-vagas.mjs`. Arquivos com `_` no início não viram rota
 * na Vercel.
 *
 * Aqui não há IA: é só buscar o anúncio bruto e arrumar o formato. A
 * organização por IA acontece em `_mistral.js`.
 */

const MARCAS_DE_ACENTO = /[\u0300-\u036f]/g

/** Palavras-chave para classificar uma vaga quando a IA não está disponível. */
const PALAVRAS_POR_AREA = {
  tecnologia: [
    'ti',
    'tecnologia',
    'suporte',
    'sistemas',
    'dados',
    'software',
    'desenvolvedor',
    'help desk',
    // "redes" sozinho puxaria "redes sociais", que é comunicação.
    'redes de computadores',
  ],
  saude: ['saude', 'clinica', 'enfermagem', 'farmacia', 'hospital', 'odonto'],
  negocios: [
    'administrativo',
    'administracao',
    'financeiro',
    'vendas',
    'comercial',
    'rh',
    'recursos humanos',
    'atendimento',
    'escritorio',
  ],
  comunicacao: [
    'marketing',
    'design',
    'comunicacao',
    'social media',
    'redes sociais',
    'publicidade',
    'conteudo',
  ],
  educacao: ['educacao', 'pedagogico', 'escola', 'professor', 'monitor', 'creche'],
  industria: [
    'logistica',
    'producao',
    'manutencao',
    'industrial',
    'estoque',
    'almoxarifado',
    'mecanica',
    'eletric',
  ],
}

/** Remove tags HTML que a API externa costuma devolver dentro do resumo. */
export function limparTexto(html = '') {
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Separa "Cidade, Estado" no formato que o front-end usa nos filtros. */
export function separarLocal(local = '') {
  const partes = String(local)
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

  const cidade = partes[0] || ''
  const possivelEstado = partes[partes.length - 1] || ''
  const estado = /^[A-Za-z]{2}$/.test(possivelEstado) ? possivelEstado.toUpperCase() : ''

  return { cidade, estado }
}

/**
 * Monta o teste de uma palavra-chave.
 *
 * Buscar a palavra com `includes()` parece inofensivo até a lista ter uma sigla
 * curta: `'ti'` (de TI) casa dentro de "a**ti**vidades", "adminis**ti**rativas"
 * e "marke**ti**ng`", que aparecem em quase todo anúncio — o resultado foi 24 de
 * 30 vagas classificadas como Tecnologia em produção, inclusive uma clínica de
 * psicologia.
 *
 * Daí a regra: sigla de até 2 letras só vale como palavra inteira (`\bti\b`);
 * as demais casam do início da palavra para a frente (`\beletric` pega
 * "eletricista" e "eletrica", `\bodonto` pega "odontologia").
 */
function testeDaPalavra(palavra) {
  const limite = palavra.length <= 2 ? `\\b${palavra}\\b` : `\\b${palavra}`
  return new RegExp(limite)
}

// Compilado uma vez: `classificarArea` roda por anúncio, dentro de um laço.
const TESTES_POR_AREA = Object.entries(PALAVRAS_POR_AREA).map(([area, palavras]) => [
  area,
  palavras.map(testeDaPalavra),
])

/**
 * Classificação por palavra-chave.
 *
 * É o plano B: acerta o óbvio e erra o resto, porque olha só título e resumo.
 * Quando a chave da Mistral está configurada, quem classifica é o modelo lendo
 * o anúncio inteiro (veja `_mistral.js`).
 */
export function classificarArea(texto = '') {
  const alvo = String(texto).toLowerCase().normalize('NFD').replace(MARCAS_DE_ACENTO, '')

  for (const [area, testes] of TESTES_POR_AREA) {
    if (testes.some((teste) => teste.test(alvo))) return area
  }
  return 'negocios'
}

/**
 * Consulta a API do Jooble e devolve os anúncios já limpos de HTML.
 *
 * @param {string} chave valor de JOOBLE_API_KEY
 * @param {{limite?: number}} opcoes
 * @returns {Promise<Array<{id, titulo, empresa, cidade, estado, jornada, salario, texto, url, publicadaEm}>>}
 */
export async function buscarNoJooble(chave, { limite = 40 } = {}) {
  const controlador = new AbortController()
  const tempoLimite = setTimeout(() => controlador.abort(), 15000)

  try {
    const resposta = await fetch(`https://br.jooble.org/api/${chave}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: 'jovem aprendiz', location: 'Brasil', page: '1' }),
      signal: controlador.signal,
    })

    if (!resposta.ok) throw new Error(`Jooble respondeu ${resposta.status}`)

    const dados = await resposta.json()
    const brutas = Array.isArray(dados.jobs) ? dados.jobs : []

    return brutas.slice(0, limite).map((vaga, indice) => {
      const { cidade, estado } = separarLocal(vaga.location)

      return {
        id: vaga.id ? `jb-${vaga.id}` : `jb-${indice}`,
        titulo: limparTexto(vaga.title),
        empresa: limparTexto(vaga.company) || limparTexto(vaga.source),
        cidade,
        estado,
        jornada: limparTexto(vaga.type),
        salario: limparTexto(vaga.salary),
        texto: limparTexto(vaga.snippet),
        url: vaga.link,
        publicadaEm: vaga.updated ? String(vaga.updated).slice(0, 10) : null,
      }
    })
  } finally {
    clearTimeout(tempoLimite)
  }
}

/** Converte um anúncio cru no formato do site, sem IA. */
export function normalizarSemIa(bruta) {
  return {
    id: bruta.id,
    titulo: bruta.titulo || 'Vaga de Jovem Aprendiz',
    empresa: bruta.empresa || 'Empresa não informada',
    area: classificarArea(`${bruta.titulo} ${bruta.texto}`),
    cidade: bruta.cidade || 'Não informado',
    estado: bruta.estado,
    modalidade: /remoto|home office/i.test(`${bruta.titulo} ${bruta.texto}`)
      ? 'Remoto'
      : 'Presencial',
    jornada: bruta.jornada || 'A combinar',
    salario: bruta.salario || 'A combinar',
    escolaridade: 'Consulte o anúncio',
    idade: '14 a 24 anos',
    publicadaEm: bruta.publicadaEm,
    descricao: bruta.texto,
    beneficios: [],
    requisitos: [],
    atividades: [],
    exemplo: false,
    url: bruta.url,
  }
}
