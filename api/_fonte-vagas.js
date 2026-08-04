/**
 * Origem das vagas — busca e normalização.
 *
 * Compartilhado entre a rota `/api/vagas` e o script de build
 * `scripts/gerar-vagas.mjs`. Arquivos com `_` no início não viram rota
 * na Vercel.
 *
 * Aqui não há IA: é só buscar o anúncio bruto e arrumar o formato. O
 * enriquecimento com Claude acontece em `_ia.js`.
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
    'redes',
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
  comunicacao: ['marketing', 'design', 'comunicacao', 'social media', 'publicidade', 'conteudo'],
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
 * Classificação por palavra-chave.
 *
 * É o plano B: acerta o óbvio e erra o resto, porque olha só o título. Quando
 * a chave da Anthropic está configurada, quem classifica é o Claude lendo o
 * anúncio inteiro (veja `_ia.js`).
 */
export function classificarArea(texto = '') {
  const alvo = String(texto).toLowerCase().normalize('NFD').replace(MARCAS_DE_ACENTO, '')

  for (const [area, palavras] of Object.entries(PALAVRAS_POR_AREA)) {
    if (palavras.some((palavra) => alvo.includes(palavra))) return area
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
